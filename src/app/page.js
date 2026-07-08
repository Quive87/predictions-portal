import { Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#FF4500]/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#00D1FF]/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="bg-[#1A1A24]/60 backdrop-blur-xl border border-white/10 shadow-2xl w-full max-w-lg rounded-2xl p-10 text-center relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
          <Trophy className="w-10 h-10 text-[#FF4500]" />
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#FF4500] to-[#ffaa00] mb-4">
          Prediction Portal
        </h1>
        
        <p className="text-white/80 text-lg mb-8 leading-relaxed">
          Welcome to the Crew Predictions portal. To submit a prediction, you need the specific link for the active match.
        </p>

        <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-8">
          <p className="text-xs uppercase text-white/50 font-bold mb-2 tracking-widest">Example URL Format:</p>
          <code className="text-sm text-[#00D1FF] break-all">
            https://your-domain.vercel.app/&lt;bountyId&gt;/&lt;matchId&gt;
          </code>
        </div>

        <p className="text-sm text-white/40 italic">
          Please ask the production team for the exact link to the current match!
        </p>
      </div>
    </div>
  );
}
