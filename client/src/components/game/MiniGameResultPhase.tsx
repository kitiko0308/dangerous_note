import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import type { Player } from "../../types";

import minigameBg from "../../assets/img/gamehaikei.png";

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<
    React.SetStateAction<Player[]>
  >;
  onNext: () => void;
  rankingIds: number[];
  taps?: Record<number, number>;
};

function getMaskedName(
  realName: string,
  revealedChars: number[],
): string {
  return realName
    .split("")
    .map((char, i) =>
      revealedChars.includes(i)
        ? char
        : "〇",
    )
    .join("");
}

export default function MiniGameResultPhase({
  players,
  setPlayers,
  onNext,
  rankingIds,
  taps,
}: Props) {
  const [isProcessed, setIsProcessed] =
    useState(false);

  const [eventLogs, setEventLogs] =
    useState<string[]>([]);

  const initialPlayersRef = useRef(players);

  useEffect(() => {
    if (isProcessed) return;

    const basePlayers =
      initialPlayersRef.current;

    const alivePlayers = basePlayers.filter(
      (p) => p.isAlive,
    );

    const newRanking =
      rankingIds && rankingIds.length > 0
        ? rankingIds
            .map((id) =>
              alivePlayers.find(
                (p) => p.id === id,
              ),
            )
            .filter(
              (p): p is Player =>
                p !== undefined,
            )
        : [...alivePlayers].sort(
            () => Math.random() - 0.5,
          );

    if (newRanking.length === 0) {
      setEventLogs([]);
      setIsProcessed(true);
      return;
    }

    const tapsMap = taps ?? {};

    const ranksById: Record<
      number,
      number
    > = {};

    if (Object.keys(tapsMap).length > 0) {
      const tapsList = newRanking.map(
        (p) => tapsMap[p.id] ?? 0,
      );

      const allEqual = tapsList.every(
        (v) => v === tapsList[0],
      );

      if (allEqual) {
        const lastRank =
          newRanking.length;

        newRanking.forEach((p) => {
          ranksById[p.id] = lastRank;
        });
      } else {
        const uniqueSorted = Array.from(
          new Set(tapsList),
        ).sort((a, b) => b - a);

        const rankMap: Record<
          number,
          number
        > = {};

        uniqueSorted.forEach(
          (tap, idx) => {
            rankMap[tap] = idx + 1;
          },
        );

        newRanking.forEach((p) => {
          const tap =
            tapsMap[p.id] ?? 0;

          ranksById[p.id] =
            rankMap[tap] ??
            newRanking.length;
        });
      }
    } else {
      newRanking.forEach((p, idx) => {
        ranksById[p.id] = idx + 1;
      });
    }

    const rankValues =
      Object.values(ranksById);

    if (rankValues.length === 0) {
      setEventLogs([]);
      setIsProcessed(true);
      return;
    }

    const maxRank =
      Math.max(...rankValues);

    const survivorCount =
      Object.keys(ranksById).length;

    const firstPlaceIds =
      survivorCount === 1
        ? []
        : Object.entries(ranksById)
            .filter(
              ([, rank]) => rank === 1,
            )
            .map(([id]) => Number(id));

    const lastPlaceIds =
      survivorCount === 1
        ? []
        : Object.entries(ranksById)
            .filter(
              ([, rank]) =>
                rank === maxRank,
            )
            .map(([id]) => Number(id));

    const participantIds = new Set(
      newRanking.map((p) => p.id),
    );

    const newLogs: string[] = [];

    const updatedPlayers =
      basePlayers.map((p) => {
        if (!participantIds.has(p.id))
          return p;

        const rank =
          ranksById[p.id] ??
          participantIds.size;

        let updatedPlayer: Player = {
          ...p,
          miniGameRank: rank,
        };

        if (
          firstPlaceIds.includes(p.id)
        ) {
          if (
            p.role === "kira" &&
            !p.items.includes(
              "death_note_eye",
            )
          ) {
            updatedPlayer = {
              ...updatedPlayer,
              items: [
                ...updatedPlayer.items,
                "death_note_eye",
              ],
            };
          } else if (
            p.role === "l" &&
            !p.items.includes(
              "shortcake",
            )
          ) {
            updatedPlayer = {
              ...updatedPlayer,
              items: [
                ...updatedPlayer.items,
                "shortcake",
              ],
            };
          }
        }

        if (
          lastPlaceIds.includes(p.id)
        ) {
          const nameLength =
            p.realName.length;

          const availableIndices =
            Array.from(
              {
                length: nameLength,
              },
              (_, i) => i,
            ).filter(
              (i) =>
                !p.revealedChars.includes(
                  i,
                ),
            );

          if (
            availableIndices.length > 0
          ) {
            const revealIdx =
              availableIndices[
                Math.floor(
                  Math.random() *
                    availableIndices.length,
                )
              ];

            const nextRevealedChars = [
              ...p.revealedChars,
              revealIdx,
            ];

            updatedPlayer = {
              ...updatedPlayer,
              revealedChars:
                nextRevealedChars,
            };

            const maskedName =
              getMaskedName(
                p.realName,
                nextRevealedChars,
              );

            newLogs.push(
              `${p.nickname} の本名の一部「${maskedName}」が公開された`,
            );
          }
        }

        return updatedPlayer;
      });

    setEventLogs(newLogs);

    setPlayers((currentPlayers) =>
      currentPlayers.map(
        (currentPlayer) => {
          const updatedPlayer =
            updatedPlayers.find(
              (p) =>
                p.id ===
                currentPlayer.id,
            );

          return (
            updatedPlayer ??
            currentPlayer
          );
        },
      ),
    );

    setIsProcessed(true);
  }, [
    isProcessed,
    rankingIds,
    setPlayers,
    taps,
  ]);

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />

      <main style={contentStyle}>
        <p style={labelStyle}>
          MINI GAME RESULT
        </p>

        <h1 style={titleStyle}>
          ミニゲーム結果
        </h1>

        {!isProcessed ? (
          <div style={panelStyle}>
            <p style={loadingStyle}>
              集計中...
            </p>
          </div>
        ) : (
          <>
            <section
              style={infoPanelStyle}
            >
              <p
                style={
                  sectionLabelStyle
                }
              >
                PUBLIC INFORMATION
              </p>

              {eventLogs.length > 0 ? (
                <ul style={logListStyle}>
                  {eventLogs.map(
                    (log, i) => (
                      <li
                        key={i}
                        style={logStyle}
                      >
                        ミニゲーム敗北により、
                        <br />
                        {log}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p
                  style={
                    mutedTextStyle
                  }
                >
                  新たに公開された情報はありません。
                </p>
              )}
            </section>

            <section
              style={playersPanelStyle}
            >
              <p
                style={
                  sectionLabelStyle
                }
              >
                PLAYER INFO
              </p>

              <div
                style={playerGridStyle}
              >
                {players
                  .filter(
                    (p) => p.isAlive,
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      style={
                        playerCardStyle
                      }
                    >
                      <strong
                        style={
                          playerNameStyle
                        }
                      >
                        {p.nickname}
                      </strong>

                      <span
                        style={
                          realNameLabelStyle
                        }
                      >
                        本名
                      </span>

                      <span
                        style={
                          maskedNameStyle
                        }
                      >
                        {getMaskedName(
                          p.realName,
                          p.revealedChars,
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            <button
              type="button"
              onClick={onNext}
              style={buttonStyle}
            >
              投票フェーズへ進む
            </button>
          </>
        )}
      </main>
    </div>
  );
}

const serifFont =
  '"Yu Mincho", "Hiragino Mincho ProN", serif';

const containerStyle: React.CSSProperties =
  {
    minHeight: "100svh",
    width: "100vw",

    marginLeft:
      "calc(50% - 50vw)",

    marginRight:
      "calc(50% - 50vw)",

    position: "relative",

    display: "flex",

    justifyContent: "center",

    alignItems: "flex-start",

    overflow: "auto",

    backgroundImage: `url(${minigameBg})`,

    backgroundSize: "cover",

    backgroundPosition:
      "center center",

    backgroundRepeat:
      "no-repeat",

    padding: "16px 18px 26px",
  };

const overlayStyle: React.CSSProperties =
  {
    position: "absolute",
    inset: 0,

    background: `
    linear-gradient(
      rgba(0,0,0,0.22),
      rgba(0,0,0,0.56)
    )
  `,

    backdropFilter: "blur(0.6px)",

    WebkitBackdropFilter:
      "blur(0.6px)",
  };

const contentStyle: React.CSSProperties =
  {
    position: "relative",
    zIndex: 2,

    width: "100%",

    maxWidth:
      "min(880px, 96vw)",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    fontFamily: serifFont,

    color: "#f4efe7",
  };

const labelStyle: React.CSSProperties =
  {
    color:
      "rgba(228, 196, 160, 0.82)",

    fontSize: 10,

    letterSpacing: "0.42em",

    marginBottom: 2,

    fontWeight: 600,
  };

const titleStyle: React.CSSProperties =
  {
    fontSize:
      "clamp(1.5rem, 4vw, 2.7rem)",

    margin: "0 0 18px",

    letterSpacing: "0.08em",

    textShadow:
      "0 2px 18px rgba(0,0,0,0.42)",
  };

const panelStyle: React.CSSProperties =
  {
    width: "100%",

    borderRadius: 18,

    background:
      "rgba(10, 8, 6, 0.42)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    backdropFilter: "blur(8px)",

    WebkitBackdropFilter:
      "blur(8px)",

    padding: "20px",

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.32)",
  };

const infoPanelStyle: React.CSSProperties =
  {
    ...panelStyle,

    marginBottom: 16,
  };

const playersPanelStyle: React.CSSProperties =
  {
    ...panelStyle,

    marginBottom: 18,
  };

const sectionLabelStyle: React.CSSProperties =
  {
    color:
      "rgba(228, 196, 160, 0.72)",

    fontSize: 11,

    letterSpacing: "0.3em",

    margin: "0 0 14px",

    textAlign: "center",
  };

const logListStyle: React.CSSProperties =
  {
    listStyle: "none",

    padding: 0,

    margin: 0,
  };

const logStyle: React.CSSProperties =
  {
    color: "#f3aaa4",

    lineHeight: 1.9,

    letterSpacing: "0.05em",

    fontSize:
      "clamp(0.95rem, 2vw, 1.08rem)",

    textAlign: "center",
  };

const mutedTextStyle: React.CSSProperties =
  {
    color:
      "rgba(255,255,255,0.62)",

    margin: 0,

    textAlign: "center",
  };

const playerGridStyle: React.CSSProperties =
  {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",

    gap: 12,
  };

const playerCardStyle: React.CSSProperties =
  {
    borderRadius: 14,

    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.28))",

    border:
      "1px solid rgba(255,255,255,0.08)",

    padding: "14px 12px",

    textAlign: "center",
  };

const playerNameStyle: React.CSSProperties =
  {
    display: "block",

    marginBottom: 8,

    letterSpacing: "0.08em",

    fontSize: "1rem",
  };

const realNameLabelStyle: React.CSSProperties =
  {
    display: "block",

    color:
      "rgba(255,255,255,0.5)",

    fontSize: 11,

    letterSpacing: "0.16em",

    marginBottom: 6,
  };

const maskedNameStyle: React.CSSProperties =
  {
    color: "#f3aaa4",

    letterSpacing: "0.12em",

    fontSize: "1rem",
  };

const loadingStyle: React.CSSProperties =
  {
    color:
      "rgba(255,255,255,0.76)",

    letterSpacing: "0.16em",

    textAlign: "center",
  };

const buttonStyle: React.CSSProperties =
  {
    width: "min(76vw, 320px)",

    padding: "14px 12px",

    borderRadius: 12,

    background:
      "rgba(80, 20, 14, 0.54)",

    color: "#f4efe7",

    border:
      "1px solid rgba(210, 80, 65, 0.34)",

    boxShadow:
      "0 8px 26px rgba(0,0,0,0.32)",

    cursor: "pointer",

    fontFamily: serifFont,

    fontWeight: 700,

    letterSpacing: "0.16em",
  };