import { createContext, useContext, useEffect, useState } from "react";
import { appwriteAuth } from "../Auth/appwriteauth";
import setRoutes from "../configs/routconfig";
import Loading from "../components/Loading";
import { useAppState } from "./AppStateContext";
import Toast from "../components/Toast";

const AuthContext = createContext();
 const Routes = await setRoutes(null);

   
export const AuthProvider = ({ children }) => {
    const [sessions,setsessions] = useState([])
    const {toast,setToast,line} = useAppState()
  const {showToast} = useAppState()
    const [loading,setloading] = useState(true);

  const [routes,setroutes] = useState(Routes);
  const [user, setuser] = useState(null);
  const [alerted,setalerted] = useState(false)

  const updateuser = async (USER)=>{
        const r =  await setRoutes(USER);
        setroutes(r);
         setuser(USER);
         if(USER){
          setloading(false)
         }
         
        
         
  }
  // useEffect(()=>{
  //   //  if(user){
  //   //   setloading(false);
  //   //  }
  // },[user])

  const loaduser = async ()=>{
          const response = await appwriteAuth.getUser();
    if(response.success)
      {
        response.user.name = response.user.name?.trim() === "" ? response.user.email.split("@")[0] : response.user.name;
        updateuser(response.user);
        const res = await appwriteAuth.getUserSessions();
        setsessions(res.sessions);
        
      } else{
        if(response.error.code === 401){
           setalerted(false);
           setloading(false)
        }else{

          if(!alerted){
            showToast.error("some think went wrong check internet connection")
            setalerted(true);
            
          }
        }
        
      }
  }
  
useEffect(() => {
   if (loading) {
    loaduser();
  }
  const interval = setInterval(() => {
    if (!loading) {
      clearInterval(interval);  
      setalerted(false);
    } else {
      loaduser();
    }
  }, 2000);

  return () => clearInterval(interval);
}, [alerted,loading]);


 
  const value = {
    user,
    routes,
    sessions,
    setsessions,
    setuser,
    setroutes,
    updateuser,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading? <Loading/> : children}
      {toast.show && (
  <Toast 
    message={toast.message} 
    type={toast.type} 
    onClose={() => setToast({...toast, show: false})}
    duration={toast.duration}
  />
)}
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
