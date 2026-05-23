import React from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

function useShakeCounter(active: boolean, threshold = 6, cooldown = 200) {
  const [count, setCount] = React.useState(0);
  const [mag, setMag] = React.useState(0);
  const [delta, setDelta] = React.useState(0);
  const prevMag = React.useRef<number | null>(null);
  const lastRef = React.useRef(0);
  const countRef = React.useRef(0);

  React.useEffect(() => {
    if (!active) return;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const x = a.x ?? 0;
      const y = a.y ?? 0;
      const z = a.z ?? 0;
      const m = Math.sqrt(x * x + y * y + z * z);
      setMag(m);
      if (prevMag.current != null) {
        const d = Math.abs(m - prevMag.current);
        setDelta(d);
        const now = Date.now();
        if (d > threshold && now - lastRef.current > cooldown) {
          lastRef.current = now;
          setCount((c) => {
            const nc = c + 1;
            countRef.current = nc;
            return nc;
          });
        }
      }
      prevMag.current = m;
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [active, threshold, cooldown]);

  const getCount = () => countRef.current;
  const reset = () => {
    setCount(0);
    countRef.current = 0;
    setMag(0);
    setDelta(0);
    prevMag.current = null;
    lastRef.current = 0;
  };

  return [count, reset, mag, delta, getCount] as const;
}

function requestPermissionWithActivation(): Promise<boolean> {
  const dme = typeof DeviceMotionEvent !== "undefined"
    ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> })
    : undefined;
  if (dme && typeof dme.requestPermission === "function") {
    try {
      return dme.requestPermission().then(r => r === "granted");
    } catch {
      return Promise.resolve(false);
    }
  }
  return Promise.resolve(typeof DeviceMotionEvent !== "undefined");
}

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = players.filter((p) => p.isAlive);
  const [idx, setIdx] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [permOk, setPermOk] = React.useState<boolean | null>(null);
  const [counts, setCounts] = React.useState<Record<number, number>>({});
  const [count, resetCount, , , getCount] = useShakeCounter(running);

  React.useEffect(() => {
    if (idx >= alivePlayers.length && alivePlayers.length > 0) {
      const ranking = [...alivePlayers]
        .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
        .map((p) => p.id);
      onFinish(ranking);
    }
  }, [idx, counts, alivePlayers, onFinish]);

  const startTurn = async () => {
    const ok = await requestPermissionWithActivation();
    if (!ok) {
      setPermOk(false);
      return;
    }
    setPermOk(true);
    resetCount();
    setCountdown(3);
  };

  React.useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setCountdown(null);
      setRunning(true);
      setTimeLeft(5);
    }, 500);
    return () => clearTimeout(timer);
  }, [countdown]);

  React.useEffect(() => {
    if (timeLeft === null) return;
    const timer = setTimeout(() => {
      if (timeLeft <= 0) {
        setRunning(false);
        setTimeLeft(null);
        const finalCount = getCount();
        setCounts((prev) => ({ ...prev, [alivePlayers[idx].id]: finalCount }));
        setIdx((i) => i + 1);
      } else {
        setTimeLeft((t) => (t ?? 0) - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const skipTurn = () => {
    setCounts((prev) => ({ ...prev, [alivePlayers[idx].id]: count }));
    setIdx((i) => i + 1);
  };

  return (
    <div
      style={{
        backgroundColor: "#0f1a0f",
        padding: 30,
        borderRadius: "12px",
        textAlign: "center",
        border: "1px solid rgba(180,150,120,0.15)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)",
      }}
    >
      <h3 style={{
        fontFamily: '"Garamond", "Times New Roman", serif',
        fontSize: "1.4rem",
        color: "#e8e0d4",
        letterSpacing: "0.08em",
        marginBottom: "1rem",
      }}>
        🎮 ミニゲーム：振るゲーム
      </h3>

      <div
        style={{
          margin: "20px 0",
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
          {alivePlayers.map((p) => (
            <span
              key={p.id}
              style={{
                padding: "5px 14px",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8e0d4",
                fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                fontSize: "0.9rem",
              }}
            >
              {p.nickname}
            </span>
          ))}
        </div>
      </div>

      {alivePlayers.length === 0 ? (
        <p style={{ color: "#888" }}>参加者がいません</p>
      ) : idx >= alivePlayers.length ? (
        <p style={{ color: "#888" }}>集計中…</p>
      ) : (
        <>
          <p style={{
            marginTop: "10px",
            color: "#e8e0d4",
            opacity: 0.75,
            fontSize: "1rem",
            lineHeight: 1.8,
          }}>
            <strong style={{
              fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
              color: "#e8e0d4",
            }}>
              {alivePlayers[idx].nickname}
            </strong>{" "}
            の番です。
          </p>

          {countdown !== null ? (
            <div style={{
              marginTop: 32,
              fontFamily: '"Garamond", "Times New Roman", serif',
              fontSize: countdown > 0 ? "6rem" : "3rem",
              color: countdown > 0 ? "#ff4444" : "#88ff88",
              textShadow: countdown > 0
                ? "0 0 40px rgba(255,68,68,0.4)"
                : "0 0 40px rgba(136,255,136,0.4)",
            }}>
              {countdown > 0 ? countdown : "GO!"}
            </div>
          ) : running ? (
            <>
              <div style={{
                marginTop: 16,
                fontFamily: '"Garamond", "Times New Roman", serif',
                fontSize: "1.2rem",
                color: "#ccc14b",
                marginBottom: "8px",
              }}>
                残り {timeLeft} 秒
              </div>
              <div style={{
                fontFamily: '"Garamond", "Times New Roman", serif',
                fontSize: "3rem",
                color: "#88ff88",
                textShadow: "0 0 20px rgba(136,255,136,0.2)",
                margin: "10px 0",
              }}>
                {count}
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  marginTop: 32,
                }}
              >
                <button
                  onClick={startTurn}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "6px",
                    border: "1px solid rgba(204,193,75,0.5)",
                    background: "linear-gradient(180deg, rgba(204,193,75,0.15), rgba(50,48,20,0.25))",
                    color: "#ccc14b",
                    fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  5秒で開始
                </button>
                <button
                  onClick={skipTurn}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.15))",
                    color: "#e8e0d4",
                    fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  手動で次へ
                </button>
              </div>
            </>
          )}

          {permOk === false && (
            <div style={{ marginTop: 12, color: "#ffa", fontSize: 13 }}>
              ⚠ センサー権限が拒否されました。
              一度拒否するとiOS側でブロックされます。
              解除するには:
              <strong> 設定 → Safari → 詳細 → Webサイトデータ</strong>
              からこのサイトのデータを消去してください。
            </div>
          )}
        </>
      )}
    </div>
  );
}
