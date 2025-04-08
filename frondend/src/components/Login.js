import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";

const Login = ({ setAuth, setRole }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleState] = useState("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateForm(true);
    }, 100);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await authAPI.login(identifier, password, role);

      if (res.data.success) {
        // Show success animation
        document.querySelector('.login-form').classList.add('success');

        // Store token and role in localStorage
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        localStorage.setItem('userRole', res.data.role);
        localStorage.setItem('username', res.data.username || identifier); // Store username for profile display

        setTimeout(() => {
          // Update authentication state
          setAuth(true);
          setRole(res.data.role);

          // Redirect based on role
          if (res.data.role === 'admin') {
            navigate('/admin');
          } else {
            // Redirect to dashboard instead of interview
            navigate('/dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      // Show error animation
      document.querySelector('.login-form').classList.add('error');
      setTimeout(() => {
        document.querySelector('.login-form').classList.remove('error');
        setErrorMessage(err.response?.data?.message || "Invalid credentials");
        setIsLoading(false);
      }, 500);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        <div className="shape shape4"></div>
      </div>

      <div className={`login-card ${animateForm ? 'animate' : ''}`}>
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="form-floating mb-4">
            <input
              type="text"
              className="form-control"
              id="identifier"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <label htmlFor="identifier">
              <i className="fas fa-user"></i> Username or Email
            </label>
            <div className="input-focus-effect"></div>
          </div>

          <div className="form-floating mb-4 password-container">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            <div className="input-focus-effect"></div>
          </div>

          <div className="form-floating mb-4">
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="candidate">Candidate</option>
              <option value="admin">HR/Admin</option>
            </select>
            <label htmlFor="role">
              <i className="fas fa-user-tag"></i> Login As
            </label>
            <div className="input-focus-effect"></div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
              </div>
            ) : (
              <>
                <span className="button-text">Login</span>
                <span className="button-icon">
                  <i className="fas fa-arrow-right"></i>
                </span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register</a></p>
          <p><a href="/forgot-password">Forgot Password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
