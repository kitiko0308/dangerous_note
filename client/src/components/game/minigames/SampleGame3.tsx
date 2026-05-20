import React, { useEffect, useRef, useState } from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = players.filter((p) => p.isAlive);
  const [results, setResults] = useState<Record<number, number[]>>({});
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState(
    "スマホを振ってサイコロを振ってください",
  );
  const lastShakeRef = useRef(0);
  const listeningRef = useRef(false);

  // 振動（シェイク）検出
  useEffect(() => {
    const threshold = 18; // 調整可能
    const cooldown = 1200; // ms

    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > threshold && now - lastShakeRef.current > cooldown) {
        lastShakeRef.current = now;
        triggerRoll();
      }
    }

    // iOS の場合は permission が必要
    async function startListening() {
      try {
        // @ts-ignore
        if (
          typeof DeviceMotionEvent !== "undefined" &&
          typeof DeviceMotionEvent.requestPermission === "function"
        ) {
          // iOS: permission must be requested from a user gesture. We'll fall back to showing a small allow button.
          // do nothing here; permission handled by manual button below if needed
        } else {
          window.addEventListener("devicemotion", handleMotion);
          listeningRef.current = true;
        }
      } catch (err) {
        // ignore
      }
    }

    startListening();

    return () => {
      if (listeningRef.current)
        window.removeEventListener("devicemotion", handleMotion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 実際のサイコロ振り処理
  function triggerRoll() {
    if (rolling) return;
    setRolling(true);
    setMessage("振っています…");
    // アニメーション的に短時間ダミーを見せる
    const steps = 12;
    let step = 0;

    const interim: Record<number, number[]> = {};
    alivePlayers.forEach((p) => (interim[p.id] = [1, 1, 1]));

    const t = setInterval(() => {
      step += 1;
      // ランダムで数値を更新
      const snapshot: Record<number, number[]> = {};
      alivePlayers.forEach((p) => {
        snapshot[p.id] = [rollDie(), rollDie(), rollDie()];
      });
      setResults(snapshot);
      if (step >= steps) {
        clearInterval(t);
        // 最終結果を確定
        const final: Record<number, number[]> = {};
        alivePlayers.forEach((p) => {
          final[p.id] = [rollDie(), rollDie(), rollDie()];
        });
        setResults(final);
        setRolling(false);
        setMessage("結果表示中… 自動で進行します");
        // 自動で結果フェーズへ移動（短めの猶予）
        setTimeout(() => {
          const sums = alivePlayers.map((p) => ({
            id: p.id,
            sum: (final[p.id] || [0, 0, 0]).reduce((a, b) => a + b, 0),
          }));
          // 大きい順にソート。合計が同じ場合は id 小さいほうを先に
          sums.sort((a, b) => b.sum - a.sum || a.id - b.id);
          const ranking = sums.map((s) => s.id);
          onFinish(ranking);
        }, 2000);
      }
    }, 80);
  }

  // iOS 用の permission をユーザー操作で取るボタン（必要なら）
  async function requestMotionPermission() {
    // @ts-ignore
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        // @ts-ignore
        const res = await DeviceMotionEvent.requestPermission();
        if (res === "granted") {
          window.addEventListener("devicemotion", (e) => {
            // forward to triggerRoll when shake detected
            const acc = e.acceleration || e.accelerationIncludingGravity;
            if (!acc) return;
            const x = acc.x || 0;
            const y = acc.y || 0;
            const z = acc.z || 0;
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            if (magnitude > 18) triggerRoll();
          });
          setMessage("モーション許可が得られました。スマホを振ってください");
        } else {
          setMessage(
            "モーション許可が拒否されました。代替ボタンを使ってください",
          );
        }
      } catch (err) {
        setMessage("モーション許可に失敗しました。ボタンで振ってください");
      }
    }
  }

  // ユーザーインターフェース
  return (
    <div
      style={{
        backgroundColor: "#2a4a2a",
        padding: 30,
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h3>🎲 ミニゲーム：チンチロ（スマホを振って振る）</h3>

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

      <p style={{ marginTop: "10px", color: "#fff" }}>{message}</p>

      {/* iOS permission のための小さなボタン（必要な場合のみユーザーが押す） */}
      {/* 表示は環境に応じて自由に変更可 */}
      <div style={{ marginTop: 12 }}>
        {/* @ts-ignore */}
        {typeof DeviceMotionEvent !== "undefined" &&
        typeof (DeviceMotionEvent as any).requestPermission === "function" ? (
          <button
            onClick={requestMotionPermission}
            style={{
              marginRight: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#4cafa2",
              color: "white",
            }}
          >
            モーション許可
          </button>
        ) : null}

        {/* デスクトップや許可拒否時の代替ボタン（テスト用） */}
        <button
          onClick={() => triggerRoll()}
          disabled={rolling}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: rolling ? "#888" : "#4cafa2",
            color: "white",
          }}
        >
          {rolling ? "振っています…" : "（テスト）振る"}
        </button>
      </div>

      <div style={{ marginTop: 18, color: "#fff" }}>
        {alivePlayers.map((p) => {
          const dice = results[p.id] || [];
          const sum = dice.length ? dice.reduce((a, b) => a + b, 0) : null;
          return (
            <div
              key={p.id}
              style={{
                margin: "8px 0",
                backgroundColor: "#222",
                padding: 8,
                borderRadius: 6,
              }}
            >
              <strong style={{ color: "#fff" }}>{p.nickname}</strong>
              <div style={{ marginTop: 6 }}>
                {dice.length ? (
                  <>
                    <span style={{ marginRight: 8 }}>
                      サイコロ: {dice.join(" - ")}
                    </span>
                    <span>合計: {sum}</span>
                  </>
                ) : (
                  <span style={{ color: "#999" }}>まだ振られていません</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
