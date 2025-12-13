import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";

import { Orb } from "./ui/Orb";
import { Message, MessageContent } from "./ui/message";
import { Card } from "./ui/card";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { BackgroundLines } from "./ui/background-lines";
import ChatInput from "./chatInput";
import { WavyBackground } from "./ui/wavy-background";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "./ui/glowing-effect";

// 1. Updated Badge Styling (Absolute Position)
const GradeBadge = ({ grade }) => {
  if (grade === null || grade === undefined) return null;

  // Solid colors for the "Notification" pop effect
  let styles = "bg-red-500 border-red-600 text-white shadow-red-500/30";
  if (grade >= 8) {
    styles = "bg-green-500 border-green-600 text-black shadow-green-500/30";
  } else if (grade >= 5) {
    styles = "bg-amber-500 border-amber-600 text-white shadow-amber-500/30";
  }

  return (
    <Badge
      className={cn(
        // Absolute positioning: Moves it to Top-Right corner, slightly outside
        "absolute -top-3 -right-2 z-20 pointer-events-none shadow-md",
        "px-2 py-0.5 text-[10px] h-5 min-w-fit justify-center rounded-full border",
        styles
      )}
    >
      Grade: {grade}
    </Badge>
  );
};

function ChatConversation() {
  const { message } = useChat();

  return (
    <WavyBackground 
      className="w-full max-w-4xl mx-auto pb-40"
      containerClassName="w-full min-h-screen"
    >
      {/* Main Container:
        - Replaces 'Card' to give us full control over layering.
        - bg-[#09090b]/80 gives a dark tint but lets the glow shine through.
      */}
      <div className="relative w-full max-w-3xl mx-auto h-[550px] md:h-[600px] rounded-xl border border-[#27272a] shadow-2xl overflow-hidden bg-[#09090b]/80 backdrop-blur-sm">
        
        {/* LAYER 1: Glowing Effect (Background) */}
        <div className="absolute inset-0 z-0">
           <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={20}
            inactiveZone={0.01}
          />
        </div>

        {/* LAYER 2: Content (Foreground) */}
        {/* CRITICAL FIX: 'pointer-events-none' allows the mouse to pass through 
            the container to trigger the glow underneath. 
        */}
        <div className="relative z-10 flex h-full flex-col pointer-events-none">
            
            {/* Scroll Area: Re-enable pointer events so user can scroll/copy text */}
            <div className="flex-1 overflow-hidden pointer-events-auto">
                <Conversation className="h-full">
                  <ConversationContent className="p-4 space-y-4">
                    {message.length === 0 ? (
                      <ConversationEmptyState
                        icon={<Orb className="size-12" agentState="listening" />}
                        title="No messages yet"
                        description="Start a conversation to see messages here"
                      />
                    ) : (
                      message.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        const textContent = isUser
                          ? msg.text
                          : `${msg.text.feedback || ""} ${
                              msg.text.nextQuestion || ""
                            }`;
                        const grade = !isUser ? msg.text.grade : undefined;

                        return (
                          <Message
                            key={msg.id || index}
                            from={isUser ? "user" : "assistant"}
                            className={`flex w-full gap-3 items-start py-2 ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isUser && (
                              <div className="ring-border size-8 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-1 bg-black">
                                <Orb className="h-full w-full" agentState="talking" />
                              </div>
                            )}

                            <MessageContent
                              className={cn(
                                "relative flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
                                "w-fit max-w-[85%] whitespace-pre-wrap break-words",
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
                            </MessageContent>
                          </Message>
                        );
                      })
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
            </div>

            {/* Input Area: Re-enable pointer events so user can type */}
            <div className="pointer-events-auto p-2 bg-[#09090b]/50">
               <ChatInput />
            </div>
        </div>
          
      </div>
    </WavyBackground>
  );
}

export default ChatConversation;
