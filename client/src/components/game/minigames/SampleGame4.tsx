import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type FinishPayload = { rankingIds: number[]; taps: Record<number, number> };

type Props = {
  players: Player[];
  onFinish: (payload: FinishPayload) => void;
};

type TurnResult = {
  id: number;
  nickname: string;
  distance: number;
  hitObstacle?: boolean;
};

type ObstacleKind = "ground" | "ceiling";

const TRACK_WIDTH = 360;
const RUNNER_X = 56;
const RUNNER_WIDTH = 34;
const OBSTACLE_START_X = 420;
const OBSTACLE_HALF_WIDTH = 12;
const JUMP_DURATION_MS = 420;
const GROUND_OBSTACLE_BOTTOM = 26;
const CEILING_OBSTACLE_BOTTOM = 82;
const OBSTACLE_HEIGHT = 18;

const getRandomObstacleKind = (difficultyLevel: number): ObstacleKind => {
  const ceilingChance = Math.min(0.5, 0.18 + difficultyLevel * 0.06);
  return Math.random() < ceilingChance ? "ceiling" : "ground";
};

const getNextObstacleGap = (difficultyLevel: number) => {
  const minGap = Math.max(24, 90 - difficultyLevel * 10);
  const maxGap = Math.max(minGap + 20, 180 - difficultyLevel * 16);
  return minGap + Math.random() * (maxGap - minGap);
};

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((player) => player.isAlive),
    [players],
  );

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "ready" | "running" | "result">(
    "idle",
  );
  const [isJumping, setIsJumping] = useState(false);
  const [, setDistance] = useState(0);
  const [, setSpeed] = useState(160);
  const [obstacleX, setObstacleX] = useState(OBSTACLE_START_X);
  const [turnResults, setTurnResults] = useState<TurnResult[]>([]);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [jumpOffset, setJumpOffset] = useState(0);
  const [obstacleKind, setObstacleKind] = useState<ObstacleKind>("ground");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const rafRef = useRef<number | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const obstacleXRef = useRef(OBSTACLE_START_X);
  const obstacleKindRef = useRef<ObstacleKind>("ground");
  const distanceRef = useRef(0);
  const speedRef = useRef(160);
  const jumpingRef = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (jumpTimerRef.current !== null)
        window.clearTimeout(jumpTimerRef.current);
      if (transitionTimerRef.current !== null)
        window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setCurrentTurnIndex(0);
    setPhase("idle");
    setIsJumping(false);
    setDistance(0);
    setSpeed(160);
    setObstacleX(OBSTACLE_START_X);
    setTurnResults([]);
    setShowEndMessage(false);
    setJumpOffset(0);
    setObstacleKind("ground");
    obstacleXRef.current = OBSTACLE_START_X;
    obstacleKindRef.current = "ground";
    distanceRef.current = 0;
    speedRef.current = 160;
    jumpingRef.current = false;
    runningRef.current = false;
    lastFrameRef.current = null;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = null;
    }
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, [alivePlayers.map((player) => player.id).join(",")]);

  const endTurn = (hitObstacle: boolean) => {
    const currentPlayer = alivePlayers[currentTurnIndex];
    if (!currentPlayer) return;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = null;
    }

    const result = {
      id: currentPlayer.id,
      nickname: currentPlayer.nickname,
      distance: Math.max(0, Math.round(distanceRef.current * 10) / 10),
      hitObstacle,
    };

    const newResults = [...turnResults, result];
    setTurnResults(newResults);
    setPhase("result");
    setShowEndMessage(true);
    setIsJumping(false);
    jumpingRef.current = false;
    runningRef.current = false;

    const finishGame = () => {
      const sorted = [...newResults].sort((a, b) => {
        if (b.distance !== a.distance) return b.distance - a.distance;
        return a.id - b.id;
      });
      const rankingIds = sorted.map((item) => item.id);
      const tapsMap: Record<number, number> = {};
      setTimeout(() => onFinish({ rankingIds, taps: tapsMap }), 350);
    };

    if (currentTurnIndex + 1 >= alivePlayers.length) {
      finishGame();
      return;
    }

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setCurrentTurnIndex((index) => index + 1);
      setPhase("idle");
      setShowEndMessage(false);
      setDistance(0);
      setSpeed(160);
      setObstacleX(OBSTACLE_START_X);
      setIsJumping(false);
      setJumpOffset(0);
      setObstacleKind("ground");

      obstacleXRef.current = OBSTACLE_START_X;
      obstacleKindRef.current = "ground";
      distanceRef.current = 0;
      speedRef.current = 160;
      jumpingRef.current = false;
      runningRef.current = false;
      lastFrameRef.current = null;
      transitionTimerRef.current = null;
    }, 1300);
  };

  const startRound = () => {
    if (!alivePlayers[currentTurnIndex]) return;

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setShowEndMessage(false);
    setPhase("running");
    runningRef.current = true;
    setDistance(0);
    setSpeed(160);
    setObstacleX(OBSTACLE_START_X);
    setIsJumping(false);
    setJumpOffset(0);
    setObstacleKind("ground");
    obstacleXRef.current = OBSTACLE_START_X;
    obstacleKindRef.current = "ground";
    distanceRef.current = 0;
    speedRef.current = 160;
    jumpingRef.current = false;
    lastFrameRef.current = null;

    const tick = (timestamp: number) => {
      if (!runningRef.current) return;

      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      const difficultyLevel = Math.min(8, Math.floor(distanceRef.current / 80));
      // base acceleration and per-level boost increased for steeper difficulty ramp
      const nextSpeed = Math.min(
        600,
        speedRef.current + delta * (0.012 + difficultyLevel * 0.004),
      );
      const nextDistance = distanceRef.current + (nextSpeed * delta) / 1000;
      const nextObstacleX =
        obstacleXRef.current - (nextSpeed + 120) * (delta / 1000);

      distanceRef.current = nextDistance;
      speedRef.current = nextSpeed;

      let obstaclePosition = nextObstacleX;
      if (obstaclePosition < -44) {
        obstacleKindRef.current = getRandomObstacleKind(difficultyLevel);
        setObstacleKind(obstacleKindRef.current);

        const gap = getNextObstacleGap(difficultyLevel);
        obstaclePosition = OBSTACLE_START_X + gap;

        // ensure obstacle won't reach the runner before current jump window finishes
        const relativeSpeed = nextSpeed + 120; // same factor used for movement
        const timeToReachMs =
          ((obstaclePosition - RUNNER_X) / relativeSpeed) * 1000;
        const minSafeMs = JUMP_DURATION_MS + 220; // safe margin after jump
        if (timeToReachMs < minSafeMs) {
          const extra = ((minSafeMs - timeToReachMs) / 1000) * relativeSpeed;
          obstaclePosition += extra;
        }
      }
      obstacleXRef.current = obstaclePosition;

      setDistance(Math.round(nextDistance * 10) / 10);
      setSpeed(Math.round(nextSpeed));
      setObstacleX(obstaclePosition);

      const obstacleLeft = obstaclePosition - OBSTACLE_HALF_WIDTH;
      const obstacleRight = obstaclePosition + OBSTACLE_HALF_WIDTH;
      const runnerLeft = RUNNER_X;
      const runnerRight = RUNNER_X + RUNNER_WIDTH;
      const collided =
        obstacleRight >= runnerLeft &&
        obstacleLeft <= runnerRight &&
        ((obstacleKindRef.current === "ground" && !jumpingRef.current) ||
          (obstacleKindRef.current === "ceiling" && jumpingRef.current));

      if (collided) {
        runningRef.current = false;
        endTurn(true);
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  };

  const handleJump = () => {
    if (!runningRef.current || isJumping) return;

    setIsJumping(true);
    setJumpOffset(1);
    jumpingRef.current = true;

    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
    }
    jumpTimerRef.current = window.setTimeout(() => {
      setIsJumping(false);
      setJumpOffset(0);
      jumpingRef.current = false;
      jumpTimerRef.current = null;
    }, JUMP_DURATION_MS);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "ArrowUp") {
        event.preventDefault();
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, isJumping]);

  useEffect(() => {
    const isTouch =
      typeof navigator !== "undefined" &&
      (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
    try {
      const mq = window.matchMedia && window.matchMedia("(pointer: coarse)");
      if (mq && mq.matches) setIsTouchDevice(true);
      else setIsTouchDevice(Boolean(isTouch));
    } catch (e) {
      setIsTouchDevice(Boolean(isTouch));
    }
  }, []);

  const currentPlayer = alivePlayers[currentTurnIndex];

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
      <h3>🎮 ミニゲーム：ジャンプラン</h3>
      <p style={{ marginTop: 8, color: "#ddd" }}>
        障害物をジャンプで飛び越え、進んだ距離を競ってください。障害物に当たるとその人の挑戦は終了です。
      </p>

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
          {alivePlayers.map((player) => (
            <span
              key={player.id}
              style={{
                padding: "5px 10px",
                backgroundColor: "#444",
                borderRadius: "15px",
              }}
            >
              {player.nickname}
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
              {alivePlayers[currentTurnIndex + 1]
                ? `次は ${alivePlayers[currentTurnIndex + 1].nickname} のターン`
                : "あなたが最後の番です"}
            </p>

            <div
              style={{
                marginTop: 18,
                position: "relative",
                width: "100%",
                maxWidth: TRACK_WIDTH,
                height: 150,
                marginLeft: "auto",
                marginRight: "auto",
                borderRadius: 16,
                background:
                  "linear-gradient(180deg, rgba(118, 199, 255, 0.18) 0%, rgba(23, 48, 30, 0.95) 30%, rgba(14, 28, 17, 1) 100%)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 26,
                  height: 2,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.45), rgba(255,255,255,0.08))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: RUNNER_X,
                  bottom: jumpOffset ? 72 : 26,
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle at 35% 35%, #fef2c0 0%, #ffcb69 38%, #cc7a00 100%)",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
                  transition: `bottom ${JUMP_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: obstacleX,
                  bottom:
                    obstacleKind === "ground"
                      ? GROUND_OBSTACLE_BOTTOM
                      : CEILING_OBSTACLE_BOTTOM,
                  width: obstacleKind === "ground" ? 24 : 28,
                  height: OBSTACLE_HEIGHT,
                  borderRadius: 6,
                  background:
                    obstacleKind === "ground"
                      ? "linear-gradient(180deg, #ff8a65 0%, #d84315 100%)"
                      : "linear-gradient(180deg, #9c27b0 0%, #5e35b1 100%)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.28)",
                  transform: "translateX(-50%)",
                }}
              />
              {/* 状態表示を非表示にしました */}
              {/* 右上の余分な丸を削除しました */}
            </div>

            <p style={{ margin: "10px 0 0", color: "#ddd" }}>
              スペースキーかジャンプボタンで操作できます。地上の障害物はジャンプで避けられますが、頭上の障害物はジャンプすると当たります。
            </p>

            {showEndMessage ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 48, margin: "8px 0", color: "#fff" }}>
                  終了！
                </p>
              </div>
            ) : phase === "idle" ? (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={startRound}
                  className="title-menu__button title-menu__button--primary"
                >
                  準備OK
                </button>
              </div>
            ) : phase === "running" ? (
              isTouchDevice ? (
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={handleJump}
                    className="title-menu__button title-menu__button--primary"
                    style={{ minWidth: 140 }}
                  >
                    ジャンプ
                  </button>
                </div>
              ) : null
            ) : (
              <div style={{ marginTop: 16 }}>
                <p style={{ margin: 0, color: "#ddd" }}>記録を集計中です。</p>
              </div>
            )}
          </>
        ) : (
          <p style={{ margin: 0, color: "#ddd" }}>参加者がいません。</p>
        )}
      </div>

      {/* 走行記録表示を非表示にしました */}
    </div>
  );
}
