import { Client, Account, ID } from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

const account = new Account(client);
const domain = process.env.REACT_APP_VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"
const BASE_URL = `https://${domain}`;
console.log("this is base url",BASE_URL);

export const appwriteAuth = {

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

    return { success: false, message: friendlyMessage };
  } finally {
    await account.deleteSession("current").catch(err =>
      console.log("Session cleanup skipped:", err.message)
    );
  }
},

async signUp(email, password) {
  try {
    const user = await account.create(ID.unique(), email, password);
    console.log("User created:", user);

    const res = await this.sendemailverification(email, password);

    if (res.success) {
      return {
        success: true,
        message: "Account created successfully! Please check inbox & verify your email to continue.",
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
       await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      if (!user.emailVerification) {
        await account.deleteSession("current");
        return {
          success: false,
          message: "Email not verified. Please verify your email first.",
        };
      }

      return { success: true, message: "Login successful", user };
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
      return { success: false, user: null , message:error.message };
    }
  },
  

  
};

