"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
import {
  ScatterChart, Scatter, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  Cell, Legend,
} from "recharts";
import API_URL from "../../../lib/api";

const MODEL_COLORS = { "Linear Regression": "#6366f1", "Random Forest": "#10b981", "XGBoost": "#f59e0b" };
const BAR_COLORS   = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16","#f97316","#6366f1"];

function StatCard({ label, value, sub, color = "blue" }) {
  const map = {
    blue:   "bg-blue-50   border-blue-100   text-blue-700",
    green:  "bg-green-50  border-green-100  text-green-700",
    amber:  "bg-amber-50  border-amber-100  text-amber-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${map[color]}`}>
      <p className="text-xs uppercase tracking-wider opacity-60 font-semibold mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

const fmt = (v) => `$${(v / 1000).toFixed(0)}k`;

export default function MetricsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const token = Cookies.get("auth-token");
    if (!token) { router.replace("/login"); return; }
    axios
      .get(`${API_URL}/metrics`, { headers: { Authorization: `Bearer ${token}` , "ngrok-skip-browser-warning": "true"} })
      .then((res) => setMetrics(res.data))
      .catch(() => setError("Failed to load metrics. Make sure the FastAPI server is running."))
      .finally(() => setLoading(false));
  }, [router]);

  const scatterData   = metrics?.actual_vs_pred?.slice(0, 150) ?? [];
  const residualData  = metrics?.residuals?.slice(0, 150).map((r, i) => ({ index: i, residual: r })) ?? [];
  const coeffData     = metrics?.coefficients?.slice(0, 12).map((c) => ({
    feature: c.feature, coef: parseFloat(c.coefficient.toFixed(4)),
  })) ?? [];
  const modelCompData = metrics?.all_model_metrics?.map((m) => ({
    model: m.model, R2: parseFloat((m.r2_score * 100).toFixed(1)),
    MAPE: parseFloat(m.mape.toFixed(1)),
    MAE: Math.round(m.mae),
  })) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white text-sm">🏠</span>
          </div>
          <span className="text-base font-bold text-gray-900">Austin House Predictor</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Dashboard</Link>
          <Link href="/predict"   className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Predict</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-blue-600 text-sm font-medium mb-1">Live from MongoDB</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Model Performance</h1>
          <p className="text-gray-500">Regression metrics — R², MAE, RMSE — for all 3 trained models.</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-400 text-sm py-24 justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Fetching metrics from server...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {metrics && (
          <>
            {/* Dataset info strip */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm flex flex-wrap gap-6 text-sm">
              {[
                { label: "Models", value: metrics.model_name },
                { label: "Best Model", value: metrics.best_model },
                { label: "Dataset", value: metrics.dataset },
                { label: "Train Samples", value: metrics.train_size?.toLocaleString() },
                { label: "Test Samples", value: metrics.test_size?.toLocaleString() },
                { label: "Features", value: metrics.feature_count },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className="font-bold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Best model stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="R² Score"  value={metrics.best_metrics.r2_score.toFixed(3)} sub="Higher is better" color="blue" />
              <StatCard label="MAE"       value={`$${Math.round(metrics.best_metrics.mae).toLocaleString()}`} sub="Mean Abs Error" color="green" />
              <StatCard label="RMSE"      value={`$${Math.round(metrics.best_metrics.rmse).toLocaleString()}`} sub="Root Mean Sq Error" color="amber" />
              <StatCard label="MAPE"      value={`${metrics.best_metrics.mape.toFixed(1)}%`} sub="Mean Abs % Error" color="purple" />
            </div>

            {/* Model Comparison Bar Charts */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">Model Comparison</h2>
              <p className="text-xs text-gray-400 mb-5">Linear Regression vs Random Forest vs XGBoost</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "R2", label: "R² Score (%)", unit: "%", color: "#3b82f6" },
                  { key: "MAPE", label: "MAPE (%) — lower better", unit: "%", color: "#f59e0b" },
                  { key: "MAE", label: "MAE ($) — lower better", unit: "", color: "#10b981", dollar: true },
                ].map(({ key, label, color, dollar }) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-gray-500 mb-3">{label}</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={modelCompData} layout="vertical" margin={{ left: 80, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }}
                          tickFormatter={dollar ? (v) => `$${(v/1000).toFixed(0)}k` : undefined} />
                        <YAxis type="category" dataKey="model" tick={{ fontSize: 10 }} width={75} />
                        <Tooltip formatter={(v) => dollar ? `$${v.toLocaleString()}` : `${v}%`} />
                        <Bar dataKey={key} fill={color} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>

            {/* Actual vs Predicted + Residuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-1">Actual vs Predicted</h2>
                <p className="text-xs text-gray-400 mb-4">Points on the diagonal = perfect prediction</p>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="actual"    name="Actual"    tickFormatter={fmt} tick={{ fontSize: 10 }} label={{ value: "Actual ($)", position: "insideBottom", offset: -10, fontSize: 11 }} />
                    <YAxis dataKey="predicted" name="Predicted" tickFormatter={fmt} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                    <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.55} r={3} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-1">Residual Plot</h2>
                <p className="text-xs text-gray-400 mb-4">Errors scattered around 0 = no systematic bias</p>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="index"    name="Sample" tick={{ fontSize: 10 }} label={{ value: "Sample Index", position: "insideBottom", offset: -10, fontSize: 11 }} />
                    <YAxis dataKey="residual" name="Residual ($)" tickFormatter={fmt} tick={{ fontSize: 10 }} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Tooltip formatter={(v, n) => n === "Residual ($)" ? `$${v.toLocaleString()}` : v} />
                    <Scatter data={residualData} fill="#f59e0b" fillOpacity={0.55} r={3} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Coefficients (Linear Regression) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">Feature Coefficients</h2>
              <p className="text-xs text-gray-400 mb-5">From Linear Regression — in log-price space. Blue = positive impact, Red = negative.</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={coeffData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={115} />
                  <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1} />
                  <Tooltip formatter={(v) => v.toFixed(4)} />
                  <Bar dataKey="coef" name="Coefficient" radius={[0, 4, 4, 0]}>
                    {coeffData.map((entry, i) => (
                      <Cell key={i} fill={entry.coef >= 0 ? "#3b82f6" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  );
}