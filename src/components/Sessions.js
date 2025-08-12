import React, { useState, useEffect } from 'react';
import './sessions.css';
import { useAuthState } from '../Context/Authcontext';
import { appwriteAuth } from '../Auth/appwriteauth';
import { useAppState } from '../Context/AppStateContext';

const UserSessionsModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const { sessions, setsessions } = useAuthState();
  const {setline, showConfirmation,showToast} = useAppState()

  useEffect(() => {
    if(sessions?.total >1){

        const sortedSessions = [...sessions.sessions].sort((a, b) => 
            b.current - a.current
    );
    setsessions(pre=> ({...pre , sessions:sortedSessions}))
    setLoading(false)
}else{
    setLoading(false)
}

  }, []);

  const handleLogoutSession = async (sessionId) => {
    // In a real app, you would call your API to terminate this session
    const isdo = await showConfirmation("Are you sure \n the account on reference device will be logged out")
    if(!isdo) return
    console.log('Logging out session:', sessionId);
    await setline(85,false)
    const response = await appwriteAuth.deleteSession(sessionId);
    if(response.success){
        const updatedSessions = sessions.sessions.filter(session => session.$id !== sessionId);
        setsessions({total:sessions.total-1, sessions:updatedSessions})
        showToast.success(response.message);
    }else{
        showToast.error(response.message)
    }
    setline(0)
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
  };

  return (
    <div 
      className="user-sessions-modal-container" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="user-sessions-modal">
        <h2 className="user-sessions-modal-title">Active Sessions</h2>
        
        {loading ? (
          <div className="user-sessions-loading">Loading sessions...</div>
        ) : sessions?.sessions?.length > 0 ? (
          <>
            <ul className="user-sessions-list">
              {sessions.sessions.map(session => (
                <li 
                  key={session.$id} 
                  className={`user-session-item ${session.current ? 'active' : ''}`}
                >
                  <div className="user-session-header">
                    <h3 className={`user-session-title ${session.current ? 'active' : ''}`}>
                      {session.deviceName || 'Unknown Device'}
                      {session.current && <span className="active-session-badge">Current</span>}
                    </h3>
                    {!session.current && (
                      <button 
                        className="user-sessions-button danger" 
                        onClick={() => handleLogoutSession(session.$id)}
                      >
                        Log Out
                      </button>
                    )}
                  </div>
                  
                  <div className="user-session-meta">
                    {session.countryName && (
                      <div className="user-session-meta-row">
                        {/* <span className="user-session-meta-label">Location:</span> */}
                        <span className={`user-session-meta-value ${session.current ? 'active' : ''}`}>
                          {session.countryName}
                        </span>
                      </div>
                    )}
                    <div className="user-session-meta-row">
                      {/* <span className="user-session-meta-label">Logged in:</span> */}
                      <span className={`user-session-meta-value ${session.current ? 'active' : ''}`}>
                        {formatDate(session.$createdAt)} ({formatTimeAgo(session.$createdAt)})
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="user-sessions-button-group">
              <button className="user-sessions-button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="user-sessions-empty">
            <p>No active sessions found</p>
            <div className="user-sessions-button-group">
              <button className="user-sessions-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSessionsModal;