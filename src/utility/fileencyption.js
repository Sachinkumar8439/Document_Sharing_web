import { zipSync, strToU8 } from "fflate";
import CryptoJS from "crypto-js";

export async function encryptFileWithPassword(file, password) {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

  // AES Encrypt binary data
  const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();

  // Convert encrypted string to Uint8Array
  const encryptedBytes = strToU8(encrypted);

  // Make ZIP with encrypted content
  const zipped = zipSync({ [file.name]: encryptedBytes });

  const blob = new Blob([zipped], { type: "application/zip" });
  const encryptedFile = new File([blob], `${file.name}.zip`, {
    type: "application/zip",
    lastModified: Date.now(),
  });

  return encryptedFile;
}
// fileCryptoWithMeta.js
const MAGIC_STRING = "ENC1";
const MAGIC = new TextEncoder().encode(MAGIC_STRING);

function randBytes(len) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}
function concat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}
function uint32ToBE(n) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, n, false);
  return new Uint8Array(buf);
}
function readUint32BE(u8, offset) {
  return new DataView(u8.buffer, u8.byteOffset + offset, 4).getUint32(0, false);
}

async function deriveKeyFromPassword(password, salt, iterations = 150000) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * encryptFile(file: File, password: string) => Promise<{ encryptedFile: File, metadata: object }>
 * - returns a File object for the encrypted container (so it has .name and .lastModified)
 * - metadata contains original file properties (save this alongside the encrypted file on backend)
 */
export async function encryptFile(file, password, opts = {}) {
  if (!(file instanceof Blob)) throw new Error("file must be a Blob/File");
  if (!password || typeof password !== "string") throw new Error("password required");

  // read original bytes
  const fileBuf = await file.arrayBuffer();

  // crypto pieces
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKeyFromPassword(password, salt);

  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, fileBuf);

  // header includes original metadata (so decrypt can restore)
  const headerObj = {
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    lastModified: file.lastModified || Date.now(),
    webkitRelativePath: file.webkitRelativePath || "",
    createdAt: new Date().toISOString(),
    custom: opts.custom || null
  };
  const headerBytes = new TextEncoder().encode(JSON.stringify(headerObj));
  const headerLen = uint32ToBE(headerBytes.length);

  const container = concat(
    MAGIC,
    headerLen,
    headerBytes,
    salt,
    iv,
    new Uint8Array(cipherBuf)
  );

  // Build a File for the encrypted container so it keeps .name and .lastModified properties
  // Encrypted file name: originalName + ".enc" (you can change)
  const encFileName = (opts.encryptedName) ? opts.encryptedName
    : (file.name.endsWith(".enc") ? file.name : file.name + ".enc");

  // Use File constructor to set name and lastModified
  const encryptedFile = new File([container], encFileName, {
    type: "application/octet-stream",
    lastModified: file.lastModified || Date.now()
  });

  // metadata to store on backend (useful because some properties like webkitRelativePath cannot be set on File)
  const metadata = {
    originalName: headerObj.name,
    originalType: headerObj.type,
    originalSize: headerObj.size,
    originalLastModified: headerObj.lastModified,
    webkitRelativePath: headerObj.webkitRelativePath,
    encryptedName: encryptedFile.name,
    encryptedSize: encryptedFile.size,
    encryptedType: encryptedFile.type,
    encryptedCreatedAt: headerObj.createdAt,
    custom: headerObj.custom
  };

  return { encryptedFile, metadata };
}

/**
 * decryptFile(encryptedBlob: Blob|File, password: string)
 * => Promise<{ file: File, filename: string, metadata: object }>
 * Returns a File constructed from decrypted bytes with original MIME/type and lastModified.
 */
export async function decryptFile(encryptedBlob, password) {
  if (!(encryptedBlob instanceof Blob)) throw new Error("encryptedBlob must be a Blob");
  if (!password || typeof password !== "string") throw new Error("password required");

  const u8 = new Uint8Array(await encryptedBlob.arrayBuffer());

  if (u8.length < 4) throw new Error("File too small / not in expected format");
  const magic = new TextDecoder().decode(u8.subarray(0, 4));
  if (magic !== MAGIC_STRING) throw new Error("Unrecognized encrypted file format (bad magic)");

  const headerLen = readUint32BE(u8, 4);
  const headerStart = 8;
  const headerEnd = headerStart + headerLen;

  if (u8.length < headerEnd + 16 + 12) throw new Error("File truncated or corrupted");

  const headerBytes = u8.subarray(headerStart, headerEnd);
  let header;
  try {
    header = JSON.parse(new TextDecoder().decode(headerBytes));
  } catch (e) {
    throw new Error("Invalid header JSON");
  }

  const salt = u8.subarray(headerEnd, headerEnd + 16);
  const iv = u8.subarray(headerEnd + 16, headerEnd + 16 + 12);
  const ciphertext = u8.subarray(headerEnd + 16 + 12);

  const key = await deriveKeyFromPassword(password, salt);

  try {
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

    // Create File with original metadata
    const originalType = header.type || "application/octet-stream";
    const originalName = header.name || "decrypted.bin";
    const originalLastModified = header.lastModified || Date.now();

    const originalFile = new File([plainBuf], originalName, {
      type: originalType,
      lastModified: originalLastModified
    });

    // Return file + header metadata (so caller can use webkitRelativePath etc.)
    return { file: originalFile, filename: originalName, metadata: header };
  } catch (e) {
    throw new Error("Decryption failed: wrong password or file corrupted");
  }
}


