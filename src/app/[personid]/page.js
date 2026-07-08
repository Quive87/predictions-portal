"use client";

import { useState, useEffect, use } from 'react'

// Map of IDs to Crew Names
const CREW_MAP = {
  "1700": "Caster 1",
  "1701": "Caster 2",
  "1702": "Analyst 1",
  "1703": "Analyst 2",
  "1704": "Host",
  "1705": "Crew 6",
  "1706": "Crew 7",
  "1707": "Crew 8",
  "1708": "Crew 9",
  "1709": "Crew 10",
  "1710": "Crew 11",
  "1711": "Crew 12",
  "1712": "Crew 13",
  "1713": "Crew 14",
  "1714": "Crew 15",
  "1715": "Crew 16"
};

export default function PersonPredictionPage({ params }) {
  const unwrappedParams = use(params);
  const personId = unwrappedParams.personid;
  const crewName = CREW_MAP[personId] || `Guest ${personId}`;

  const [activeMatch, setActiveMatch] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
  
  const [formData, setFormData] = useState({
    winner: '',
    score: ''
  });
  
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const fetchActiveMatch = async () => {
      try {
        const res = await fetch('/api/active-match');
        if (res.ok) {
          const data = await res.json();
          setActiveMatch(data);
        } else {
          setActiveMatch(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMatch(false);
      }
    };
    
    fetchActiveMatch();
    const interval = setInterval(fetchActiveMatch, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const setWinner = (teamName) => {
    setFormData({ ...formData, winner: teamName });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeMatch) return;
    setStatus('submitting')

    try {
      const [winScore, loseScore] = formData.score.split('-').map(Number);
      let s1 = 0, s2 = 0;
      if (formData.winner === activeMatch.team1) {
        s1 = winScore;
        s2 = loseScore;
      } else {
        s1 = loseScore;
        s2 = winScore;
      }

      const res = await fetch('/api/preds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bountyId: activeMatch.bountyId,
          matchId: activeMatch.matchId,
          crewName: crewName,
          team1: activeMatch.team1,
          team2: activeMatch.team2,
          winner: formData.winner,
          score1: s1,
          score2: s2
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

  if (loadingMatch) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-[#333] rounded-md">
        
        <div className="mb-8 border-b border-[#333] pb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            {crewName}
          </h1>
          <p className="text-[#888] text-sm mt-1">Submit your prediction for the active match.</p>
        </div>

        {!activeMatch ? (
          <div className="p-4 border border-[#333] bg-[#111] rounded text-center">
            <p className="text-sm text-[#888]">No active match pushed from production.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#888]">Who Will Win?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWinner(activeMatch.team1)}
                  className={`py-3 px-2 rounded-md border text-sm transition-colors
                    ${formData.winner === activeMatch.team1 
                      ? 'bg-white border-white text-black font-semibold' 
                      : 'bg-black border-[#333] text-[#888] hover:border-[#666] hover:text-white'}`}
                >
                  {activeMatch.team1}
                </button>
                <button
                  type="button"
                  onClick={() => setWinner(activeMatch.team2)}
                  className={`py-3 px-2 rounded-md border text-sm transition-colors
                    ${formData.winner === activeMatch.team2 
                      ? 'bg-white border-white text-black font-semibold' 
                      : 'bg-black border-[#333] text-[#888] hover:border-[#666] hover:text-white'}`}
                >
                  {activeMatch.team2}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#888]">Predicted Score</label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.ceil((activeMatch.bestOf || 3) / 2) }).map((_, loserScore) => {
                  const wins = Math.ceil((activeMatch.bestOf || 3) / 2);
                  const score = `${wins}-${loserScore}`;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, score })}
                      className={`flex-1 py-2 px-1 rounded-md border text-sm transition-colors min-w-[60px]
                        ${formData.score === score 
                          ? 'bg-white border-white text-black font-semibold' 
                          : 'bg-black border-[#333] text-[#888] hover:border-[#666] hover:text-white'}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting' || status === 'success' || !formData.winner || !formData.score}
              className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${status === 'submitting' || status === 'success' || !formData.winner || !formData.score
                  ? 'bg-[#333] text-[#888] cursor-not-allowed'
                  : 'bg-white text-black hover:bg-[#eaeaea]'
                }`}
            >
              {status === 'submitting' && <div className="w-4 h-4 border-2 border-[#888] border-t-black rounded-full animate-spin" />}
              {status === 'idle' && 'Submit'}
              {status === 'success' && 'Saved'}
              {status === 'error' && 'Failed - Retry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
