import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void; // ゲーム終了時に順位（ID配列）を渡す
};

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((p) => p.isAlive),
    [players],
  );
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [tapCount, setTapCount] = useState(0);
  const [turnResults, setTurnResults] = useState<
    Array<{ id: number; nickname: string; taps: number }>
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const endTimerRef = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const currentPlayer = alivePlayers[currentTurnIndex];

  const startNextTurn = (nextIndex: number) => {
    setCurrentTurnIndex(nextIndex);
    setTimeLeft(10);
    setTapCount(0);
    setIsRunning(false);
    setCountdown(null);
  };

  const finishCurrentTurn = () => {
    if (!currentPlayer) {
      return;
    }

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
      const rankingIds = [...nextResults]
        .sort((a, b) => b.taps - a.taps || a.id - b.id)
        .map((result) => result.id);

      setIsFinished(true);
      onFinish(rankingIds);
      return;
    }

    // show "終了!" for 3s, then advance to next player's Ready state
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
    if (!currentPlayer || isFinished || !isRunning) {
      return;
    }

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

  // countdown 3..2..1 -> start
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
      setTimeLeft(10);
    }, 600);
    return () => window.clearTimeout(id);
  }, [countdown]);

  // NOTE: リーダーのルール指摘に対応
  // alivePlayers は useMemo(..., [players]) の結果で、親コンポーネントが
  // 毎レンダー新しい配列を渡す実装だと参照が変わります。
  // その場合、この useEffect が意図せず発火して途中のゲーム進行が
  // リセットされてしまう恐れがあります。
  //
  // 対策：配列参照ではなく「参加者のID列」をキーに使い、顔ぶれが
  // 実際に変わったときだけリセットされるようにします。
  useEffect(() => {
    setCurrentTurnIndex(0);
    setTimeLeft(10);
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
    // depend on stable key of alivePlayers (IDs concatenated)
  }, [alivePlayers.map((p) => p.id).join(",")]);

  const handleDummyFinish = () => {
    // Only allow manual finish while the measurement is actively running.
    // Prevents double-submission when '終了!' is showing or during countdown.
    if (
      !currentPlayer ||
      isFinished ||
      !isRunning ||
      countdown !== null ||
      showEndMessage
    ) {
      return;
    }

    // stop the running timer and record result
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
    // start 3..2..1 countdown
    setCountdown(3);
  };

  const rankingPreview = [...turnResults]
    .sort((a, b) => b.taps - a.taps || a.id - b.id)
    .map((result) => `${result.nickname}(${result.taps}回)`);

  return (
    <div
      style={{
        backgroundColor: "#2a4a2a",
        padding: 30,
        borderRadius: "8px",
        textAlign: "center",
        color: "white",
      }}
    >
      <div
        style={{
          margin: "20px 0",
          padding: "10px",
          backgroundColor: "#111",
          borderRadius: "5px",
        }}
      >
        <p style={{ color: "#aaa", marginBottom: "10px" }}>【今回の参加者】</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {alivePlayers.map((p) => (
            <span
              key={p.id}
              style={{
                padding: "5px 10px",
                backgroundColor: "#444",
                borderRadius: "15px",
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
          padding: "16px",
          backgroundColor: "#1b1b1b",
          borderRadius: "8px",
        }}
      >
        {currentPlayer ? (
          <>
            <p
              style={{
                margin: 0,
                color: "#f5d565",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {currentPlayer.nickname} のターン
            </p>
            <p style={{ margin: "8px 0 0", color: "#ddd" }}>
              次は {alivePlayers[currentTurnIndex + 1]?.nickname ?? "なし"}{" "}
              のターン
            </p>
            <p style={{ margin: "12px 0 0", color: "#aaa" }}>
              残り時間: {timeLeft}秒 / 連打数: {tapCount}
            </p>
            <p style={{ margin: "12px 0 0", color: "#aaa" }}>
              10秒の間に連打して、1人ずつ記録するゲームです。
            </p>

            {showEndMessage ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 48, margin: "8px 0", color: "#fff" }}>
                  終了！
                </p>
              </div>
            ) : countdown !== null ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 48, margin: "8px 0", color: "#fff" }}>
                  {countdown}
                </p>
                <p style={{ margin: 0, color: "#aaa" }}>スタンバイ…</p>
              </div>
            ) : !isRunning ? (
              <button
                onClick={handleReady}
                style={{
                  marginTop: "16px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              >
                準備OK
              </button>
            ) : (
              <button
                onClick={handleTap}
                disabled={
                  !isRunning ||
                  timeLeft <= 0 ||
                  isFinished ||
                  countdown !== null ||
                  showEndMessage ||
                  !currentPlayer
                }
                onPointerDown={() => setIsPressed(true)}
                onPointerUp={() => setIsPressed(false)}
                onPointerCancel={() => setIsPressed(false)}
                onPointerLeave={() => setIsPressed(false)}
                style={{
                  marginTop: "16px",
                  width: 120,
                  height: 120,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor:
                    !isRunning ||
                    timeLeft <= 0 ||
                    isFinished ||
                    countdown !== null ||
                    showEndMessage ||
                    !currentPlayer
                      ? "not-allowed"
                      : "pointer",
                  backgroundColor:
                    !isRunning ||
                    timeLeft <= 0 ||
                    isFinished ||
                    countdown !== null ||
                    showEndMessage ||
                    !currentPlayer
                      ? "#666"
                      : "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: 20,
                  fontWeight: 800,
                  boxShadow: isPressed
                    ? "inset 0 6px 12px rgba(0,0,0,0.35)"
                    : "0 10px 24px rgba(0,0,0,0.2)",
                  transform: isPressed ? "scale(0.92)" : "scale(1)",
                  transition:
                    "transform 120ms ease, box-shadow 120ms ease, background-color 120ms",
                  touchAction: "manipulation",
                }}
              >
                連打！
              </button>
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
        <p style={{ margin: 0, color: "#aaa" }}>【進行状況】</p>
        {turnResults.length > 0 ? (
          <p style={{ margin: "8px 0 0", color: "#fff" }}>
            {rankingPreview.join(" / ")}
          </p>
        ) : (
          <p style={{ margin: "8px 0 0", color: "#666" }}>
            まだ記録はありません。
          </p>
        )}
      </div>

      <button
        onClick={handleDummyFinish}
        disabled={
          !isRunning ||
          isFinished ||
          countdown !== null ||
          showEndMessage ||
          !currentPlayer
        }
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor:
            !isRunning ||
            isFinished ||
            countdown !== null ||
            showEndMessage ||
            !currentPlayer
              ? "not-allowed"
              : "pointer",
          backgroundColor:
            !isRunning ||
            isFinished ||
            countdown !== null ||
            showEndMessage ||
            !currentPlayer
              ? "#888"
              : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {isFinished ? "結果送信済み" : "このターンを終了して次へ"}
      </button>
    </div>
  );
}
