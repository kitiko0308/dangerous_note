import React, { useState } from 'react';
import type { GamePhase, GameResult } from '../types';

// フェーズごとのコンポーネントをインポート
import MorningPhase from './game/MorningPhase';
import MiniGamePhase from './game/MiniGamePhase';
import NoonResultPhase from './game/NoonResultPhase';
import VotingPhase from './game/VotingPhase';
import NightPhase from './game/NightPhase';

type Props = {
  onEnd: (result: GameResult) => void;
};

export default function PlayScreen({ onEnd }: Props) {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("morning");

  // フェーズの遷移管理
  const handleNextPhase = () => {
    switch (phase) {
      case "morning": setPhase("mini_game"); break;
      case "mini_game": setPhase("noon_result"); break;
      case "noon_result": setPhase("voting"); break;
      case "voting": setPhase("night"); break;
      case "night":
        if (turn >= 5) {
          onEnd("kira_win"); // 仮の勝敗
        } else {
          setTurn(turn + 1);
          setPhase("morning");
        }
        break;
    }
  };

  return (
    <div style={{ padding: 20, color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #555', paddingBottom: 10, marginBottom: 20, textAlign: 'center' }}>
        <h2>第 {turn} ターン / 5ターン中</h2>
      </header>

      <main>
        {phase === "morning" && <MorningPhase onNext={handleNextPhase} />}
        {phase === "mini_game" && <MiniGamePhase onNext={handleNextPhase} />}
        {phase === "noon_result" && <NoonResultPhase onNext={handleNextPhase} />}
        {phase === "voting" && <VotingPhase onNext={handleNextPhase} />}
        {phase === "night" && <NightPhase onNext={handleNextPhase} />}
      </main>
    </div>
  );
}
