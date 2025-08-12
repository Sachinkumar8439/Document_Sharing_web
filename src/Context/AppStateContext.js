import { createContext, useContext, useState } from 'react';
import { FaUser, FaFileAlt, FaCog, FaHistory,FaCheck, FaTimes } from 'react-icons/fa';


const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('history');
  const [line,setprogress] = useState({value:0,fast:false});
  const [files,setfiles] = useState([]);
  const [profileimageurl,setprifileimageurl] = useState(localStorage.getItem("profileimage") || null);
  const [history,sethistory] = useState([]);
  const [storage,setstorage] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
   const [confirmationState, setConfirmationState] = useState({
    show: false,
    message: '',
    resolve: null
  });

  const setline = async (value,isfast)=>{
       setprogress({value:value,fast:isfast || false});
  }

  const showConfirmation = (message) => {
    return new Promise((resolve) => {
      setConfirmationState({
        show: true,
        message,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    confirmationState.resolve(true);
    setConfirmationState({ ...confirmationState, show: false });
  };

  const handleCancel = () => {
    confirmationState.resolve(false);
    setConfirmationState({ ...confirmationState, show: false });
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
    setprifileimageurl,
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
        <div className="confirmation-overlay">
          <div className="confirmation-box">
            <p>{confirmationState.message}</p>
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