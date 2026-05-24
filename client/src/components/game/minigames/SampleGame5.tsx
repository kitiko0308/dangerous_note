import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Player } from "../../../types";

type FinishPayload = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onFinish: (payload: FinishPayload) => void;
};

type FallingItem = {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  points: number;
  icon: string;
  color: string;
  kind: "good" | "bad";
};

const BOARD_WIDTH = 380;
const BOARD_HEIGHT = 460;
const CATCHER_WIDTH = 98;
const CATCHER_HEIGHT = 18;
const CATCHER_Y = BOARD_HEIGHT - 44;
const TURN_TIME_SECONDS = 20;
const COUNTDOWN_START = 3;
const ITEM_SIZE = 34;
const SPAWN_BASE_INTERVAL = 520;

const GOOD_ITEM_POOL = [
  { icon: "🍎", points: 1, color: "#f87171" },
  { icon: "⭐", points: 2, color: "#facc15" },
  { icon: "💎", points: 3, color: "#60a5fa" },
];

const BAD_ITEM = {
  icon: "💣",
  points: 0,
  color: "#ef4444",
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const makeItem = (nextId: number, difficulty: number): FallingItem => {
  // Aggressively higher bomb chance and stronger per-level increase
  const isBad = Math.random() < Math.min(0.85, 0.3 + difficulty * 0.08);
  const item = isBad
    ? BAD_ITEM
    : GOOD_ITEM_POOL[Math.floor(Math.random() * GOOD_ITEM_POOL.length)];
  // Much higher base speed and steeper difficulty scaling
  const speed = 210 + Math.random() * 110 + difficulty * 16;
  const x = 12 + Math.random() * (BOARD_WIDTH - ITEM_SIZE - 24);

  return {
    id: nextId,
    x,
    y: -ITEM_SIZE,
    speed,
    size: ITEM_SIZE,
    points: item.points,
    icon: item.icon,
    color: item.color,
    kind: isBad ? "bad" : "good",
  };
};

export default function SampleGame5({ players, onFinish }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((player) => player.isAlive),
    [players],
  );

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "countdown" | "running" | "result">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_SECONDS);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [items, setItems] = useState<FallingItem[]>([]);
  const [catcherX, setCatcherX] = useState((BOARD_WIDTH - CATCHER_WIDTH) / 2);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [wasGameOver, setWasGameOver] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const spawnAccumulatorRef = useRef(0);
  const timeLeftRef = useRef(TURN_TIME_SECONDS * 1000);
  const scoreRef = useRef(0);
  const scoresRef = useRef<Record<number, number>>({});
  const itemsRef = useRef<FallingItem[]>([]);
  const catcherXRef = useRef(catcherX);
  const nextItemIdRef = useRef(1);
  const turnFinishedRef = useRef(false);
  const currentTurnIndexRef = useRef(0);
  // keyboard control refs
  const keyLeftRef = useRef(false);
  const keyRightRef = useRef(false);
  const keyRafRef = useRef<number | null>(null);
  const keyLastRef = useRef<number | null>(null);

  useEffect(() => {
    catcherXRef.current = catcherX;
  }, [catcherX]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    currentTurnIndexRef.current = currentTurnIndex;
  }, [currentTurnIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (countdownRef.current !== null) {
        window.clearTimeout(countdownRef.current);
      }
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (keyRafRef.current !== null) {
        window.cancelAnimationFrame(keyRafRef.current);
        keyRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setCurrentTurnIndex(0);
    setPhase("idle");
    setCountdown(null);
    setTimeLeft(TURN_TIME_SECONDS);
    setScore(0);
    setScores({});
    setItems([]);
    setCatcherX((BOARD_WIDTH - CATCHER_WIDTH) / 2);
    setShowEndMessage(false);
    setIsDragging(false);
    setWasGameOver(false);

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    spawnAccumulatorRef.current = 0;
    timeLeftRef.current = TURN_TIME_SECONDS * 1000;
    scoreRef.current = 0;
    scoresRef.current = {};
    itemsRef.current = [];
    catcherXRef.current = (BOARD_WIDTH - CATCHER_WIDTH) / 2;
    nextItemIdRef.current = 1;
    turnFinishedRef.current = false;
    lastFrameRef.current = null;
  }, [alivePlayers.map((player) => player.id).join(",")]);

  const currentPlayer = alivePlayers[currentTurnIndex];

  const updateCatcherFromClientX = (clientX: number) => {
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const nextX = clamp(
      localX - CATCHER_WIDTH / 2,
      8,
      BOARD_WIDTH - CATCHER_WIDTH - 8,
    );

    catcherXRef.current = nextX;
    setCatcherX(nextX);
  };

  // Keyboard movement: ArrowLeft / ArrowRight (or A/D) control the catcher
  const startKeyLoopIfNeeded = () => {
    if (keyRafRef.current !== null) return;
    const moveSpeed = 360; // px per second
    const loop = (ts: number) => {
      if (keyLastRef.current === null) keyLastRef.current = ts;
      const dt = (ts - keyLastRef.current) / 1000;
      keyLastRef.current = ts;
      let dx = 0;
      if (keyLeftRef.current) dx -= moveSpeed * dt;
      if (keyRightRef.current) dx += moveSpeed * dt;
      if (dx !== 0) {
        const nextX = clamp(catcherXRef.current + dx, 8, BOARD_WIDTH - CATCHER_WIDTH - 8);
        catcherXRef.current = nextX;
        setCatcherX(nextX);
      }
      keyRafRef.current = window.requestAnimationFrame(loop);
    };
    keyRafRef.current = window.requestAnimationFrame(loop);
  };

  const stopKeyLoopIfNeeded = () => {
    if (!keyLeftRef.current && !keyRightRef.current) {
      if (keyRafRef.current !== null) {
        window.cancelAnimationFrame(keyRafRef.current);
        keyRafRef.current = null;
      }
      keyLastRef.current = null;
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keyLeftRef.current = true;
        startKeyLoopIfNeeded();
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keyRightRef.current = true;
        startKeyLoopIfNeeded();
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keyLeftRef.current = false;
        stopKeyLoopIfNeeded();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keyRightRef.current = false;
        stopKeyLoopIfNeeded();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (keyRafRef.current !== null) {
        window.cancelAnimationFrame(keyRafRef.current);
        keyRafRef.current = null;
      }
    };
  }, []);

  const clearActiveTimers = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const computeFinalRanking = (finalScores: Record<number, number>) => {
    return [...alivePlayers]
      .sort((a, b) => {
        const scoreDiff = (finalScores[b.id] ?? 0) - (finalScores[a.id] ?? 0);
        return scoreDiff !== 0 ? scoreDiff : a.id - b.id;
      })
      .map((player) => player.id);
  };

  const resetTurnState = () => {
    setPhase("idle");
    setCountdown(null);
    setTimeLeft(TURN_TIME_SECONDS);
    setScore(0);
    setItems([]);
    setCatcherX((BOARD_WIDTH - CATCHER_WIDTH) / 2);
    setShowEndMessage(false);
    setIsDragging(false);
    setWasGameOver(false);

    spawnAccumulatorRef.current = 0;
    timeLeftRef.current = TURN_TIME_SECONDS * 1000;
    scoreRef.current = 0;
    itemsRef.current = [];
    catcherXRef.current = (BOARD_WIDTH - CATCHER_WIDTH) / 2;
    lastFrameRef.current = null;
    turnFinishedRef.current = false;
  };

  const finishTurn = (gameOver = false) => {
    if (!currentPlayer || turnFinishedRef.current) return;
    turnFinishedRef.current = true;

    clearActiveTimers();

    const finalScore = scoreRef.current;
    const finalScores = {
      ...scoresRef.current,
      [currentPlayer.id]: finalScore,
    };
    scoresRef.current = finalScores;
    setScores(finalScores);
    setWasGameOver(gameOver);

    setPhase("result");
    setShowEndMessage(true);
    setIsDragging(false);

    if (currentTurnIndex + 1 >= alivePlayers.length) {
      transitionTimerRef.current = window.setTimeout(() => {
        onFinish({
          rankingIds: computeFinalRanking(finalScores),
          taps: finalScores,
        });
      }, 350);
      return;
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setCurrentTurnIndex((index) => index + 1);
      resetTurnState();
      transitionTimerRef.current = null;
    }, 1300);
  };

  const startRound = () => {
    if (!currentPlayer) return;

    if (countdownRef.current !== null) {
      window.clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    setPhase("countdown");
    setShowEndMessage(false);
    setIsDragging(false);
    setCountdown(COUNTDOWN_START);

    const step = (value: number) => {
      if (value > 0) {
        countdownRef.current = window.setTimeout(() => {
          setCountdown(value - 1);
          step(value - 1);
        }, 1000);
        return;
      }

      countdownRef.current = window.setTimeout(() => {
        setCountdown(null);
        setPhase("running");
        scoreRef.current = 0;
        timeLeftRef.current = TURN_TIME_SECONDS * 1000;
        setTimeLeft(TURN_TIME_SECONDS);
        setScore(0);
        setItems([]);
        spawnAccumulatorRef.current = 0;
        itemsRef.current = [];
        turnFinishedRef.current = false;
        lastFrameRef.current = null;

        const tick = (timestamp: number) => {
          if (turnFinishedRef.current) return;

          if (lastFrameRef.current === null) {
            lastFrameRef.current = timestamp;
            rafRef.current = window.requestAnimationFrame(tick);
            return;
          }

          const delta = timestamp - lastFrameRef.current;
          lastFrameRef.current = timestamp;

          timeLeftRef.current = Math.max(0, timeLeftRef.current - delta);
          const nextSeconds = Math.ceil(timeLeftRef.current / 1000);
          setTimeLeft(nextSeconds);

          if (timeLeftRef.current <= 0) {
            finishTurn();
            return;
          }

          const difficulty = Math.min(8, Math.floor(scoreRef.current / 10));
          const spawnInterval = Math.max(
            200,
            SPAWN_BASE_INTERVAL - difficulty * 80,
          );
          spawnAccumulatorRef.current += delta;

          const spawned: FallingItem[] = [];
          while (spawnAccumulatorRef.current >= spawnInterval) {
            spawnAccumulatorRef.current -= spawnInterval;
            spawned.push(makeItem(nextItemIdRef.current++, difficulty));
          }

          let gainedScore = 0;
          const nextItems = itemsRef.current
            .map((item) => {
              const nextY = item.y + item.speed * (delta / 1000);
              const catcherLeft = catcherXRef.current;
              const catcherRight = catcherLeft + CATCHER_WIDTH;
              const itemLeft = item.x;
              const itemRight = item.x + item.size;
              const overlapX = itemRight >= catcherLeft && itemLeft <= catcherRight;
              // allow small vertical tolerance so near-misses can still be caught
              const touchCatchLine =
                nextY + item.size >= (CATCHER_Y - 10) && nextY <= (CATCHER_Y + CATCHER_HEIGHT + 10);

              if (overlapX && touchCatchLine) {
                if (item.kind === "bad") {
                  finishTurn(true);
                  return null;
                }
                gainedScore += item.points;
                return null;
              }

              if (nextY > BOARD_HEIGHT + 40) {
                return null;
              }

              return { ...item, y: nextY };
            })
            .filter((item): item is FallingItem => item !== null)
            .concat(spawned);

          if (gainedScore > 0) {
            scoreRef.current += gainedScore;
            setScore(scoreRef.current);
          }

          itemsRef.current = nextItems;
          setItems(nextItems);

          rafRef.current = window.requestAnimationFrame(tick);
        };

        rafRef.current = window.requestAnimationFrame(tick);
        countdownRef.current = null;
      }, 500);
    };

    step(COUNTDOWN_START);
  };

  const handleBoardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateCatcherFromClientX(event.clientX);
  };

  const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateCatcherFromClientX(event.clientX);
  };

  const handleBoardPointerUp = () => {
    setIsDragging(false);
  };

  const currentScoreLabel = `${score}点`;
  const endMessageLabel = wasGameOver ? "ゲームオーバー" : "終了！";

  return (
    <div
      style={{
        backgroundColor: "#13232b",
        padding: 30,
        borderRadius: "12px",
        textAlign: "center",
        color: "white",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 10, color: "#e8e0d4" }}>
        🎮 ミニゲーム：キャッチキャッチ
      </h3>

      <p style={{ marginTop: 0, color: "#cbd5e1", lineHeight: 1.8 }}>
        落ちてくる物体をスライドで受け止めて、できるだけ高得点を狙ってください。
      </p>

      <div
        style={{
          margin: "18px 0",
          padding: "12px",
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p style={{ color: "#888", marginBottom: "10px", fontSize: "0.85rem" }}>
          【今回の参加者】
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {alivePlayers.map((player) => (
            <span
              key={player.id}
              style={{
                padding: "5px 14px",
                backgroundColor:
                  player.id === currentPlayer?.id ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.06)",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8e0d4",
                fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                fontSize: "0.9rem",
              }}
            >
              {player.nickname}
            </span>
          ))}
        </div>
      </div>

      {alivePlayers.length === 0 ? (
        <p style={{ color: "#888" }}>参加者がいません</p>
      ) : currentTurnIndex >= alivePlayers.length ? (
        <p style={{ color: "#888" }}>集計中…</p>
      ) : (
        <>
          <p style={{ marginTop: 8, color: "#f5d565", fontWeight: 700, fontSize: "1.05rem" }}>
            {currentPlayer?.nickname} のターン
          </p>
          <p style={{ marginTop: 6, marginBottom: 0, color: "#dbeafe" }}>
            次は {alivePlayers[currentTurnIndex + 1]?.nickname ?? "最後の人"} の番です。
          </p>
          <p style={{ marginTop: 10, marginBottom: 0, color: "#cbd5e1" }}>
            残り時間: {timeLeft}秒 / 現在スコア: {currentScoreLabel}
          </p>

          <div
            ref={boardRef}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
            onPointerLeave={handleBoardPointerUp}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: BOARD_WIDTH,
              height: BOARD_HEIGHT,
              margin: "18px auto 0",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                "linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(18,28,38,0.98) 55%, rgba(8,14,20,0.98) 100%)",
              overflow: "hidden",
              touchAction: "none",
              userSelect: "none",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 20%, rgba(96,165,250,0.12), transparent 40%), radial-gradient(circle at 50% 90%, rgba(251,191,36,0.08), transparent 34%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                right: 16,
                display: "flex",
                justifyContent: "space-between",
                color: "#e2e8f0",
                fontSize: 13,
                letterSpacing: "0.08em",
                zIndex: 2,
              }}
            >
              <span>つかまえて得点を稼ぐ</span>
              <span>スライドで移動</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  width: item.size,
                  height: item.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, #fff 0%, ${item.color} 28%, rgba(0,0,0,0.15) 100%)`,
                  boxShadow: `0 0 18px ${item.color}66`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  zIndex: 3,
                  transform: "translateZ(0)",
                }}
              >
                {item.icon}
              </div>
            ))}

            <div
              style={{
                position: "absolute",
                left: catcherX,
                top: CATCHER_Y,
                width: CATCHER_WIDTH,
                height: CATCHER_HEIGHT,
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(251,191,36,0.98) 0%, rgba(217,119,6,0.98) 100%)",
                boxShadow: "0 0 16px rgba(251,191,36,0.35)",
                border: "1px solid rgba(255,255,255,0.25)",
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1f2937",
                fontSize: 12,
                fontWeight: 700,
                cursor: "grab",
              }}
            >
              すくう
            </div>

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 18,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.6) 20%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.6) 80%, transparent 100%)",
                opacity: 0.35,
              }}
            />
          </div>

          {phase === "countdown" && countdown !== null ? (
            <div style={{ marginTop: 16, color: "#fff" }}>
              <p style={{ fontSize: 48, margin: "8px 0" }}>{countdown}</p>
              <p style={{ margin: 0, color: "#aaa" }}>スタンバイ…</p>
            </div>
          ) : phase === "idle" ? (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <button
                onClick={startRound}
                className="title-menu__button title-menu__button--primary"
              >
                準備OK
              </button>
            </div>
          ) : showEndMessage ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 38, margin: "8px 0", color: wasGameOver ? "#fca5a5" : "#fff" }}>
                {endMessageLabel}
              </p>
              <p style={{ margin: 0, color: "#e8e0d4" }}>獲得スコア: {scoreRef.current} 点</p>
            </div>
          ) : null}

          {phase === "running" && (
            <div style={{ marginTop: 12, color: "#cbd5e1" }}>
              物体を見逃さず、スライドでキャッチしてください。
            </div>
          )}
        </>
      )}

      <div
        style={{
          marginTop: 20,
          padding: "12px",
          backgroundColor: "rgba(0,0,0,0.28)",
          borderRadius: "8px",
          textAlign: "left",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p style={{ margin: 0, color: "#aaa" }}>【現在の記録】</p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {alivePlayers.map((player) => {
            const playerScore = scores[player.id] ?? (player.id === currentPlayer?.id ? score : 0);
            return (
              <span
                key={player.id}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e8e0d4",
                  fontSize: 14,
                }}
              >
                {player.nickname}: {playerScore}点
              </span>
            );
          })}
        </div>
        <p style={{ margin: "10px 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>
          🍎 / ⭐ / 💎 は得点、💣 は拾うとその人のターンが即ゲームオーバーです。
        </p>
      </div>
    </div>
  );
}