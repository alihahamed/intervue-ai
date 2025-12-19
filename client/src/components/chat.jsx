import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";
import { useState } from "react";

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
  const { addMessage ,message, isProcessing, setIsProcessing } = useChat();
  const [option, setOption] = useState("")

  const handleOption = (option) => {
    addMessage("chosenOption", option)
    console.log("chosen option", option)
  }

 

  return (
    <WavyBackground className="p-4">
      {console.log(isProcessing)}
      <div className="font-bold text-4xl md:text-5xl lg:text-[68px]  mb-6 text-center tracking-tight z-10">
        <h1>
          Master Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-700">
            Next Interview.
          </span>
        </h1>
      </div>

      {/* 2. Description - Removed 'relative bottom-12', used standard margins */}
      <div className="text-sm md:text-lg text-center text-gray-200 leading-relaxed max-w-2xl mx-auto mb-8 px-4 z-10">
        <p>
          An autonomous interview agent that listens, processes, and speaks.
          Built with SLMs for rapid reasoning and realistic speech interaction.
        </p>
      </div>

      {/* 3. Pills - Removed 'relative bottom-10', kept standard flex layout */}
      <div className="gap-3 flex justify-center items-center mb-10 z-10">
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

      {isProcessing ? (
        <Card className="relative mx-auto items-center justify-center w-[90%] md:w-full max-w-3xl h-[620px] md:h-[450px] xl:h-[500px] 2xl:h-[480px]  bg-[#09090b]/90 border border-[#27272a] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
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
                    const isUser = msg.sender === "user";
                    const isOptions = msg.sender === "chosenOption"
                    const textContent = isUser
                      ? msg.text
                      : `${msg.text.feedback || ""} ${
                          msg.text.nextQuestion || ""
                        }`;
                    const grade = !isUser ? msg.text.grade : undefined;
                    const options = !isUser && !isOptions ? msg.text.options.map((opt) => (
                      <button className="bg-white text-black" onClick={() => handleOption(opt)} key={opt}>{opt}</button>
                    )) : null
                    
                    

                    return (
                      <Message
                        key={msg.id || index}
                        from={isUser ? "user" : "assistant"}
                        className={`flex w-full gap-2 md:gap-3 items-start py-1 md:py-2 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="ring-border size-6 md:size-8 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-1 bg-black">
                            <Orb
                              className="h-full w-full"
                              agentState="talking"
                            />
                          </div>
                        )}

                        <MessageContent
                          className={cn(
                            "relative flex flex-col gap-2 rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm shadow-sm",
                            "w-fit max-w-[90%] md:max-w-[85%] whitespace-pre-wrap break-words",
                            isUser
                              ? "bg-white text-black rounded-br-none ml-auto"
                              : "bg-[#27272a] text-white rounded-tl-none mr-auto overflow-visible"
                          )}
                        >
                          {!isUser && grade !== undefined && (
                            <GradeBadge grade={grade} />
                          )}
                          {!isUser ? (
                            <TextGenerateEffect words={textContent} />
                          ) : (
                            textContent
                          )}
                          {options}
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
          <Button onClick={() => setIsProcessing(true)}>Get started</Button>
        </div>
      )}
    </WavyBackground>
  );
}

export default ChatConversation;
