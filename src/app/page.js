"use client";

import { useState, useEffect } from 'react';

export default function Home() {
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

  const handleVote = async (teamKey) => {
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
        <div className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-[#333] rounded-md">
        
        <div className="mb-8 border-b border-[#333] pb-4">
          <span className="text-[10px] uppercase text-[#666] font-semibold tracking-widest block mb-1">
            Audience Poll
          </span>
          <h1 className="text-xl font-semibold tracking-tight uppercase">
            Predict the Winner
          </h1>
          <p className="text-[#888] text-xs mt-1">Cast your prediction for the active match.</p>
        </div>

        {!activeMatch ? (
          <div className="p-6 border border-[#333] bg-[#111] rounded text-center">
            <p className="text-sm text-[#888] font-medium uppercase tracking-wider">No active match found</p>
            <p className="text-xs text-[#555] mt-1">Check back when the next draft starts.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#333] rounded p-4 text-center">
              <span className="text-[9px] uppercase text-[#666] font-semibold tracking-wider">Active Matchup</span>
              <div className="flex items-center justify-center gap-3 mt-1.5 font-bold uppercase text-sm">
                <span className="text-white truncate max-w-[130px]">{activeMatch.team1}</span>
                <span className="text-[10px] text-[#555] italic">VS</span>
                <span className="text-white truncate max-w-[130px]">{activeMatch.team2}</span>
              </div>
            </div>

            {hasVoted ? (
              <div className="p-6 border border-[#333] bg-[#111] rounded text-center space-y-2">
                <div className="text-sm font-semibold uppercase text-white">Prediction Saved!</div>
                <p className="text-xs text-[#888]">
                  You voted for <span className="font-semibold text-white uppercase">{selectedTeam === 'team1' ? activeMatch.team1 : activeMatch.team2}</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[10px] uppercase text-[#666] font-semibold tracking-wider block">Choose Winner</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={status === 'submitting'}
                    onClick={() => handleVote('team1')}
                    className="py-3 px-4 rounded-md border border-[#333] bg-black text-sm text-[#888] hover:border-[#666] hover:text-white transition-colors text-left flex justify-between items-center"
                  >
                    <span className="font-semibold text-white uppercase">{activeMatch.team1}</span>
                    <span className="text-[10px] text-[#555] uppercase tracking-wider">Vote</span>
                  </button>

                  <button
                    type="button"
                    disabled={status === 'submitting'}
                    onClick={() => handleVote('team2')}
                    className="py-3 px-4 rounded-md border border-[#333] bg-black text-sm text-[#888] hover:border-[#666] hover:text-white transition-colors text-left flex justify-between items-center"
                  >
                    <span className="font-semibold text-white uppercase">{activeMatch.team2}</span>
                    <span className="text-[10px] text-[#555] uppercase tracking-wider">Vote</span>
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
  );
}
