"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">🏠</span>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">Austin House Predictor</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium"
        >
          Login
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Powered by Linear Regression · Random Forest · XGBoost
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-5 max-w-3xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Austin House Predictor
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          Instantly estimate Austin, TX property prices using 3 powerful machine learning models.
          Just enter a few details and get a smart price prediction in seconds.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-blue-300 hover:scale-105 transition-all duration-200"
        >
          Get Started →
        </button>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14">
          {[
            { icon: "🏡", label: "Instant Price Estimates" },
            { icon: "📊", label: "Model Performance Metrics" },
            { icon: "📍", label: "Austin TX Dataset" },
            { icon: "🔒", label: "Secure & Private" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 bg-white border border-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg w-full">
          {[
            { value: "3", label: "ML Models" },
            { value: "20+", label: "Features" },
            { value: "Austin TX", label: "Coverage" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-2xl font-black text-blue-600">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        © {new Date().getFullYear()} Austin House Predictor · Built with Next.js & ML
      </footer>
    </div>
  );
}