import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((p) => p.isAlive),
    [players],
  );

  const [phase, setPhase] = useState<"idle" | "waiting" | "go" | "results">(
    "idle",
  );
  const [indicatorGreen, setIndicatorGreen] = useState(false);
  const goTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const maxWaitTimerRef = useRef<number | null>(null);
  const endTimerRef = useRef<number | null>(null);

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  // countdown removed per user request
  const [isRunning, setIsRunning] = useState(false);
  const [turnResults, setTurnResults] = useState<
    Array<{ id: number; nickname: string; time: number; falseStart?: boolean }>
  >([]);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [suppressResults, setSuppressResults] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (maxWaitTimerRef.current) window.clearTimeout(maxWaitTimerRef.current);
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
    };
  }, []);

  // reset whenever participant set changes (use stable key)
  useEffect(() => {
    setCurrentTurnIndex(0);
    setPhase("idle");
    setIndicatorGreen(false);
    setIsRunning(false);
    setTurnResults([]);
    setSuppressResults(false);

    if (endTimerRef.current) {
      window.clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }

    return () => {
      if (endTimerRef.current) {
        window.clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };
    // depend on stable key of alivePlayers
  }, [alivePlayers.map((p) => p.id).join(",")]);

  const startRound = () => {
    // show red immediately and schedule green after a short random delay
    setPhase("waiting");
    setIndicatorGreen(false);
    goTimeRef.current = null;
    setIsRunning(false);

    const delay = 1000 + Math.floor(Math.random() * 2001); // 1000-3000ms
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      goTimeRef.current = Date.now();
      setIndicatorGreen(true);
      setPhase("go");
      setIsRunning(true);
      // max wait 5s after green
      if (maxWaitTimerRef.current) window.clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = window.setTimeout(() => {
        finishCurrentTurn();
      }, 5000);
    }, delay);
  };

  const handlePress = (playerId: number) => {
    const current = alivePlayers[currentTurnIndex];
    if (!current || playerId !== current.id) return; // only current player can respond

    // ignore repeated presses once recorded or after finish
    if (!isRunning && phase !== "go" && phase !== "waiting") return;

    const now = Date.now();

    if (phase === "waiting" && !goTimeRef.current) {
      // early press -> false start
      // clear pending timers
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (maxWaitTimerRef.current) window.clearTimeout(maxWaitTimerRef.current);

      const entry = {
        id: current.id,
        nickname: current.nickname,
        time: 999999,
        falseStart: true,
      };
      const newResults = [...turnResults, entry];
      setTurnResults(newResults);
      // if this was the last player, immediately send final ranking without showing the full results UI
      if (currentTurnIndex + 1 >= alivePlayers.length) {
        const sorted = [...newResults].sort(
          (a, b) => a.time - b.time || a.id - b.id,
        );
        const rankingIds = sorted.map((r) => r.id);
        setSuppressResults(true);
        // small delay to allow UI to update for this player's end (but not show full ranking)
        setTimeout(() => onFinish(rankingIds), 300);
        return;
      }

      setShowEndMessage(true);
      setIsRunning(false);
      setIndicatorGreen(false);
      setPhase("results");
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
      endTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
        setIndicatorGreen(false);
        setShowEndMessage(false);
        advanceTurn();
        endTimerRef.current = null;
      }, 1200);
      return;
    }

    if (phase === "go" && goTimeRef.current) {
      const entry = {
        id: current.id,
        nickname: current.nickname,
        time: Math.max(0, now - goTimeRef.current),
      };
      if (maxWaitTimerRef.current) window.clearTimeout(maxWaitTimerRef.current);
      const newResults = [...turnResults, entry];
      setTurnResults(newResults);

      // if this was the last player, send final ranking without showing the ranking UI
      if (currentTurnIndex + 1 >= alivePlayers.length) {
        const sorted = [...newResults].sort(
          (a, b) => a.time - b.time || a.id - b.id,
        );
        const rankingIds = sorted.map((r) => r.id);
        setSuppressResults(true);
        setTimeout(() => onFinish(rankingIds), 300);
        return;
      }

      setShowEndMessage(true);
      setIsRunning(false);
      setIndicatorGreen(false);
      setPhase("results");

      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
      endTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
        setShowEndMessage(false);
        advanceTurn();
        endTimerRef.current = null;
      }, 1200);
      return;
    }
  };

  const advanceTurn = () => {
    // move to next player or finish game
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (maxWaitTimerRef.current) window.clearTimeout(maxWaitTimerRef.current);

    if (currentTurnIndex + 1 >= alivePlayers.length) {
      // compute ranking
      const sorted = [...turnResults].sort(
        (a, b) => a.time - b.time || a.id - b.id,
      );
      const rankingIds = sorted.map((r) => r.id);
      // hide local result UI briefly and call onFinish so parent handles final display
      setSuppressResults(true);
      setTimeout(() => onFinish(rankingIds), 300);
      return;
    }

    setCurrentTurnIndex((i) => i + 1);
    setSuppressResults(false);
    setPhase("idle");
    setIndicatorGreen(false);
    setIsRunning(false);
    goTimeRef.current = null;
  };

  const finishCurrentTurn = () => {
    const current = alivePlayers[currentTurnIndex];
    if (!current) return;

    // if current player didn't press, mark as miss
    const already = turnResults.find((r) => r.id === current.id);
    let newResults = turnResults;
    if (!already) {
      const entry = {
        id: current.id,
        nickname: current.nickname,
        time: 999999,
        falseStart: true,
      };
      newResults = [...turnResults, entry];
      setTurnResults(newResults);
    }

    // if this was the last player, send final ranking without showing full ranking UI
    if (currentTurnIndex + 1 >= alivePlayers.length) {
      const sorted = [...newResults].sort(
        (a, b) => a.time - b.time || a.id - b.id,
      );
      const rankingIds = sorted.map((r) => r.id);
      setSuppressResults(true);
      setTimeout(() => onFinish(rankingIds), 300);
      return;
    }

    setIsRunning(false);
    setIndicatorGreen(false);
    setPhase("results");
    setShowEndMessage(true);

    if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
    endTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
      setShowEndMessage(false);
      advanceTurn();
      endTimerRef.current = null;
    }, 1200);
  };

  const currentPlayer = alivePlayers[currentTurnIndex];

  return (
    <div
      style={{
        padding: 34,
        borderRadius: 14,
        textAlign: "center",
        color: "#efe7db",
        background: 'linear-gradient(180deg, rgba(0,0,0,0.44), rgba(0,0,0,0.28))',
        border: '1px solid rgba(214,204,188,0.12)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), 0 18px 40px rgba(0,0,0,0.44)',
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-serif), "Yu Mincho", serif', fontSize: 18, marginBottom: 6 }}>早押しチャレンジ</h3>
      <p style={{ marginTop: 8, color: "#ddd", fontFamily: 'var(--font-serif), "Yu Mincho", serif' }}>
        ボタンが赤から緑に変わったら、すぐに「押せ」を押して反応時間を競ってください。
      </p>

      <div
        style={{
          margin: "20px 0",
          padding: "12px",
          background: 'linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18))',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.02)',
        }}
      >
        <p style={{ color: "#ddd", marginBottom: "8px", fontFamily: 'var(--font-serif), "Yu Mincho", serif' }}>参加者</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {alivePlayers.map((p) => (
            <span
              key={p.id}
              style={{
                padding: "6px 12px",
                background: 'rgba(255,255,255,0.03)',
                borderRadius: "16px",
                color: '#efe7db',
                fontFamily: 'var(--font-serif), "Yu Mincho", serif',
              }}
            >
              {p.nickname}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "22px",
          background: 'linear-gradient(180deg, rgba(0,0,0,0.36), rgba(0,0,0,0.22))',
          borderRadius: 12,
          border: '1px solid rgba(214,204,188,0.12)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
        }}
      >
        {currentPlayer ? (
          <>
            <p style={{ margin: 0, color: "#f5d565", fontWeight: 700 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif), "Yu Mincho", "Hiragino Mincho ProN", serif',
                  fontSize: 20,
                }}
              >
                {currentPlayer.nickname}
              </span>
              <span style={{ marginLeft: 8, fontSize: 16, color: "#fff" }}>
                のターン
              </span>
            </p>
            <p style={{ margin: "8px 0 0", color: "#ddd" }}>
              {alivePlayers[currentTurnIndex + 1]
                ? `次は ${alivePlayers[currentTurnIndex + 1].nickname} のターン`
                : "あなたが最後の番です"}
            </p>
            <p style={{ margin: "12px 0 0", color: "#aaa" }}>
              {/* placeholder for time */}
            </p>

            {showEndMessage ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 48, margin: "8px 0", color: "#fff" }}>
                  終了！
                </p>
              </div>
            ) : phase === "waiting" && !indicatorGreen ? (
              // show large red button while waiting before green
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => handlePress(currentPlayer.id)}
                  className="title-menu__button sample-game3-button sample-game3-button--danger"
                  onPointerDown={() => setIsPressed(true)}
                  onPointerUp={() => setIsPressed(false)}
                  onPointerCancel={() => setIsPressed(false)}
                  onPointerLeave={() => setIsPressed(false)}
                  style={{
                    marginTop: "8px",
                    width: 140,
                    height: 140,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: 'radial-gradient(circle at 40% 35%, #ff5a5a 0%, #b71c1c 45%, #5a0d0d 100%)',
                    color: "#fff3ec",
                    border: "none",
                    borderRadius: 999,
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: 'var(--font-serif), "Yu Mincho", serif',
                    transform: isPressed ? "scale(0.96)" : "scale(1)",
                    boxShadow: isPressed
                      ? "inset 0 8px 18px rgba(0,0,0,0.45)"
                      : "0 18px 48px rgba(194,77,63,0.38), 0 0 40px rgba(194,77,63,0.18) inset",
                    textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                    transition:
                      "transform 120ms ease, box-shadow 120ms ease, background 160ms",
                    touchAction: "manipulation",
                    cursor: "pointer",
                  }}
                >
                  待て
                </button>
              </div>
            ) : !isRunning ? (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={startRound}
                  className="title-menu__button title-menu__button--primary sample-game3-button sample-game3-button--ready"
                  style={{ minWidth: 180, padding: '10px 22px', borderRadius: 28, background: 'linear-gradient(180deg,#5a392e,#2f1a12)', color: '#f4e9e0', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: 'none', fontFamily: 'var(--font-serif), "Yu Mincho", serif' }}
                >
                  準備OK
                </button>
              </div>
            ) : (
              // green button to press when go
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => handlePress(currentPlayer.id)}
                  className="title-menu__button title-menu__button--primary sample-game3-button sample-game3-button--go"
                  onPointerDown={() => setIsPressed(true)}
                  onPointerUp={() => setIsPressed(false)}
                  onPointerCancel={() => setIsPressed(false)}
                  onPointerLeave={() => setIsPressed(false)}
                  style={{
                    marginTop: "8px",
                    width: 140,
                    height: 140,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: 'radial-gradient(circle at 35% 30%, #a8e6b8 0%, #2e7d32 45%, #11321a 100%)',
                    color: "#eaffef",
                    border: "none",
                    borderRadius: 999,
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: 'var(--font-serif), "Yu Mincho", serif',
                    transform: isPressed ? "scale(0.96)" : "scale(1)",
                    boxShadow: isPressed
                      ? "inset 0 8px 18px rgba(0,0,0,0.45)"
                      : "0 18px 48px rgba(46,125,50,0.28), 0 0 36px rgba(46,125,50,0.12) inset",
                    textShadow: '0 2px 6px rgba(0,0,0,0.36)',
                    transition:
                      "transform 120ms ease, box-shadow 120ms ease, background 160ms",
                    touchAction: "manipulation",
                    cursor: "pointer",
                  }}
                >
                  押せ
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ margin: 0, color: "#ddd" }}>参加者がいません。</p>
        )}
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#111",
          borderRadius: "5px",
          textAlign: "left",
        }}
      >
        <p style={{ margin: 0, color: "#aaa" }}>【測定済み】</p>
        {!suppressResults && turnResults.length > 0 ? (
          <div style={{ marginTop: 8, color: "#fff" }}>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {turnResults.map((r) => (
                <span
                  key={r.id}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#333",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  {r.nickname}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ margin: "8px 0 0", color: "#666" }}>
            まだ記録はありません。
          </p>
        )}
      </div>
    </div>
  );
}
