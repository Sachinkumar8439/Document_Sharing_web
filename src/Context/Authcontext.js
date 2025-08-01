import { createContext, useContext, useState } from "react";
import { appwriteAuth } from "../Auth/appwriteauth";
import setRoutes from "../configs/routconfig";
const AuthContext = createContext();
 const response = await appwriteAuth.getUser();
    if(response.success)
      {
        response.user.name = response.user.name?.trim() === "" ? response.user.email.split("@")[0] : response.user.name;
      } 
 const Routes = await setRoutes(response?.user || null);
   
export const AuthProvider = ({ children }) => {
  const [routes,setroutes] = useState(Routes);
  const [user, setuser] = useState(response?.user || null);

  const updateuser = async (USER)=>{
        const r =  await setRoutes(USER);
        setroutes(r);
         setuser(USER);
  }

 
  const value = {
    user,
    routes,
    setuser,
    setroutes,
    updateuser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }
  return context;
};
