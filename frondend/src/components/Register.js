import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("candidate"); // Default role is candidate
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Validation states
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordErrors, setPasswordErrors] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Trigger animation after component mounts
        setTimeout(() => {
            setAnimateForm(true);
        }, 100);
    }, []);

    // Password validation
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            setPasswordErrors([]);
            return;
        }

        const errors = [];
        let strength = 0;

        // Check length
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        } else {
            strength += 1;
        }

        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        } else {
            strength += 1;
        }

        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        } else {
            strength += 1;
        }

        // Check for number
        if (!/[0-9]/.test(password)) {
            errors.push("Password must contain at least one number");
        } else {
            strength += 1;
        }

        // Check for special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("Password must contain at least one special character");
        } else {
            strength += 1;
        }

        setPasswordStrength(strength);
        setPasswordErrors(errors);
    }, [password]);

    // Username uniqueness check with debounce
    useEffect(() => {
        if (!username || username.length < 3) return;

        const checkUsernameTimeout = setTimeout(async () => {
            setIsCheckingUsername(true);
            try {
                const response = await authAPI.checkUsername(username);
                if (response.data.exists) {
                    setUsernameError("Username already exists");
                } else {
                    setUsernameError("");
                }
            } catch (error) {
                console.error("Error checking username:", error);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 600);

        return () => clearTimeout(checkUsernameTimeout);
    }, [username]);

    // Email uniqueness check with debounce
    useEffect(() => {
        if (!email || !isValidEmail(email)) return;

        const checkEmailTimeout = setTimeout(async () => {
            setIsCheckingEmail(true);
            try {
                const response = await authAPI.checkEmail(email);
                if (response.data.exists) {
                    setEmailError("Email already exists");
                } else {
                    setEmailError("");
                }
            } catch (error) {
                console.error("Error checking email:", error);
            } finally {
                setIsCheckingEmail(false);
            }
        }, 600);

        return () => clearTimeout(checkEmailTimeout);
    }, [email]);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const getPasswordStrengthClass = () => {
        if (passwordStrength === 0) return "";
        if (passwordStrength < 3) return "weak";
        if (passwordStrength < 5) return "medium";
        return "strong";
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength === 0) return "";
        if (passwordStrength < 3) return "Weak";
        if (passwordStrength < 5) return "Medium";
        return "Strong";
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        // Check for validation errors
        if (usernameError || emailError) {
            setErrorMessage(usernameError || emailError);
            setIsLoading(false);
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // Validate password complexity
        if (passwordErrors.length > 0) {
            setErrorMessage(passwordErrors[0]);
            setIsLoading(false);
            return;
        }

        try {
            const userData = { username, password, email, role };
            const res = await authAPI.register(userData);

            if (res.data.success) {
                // Show success animation
                document.querySelector('.login-form').classList.add('success');

                setTimeout(() => {
                    // Redirect to login page
                    navigate("/");
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            // Show error animation
            document.querySelector('.login-form').classList.add('error');
            setTimeout(() => {
                document.querySelector('.login-form').classList.remove('error');
                setErrorMessage(err.response?.data?.message || "Registration failed. Please try again.");
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
                    <h1>Create Account</h1>
                    <p>Register to access the interview platform</p>
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <div className="form-floating mb-4">
                        <input
                            type="text"
                            className={`form-control ${usernameError ? 'is-invalid' : ''}`}
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="username">
                            <i className="fas fa-user"></i> Username
                        </label>
                        <div className="input-focus-effect"></div>
                        {isCheckingUsername && <div className="spinner-border spinner-border-sm text-primary check-spinner" role="status"></div>}
                        {usernameError && <div className="invalid-feedback">{usernameError}</div>}
                    </div>

                    <div className="form-floating mb-4">
                        <input
                            type="email"
                            className={`form-control ${emailError ? 'is-invalid' : ''}`}
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="email">
                            <i className="fas fa-envelope"></i> Email
                        </label>
                        <div className="input-focus-effect"></div>
                        {isCheckingEmail && <div className="spinner-border spinner-border-sm text-primary check-spinner" role="status"></div>}
                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                    </div>

                    <div className="form-floating mb-3 password-container">
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

                    {password && (
                        <div className="mb-4">
                            <div className="password-strength-meter mb-2">
                                <div className={`strength-bar ${getPasswordStrengthClass()}`} style={{ width: `${passwordStrength * 20}%` }}></div>
                            </div>
                            <div className="password-strength-label">
                                Strength: <span className={`text-${getPasswordStrengthClass()}`}>{getPasswordStrengthLabel()}</span>
                            </div>
                            {passwordErrors.length > 0 && (
                                <div className="password-requirements mt-2">
                                    <small className="text-muted">Requirements:</small>
                                    <ul className="small text-muted ps-3 mb-0 mt-1">
                                        {passwordErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-floating mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control ${confirmPassword && password !== confirmPassword ? 'is-invalid' : ''}`}
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="confirmPassword">
                            <i className="fas fa-lock"></i> Confirm Password
                        </label>
                        <div className="input-focus-effect"></div>
                        {confirmPassword && password !== confirmPassword &&
                            <div className="invalid-feedback">Passwords do not match</div>
                        }
                    </div>

                    <div className="form-floating mb-4">
                        <select
                            className="form-select"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="candidate">Candidate</option>
                            <option value="admin">Admin/HR</option>
                        </select>
                        <label htmlFor="role">
                            <i className="fas fa-user-tag"></i> Account Type
                        </label>
                        <div className="input-focus-effect"></div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading || usernameError || emailError || passwordErrors.length > 0 || (confirmPassword && password !== confirmPassword)}
                    >
                        {isLoading ? (
                            <div className="spinner">
                                <div className="bounce1"></div>
                                <div className="bounce2"></div>
                                <div className="bounce3"></div>
                            </div>
                        ) : (
                            <>
                                <span className="button-text">Register</span>
                                <span className="button-icon">
                                    <i className="fas fa-user-plus"></i>
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Already have an account? <a href="/">Sign In</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register; 