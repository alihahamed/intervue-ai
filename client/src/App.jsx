
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
        <>
        <ChatConversation />
        </>
      </ChatProvider>
    </>
  );
}

export default App;
