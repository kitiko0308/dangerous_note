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

  // Apply Landing-like styles to nearby headers rendered outside this component
  // (we modify DOM at runtime so we don't have to edit other files).
  useEffect(() => {
    // style mini game phase header
    try {
      const allH2 = Array.from(document.querySelectorAll("h2"));
      allH2.forEach((el) => {
        let text = el.textContent || "";
        // remove dice emoji if present
        if (text.includes("🎲")) {
          el.textContent = text.replace(/🎲/g, "").trim();
          text = el.textContent || "";
        }
        if (text.includes("ミニゲームフェーズ")) {
          el.style.fontFamily = "Garamond, 'Times New Roman', serif";
          el.style.fontSize = "20px";
          el.style.letterSpacing = "0.06em";
          el.style.color = "#ebe4d8";
          el.style.textAlign = "center";
        }
        if (/第\s*\d+\s*ターン/.test(text)) {
          el.style.fontFamily = "Yu Gothic UI, 'Yu Gothic', sans-serif";
          el.style.fontSize = "16px";
          el.style.color = "#e8e0d4";
          el.style.textAlign = "center";
        }
      });

      // adjust any small green indicator under mini game phase (if exists)
      const greenEls = Array.from(document.querySelectorAll(".phase-indicator, .phase-bar, .green"));
      greenEls.forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundColor || "";
        // replace vivid green with a warmer, Landing-like accent if element seems green
        if (bg.includes("rgb") && bg.includes("0, 128, 0") || bg.includes("green") || bg.includes("#4CAF50")) {
          (el as HTMLElement).style.backgroundColor = "#1976d2"; // Landing blue-red accent
        }
      });
    } catch (e) {
      // ignore DOM errors
    }
  }, []);

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

  const finishBtnDisabled =
    !isRunning || isFinished || countdown !== null || showEndMessage || !currentPlayer;

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
              <span style={{ fontFamily: "Garamond, 'Times New Roman', serif", fontSize: 20 }}>
                {currentPlayer.nickname}
              </span>
              <span style={{ marginLeft: 8, fontSize: 16, color: "#ebd79a" }}>のターン</span>
            </p>
            <p style={{ margin: "8px 0 0", color: "#ddd" }}>
              次は {alivePlayers[currentTurnIndex + 1]?.nickname ?? "なし"}{" "}
              のターン
            </p>
            <p style={{ margin: "12px 0 0", color: "#aaa" }}>
              残り時間: {timeLeft}秒 / 連打数: {tapCount}
            </p>
            <p className="title-tagline" style={{ margin: "12px 0 0" }}>
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
                className="title-menu__button title-menu__button--primary"
                style={{ marginTop: "16px" }}
              >
                準備OK
              </button>
            ) : (
              <button
                onClick={handleTap}
                className="title-menu__button title-menu__button--primary"
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
                  fontSize: 20,
                  fontWeight: 800,
                  borderRadius: 999,
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
            <p style={{ margin: 0 }}></p>
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
          // unify to the same grey used in the ready state
          backgroundColor: "#666",
          color: "#e8e1d5",
          cursor: finishBtnDisabled ? "not-allowed" : "pointer",
          borderColor: "rgba(201, 199, 196, 0.34)",
        }}
      >
        {isFinished ? "結果送信済み" : "このターンを終了して次へ"}
      </button>
    </div>
  );
}
