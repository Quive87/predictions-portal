"use client";

import { useState } from 'react'
import { Trophy, Swords, Send, AlertCircle } from 'lucide-react'
import { use } from 'react'

export default function PredictionPage({ params }) {
  // In Next 13+, params is a promise in client components if it's async, 
  // but for basic usage we can unwrap it or just use it. Let's unwrap it safely.
  const unwrappedParams = use(params);
  const { bountyid, matchid } = unwrappedParams;

  const [formData, setFormData] = useState({
    crewName: '',
    team1: '',
    team2: '',
    winner: '',
    score1: '',
    score2: ''
  })
  
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/preds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bountyId: bountyid,
          matchId: matchid,
          ...formData,
          score1: parseInt(formData.score1) || 0,
          score2: parseInt(formData.score2) || 0
        })
      });

      if (!res.ok) throw new Error("Failed to submit");

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#FF4500]/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#00D1FF]/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="bg-[#1A1A24]/60 backdrop-blur-xl border border-white/10 shadow-2xl w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
            <Trophy className="w-8 h-8 text-[#FF4500]" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#FF4500] to-[#ffaa00]">
            Crew Predictions
          </h1>
          <p className="text-white/60 mt-2 text-sm">Match ID: {matchid}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Your Name</label>
            <input 
              required
              type="text" 
              name="crewName"
              value={formData.crewName}
              onChange={handleChange}
              placeholder="e.g. Caster 1" 
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 items-end">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Team 1</label>
              <input 
                required
                type="text" 
                name="team1"
                value={formData.team1}
                onChange={handleChange}
                placeholder="Team A" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors"
              />
            </div>
            <div className="col-span-1 flex justify-center pb-3">
              <Swords className="w-6 h-6 text-white/30" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Team 2</label>
              <input 
                required
                type="text" 
                name="team2"
                value={formData.team2}
                onChange={handleChange}
                placeholder="Team B" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Predicted Winner</label>
            <select 
              required
              name="winner"
              value={formData.winner}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors appearance-none"
            >
              <option value="" disabled className="text-black">Select Winner</option>
              {formData.team1 && <option value={formData.team1} className="text-black">{formData.team1}</option>}
              {formData.team2 && <option value={formData.team2} className="text-black">{formData.team2}</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Score (T1)</label>
              <input 
                required
                type="number" 
                min="0"
                name="score1"
                value={formData.score1}
                onChange={handleChange}
                placeholder="0" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors text-center text-xl font-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Score (T2)</label>
              <input 
                required
                type="number" 
                min="0"
                name="score2"
                value={formData.score2}
                onChange={handleChange}
                placeholder="0" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF4500] transition-colors text-center text-xl font-black"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'submitting' || status === 'success'}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF8C00] text-white font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(255,69,0,0.3)] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {status === 'submitting' && <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
            {status === 'idle' && <><Send className="w-5 h-5" /> Submit Prediction</>}
            {status === 'success' && 'Prediction Sent!'}
            {status === 'error' && <><AlertCircle className="w-5 h-5" /> Retry</>}
          </button>
        </form>
      </div>
    </div>
  )
}
