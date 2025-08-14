const sdk = require("node-appwrite");

// ===== Initialize Appwrite Client =====
const client = new sdk.Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID)
  .setKey(process.env.REACT_APP_APPWRITE_PROJECT_API_KEY);

const users = new sdk.Users(client);
const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const usercollectionId = process.env.REACT_APP_APPWRITE_USER_COLLECTION_ID;
const historycollectionId = process.env.REACT_APP_APPWRITE_HISTORY_COLLECTION_ID
const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;

console.log("databaseid ",databaseId," usercolectionid ",usercollectionId," historycollectionid ",historycollectionId," bucketid ",bucketId)

// ===== CORS Headers =====
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ===== CORS Middleware =====
function handleCORS(req, res) {
  if (req.method === "OPTIONS") {
    res.send("", 204, corsHeaders);
    return false; 
  }
  return true;
}

module.exports = async function ({ req, res, log }) {
  log("Function is running");

  if (!handleCORS(req, res)) return;

  try {
    const body = JSON.parse(req.bodyRaw || "{}");
    const { work, userId } = body;

    console.log("body ",body);
    console.log("work ",work," userid ",userId)

    if (!work || !userId) {
      return res.json({ success: false, message: "Invalid execution" }, 400);
    }

    switch (work) {
      case "deleteAccount":
        // Delete documents with userId
        await databases.deleteDocuments(databaseId, usercollectionId, [
          sdk.Query.equal("userId", userId),
        ]);

        // Delete files in storage for this user
        const files = await storage.listFiles(bucketId, [
          sdk.Query.equal("userId", userId),
        ]);
        console.log("files " ,files)
        for (const file of files.files) {
          await storage.deleteFile(bucketId, file.$id);
        }

        // Delete the user account
        await users.delete(userId);

        return res.json({
          success: true,
          message: "Your Account and data have been deleted.",
        });

      case "getData":
        const userDocs = await databases.listDocuments(databaseId, usercollectionId, [
          sdk.Query.equal("userId", userId),
        ]);

        return res.json({
          success: true,
          data: userDocs.documents,
        });

      default:
        return res.json({
          success: false,
          message: `who are you bludy hell`,
        }, 400);
    }
  } catch (err) {
    log("Error: " + err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
