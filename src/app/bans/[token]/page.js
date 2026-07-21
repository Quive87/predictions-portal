"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const BRAWLERS = {
  "16000000": "shelly", "16000001": "colt", "16000002": "bull", "16000003": "brock",
  "16000004": "rico", "16000005": "spike", "16000006": "barley", "16000007": "jessie",
  "16000008": "nita", "16000009": "dynamike", "16000010": "el primo", "16000011": "mortis",
  "16000012": "crow", "16000013": "poco", "16000014": "bo", "16000015": "piper",
  "16000016": "pam", "16000017": "tara", "16000018": "darryl", "16000019": "penny",
  "16000020": "frank", "16000021": "gene", "16000022": "tick", "16000023": "leon",
  "16000024": "rosa", "16000025": "carl", "16000026": "bibi", "16000027": "8-bit",
  "16000028": "sandy", "16000029": "bea", "16000030": "emz", "16000031": "mr. p",
  "16000032": "max", "16000034": "jacky", "16000035": "gale", "16000036": "nani",
  "16000037": "sprout", "16000038": "surge", "16000039": "colette", "16000040": "amber",
  "16000041": "lou", "16000042": "byron", "16000043": "edgar", "16000044": "ruffs",
  "16000045": "stu", "16000046": "belle", "16000047": "squeak", "16000048": "grom",
  "16000049": "buzz", "16000050": "griff", "16000051": "ash", "16000052": "meg",
  "16000053": "lola", "16000054": "fang", "16000056": "eve", "16000057": "janet",
  "16000058": "bonnie", "16000059": "otis", "16000060": "sam", "16000061": "gus",
  "16000062": "buster", "16000063": "chester", "16000064": "gray", "16000065": "mandy",
  "16000066": "r-t", "16000067": "willow", "16000068": "maisie", "16000069": "hank",
  "16000070": "cordelius", "16000071": "doug", "16000072": "pearl", "16000073": "chuck",
  "16000074": "charlie", "16000075": "mico", "16000076": "kit", "16000077": "larry & lawrie",
  "16000078": "melodie", "16000079": "angelo", "16000080": "draco", "16000081": "lily",
  "16000082": "berry", "16000083": "clancy", "16000084": "moe", "16000085": "kenji",
  "16000086": "shade", "16000087": "juju", "16000088": "buzz-lightyear", "16000089": "meeple",
  "16000090": "ollie", "16000091": "lumi", "16000092": "finx", "16000093": "jae-yong",
  "16000094": "kaze", "16000095": "alli", "16000096": "trunk", "16000097": "mina",
  "16000098": "ziggy", "16000099": "pierce", "16000100": "gigi", "16000101": "glowy",
  "16000102": "sirius", "16000103": "najia", "16000104": "damian", "16000105": "starr nova",
  "16000106": "bolt"
};

// Sort brawlers alphabetically for the dropdown
const SORTED_BRAWLERS = Object.entries(BRAWLERS).sort((a, b) => a[1].localeCompare(b[1]));

export default function BansPage() {
  const params = useParams();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  
  const [ban1, setBan1] = useState('');
  const [ban2, setBan2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Global Bans Entry";
    if (!token) return;

    const fetchTokenInfo = async () => {
      try {
        const res = await fetch(`/api/global-bans?token=${token}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load ban phase');
        }
        const phaseData = await res.json();
        setData(phaseData);

        // Pre-fill existing bans if any
        const myBans = phaseData.myTeam === 'A' ? phaseData.bansA : phaseData.bansB;
        if (myBans && myBans.length > 0) {
          setBan1(myBans[0] || '');
          setBan2(myBans[1] || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data?.isOpen) return;
    
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const bans = [];
      if (ban1) bans.push(ban1);
      if (ban2 && ban2 !== ban1) bans.push(ban2); // prevent duplicate IDs in the array just in case

      const res = await fetch('/api/global-bans/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, bans })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit bans');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 border border-red-900 bg-red-950/20 rounded-md text-center">
          <p className="text-red-500 font-bold uppercase">{error}</p>
        </div>
      </div>
    );
  }

  const teamName = data.myTeam === 'A' ? data.team1Name : data.team2Name;
  const opponentName = data.myTeam === 'A' ? data.team2Name : data.team1Name;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-[#333] rounded-md bg-[#0a0a0a]">
        
        <div className="mb-8 border-b border-[#333] pb-4">
          <span className="text-[10px] uppercase text-[#666] font-semibold tracking-widest block mb-1">
            Global Ban Phase
          </span>
          <h1 className="text-xl font-semibold tracking-tight uppercase text-blue-400">
            {teamName}
          </h1>
          <p className="text-[#888] text-xs mt-1">vs {opponentName}</p>
        </div>

        {!data.isOpen ? (
          <div className="p-6 border border-[#333] bg-[#111] rounded text-center">
            <p className="text-sm text-[#888] font-medium uppercase tracking-wider">Phase Closed</p>
            <p className="text-xs text-[#555] mt-1">The global ban phase for this match has ended.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-[#666] font-semibold tracking-wider block mb-2">Ban 1</label>
                <select 
                  value={ban1} 
                  onChange={(e) => setBan1(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] text-white text-sm rounded-md p-3 focus:outline-none focus:border-white capitalize appearance-none"
                >
                  <option value="">-- No Ban --</option>
                  {SORTED_BRAWLERS.map(([id, name]) => (
                    <option key={`ban1-${id}`} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#666] font-semibold tracking-wider block mb-2">Ban 2</label>
                <select 
                  value={ban2} 
                  onChange={(e) => setBan2(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] text-white text-sm rounded-md p-3 focus:outline-none focus:border-white capitalize appearance-none"
                >
                  <option value="">-- No Ban --</option>
                  {SORTED_BRAWLERS.map(([id, name]) => (
                    <option key={`ban2-${id}`} value={id}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
               <p className="text-xs text-red-500 text-center font-bold">{error}</p>
            )}
            
            {success && (
               <div className="p-3 border border-green-900 bg-green-950/30 text-green-500 text-xs text-center font-bold uppercase rounded">
                 Bans Saved Successfully
               </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-md border border-[#333] bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Bans'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
