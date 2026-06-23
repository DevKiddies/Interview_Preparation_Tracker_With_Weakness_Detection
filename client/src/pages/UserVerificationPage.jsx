import React, { useState, useRef } from 'react';
import {useNavigate} from "react-router-dom";
import API_BASE from "../utils/api.js";

const UserVerificationPage = () => {
    const length = 6;
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (isNaN(pastedData) || pastedData.length !== length) return;

        setOtp(pastedData.split(""));
        inputRefs.current[length - 1].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join("");

        if (finalOtp.length !== length) {
            alert("Please enter a valid 6-digit code.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp: finalOtp }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                navigate("/onboarding");
            } else {
                const message = await response.text();
                alert(message || "Invalid OTP. Please try again.");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        alert("A new 6-digit verification code has been sent!");
        setOtp(new Array(length).fill(""));
        inputRefs.current[0].focus();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl sm:px-10 text-center transition-colors duration-200">

                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Security Verification
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 mb-8">
                        We sent a 6-digit confirmation code to your device. Please enter it below.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-2 sm:gap-3 justify-center items-center">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={data}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    onFocus={(e) => e.target.select()}
                                    disabled={loading}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder-gray-400 disabled:opacity-50"
                                />
                            ))}
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    "Verify Account"
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-xs text-gray-400 dark:text-slate-500">
                        Didn't receive code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none disabled:text-gray-400 disabled:no-underline"
                        >
                            Resend code
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default UserVerificationPage;
