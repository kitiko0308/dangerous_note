import { useEffect, useRef, useState } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPlayer = alivePlayers[currentIndex];
  const [message, setMessage] = useState(
    "スマホを振ってサイコロを振ってください",
  );
  const lastShakeRef = useRef(0);
  const listeningRef = useRef(false);

  // 共通のハンドラをコンポーネント外側で定義して再利用する
  const handleMotion = (e: any) => {
    const acc = e?.acceleration || e?.accelerationIncludingGravity;
    if (!acc) return;
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();
    const threshold = 18; // 調整可能
    const cooldown = 1200; // ms
    if (magnitude > threshold && now - lastShakeRef.current > cooldown) {
      lastShakeRef.current = now;
      triggerRoll();
    }
  };

  // 振動（シェイク）検出: 初期リッスンは permission が不要な場合のみ行う
  useEffect(() => {
    function startListening() {
      try {
        const DM = DeviceMotionEvent as any;
        if (
          typeof DM !== "undefined" &&
          typeof DM.requestPermission === "function"
        ) {
          // iOS などではユーザー操作で許可を取る必要があるためここでは自動で追加しない
          return;
        }
        window.addEventListener("devicemotion", handleMotion);
        listeningRef.current = true;
      } catch (err) {
        // ignore
      }
    }

    startListening();

    return () => {
      if (listeningRef.current) {
        window.removeEventListener("devicemotion", handleMotion);
        listeningRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 実際のサイコロ振り処理
  function triggerRoll() {
    if (rolling) return;
    const player = alivePlayers[currentIndex];
    if (!player) return;
    // 既に振っているプレイヤーはスキップ
    if (results[player.id]) {
      setMessage(
        "このプレイヤーは既に振っています。次のプレイヤーに移動します。",
      );
      setTimeout(() => setCurrentIndex((i) => i + 1), 800);
      return;
    }

    setRolling(true);
    setMessage(`${player.nickname} が振っています…`);
    // アニメーション的に短時間ダミーを見せる（このプレイヤーのみ）
    const steps = 12;
    let step = 0;

    const t = setInterval(() => {
      step += 1;
      // ランダムで数値を更新（このプレイヤーのみ）
      setResults((prev) => ({
        ...prev,
        [player.id]: [rollDie(), rollDie(), rollDie()],
      }));
      if (step >= steps) {
        clearInterval(t);
        // 最終結果を確定
        const finalDice = [rollDie(), rollDie(), rollDie()];
        setResults((prev) => {
          const newRes = { ...prev, [player.id]: finalDice };
          setRolling(false);
          setMessage(`${player.nickname} の結果: ${finalDice.join(" - ")}`);

          // 次のプレイヤーへ（短い猶予）
          setTimeout(() => {
            const nextIndex = currentIndex + 1;
            if (nextIndex >= alivePlayers.length) {
              // 全員終了 → 結果送信
              const allSums = alivePlayers.map((p) => ({
                id: p.id,
                sum: (newRes[p.id] || [0, 0, 0]).reduce((a, b) => a + b, 0),
              }));
              allSums.sort((a, b) => b.sum - a.sum || a.id - b.id);
              const ranking = allSums.map((s) => s.id);
              onFinish(ranking);
              return;
            }
            setCurrentIndex(nextIndex);
            setMessage(`次は ${alivePlayers[nextIndex].nickname} が振る番です`);
          }, 1200);

          return newRes;
        });
      }
    }, 80);
  }

  // iOS 用の permission をユーザー操作で取るボタン（必要なら）
  async function requestMotionPermission() {
    const DM = DeviceMotionEvent as any;
    if (
      typeof DM !== "undefined" &&
      typeof DM.requestPermission === "function"
    ) {
      try {
        const res = await DM.requestPermission();
        if (res === "granted") {
          // 同じハンドラを登録（重複登録を避ける）
          if (!listeningRef.current) {
            window.addEventListener("devicemotion", handleMotion);
            listeningRef.current = true;
          }
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
        backgroundColor: "#13232b",
        padding: 30,
        borderRadius: "8px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h3>🎲 ミニゲーム：サイコロ</h3>

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
                backgroundColor:
                  currentPlayer && currentPlayer.id === p.id
                    ? "#8a7a45"
                    : "#444",
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
          marginTop: 16,
          padding: 16,
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
              スマホを振って、この人のサイコロを振ってください。
            </p>
          </>
        ) : (
          <p style={{ margin: 0, color: "#ddd" }}>参加者がいません。</p>
        )}
      </div>

      <p className="title-tagline" style={{ marginTop: "12px" }}>
        スマホを振ると、3つのサイコロを1人ずつ順番に振ります。
      </p>

      <p style={{ marginTop: "10px", color: "#ddd" }}>{message}</p>

      <div style={{ marginTop: 16 }}>
        {/* @ts-ignore */}
        {typeof DeviceMotionEvent !== "undefined" &&
        typeof (DeviceMotionEvent as any).requestPermission === "function" ? (
          <button
            onClick={requestMotionPermission}
            className="title-menu__button title-menu__button--primary"
            style={{
              marginTop: "16px",
            }}
          >
            モーション許可
          </button>
        ) : null}

        <button
          onClick={() => triggerRoll()}
          disabled={rolling}
          className="title-menu__button title-menu__button--primary"
          style={{
            marginTop: "16px",
            marginLeft:
              typeof DeviceMotionEvent !== "undefined" &&
              typeof (DeviceMotionEvent as any).requestPermission === "function"
                ? "8px"
                : 0,
          }}
        >
          {rolling ? "振っています…" : "振る"}
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px",
          backgroundColor: "#111",
          borderRadius: "5px",
          textAlign: "left",
        }}
      >
        <p style={{ margin: 0, color: "#aaa" }}>【状況】</p>
        {alivePlayers.map((p) => {
          const dice = results[p.id] || [];
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
                  <span style={{ color: "#d8d8d8" }}>振り済み</span>
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
