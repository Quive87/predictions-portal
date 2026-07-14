"use client";

import { useState, useEffect } from 'react';

export default function PredictionsPollPage() {
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  useEffect(() => {
    document.title = "Audience Predictions Poll";
  }, []);

  const fetchActiveMatch = async () => {
    try {
      const res = await fetch('/api/active-match');
      if (res.ok) {
        const data = await res.json();
        setActiveMatch(data);
        
        // Check if already voted for this match
        const votedKey = `voted_poll:${data.bountyId}:${data.matchId}`;
        const prevVote = localStorage.getItem(votedKey);
        if (prevVote) {
          setHasVoted(true);
          setSelectedTeam(prevVote);
        } else {
          setHasVoted(false);
          setSelectedTeam(null);
        }
      } else {
        setActiveMatch(null);
      }
    } catch (err) {
      console.error("Failed to fetch active match:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveMatch();
    const interval = setInterval(fetchActiveMatch, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (teamKey, teamName) => {
    if (!activeMatch || hasVoted) return;
    setStatus('submitting');
    setSelectedTeam(teamKey);

    try {
      const res = await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bountyId: activeMatch.bountyId,
          matchId: activeMatch.matchId,
          voteFor: teamKey
        })
      });

      if (!res.ok) throw new Error("Failed to vote");

      const votedKey = `voted_poll:${activeMatch.bountyId}:${activeMatch.matchId}`;
      localStorage.setItem(votedKey, teamKey);
      
      setHasVoted(true);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-neutral-800 bg-[#0d0d10] rounded-xl shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-8 border-b border-neutral-800 pb-5 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
              LIVE AUDIENCE POLL
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-4 uppercase">
              Predict the Winner
            </h1>
            <p className="text-neutral-400 text-xs mt-2 font-medium">Cast your prediction for the live match below!</p>
          </div>

          {!activeMatch ? (
            <div className="p-8 border border-neutral-800 bg-black/40 rounded-lg text-center">
              <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">No active match at the moment</p>
              <p className="text-xs text-neutral-600 mt-2">Check back when the next draft starts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center bg-black/30 border border-neutral-800/80 p-4 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Current Matchup</span>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="font-extrabold text-blue-400 uppercase text-sm truncate max-w-[130px]">{activeMatch.team1}</span>
                  <span className="text-xs font-black text-neutral-600 italic">VS</span>
                  <span className="font-extrabold text-red-400 uppercase text-sm truncate max-w-[130px]">{activeMatch.team2}</span>
                </div>
              </div>

              {hasVoted ? (
                <div className="text-center py-8 px-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h3 className="font-bold text-emerald-400 uppercase text-sm">Prediction Recorded!</h3>
                  <p className="text-xs text-neutral-400">
                    You predicted <span className="font-bold text-white uppercase">{selectedTeam === 'team1' ? activeMatch.team1 : activeMatch.team2}</span> to win.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">Select your winner</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      disabled={status === 'submitting'}
                      onClick={() => handleVote('team1', activeMatch.team1)}
                      className="group relative overflow-hidden py-4 px-4 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500 transition-all duration-300 text-left flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Team Blue</span>
                        <span className="font-black text-white uppercase text-base mt-0.5 group-hover:translate-x-1 transition-transform duration-300">{activeMatch.team1}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity">VOTE</span>
                    </button>

                    <button
                      type="button"
                      disabled={status === 'submitting'}
                      onClick={() => handleVote('team2', activeMatch.team2)}
                      className="group relative overflow-hidden py-4 px-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 text-left flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Team Red</span>
                        <span className="font-black text-white uppercase text-base mt-0.5 group-hover:translate-x-1 transition-transform duration-300">{activeMatch.team2}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400 opacity-60 group-hover:opacity-100 transition-opacity">VOTE</span>
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <p className="text-xs text-red-500 text-center font-bold">Failed to submit vote. Please try again.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
