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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "./ui/glowing-effect";
import ChatInput from "./chatInput";
import { WavyBackground } from "./ui/wavy-background";

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
  const { message } = useChat();

  return (
    <WavyBackground className="p-4">
      <Card className="relative mx-auto items-center justify-center w-[90%] md:w-full max-w-3xl h-[750px] md:h-[600px] bg-[#09090b]/90 border border-[#27272a] shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300">
        
        <div className="absolute inset-0 z-0 rounded-xl overflow-hidden pointer-events-none">
          <GlowingEffect
            blur={0.4}
            borderWidth={2}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            variant="default"
          />
        </div>

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
                      className={`flex w-full gap-2 md:gap-3 items-start py-1 md:py-2 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="ring-border size-6 md:size-8 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-1 bg-black">
                          <Orb className="h-full w-full" agentState="talking" />
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
    </WavyBackground>
  );
}

export default ChatConversation;