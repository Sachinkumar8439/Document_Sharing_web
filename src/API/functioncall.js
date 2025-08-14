import { faL } from "@fortawesome/free-solid-svg-icons";

const url = process.env.REACT_APP_APPWRITE_MAINFUNCTION_URL;
console.log("function url" , url);
export const callAppwriteFunction = async (
  method = 'GET',
  body = null,
  headers = {},
  userId=null
) => {
 
    if(!url){return {success:false,message:"Invalid Reaquest"}}
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    console.log(res);
    const json = await res.json();
    console.log(json);
    if(json.success){
      return {
        success: true,
        status: res.status,
        data: json,
        message:json.message
      };
    }else{
      const mes = res?.status === 500 ?"Something went wrong":json.error;
      return {success:false,message:mes}
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
