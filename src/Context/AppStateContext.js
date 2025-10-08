import { createContext, useContext, useEffect, useState } from 'react';
import { FaUser, FaFileAlt, FaCog, FaHistory,FaCheck, FaTimes } from 'react-icons/fa';
import { setFont, setTheme } from '../utility/util';
import "../Styles/confirmationpopup.css"
import { beautifulFonts, fonts } from '../data';
import WebFont from "webfontloader";


setTheme(localStorage.getItem("theme") || "cyber-dark")
// const savedFont = localStorage.getItem("font") || 'roboto';
// import(`@fontsource/${savedFont}`).then(() => {
//   console.log("it is running ")
//   document.documentElement.style.setProperty('--current-font', savedFont);
// }).catch(console.error);

const AppStateContext = createContext();

//   const fonts1 = [
//   "Roboto",
//   "Open Sans",
//   "Montserrat",
//   "Poppins",
//   "Lato",
//   "Merriweather",
//   "Spectral",
//   "Fira Sans",
//   "Inter",
//   "Raleway",
//   "Playfair Display",
//   "Work Sans",
//   "Ubuntu",
//   "Source Sans Pro",
//   "Atkinson Hyperlegible"

// ];
// const texturedFonts = [
//   "Water Brush",
//   "Cabin Sketch",
//   "Splash",
//   "Texturina",
//   "Tektur",
//   "Silkscreen",
//   "Limelight",
//   "Glegoo",
//   "Mate"
// ];

export const AppStateProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('history');
  const [font ,setfont] = useState(localStorage.getItem("font") || fonts?.serif[0])
  const [theme ,settheme] = useState(localStorage.getItem("theme") || "cyber-dark")
  const [line,setprogress] = useState({value:0,fast:false});
  const [files,setfiles] = useState([]);
  const [profileimageurl,setprofileimageurl] = useState(localStorage.getItem("profileimage") || null);
  const [history,sethistory] = useState([]);
  const [storage,setstorage] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
   const [confirmationState, setConfirmationState] = useState({
    show: false,
    heading:'',
    message: '',
    name:'',
    isinput:false,
    input:{
      type:"text",
      value:"",
      placeholder:"Enter here .."
    },
    resolve: null
  });
  // 3,5,6,7,11
  // ** 5,6,7,8,9

  useEffect(() => {
    WebFont.load({
      google: {
        families: [font]
      }
    });
    if(font) localStorage.setItem("font",font)
  }, [font]);

  const setline = async (value,isfast)=>{
       setprogress({value:value,fast:isfast || false});
  }




  const showConfirmation = (heading ,message,name,isinput,type,placeholder) => {
    return new Promise((resolve) => {
      setConfirmationState({
        show: true,
        heading,
        message,
        name,
        isinput,
        input:{
          type,
          placeholder,
          value:""
        },
        resolve
      });
    });
  };

  const handleConfirm = () => {
    confirmationState.resolve(confirmationState.isinput? confirmationState.input.value:true);
    setConfirmationState({ ...confirmationState, show: false,isinput:false ,message:"",heading:"",input:{type:"text",value:"",placeholder:"Enter here .."}});
  };

  const handleCancel = () => {
    confirmationState.resolve(false);
    setConfirmationState({ ...confirmationState, show: false,message:"", heading:"",input:{type:"text",value:"",placeholder:"Enter here .."} });
  };

  
 

  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadData, setUploadData] = useState({
    fileName: '',
    filePassword: '',
    file: null,
    sharedUsers: []
  });

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    duration:5000,
  });

  const [availableUsers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  ]);

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
    { id: 'history', label: 'History', icon: <FaHistory /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const success = (message,toastDuration=4000)=>{
    setToast({
      show: true,
      message,
      type:"success",
      duration:toastDuration
    });
    
  }
  const error = (message,toastDuration=6000)=>{
    setToast({
      show: true,
      message,
      type:"error",
      duration:toastDuration
    });
   
  }
  const showToast =  {
    success,
    error,
  };

  const value = {
    currentPage,
    isMobile,
    showUploadPopup,
    uploadData,
    toast,
    availableUsers,
    navItems,
    showToast,
    files,
    line,
    history,
    storage,
    profileimageurl,
    theme,
    font,
    setfont,
    settheme,
    setprofileimageurl,
    setline,
    setIsMobile,
    sethistory,
    setfiles,
    showConfirmation,
    setCurrentPage,
    setShowUploadPopup,
    setUploadData,
    setToast,
    setstorage,
    
    formatDate,
    formatTime,
    formatBytes,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
       {confirmationState.show && (
        <div style={{fontFamily: font}} className="confirmation-overlay">
          <div className="confirmation-box">
            <h2>{confirmationState.heading}</h2>
            <p>{confirmationState.message}</p>
            {
              confirmationState.isinput &&
              <div className='any-input-type-filed'>
              <input style={{width:"100%"}} value={confirmationState.input.value} 
              onChange={(e) =>
              setConfirmationState((prev) => ({
                ...prev,
                input: { ...prev.input, value: e.target.value }
              }))
            }
               type={confirmationState.input.type} placeholder={confirmationState.input.placeholder || "Enter here.."}/>
            </div>
            }
            {
              confirmationState.name &&
              <span style={{color:"var(--accent)"}}><input onClick={(e)=>{
                console.log(e.target.checked);
                if(e.target.checked)localStorage.setItem(confirmationState.name,e.target.checked)
                  else localStorage.removeItem(confirmationState.name);
              }} style={{cursor:"pointer"}} type='checkbox'/>dont show popup Again</span>
            }
            <div className="confirmation-buttons">
              <button className="cancel-btn" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirm}>
                <FaCheck /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};