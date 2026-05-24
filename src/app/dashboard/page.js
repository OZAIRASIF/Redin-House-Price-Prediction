"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
import API_URL from "../../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("auth-token");
    if (!token) { router.replace("/login"); return; }
    setUsername(Cookies.get("username") || "User");
    axios
      .get(`${API_URL}/predictions/history`, {
        headers: { Authorization: `Bearer ${token}` ,
      "ngrok-skip-browser-warning": "true"},
        
      })
      .then((res) => setHistory(res.data?.predictions || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("auth-token");
    Cookies.remove("username");
    Cookies.remove("userId");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">🏠</span>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">Austin House Predictor</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/predict" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium">
            Predict
          </Link>
          <Link href="/metrics" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium">
            Metrics
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-100 transition font-medium border border-red-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Hero */}
        <div className="mb-10">
          <p className="text-blue-600 font-medium text-sm mb-1">Welcome back 👋</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">{username}</h1>
          <p className="text-gray-500 text-base">
            Predict Austin house prices using Linear Regression, Random Forest, and XGBoost.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/predict">
            <div className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-7 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="text-4xl mb-4">🏡</div>
                <h2 className="text-xl font-bold mb-2">Predict House Price</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Enter property details — beds, baths, sqft, ZIP — and get an instant price estimate from 3 ML models.
                </p>
                <div className="mt-5 text-sm font-semibold bg-white/20 inline-flex items-center gap-1 px-4 py-1.5 rounded-full group-hover:bg-white/30 transition">
                  Start Predicting →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/metrics">
            <div className="group bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Model Performance</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Compare R², MAE, RMSE across all 3 models. View actual vs predicted scatter, residuals, and feature coefficients.
              </p>
              <div className="mt-5 text-sm font-semibold text-blue-600 bg-blue-50 inline-flex items-center gap-1 px-4 py-1.5 rounded-full group-hover:bg-blue-100 transition">
                View Charts →
              </div>
            </div>
          </Link>
        </div>

        {/* Model Info Strip */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">About This Model</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Models", value: "LR · RF · XGBoost", icon: "🤖" },
              { label: "Dataset", value: "Redfin Austin TX", icon: "📍" },
              { label: "Task", value: "Regression", icon: "📈" },
              { label: "Features", value: "20 Engineered", icon: "⚙️" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg mb-1">{item.icon}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Predictions</h2>
            <Link href="/predict" className="text-xs text-blue-600 hover:underline font-medium">
              + New prediction
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🏠</div>
              <p className="text-sm font-medium text-gray-500">No predictions yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Your prediction history will appear here</p>
              <Link href="/predict" className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium">
                Make your first prediction
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Predicted Price</th>
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Model</th>
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Beds</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((item, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition last:border-0">
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-green-700 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm">
                          ${item.predicted_price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          {item.model_used ?? "XGBoost"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{item.input_data?.beds ?? "—"}</td>
                      <td className="py-3 text-gray-700">{item.input_data?.sqft?.toLocaleString() ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}