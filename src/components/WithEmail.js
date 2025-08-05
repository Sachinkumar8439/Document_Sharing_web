import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./withemail.css";
import { appwriteAuth } from "../Auth/appwriteauth";
import { useAppState } from "../Context/AppStateContext";

const SignupForm = () => {
  const {
    showToast,
    setline,
  } = useAppState();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await setline(70,true)
    
    try {
      const result = await appwriteAuth.signUp(
        formData.email,
        formData.password
      );
     await setline(90,true)
      if(result.success)
        {
          setError("if mail not arrived in 1min you can send verification again by intering correct email and password and click sendverification below")
        showToast.success(result.message);
      }
      else
      { 
        showToast.error(result.message);
      }
    } catch (err) {
      console.error("Error during registration:", err.message);
      setError(err.message);
      showToast.error(err.message);
    } finally {
      setLoading(false);
       await setline(0)
    }
  };

  return (
    <div className="main-container">

    <div className="container">
      <div className="header">
        <h1>Create Account</h1>
        <p>Join our community today</p>
      </div>

      <div className="form-container">
        <form id="signupForm" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="email-verification-container">
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="text-muted mt-3">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </p>
            
          </div>
          

          <div className="form-group mt-3">
            <button 
              type="submit" 
              id="submitBtn" 
              className="btn btn-block" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center mt-3">
            <p className="text-muted">
              Already have an account?{' '}
              <Link to="/signin" className="link">
                Sign in
              </Link>
            </p>
            <p className="text-muted">
              remain unverified email?{' '}
              <button style={{background:"none"}} className="link" onClick={async (e)=>{
                e.preventDefault();
                if(formData.email.trim() ==="" ||formData.password.trim() === ""){
                  showToast.error("Enter details to sending verification (email & password)");
                  return;
                }
                const res = await  appwriteAuth.sendemailverification(formData.email,formData.password)
                if(res.success){
                  showToast.success(res.message);
                  return;
                }
                showToast.error(res.message);
              }}>send verification</button>
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default SignupForm;