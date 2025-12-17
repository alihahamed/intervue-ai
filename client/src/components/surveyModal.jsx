"use client"

import SplineModel from "./ui/splineModel"
import { useState, useEffect, useRef } from "react"
import { useChat } from "../createContext"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

function SurveyModal() {
  const [currentStep, setCurrentStep] = useState(1)
  const { survey, setSurvey, setIsProcessing, isProcessing } = useChat()

  const expRef = useRef(null)
  const stackRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    if (currentStep === 2 && expRef.current) expRef.current.focus()
    if (currentStep === 3 && stackRef.current) stackRef.current.focus()
    if (currentStep === 4 && targetRef.current) targetRef.current.focus()
  }, [currentStep])

  const handleKeyDown = (e, step) => {
    if (e.key === "Enter") {
      if (step === 1 && !survey.userName) return
      if (step === 2 && !survey.experience) return
      if (step === 3 && !survey.techStack) return
      if (step === 4 && !survey.targetRole) return

      setCurrentStep((prev) => prev + 1)
    }
  }

  const inputStyles =
    "w-full bg-transparent border-0 border-b-2 border-zinc-700 rounded-none text-white text-lg md:text-xl py-2 px-0 h-auto focus:border-white focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors placeholder:text-zinc-700"

  return (
    <>
      {isProcessing && currentStep < 5 && (
        <div className="fixed inset-0 z-50 flex w-screen h-screen bg-black text-white overflow-hidden">
          {/* =========================================
      LEFT COLUMN: Form & Content
      ========================================= */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-8 sm:p-16 relative z-10">
            {/* Optional: Branding/Header at Top Left */}
            {/* <div className="absolute top-12 left-16">
              <h1 className="text-xl font-bold tracking-widest uppercase text-white bg-red-600 p-3">Interview // Setup</h1>
            </div> */}

            <div className="w-full max-w-lg flex flex-col gap-6 mt-auto">
              <div className="mb-4">
                <h2 className="text-5xl md:text-[65px] vintage tracking-wide">
                  Let's tailor your <br />
                  <span className="text-blue-600">experience.</span>
                </h2>
              </div>

              <div className="space-y-6">
                {/* QUESTION 01: NAME */}
                <div className={`transition-all duration-500 ${currentStep > 1 ? "opacity-50" : "opacity-100"}`}>
                  <label className="text-sm  text-indigo-400 uppercase tracking-wider ml-1">What's Your Name?</label>
                  <Input
                    type="text"
                    value={survey.userName}
                    onChange={(e) => setSurvey({ ...survey, userName: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                    readOnly={currentStep > 1}
                    placeholder="Enter your name..."
                    autoFocus
                    className={inputStyles}
                  />
                </div>

                {/* QUESTION 02: EXPERIENCE */}
                {currentStep >= 2 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <label className="text-sm font-mono text-purple-400 uppercase tracking-wider ml-1">
                      Years of Experience
                    </label>
                    <Select
                      value={survey.experience}
                      onValueChange={(value) => setSurvey({ ...survey, experience: value })}
                      disabled={currentStep > 2}
                    >
                      <SelectTrigger
                        ref={expRef}
                        onKeyDown={(e) => handleKeyDown(e, 2)}
                        className="w-full bg-transparent border-0 border-b-2 border-zinc-700 rounded-none text-white text-2xl py-2 px-0 h-auto focus:border-white focus:ring-0 focus:ring-offset-0 transition-colors [&>span]:text-zinc-700 [&>span]:data-[placeholder]:text-zinc-700"
                      >
                        <SelectValue placeholder="Select Level..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="No experience" className="text-white focus:bg-zinc-800 focus:text-white">
                          No experience
                        </SelectItem>
                        <SelectItem value="Junior" className="text-white focus:bg-zinc-800 focus:text-white">
                          Junior (0-2 Years)
                        </SelectItem>
                        <SelectItem value="Mid" className="text-white focus:bg-zinc-800 focus:text-white">
                          Mid-Level (2-5 Years)
                        </SelectItem>
                        <SelectItem value="Senior" className="text-white focus:bg-zinc-800 focus:text-white">
                          Senior (5+ Years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* QUESTION 03: TECH STACK */}
                {currentStep >= 3 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <label className="text-xs  text-cyan-400 uppercase tracking-wider ml-1">Tech Stack</label>
                    <Input
                      ref={stackRef}
                      type="text"
                      value={survey.techStack}
                      onChange={(e) => setSurvey({ ...survey, techStack: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
                      placeholder="React, Node, AWS..."
                      className={inputStyles}
                    />
                  </div>
                )}

                {/* QUESTION 04: TARGET ROLE */}
                {currentStep >= 4 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <label className="text-xs  text-cyan-400 uppercase tracking-wider ml-1">
                      Target Role?
                    </label>
                    <Input
                      ref={targetRef}
                      type="text"
                      list="roles-list"
                      value={survey.targetRole}
                      onChange={(e) => setSurvey({ ...survey, targetRole: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 4)}
                      readOnly={currentStep > 4}
                      placeholder="e.g. Senior Frontend Engineer..."
                      className={inputStyles}
                    />
                    <datalist id="roles-list">
                      <option value="Frontend Developer" />
                      <option value="Senior Frontend Engineer" />
                      <option value="Full Stack Developer" />
                      <option value="Backend Architect" />
                      <option value="Tech Lead" />
                      <option value="React Native Developer" />
                      <option value="DevOps Engineer" />
                      <option value="Product Engineer" />
                    </datalist>
                  </div>
                )}

                <div className="pt-2 text-zinc-400 text-sm animate-pulse">
                  Press Enter ↵ to {currentStep === 4 ? "start interview" : "continue"}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
      RIGHT COLUMN: 3D Model Placeholder
      ========================================= */}
          <div className="hidden lg:flex w-1/2 h-full bg-[#050505] relative border-l border-zinc-900">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(#1f1f21 1px, transparent 1px), linear-gradient(90deg, #1f1f21 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center text-zinc-800">
                <SplineModel />
              </div>
            </div>

            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}
    </>
  )
}

export default SurveyModal
