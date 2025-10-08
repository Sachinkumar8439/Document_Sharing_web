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
  FaWpexplorer,
} from "react-icons/fa";
import {
  createHistoryEntry,
  deleteFileForUser,
  getFileDownload,
  getFilePreview,
} from "../configs/appwriteconfig";
import { useAuthState } from "../Context/Authcontext";
import { runhtml, getFileIcon } from "../utility/util";
import NoticePage from "../pages/noticepage";
import { Links, redirect } from "react-router-dom";
import { BASE_URL, finduser } from "../Auth/appwriteauth";
import Otherdocuments from "./Otherdocuments";

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

export default function Search() {
  const { files, showToast, setline, setfiles, showConfirmation } =
    useAppState();
  const { user } = useAuthState();
  // const [searchQuery, setSearchQuery] = useState("");
  const [searchquery, setsearchquery] = useState("");
  const [users,setusers] = useState([]);
  const [selecteduser,setselecteduser] = useState(null);


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

  const handleusersearch = async ()=>{
       if(searchquery.length <5){
        showToast.error("Quaery should be larger then 4 letters");
        return
       }
        if(searchquery.includes("@")){
            console.log("yes this is a email");
            await setline(80);
            const res = await finduser({email:searchquery})
            if(res.success){
              setusers(res.users);
              await setline(0)
              return
            }
            showToast.error(res.message);
            await setline(0)

        }
  }
 const handleopenuser = ()=>{

 }
  // const filteredDocuments = files?.filter((doc) =>
  //   doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="documents-container dashboardsection-container">
      <h2>Search</h2>
      <p className="documents-subtitle subtitle">Search public document by Entering email or Username of the User</p>

      <div className="search-container" style={{display:'flex',alignItems:"center"}}>
        <input
          type="text"
          placeholder="Enter Email or Username"
          className="search-input"
          value={searchquery}
          onChange={(e) => setsearchquery(e.target.value)}
        />
          <FaSearch onClick={handleusersearch} title="search user" className="icon" style={{cursor:"pointer",position:"absolute",right:"20px"}} />
      </div>

      <div className="documents-list">
        {!users && (
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
        {users.length === 0 ? (
          <NoticePage
            heading="NO CACHED USER YET!"
            description={"Learn about Searching/hwo to download a file"}
            links={[
              {
                redirecturl: `${BASE_URL}/documentation`,
                text: "Documentation",
              },
            ]}
          />
        ) : (
          users?.map((u,index) => (
            <div key={u.$id} className="document-item">
              <div className="document-info">
                <img width={"40px"} src={u.image} alt={"user"+index}/>
                <div className="document-details">
                  <div className="document-name">{u.name}</div>
                  <div className="document-meta">
                    <span className="document-size">
                      {u.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="document-actions">
                <div className="action-div">
                  <button
                    onClick={() => setselecteduser(u)}
                    title="fetch public document"
                  >
                    open
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {selecteduser && <Otherdocuments currentuserid={user.$id} userid={selecteduser.$id}/>}
    </div>
  );
}
