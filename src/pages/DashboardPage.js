import { useState, useEffect, useRef } from "react";
// import "./dashboard.css";
import "../components/dashboardsections.css";
import "./uploadingpage.css";
import {
  createHistoryEntry,
  getFilePreview,
  gethistory,
  uploadFileForUser,
} from "../configs/appwriteconfig";
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
import Settings, { bytesToMB } from "../components/Settings";
import { useAppState } from "../Context/AppStateContext";
import { initStorageSystem, listFilesForUser } from "../configs/appwriteconfig";
import { checkfile } from "../utility/util";
import { appwriteAuth, finduser } from "../Auth/appwriteauth";
import { useAuthState } from "../Context/Authcontext";
import Search from "../components/Search";
import { encryptFile, encryptFileWithPassword } from "../utility/fileencyption";
import { createSmartZip } from "../utility/util";
await initStorageSystem();

let debouncetimer = null;
const Dashboard = () => {
  const {
    files,
    showToast,
    setfiles,
    setline,
    sethistory,
    storage,
    setstorage,
    line,
  } = useAppState();
  const [page, setPage] = useState(localStorage.getItem("page") || "documents");
  const [isMobile, setIsMobile] = useState(false);
  const [isuploading, setisuploading] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const { setsessions, user } = useAuthState();
  const [fileoption, setfileoption] = useState({
    isvisible: false,
    state: 0,
  });
  const popufforuploadingfiletype = useRef(null);
  const [uploadData, setUploadData] = useState({
    fileName: "",
    filePassword: "",
    files: [],
    allowedUsers: [],
    isPublic: false,
  });
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setavailableUsers] = useState([]);


  const handleFileChange = (e) => {
   const selectedFiles = Array.from(e.target.files);
  if (!selectedFiles.length) return;

  const firstFile = selectedFiles[0];
  let newFileName = "untitled.zip";

  if (fileoption.state === 0) {
    newFileName = firstFile.name;
  }

  else if (fileoption.state === 1) {
    newFileName = "files.zip";
  }

  else if (fileoption.state === 2) {
    const relativePath = firstFile.webkitRelativePath || "";
    const folderName = relativePath.split("/")[0] || "folder";
    newFileName = `${folderName}.zip`;
  }

  setUploadData((prev) => ({
    ...prev,
    files: selectedFiles,
    fileName: newFileName,
  }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

  if (name !== "fileName") {
    setUploadData((prev) => ({ ...prev, [name]: value }));
    return;
  }

  if (fileoption.state === 0 && uploadData.files.length === 1) {
    const oldFile = uploadData.files[0];
    const newFile = new File([oldFile], `${value.split(".")[0]}.${oldFile.name.split(".")[1]}`, {
      type: oldFile.type,
    });

    setUploadData((prev) => ({
      ...prev,
      fileName: `${value.split(".")[0]}.${oldFile.name.split(".")[1]}`,
      files: [newFile],
    }));
  }

  else {
    const finalName = value.split(".")[0]+'.zip';
    setUploadData((prev) => ({
      ...prev,
      fileName: finalName,
    }));
  }
  };

  const fetchusers = async (query) => {
    const fechedusers = await finduser({ email: query });
    setavailableUsers(fechedusers.users);
  };
  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
    clearTimeout(debouncetimer);
    if (e.target.value.trim() === "") return;
    debouncetimer = setTimeout(() => {
      fetchusers(e.target.value);
    }, 1000);
  };

  const toggleUserSelection = (user) => {
    setUploadData((prev) => {
      const isSelected = prev.allowedUsers.some((u) => u.$id === user.$id);
      return {
        ...prev,
        allowedUsers: isSelected
          ? prev.allowedUsers.filter((u) => u.$id !== user.$id)
          : [...prev.allowedUsers, user],
      };
    });
  };

  const handleUpload = async () => {
    if (isuploading) return;

  if (!uploadData.files?.length) {
    showToast.error("No file selected");
    return;
  }

  if (uploadData.fileName.trim() === "") {
    showToast.error("File name should not be empty");
    return;
  }

  setisuploading(true);

  try {
    const finalFile = await createSmartZip(uploadData.files, uploadData.fileName);

    const totalSizeMB = bytesToMB(finalFile.size + storage);
    if (totalSizeMB - 50 > 0) {
      showToast.error(
        `Limit exceed [ ${50 - bytesToMB(storage)}MB Available and your file size is ${bytesToMB(finalFile.size)}MB ]`
      );
      setisuploading(false);
      return;
    }

    const isuniquefile = await checkfile(files, { ...uploadData, fileName: finalFile.name });
    if (!isuniquefile) {
      showToast.error("File name already exists");
      setisuploading(false);
      return;
    }

    let fileToUpload = finalFile;
    if (uploadData.filePassword.length > 3) {
      fileToUpload = await encryptFileWithPassword(finalFile, uploadData.filePassword);
    }

    if (fileToUpload.size < 5242880) await setline(70);
      const response = await uploadFileForUser(
        fileToUpload,
        {
          isPublic: uploadData.isPublic,
          allowedUsers: uploadData.allowedUsers,
          password: uploadData.filePassword,
          fileName: finalFile.name,
        },
        setline
      );

      if (!response.success) {
        showToast.error(response.message);
      } else {
        const newfile = response.newfile;
        await setline(99, true);
        await createHistoryEntry({
          id: newfile.id,
          name: newfile.name,
          fileType: newfile.fileType,
          fileSize: newfile.fileSize,
          uploadedAt: newfile.uploadedAt,
          userId: newfile.userId,
        });
        showToast.success("Document Uploaded Successfully");

        setfiles((prev) => [newfile, ...prev]);
        setShowUploadPopup(false);
        setUploadData({
          fileName: "",
          filePassword: "",
          files: [],
          allowedUsers: [],
          isPublic: false,
        });
      }
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      await setline(0);
      setisuploading(false);
    }
  };

  const filteredUsers = availableUsers?.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const perfomrminitials = async () => {
    await setline(50, true);
    const response = await listFilesForUser();
    if (response.success) {
      setfiles(response.files);
    } else {
      showToast.error(response.message);
    }
    await setline(90, true);
    const result = await gethistory();
    if (result.success) {
      sethistory(result.history);
    } else {
      showToast.error(result.message);
    }

    await setline(0);
    const res = await appwriteAuth.getUserSessions();
    if (res.success) {
      setsessions(res.sessions);
    }
  };

  useEffect(() => {
    let storageused = 0;
    files.forEach((element) => {
      if (element.name.split(".")[0] !== `profile_${user.$id}`) {
        storageused += element.fileSize;
      }
    });

    setstorage(storageused);
  }, [files, setstorage, user]);

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popufforuploadingfiletype.current &&
        !popufforuploadingfiletype.current.contains(event.target)
      ) {
        setfileoption((prev) => ({ ...prev, isvisible: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setfileoption]);

  useEffect(() => {
    if (page !== "setings" || page !== "history") {
      localStorage.setItem("page", page);
    }
  }, [page]);

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
          {!isMobile && <span>Docs</span>}
        </button>
        <button
          onClick={() => setPage("search")}
          className={page === "search" ? "active" : ""}
        >
          <FaSearch />
          {!isMobile && <span>Search</span>}
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
        {fileoption.isvisible && (
          <ul className="uploadoptions" ref={popufforuploadingfiletype}>
            <li
              onClick={() => {
                setfileoption({ isvisible: false,state:0 });
                setShowUploadPopup(true)
              }}
            >
              Upload single file
            </li>
            <li  onClick={() => {
                setfileoption({ isvisible: false ,state:1});
                setShowUploadPopup(true)
              }}
              >Upload multiple files</li>
            <li onClick={() => {
                setfileoption({ isvisible: false ,state:2});
                setShowUploadPopup(true)
              }}>upload Folder as ZIP</li>
          </ul>
        )}
        <div className="page-content">
          {page === "profile" ? (
            <Profile />
          ) : page === "history" ? (
            <History />
          ) : page === "documents" ? (
            <Documents />
          ) : page === "search" ? (
            <Search />
          ) : (
            <Settings />
          )}
        </div>
        {/* const [fileoption,setfileoption] = ({isvisible:false,selectedtype:0,rby:0,rbx:0}); */}
        <button
          onClick={() => {
            setfileoption((prev) => ({
              ...prev,
              isvisible: true,
            }));
          }}
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
                  required
                />
              </div>

              <div className="form-group">
                <label>File Password (Optional)</label>
                <input
                  type="password"
                  name="filePassword"
                  value={uploadData.filePassword}
                  onChange={handleInputChange}
                  placeholder="Enter password to encrypt"
                />
              </div>

              <div className="file-upload-group">
                <label className="file-upload-label">
                  <input
                    type="file"
                   multiple={fileoption.state === 1} 
                   webkitdirectory={fileoption.state === 2 ? "true" : undefined}
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="file-upload-box">
                    {uploadData.files[0] ? (
                      <>
                        <FaFileAlt className="file-icon" />
                        <span className="file-name">
                          {uploadData.files[0].name}
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
                  {filteredUsers?.map((user) => (
                    <div
                      key={user.$id}
                      className={`user-item ${
                        uploadData.allowedUsers?.some((u) => u.id === user.$id)
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
                        (u) => u.$id === user.$id
                      ) && <FaCheck className="check-icon" />}
                    </div>
                  ))}
                </div>

                {uploadData.allowedUsers.length > 0 && (
                  <div className="selected-users">
                    <h5>Selected Users ({uploadData.allowedUsers.length})</h5>
                    <div className="selected-users-list">
                      {uploadData.allowedUsers.map((user) => (
                        <div key={user.$id} className="selected-user">
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
                disabled={!uploadData.files[0] || isuploading}
              >
                <FaUpload />
                {isuploading ? `Uploading ... (${line.value}%)` : "Upload Now"}
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
