import {useState, useEffect, useRef} from "react";
import { useChat } from "../createContext";

function CodeInterface({ onSubmit }) {
  const { setCodingMode, message, codingMode } = useChat();
  const [code, setCode] = useState("")
  const containerRef = useRef(null)


//   useEffect(() =>{
//     if(codingMode) setCode("Write your code here")
//   }, [codingMode])


    return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col bg-[#09090b] rounded-xl overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Terminal className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-zinc-100 font-semibold tracking-wide text-sm uppercase">
            Live Execution Context
          </h2>
          <p className="text-zinc-500 text-[11px] font-medium font-mono">
            awaiting_user_input...
          </p>
        </div>
      </div>

      {/* --- EDITOR AREA --- */}
      <div className="flex-1 relative group">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-[#09090b] text-zinc-300 font-mono text-sm p-6 resize-none focus:outline-none focus:bg-zinc-950/50 transition-colors leading-relaxed selection:bg-emerald-500/20 placeholder:text-zinc-700"
          spellCheck="false"
        />
        {/* Subtle glow effect on focus */}
        <div className="absolute inset-0 pointer-events-none border border-transparent group-focus-within:border-emerald-500/20 transition-colors rounded-none" />
      </div>

      {/* --- FOOTER --- */}
      <div className="p-5 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md flex justify-between items-center">
        
        {/* Left: Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Editor Active</span>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-3 ml-auto">
          {/* CANCEL */}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full hover:bg-zinc-700 hover:text-white transition-all duration-200 border border-transparent hover:border-zinc-600"
          >
            Cancel
          </button>

          {/* SUBMIT */}
          <button
            onClick={() => onSubmit(code)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black text-sm font-bold rounded-full hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Code2 className="w-4 h-4" />
            <span>Submit Code</span>
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default CodeInterface;
