export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-[#333] rounded-md">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Predictions Portal
        </h1>
        
        <p className="text-[#888] text-sm mb-6 leading-relaxed">
          Welcome to the Crew Predictions portal. Please access this portal using your assigned personal URL.
        </p>

        <div className="bg-[#111] border border-[#333] rounded p-4 mb-6">
          <p className="text-[10px] uppercase text-[#666] font-semibold mb-2 tracking-widest">Format</p>
          <code className="text-sm text-[#ededed] break-all">
            https://your-domain.vercel.app/&lt;id&gt;
          </code>
        </div>

        <p className="text-xs text-[#666]">
          Contact the production team if you do not know your ID.
        </p>
      </div>
    </div>
  );
}
