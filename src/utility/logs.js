// import { saveLogs } from "../configs/appwriteconfig";
// export async function getFullSystemInfo() {
//   const userAgent = navigator.userAgent;
//   const platform = navigator.platform;
//   const vendor = navigator.vendor;

//   // Detect OS
//   let os = "Unknown OS";
//   if (/android/i.test(userAgent)) os = "Android";
//   else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
//   else if (/Win/i.test(platform)) os = "Windows";
//   else if (/Mac/i.test(platform)) os = "MacOS";
//   else if (/Linux/i.test(platform)) os = "Linux";

//   // Detect Browser
//   let browser = "Unknown Browser";
//   if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
//   else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) browser = "Safari";
//   else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
//   else if (userAgent.indexOf("Edg") > -1) browser = "Edge";

//   // Detect Device Type
//   let deviceType = "Desktop";
//   if (/Mobi|Android/i.test(userAgent)) deviceType = "Mobile";

//   // Fetch IP Address
//   const ipData = await fetch("https://api.ipify.org?format=json").then(r => r.json());

//   return { os, browser, deviceType, platform, vendor, userAgent, ip: ipData.ip };
// }
// let systemdata = await getFullSystemInfo()
// let logs = [];
// const autosave = async (userId)=>{
//     if(logs.length >0){
//         console.log(userId);
//         const res = await saveLogs(logs,userId)
//         console.log(res);
//           if(res.success){
//             logs = []
//           }
//     }
// }
// export const addlog = async(action,data=false,userId)=>{
//     if(data){
//     logs.push({
//     action,
//     ...systemdata,
//     timestamp: new Date().toISOString(),
//   })
//     }
//     else{

//         logs.push({
//             action,
//             timestamp: new Date().toISOString(),
//         })
//     }
//   await autosave(userId);
//   console.log("logs :",logs);
// }

// const uploadlogs = async (userId = null)=>{
//     if(logs.length>0){
//       const res = await saveLogs(logs.userId)
//           if(res.success){
//             logs = []
//           }
//     }
// }



