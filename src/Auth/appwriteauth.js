import { Client, Account, ID ,Storage, Databases, Query, Permission, Role } from "appwrite";
import { hashPassword } from "../utility/util";
export const client = new Client()
.setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
.setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);
let account
try {
  account = new Account(client);
  
} catch (error) {
  // console.log(error)
}
const storage = new Storage(client);
const databases = new Databases(client);
const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;
const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const filecollectionId = process.env.REACT_APP_APPWRITE_USERFILE_COLLECTION_ID;
const historyId = process.env.REACT_APP_APPWRITE_HISTORY_COLLECTION_ID;
const userCollectionId = process.env.REACT_APP_APPWRITE_USER_COLLECTION_ID
const domain = process.env.REACT_APP_VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"
export const BASE_URL = `https://${domain}`;

export const finduser = async(data={})=>{

  try {
    const field = data.email ? "email" : "phone";
    const value = data.email || data.phone;
    const res = await databases.listDocuments(
    databaseId,
    userCollectionId,
    [Query.equal(field,value)]
  );
  if (res.documents.length > 0) {
    return {success:true,users:res.documents,message:"User Found"};
  } else {
    return {success:false,message:`No user found with this ${field}`,};
  }  
    
  } catch (error) {
    return {success:false,message:error.message}
    
  }
  


}

export const addusertodb = async(user,password)=>{
  const hashedpassword = await hashPassword(password);
   try {
     const response =  await databases.createDocument(
      databaseId,
      userCollectionId,
      user.$id, 
      {
        name:user.email.split("@")[0],
        email:user.email,
        phone:user.phone,
        image:null,
        encpasswords:[],
        password:hashedpassword,
        publicpassword:hashedpassword,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.write(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );
    return {success:true,data:response,message:"Successfully added to user"};
    
  } catch (error) {
    console.error(error.message);
    return {success:false,message:error.message};
    
  }


}

export const appwriteAuth = {
async sendAndVerifyPhone(phone,password) {
  try {
    // Step 2: Send the phone verification code
    const verification = await account.createPhoneVerification();
    console.log("Verification token sent:", verification);

    // Step 3: Ask user to enter the OTP from SMS
    const otpCode = prompt("Enter the verification code sent to your phone:");

    // Step 4: Complete the verification
    await account.updatePhoneVerification(verification.userId, otpCode);

    return {
      success: true,
      message: "Your phone number has been verified successfully."
    };
  } catch (error) {
    console.error("Phone verification error:", error);

    let friendlyMessage;

switch (error.code) {
  case 400:
    friendlyMessage = "Invalid request. Please check the phone number format.";
    break;
  case 401:
    friendlyMessage = "Authentication failed. Please check your phone number and password.";
    break;
  case 403:
    friendlyMessage = "Verification not allowed at the moment. Please try again later.";
    break;
  case 404:
    friendlyMessage = "User account not found. Please sign up first.";
    break;
  case 409:
    friendlyMessage = "This phone number is already verified.";
    break;
  case 429:
    friendlyMessage = "Too many attempts. Please wait before trying again.";
    break;
  case 500:
    friendlyMessage = "Server error while sending verification. Please try again later.";
    break;
  default:
    friendlyMessage = error.message || "An unexpected error occurred during phone verification.";
}

    return { success: false, message: friendlyMessage };
  } finally {
    await account.deleteSession("current").catch(err =>
      console.log("Session cleanup skipped:", err.message)
    );
  }
}
,
async sendemailverification(email, password) {
  try {
    await account.createEmailPasswordSession(email, password);
    await account.createVerification(`${BASE_URL}/verify`);

    return {
      success: true,
      message: "A verification link has been sent to your email address.",
    };
  } catch (error) {
    console.error("Verification error:", error);

    let friendlyMessage = error.message;

    if (error.code === 401) {
      friendlyMessage = "Invalid credentials. Please check your email and password.";
    } else if (error.code === 403) {
      friendlyMessage = "This email cannot be verified right now. Try again later.";
    } else if (error.code === 429) {
      friendlyMessage = "Too many verification attempts. Please wait a moment and try again.";
    }
    else if (error.code === 409) {
      friendlyMessage = "allready verified if you lost password then reset it";
    }

     await account.deleteSession("current").catch(err =>
      console.log("Session cleanup skipped:", err.message)
    );

    return { success: false, message: friendlyMessage };
  } 
},

async signUp(email, password,phone) {
  try {
    const user = await account.create(ID.unique(), email, password,phone);
    console.log("User created:", user);

    const res = await this.sendemailverification(email, password);

    if (res.success) {
      const userindb  = await addusertodb(user,password);
      console.log("userin db",userindb)
      const response = await this.sendAndVerifyPhone();
      if(response.success){
        return{ success:true,message:"verification email Link and Phone OTP sent Successfully verify them"}
      }
      return {
        success: true,
        message: "Email verification Link sent verify that, some error in sending phone verifiction. you can verify phone number latter",
      };
    } else {
      return { success: false, message: res.message };
    }
  } catch (error) {
    console.error("Signup error:", error);

    let friendlyMessage = "Something went wrong. Please reload and try again later.";

    if (error.code === 409) {
      friendlyMessage = "This email is already registered. If unverified, please check your inbox.";
    } else if (error.code === 400) {
      friendlyMessage = error.message;
    } else if (error.code === 422) {
      friendlyMessage = "Password too weak. Use at least 8 characters, including numbers and symbols.";
    } else if (error.code === 401) {
      friendlyMessage = "Unauthorized request. Please try again.";
    } else if (error.code === 429) {
      friendlyMessage = "Too many signup attempts. Please wait and try again.";
    }

    return { success: false, message: friendlyMessage ,code:error.code };
  }
}

,

  async login(email, password) {
    try {
      const session =  await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      if (!user.emailVerification) {
        await account.deleteSession("current");
        return {
          success: false,
          message: "Email not verified. Please verify your email first.",
        };
      }

      return { success: true, message: "Login successfully", user , session };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  },

  async confirmVerification(userId, secret) {
    try {
      await account.updateVerification(userId, secret);
      return { success: true, message: "Email verified successfully!" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async requestPasswordReset(email) {
    try {
      await account.createRecovery(email, `${BASE_URL}/reset-password`);
      return { success: true, message: "If the email exists, a recovery link was sent." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async resetPassword(userId, secret, newPassword) {
    try {
      await account.updateRecovery(userId, secret, newPassword);
      return { success: true, message: "Password has been reset." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async logout() {
    try {
      await account.deleteSession("current");
      return { success: true, message: "Logged out successfully." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getUser() {
    try {
      const user = await account.get();
      return { success: true, user,message:"Welcome back !" };
    } catch (error) {
      return { success: false, user: null , message:error.message,error };
    }
  },
  async getUserSessions(){
  try {
    const sessions = await account.listSessions();
    return {success:true,message:"sessions fetched successfully",sessions};
  } catch (error) {
    console.error("Error getting sessions:", error);
    return {success:false,message:error.message}
  }
},
 async deleteSession(sessionId) {
  try {
    await account.deleteSession(sessionId);
    console.log(`Session ${sessionId} deleted`);
    return{success:true,message:"Session Deleted Successfully"}
  } catch (error) {
    console.error("Error deleting session:", error);
    return {success:false,message:error.message}
  }
}

};

