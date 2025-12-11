import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { useChat } from "../createContext";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

function ChatConversation() {
  const { message } = useChat();

  return (
    <div>
      <Conversation>
        <ConversationContent>
          {message.length === 0 ? (
            <ConversationEmptyState
              icon={<Orb className="size-12" />}
              title="No messages yet"
              description="Start a conversation to see messages here"
            />
          ) : (
            message.map((msg, index) => {
              const textContent = msg.text || "";
              // Map your "sender" to the UI's expected "role"
              const role = msg.sender === "user" ? "user" : "assistant";

              const stream = textContent.split(" ").map((word) => ({
                text: word + "\u00A0",
                className: role === "user" 
                  ? "text-white text-sm" // User text is white (on dark bubble)
                  : "text-black text-sm", // AI text is black (on light bubble)
              }));

              return (
                <div 
                  key={index} 
                  className={`flex w-full mb-4 ${
                    role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Message 
                    from={role} 
                    className={`max-w-[80%] ${
                      role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 border text-black"
                    }`}
                  >
                    <MessageContent>
                       <TypewriterEffectSmooth words={stream} />
                    </MessageContent>

                    {/* Show Orb only for Assistant */}
                    {role === "assistant" && (
                      <div className="absolute -left-10 top-0 ring-border size-8 overflow-hidden rounded-full ring-1">
                        <Orb className="h-full w-full" agentState="talking" />
                      </div>
                    )}
                  </Message>
                </div>
              );
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

export default ChatConversation;