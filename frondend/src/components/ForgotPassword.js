import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";

const ForgotPassword = () => {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [step, setStep] = useState(1); // 1: Request token, 2: Reset password
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        // Trigger animation after component mounts
        setTimeout(() => {
            setAnimateForm(true);
        }, 100);
    }, []);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const res = await authAPI.forgotPassword(username);

            // In a real app, we would send an email with a reset link
            // For this demo, we'll just move to step 2 and use the token from response
            if (res.data.success) {
                setSuccessMessage("Reset instructions sent. Check your email or use the token below.");
                if (res.data.resetToken) {
                    setResetToken(res.data.resetToken);
                }
                setTimeout(() => {
                    setStep(2);
                    setIsLoading(false);
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.response?.data?.message || "Failed to request password reset");
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await authAPI.resetPassword(resetToken, newPassword);

            if (res.data.success) {
                setSuccessMessage("Password reset successful!");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.response?.data?.message || "Failed to reset password");
            setIsLoading(false);
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
                    <h1>{step === 1 ? "Forgot Password" : "Reset Password"}</h1>
                    <p>{step === 1 ? "Enter your username to reset password" : "Enter your new password"}</p>
                </div>

                {step === 1 ? (
                    <form className="login-form" onSubmit={handleRequestReset}>
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                        {successMessage && (
                            <div className="alert alert-success" role="alert">
                                {successMessage}
                            </div>
                        )}

                        <div className="form-floating mb-4">
                            <input
                                type="text"
                                className="form-control"
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
                                    <span className="button-text">Request Reset</span>
                                    <span className="button-icon">
                                        <i className="fas fa-paper-plane"></i>
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleResetPassword}>
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                        {successMessage && (
                            <div className="alert alert-success" role="alert">
                                {successMessage}
                            </div>
                        )}

                        <div className="form-floating mb-4">
                            <input
                                type="text"
                                className="form-control"
                                id="resetToken"
                                placeholder="Reset Token"
                                value={resetToken}
                                onChange={(e) => setResetToken(e.target.value)}
                                required
                            />
                            <label htmlFor="resetToken">
                                <i className="fas fa-key"></i> Reset Token
                            </label>
                            <div className="input-focus-effect"></div>
                        </div>

                        <div className="form-floating mb-4 password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="newPassword"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="newPassword">
                                <i className="fas fa-lock"></i> New Password
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

                        <div className="form-floating mb-4 password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="confirmPassword"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="confirmPassword">
                                <i className="fas fa-lock"></i> Confirm New Password
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
                                    <span className="button-text">Reset Password</span>
                                    <span className="button-icon">
                                        <i className="fas fa-save"></i>
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <p><a href="/">Back to Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 