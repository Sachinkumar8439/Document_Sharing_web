import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appwriteAuth } from "../Auth/appwriteauth";
import { callAppwriteFunction } from "../API/functioncall";
import {
  FaFont,
  FaUser,
  FaHistory,
  FaEdit,
  FaTrash,
  FaDatabase,
  FaUserCog,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaEye,
  FaSlidersH,
  FaPalette,
  FaMoon,
  FaSun,
  FaLanguage,
  FaDesktop,
  FaArrowUp,
  FaCloudDownloadAlt,
  FaTrashAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuthState } from "../Context/Authcontext";
import { useAppState } from "../Context/AppStateContext";
import { updatePassword } from "../configs/appwriteconfig";
import UserSessionsModal from "./Sessions";
import { setFont, setfont, setTheme } from "../utility/util";
import { beautifulFonts, fonts } from "../data";
export function bytesToMB(bytes) {
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
}

const Settings = () => {
  const [isshowsession, setisshowsession] = useState(false);
  const [passtate, setpasstate] = useState(-1);
  const [password, setpassword] = useState("");
  const { showConfirmation, showToast, setline, storage ,settheme,theme,font,setfont} = useAppState();
  const { updateuser, user, sessions } = useAuthState();
  const navigate = useNavigate();

  const logout = async (e) => {
    e.preventDefault();
    if (
      !(await showConfirmation("Are you sure ?",
        "Your session on this device will be deleted you can login again any time"
      ))
    ) {
      return;
    }
    try {
      await setline(90, true);
      const response = await appwriteAuth.logout();
      console.log(response);
      if (response.success) {
        updateuser(null);
        localStorage.removeItem("page");
        showToast.success(response.message);
        navigate("/");
      } else {
        showToast.error(response.message, 5000);
      }
    } catch (error) {
      showToast.error(error.message, 5000);
    } finally {
      setline(0);
    }
  };

  const deleteaccount = async (e) => {
    e.preventDefault();
    try {
      const isconfirm = await showConfirmation(
        "Are you sure you want to delete your account?\nThis action is permanent and cannot be undone."
      );
      if (!isconfirm) return;
      await setline(90, true);
      const response = await callAppwriteFunction("post", {
        userId: user?.$id,
        work: "deleteAccount",
      });
      console.log(response);
      if (response.success) {
        showToast.success(response.message);
        updateuser(null);
        navigate("/");
      } else {
        showToast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      showToast.error(error.message);
    } finally {
      setline(0);
    }
  };
  const runpasswordchangeproccess = async (e) => {
    e.preventDefault();
    switch (passtate) {
      case -1:
        setpasstate(0);
        break;
      case 0:
        await setline(50, true);
        localStorage.setItem("password", "checkpassword123");
        const response = await updatePassword(
          localStorage.getItem("password"),
          password
        );
        if (response.success) {
          await setline(85, true);
          const result = await updatePassword(
            password,
            localStorage.getItem("password")
          );
          if (result.success) {
            setpasstate(1);
            setpassword("");
            showToast.success("Correct password!  enter new password in field");
            localStorage.setItem("oldpassword", password);
            await setline(0);
          } else {
            localStorage.setItem("unupdatepassword", true);
          }
        } else {
          showToast.error(response.message);
        }
        await setline(0);
        break;
      case 1:
        await setline(80);
        const res = await updatePassword(
          password,
          localStorage.getItem("oldpassword")
        );
        if (res.success) {
          showToast.success(res.message);
          localStorage.removeItem("password");
          localStorage.removeItem("oldpassword");
          setpasstate(-1);
          setpassword("");
        } else {
          showToast.error(res.message);
        }
        await setline(0);
        break;
      default:
        break;
    }
  };
  const handlethemechange = (e)=>{
      e.preventDefault()
      setTheme(e.target.value);
      settheme(e.target.value)
  }
  const handlesetfont = (e)=>{
    e.preventDefault();
    setfont(e.target.value)
  }
  const cencelpasswordset = (e) => {
    e.preventDefault();
    setpassword("");
    setpasstate(-1);
  };

  return (
    <div className="documents-container dashboardsection-container">
      {isshowsession && (
        <UserSessionsModal onClose={() => setisshowsession(false)} />
      )}
      <h2>Settings</h2>
      <p className="settings-subtitle subtitle">
        Configure your application preferences
      </p>

      <div className="settings-categories">
        <div className="settings-category">
          <div className="category-header">
            <FaUserCog className="category-icon" />
            <h3>Account Settings</h3>
          </div>
          <div className="category-content">
            <div className="setting-item">
              <div className="setting-info">
                <FaLock className="setting-icon" />
                <div>
                  <h4>Password</h4>
                  <p>Change your account password</p>
                </div>
                {passtate !== -1 && (
                  <button onClick={cencelpasswordset} className="upgrade-btn">
                    {" "}
                    X
                  </button>
                )}
              </div>

              <button onClick={runpasswordchangeproccess} className="edit-btn">
                {passtate === 0 ? (
                  "submit"
                ) : passtate === 1 ? (
                  "Update"
                ) : (
                  <>
                    <FaEdit /> change
                  </>
                )}
              </button>

              {passtate !== -1 && (
                <input
                  className="password-change-closebtn"
                  placeholder={
                    passtate === 0
                      ? "Enter current password"
                      : "Enter New Password"
                  }
                  //  style={{padding:"8px",borderRadius:"5px",background:"black",border:'none',color:"white",width:"100%",minWidth:"60%"}}
                  type="password"
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                ></input>
              )}
              {/* <div style={{display:"flex",alignItems:"center",gap:"8px",width:"100%"}}>
              </div> */}
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <FaSignOutAlt className="setting-icon" />
                <div>
                  <h4>Logout Account</h4>
                  <p>Logout or Delete the session on this device</p>
                </div>
              </div>
              <button onClick={logout} className="edit-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="settings-category">
          <div className="category-header">
            <FaShieldAlt className="category-icon" />
            <h3>Privacy & Security</h3>
          </div>
          <div className="category-content">
            <div className="setting-item toggle-item">
              <div className="setting-info">
                <FaHistory className="setting-icon" />
                <div>
                  <h4>Data Collection</h4>
                  <p>Allow analytics data collection</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <FaUser className="setting-icon" />
                <div>
                  <h4>  <span className="">
                  {sessions.total} Active
                </span> Session{sessions.total === 1?"":"s"}</h4>
                <p>manage where you logged in</p>
                </div>
              </div>
              <div className="theme-options">
                <button
                  onClick={() => setisshowsession(true)}
                  className=" edit-btn dark active"
                >
                  <FaSun /> Manage
                </button>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <FaTrash className="setting-icon" />
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account</p>
                </div>
              </div>
              <button onClick={deleteaccount} className="delete-btn">
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="settings-category">
          <div className="category-header">
            <FaSlidersH className="category-icon" />
            <h3>App Preferences</h3>
          </div>
          <div className="category-content">
            <div className="setting-item">
              <div className="setting-info">
                <FaPalette className="setting-icon" />
                <div>
                  <h4>Themes</h4>
                  <p>Choose Good looking Themes</p>
                </div>
              </div>
              <select value={theme} onChange={handlethemechange} className="selector">
                <option value="pink-light">pink-light</option>
                <option value="forest">forest</option>
                <option value="midnight-purple">midnight-purple</option>
                <option value="solarized">solarized</option>
                <option value="dracula">dracula</option>
                <option value="monochrome">monochrome</option>
                <option value="cyber-dark">cyber-dark</option>
                <option value="warm-sunset">warm-sunset</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <FaFont className="setting-icon" />
                <div>
                  <h4>Fonts</h4>
                  <p>Choose fonts matches you preferences</p>
                </div>
              </div>
              <select value={font} onChange={handlesetfont} className="selector">
               {fonts?.serif?.map((font,index) => (
        <option key={index} value={font}>
          {font}
        </option>
      ))}
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <FaLanguage className="setting-icon" />
                <div>
                  <h4>Language</h4>
                  <p>Select your preferred language</p>
                </div>
              </div>
              <select className="selector">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-category">
          <div className="category-header">
            <FaDatabase className="category-icon" />
            <h3>Storage Management</h3>
          </div>
          <div className="category-content">
            <div className="storage-info">
              <div className="storage-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${(bytesToMB(storage) / 50) * 100}%` }}
                ></div>
              </div>
              <div className="storage-details">
                <span>
                  {bytesToMB(storage)}MB of 50MB used [{""}
                  {(bytesToMB(storage) / 50) * 100}%]
                </span>
                <button className="upgrade-btn">
                  <FaArrowUp /> Upgrade
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <FaCloudDownloadAlt className="setting-icon" />
                <div>
                  <h4>Auto Backup</h4>
                  <p>Configure automatic backups</p>
                </div>
              </div>
              <button className="edit-btn">
                <FaEdit /> Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
