import { useState } from "react";
import "./App.css";

// コンポーネントと型のインポート
import TitleScreen from "./components/TitleScreen";
import SetupScreen from "./components/SetupScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import type { ScreenState, GameResult } from "./types";

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");
  const [gameResult, setGameResult] = useState<GameResult>(null);

  const handleGameEnd = (result: GameResult) => {
    setGameResult(result);
    setCurrentScreen("result");
  };

  return (
    <div className="app-container">
      {currentScreen === "title" && (
        <TitleScreen onStart={() => setCurrentScreen("setup")} />
      )}
      
      {currentScreen === "setup" && (
        <SetupScreen onNext={() => setCurrentScreen("play")} />
      )}
      
      {currentScreen === "play" && (
        <PlayScreen onEnd={handleGameEnd} />
      )}
      
      {currentScreen === "result" && (
        <ResultScreen 
          result={gameResult} 
          onBack={() => {
            setGameResult(null);
            setCurrentScreen("title");
          }} 
        />
      )}
    </div>
  );
}

export default App;
