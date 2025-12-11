import AudioRecorder from "./components/audioRecorder";
import { ChatProvider } from "./chatContext";
import "./App.css";

function App() {
  return (
    <>
      <ChatProvider>
        <AudioRecorder />
      </ChatProvider>
    </>
  );
}

export default App;
