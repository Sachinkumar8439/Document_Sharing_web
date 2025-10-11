import React, { useState } from "react";
import { useAppState } from "../Context/AppStateContext";
import { formatBytes } from "./Profile";
import "../pages/verify.css"
import {
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { useAuthState } from "../Context/Authcontext";
import { isOnlyPhoneNumbers } from "../utility/util";
import NoticePage from "../pages/noticepage";
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
  const {showToast, setline } =
    useAppState();
  const { user } = useAuthState();
  const [searchquery, setsearchquery] = useState("");
  const [users,setusers] = useState([]);
  const [selecteduser,setselecteduser] = useState(null);

  const handleusersearch = async ()=>{
       if(searchquery.length <5){
        showToast.error("Quaery should be larger then 4 letters");
        return
       }
        if(searchquery.includes("@")){
            if(searchquery.trim()===user.email){
              showToast.error("Email must not yours")
              return;
            }
            await setline(80);
            const res = await finduser({email:searchquery})
            if(res.success){
              setusers(res.users);
              await setline(0)
              return
            }
            showToast.error(res.message);
            await setline(0)

        }else{
          if(searchquery.length<10|| searchquery.length>13){
            showToast.error("Chceck Number of Digits")
            return;
          }
          if(isOnlyPhoneNumbers(searchquery)){
             await setline(80);
            const res = await finduser({phone:searchquery})
            if(res.success){
              setusers(res.users);
              await setline(0)
              return
            }
            showToast.error(res.message);
            await setline(0)
          }


        }
  }

  return (
    <div className="documents-container dashboardsection-container">
      <h2>Search</h2>
      <p className="documents-subtitle subtitle">Search public document by Entering email or Username of the User</p>

      <div className="search-container" style={{display:'flex',alignItems:"center"}}>
        <input
          type="text"
          name="email"
          placeholder="Enter Email or phone"
          className="search-input"
          value={searchquery}
          autoComplete="on"
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
        {users?.length === 0 ? (
          <NoticePage
            heading="NO CACHED USER YET!"
            description={"Learn about Searching/how to download a file"}
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
                 {u.image ? (
                              <img
                                src={u.image.split("FILEID")[0]}
                                alt={"user"+index}
                                // className="avatar"
                                width={"50px"}
                                height={"50px"}
                                style={{borderRadius:"100%"}}
                              />
                            ) : (
                              <FaUserCircle className="avatar-default" />
                            )}
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
      {selecteduser && <Otherdocuments currentuserid={user.$id} userid={selecteduser.$id} hashedpassword={selecteduser.publicpassword}/>}
    </div>
  );
}
