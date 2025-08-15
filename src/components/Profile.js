import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaEdit,
  FaCalendarAlt,
  FaUserCircle,
  FaCamera,
  FaFilePdf,
  FaCrown,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
} from "react-icons/fa";
import { useAppState } from "../Context/AppStateContext";
import { useAuthState } from "../Context/Authcontext";
import { updateName } from "../configs/appwriteconfig";

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
const Profile = () => {
  const { showToast, documents, files, setline,storage,setstorage,profileimageurl } = useAppState();
  const { user, setuser } = useAuthState();

 

  // const [user, setUser] = useState({
  //   name: "John Doe",
  //   email: "john.doe@example.com",
  //   avatar: null,
  //   isVip: true,
  //   joinDate: new Date('2023-01-15'),
  //   totalDocuments: 42,
  //   totalStorageUsed: 256000000,
  //   documentTypes: {
  //     pdf: 12,
  //     doc: 15,
  //     ppt: 5,
  //     xls: 7,
  //     other: 3
  //   }
  // });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setname] = useState(user?.name || "UnNamedUser");
  const [file,setfile] = useState(null);
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // const formatTime = (date) => {
  //     return date.toLocaleTimeString('en-US', {
  //         hour: '2-digit',
  //         minute: '2-digit'
  //     });
  // };
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (name === user.name) {
      setIsEditing(false);
      return;
    }
    await setline(80, true);
    const response = await updateName(name);
    console.log(response);
    if (response.success) {
      setuser(response.data);
      showToast.success(response.message);
    } else {
      showToast.error(response.message);
      await setline(0);
      return;
    }
    await setline(0);
    setIsEditing(false);
  };

  return (
    <div className="documents-container dashboardsection-container">
      <h2>User Profile</h2>
      <p className="profile-subtitle subtitle">Manage your account settings</p>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            {profileimageurl ? (
              <img src={profileimageurl} alt="User Avatar" className="avatar" />
            ) : (
              <FaUserCircle className="avatar-default" />
            )}
            <div onClick={(e)=>{
              e.preventDefault()
              showToast.success("Just Upload __profile.jpg file by + button in right bottom corner",10000)
            }} title="want to add new profile image just upload __profile.jpg file or image by + button" className="edit-avatar-btn">
              <FaCamera className="profile-image-camera" />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name">
              <h3>{user.name}</h3>
              {user.emailVerification && (
                <span className="vip-badge">
                  <FaCrown className="vip-icon" />
                </span>
              )}
            </div>
            <p className="profile-email">{user.email}</p>
            {/* <p className="join-date">
                <FaCalendarAlt className="icon" /> Member since {formatDate(user.metadata.createdAt)}
              </p> */}
          </div>

          <button
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <FaEdit /> {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                onFocus={(e)=>e.target.select()}
                autoFocus={true}
                type="text"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
            </div>
            {/* <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editData.email} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                />
              </div> */}
            <div className="form-actions">
              <button className="save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="stats-section">
              <h4>Document Statistics</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{files.length}</div>
                  <div className="stat-label">Total Documents</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatBytes(storage)}</div>
                  <div className="stat-label">Storage Used</div>
                </div>
              </div>

              <div className="file-type-stats">
                <h5>Documents by Type</h5>
                <div className="file-types-grid">
                  {documents?.map((doc, index) => (
                    <div key={index} className="file-type-item">
                      <div className="file-type-icon">
                        {doc.fileType === "pdf" && <FaFilePdf />}
                        {doc.fileType === "doc" && <FaFileWord />}
                        {doc.fileType === "ppt" && <FaFilePowerpoint />}
                        {doc.fileType === "xls" && <FaFileExcel />}
                        {doc.fileType === "other" && <FaFileAlt />}
                      </div>
                      <div className="file-type-count">{}</div>
                      <div className="file-type-name">
                        {doc.fileType.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
