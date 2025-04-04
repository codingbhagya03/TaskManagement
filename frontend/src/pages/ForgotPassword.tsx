import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [errors, setErrors] = useState<{ 
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const navigate = useNavigate();

  const validateEmail = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateOtp = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
      isValid = false;
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePassword = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'otp':
        setOtp(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    // Clear error when field is edited
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/auth/send-reset-otp", 
        { email }, 
        { withCredentials: true }
      );
      
      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (error: any) {
      console.error("Send OTP Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/auth/verify-reset-otp", // Fixed URL - removed "..." 
        { email, otp }, 
        { withCredentials: true }
      );
      
      toast.success("OTP verified successfully!");
      setStep("password");
    } catch (error: any) {
      console.error("Verify OTP Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/auth/reset-password-with-otp", 
        { email, otp, newPassword }, 
        { withCredentials: true }
      );
      
      toast.success("Password reset successfully!");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("Reset Password Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailForm = () => (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-border'} bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors`}
          disabled={isLoading}
        />
        {errors.email && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            {errors.email}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending OTP...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>
      </div>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-medium">
          Enter OTP
        </label>
        <p className="text-sm text-muted-foreground mb-2">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
        <input
          id="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => handleInputChange('otp', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.otp ? 'border-red-500' : 'border-border'} bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors`}
          disabled={isLoading}
          maxLength={6}
        />
        {errors.otp && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            {errors.otp}
          </div>
        )}
      </div>

      <div className="pt-2 space-y-3">
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-center text-sm text-yellow-500 hover:text-yellow-600 transition-colors"
        >
          Change email
        </button>
        
        <button
          type="button"
          onClick={handleSendOtp}
          className="w-full text-center text-sm text-muted-foreground hover:text-gray-700 transition-colors"
          disabled={isLoading}
        >
          Didn't receive code? Resend OTP
        </button>
      </div>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-border'} bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors`}
          disabled={isLoading}
        />
        {errors.newPassword && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            {errors.newPassword}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-border'} bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors`}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            {errors.confirmPassword}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting password...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Reset your password";
      case "otp":
        return "Verify OTP";
      case "password":
        return "Set new password";
      default:
        return "Reset your password";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            TASK<span className="text-yellow-500">Y.</span>
          </h1>
          <p className="text-muted-foreground mt-2">{getStepTitle()}</p>
        </div>

        <div className="bg-card p-8 rounded-xl border border-border shadow-sm animate-fade-in">
          {step === "email" && renderEmailForm()}
          {step === "otp" && renderOtpForm()}
          {step === "password" && renderPasswordForm()}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-yellow-500 hover:text-yellow-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;