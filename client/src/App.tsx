import { useState } from "react";
import "./App.css";

// コンポーネントのインポート
import TitleScreen from "./components/TitleScreen";
import SetupScreen from "./components/SetupScreen";
import RoleRevealScreen from "./components/RoleRevealScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";

// 型のインポート（import type を使用）
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
        <SetupScreen onNext={() => setCurrentScreen("role_reveal")} />
      )}

      {currentScreen === "role_reveal" && (
        <RoleRevealScreen onNext={() => setCurrentScreen("play")} />
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
