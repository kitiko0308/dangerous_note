import { useState } from "react";
import "./App.css";

// コンポーネントのインポート
import TitleScreen from "./pages/TitleScreen";
import RulesScreen from "./pages/RulesScreen";
import SetupScreen from "./pages/SetupScreen";
import RoleRevealScreen from "./pages/RoleRevealScreen";
import PlayScreen from "./pages/PlayScreen";
import ResultScreen from "./pages/ResultScreen";

// 型のインポート
import type { ScreenState, GameResult, Player } from "./types";

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");
  const [gameResult, setGameResult] = useState<GameResult>(null);

  // 全プレイヤーのデータを管理
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      nickname: "",
      realName: "",
      role: "villager",
      isAlive: true,
      items: [],
      revealedChars: [],
      kiraRevealedChars: [],
      isKilledByKira: false,
    }))
  );

  const handleGameEnd = (result: GameResult) => {
    setGameResult(result);
    setCurrentScreen("result");
  };

  return (
    <div className="app-container">
      {currentScreen === "title" && (
        <TitleScreen 
          onStart={() => setCurrentScreen("setup")} 
          onShowRules={() => setCurrentScreen("rules")}
        />
      )}

      {currentScreen === "rules" && (
        <RulesScreen onBack={() => setCurrentScreen("title")} />
      )}
      
      {currentScreen === "setup" && (
        <SetupScreen 
          players={players} 
          setPlayers={setPlayers}
          onNext={() => setCurrentScreen("role_reveal")} 
        />
      )}

      {currentScreen === "role_reveal" && (
        <RoleRevealScreen 
          players={players}
          onNext={() => setCurrentScreen("play")} 
        />
      )}
      
      {currentScreen === "play" && (
        <PlayScreen 
          players={players}
          setPlayers={setPlayers}
          onEnd={handleGameEnd} 
        />
      )}
      
      {currentScreen === "result" && (
        <ResultScreen 
          result={gameResult} 
          players={players}
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
