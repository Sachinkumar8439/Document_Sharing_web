const url = process.env.REACT_APP_APPWRITE_MAINFUNCTION_URL;
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
    const json = await res.json();
    return {
      success: true,
      status: res.status,
      data: json,
      message:json.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
