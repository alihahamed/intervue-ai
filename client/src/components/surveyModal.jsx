"use client";

import SplineModel from "./ui/splineModel";
import { useState, useEffect, useRef } from "react";
import { useChat } from "../createContext";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function SurveyModal() {
  const [currentStep, setCurrentStep] = useState(1);
  const { survey, setSurvey, setIsProcessing, isProcessing } = useChat();

  const expRef = useRef(null);
  const stackRef = useRef(null);
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentStep === 2 && expRef.current) expRef.current.focus();
    if (currentStep === 3 && targetRef.current) targetRef.current.focus();
    if (currentStep === 4 && stackRef.current) stackRef.current.focus();
  }, [currentStep]);

  const handleKeyDown = (e, step) => {
    if (e.key === "Enter") {
      if (step === 1 && !survey.userName) return;
      if (step === 2 && !survey.experience) return;
      if (step === 3 && !survey.targetRole) return;
      if (step === 4 && !survey.techStack) return;

      if (step === 4) {
        handleExit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".banner-col", {
      yPercent: 100,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.inOut",
    }).from(
      ".modal-content",
      {
        opacity: 0,
        yPercent: 100,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.4"
    );
  }, [isProcessing]); // when is processing is true this animation runs

  const handleExit = () => {
    setSurvey({ ...survey, isCompleted: true }); // if isCompleted is true, the chat card will appear and the modal will fade out
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentStep((prev) => prev + 1);
      },
    });

    tl.to(".modal-content", {
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      yPercent: -100,
    }).to(
      ".banner-col",
      {
        yPercent: 100,
        duration: 0.7,
        stagger: {
          each: 0.2,
          from: "end",
        },
        ease: "power3.inOut",
      },
      "-=0.1"
    );
  };

  const inputStyles =
    "w-full bg-transparent border-0 border-b-2 border-zinc-700 rounded-none text-black text-lg md:text-xl py-2 px-0 h-auto focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors placeholder:text-zinc-700";

  const ROLE_OPTIONS = {
    "Frontend Developer": ["React", "Vue", "Next.js"],
    "Backend Developer": ["Node.js", "Django"],
    "Devops Engineer": ["AWS", "Docker"],
    "Fullstack Developer": ["MERN"],
    "UI/UX Designer": ["Figma"],
  };  


  return (
    <>
      {isProcessing && currentStep < 5 && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 flex w-screen h-screen overflow-hidden"
        >
          {/* =========================================
              THE 4 BANNERS (Background Layer)
             ========================================= */}
          <div className="absolute inset-0 flex w-full h-full z-0 pointer-events-none">
            {/* We create 4 columns, each 1/4 width */}
            <div className="banner-col w-1/4 h-full bg-white " />
            <div className="banner-col w-1/4 h-full bg-white " />
            <div className="banner-col w-1/4 h-full bg-white" />
            <div className="banner-col w-1/4 h-full bg-white" />
          </div>

          {/* =========================================
              CONTENT WRAPPER (z-10 to sit on top)
             ========================================= */}
          <div className="modal-content relative z-10 flex w-full h-full">
            {/* LEFT COLUMN: Form & Content */}
            <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-8 sm:p-16 relative">
              <div className="w-full max-w-lg flex flex-col gap-6 mt-auto">
                <div className="mb-4">
                  <h2 className="text-5xl md:text-[65px] vintage tracking-wide text-black">
                    Let's tailor your <br />
                    <span className="text-blue-600">experience.</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* QUESTION 01 */}
                  <div
                    className={`transition-all duration-500 ${
                      currentStep > 1 ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <label className="text-sm text-indigo-700 uppercase tracking-wider ml-1">
                      What's Your Name?
                    </label>
                    <Input
                      type="text"
                      value={survey.userName}
                      onChange={(e) =>
                        setSurvey({ ...survey, userName: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, 1)}
                      readOnly={currentStep > 1}
                      placeholder="Enter your name..."
                      autoFocus
                      className={inputStyles}
                    />
                  </div>

                  {/* QUESTION 02 */}
                  {currentStep >= 2 && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <label className="text-sm font-mono text-purple-700 uppercase tracking-wider ml-1">
                        Years of Experience
                      </label>
                      <Select
                        value={survey.experience}
                        onValueChange={(value) =>
                          setSurvey({ ...survey, experience: value })
                        }
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
                          <SelectItem
                            value="No experience"
                            className="text-white focus:bg-zinc-800"
                          >
                            No experience
                          </SelectItem>
                          <SelectItem
                            value="Junior"
                            className="text-white focus:bg-zinc-800"
                          >
                            Junior (0-2 Years)
                          </SelectItem>
                          <SelectItem
                            value="Mid"
                            className="text-white focus:bg-zinc-800"
                          >
                            Mid-Level (2-5 Years)
                          </SelectItem>
                          <SelectItem
                            value="Senior"
                            className="text-white focus:bg-zinc-800"
                          >
                            Senior (5+ Years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* QUESTION 03 */}
                  {currentStep >= 3 && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <label className="text-xs text-cyan-600 uppercase tracking-wider ml-1">
                        Target Role?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.keys(ROLE_OPTIONS).map((role) => (
                          <button
                            key={role}
                            ref={targetRef}
                            className={`p-3 text-sm font-medium border rounded-md transition-all duration-200 text-left
                            ${
                              survey.targetRole === role
                                ? "bg-red-600 border-red-600 text-white" // Selected Style
                                : "bg-transparent border-zinc-700 text-zinc-400 hover:border-red-500 hover:text-red-400" // Default Style
                            }
                          `}
                            onKeyDown={(e) => handleKeyDown(e, 3)}
                            onClick={() =>
                              setSurvey({
                                ...survey,
                                targetRole: role,
                                techStack: "",
                              })
                            }
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUESTION 04 */}
                  {currentStep >= 4 && survey.targetRole && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <label className="text-xs text-red-600 uppercase tracking-wider ml-1">
                        Tech Stack?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(ROLE_OPTIONS[survey.targetRole] || []).map(
                          (stack) => (
                            <button
                              key={stack}
                              ref={stackRef}
                              onKeyDown={(e) => handleKeyDown(e, 4)}
                              onClick={() =>
                                setSurvey({ ...survey, techStack: stack })
                              }
                              className={`px-4 py-2 text-sm rounded-full border transition-all
                              ${
                                survey.techStack === stack
                                  ? "bg-cyan-600 border-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]"
                                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-cyan-500"
                              }
                            `}
                            >
                              {stack}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-zinc-800 text-sm animate-pulse">
                    Press Enter ↵ to{" "}
                    {currentStep === 4 ? "start interview" : "continue"}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Spline */}
            <div className="hidden lg:flex w-1/2 h-full bg-transparent relative will-change-opacity">
              <div className="absolute inset-0 opacity-20"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                {/* <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <SplineModel />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SurveyModal;
