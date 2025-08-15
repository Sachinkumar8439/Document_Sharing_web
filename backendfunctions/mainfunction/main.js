const sdk = require("node-appwrite");

const client = new sdk.Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID)
  .setKey(process.env.REACT_APP_APPWRITE_PROJECT_API_KEY);

const users = new sdk.Users(client);
const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const usercollectionId = process.env.REACT_APP_APPWRITE_USER_COLLECTION_ID;
const historycollectionId =
  process.env.REACT_APP_APPWRITE_HISTORY_COLLECTION_ID;
const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;

const rollbackitems = {documents : [],history:[],files:[]};


const handledeleteaccount = async (userId) => {
  try {
    const userDocs = await databases.listDocuments(
      databaseId,
      usercollectionId,
      [sdk.Query.equal("userId", userId)]
    );

    const historyDocs = await databases.listDocuments(
      databaseId,
      historycollectionId,
      [sdk.Query.equal("userId", userId)]
    );
    await databases.deleteDocuments(databaseId, usercollectionId, [
      sdk.Query.equal("userId", userId),
    ]);
    rollbackitems.documents = userDocs?.documents || []
    
    await databases.deleteDocuments(databaseId, historycollectionId, [
      sdk.Query.equal("userId", userId),
    ]);
    rollbackitems.history = historyDocs.documents || []

   await Promise.all(
  (userDocs?.documents || []).map(async (doc) => {
    try {
      await storage.deleteFile(bucketId, doc.id);
    } catch (error) {
      rollbackitems.files.push(doc)
      console.error(`Error deleting file ${doc.id}:`, error.message);
    }
  })
);
await users.delete(userId);
return {success:true,message:"Your Account and data have been deleted !"}
  } catch (error) {
    console.log(error)
    return {success:false,message:error.message,error}
  }
};

module.exports = async function ({ req, res, log }) {
  log("Function is running");
  console.log(
    "databaseid ",
    databaseId,
    " usercolectionid ",
    usercollectionId,
    " historycollectionid ",
    historycollectionId,
    " bucketid ",
    bucketId
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.send("", 204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
  }
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };

  try {
    const body = JSON.parse(req.bodyRaw || "{}");
    const { work, userId } = body;

    console.log("body ", body);
    console.log("work ", work, " userid ", userId);

    if (!work || !userId) {
      return res.json(
        { success: false, message: "Invalid execution" },
        400,
        corsHeaders
      );
    }

    switch (work) {
      case "deleteAccount":
        // Delete documents with userId
        const response = await handledeleteaccount(userId);
        if(response.success){
          return res.json(
            response,
            200,
            corsHeaders
          )
        }else{
         return res.json(
            response,
            500,
            corsHeaders
          )
        }
               break
      case "getData":
        const userDocs = await databases.listDocuments(
          databaseId,
          usercollectionId,
          [sdk.Query.equal("userId", userId)]
        );

        return res.json(
          {
            success: true,
            data: userDocs.documents,
          },
          200,
          corsHeaders
        );

      default:
        return res.json(
          {
            success: false,
            message: `who are you bludy hell`,
          },
          400,
          corsHeaders
        );
    }
  } catch (err) {
    log("Error: " + err.message);
    return res.json({ success: false, error: err.message }, 500, corsHeaders);
  }
};
