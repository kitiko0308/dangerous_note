import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type FinishPayload = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onFinish: (payload: FinishPayload) => void;
};

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((p) => p.isAlive),
    [players],
  );

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [tapCount, setTapCount] = useState(0);
  const [turnResults, setTurnResults] = useState<
    Array<{ id: number; nickname: string; taps: number }>
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const endTimerRef = useRef<number | null>(null);

  const currentPlayer = alivePlayers[currentTurnIndex];

  const startNextTurn = (nextIndex: number) => {
    setCurrentTurnIndex(nextIndex);
    setTimeLeft(5);
    setTapCount(0);
    setIsRunning(false);
    setCountdown(null);
  };

  const finishCurrentTurn = () => {
    if (!currentPlayer) return;

    const nextResults = [
      ...turnResults,
      {
        id: currentPlayer.id,
        nickname: currentPlayer.nickname,
        taps: tapCount,
      },
    ];

    setTurnResults(nextResults);

    if (currentTurnIndex + 1 >= alivePlayers.length) {
      const sorted = [...nextResults].sort(
        (a, b) => b.taps - a.taps || a.id - b.id,
      );
      const rankingIds = sorted.map((r) => r.id);
      const tapsMap: Record<number, number> = {};
      nextResults.forEach((r) => (tapsMap[r.id] = r.taps));

      setIsFinished(true);
      onFinish({ rankingIds, taps: tapsMap });
      return;
    }

    if (endTimerRef.current) {
      window.clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }

    setShowEndMessage(true);

    endTimerRef.current = window.setTimeout(() => {
      setShowEndMessage(false);
      startNextTurn(currentTurnIndex + 1);
      endTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    if (!currentPlayer || isFinished || !isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);
      finishCurrentTurn();
      return;
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [currentPlayer, isFinished, timeLeft, isRunning]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const id = window.setTimeout(
        () => setCountdown((c) => (c !== null ? c - 1 : null)),
        1000,
      );
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setCountdown(null);
      setIsRunning(true);
      setTimeLeft(5);
    }, 600);

    return () => window.clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    setCurrentTurnIndex(0);
    setTimeLeft(5);
    setTapCount(0);
    setTurnResults([]);
    setIsFinished(false);
    setIsRunning(false);
    setCountdown(null);
    setShowEndMessage(false);

    return () => {
      if (endTimerRef.current) {
        window.clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };
  }, [alivePlayers.map((p) => p.id).join(",")]);

  const handleDummyFinish = () => {
    if (
      !currentPlayer ||
      isFinished ||
      !isRunning ||
      countdown !== null ||
      showEndMessage
    ) {
      return;
    }

    setIsRunning(false);
    finishCurrentTurn();
  };

  const handleTap = () => {
    if (
      !currentPlayer ||
      isFinished ||
      timeLeft <= 0 ||
      !isRunning ||
      showEndMessage
    ) {
      return;
    }

    setTapCount((prev) => prev + 1);
  };

  const handleReady = () => {
    if (!currentPlayer || isFinished) return;
    setCountdown(3);
  };

  const finishBtnDisabled =
    !isRunning ||
    isFinished ||
    countdown !== null ||
    showEndMessage ||
    !currentPlayer;

  const tapButtonDisabled =
    !isRunning ||
    timeLeft <= 0 ||
    isFinished ||
    countdown !== null ||
    showEndMessage ||
    !currentPlayer;

  return (
    <div style={gameShellStyle}>
      <section style={participantsPanelStyle}>
        <p style={sectionLabelStyle}>参加者</p>

        <div style={chipWrapStyle}>
          {alivePlayers.map((p) => (
            <span key={p.id} style={playerChipStyle}>
              {p.nickname}
            </span>
          ))}
        </div>
      </section>

      <section style={mainPanelStyle}>
        {currentPlayer ? (
          <>
            <p style={sectionLabelStyle}>現在の挑戦者</p>

            <div style={turnTitleStyle}>
              <span style={currentNameStyle}>{currentPlayer.nickname}</span>
              <span style={turnTextStyle}>のターン</span>
            </div>

            <p style={nextPlayerStyle}>
              {alivePlayers[currentTurnIndex + 1]
                ? `次は ${alivePlayers[currentTurnIndex + 1].nickname} のターン`
                : "あなたが最後の番です"}
            </p>

            <div style={statusGridStyle}>
              <div style={statusBoxStyle}>
                <span style={statusLabelStyle}>TIME</span>
                <strong style={statusValueStyle}>{timeLeft}</strong>
              </div>

              <div style={statusBoxStyle}>
                <span style={statusLabelStyle}>COUNT</span>
                <strong style={statusValueStyle}>{tapCount}</strong>
              </div>
            </div>

            {!isRunning && countdown === null && !showEndMessage && (
              <p style={descriptionStyle}>
                5秒の間に連打して、1人ずつ記録するゲームです。
              </p>
            )}

            {showEndMessage ? (
              <div style={centerActionStyle}>
                <p style={endMessageStyle}>終了！</p>
              </div>
            ) : countdown !== null ? (
              <div style={centerActionStyle}>
                <p style={countdownStyle}>{countdown}</p>
                <p style={standbyTextStyle}>STANDBY</p>
              </div>
            ) : !isRunning ? (
              <div style={centerActionStyle}>
                <button onClick={handleReady} style={readyButtonStyle}>
                  READY
                </button>
              </div>
            ) : (
              <div style={centerActionStyle}>
                <button
                  onClick={handleTap}
                  disabled={tapButtonDisabled}
                  onPointerDown={() => setIsPressed(true)}
                  onPointerUp={() => setIsPressed(false)}
                  onPointerCancel={() => setIsPressed(false)}
                  onPointerLeave={() => setIsPressed(false)}
                  style={{
                    ...tapButtonStyle,
                    transform: isPressed ? "scale(0.92)" : "scale(1)",
                    boxShadow: isPressed
                      ? "inset 0 8px 18px rgba(0,0,0,0.55)"
                      : `
                        0 0 34px rgba(168, 48, 30, 0.36),
                        0 14px 34px rgba(0,0,0,0.42)
                      `,
                    opacity: tapButtonDisabled ? 0.7 : 1,
                    cursor: tapButtonDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  連打！
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={mutedTextStyle}>参加者がいません。</p>
        )}
      </section>

      <section style={recordPanelStyle}>
        <p style={sectionLabelStyle}>記録済み</p>

        {turnResults.length > 0 ? (
          <div style={recordWrapStyle}>
            {turnResults.map((r) => (
              <span key={r.id} style={recordChipStyle}>
                {r.nickname}
              </span>
            ))}
          </div>
        ) : (
          <p style={mutedTextStyle}>まだ記録はありません。</p>
        )}
      </section>

      <button
        onClick={handleDummyFinish}
        disabled={finishBtnDisabled}
        style={{
          ...finishButtonStyle,
          background: finishBtnDisabled
            ? "rgba(255,255,255,0.08)"
            : "rgba(72, 38, 28, 0.72)",
          color: finishBtnDisabled
            ? "rgba(232,225,213,0.48)"
            : "#f2eadf",
          cursor: finishBtnDisabled ? "not-allowed" : "pointer",
          borderColor: finishBtnDisabled
            ? "rgba(255,255,255,0.12)"
            : "rgba(214, 139, 92, 0.32)",
        }}
      >
        {isFinished ? "結果送信済み" : "このターンを終了して次へ"}
      </button>
    </div>
  );
}

const serifFont =
  'var(--font-serif), "Yu Mincho", "Hiragino Mincho ProN", serif';

const gameShellStyle: React.CSSProperties = {
  width: "100%",
  padding: "clamp(16px, 2.4vw, 28px)",
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(28, 18, 13, 0.78), rgba(10, 7, 5, 0.86))",
  border: "1px solid rgba(205, 139, 92, 0.16)",
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.045),
    0 18px 48px rgba(0,0,0,0.42)
  `,
  color: "#f2eadf",
  textAlign: "center",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const participantsPanelStyle: React.CSSProperties = {
  padding: "18px 16px",
  borderRadius: 12,
  background: "rgba(8, 7, 6, 0.68)",
  border: "1px solid rgba(255,255,255,0.055)",
  marginBottom: 16,
};

const mainPanelStyle: React.CSSProperties = {
  padding: "clamp(22px, 3vw, 34px) 18px",
  borderRadius: 14,
  background:
    "linear-gradient(180deg, rgba(22, 18, 15, 0.82), rgba(12, 10, 8, 0.9))",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)",
  marginBottom: 16,
};

const recordPanelStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: 12,
  background: "rgba(8, 7, 6, 0.68)",
  border: "1px solid rgba(255,255,255,0.055)",
  marginBottom: 14,
  textAlign: "left",
};

const sectionLabelStyle: React.CSSProperties = {
  color: "rgba(222, 190, 151, 0.72)",
  fontSize: 12,
  letterSpacing: "0.18em",
  fontWeight: 700,
  margin: "0 0 10px",
  fontFamily: serifFont,
};

const chipWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
};

const playerChipStyle: React.CSSProperties = {
  padding: "6px 13px",
  borderRadius: 999,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f4efe7",
  fontWeight: 700,
  fontSize: 14,
};

const turnTitleStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "baseline",
  gap: 8,
  marginBottom: 10,
};

const currentNameStyle: React.CSSProperties = {
  color: "#e6c46f",
  fontFamily: serifFont,
  fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
  fontWeight: 800,
  letterSpacing: "0.08em",
};

const turnTextStyle: React.CSSProperties = {
  color: "#e8d9bf",
  fontSize: 15,
  fontWeight: 700,
};

const nextPlayerStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "rgba(244,239,231,0.76)",
  fontSize: 14,
};

const statusGridStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  margin: "14px 0",
  flexWrap: "wrap",
};

const statusBoxStyle: React.CSSProperties = {
  minWidth: 104,
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(0,0,0,0.28)",
  border: "1px solid rgba(255,255,255,0.075)",
};

const statusLabelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(222,190,151,0.68)",
  fontSize: 10,
  letterSpacing: "0.2em",
  marginBottom: 4,
};

const statusValueStyle: React.CSSProperties = {
  color: "#f4efe7",
  fontSize: 24,
  fontFamily: serifFont,
  lineHeight: 1,
};

const descriptionStyle: React.CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(244,239,231,0.88)",
  fontSize: "clamp(0.95rem, 1.6vw, 1.12rem)",
  letterSpacing: "0.04em",
};

const centerActionStyle: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 96,
};

const readyButtonStyle: React.CSSProperties = {
  minWidth: 180,
  padding: "15px 28px",
  borderRadius: 999,
  background:
    "linear-gradient(180deg, rgba(74,38,27,0.88), rgba(34,14,10,0.94))",
  color: "#f5ecdf",
  border: "1px solid rgba(214, 139, 92, 0.35)",
  boxShadow: "0 12px 28px rgba(0,0,0,0.38)",
  cursor: "pointer",
  fontFamily: serifFont,
  fontWeight: 800,
  letterSpacing: "0.18em",
  fontSize: 18,
};

const tapButtonStyle: React.CSSProperties = {
  width: 132,
  height: 132,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 50% 38%, rgba(144,52,36,0.96), rgba(54,16,12,0.98) 68%, rgba(18,8,6,1))",
  color: "#fff3e7",
  border: "1px solid rgba(214, 91, 70, 0.58)",
  fontFamily: serifFont,
  fontSize: 22,
  fontWeight: 900,
  letterSpacing: "0.06em",
  transition:
    "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
  touchAction: "manipulation",
};

const endMessageStyle: React.CSSProperties = {
  color: "#f4efe7",
  fontSize: 44,
  margin: 0,
  fontFamily: serifFont,
  letterSpacing: "0.12em",
};

const countdownStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: 54,
  margin: 0,
  fontFamily: serifFont,
  textShadow: "0 0 24px rgba(210,80,60,0.45)",
};

const standbyTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(222,190,151,0.72)",
  fontSize: 12,
  letterSpacing: "0.28em",
};

const recordWrapStyle: React.CSSProperties = {
  marginTop: 8,
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const recordChipStyle: React.CSSProperties = {
  padding: "5px 11px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f2eadf",
  fontSize: 13,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(244,239,231,0.46)",
  fontSize: 14,
};

const finishButtonStyle: React.CSSProperties = {
  marginTop: 0,
  padding: "10px 18px",
  minWidth: 220,
  borderRadius: 10,
  border: "1px solid",
  boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
  fontFamily: serifFont,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.08em",
};