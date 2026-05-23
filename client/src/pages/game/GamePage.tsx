
import { toFullWidth } from '../../utils/numberFormat';
import React, { useRef, useState } from "react";
import type { Player, GamePhase, GameResult } from "../../types";

import MorningPhase from "../../components/game/MorningPhase";
import MiniGamePhase from "../../components/game/MiniGamePhase";
import MiniGameResultPhase from "../../components/game/MiniGameResultPhase";
import VotingPhase from "../../components/game/VotingPhase";
import ExileResultPhase from "../../components/game/ExileResultPhase";
import MidnightPhase from "../../components/game/MidnightPhase";

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onEnd: (result: GameResult, turn: number) => void;
};

export default function GamePage({ players, setPlayers, onEnd }: Props) {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("morning");
  const [exiledPlayerId, setExiledPlayerId] = useState<number | null>(null);
  const [_lastExiledPlayerName, setLastExiledPlayerName] = useState<
    string | null
  >(null);

  const [lastEvents, setLastEvents] = useState<string[]>([
    "ゲーム開始！最初のターンです。",
  ]);
  const [nightActionLogs, setNightActionLogs] = useState<string[]>([]);
  const [miniGameRanking, setMiniGameRanking] = useState<number[]>([]);
  const [miniGameTaps, setMiniGameTaps] = useState<Record<number, number>>({});
  const hasEndedRef = useRef(false);

  

  const finishGame = (result: GameResult, completedTurn: number = turn) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    onEnd(result, completedTurn);
  };

  const handleVote = (id: number | null) => {
    setExiledPlayerId(id);

    let updatedPlayers = players;

    // もし追放された人がいたら、その人の生存フラグを折り、名前を記録する
    if (id !== null) {
      const exiledP = players.find((p) => p.id === id);
      setLastExiledPlayerName(exiledP?.nickname || null);

      updatedPlayers = players.map((p) =>
        p.id === id ? { ...p, isAlive: false } : p,
      );
      setPlayers(updatedPlayers);
    } else {
      setLastExiledPlayerName(null);
    }

    // 勝利判定：キラが追放されたら村人勝利
    if (id !== null) {
      const exiledP = updatedPlayers.find((p) => p.id === id);
      if (exiledP?.role === "kira") {
        finishGame("villager_win", turn);
        return;
      }
    }

    // 勝利判定：キラ以外の生存者がいなくなったらキラ勝利
    const otherSurvivors = updatedPlayers.filter(
      (p) => p.isAlive && p.role !== "kira",
    );
    if (otherSurvivors.length === 0) {
      finishGame("kira_win", turn);
      return;
    }

    setPhase("exile_result");
  };

  type MiniGameResults = { rankingIds: number[]; taps: Record<number, number> };

  const handleNextPhase = (miniGameResults?: MiniGameResults) => {
    if (miniGameResults) {
      setMiniGameRanking(miniGameResults.rankingIds);
      setMiniGameTaps(miniGameResults.taps || {});
    }
    switch (phase) {
      case "morning":
        setPhase("mini_game");
        break;
      case "mini_game":
        setPhase("minigame_result");
        break;
      case "minigame_result":
        setPhase("voting");
        break;
      case "voting":
        // handleVote() で遷移するためここは通らない
        break;
      case "exile_result": {
        // 追放された人がキラなら村人の勝ち
        const exiledPlayer =
          exiledPlayerId !== null
            ? players.find((p) => p.id === exiledPlayerId)
            : null;
        if (exiledPlayer?.role === "kira") {
          finishGame("villager_win", turn);
        } else {
          setPhase("midnight");
        }
        break;
      }
      case "midnight":
        if (turn >= 5) {
          // 判定ロジック：キラが自分の手（深夜アクション）で1人でも殺したか？
          const kiraKillsCount = players.filter((p) => p.isKilledByKira).length;
          if (kiraKillsCount === 0) finishGame("villager_win", turn);
          else finishGame("kira_win", turn);
        } else {
          setTurn(turn + 1);
          setPhase("morning"); // 深夜の次は「朝」

          // 朝に表示するメッセージを組み立てる
          const morningMessages: string[] = [];
          if (nightActionLogs.length > 0) {
            morningMessages.push(...nightActionLogs);
          } else {
            morningMessages.push(
              "昨夜は誰も殺害されず、平和な夜が明けました。",
            );
          }

          setLastEvents(morningMessages);
          setNightActionLogs([]); // ログをリセット

          // 未使用アイテムの消去 ＋ 深夜に殺されたプレイヤーを正式に死亡状態にする
          const updatedPlayers = players.map((p) => ({
            ...p,
            items: [],
            isAlive: p.isKilledByKira ? false : p.isAlive,
          }));
          setPlayers(updatedPlayers);

          // 勝利判定：キラ以外の生存者がいなくなったらキラ勝利（深夜の殺害確定後）
          const otherSurvivorsAfterMidnight = updatedPlayers.filter(
            (p) => p.isAlive && p.role !== "kira",
          );
          if (otherSurvivorsAfterMidnight.length === 0) {
            finishGame("kira_win", turn);
            return;
          }
        }
        break;
    }
  };

  return (
    <div style={{ padding: 20, color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #555', paddingBottom: 20, marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 15 }}>
          <span style={{ color: 'var(--kira-red)' }}>{toFullWidth(turn)}</span> ターン {'\u00A0\u00A0/\u00A0\u00A0'}{toFullWidth(5)} ターン
        </h2>
        
        {/* 生存者リスト（ゲーム中ずっと表示される共通UI） */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {players.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "5px 12px",
                backgroundColor: p.isAlive ? "#2a2a2a" : "#111",
                color: p.isAlive ? "white" : "#555",
                border: p.isAlive ? "1px solid #555" : "1px solid #222",
                borderRadius: "20px",
                fontSize: "14px",
                textDecoration: p.isAlive ? "none" : "line-through",
                opacity: p.isAlive ? 1 : 0.6,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {p.nickname}{" "}
              {!p.isAlive && <span style={{ fontSize: "12px" }}>💀</span>}
            </div>
          ))}
        </div>
      </header>

      <main>
        {phase === "morning" && (
          <MorningPhase events={lastEvents} onNext={handleNextPhase} />
        )}
        {phase === "mini_game" && (
          <MiniGamePhase players={players} onNext={handleNextPhase} />
        )}
        {phase === "minigame_result" && (
          <MiniGameResultPhase
            players={players}
            setPlayers={setPlayers}
            onNext={() => handleNextPhase()}
            rankingIds={miniGameRanking}
            taps={miniGameTaps}
          />
        )}
        {phase === "voting" && (
          <VotingPhase
            players={players}
            setPlayers={setPlayers}
            onVote={handleVote}
          />
        )}
        {phase === "exile_result" && (
          <ExileResultPhase
            exiledPlayerId={exiledPlayerId}
            players={players}
            onNext={handleNextPhase}
          />
        )}
        {phase === "midnight" && (
          <MidnightPhase
            players={players}
            setPlayers={setPlayers}
            setNightActionLogs={setNightActionLogs}
            onNext={handleNextPhase}
          />
        )}
      </main>
    </div>
  );
}
