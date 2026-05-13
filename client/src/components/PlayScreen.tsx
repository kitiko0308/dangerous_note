import React, { useState } from 'react';
import type { Player, GamePhase, GameResult } from '../types';

import MorningPhase from './game/MorningPhase';
import MiniGamePhase from './game/MiniGamePhase';
import NoonResultPhase from './game/NoonResultPhase';
import VotingPhase from './game/VotingPhase';
import ExileResultPhase from './game/ExileResultPhase';
import MidnightPhase from './game/MidnightPhase';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onEnd: (result: GameResult) => void;
};

export default function PlayScreen({ players, setPlayers, onEnd }: Props) {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("morning");
  const [exiledPlayerId, setExiledPlayerId] = useState<number | null>(null);
  
  const [lastEvents, setLastEvents] = useState<string[]>(["ゲーム開始！最初のターンです。"]);
  const [nightActionLogs, setNightActionLogs] = useState<string[]>([]);

  const handleVote = (id: number | null) => {
    setExiledPlayerId(id);
    
    // もし追放された人がいたら、その人の生存フラグを折る
    if (id !== null) {
      const newPlayers = players.map(p => 
        p.id === id ? { ...p, isAlive: false } : p
      );
      setPlayers(newPlayers);
    }
    
    setPhase("exile_result");
  };

  const handleNextPhase = () => {
    switch (phase) {
      case "morning": setPhase("mini_game"); break;
      case "mini_game": setPhase("noon_result"); break;
      case "noon_result": setPhase("voting"); break;
      case "voting": 
        // handleVote() で遷移するためここは通らない
        break;
      case "exile_result":
        // 追放された人がキラなら村人の勝ち
        const exiledPlayer = exiledPlayerId !== null ? players.find(p => p.id === exiledPlayerId) : null;
        if (exiledPlayer?.role === "kira") {
          onEnd("villager_win");
        } else {
          setPhase("midnight"); 
        }
        break;
      case "midnight":
        if (turn >= 5) {
          // 判定ロジック...
          const kiraKills = players.filter(p => !p.isAlive && p.role !== 'kira').length; 
          if (kiraKills === 0) onEnd("kira_lose");
          else onEnd("kira_win");
        } else {
          setTurn(turn + 1);
          setPhase("morning"); // 深夜の次は「朝」
          setLastEvents(nightActionLogs.length > 0 ? nightActionLogs : ["静かな夜が明けました。"]);
          setNightActionLogs([]); // ログをリセット
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
        {phase === "morning" && (
          <MorningPhase events={lastEvents} onNext={handleNextPhase} />
        )}
        {phase === "mini_game" && (
          <MiniGamePhase onNext={handleNextPhase} />
        )}
        {phase === "noon_result" && (
          <NoonResultPhase players={players} setPlayers={setPlayers} onNext={handleNextPhase} />
        )}
        {phase === "voting" && (
          <VotingPhase players={players} setPlayers={setPlayers} onVote={handleVote} />
        )}
        {phase === "exile_result" && (
          <ExileResultPhase exiledPlayerId={exiledPlayerId} players={players} onNext={handleNextPhase} />
        )}
        {phase === "midnight" && (
          <MidnightPhase players={players} setPlayers={setPlayers} setNightActionLogs={setNightActionLogs} onNext={handleNextPhase} />
        )}
      </main>
    </div>
  );
}
