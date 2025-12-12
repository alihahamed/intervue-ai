import AudioRecorder from "./components/audioRecorder";
import { ChatProvider } from "./chatContext";
import "./App.css";
import ChatConversation from "./components/chat";

import ChatInput from './components/chatInput'

function App() {
  return (
    <>
      <ChatProvider>
        
        <AudioRecorder />
        <ChatInput />
        <ChatConversation />
      </ChatProvider>
    </>
  );
}

export default App;
