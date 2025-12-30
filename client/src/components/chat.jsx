import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
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

import { WavyBackground } from "./ui/wavy-background";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { Button } from "./ui/moving-border";
import FloatingLines from "./ui/FloatingLines";
import { Mic, MicOff } from "lucide-react";
import ghost from "../assets/ghost.png";
import PillNav from "./ui/PillNav";
import { VoicePicker } from "./voicePicker";

const InterviewBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 z-0">
      <FloatingLines
        enabledWaves={["middle", "bottom"]}
        lineCount={[10, 15, 20]}
        lineDistance={[8, 6, 4]}
        bendRadius={8.0}
        bendStrength={-1}
        interactive={true}
        parallax={false}
        linesGradient={["#0f172a", "#1e293b", "#334155", "#0f172a"]}
      />
    </div>
  );
});

const CallNav = React.memo(() => {
  return (
    <PillNav
      logo={ghost}
      items={[{ label: "Reset Interview", href: "/" }]}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 call-nav"
      ease="power2.easeOut"
      baseColor="white"
      pillColor="black"
      hoveredPillTextColor="black"
      pillTextColor="white"
    />
  );
});

const HomeNav = React.memo(() => {
  return (
    <PillNav
      logo={ghost}
      items={[{ label: "How It Works", href: "/" }]}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 home-nav"
      ease="power2.easeOut"
      baseColor="white"
      pillColor="black"
      hoveredPillTextColor="black"
      pillTextColor="white"
      animationDelay={6.1}
    />
  );
});

// Give it a display name for debugging
InterviewBackground.displayName = "InterviewBackground";
CallNav.displayName = "CallNav";
HomeNav.displayName = "HomeNav";

function ChatConversation() {
  const {
    addMessage,
    message,
    isProcessing,
    setIsProcessing,
    handleOptionUpdate,
    survey,
    deleteMessage,
    setCodingMode,
    codingMode
  } = useChat();

  // gsap animations

  gsap.registerPlugin(SplitText);

  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef();
  const splitRef = useRef(null);
  const tlRef = useRef(null);
  const tlBtn = useRef(null);
  const callContainerRef = useRef(null);
  const buttonRef = useRef(null);

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
        y: 60, // Start lower
        scale: 0.55, // Start slightly smaller
        opacity: 0,
        filter: "blur(10px)",
      },
      {
        y: 0,
        scale: 1,
        opacity: 1.1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power4.Out",
        clearProps: "all", // Clean up afterwards
      },
      "-=0.4" // Start overlapping slightly with the text exit
    );
  }, [survey.isCompleted]);

  // gsap animations for call control buttons

  const [callEnd, setCallEnd] = useState(true);

  const { contextSafe } = useGSAP(
    () => {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
      );
    },
    { dependencies: [callEnd], scope: callContainerRef }
  );

  const onEnter = contextSafe(() => {});

  // voice call refs and states

  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [orbState, setOrbState] = useState("listening");

  const [isMuted, setIsMuted] = useState(true);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const nextStartTimeRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [selectedVoice, setSelectedVoice] = useState("aura-2-thalia-en");

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

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
      console.log(callEnd);

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

      // creating a websocket connection (socketRef)
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
        console.log("history", historyMessages);

        // 1. Get Mic And Video Stream FIRST to know the Sample Rate
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

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
              encoding: "linear16",
              sample_rate: sampleRate,
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
              functions: [
                {
                  name: "enable_coding_mode",
                  description:
                    "Call this Function when you ask a coding question that requires the user to write code.",
                  parameters: {
                    type: "object",
                    properties: {},
                  },
                },
              ],
            },
            speak: {
              provider: { type: "deepgram", model: selectedVoice },
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
        // 'message' is the Event Object from the browser, 'message.data' is the actual payload from deepgram (writing so i dont get confused later)
        if (message.data instanceof Blob) {
          playAudio(message.data);
          setOrbState("talking");
          // console.log("blob data", message.data)
          console.log(orbState);
        } else {
          const event = JSON.parse(message.data);
          console.log("event", event);

          if (event.type === "FunctionCallRequest") {
            // function request
            const call = event.functions[0];
            // console.log("name", call.name)
            // console.log("id", call.id)

            if (call.name === "enable_coding_mode") {
              setCodingMode(true);
              const response = {
                type: "FunctionCallResponse",
                id: call.id,
                name: call.name,
                content:
                  "Coding mode enabled. The user is now seeing the code box.",
              };
              console.log("function response", JSON.stringify(response));
              console.log(
                "succesfully recieved the function call, coding mode enabled"
              );

              socketRef.current.send(JSON.stringify(response));
            }
          }

          if (event.type === "Error") console.error("DEEPGRAM ERROR:", event);

          if (event.type === "ConversationText") {
            addMessage(
              event.role === "user" ? "user" : "assistant",
              event.content
            );
            //  console.log("text daata", message);
          }
          if (event.type === "UserStartedSpeaking") setOrbState("listening");
        }
      };
    } catch (error) {
      console.error("❌ Setup Error:", error);
      if (isMounted) setConnectionStatus("error");
    }
  };

  const handleCodeSubmit = (codeSnippet) => {
    if (connectionStatus === "active") {
      const response = {
        type: "ConversationText",
        role: "user",
        content: `Here is the code i wrote:\n ${codeSnippet}`,
      };

      console.log("code submit response", response);
      socketRef.current.send(JSON.stringify(response));
      
    }
  };

  // show the interview interface if survey is completed

  if (survey.isCompleted && !codingMode) {
    return (
      // 1. MAIN CONTAINER: Full Screen & Relative
      <div className="h-screen w-screen relative bg-[#09090b] overflow-hidden flex items-center justify-center pb-20">
        <InterviewBackground />
        <div className="relative z-10 w-full flex items-center justify-center px-4 pointer-events-none">
          <Card className="chat-card-container pointer-events-auto w-full max-w-5xl h-[75vh] min-h-[550px] max-h-[850px] bg-[#09090b]/80 shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
            <div className="flex h-full flex-col z-10 relative w-full">
              <Conversation className="flex-1 overflow-y-auto overflow-x-hidden relative">
                <ConversationContent className="p-2 md:p-4 space-y-4">
                  {callEnd ? (
                    <ConversationEmptyState
                      icon={<Orb className="size-25" agentState="listening" />}
                      title="Are You Ready?"
                      description="Start the Call to see the messages here"
                      className="flex justify-center items-center"
                    />
                  ) : (
                    <>
                      {console.log(message)}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-10 w-full max-w-5xl mx-auto">
                        {/* CARD 1 */}
                        <div className="border border-zinc-700 rounded-xl bg-zinc-900/50 flex justify-center items-center aspect-video overflow-hidden shadow-lg">
                          <Orb
                            className="w-full h-[85%] object-cover"
                            agentState={orbState}
                          />
                        </div>

                        {/* CARD 2 */}
                        <div className="border border-zinc-700 rounded-xl bg-zinc-900/50 flex justify-center items-center aspect-video overflow-hidden shadow-lg">
                          <video
                            ref={videoRef}
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                            playsInline
                            autoPlay
                          />
                        </div>
                      </div>

                      {message.length > 0 && (
                        <div className="text-center pt-12">
                          <p className="text-white">
                            {message[message.length - 1].text}
                          </p>
                        </div>
                      )}
                    </>
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
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-500",
                          connectionStatus === "active"
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                            : connectionStatus === "idle"
                            ? "bg-zinc-600"
                            : "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
                          (connectionStatus === "active" ||
                            connectionStatus === "connecting") &&
                            "animate-pulse"
                        )}
                      />
                      {(connectionStatus === "active" ||
                        connectionStatus === "listening") && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40" />
                      )}
                      {connectionStatus === "connecting" && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-500 animate-pulse opacity-60" />
                      )}
                      {connectionStatus === "idle" && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-zinc-600/30 animate-pulse" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold hidden sm:inline transition-colors duration-300",
                        connectionStatus === "active"
                          ? "text-emerald-400"
                          : connectionStatus === "idle"
                          ? "text-zinc-500"
                          : "text-amber-400 font-bold"
                      )}
                    >
                      {connectionStatus === "idle"
                        ? "Idle"
                        : connectionStatus === "active"
                        ? "Listening"
                        : "Connecting"}
                    </span>
                  </div>

                  <div className="flex-1 max-w-[200px]">
                    <VoicePicker
                      value={selectedVoice}
                      onValueChange={setSelectedVoice}
                      disabled={!callEnd}
                    />
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

                    <div
                      ref={callContainerRef}
                      className="relative flex justify-between"
                    >
                      {!callEnd ? (
                        <button
                          onClick={endCall}
                          ref={buttonRef}
                          className="end-btn px-5 py-2.5 bg-red-500 text-black text-sm font-medium rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/25"
                        >
                          End Call
                        </button>
                      ) : (
                        <button
                          onClick={startAgent}
                          ref={buttonRef}
                          className="start-btn px-5 py-2.5 bg-emerald-500 text-black text-sm font-medium rounded-full hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                        >
                          Start Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        {!callEnd && <CallNav />}
      </div>
    );
  }

  if (codingMode) {
    <Card className="chat-card-container pointer-events-auto w-full max-w-5xl h-[75vh] min-h-[550px] max-h-[850px] bg-[#09090b]/80 shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
      <h1>helloo</h1>
    </Card>;
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
      <HomeNav />
    </WavyBackground>
  );
}

export default ChatConversation;
