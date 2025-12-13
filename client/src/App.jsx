
import { ChatProvider } from "./chatContext";
import "./App.css";
import ChatConversation from "./components/chat";
import { WavyBackground } from "./components/ui/wavy-background";
import ChatInput from './components/chatInput'

function App() {
  return (
    <>
      <ChatProvider>
        
        {/* <AudioRecorder /> */}
        <WavyBackground className="max-w-4xl mx-auto">
        <ChatConversation />
        </WavyBackground>
      </ChatProvider>
    </>
  );
}

export default App;
