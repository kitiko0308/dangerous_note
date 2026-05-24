import React, { useEffect, useState } from "react";
import type { Player } from "../../types";
import minigameBg from "../../assets/img/gamehaikei.png";

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
  rankingIds: number[];
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
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isProcessed) return;

    const alivePlayers = players.filter((p) => p.isAlive);

    const newRanking =
      rankingIds && rankingIds.length > 0
        ? rankingIds
            .map((id) => alivePlayers.find((p) => p.id === id))
            .filter((p): p is Player => p !== undefined)
        : [...alivePlayers].sort(() => Math.random() - 0.5);

    if (newRanking.length === 0) {
      setEventLogs([]);
      setIsProcessed(true);
      return;
    }

    const tapsMap = taps ?? {};
    const ranksById: Record<number, number> = {};

    if (Object.keys(tapsMap).length > 0) {
      const tapsList = newRanking.map((p) => tapsMap[p.id] ?? 0);
      const allEqual = tapsList.every((v) => v === tapsList[0]);

      if (allEqual) {
        const lastRank = newRanking.length;

        newRanking.forEach((p) => {
          ranksById[p.id] = lastRank;
        });
      } else {
        const uniqueSorted = Array.from(new Set(tapsList)).sort((a, b) => b - a);
        const rankMap: Record<number, number> = {};

        uniqueSorted.forEach((tap, idx) => {
          rankMap[tap] = idx + 1;
        });

        newRanking.forEach((p) => {
          const tap = tapsMap[p.id] ?? 0;
          ranksById[p.id] = rankMap[tap] ?? newRanking.length;
        });
      }
    } else {
      newRanking.forEach((p, idx) => {
        ranksById[p.id] = idx + 1;
      });
    }

    const rankValues = Object.values(ranksById);

    if (rankValues.length === 0) {
      setEventLogs([]);
      setIsProcessed(true);
      return;
    }

    const maxRank = Math.max(...rankValues);

    const firstPlaceIds = Object.entries(ranksById)
      .filter(([, rank]) => rank === 1)
      .map(([id]) => Number(id));

    const lastPlaceIds = Object.entries(ranksById)
      .filter(([, rank]) => rank === maxRank)
      .map(([id]) => Number(id));

    const participantIds = new Set(newRanking.map((p) => p.id));
    const newLogs: string[] = [];

    const updatedPlayers = players.map((p) => {
      if (!participantIds.has(p.id)) return p;

      const rank = ranksById[p.id] ?? participantIds.size;

      let updatedPlayer: Player = {
        ...p,
        miniGameRank: rank,
      };

      if (firstPlaceIds.includes(p.id)) {
        if (p.role === "kira" && !p.items.includes("death_note_eye")) {
          updatedPlayer = {
            ...updatedPlayer,
            items: [...updatedPlayer.items, "death_note_eye"],
          };
        } else if (p.role === "l" && !p.items.includes("shortcake")) {
          updatedPlayer = {
            ...updatedPlayer,
            items: [...updatedPlayer.items, "shortcake"],
          };
        }
      }

      if (lastPlaceIds.includes(p.id)) {
        const nameLength = p.realName.length;

        const availableIndices = Array.from({ length: nameLength }, (_, i) => i).filter(
          (i) => !p.revealedChars.includes(i),
        );

        if (availableIndices.length > 0) {
          const revealIdx =
            availableIndices[Math.floor(Math.random() * availableIndices.length)];

          const nextRevealedChars = [...p.revealedChars, revealIdx];

          updatedPlayer = {
            ...updatedPlayer,
            revealedChars: nextRevealedChars,
          };

          const maskedName = p.realName
            .split("")
            .map((char, i) => (nextRevealedChars.includes(i) ? char : "〇"))
            .join("");

          newLogs.push(
            `ミニゲーム敗北により、${p.nickname} の本名の一部「${maskedName}」が公開された`,
          );
        }
      }

      return updatedPlayer;
    });

    setEventLogs(newLogs);
    setPlayers(updatedPlayers);
    setIsProcessed(true);
  }, [isProcessed, players, rankingIds, setPlayers, taps]);

  const getMaskedName = (player: Player) =>
    player.realName
      .split("")
      .map((char, i) => (player.revealedChars.includes(i) ? char : "〇"))
      .join("");

  return (
    <>
      <style>{`
        @media (max-width: 720px) {
          .mini-result-container {
            padding: 8px 12px 18px;
          }

          .mini-result-content {
            max-width: 100%;
          }

          .mini-result-title {
            font-size: clamp(1.25rem, 7vw, 1.75rem);
            margin-bottom: 10px;
          }

          .mini-result-panel {
            padding: 16px 14px;
            border-radius: 14px;
          }

          .mini-result-player-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .mini-result-player-card {
            padding: 12px 8px;
          }

          .mini-result-log {
            font-size: 0.86rem;
            letter-spacing: 0.04em;
            line-height: 1.8;
          }

          .mini-result-button {
            width: 100%;
            max-width: 340px;
          }
        }

        @media (max-width: 420px) {
          .mini-result-player-grid {
            grid-template-columns: 1fr;
          }

          .mini-result-label {
            font-size: 9px;
            letter-spacing: 0.32em;
          }

          .mini-result-section-label {
            font-size: 10px;
            letter-spacing: 0.2em;
          }
        }
      `}</style>

      <div style={containerStyle} className="mini-result-container">
        <div style={overlayStyle} />

        <main style={contentStyle} className="mini-result-content">
          <p style={labelStyle} className="mini-result-label">
            MINI GAME RESULT
          </p>

          <h1 style={titleStyle} className="mini-result-title">
            ミニゲーム結果
          </h1>

          {!isProcessed ? (
            <div style={panelStyle} className="mini-result-panel">
              <p style={loadingStyle}>集計中...</p>
            </div>
          ) : (
            <>
              <section style={infoPanelStyle} className="mini-result-panel">
                <p style={sectionLabelStyle} className="mini-result-section-label">
                  PUBLIC INFORMATION
                </p>

                {eventLogs.length > 0 ? (
                  <ul style={logListStyle}>
                    {eventLogs.map((log, i) => (
                      <li key={i} style={logStyle} className="mini-result-log">
                        {log}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={mutedTextStyle}>新たに公開された情報はありません。</p>
                )}
              </section>

              <section style={playersPanelStyle} className="mini-result-panel">
                <p style={sectionLabelStyle} className="mini-result-section-label">
                  PLAYER INFO
                </p>

                <div style={playerGridStyle} className="mini-result-player-grid">
                  {players
                    .filter((p) => p.isAlive)
                    .map((p) => (
                      <div
                        key={p.id}
                        style={playerCardStyle}
                        className="mini-result-player-card"
                      >
                        <strong style={playerNameStyle}>{p.nickname}</strong>
                        <span style={realNameLabelStyle}>本名</span>
                        <span style={maskedNameStyle}>{getMaskedName(p)}</span>
                      </div>
                    ))}
                </div>
              </section>

              <button
                type="button"
                onClick={onNext}
                style={buttonStyle}
                className="mini-result-button"
              >
                投票フェーズへ進む
              </button>
            </>
          )}
        </main>
      </div>
    </>
  );
}

const serifFont = '"Yu Mincho", "Hiragino Mincho ProN", serif';

const containerStyle: React.CSSProperties = {
  minHeight: "100svh",
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
  marginRight: "calc(50% - 50vw)",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflow: "auto",
  backgroundImage: `url(${minigameBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  padding: "10px 20px 22px",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(
      rgba(0,0,0,0.24),
      rgba(0,0,0,0.52)
    )
  `,
  backdropFilter: "blur(0.5px)",
  WebkitBackdropFilter: "blur(0.5px)",
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "min(980px, 96vw)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: serifFont,
  color: "#f4efe7",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(228, 196, 160, 0.82)",
  fontSize: 10,
  letterSpacing: "0.42em",
  marginBottom: 2,
  fontWeight: 600,
};

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(1.4rem, 3.2vw, 2.4rem)",
  margin: "0 0 14px",
  letterSpacing: "0.08em",
  textShadow: "0 2px 18px rgba(0,0,0,0.42)",
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  background: "rgba(10, 8, 6, 0.42)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(7px)",
  WebkitBackdropFilter: "blur(7px)",
  padding: 24,
  textAlign: "center",
};

const infoPanelStyle: React.CSSProperties = {
  ...panelStyle,
  maxWidth: 860,
  marginBottom: 14,
  background: "rgba(18, 8, 6, 0.52)",
  border: "1px solid rgba(210, 120, 110, 0.14)",
  boxShadow: `
    0 10px 30px rgba(0,0,0,0.32),
    0 0 30px rgba(120,20,20,0.08)
  `,
};

const playersPanelStyle: React.CSSProperties = {
  ...panelStyle,
  maxWidth: 860,
  marginBottom: 14,
};

const sectionLabelStyle: React.CSSProperties = {
  color: "rgba(228, 196, 160, 0.74)",
  fontSize: 11,
  letterSpacing: "0.28em",
  margin: "0 0 14px",
  textAlign: "center",
};

const logListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const logStyle: React.CSSProperties = {
  color: "#f3aaa4",
  lineHeight: 1.9,
  letterSpacing: "0.08em",
  fontSize: "clamp(.9rem, 1.7vw, 1rem)",
};

const mutedTextStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.62)",
  margin: 0,
};

const playerGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 12,
  width: "100%",
};

const playerCardStyle: React.CSSProperties = {
  borderRadius: 12,
  background: `
    linear-gradient(
      180deg,
      rgba(255,255,255,0.045),
      rgba(0,0,0,0.28)
    )
  `,
  border: "1px solid rgba(255,255,255,0.08)",
  padding: "14px 10px",
  textAlign: "center",
};

const playerNameStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  letterSpacing: "0.08em",
};

const realNameLabelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.48)",
  fontSize: 11,
  letterSpacing: "0.16em",
  marginBottom: 4,
};

const maskedNameStyle: React.CSSProperties = {
  color: "#f3aaa4",
  letterSpacing: "0.12em",
};

const loadingStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.76)",
  letterSpacing: "0.16em",
};

const buttonStyle: React.CSSProperties = {
  width: "min(76vw, 320px)",
  padding: "13px 10px",
  borderRadius: 12,
  background: "rgba(80, 20, 14, 0.48)",
  color: "#f4efe7",
  border: "1px solid rgba(210, 80, 65, 0.34)",
  boxShadow: "0 8px 26px rgba(0,0,0,0.32)",
  cursor: "pointer",
  fontFamily: serifFont,
  fontWeight: 700,
  letterSpacing: "0.16em",
};