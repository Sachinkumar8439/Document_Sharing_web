import React, { useState, useEffect } from "react";
import "./dashboard.css";
import { createHistoryEntry, formatHistoryData, gethistory, uploadFileForUser } from "../configs/appwriteconfig";
import {
  FaUser,
  FaFileAlt,
  FaCog,
  FaPlus,
  FaHistory,
  FaUpload,
  FaTimes,
  FaSearch,
  FaCloudUploadAlt,
  FaCheck,
} from "react-icons/fa";
import Profile from "../components/Profile";
import History from "../components/History";
import Documents from "../components/Documents";
import Settings from "../components/Settings";
import { useAppState } from "../Context/AppStateContext";
import { initStorageSystem ,listFilesForUser} from "../configs/appwriteconfig";
await initStorageSystem();

const Dashboard = () => {
  const { toast, setToast, showToast, showConfirmation,setfiles,setline ,sethistory} = useAppState();
  const [page, setPage] = useState(localStorage.getItem("page") || "documents");
  const [isMobile, setIsMobile] = useState(false);
  const [isuploading, setisuploading] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const [uploadData, setUploadData] = useState({
    fileName: "",
    filePassword: "",
    file: null,
    allowedUsers: [],
    isPublic: false,
  });
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
    { id: 4, name: "Diana Prince", email: "diana@example.com" },
  ]);
  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      file: e.target.files[0],
      fileName: e.target.files[0]?.name || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({
      ...uploadData,
      [name]: value,
    });
  };

  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
  };

  const toggleUserSelection = (user) => {
    setUploadData((prev) => {
      const isSelected = prev.allowedUsers.some((u) => u.id === user.id);
      return {
        ...prev,
        allowedUsers: isSelected
          ? prev.allowedUsers.filter((u) => u.id !== user.id)
          : [...prev.allowedUsers, user],
      };
    });
  };

  const handleUpload = async () => {
    if(isuploading) return;
    setisuploading(true);

    console.log("uploaded data", uploadData.file);
    if (!uploadData.file) {
      showToast.error("file not selected");
      return;
    }
    await setline(70);
    try {
      
      const response = await uploadFileForUser(uploadData.file,{isPublic:uploadData.isPublic,allowedUsers:uploadData.allowedUsers,password:uploadData.filePassword});
      if (!response.success) {
      showToast.error(response.message);
    }
    else{
      const newfile = response.newfile;
      await setline(90,true)
      const result = await createHistoryEntry({id:newfile.id,name:newfile.name,fileType:newfile.fileType,fileSize:newfile.fileSize,uploadedAt:newfile.uploadedAt,userId:newfile.userId})
      console.log("creating history result",result)
      showToast.success("Docuemnt Uploaded Successfully");
      console.log(response);
      const formatehistory = await formatHistoryData(newfile);
      setfiles((prev) => [response.newfile,...prev]);
      sethistory((prev) => [formatehistory,...prev]);
      setShowUploadPopup(false);
      setUploadData({
        fileName: "",
        filePassword: "",
        file: null,
        allowedUsers: [],
        isPublic: false,
      });
    }
  } catch (error) {
       showToast.error(error.message);
  }
  finally{
   await setline(0)
   setisuploading(false)
  }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const perfomrminitials = async()=>{
    await setline(50,true);
     const response = await listFilesForUser();
     if(response.success)
      {
       setfiles(response.files);
       console.log(response);
     }
     else{
      showToast.error(response.message);
     }
     await setline(90,true)
    const result = await gethistory();
    console.log(result);
     if(result.success)
     {
      sethistory(result.history);
     }
     else{

       showToast.error(result.message);
      }
      await setline(0)
     
  }

  useEffect(() => {
    perfomrminitials();
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(()=>{
    if(page!=="setings")
    {
      localStorage.setItem("page",page);
    }
  },[page])

  return (
    <div className="dashboard-container">
      <div className="left-bottom-navbar">
        <button
          onClick={() => setPage("profile")}
          className={page === "profile" ? "active" : ""}
        >
          <FaUser />
          {!isMobile && <span>Profile</span>}
        </button>
        <button
          onClick={() => setPage("documents")}
          className={page === "documents" ? "active" : ""}
        >
          <FaFileAlt />
          {!isMobile && <span>Documents</span>}
        </button>
        <button
          onClick={() => setPage("history")}
          className={page === "history" ? "active" : ""}
        >
          <FaHistory />
          {!isMobile && <span>History</span>}
        </button>
        <button
          onClick={() => setPage("settings")}
          className={page === "settings" ? "active" : ""}
        >
          <FaCog />
          {!isMobile && <span>Settings</span>}
        </button>
      </div>

      <div className="main-content-page">
        <div className="page-content">
          {page === "profile" ? (
            <Profile />
          ) : page === "history" ? (
            <History />
          ) : page === "documents" ? (
            <Documents />
          ) : (
            <Settings />
          )}
        </div>

        <button
          onClick={() => setShowUploadPopup(true)}
          id="document-adding-btn"
          title="Add Document"
        >
          <FaPlus />
        </button>
      </div>
      {showUploadPopup && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <div className="popup-header">
              <h3>Upload Document</h3>
              <button
                className="close-btn"
                onClick={() => setShowUploadPopup(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="upload-form">
              <div className="form-group">
                <label>File Name</label>
                <input
                  type="text"
                  name="fileName"
                  value={uploadData.fileName}
                  onChange={handleInputChange}
                  placeholder="Enter file name"
                />
              </div>

              <div className="form-group">
                <label>File Password (Optional)</label>
                <input
                  type="password"
                  name="filePassword"
                  value={uploadData.filePassword}
                  onChange={handleInputChange}
                  placeholder="Set a password for this file"
                />
              </div>

              <div className="file-upload-group">
                <label className="file-upload-label">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="file-upload-box">
                    {uploadData.file ? (
                      <>
                        <FaFileAlt className="file-icon" />
                        <span className="file-name">
                          {uploadData.file.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="upload-icon" />
                        <span>Choose a file</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className="share-section">
                <span>
                  <input
                  checked={uploadData.isPublic}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  is public
                </span>
                <h4>Share With Others</h4>
                <div className="user-search">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={handleUserSearch}
                    placeholder="Search users..."
                  />
                </div>

                <div className="user-list">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`user-item ${
                        uploadData.allowedUsers?.some((u) => u.id === user.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleUserSelection(user)}
                    >
                      <div className="user-avatar">
                        <FaUser />
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      {uploadData.allowedUsers?.some(
                        (u) => u.id === user.id
                      ) && <FaCheck className="check-icon" />}
                    </div>
                  ))}
                </div>

                {uploadData.allowedUsers.length > 0 && (
                  <div className="selected-users">
                    <h5>Selected Users ({uploadData.allowedUsers.length})</h5>
                    <div className="selected-users-list">
                      {uploadData.allowedUsers.map((user) => (
                        <div key={user.id} className="selected-user">
                          <span>{user.name}</span>
                          <button
                            onClick={() => toggleUserSelection(user)}
                            className="remove-user-btn"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                className="upload-now-btn"
                onClick={handleUpload}
               disabled={!uploadData.file || isuploading}
              >
                <FaUpload />{isuploading?"Uploading ...":"Upload Now"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )} */}
    </div>
  );
};

export default Dashboard;
