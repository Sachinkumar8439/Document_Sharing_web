import React from "react";
import {FaCalendarAlt ,

} from "react-icons/fa";
import { useAppState } from "../Context/AppStateContext";
import { getFileIcon } from "../utility/util";

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
  const { history } = useAppState();

  return (
    <div className="documents-container">
      <h2>Document History</h2>
      <p className="documents-subtitle">Recent activities on your documents</p>

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
        {history?.map((item) => (
          <div key={item.id} className="document-item">
            <div className="document-info">
              {getFileIcon(item.name, item.fileType)}
              <div className="document-details">
                <div className="document-name">{item.name}</div>
                <div className="document-meta">
                  <span className="document-date">
                    <FaCalendarAlt className="meta-icon" />
                    {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                  </span>
                  <span className="document-size">
                    {/* <FaClock className="meta-icon" /> */}
                    {item.action}
                  </span>
                </div>
              </div>
            </div>
            {/* No action buttons here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
