import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppState } from "../Context/AppStateContext";
import { appwriteAuth } from "../Auth/appwriteauth";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import "./resetpasswordpage.css"

const ResetPasswordForm = () => {
  const { showToast } = useAppState();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userId] = useState(searchParams.get("userId") || null);
  const [secret] = useState(searchParams.get("secret") || null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !secret) {
      showToast.error("Invalid link for resetting password");
      setError("This link is not valid. It's structured incorrectly.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setIsUpdating(true);
      const response = await appwriteAuth.resetPassword(userId, secret, newPassword);
      if (response.success) {
        showToast.success(response.message);
        navigate("/signin");
        return;
      }
      showToast.error(response.message);
      setError(response.message);
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!userId || !secret) {
      showToast.error("Invalid Link for resetting password");
      setError("This link is not valid. It's structured incorrectly.");
    }
  }, [userId, secret]);

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit} className="reset-password-form">
        <h2><FaKey /> Reset Password</h2>

        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="toggle-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
