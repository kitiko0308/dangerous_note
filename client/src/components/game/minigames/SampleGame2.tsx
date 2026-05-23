import React from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

function sensorApiSupported(): boolean {
  return typeof DeviceMotionEvent !== 'undefined'
    || typeof DeviceOrientationEvent !== 'undefined';
}

function useShakeCounter(active: boolean, threshold = 12, cooldown = 450) {
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
  const [supported] = React.useState<boolean>(sensorApiSupported);
  const [permOk, setPermOk] = React.useState<boolean | null>(null);
  const [pressed, setPressed] = React.useState(false);
  const [counts, setCounts] = React.useState<Record<number, number>>({});
  const [count, resetCount, mag, delta, getCount] = useShakeCounter(running);

  React.useEffect(() => {
    if (idx >= alivePlayers.length && alivePlayers.length > 0) {
      const ranking = [...alivePlayers]
        .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
        .map((p) => p.id);
      onFinish(ranking);
    }
  }, [idx, counts, alivePlayers, onFinish]);

  const startTurn = async (durationMs = 5000) => {
    const ok = await requestPermissionWithActivation();
    if (!ok) {
      setPressed(true);
      setPermOk(false);
      return;
    }
    setPressed(true);
    setPermOk(true);
    resetCount();
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      const finalCount = getCount();
      setCounts((prev) => ({ ...prev, [alivePlayers[idx].id]: finalCount }));
      setIdx((i) => i + 1);
    }, durationMs);
  };

  const skipTurn = () => {
    setCounts((prev) => ({ ...prev, [alivePlayers[idx].id]: count }));
    setIdx((i) => i + 1);
  };

  return (
    <div
      style={{
        backgroundColor: "#2a4a2a",
        padding: 30,
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h3>🎮 ミニゲーム：振るゲーム（順番計測）</h3>

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

      {alivePlayers.length === 0 ? (
        <p style={{ color: "#ccc" }}>参加者がいません</p>
      ) : idx >= alivePlayers.length ? (
        <p style={{ color: "#ccc" }}>集計中…</p>
      ) : (
        <>
          <p style={{ marginTop: "10px", color: "#aaa" }}>
            {alivePlayers[idx].nickname}{" "}
            の番です。計測中はスマホを振ってください。
          </p>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#fff" }}>計測中: {String(running)}</div>
            <div style={{ color: "#fff" }}>
              センサー対応: {String(supported)}
            </div>
            <div style={{ color: "#fff" }}>
              権限: {permOk === null ? "未取得" : permOk ? "許可" : "拒否"}
            </div>
            <div style={{ color: "#fff" }}>カウント: {count}</div>
            <div style={{ color: "#ddd" }}>
              mag: {mag.toFixed(3)} delta: {delta.toFixed(3)}
            </div>
            <div style={{ color: "#fff" }}>ボタン押下: {String(pressed)}</div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <button
              onClick={() => startTurn(5000)}
              disabled={running}
              style={{
                padding: "10px 20px",
                cursor: running ? "default" : "pointer",
                backgroundColor: "#ccc14b",
                color: "white",
                border: "none",
                borderRadius: "5px",
                opacity: running ? 0.5 : 1,
              }}
            >
              5秒で開始
            </button>
            <button
              onClick={skipTurn}
              disabled={running}
              style={{
                padding: "10px 20px",
                cursor: running ? "default" : "pointer",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: "5px",
                opacity: running ? 0.5 : 1,
              }}
            >
              手動で次へ
            </button>
          </div>

          {permOk === false && (
            <div style={{ marginTop: 12, color: "#ffa", fontSize: 13 }}>
              ⚠ センサー権限が拒否されました。
              一度拒否するとiOS側でブロックされます。
              解除するには:
              <strong> 設定 → Safari → 詳細 → Webサイトデータ</strong>
              からこのサイトのデータを消去してください。
            </div>
          )}

          <p style={{ marginTop: 16, color: "#ccc" }}>
            現在の結果:{" "}
            {alivePlayers
              .map((p) => `${p.nickname}:${counts[p.id] || 0}`)
              .join(" ／ ")}
          </p>
        </>
      )}
    </div>
  );
}
