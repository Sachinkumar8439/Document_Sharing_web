import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appwriteAuth } from '../Auth/appwriteauth';
import { useAppState } from '../Context/AppStateContext';
import "./verify.css"

const Verify = () => {
  const [message, setMessage] = useState('Verifying...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {showToast} = useAppState()

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      appwriteAuth.confirmVerification(userId, secret).then(res => {
        setMessage(res.message);
        showToast.success("Redirecting to Sign In ....");
        appwriteAuth.logout();
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      });
    } else {
      setMessage("Invalid verification link.");
      showToast.error("Ensure You Entered The Correct Email");
      appwriteAuth.logout();

    }
  }, [searchParams]);

  return (
    <div className="verify-container">
  <div className={`verify-card ${message.includes('Invalid') ? 'error' : 'success'}`}>
    <h2>Email Verification</h2>
    <p>{message}</p>
    {message === 'Verifying...' && <div className="verify-loading"></div>}
  </div>
</div>
  );
};

export default Verify;
