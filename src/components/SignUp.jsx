import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../images/logo_front.png";
import axios from "axios";
import "./styles.css";
import "./PaginationSlider.css";
import "./Signin.css";
import "./SignUp.css";
import { Eye, EyeOff } from "lucide-react";
import bgImage1 from "../images/values-1.png";
import bgImage2 from "../images/values-2.png";
import bgImage3 from "../images/values-3.png";

const SignUp = () => {
  const [refId, setRefId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  useEffect(() => {
    const interval = setInterval(() => {
      setSelected((prev) => (prev + 1) % 2);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSignUp = async () => {
    setIsLoading(true);
    if (error) {
      setShowError(true);
      setIsLoading(false);
      return;
    }

    if (!mobileNumber) {
      alert("Please enter a valid Mobile Number.");
      setIsLoading(false);
      return;
    }

    if (!refId) {
      alert("Please enter a valid Referral ID.");
      setIsLoading(false);
      return;
    }

    if (refId) {
      try {
        await axios.get(`https://api.leadscruise.com/api/referrals/${refId}`);
      } catch (error) {
        setIsLoading(false);
        alert(error.response?.data?.message + " -- " + "Invalid Referral ID.");
        return;
      }
    }

    try {
      const res = await axios.post("https://api.leadscruise.com/api/signup", {
        refId,
        email,
        mobileNumber,
        password,
        confPassword,
      });
      setIsLoading(false);
      alert(res.data.message);
      navigate("/"); // Redirect to SignIn page after successful signup
    } catch (error) {
      setIsLoading(false);
      alert(
        error.response.data.message || "Failed to sign up. Please try again."
      );
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (!strongPasswordRegex.test(newPassword)) {
      setShowError(true);
      setError(
        "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character."
      );
    } else {
      setError("");
      setShowError(false);
    }
  };

  return (
    <div className="signin-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
            <div className="loading-text">
              <h3>Authenticating</h3>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
            <p className="loading-message">
              Please wait while we securely sign you up
            </p>
          </div>
        </div>
      )}
      <div className="center-div">
        <div className="signin-left">
          <div className="signin-logo-class">
            <img
              src={logo}
              alt="LeadsCruise Logo"
              onClick={() => window.location.href = "https://leadscruise.com"} // Navigate to external URL
              style={{ cursor: "pointer" }} // Optional: Change cursor on hover
            />
            <div className="smart-scan" onClick={() => navigate("/")}>
              {/* <img
                src="https://previews.123rf.com/images/fokaspokas/fokaspokas1809/fokaspokas180900207/108562561-scanning-qr-code-technology-icon-white-icon-with-shadow-on-transparent-background.jpg"
                alt=""
                className="scan-icon"
              /> */}
              <img
                src="https://icons.veryicon.com/png/o/miscellaneous/esgcc-basic-icon-library/1-login.png"
                alt=""
              />
              <span>Sign In</span>
            </div>
          </div>
          <h2 className="signin-tag">Sign up</h2>
          <p className="signin-descriptor">to access Leads Cruise Home</p>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            autoComplete="email"
          />
          <input
            type="text"
            placeholder="Mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="mobile-number-input"
          />
          <div className="pass-cont">
            <input
              className="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              name="password"
              autoComplete="current-password"
              onFocus={() => setShowError(true)}
              onBlur={() => setShowError(false)}
            />

            <input
              className="password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confPassword}
              onChange={(e) => setConfPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {showError && error && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  background: "#ffdddd",
                  color: "#d9534f",
                  padding: "8px",
                  fontSize: "12px",
                  marginTop: "5px",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                }}
              >
                {error}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Refferal ID"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
          />
          <div className="terms-div">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <p className="agree">
              I agree to <span>Terms & Conditions</span>.
            </p>
          </div>
          <button
            onClick={handleSignUp}
            className={`signup-btn ${!isChecked ? "dimmed" : ""}`}
            disabled={!isChecked}
          >
            Sign Up
          </button>
          <div className="pri-cont">
            <p className="priv-p">
              By creating this account, you agree to our{" "}
              <a href="https://leadscruise.com/#faq" className="priv-link">
                Privacy Policy
              </a>{" "}
              &{" "}
              <a href="https://leadscruise.com/#faq" className="priv-link">
                Cookie Policy
              </a>.
            </p>
          </div>

          {/* <div className="signup-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Sign In</span>
          </div> */}
        </div>
        <div className="signin-right">
          <div className="banner-container">
            {/* First Banner */}
            <div
              className={`banner overlapBanner ${selected === 0 ? "active" : ""
                }`}
            >
              <div className="rightbanner">
                <div
                  className="banner1_img"
                  style={{
                    backgroundImage: `url(${bgImage1})`,
                  }}
                ></div>
                <div className="banner1_heading">
                  Intergrate AI to your Business
                </div>
                <div className="banner1_content">
                  Let our AI do all the work even while you sleep. With
                  leadscruise all the software tasks are now automated with AI
                </div>
                <a className="banner1_href" href="https://leadscruise.com" rel="noopener noreferrer">
                  Learn more
                </a>

              </div>
            </div>

            {/* Second Banner */}
            <div
              className={`banner mfa_panel ${selected === 1 ? "active" : ""}`}
            >
              <div
                className="product_img"
                style={{
                  width: "300px",
                  height: "240px",
                  margin: "auto",
                  backgroundSize: "100%",
                  backgroundRepeat: "no-repeat",
                  backgroundImage: `url(${bgImage2})`,
                }}
              ></div>
              <div className="banner1_heading">A Rocket for your Business</div>
              <div className="banner2_content">
                Get to customers within the blink of opponent's eyes,
                LeadsCruise provides 100% uptime utilising FA cloud systems
              </div>
              <a className="banner1_href" href="https://leadscruise.com" rel="noopener noreferrer">
                Learn more
              </a>
            </div>

            <div
              className={`banner taskBanner ${selected === 2 ? "active" : ""}`}
            >
              <div className="rightbanner">
                <div
                  className="banner3_img"
                  style={{
                    backgroundImage: `url(${bgImage3})`,
                  }}
                ></div>
                <div className="banner1_heading">All tasks on time</div>
                <div className="banner1_content">
                  With leadscruise all the tasks are now automated so that you
                  no more need to do them manually
                </div>
                <a className="banner1_href" href="https://leadscruise.com" rel="noopener noreferrer">
                  Learn more
                </a>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="pagination-container">
              <div
                className={`pagination-dot ${selected === 0 ? "selected" : ""}`}
              >
                <div className="progress-fill"></div>
              </div>
              <div
                className={`pagination-dot ${selected === 1 ? "selected" : ""}`}
              >
                <div className="progress-fill"></div>
              </div>
              <div
                className={`pagination-dot ${selected === 2 ? "selected" : ""}`}
              >
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
