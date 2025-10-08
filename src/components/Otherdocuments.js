import React, { useEffect, useState } from "react";
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
  findothersdocuments,
  getFileDownload,
  getFilePreview,
} from "../configs/appwriteconfig";
import { useAuthState } from "../Context/Authcontext";
import { runhtml, getFileIcon, verifyPassword } from "../utility/util";
import NoticePage from "../pages/noticepage";
import { Links, redirect } from "react-router-dom";
import { BASE_URL } from "../Auth/appwriteauth";

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

export default function Otherdocuments({ userid, currentuserid ,hashedpassword}) {
  const { showToast, setline, showConfirmation } = useAppState();
  const { user } = useAuthState();
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setfiles] = useState([]);

  const fetchdocuemnts = async () => {
    const res = await findothersdocuments(currentuserid, userid);
    console.log(res);
    if(res.success){
      if(res.docs.documents.length <=0){
        showToast.success("No Public Documentsof the User")
        return;
      }
      setfiles(res.docs.documents);
      return;
    }
    showToast.error(res.message)
  };

  useEffect(() => {
    if (currentuserid && userid) {
      fetchdocuemnts();
    }
  }, [userid]);

  const handleDownloadDocument = async (id) => {
    if (!id) {
      showToast.error("Invalid Document");
      return;
    }
    const password = await showConfirmation(
      "Confirm Action", 
      "Please enter your password to continue.", // message
      null,
      true, 
      "password", 
      "Enter password here..." 
    );
    if(!password) return;
    const isauthorize = await verifyPassword(password,hashedpassword)
    console.log("Entered password:", password);
    if(!isauthorize){
      showToast.error("Wrong Password")
      return;
    }
    const response = await getFileDownload(id);
    if (response.success) {
      const a = document.createElement("a");
      a.href = response.url;
      a.click();
    } else {
      showToast.error(response.message);
    }
  };

  const filteredDocuments = files?.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="documents-container dashboardsection-container">
      {/* <h2>Your Documents</h2> */}
      <p className="documents-subtitle subtitle">
        The avaialable docuements for you
      </p>

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

        {filteredDocuments.length === 0 ? (
          <NoticePage
            heading="NO DOCUMENT FOUND!"
            description={
              "Learn about docuements/types avaialable and there SECURITY PERMISSIONS"
            }
            links={[
              {
                redirecturl: `${BASE_URL}/documentation`,
                text: "Documentation",
              },
            ]}
          />
        ) : (
          filteredDocuments?.map((doc) => (
            <div key={doc.$id} className="document-item">
              <div className="document-info">
                {getFileIcon(doc.fileName, doc.fileType)}
                <div className="document-details">
                  <div className="document-name">{doc.fileName}</div>
                  <div className="document-meta">
                    <span className="document-size">
                      <FaDatabase className="meta-icon" />
                      {formatBytes(doc.fileSize)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="document-actions">
                <div className="action-div">
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownloadDocument(doc.fileId)}
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
