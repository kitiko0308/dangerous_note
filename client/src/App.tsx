import { useState } from "react";
import "./App.css";

// コンポーネントのインポート
import LandingPage from "./pages/landing/LandingPage";
import RulesPage from "./pages/rules/RulesPage";
import PlayerSetuppage from "./pages/game-setup/PlayerSetuppage";
import RoleRevealPage from "./pages/game-setup/RoleRevealPage";
import GamePage from "./pages/game/GamePage";
import ResultPage from "./pages/result/ResultPage";

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
        <LandingPage 
          onStart={() => setCurrentScreen("setup")} 
          onShowRules={() => setCurrentScreen("rules")}
        />
      )}

      {currentScreen === "rules" && (
        <RulesPage onBack={() => setCurrentScreen("title")} />
      )}
      
      {currentScreen === "setup" && (
        <PlayerSetuppage 
          players={players} 
          setPlayers={setPlayers}
          onNext={() => setCurrentScreen("role_reveal")} 
        />
      )}

      {currentScreen === "role_reveal" && (
        <RoleRevealPage 
          players={players}
          onNext={() => setCurrentScreen("play")} 
        />
      )}
      
      {currentScreen === "play" && (
        <GamePage 
          players={players}
          setPlayers={setPlayers}
          onEnd={handleGameEnd} 
        />
      )}
      
      {currentScreen === "result" && (
        <ResultPage 
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
