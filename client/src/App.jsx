
import { ChatProvider } from "./chatContext";
import "./App.css";
import ChatConversation from "./components/chat";
import { WavyBackground } from "./components/ui/wavy-background";
import ChatInput from './components/chatInput'
import SurveyModal from "./components/surveyModal";

function App() {
  return (
    <>
      <ChatProvider>
        
        {/* <AudioRecorder /> */}
        <>
        {/* <ChatConversation /> */}
        <SurveyModal />
        </>
      </ChatProvider>
    </>
  );
}

export default App;
