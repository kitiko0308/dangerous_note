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
      className="title-screen"
    >
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />

      <main className="title-content" style={{ gap: '0.8rem', padding: '3rem 1.4rem 1.8rem', alignContent: 'start', justifyContent: 'center', justifyItems: 'center' }}>
        <h2 className="title-logo" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)' }}>
          ミニゲーム結果
        </h2>

        {!isProcessed ? (
          <p className="title-sub">集計中...</p>
        ) : (
          <div style={{ textAlign: "center", width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', fontFamily: '"Noto Serif JP","Yu Mincho","Hiragino Mincho ProN",serif' }}>
            <div className="dn-panel" style={{ width: '100%', padding: '20px 24px', textAlign: 'left' }}>
              <div style={{ textAlign: "left", display: "inline-block", width: '100%' }}>
                <ul role="list" style={{ fontSize: 'clamp(.9rem, 1.8vw, 1.05rem)', listStyle: "none", padding: 0, margin: 0 }}>
                  {eventLogs.map((log, i) => (
                    <li
                      key={i}
                      style={{ marginBottom: "10px", color: "#fca5a5", letterSpacing: '.08em', lineHeight: 1.6 }}
                    >
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 全員の現在の公開状態を表示 */}
            <div className="dn-panel" style={{ width: '100%', padding: '20px 24px', textAlign: "left" }}>
              <h3
                style={{
                  fontSize: 13,
                  letterSpacing: '.2em',
                  color: '#9ca3af',
                  borderBottom: '1px solid rgba(255,255,255,.08)',
                  paddingBottom: 10,
                  marginTop: 0,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                現在のプレイヤー情報
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
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
                          background: "linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(0,0,0,.3) 100%)",
                          padding: "0",
                          borderRadius: "10px",
                          minWidth: "130px",
                          flex: "1 0 auto",
                          maxWidth: "160px",
                          textAlign: "center",
                          border: "1px solid rgba(255,255,255,.1)",
                          boxShadow: "0 4px 16px rgba(0,0,0,.4)",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{
                          background: "rgba(0,0,0,.35)",
                          padding: "12px 14px 8px",
                          borderBottom: "1px solid rgba(255,255,255,.06)",
                        }}>
                          <div style={{ fontWeight: 700, color: "#e5e5e5", fontSize: 'clamp(.85rem, 1.5vw, .95rem)', letterSpacing: '.08em' }}>
                            {p.nickname}
                          </div>
                        </div>
                        <div style={{
                          padding: "10px 14px 14px",
                        }}>
                          <div style={{ fontSize: 'clamp(.7rem, 1.2vw, .8rem)', color: "#9ca3af", letterSpacing: '.15em', marginBottom: 4 }}>本名</div>
                          <div
                            style={{
                              fontSize: 'clamp(.8rem, 1.4vw, .9rem)',
                              color: "#fca5a5",
                              fontWeight: 500,
                              letterSpacing: '.12em',
                              fontFamily: '"Noto Serif JP","Yu Mincho","Hiragino Mincho ProN",serif',
                            }}
                          >
                            {maskedName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <button
              className="dn-button dn-button-primary"
              onClick={onNext}
              style={{
                width: 'min(74vw, 320px)',
                padding: "14px 8px",
                fontSize: 15,
                letterSpacing: '.2em',
              }}
            >
              投票フェーズへ進む
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
