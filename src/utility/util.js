import {
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFileCode,
  FaFileVideo,
  FaFileArchive,
  FaFile,
} from "react-icons/fa";
import bcrypt from "bcryptjs";
import JSZip from "jszip";
export const runhtml= async(url,doc)=>{
     if(!url)return {success:false,message:"url missing"}
      try {
      fetch(url)
        .then(res => res.text())
        .then(html => {
         const titleTag = `<title>${doc.name}</title>`;
          const hasTitle = /<title>.*<\/title>/i.test(html);
          
          let modifiedHtml;
          if (hasTitle) {
            modifiedHtml = html.replace(/<title>.*<\/title>/i, titleTag);
          } else if (/<head>/i.test(html)) {
            modifiedHtml = html.replace(/<head>/i, `<head>\n  ${titleTag}`);
          } else {
            modifiedHtml = `<!DOCTYPE html><html><head>${titleTag}</head><body>${html}</body></html>`;
          }
          const blob = new Blob([modifiedHtml], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          return {success:true,message:"html running ..."};
        });
    } catch (err) {
      console.error("Error rendering HTML:", err);
      return {success:false,message:err.message}
    }
}

 export const getFileIcon = (fileName, fileType) => {
  const ext = fileName?.split(".").pop().toLowerCase();

  if (fileType.includes("pdf") || ext === "pdf") return <FaFilePdf color="red" />;
  if (fileType.includes("image") || ["jpg", "jpeg", "png", "gif"].includes(ext))
    return <FaFileImage color="green" />;
  if (["doc", "docx"].includes(ext)) return <FaFileWord color="blue" />;
  if (["xls", "xlsx"].includes(ext)) return <FaFileExcel color="green" />;
  if (["zip", "rar"].includes(ext)) return <FaFileArchive color="orange" />;
  if (["mp4", "mkv", "avi"].includes(ext)) return <FaFileVideo color="purple" />;
  if (["js", "html", "css", "java", "cpp", "py"].includes(ext))
    return <FaFileCode color="teal" />;
  if (["txt", "md"].includes(ext)) return <FaFileAlt color="gray" />;

  return <FaFile color="black" />;
};


export const checkfile = async(files ,data)=>{
     if(files.length <=0){
      return true;
     }
     return !files.some((f) => f.name === data.files[0].name);
}

export const setTheme = (theme) => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  };
export const setFont = (font) => {
    // document.documentElement.className = theme;
    localStorage.setItem('font', font);
  };

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const isOnlyPhoneNumbers = (str) => /^[+-]?\d+$/.test(str);
export const isOnlyNumbers = (str) => /^\d+$/.test(str);


export async function createSmartZip(files, fileName = "archive.zip") {
  if (!files || files.length === 0) {
    throw new Error("No files selected!");
  }

  const fileArray = Array.from(files);

  if (fileArray.length === 1 && !fileArray[0].webkitRelativePath) {
    return fileArray[0];
  }

  const zip = new JSZip();

  for (const file of fileArray) {
    const data = await file.arrayBuffer();
    const path = file.webkitRelativePath || file.name; 
    zip.file(path, data, {
      date: file.lastModified ? new Date(file.lastModified) : new Date(),
      comment: `Original Type: ${file.type}`,
    });
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  let finalName = fileName.endsWith(".zip") ? fileName : `${fileName}.zip`;
  if (!fileName || fileName === "archive.zip") {
    finalName = fileArray[0].webkitRelativePath
      ? `${fileArray[0].webkitRelativePath.split("/")[0] || "folder"}.zip`
      : "files.zip";
  }

  return new File([zipBlob], finalName, {
    type: "application/zip",
    lastModified: Date.now(),
  });
}


export function openFilePicker(userId,image) {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png"; 
    input.style.display = "none";

    input.onchange = (event) => {
      const file = event.target.files?.[0];

      if (file) {
        const extension = file.name.split(".").pop();
        const newFileName = `profile_${userId}.${extension}`;

        const renamedFile = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });

        resolve(renamedFile);
      } else {
        reject(new Error("No file selected"));
      }
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      reject(new Error("File selection cancelled"));
      document.body.removeChild(input);
    };

    document.body.appendChild(input);

    input.click();
  });
}
