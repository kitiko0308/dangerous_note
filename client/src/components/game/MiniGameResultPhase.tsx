import React, { useEffect, useState } from "react";
import type { Player, Item as _Item } from "../../types";

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
  rankingIds: number[]; // 追加：ミニゲームから渡された順位
  taps?: Record<number, number>;
};

export default function MiniGameResultPhase({
  players,
  setPlayers,
  onNext,
  rankingIds,
  taps,
}: Props) {
  const [isProcessed, setIsProcessed] = useState(false);
  const [_ranking, setRanking] = useState<Player[]>([]);
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  // このフェーズに入った時に一度だけ実行される「裏の処理」
  useEffect(() => {
    if (isProcessed) return;

    // 1. 順位データを元にプレイヤー配列を並び替える
    let newRanking: Player[] = [];

    if (rankingIds && rankingIds.length > 0) {
      // 渡されたID順にプレイヤーを並べる
      newRanking = rankingIds
        .map((id) => players.find((p) => p.id === id))
        .filter((p): p is Player => p !== undefined);
    } else {
      // 安全策として、もしデータがなければランダムにする（従来通り）
      const alivePlayers = players.filter((p) => p.isAlive);
      newRanking = [...alivePlayers].sort(() => Math.random() - 0.5);
    }

    setRanking(newRanking);

    // 2. 結果に応じたデータ更新
    const newLogs: string[] = [];

    // ランク付け：もし taps 情報が渡されていればそれに基づき同点処理を行う。
    const tapsMap = taps || {};
    const ranksById: Record<number, number> = {};

    if (Object.keys(tapsMap).length > 0) {
      const tapsList = newRanking.map((p) => tapsMap[p.id] ?? 0);
      const allEqual = tapsList.every((v) => v === tapsList[0]);

      if (allEqual) {
        // 全員同点 → 全員を最下位扱い
        const lastRank = newRanking.length;
        newRanking.forEach((p) => (ranksById[p.id] = lastRank));
      } else {
        // 同じ得点は同順位にする（高い得点が小さいランク番号）
        const uniqueSorted = Array.from(new Set(tapsList)).sort(
          (a, b) => b - a,
        );
        const rankMap: Record<number, number> = {};
        uniqueSorted.forEach((tap, idx) => (rankMap[tap] = idx + 1));
        newRanking.forEach((p) => {
          const t = tapsMap[p.id] ?? 0;
          ranksById[p.id] = rankMap[t];
        });
      }
    } else {
      // taps 情報が無ければ従来通り順位は並びに基づく
      newRanking.forEach((p, idx) => (ranksById[p.id] = idx + 1));
    }

    const maxRank = Math.max(...Object.values(ranksById));
    const firstPlaceIds = Object.entries(ranksById)
      .filter(([_, r]) => r === 1)
      .map(([id]) => Number(id));
    const lastPlaceIds = Object.entries(ranksById)
      .filter(([_, r]) => r === maxRank)
      .map(([id]) => Number(id));
    const lastPlaceLabel =
      lastPlaceIds.length > 1 ? "同率最下位の" : "最下位の";

    const participantIds = new Set(newRanking.map((p) => p.id));

    const updatedPlayers = players.map((p) => {
      if (!participantIds.has(p.id)) {
        return p;
      }

      const rank = ranksById[p.id] ?? participantIds.size;
      let updatedPlayer = { ...p, miniGameRank: rank };

      // 1位（同率含む）へのアイテム付与
      if (firstPlaceIds.includes(p.id)) {
        if (p.role === "kira") {
          updatedPlayer.items = [...p.items, "death_note_eye"];
        } else if (p.role === "l") {
          updatedPlayer.items = [...p.items, "shortcake"];
        }
      }

      // 最下位（同率含む）の本名公開処理（ログに出す）
      if (lastPlaceIds.includes(p.id)) {
        const nameLength = p.realName.length;
        const availableIndices = Array.from(
          { length: nameLength },
          (_, i) => i,
        ).filter((i) => !p.revealedChars.includes(i));

        if (availableIndices.length > 0) {
          const revealIdx =
            availableIndices[
              Math.floor(Math.random() * availableIndices.length)
            ];
          updatedPlayer.revealedChars = [...p.revealedChars, revealIdx];

          const maskedName = p.realName
            .split("")
            .map((char, i) =>
              p.revealedChars.includes(i) || i === revealIdx ? char : "〇",
            )
            .join("");

          newLogs.push(
            `${lastPlaceLabel} ${p.nickname} の本名の一部「${maskedName}」が全員に公開された！`,
          );
        }
      }

      return updatedPlayer;
    });

    setEventLogs(newLogs);
    setPlayers(updatedPlayers);
    setIsProcessed(true);
  }, [players, setPlayers, isProcessed]);

  return (
    <div
      style={{
        backgroundColor: "#2a3a2a",
        padding: 30,
        borderRadius: "12px",
        border: "1px solid #44ff44",
      }}
    >
      <h2 style={{ color: "#44ff44", marginBottom: "30px" }}>
        📊 ミニゲーム結果
      </h2>

      {!isProcessed ? (
        <p>集計中...</p>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "30px",
            }}
          >
            <p style={{ color: "#aaa", fontSize: "14px" }}>
              【担当2への申し送り】
            </p>
            <p style={{ fontSize: "14px", marginBottom: "20px" }}>
              データ処理は完了しています。以下の内容を使ってかっこいい演出を作ってください。
            </p>

            <div style={{ textAlign: "left", display: "inline-block" }}>
              <ul style={{ fontSize: "18px", listStyle: "none", padding: 0 }}>
                {eventLogs.map((log, i) => (
                  <li
                    key={i}
                    style={{ marginBottom: "10px", color: "#ff4444" }}
                  >
                    ⚠️ {log}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 全員の現在の公開状態を表示（チームメンバーのUI実装の参考用） */}
          <div
            style={{
              backgroundColor: "#1a2a1a",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "30px",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                color: "#88ff88",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              👥 現在のプレイヤー情報（全員に見えています）
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {players
                .filter((p) => p.isAlive)
                .map((p) => {
                  const maskedName = p.realName
                    .split("")
                    .map((char, i) =>
                      p.revealedChars.includes(i) ? char : "〇",
                    )
                    .join("");
                  return (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: "#222",
                        padding: "10px",
                        borderRadius: "5px",
                        minWidth: "120px",
                        textAlign: "center",
                        border: "1px solid #444",
                      }}
                    >
                      <div style={{ fontWeight: "bold", color: "white" }}>
                        {p.nickname}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#ffaaaa",
                          marginTop: "5px",
                        }}
                      >
                        {maskedName}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <button
            onClick={onNext}
            style={{
              padding: "15px 40px",
              backgroundColor: "#44ff44",
              color: "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            投票フェーズへ進む
          </button>
        </div>
      )}
    </div>
  );
}
