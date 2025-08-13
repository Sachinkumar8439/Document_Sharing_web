import React, { useState } from "react";
import { useAppState } from "../Context/AppStateContext";
import { formatBytes } from "./Profile";
import {
  //  FaFileAlt,
  FaDownload,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaDatabase,
  FaFolderOpen,
  FaShare,
  FaGlobe,
  FaCopy,
} from "react-icons/fa";
import {
  createHistoryEntry,
  deleteFileForUser,
  getFileDownload,
  getFilePreview,
} from "../configs/appwriteconfig";
import { useAuthState } from "../Context/Authcontext";
import { runhtml,getFileIcon } from "../utility/util";

export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Documents() {
  const { files, showToast, setline, setfiles, showConfirmation } =
    useAppState();
  const { user } = useAuthState();
  const [searchQuery, setSearchQuery] = useState("");
  const [iscopied,setiscopied] = useState(true);

  const setcopy = (duration=3000)=>{
   setiscopied(false)
  setTimeout(() => {
    setiscopied(true)   
   }, duration || 3000);

  }

  const handleOpenDocument = async (doc) => {
    const response = await getFilePreview(doc.id);
    if (response.success) {
     if (doc.fileType === "text/html") {
         const res = await runhtml(response.url,doc)
         if(!res.success){
             showToast.error(res.message);
         }
         return;
      }
      const a = document.createElement("a");
      a.href = response.url;
      window.open(response.url, "_blank");
      a.target = "_blank";
      a.click();
    } else {
      showToast.error(response.message);
    }

    await setline(0);
  };

  const handleDownloadDocument = async (id) => {
    if (!id) {
      showToast.error("Invalid Document");
      return;
    }

    await setline(80, true);
    const response = await getFileDownload(id);
    if (response.success) {
      const a = document.createElement("a");
      a.href = response.url;
      a.click();
    } else {
      showToast.error(response.message);
    }

    await setline(0);
  };

  const handleEditDocument = (id) => {
    // const doc = documents.find((d) => d.id === id);
    // alert(`Editing document: ${doc.name}`);
  };
  const handleDeleteDocument = async (doc) => {
    const isconfirm = await showConfirmation("Deleting the docuement");
    if (!isconfirm) return;
    await setline(60, true);
    const response = await deleteFileForUser(doc.id);
    if (response.success) {
      await setline(90, true);
      const result = await createHistoryEntry(doc, "Deleted");
      if (result.success) {
        showToast.success(response.message);
      } else {
        showToast.error(response.message);
      }
      setfiles((prev) => prev.filter((file) => file.id !== doc.id));
    } else {
      showToast.error(response.message);
    }
    await setline(0);
  };
  const handleShareDocument = async (doc) => {
    if (!doc?.id) {
      showToast.error("some thing went wrong. reload your page");
      return;
    }
    await setline(80);
    const response = await getFilePreview(doc.id);
    if (response.success) {
      const url = response.url;
      if (navigator.share) {
        await setline(0);
        navigator
          .share({
            title: doc.name,
            text: `${user.name} shared a file ${doc.fileSize}`,
            url: url,
          })
          .then(() =>{
             console.log("✅ Shared successfully")})
          .catch((error) => {
            showToast.error(error.message);
            console.error("❌ Error sharing", error);
          });
      } else {
        showToast.error("Sharing not supported in your browser");
      }
    } else {
      showToast.error(response.message);
    }
    await setline(0);
  };
  const filteredDocuments = files?.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handlecopy = async (id)=>{

    const response = await getFilePreview(id);
    if (response.success) {
      if(navigator.clipboard){
        await navigator.clipboard.writeText(response.url)
        setcopy();

      }else{
        showToast.error("clipboard not supported copy")
      }
    } else {
      showToast.error(response.message);
    }

  }

  return (
    <div className="documents-container dashboardsection-container">
      <h2>Your Documents</h2>
      <p className="documents-subtitle">All your saved documents</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search documents..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FaSearch className="search-icon" />
      </div>

      <div className="documents-list">
        {!filteredDocuments && (
          <div
            style={{
              flex: "1",
              margin: "auto",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            loading...
          </div>
        )}
            {!iscopied && <p style={{ outline:"2px solid white", position:"fixed",top:"10px",right:"20px",padding:"5px",borderRadius:"2px"}}>copied</p>}
        {filteredDocuments?.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-info">
              {getFileIcon(doc.name, doc.fileType)}
              <div className="document-details">
                <div className="document-name">{doc.name}</div>
                <div className="document-meta">
                  <span className="document-date">
                    <FaCalendarAlt className="meta-icon" />
                    {formatDate(doc.uploadedAt)}
                  <span style={{paddingLeft:"5px"}}>{doc.isPublic?<FaGlobe/>:""}</span>
                  </span>
                  <span className="document-size">
                    <FaDatabase className="meta-icon" />
                    {formatBytes(doc.fileSize)}
                    
                  </span>
                </div>
              </div>
            </div>

            <div className="document-actions">
              <button
                className="action-btn copylink-btn"
                onClick={() => handlecopy(doc.id)}
                title="copy link to share docuement"
              >
                <FaCopy />
              </button>
              <button
                className="action-btn share-btn"
                onClick={() => handleShareDocument(doc)}
                title="share document"
              >
                <FaShare />
              </button>
              <button
                className="action-btn open-btn"
                onClick={() => handleOpenDocument(doc)}
                title="Open"
              >
                <FaFolderOpen />
              </button>
              <button
                className="action-btn download-btn"
                onClick={() => handleDownloadDocument(doc.id)}
                title="Download"
              >
                <FaDownload />
              </button>
              <button
                className="action-btn"
                onClick={() => handleEditDocument(doc.id)}
                title="Edit"
              >
                <FaEdit />
              </button>
              <button
                className="action-btn"
                onClick={() => handleDeleteDocument(doc)}
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
