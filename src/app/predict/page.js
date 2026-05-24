"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
import API_URL from "../../../lib/api";

const AUSTIN_ZIPS = [
  "78701","78702","78703","78704","78705","78712","78717","78719",
  "78721","78722","78723","78724","78725","78726","78727","78728",
  "78729","78730","78731","78732","78733","78734","78735","78736",
  "78737","78738","78739","78741","78742","78744","78745","78746",
  "78747","78748","78749","78750","78751","78752","78753","78754",
  "78756","78757","78758","78759",
];

// Property types present in the training dataset
const PROPERTY_TYPES = ["Single-family", "Condo", "Townhome", "Multi-family"];

const MODELS = [
  { value: "xgb", label: "XGBoost", desc: "Best accuracy", badge: "⭐ Recommended" },
  { value: "rf",  label: "Random Forest", desc: "Robust ensemble", badge: "" },
  { value: "lr",  label: "Linear Regression", desc: "Fast & interpretable", badge: "" },
];

// Min/max derived from training data (redfin_house_details.csv, after IQR cleaning)
const FIELD_LIMITS = {
  beds:          { min: 1,    max: 8,      step: 1    },
  baths:         { min: 1,    max: 6,      step: 0.5  },
  sqft:          { min: 362,  max: 4276,   step: 1    },
  year_built:    { min: 1916, max: 2027,   step: 1    },
  lot_size_sqft: { min: 0,    max: 18971,  step: 1    },
  parking_spaces:{ min: 0,    max: 18,     step: 1    },
};

const defaultValues = {
  beds: 3, baths: 2, sqft: 1800, year_built: 2005,
  lot_size_sqft: 6000, parking_spaces: 2,
  property_type: "Single-family", zip_code: "78704",
};

const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

function NumericField({ name, label, placeholder, formData, warnings, onChange }) {
  const { min, max, step } = FIELD_LIMITS[name];
  return (
    <div>
      <label className={labelClass}>
        {label}
        <span className="ml-1.5 text-xs text-gray-400 font-normal">
          ({min.toLocaleString()}–{max.toLocaleString()})
        </span>
      </label>
      <input
        type="number"
        name={name}
        value={formData[name]}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={`${inputClass} ${warnings[name] ? "border-amber-400 focus:ring-amber-400" : ""}`}
        required
      />
      {warnings[name] && (
        <p className="mt-1 text-xs text-amber-600">{warnings[name]}</p>
      )}
    </div>
  );
}

export default function PredictPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultValues);
  const [modelChoice, setModelChoice] = useState("xgb");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    const token = Cookies.get("auth-token");
    if (!token) router.replace("/login");
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const numVal = type === "number" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: numVal }));

    // Show out-of-range warning for numeric fields
    if (type === "number" && FIELD_LIMITS[name]) {
      const { min, max } = FIELD_LIMITS[name];
      const n = Number(value);
      if (n < min || n > max) {
        setWarnings((prev) => ({
          ...prev,
          [name]: `Training data range: ${min.toLocaleString()} – ${max.toLocaleString()}. Values outside this range may reduce accuracy.`,
        }));
      } else {
        setWarnings((prev) => { const w = { ...prev }; delete w[name]; return w; });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const token = Cookies.get("auth-token");
    try {
      const res = await axios.post(
        `${API_URL}/predict?model_choice=${modelChoice}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` ,"ngrok-skip-browser-warning": "true"} }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/metrics" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Metrics</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-blue-600 text-sm font-medium mb-1">AI Price Engine</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Predict House Price</h1>
          <p className="text-gray-500">Enter property details and get an instant estimate from your chosen ML model.</p>
        </div>

        {/* Model Selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">Choose Model</p>
          <div className="grid grid-cols-3 gap-3">
            {MODELS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setModelChoice(m.value)}
                className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                  modelChoice === m.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                {m.badge && (
                  <span className="absolute -top-2 -right-1 text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {m.badge}
                  </span>
                )}
                <p className={`font-bold text-sm ${modelChoice === m.value ? "text-blue-700" : "text-gray-700"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Estimated Market Price</p>
                <p className="text-4xl font-black text-green-700">
                  ${result.predicted_price?.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Predicted at {new Date(result.predicted_at).toLocaleTimeString()} · Model:{" "}
                  {MODELS.find((m) => m.value === modelChoice)?.label}
                </p>
              </div>
              <div className="text-6xl">🏡</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Basics */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <NumericField name="beds"           label="Bedrooms"          formData={formData} warnings={warnings} onChange={handleChange} />
              <NumericField name="baths"          label="Bathrooms"         formData={formData} warnings={warnings} onChange={handleChange} />
              <NumericField name="sqft"           label="Living Area (sq ft)" formData={formData} warnings={warnings} onChange={handleChange} />
              <NumericField name="year_built"     label="Year Built"        formData={formData} warnings={warnings} onChange={handleChange} />
              <NumericField name="lot_size_sqft"  label="Lot Size (sq ft)"  formData={formData} warnings={warnings} onChange={handleChange} placeholder="0 if condo" />
              <NumericField name="parking_spaces" label="Parking Spaces"    formData={formData} warnings={warnings} onChange={handleChange} />
            </div>
          </div>

          {/* Property Type & ZIP */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Location & Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Property Type</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange}
                  className={inputClass}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>ZIP Code (Austin TX)</label>
                <select name="zip_code" value={formData.zip_code} onChange={handleChange}
                  className={inputClass}>
                  {AUSTIN_ZIPS.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating price...
              </>
            ) : (
              "Get Price Estimate →"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}