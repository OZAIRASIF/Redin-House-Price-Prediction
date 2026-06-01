"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import API_URL from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(res.data.msg);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.detail || "❌ Error sending OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      });
      setMessage("✅ " + res.data.msg);
    } catch (err) {
      setMessage(err.response?.data?.detail || "❌ Error resetting password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {step === 1 ? "We'll send a one-time code to your email" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-400"
              }`}>
                {s}
              </div>
              {s < 2 && <div className={`w-10 h-0.5 rounded ${step > s ? "bg-blue-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-100/50 border border-white/60 p-8">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-400 text-sm transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.01] transition-all duration-200"
              >
                Send OTP →
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">One-Time Password</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-400 text-sm tracking-widest transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Min 8 chars + 1 special character"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-400 text-sm transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.01] transition-all duration-200"
              >
                Reset Password →
              </button>
            </form>
          )}

          {message && (
            <div className={`mt-4 text-center text-sm px-4 py-2.5 rounded-xl font-medium ${
              message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Austin House Predictor
        </p>
      </div>
    </div>
  );
}