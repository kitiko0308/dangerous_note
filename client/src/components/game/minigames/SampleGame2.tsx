import React from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

// iOS などでセンサー権限が必要な場合に呼ぶユーティリティ
// ボタンのクリックなどユーザー操作内で呼ぶこと
async function requestMotionPermission(): Promise<boolean> {
  type ReqType = { requestPermission?: () => Promise<"granted" | "denied"> };
  const req = (DeviceMotionEvent as unknown as ReqType)?.requestPermission;
  if (typeof req === "function") {
    try {
      return (await req()) === "granted";
    } catch {
      return false;
    }
  }
  // requestPermission が無い環境は許可不要とみなす
  return true;
}

// 振った回数をカウントするフック
// active: 計測中フラグ、threshold: 差分の閾値、cooldown: 連続誤検出防止の間隔(ms)
function useShakeCounter(active: boolean, threshold = 12, cooldown = 450) {
  const [count, setCount] = React.useState(0); // 表示用カウント
  const [mag, setMag] = React.useState(0); // 現在のベクトル大きさ
  const [delta, setDelta] = React.useState(0); // 前フレームからの差分
  const prevMag = React.useRef<number | null>(null); // 直前の mag
  const lastRef = React.useRef(0); // 最後にヒットした時刻
  const countRef = React.useRef(0); // 最新カウントを参照するための ref

  // devicemotion を監視して mag/delta を計算し、閾値を超えたらカウント
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
        // 閾値超え & クールダウンを満たしたらカウント
        if (d > threshold && now - lastRef.current > cooldown) {
          lastRef.current = now;
          setCount((c) => {
            const nc = c + 1;
            countRef.current = nc; // ref にも保持して外部から参照可能にする
            return nc;
          });
        }
      }
      prevMag.current = m;
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [active, threshold, cooldown]);

  // 外部から現在のカウントを取得する関数
  const getCount = () => countRef.current;
  // カウント/内部状態をリセットする関数
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

export default function SampleGame({ players, onFinish }: Props) {
  // 生存している参加者だけを対象にする
  const alivePlayers = players.filter((p) => p.isAlive);
  // 現在何番目のプレイヤーを計測しているか（インデックス）
  const [idx, setIdx] = React.useState(0);
  // 計測中フラグ（true のとき devicemotion を監視）
  const [running, setRunning] = React.useState(false);
  // 各プレイヤーの確定カウントを保持するマップ { playerId: count }
  const [counts, setCounts] = React.useState<Record<number, number>>({});
  // 振るフックから表示用カウントと mag/delta、リセット関数などを受け取る
  const [count, resetCount, mag, delta, getCount] = useShakeCounter(running);

  // NOTE: we avoid calling setCounts synchronously inside an effect
  // to prevent cascading renders. final counts are set when a turn finishes.

  // 全員の順番が終わったら結果を作って親に渡す
  React.useEffect(() => {
    if (idx >= alivePlayers.length && alivePlayers.length > 0) {
      const ranking = [...alivePlayers]
        .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
        .map((p) => p.id);
      onFinish(ranking);
    }
  }, [idx, counts, alivePlayers, onFinish]);

  const startTurn = async (durationMs = 5000) => {
    // 権限を確認（iOS はここで requestPermission を呼ぶ）
    const ok = await requestMotionPermission();
    if (!ok) {
      alert("センサー権限が必要です");
      return;
    }
    // 計測開始前に内部カウントをリセットして測定フラグを立てる
    resetCount();
    setRunning(true);
    // durationMs 後に計測を止めて確定値を保存、次のプレイヤーへ
    setTimeout(() => {
      setRunning(false);
      const finalCount = getCount(); // ref から最新値を取得
      setCounts((prev) => ({ ...prev, [alivePlayers[idx].id]: finalCount }));
      setIdx((i) => i + 1);
    }, durationMs);
  };

  const skipTurn = () => {
    // 手動で次へ（現在の表示カウントを確定して次へ進む）
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
            <div style={{ color: "#fff" }}>カウント: {count}</div>
            <div style={{ color: "#ddd" }}>
              mag: {mag.toFixed(3)} delta: {delta.toFixed(3)}
            </div>
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
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: "#ccc14b",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              5秒で開始
            </button>
            <button
              onClick={skipTurn}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              手動で次へ
            </button>
          </div>

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
