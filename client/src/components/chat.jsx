import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";
import { useState, useRef, useEffect, useCallback, useMemo} from "react";
import React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import { Orb } from "./ui/Orb";
import { Message, MessageContent } from "./ui/message";
import { Card } from "./ui/card";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "./ui/glowing-effect";
import ChatInput from "./chatInput";
import { WavyBackground } from "./ui/wavy-background";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { Button } from "./ui/moving-border";
import FloatingLines from "./ui/FloatingLines";
import { Mic, MicOff } from "lucide-react";

const InterviewBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 z-0">
      <FloatingLines
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={[10, 15, 20]}
        lineDistance={[8, 6, 4]}
        bendRadius={5.0}
        bendStrength={-0.5}
        interactive={true}
        parallax={true}
      />
    </div>
  );
});

// Give it a display name for debugging
InterviewBackground.displayName = "InterviewBackground";

function ChatConversation() {
  const {
    addMessage,
    message,
    isProcessing,
    setIsProcessing,
    handleOptionUpdate,
    survey,
    deleteMessage,
  } = useChat();

  // gsap animations

  gsap.registerPlugin(SplitText);

  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef();
  const splitRef = useRef(null);
  const tlRef = useRef(null);
  const tlBtn = useRef(null);

  // component mount animation when page loads
  useGSAP(() => {
    const heroSplit = new SplitText(".heroText span", {
      type: "chars,  words",
    });

    gsap.from(heroSplit.chars, {
      opacity: 0,
      duration: 1.5,
      ease: "expo.out",
      stagger: 0.08,
      alpha: 0,
      y: 30,
    });

    SplitText.create(".subtitleText", {
      type: "lines",
      onSplit(self) {
        gsap.from(self.lines, {
          opacity: 0,
          yPercent: 100,
          duration: 1.8,
          ease: "expo.out",
          stagger: 0.05,
          delay: 2,
        });
      },
    });

    gsap.fromTo(
      ".techPills > *",
      {
        opacity: 0,
        scale: 0,
        y: 30,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 2.7,
        clearProps: "all",
      }
    );

    tlBtn.current = gsap.timeline({
      delay: 3.6,
    });

    tlBtn.current.set([".btn-text-1", ".btn-text-2"], {
      opacity: 0,
    });

    tlBtn.current.fromTo(
      ".pop-btn",
      {
        width: "48px",
        borderRadius: "50%",
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      }
    );

    tlBtn.current
      .to(".pop-btn", {
        width: "12rem",
        borderRadius: "1.75rem",
        color: "white",
        duration: 1.0,
        ease: "power3.inOut",
        delay: 0.5,
        clearProps: "all",
      })
      .to(
        [".btn-text-1", ".btn-text-2"],
        {
          opacity: 1,
          duration: 0.6,
          clearProps: "all",
        },
        "<+=0.3"
      );
  }, []);

  // useGSAP for button rolling animation

  useGSAP(() => {
    const split1 = new SplitText(".btn-text-1", { type: "words, chars" });
    const split2 = new SplitText(".btn-text-2", { type: "words, chars" });

    tlRef.current = gsap.timeline({ paused: true });

    tlRef.current.fromTo(
      split1.chars,
      {
        y: 0,
      },
      {
        duration: 0.5,
        y: -20,
        stagger: 0.04,
      }
    );

    tlRef.current.fromTo(
      split2.chars,
      {
        y: 38,
      },
      {
        duration: 0.4,
        y: -20,
        stagger: 0.03,
      },
      "<"
    );
  }, [isHovered]);

  // useGSAP for pushing the hero text, sub text and the pills up when the chat card appears

  useGSAP(() => {
    if (!isProcessing && !survey.isCompleted) return;

    const tl = gsap.timeline();

    tl.to([".heroText", ".subtitleText", ".techPills"], {
      y: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.in",
      overwrite: true,
      display: "none",
    });

    tl.fromTo(
      ".chat-card-container",
      {
        y: 40, // Start lower
        scale: 0.75, // Start slightly smaller
        opacity: 0,
        filter: "blur(10px)", // The "Premium" blur effect
      },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)", // Focus in
        duration: 1.4,
        ease: "power4.out", // Very smooth easing
        clearProps: "all", // Clean up afterwards
      },
      "-=0.4" // Start overlapping slightly with the text exit
    );
  }, [survey.isCompleted]);

  // voice call refs and states

  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [orbState, setOrbState] = useState("listening");
  const [callEnd, setCallEnd] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const nextStartTimeRef = useRef(null);

  // FIX: Track messages in a Ref so we can read them without re-triggering effects
  const messagesRef = useRef(message);
  useEffect(() => {
    messagesRef.current = message;
  }, [message]);

  // --- 1. HELPER: PLAY AUDIO ---
  const playAudio = async (blob) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({
        latencyHint: "interactive",
      });
    }
    const audioCtx = audioContextRef.current;

    if (audioCtx.state === "suspended") {
        await audioCtx.resume();
    }

    // 1. Read the Raw Int16 bytes
    const arrayBuffer = await blob.arrayBuffer();
    const int16Data = new Int16Array(arrayBuffer);

    // 2. Convert to Float32 (Standard Browser Format)
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      // Normalize -32768..32767 to -1.0..1.0
      float32Data[i] = int16Data[i] / 32768.0;
    }

    // 3. Create an Audio Buffer
    // 24000 matches your "output.sample_rate" in settings
    const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    // 4. Play it (Queued for smoothness)
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    // Schedule playback to ensure chunks play back-to-back without gaps
    const currentTime = audioCtx.currentTime;
    // If the queue has fallen behind current time, reset it
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);

    // Advance the pointer
    nextStartTimeRef.current += buffer.duration;

    source.onended = () => {
      // Optional: logic when a specific chunk finishes
    };
  };

  // resetting everything back to default so that we can start a new call
  const endCall = useCallback(() => {
    if (socketRef.current) {
      socketRef.current?.close();
      socketRef.current = null;
    }

    if (mediaRecorderRef.current !== "inactive") {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    nextStartTimeRef.current = 0;
    
    setConnectionStatus("idle");
    setOrbState("listening");

    deleteMessage();
    setCallEnd(true);
  }, [deleteMessage]);

  let isMounted = true;

  const startAgent = async () => {
    try {
      setConnectionStatus("connecting");
      setCallEnd(false);
      console.log(" Starting Agent Connection...");
      console.log(callEnd)

      // A. Fetch Config
      const [instructionsResponse, tokenResponse] = await Promise.all([
        fetch("http://localhost:3021/api/get-voice-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ surveyData: survey }),
        }),
        fetch("http://localhost:3021/api/get-agent-token"),
      ]);

      const { instructions } = await instructionsResponse.json();
      const { key } = await tokenResponse.json();

      // B. Prepare History
      const historyMessages = messagesRef.current
        .filter((m) => m.sender === "user" || m.sender === "assistant")
        .map((m) => ({
          type: "History",
          role: m.sender === "user" ? "user" : "assistant",
          content: typeof m.text === "string" ? m.text : JSON.stringify(m.text),
        }));
        

      if (!isMounted) return;

      // C. Connect WebSocket
      socketRef.current = new WebSocket(
        "wss://agent.deepgram.com/v1/agent/converse",
        ["bearer", key]
      );

      socketRef.current.onerror = (error) =>
        console.error("❌ WebSocket Error:", error);
      socketRef.current.onclose = (event) => {
        console.log(`🔌 Closed: ${event.code} - ${event.reason}`);
        if (isMounted) setConnectionStatus("idle");
      };

      socketRef.current.onopen = async () => {
        if (!isMounted) return;
        console.log("✅ WebSocket Open!");
        setConnectionStatus("active");
        console.log("history", historyMessages)

        // 1. Get Mic Stream FIRST to know the Sample Rate
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }
        const sampleRate = audioContextRef.current.sampleRate;

        // 2. Send Settings with LINEAR16 and Dynamic Sample Rate
        const settings = {
          type: "Settings",
          audio: {
            input: {
              encoding: "linear16", // ✅ THE FIX: Raw PCM Audio
              sample_rate: sampleRate, // ✅ Must match the browser's mic
            },
            output: {
              encoding: "linear16",
              sample_rate: 24000,
              container: "none",
            },
          },
          agent: {
            listen: { provider: { type: "deepgram", model: "nova-2" } },
            think: {
              provider: { type: "open_ai", model: "gpt-4o-mini" },
              prompt: instructions,
            },
            speak: {
              provider: { type: "deepgram", model: "aura-2-thalia-en" },
            },
            context: { messages: historyMessages },
          },
        };
        socketRef.current.send(JSON.stringify(settings));

        // 3. Setup Audio Processing (Raw PCM)
        const source = audioContextRef.current.createMediaStreamSource(stream);
        // Buffer size 4096 = ~85ms latency @ 48kHz
        const processor = audioContextRef.current.createScriptProcessor(
          4096,
          1,
          1
        );
        processorRef.current = processor; // Save ref to stop later

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);

        processor.onaudioprocess = (e) => {
          if (socketRef.current?.readyState === 1) {
            const inputData = e.inputBuffer.getChannelData(0);

            // 🛠️ CONVERT FLOAT32 (Browser) -> INT16 (Deepgram)
            const buffer = new ArrayBuffer(inputData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              // Convert range [-1.0, 1.0] to [-32768, 32767]
              view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            }

            socketRef.current.send(buffer);
          }
        };
      };

      // F. Handle Messages
      socketRef.current.onmessage = async (message) => {
        if (message.data instanceof Blob) {
          playAudio(message.data);
          setOrbState("talking");
          // console.log("blob data", message.data)
          console.log(orbState)
        } else {
          const event = JSON.parse(message.data);
          console.log("event", event)
          if (event.type === "Error") console.error("DEEPGRAM ERROR:", event);

          if (event.type === "ConversationText") {
            addMessage(
              event.role === "user" ? "user" : "assistant",
              event.content
            );
            console.log("text daata", event.content);
          }
          if (event.type === "UserStartedSpeaking") setOrbState("listening");
        }
      };
    } catch (error) {
      console.error("❌ Setup Error:", error);
      if (isMounted) setConnectionStatus("error");
    }
  };

  // show the interview interface if survey is completed

  

  if (survey.isCompleted) {
    return (
      // 1. MAIN CONTAINER: Full Screen & Relative
      <div className="h-screen w-screen relative bg-[#09090b] overflow-hidden flex items-center justify-center">    
        <InterviewBackground />
        <div className="relative z-10 w-full flex items-center justify-center px-4 pointer-events-none">
          
          <Card className="chat-card-container pointer-events-auto w-[60vw] max-w-5xl h-[75vh] min-h-[550px] max-h-[850px] bg-[#09090b]/80 shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
            <div className="flex h-full flex-col z-10 relative w-full">
              <Conversation className="flex-1 overflow-y-auto overflow-x-hidden relative">
                <ConversationContent className="p-2 md:p-4 space-y-4">
                  {callEnd ? (
                    <ConversationEmptyState
                      icon={<Orb className="size-25" agentState="listening" />}
                      title="Are You Ready?"
                      description="Start the Call to see the messages here"
                    />
                  ) : (
                    // message.map((msg, index) => {
                      
                    //   const isUser = msg.sender === "user";
                    //   const textContent = isUser ? msg.text : msg.text;
                    //   const grade = !isUser ? msg.text.grade : undefined;

                    //   return (
                        // <Message
                        //   key={msg.id || index}
                        //   from={isUser ? "user" : "assistant"}
                        //   className={`flex w-full gap-2 md:gap-3 items-start py-1 md:py-2 ${
                        //     isUser ? "justify-end" : "justify-start"
                        //   }`}
                        // >
                        //   {/* AVATAR */}
                        //   {!isUser && (
                        //     <div className="ring-border size-6 md:size-8 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-1 bg-black">
                        //       <Orb
                        //         className="h-full w-full"
                        //         agentState="talking"
                        //       />
                        //     </div>
                        //   )}

                        //   {/* BUBBLE CONTENT */}
                        //   <MessageContent
                        //     className={cn(
                        //       "relative flex flex-col gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm",
                        //       "w-fit max-w-[90%] md:max-w-[85%] whitespace-pre-wrap break-words",
                        //       isUser
                        //         ? "bg-white text-black rounded-br-none ml-auto"
                        //         : "bg-[#27272a] text-white rounded-tl-none mr-auto overflow-visible"
                        //     )}
                        //   >
                        //     {!isUser && grade !== undefined && (
                        //       <GradeBadge grade={grade} />
                        //     )}

                        //     {/* TEXT */}
                        //     <div>
                        //       {!isUser ? (
                        //         <TextGenerateEffect words={textContent} />
                        //       ) : (
                        //         textContent
                        //       )}
                        //     </div>
                        //   </MessageContent>
                        // </Message>
                        <>
                        <Orb className="flex justify-center items-center h-full w-full text-center size-full" agentState={orbState} />
                        </>
                    //   );
                    // })
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              {/* DEDICATED CONTROLS FOOTER */}
              <div className="w-full flex justify-center p-4 z-20">
                <div className="flex items-center justify-between gap-4 px-5 py-3 bg-[#09090b]/60 border border-white/10 rounded-full shadow-2xl w-full max-w-md">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          connectionStatus === "active"
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      {connectionStatus === "active" && (
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      )}
                    </div>
                    <span className="text-zinc-400 text-sm font-medium">
                      {connectionStatus === "idle"
                        ? "Idle" 
                        : connectionStatus === "active" ? "Listening..." : "Connecting..."}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={callEnd}
                      className={`p-2.5 rounded-full transition-all duration-200 ${
                        callEnd
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : isMuted
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {isMuted ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>

                    {!callEnd ? (
                      <button
                        onClick={endCall}
                        className="px-5 py-2.5 bg-red-500 text-black text-sm font-medium rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/25"
                      >
                        End Call
                      </button>
                    ) : (
                      <button
                        onClick={startAgent}
                        className="px-5 py-2.5 bg-emerald-500 text-black text-sm font-medium rounded-full hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                      >
                        Start Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // hero and wagera wagera
  return (
    <WavyBackground className="p-4">
      <div className="font-bold text-4xl md:text-5xl lg:text-[68px]  mb-6 text-center tracking-tight z-10">
        <h1 className="heroText">
          <span>Master Your</span>{" "}
          <span className="text-blue-400">Next Interview.</span>
        </h1>
      </div>

      {/* 2. Description - Removed 'relative bottom-12', used standard margins */}
      <div className="text-sm md:text-lg text-center text-gray-200 leading-relaxed max-w-2xl mx-auto mb-8 px-4 z-10">
        <p className="subtitleText">
          An autonomous interview agent that listens, processes, and speaks.
          Built with SLMs for rapid reasoning and realistic speech interaction.
        </p>
      </div>

      {/* pills */}
      <div className="gap-3 flex justify-center items-center mb-5 z-10 techPills">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 text-xs font-semibold px-4 py-1.5 transition-colors"
        >
          React
        </HoverBorderGradient>

        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 text-xs font-semibold px-4 py-1.5 transition-colors"
        >
          NodeJs
        </HoverBorderGradient>

        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 text-xs font-semibold px-4 py-1.5 transition-colors"
        >
          SLM's
        </HoverBorderGradient>
      </div>

      <div className="flex items-center justify-center">
        <Button
          onClick={() => setIsProcessing(true)}
          className="overflow-hidden "
          onMouseEnter={() => tlRef.current?.play()}
          onMouseLeave={() => tlRef.current?.reverse()}
          containerClassName="pop-btn"
        >
          <div
            ref={containerRef}
            className="relative h-5 overflow-hidden flex flex-col"
          >
            {/* Original Text */}
            <span className=" btn-text-1" style={{ whiteSpace: "pre" }}>
              Get started
            </span>

            {/* Duplicate Text */}
            <span
              className=" absolute top-full left-0 right-0 btn-text-2"
              style={{ whiteSpace: "pre" }}
            >
              Get started
            </span>
          </div>
        </Button>
      </div>
    </WavyBackground>
  );
}

export default ChatConversation;
