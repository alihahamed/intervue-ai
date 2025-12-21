import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";
import { useState, useRef } from "react";
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

const GradeBadge = ({ grade }) => {
  if (grade === null || grade === undefined) return null;

  let styles = "bg-red-500 border-red-600 text-white shadow-red-500/30";
  if (grade >= 8) {
    styles = "bg-green-500 border-green-600 text-black shadow-green-500/30";
  } else if (grade >= 5) {
    styles = "bg-amber-500 border-amber-600 text-white shadow-amber-500/30";
  }

  return (
    <Badge
      className={cn(
        "absolute -top-3 -right-1 md:-right-2 z-20 pointer-events-none shadow-md",
        "px-2 py-0.5 text-[10px] h-5 min-w-fit justify-center rounded-full border",
        styles
      )}
    >
      Grade: {grade}
    </Badge>
  );
};

function ChatConversation() {
  const {
    addMessage,
    message,
    isProcessing,
    setIsProcessing,
    handleOptionUpdate,
    survey
  } = useChat();

  const handleOption = (option) => {
    handleOptionUpdate(option);
    console.log("chosen option", option);
  };

  // gsap animations

  gsap.registerPlugin(SplitText);

  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef();
  const splitRef = useRef(null);
  const tlRef = useRef(null)

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
  });

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
      },"<"  
    );
  }, [isHovered]);

  // useGSAP for pushing the hero text, sub text and the pills up when the chat card appears

  useGSAP(() => {
      if(!isProcessing && !survey.isCompleted) return

      gsap.from(".heroText", {
        opacity:0,
        duration:1.5,
        y:100,
        stagger:0.05,
        ease:"power3.out"
      })

      gsap.from(".subtitleText", {
        y:100,
        opacity:0,
        duration:1.5,
        stagger:0.05,
        ease:"power3.out",
        delay:0.5
      })
  }, [ survey.isCompleted])

  return (
    <WavyBackground className="p-4">
      {console.log(isProcessing)}
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

      {/* 3. Pills - Removed 'relative bottom-10', kept standard flex layout */}
      <div className="gap-3 flex justify-center items-center mb-5 z-10">
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

      {isProcessing && survey.isCompleted ?  (
        <Card className="relative mx-auto items-center justify-center w-[90%] md:w-full max-w-3xl h-[620px] md:h-[450px] xl:h-[500px] 2xl:h-[490px]  bg-[#09090b]/90 border border-[#27272a] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
          <div className="flex h-full flex-col z-10 relative w-full">
            <Conversation className="flex-1 overflow-y-auto overflow-x-hidden">
              <ConversationContent className="p-2 md:p-4 space-y-4">
                {message.length === 0 ? (
                  <ConversationEmptyState
                    icon={<Orb className="size-12" agentState="listening" />}
                    title="No messages yet"
                    description="Start a conversation to see messages here"
                  />
                ) : (
                  message.map((msg, index) => {
                    if (msg.sender === "chosenOption") return null;
                    const isUser = msg.sender === "user";
                    const isOptions = msg.sender === "chosenOption";
                    const textContent = isUser
                      ? msg.text
                      : `${msg.text.feedback || ""} ${
                          msg.text.nextQuestion || ""
                        }`;
                    const grade = !isUser ? msg.text.grade : undefined;
                    const options =
                      !isUser && !isOptions && msg.text.options
                        ? msg.text.options.map((opt) => (
                            <button
                              // w-fit: only as wide as the text
                              // bg-transparent/10: subtle background
                              // border-white/20: nice visible border
                              className="w-fit text-left bg-white/5 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/20 transition-colors"
                              onClick={() => handleOption(opt)}
                              key={opt}
                            >
                              {opt}
                            </button>
                          ))
                        : null;

                    return (
                      <Message
                        key={msg.id || index}
                        from={isUser ? "user" : "assistant"}
                        className={`flex w-full gap-2 md:gap-3 items-start py-1 md:py-2 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* AVATAR (Unchanged) */}
                        {!isUser && (
                          <div className="ring-border size-6 md:size-8 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-1 bg-black">
                            <Orb
                              className="h-full w-full"
                              agentState="talking"
                            />
                          </div>
                        )}

                        {/* BUBBLE CONTENT */}
                        <MessageContent
                          className={cn(
                            // Added 'flex flex-col gap-3' to space out text and buttons
                            "relative flex flex-col gap-3 rounded-2xl px-4 py-3 text-sm shadow-sm",
                            "w-fit max-w-[90%] md:max-w-[85%] whitespace-pre-wrap break-words",
                            isUser
                              ? "bg-white text-black rounded-br-none ml-auto"
                              : "bg-[#27272a] text-white rounded-tl-none mr-auto overflow-visible"
                          )}
                        >
                          {!isUser && grade !== undefined && (
                            <GradeBadge grade={grade} />
                          )}

                          {/* TEXT */}
                          <div>
                            {!isUser ? (
                              <TextGenerateEffect words={textContent} />
                            ) : (
                              textContent
                            )}
                          </div>

                          {/* OPTIONS - RENDERED INSIDE */}
                          {options && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {options}
                            </div>
                          )}
                        </MessageContent>
                      </Message>
                    );
                  })
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="p-2 md:p-0">
              <ChatInput />
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setIsProcessing(true)}
            className="overflow-hidden"
            onMouseEnter={() => tlRef.current?.play()}
            onMouseLeave={() => tlRef.current?.reverse()}
          >
            <div
              ref={containerRef}
              className="relative h-5 overflow-hidden flex flex-col"
            >
              {/* Original Text */}
              <span className=" btn-text-1" style={{ whiteSpace: 'pre' }}>
                Get started
              </span>

              {/* Duplicate Text (Waiting below) */}
              <span className=" absolute top-full left-0 right-0 btn-text-2" style={{ whiteSpace: 'pre' }}>
                Get started
              </span>
            </div>
          </Button>
        </div>
      )}
    </WavyBackground>
  );
}

export default ChatConversation;
