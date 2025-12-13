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

function ChatConversation() {
  const { message } = useChat();
  console.log(message);

  return (
    <>
    
      <div className="flex items-center justify-center w-full p-4">
        
        <Card className="w-full max-w-3xl mx-auto h-[550px] bg-[#09090b] border border-[#27272a] shadow-xl rounded-xl overflow-hidden">
          <div className="flex h-full flex-col">
            <Conversation className="h-full overflow-hidden">
              <ConversationContent className="p-4 space-y-4">
                {message.length === 0 ? (
                  <ConversationEmptyState
                    icon={<Orb className="size-12" agentState={"listening"} />}
                    title="No messages yet"
                    description="Start a conversation to see messages here"
                  />
                ) : (
                  message.map((msg, index) => {
                    const textContent = msg.sender === "assistant" ? `${msg.text.greeting} ${msg.text.grade} ${msg.text.feedback} ${msg.text.nextQuestion}` : msg.text
                      
                    const role = msg.sender === "user" ? "user" : "assistant";
                    const isUser = role === "user";

                    
                    

                    return (
                      <Message
                        key={index}
                        from={role}
                        // ALIGNMENT:
                        // User: justify-end
                        // Assistant: justify-end + flex-row-reverse (so Avatar is on Left visually)
                        className={`flex w-full gap-3 items-start py-2 ${
                          isUser
                            ? "justify-end"
                            : "justify-end flex-row-reverse"
                        }`}
                      >
                        {/* BUBBLE CONTENT */}
                        {/* w-fit: Makes bubble hug the text (fixes "too large") */}
                        {/* max-w-[80%]: Ensures it wraps before hitting edge */}
                        <MessageContent
                          className={`
                          relative flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm
                          w-fit max-w-[70%] overflow-hidden whitespace-pre-wrap break-words
                          ${
                            isUser
                              ? "bg-white text-black rounded-br-none"
                              : "bg-[#27272a] text-white rounded-tl-none"
                          }
                        `}
                        >
                          {role === "assistant" ? (
                            <TextGenerateEffect words={textContent} />
                          ) : (
                            textContent
                          )}
                        </MessageContent>

                        {/* ASSISTANT AVATAR (ORB) */}
                        {/* Rendered 'after' content in DOM, but visually on LEFT due to flex-row-reverse */}
                        {!isUser && (
                          <div className="ring-border size-10 overflow-hidden rounded-full ring-1 flex-shrink-0 mt-0.5  ">
                            <Orb
                              className="h-full w-full"
                              agentState="talking"
                            />
                          </div>
                        )}
                      </Message>
                    );
                  })
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <ChatInput />
          </div>
        </Card>
        
      </div>
      
    </>
  );
}

export default ChatConversation;
