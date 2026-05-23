import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type FinishPayload = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onFinish: (payload: FinishPayload) => void; // ゲーム終了時に順位と得点マップを渡す
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
      setTimeLeft(5);
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
    <div
      style={{
        backgroundColor: "#13232b",
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
            <p style={{ margin: 0, color: "#f5d565", fontWeight: 700 }}>
              <span
                style={{
                  fontFamily: "Garamond, 'Times New Roman', serif",
                  fontSize: 20,
                }}
              >
                {currentPlayer.nickname}
              </span>
              <span style={{ marginLeft: 8, fontSize: 16, color: "#ebd79a" }}>
                のターン
              </span>
            </p>
            <p style={{ margin: "8px 0 0", color: "#ddd" }}>
              次は {alivePlayers[currentTurnIndex + 1]?.nickname ?? "なし"}{" "}
              のターン
            </p>
            <p style={{ margin: "12px 0 0", color: "#aaa" }}>
              残り時間: {timeLeft}秒 / 連打数: {tapCount}
            </p>
            <p className="title-tagline" style={{ margin: "12px 0 0" }}>
              5秒の間に連打して、1人ずつ記録するゲームです。
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
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={handleReady}
                  className="title-menu__button title-menu__button--primary"
                >
                  準備OK
                </button>
              </div>
            ) : (
              <button
                onClick={handleTap}
                className="title-menu__button title-menu__button--primary"
                disabled={tapButtonDisabled}
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
                  fontSize: 20,
                  fontWeight: 800,
                  borderRadius: 999,
                  transform: isPressed ? "scale(0.92)" : "scale(1)",
                  boxShadow: isPressed
                    ? "inset 0 6px 12px rgba(0,0,0,0.35)"
                    : "0 10px 24px rgba(0,0,0,0.2)",
                  transition:
                    "transform 120ms ease, box-shadow 120ms ease, background-color 120ms",
                  touchAction: "manipulation",
                  opacity: tapButtonDisabled ? 0.72 : 1,
                  cursor: tapButtonDisabled ? "not-allowed" : "pointer",
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
        <p style={{ margin: 0, color: "#aaa" }}>【測定済み】</p>
        {turnResults.length > 0 ? (
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

      <button
        onClick={handleDummyFinish}
        className="title-menu__button"
        disabled={finishBtnDisabled}
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          fontSize: 14,
          borderRadius: 6,
          backgroundColor: finishBtnDisabled ? "#4f4f4f" : "#666",
          color: finishBtnDisabled ? "#b9b1a7" : "#e8e1d5",
          opacity: finishBtnDisabled ? 0.72 : 1,
          cursor: finishBtnDisabled ? "not-allowed" : "pointer",
          borderColor: "rgba(201, 199, 196, 0.34)",
        }}
      >
        {isFinished ? "結果送信済み" : "このターンを終了して次へ"}
      </button>
    </div>
  );
}
