function SurveyModal() {
  return (
    <>
      <div className="fixed inset-0 z-50 flex w-screen h-screen bg-black text-white overflow-hidden font-sans">
        {/* =========================================
      LEFT COLUMN: Form & Content
      ========================================= */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-8 sm:p-16 relative z-10">
          {/* Optional: Branding/Header at Top Left */}
          <div className="absolute top-12 left-16">
            <h1 className="text-xl font-bold tracking-widest uppercase text-zinc-500">
              Interview // Setup
            </h1>
          </div>

          {/* THE ANCHOR POINT: Bottom Left 
       flex-col-reverse allows you to add new questions to the DOM 
       and have them appear "on top" or stack upwards naturally.
    */}
          <div className="w-full max-w-lg flex flex-col gap-6 mt-auto">
            {/* Introduction Text (Fades out later if you want) */}
            <div className="mb-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Let's tailor your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  experience.
                </span>
              </h2>
            </div>

            {/* INPUT AREA
         This is the bottom-most element.
      */}
            <div className="space-y-6">
              {/* Question 1: Target Role */}
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <label className="text-xs font-mono text-indigo-400 uppercase tracking-wider ml-1">
                  01. Target Position
                </label>
                <input
                  type="text"
                  placeholder="Senior Frontend Architect..."
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-zinc-700 text-white text-2xl py-2 focus:border-white focus:outline-none transition-colors placeholder:text-zinc-700"
                />
              </div>

              {/* PLACEHOLDER FOR NEXT QUESTIONS 
           When you render the next question state, put it here.
           Example styling for when it appears:
        */}
              {/* <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <label className="text-xs font-mono text-indigo-400 uppercase tracking-wider ml-1">
             02. Years of Experience
           </label>
           <select className="...">...</select>
        </div> 
        */}

              {/* Navigation / Next Button */}
              <div className="pt-4 flex items-center gap-4">
                <button className="rounded-full bg-white text-black px-8 py-3 font-bold hover:bg-zinc-200 transition-transform active:scale-95 flex items-center gap-2">
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </button>
                <span className="text-zinc-600 text-sm">Press Enter ↵</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
      RIGHT COLUMN: 3D Model Placeholder
      ========================================= */}
        <div className="hidden lg:flex w-1/2 h-full bg-[#050505] relative border-l border-zinc-900">
          {/* Grid Background Effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#1f1f21 1px, transparent 1px), linear-gradient(90deg, #1f1f21 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          ></div>

          {/* 3D Container - Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Replace this div with your Spline/Three.js Canvas */}
            <div className="w-full h-full flex items-center justify-center text-zinc-800">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 border border-zinc-800 rounded-full mx-auto flex items-center justify-center animate-spin-slow">
                  <div className="w-24 h-24 border-t border-zinc-700 rounded-full"></div>
                </div>
                <p className="font-mono text-xs tracking-widest uppercase">
                  3D Scene Mount Point
                </p>
              </div>
            </div>
          </div>

          {/* Decorative overlay gradient to blend right side into left */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}

export default SurveyModal;
