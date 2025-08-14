import { Account ,Storage, ID, Databases, Query, Permission, Role } from "appwrite";
import bcrypt from 'bcryptjs';
import { client,appwriteAuth } from "../Auth/appwriteauth";

 const account = new Account(client);

const storage = new Storage(client);
const databases = new Databases(client);
const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;
const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_ID;
const historyId = process.env.REACT_APP_APPWRITE_HISTORY_COLLECTION_ID;
let userId = null;
try {
  
  const user =  await account.get();
  userId=user.$id
  
} catch (error) {
  
}
export const setuserId = async (userid)=>{
  userId = userid
}


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const initStorageSystem = async () => {
  try {
    await storage.getBucket(bucketId);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to initialize storage system" };
  }
};

export const uploadFileForUser = async (file, permissionSettings = {},setline) => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId)),
      ...(permissionSettings.allowedUsers?.map(u => Permission.read(Role.user(u))) || [])
    ];
    if (permissionSettings.isPublic) {
  permissions.push(Permission.read(Role.any()));
     }

    const fileResponse = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      permissions,
      (uploadProgress) => {
      const percent = parseFloat(uploadProgress.progress.toFixed(2));
      const adjusted = (percent / 100) * 100;
      setline(adjusted.toFixed(0));
      }
    );

    const passwordHash = permissionSettings.password 
      ? await hashPassword(permissionSettings.password) 
      : null;

    const newDoc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        userId,
        fileId: fileResponse.$id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isPublic: permissionSettings.isPublic || false,
        allowedUsers: permissionSettings.allowedUsers || [],
        passwordHash,
        shareableLink: `${window.location.origin}/share/${fileResponse.$id}`,
        uploadedAt: new Date().toISOString(),
      }
    );

    return {
      success: true,
      fileId: fileResponse.$id,
      newfile: { ...newDoc, name: newDoc.fileName, id: fileResponse.$id },
      shareableLink: `${window.location.origin}/share/${fileResponse.$id}`,
      message:"Document uploaded successfully!",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const verifyDocumentAccess = async (fileId, password = null) => {
  try {
    const docs = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal("fileId", fileId)]
    );
    const doc = docs.documents[0];

    if (!doc) throw new Error("Document not found");

    if (doc.userId === userId) return { hasAccess: true, doc };

    if (doc.isPublic) return { hasAccess: true, doc };

    if (userId && doc.allowedUsers.includes(userId)) return { hasAccess: true, doc };

    if (doc.passwordHash) {
      if (!password) return { hasAccess: false, doc, reason: 'needsPassword' };
      const isValid = await verifyPassword(password, doc.passwordHash);
      return isValid ? { hasAccess: true, doc } : { hasAccess: false, doc, reason: 'invalidPassword' };
    }

    return { hasAccess: false, doc, reason: 'unauthorized' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFileDownload = async (fileId, password = null) => {
  try {
    const url = storage.getFileDownload(bucketId, fileId);
      return { success: true, message:"succesfully fetched download url!" ,url};
    
  } catch (error) {
    return {success:false,message:error.message}
  }
  
};

export const getFilePreview = async (fileId, password = null) => {
 
  try {
    const url = storage.getFileView(bucketId, fileId);
    return { success: true, message:"File preview access!",url };
    
  } catch (error) {
    return {success:false,message:error.message}
  }
};

export const updateDocumentPermissions = async (fileId, updates) => {
  try {
    if (!userId) throw new Error("User not authenticated");
    const { hasAccess, doc } = await verifyDocumentAccess(fileId);

    if (!hasAccess || doc.userId !== userId) {
      throw new Error("You don't have permission to modify this document");
    }

    const updatedDoc = await databases.updateDocument(
      databaseId,
      collectionId,
      doc.$id,
      {
        isPublic: updates.isPublic ?? doc.isPublic,
        allowedUsers: updates.allowedUsers || doc.allowedUsers,
        passwordHash: updates.password ? await hashPassword(updates.password) : doc.passwordHash
      }
    );

    return { success: true, document: updatedDoc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const listFilesForUser = async () => {
  try {
    if (!userId) throw new Error("User not authenticated");
    const metadataResponse = await databases.listDocuments(
      databaseId,
      collectionId,
      [ Query.equal("userId", userId),
        Query.orderDesc('$createdAt')
      ],
      
    );

    const files = await Promise.all(metadataResponse.documents.map(async (doc) => {
      return {
        id: doc.fileId,
        name: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        isPublic: doc.isPublic,
        shareableLink: doc.shareableLink,
        uploadedAt: doc.uploadedAt,
        previewUrl: storage.getFilePreview(bucketId, doc.fileId).href,
        downloadUrl: storage.getFileDownload(bucketId, doc.fileId).href
      };
    }));
    

    return { success: true,files,message:"Data Loaded Successfully!"}
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteFileForUser = async (fileId) => {
  try {
    const docs = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal("fileId", fileId), Query.equal("userId", userId)]
    );
    const doc = docs.documents[0];

    if (!doc) throw new Error("File not found or access denied");

    await storage.deleteFile(bucketId, fileId);
    await databases.deleteDocument(databaseId, collectionId, doc.$id);
    return { success: true, message:"Docuement deleted Successfully!",doc };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getDocumentDetails = async (fileId) => {
  try {
    const docs = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal("fileId", fileId)]
    );
    const doc = docs.documents[0];
    return { success: true, document: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const formatHistoryData = async (doc) => {
  return {
    id: doc.$id,
    fileId: doc.fileId,
    name: doc.documentname,
    fileType: doc.type,
    action: doc.action,
    fileSize: doc.size,
    timestamp: doc.time
  };
};

export const gethistory = async () => {
  try {
    const queries = [Query.orderDesc('$createdAt')];

    if (userId) {
      queries.push(Query.equal('userId', userId));
    }

    const res = await databases.listDocuments(
      databaseId,
      historyId,
      queries
    );

    const history = res.documents.map(doc => ({
      id: doc.$id,
      fileId: doc.fileId,
      name: doc.documentname,
      fileType: doc.type,
      action: doc.action,
      fileSize: doc.size,
      timestamp: doc.time,
    }));

    return {
      success: true,
      message: 'History loaded successfully.',
      history: history,
    };
  } catch (error) {
    console.error('Error fetching history:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};
export const createHistoryEntry = async (doc,action="Uploaded") => {
  try {
    const res = await databases.createDocument(
      databaseId,
      historyId,
      ID.unique(),
      {
        fileId: doc.id,
        documentId:doc.id,
        documentname: doc.name,
        type: doc.fileType,
        action: action,
        size: doc.fileSize,
        time: action==="Uploaded"? doc.uploadedAt : new Date().toISOString() ,
        userId: doc.userId || userId,
      }
    );

    return {
      success: true,
      message: 'History entry created successfully.',
      data: res,
    };
  } catch (error) {
    console.error('Error creating history entry:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateName = async(name)=>{
  if(!name) return {success:false,message:"Name is required"}
  try {
    const data = await account.updateName(name)
    return {success:true,message:"Name updated successfully!",data}
  } catch (error) {
    console.log(error.message)
    return{success:false,message:error.message};
    
  }

}

export const updatePassword = async (password, oldPassword) => {
  if (!password || !oldPassword) {
    return { success: false, message: "passwords are required" };
  }

  try {
    const data = await account.updatePassword(password, oldPassword);
    return { success: true, message: "Password updated successfully!", data };
  } catch (error) {
    console.log(error.code);
    if(error.code===401){
      return {success:false,message:"wrong password"}
    }else{
      return { success: false, message: error.message };

    }
  }
};
