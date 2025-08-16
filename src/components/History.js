import React, { useEffect, useRef, useState } from "react";
// FaCalendarAlt ,
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
import { useAppState } from "../Context/AppStateContext";
import { getFileIcon } from "../utility/util";
import { deleteDocuments } from "../configs/appwriteconfig";
import NoticePage from "../pages/noticepage";
import { BASE_URL } from "../Auth/appwriteauth";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// const getFileTypeIcon = (fileType) => {
//   // You can map specific icons per type if needed
//   return <FaFileAlt className={`file-icon ${fileType}`} />;
// };

const History = () => {
  const [isaditing, setisditing] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const [duration, setDuration] = useState(0);

  const { history, setline, sethistory, showToast, showConfirmation } =
    useAppState();
  const [checkboxvisible, setcheckboxvisible] = useState(false);
  const [deletelist, setdeletelist] = useState([]);
  const [finaldeletelist, setfinaldeletelist] = useState([]);

  const handlePressStart = (e, id) => {
    const tag = e.target.tagName.toLowerCase();
    if (
      tag === "button" ||
      tag === "input" ||
      e.target.closest(".history-actions")
    ) {
      return;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setDuration(elapsed);

      if (elapsed >= 800) {
        clearInterval(timerRef.current);
        setcheckboxvisible(true);
        setisditing(true);
        addindeletelist(id);
      }
    }, 50);
  };
  const handlePressEnd = (e) => {
    e.stopPropagation();
    if (checkboxvisible) return;
    clearInterval(timerRef.current);
    setDuration(0);
  };
  const addindeletelist = async (id) => {
    setdeletelist((prev) =>
      prev.map((one) => (one.id === id ? { ...one, selected: true } : one))
    );
  };
  const removefromdeletelist = async (id) => {
    setdeletelist((prev) =>
      prev.map((one) => (one.id === id ? { ...one, selected: false } : one))
    );
  };
  useEffect(() => {}, [finaldeletelist]);

  useEffect(() => {
    if (deletelist?.length) {
      setfinaldeletelist(deletelist.filter((one) => one.selected));
    }
  }, [deletelist]);

  const resetdeletelist = () => {
    setdeletelist(
      history?.map((element) => ({
        id: element.id,
        selected: false,
      }))
    );
  };

  useEffect(() => {
    resetdeletelist();
  }, [history]);

  const handleeditingcancel = (e) => {
    if (e) e.preventDefault();
    resetdeletelist();
    setisditing(false);
    setcheckboxvisible(false);
  };
  const handledeletehistory = async (id) => {
    if (id) {
      if(!localStorage.getItem("isshowonedeletehistorypopup")){

        const isconfirm = await showConfirmation(
          "Are you sure ?",
          "we ensure you carefully choose to delete it if action is deleted then you can not backup this file .",
          "isshowonedeletehistorypopup"
        );
        if (!isconfirm) return;
      }
      setline(90,true)
      const response = await deleteDocuments(
        [{ id: id, selected: true }],
        "h",
        setline
      );
      if (response.success) {
        sethistory((pre) => pre.filter((doc) => doc.id !== id));
        showToast.success("history deleted succesfully");
        handleeditingcancel();
        setline(0);
        return;
      } else {
        showToast.error(response.message);
        handleeditingcancel();
        setline(0);
        return;
      }
    }
    if (finaldeletelist?.length === 0) {
      showToast.error("select atleast one to delete");
      return;
    }
    if(!localStorage.getItem("isshowmultipledeletehistorypopup")){

      const isconfirm = await showConfirmation(
        "Are you sure ?",
        "your cant rollback your deleted file if history is deleted",
        "isshowmultipledeletehistorypopup"
      );
      if (!isconfirm) return;
    }
    const response = await deleteDocuments(finaldeletelist, "h", setline);
    if (response.success) {
      sethistory((pre) =>
        pre?.filter((his) => !finaldeletelist.some((doc) => doc.id === his.id))
      );
      showToast.success(response.message);
      handleeditingcancel();
      setline(0);
      return;
    } else {
      showToast.error(response.message);
      handleeditingcancel();
    }

    setline(0);
    handleeditingcancel();
  };

  return (
    <div className="documents-container dashboardsection-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Document History</h2>
        {isaditing && (
          <span className="checkbox-span">
            <input
              checked={
                finaldeletelist?.length === 0
                  ? false
                  : finaldeletelist?.length === deletelist?.length && true
              }
              title="select all"
              onChange={(e) => {
                if (e.target.checked) {
                  setdeletelist((pre) =>
                    pre?.map((one) => ({ ...one, selected: true }))
                  );
                } else
                  setdeletelist((pre) =>
                    pre?.map((one) => ({ ...one, selected: false }))
                  );
              }}
              className="checkbox-input"
              type="checkbox"
            />
          </span>
        )}
      </div>
      {isaditing ? (
        <div
          style={{
            padding: "10px 2px",
            display: "flex",
            gap: "20px",
            justifyContent: "flex-end",
          }}
        >
          <button className="selector" onClick={handleeditingcancel}>
            cencel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handledeletehistory();
            }}
            title="Delete"
            className="edit-btn"
          >
            {" "}
            Delete {finaldeletelist.length}
          </button>
        </div>
      ) : (
        <p className="documents-subtitle subtitle">
          Recent activities on your documents
        </p>
      )}
      <div className="documents-list">
        {!history && (
          <div
            style={{
              flex: "1",
              margin: "auto",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            Loading history...
          </div>
        )}
        {history.length === 0 ? (
          <NoticePage
            heading="NO HISTORY YET !"
            description={
              "Learn about how history works. it will be benificial for you"
            }
            links={[
              {
                redirecturl: `${BASE_URL}/documentation#version-history`,
                text: "History Documentation",
              },
            ]}
          />
        ) : (
          history?.map((item, index) => (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                if (checkboxvisible) return;
                handlePressStart(e, item.id);
              }}
              onMouseUp={handlePressEnd}
              // onMouseLeave={handlePressEnd}
              onTouchStart={(e) => {
                if (checkboxvisible) return;
                e.stopPropagation();
                handlePressStart(e, item.id);
              }}
              onTouchEnd={handlePressEnd}
              key={item.id}
              id={item.id}
              className="document-item"
            >
              <div className="document-info">
                {getFileIcon(item.name, item.fileType)}
                <div className="document-details">
                  <div className="document-name">{item.name}</div>
                  <div className="document-meta">
                    <span className="document-date">
                      <FaCalendarAlt className="meta-icon" />
                      {formatDate(item.timestamp)} at{" "}
                      {formatTime(item.timestamp)}
                    </span>
                    <span className="document-size">
                      {/* <FaClock className="meta-icon" /> */}
                      {item.action}
                    </span>
                  </div>
                </div>
              </div>
              <div className="document-actions">
                <div className="action-div">
                  {checkboxvisible && (
                    <>
                      <span className="checkbox-span">
                        <input
                          checked={deletelist[index].selected}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              addindeletelist(item.id);
                            } else {
                              removefromdeletelist(item.id);
                            }
                          }}
                          className="checkbox-input"
                          type="checkbox"
                        />
                      </span>
                    </>
                  )}

                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handledeletehistory(item.id);
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
