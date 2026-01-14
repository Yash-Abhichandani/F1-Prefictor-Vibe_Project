"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../../lib/config";
import { DRIVERS_WITH_PLACEHOLDER } from "../lib/drivers";

import ConfidenceMeter from "./ConfidenceMeter";

// Use centralized driver list
const DRIVERS = DRIVERS_WITH_PLACEHOLDER;

export default function PredictionForm({ raceId, onSuccess }: { raceId: number, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    quali_p1: "", quali_p2: "", quali_p3: "",
    race_p1: "", race_p2: "", race_p3: "",
    wild: "", flop: "", surprise: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // 1. Check Login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first!");
      setLoading(false);
      return;
    }

    // 2. Validate
    if (formData.quali_p1 === "" || formData.race_p1 === "") {
        alert("Please fill in at least the P1 predictions!");
        setLoading(false);
        return;
    }

    // 3. Send to Python Backend
    const response = await fetch(`${config.apiUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        race_id: raceId,
        quali_p1_driver: formData.quali_p1,
        quali_p2_driver: formData.quali_p2,
        quali_p3_driver: formData.quali_p3,
        race_p1_driver: formData.race_p1,
        race_p2_driver: formData.race_p2,
        race_p3_driver: formData.race_p3,
        wild_prediction: formData.wild,
        biggest_flop: formData.flop,
        biggest_surprise: formData.surprise
      }),
    });

    if (response.ok) {
      if (onSuccess) {
        onSuccess();
      } else {
        alert("✅ Predictions Submitted Successfully!");
      }
    } else {
      const errorData = await response.json();
      if (errorData.detail && errorData.detail.includes("23505")) {
        alert("⚠️ You have already submitted a prediction for this race! You cannot vote twice.");
      } else {
        alert("❌ Error: " + (errorData.detail || "Failed to save"));
      }
    }
    setLoading(false);
  };

  const DriverSelect = ({ label, value, onChange, position }: any) => (
    <div className="mb-2">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
      <div className="relative">
        <select 
            className="w-full p-3 border border-gray-700 rounded bg-[#121418] text-white focus:border-red-500 outline-none appearance-none" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
        >
            {DRIVERS.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
            ))}
        </select>
        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500 text-xs">▼</div>
      </div>
      
      {/* Confidence Meter Integration */}
      {value && value !== "" && value !== "Select Driver..." && (
        <ConfidenceMeter 
          raceId={raceId} 
          selectedDriver={value} 
          position={position} 
        />
      )}
    </div>
  );

  return (
    <div className="mt-6 space-y-6 font-sans">
      
      {/* SECTION 1: QUALIFYING */}
      <div className="bg-[#1F2833] p-6 rounded-xl border-l-4 border-red-600 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⏱️</span>
            <h3 className="font-black text-lg text-white font-orbitron tracking-wide">QUALIFYING TOP 3</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DriverSelect 
              label="Pole Position" 
              value={formData.quali_p1} 
              onChange={(v: string) => handleChange('quali_p1', v)} 
              position="quali_p1"
            />
            <DriverSelect 
              label="P2" 
              value={formData.quali_p2} 
              onChange={(v: string) => handleChange('quali_p2', v)} 
              position="quali_p2"
            />
            <DriverSelect 
              label="P3" 
              value={formData.quali_p3} 
              onChange={(v: string) => handleChange('quali_p3', v)} 
              position="quali_p3"
            />
        </div>
      </div>

      {/* SECTION 2: RACE */}
      <div className="bg-[#1F2833] p-6 rounded-xl border-l-4 border-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏁</span>
            <h3 className="font-black text-lg text-white font-orbitron tracking-wide">RACE TOP 3</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DriverSelect 
              label="Winner" 
              value={formData.race_p1} 
              onChange={(v: string) => handleChange('race_p1', v)} 
              position="race_p1"
            />
            <DriverSelect 
              label="P2" 
              value={formData.race_p2} 
              onChange={(v: string) => handleChange('race_p2', v)} 
              position="race_p2"
            />
            <DriverSelect 
              label="P3" 
              value={formData.race_p3} 
              onChange={(v: string) => handleChange('race_p3', v)} 
              position="race_p3"
            />
        </div>
      </div>

      {/* SECTION 3: BONUS */}
      <div className="bg-[#1F2833] p-6 rounded-xl border-l-4 border-yellow-500 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h3 className="font-black text-lg text-yellow-500 font-orbitron tracking-wide">BONUS PREDICTIONS</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">🔥 Wild Prediction (Probable but not obvious)</label>
                <input 
                    className="w-full p-3 border border-gray-700 rounded bg-[#121418] text-white focus:border-yellow-500 outline-none transition" 
                    placeholder="e.g. Albon scores points..." 
                    value={formData.wild} 
                    onChange={e => handleChange('wild', e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">📉 Biggest Flop (Driver/Team)</label>
                    <input 
                        className="w-full p-3 border border-gray-700 rounded bg-[#121418] text-white focus:border-blue-500 outline-none transition" 
                        placeholder="e.g. Aston Martin" 
                        value={formData.flop} 
                        onChange={e => handleChange('flop', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">🚀 Biggest Surprise (Driver/Team)</label>
                    <input 
                        className="w-full p-3 border border-gray-700 rounded bg-[#121418] text-white focus:border-green-500 outline-none transition" 
                        placeholder="e.g. Haas Podium" 
                        value={formData.surprise} 
                        onChange={e => handleChange('surprise', e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-red-600 text-white font-black text-2xl py-4 rounded hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.5)] transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed font-orbitron tracking-widest skew-x-[-5deg]"
      >
        <span className="skew-x-[5deg] inline-block">{loading ? "TRANSMITTING..." : "SUBMIT PREDICTIONS 📝"}</span>
      </button>
    </div>
  );
}