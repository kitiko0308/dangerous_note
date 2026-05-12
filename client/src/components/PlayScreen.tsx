import React, { useState } from 'react';
import type { GameResult } from '../types';

type Props = {
  onEnd: (result: GameResult) => void;
};

export default function PlayScreen({ onEnd }: Props) {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<"morning" | "noon" | "night">("morning");

  // 勝敗判定用の仮ステート
  const [isKiraExiled, setIsKiraExiled] = useState(false);
  const [kiraKillCount, setKiraKillCount] = useState(0);

  const handleNextPhase = () => {
    if (phase === "morning") {
      setPhase("noon");
    } else if (phase === "noon") {
      if (isKiraExiled) {
        onEnd("villager_win");
        return;
      }
      setPhase("night");
    } else {
      if (turn >= 5) {
        if (kiraKillCount === 0) {
          onEnd("kira_lose");
        } else {
          onEnd("kira_win");
        }
      } else {
        setTurn(turn + 1);
        setPhase("morning");
      }
    }
  };

  return (
    <div style={{ padding: 20, color: 'white', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #555', paddingBottom: 10, marginBottom: 20 }}>
        <h2>第 {turn} ターン / 5ターン中</h2>
        <p>生存者: プレイヤーA, B, C...</p>
        
        <div style={{ marginTop: 10, display: 'flex', gap: '10px' }}>
          <button onClick={() => onEnd("villager_win")} style={{ fontSize: '10px' }}>テスト:村人勝</button>
          <button onClick={() => onEnd("kira_win")} style={{ fontSize: '10px' }}>テスト:キラ勝</button>
        </div>
      </header>

      <main>
        {phase === "morning" && (
          <div style={{ backgroundColor: '#2a2a4a', padding: 30, borderRadius: '8px' }}>
            <h3>🌅 朝フェーズ (話し合い)</h3>
            <p>【担当3】タイマーなど</p>
            <button onClick={handleNextPhase} style={{ marginTop: '20px' }}>昼へ進む</button>
          </div>
        )}

        {phase === "noon" && (
          <div style={{ backgroundColor: '#4a2a2a', padding: 30, borderRadius: '8px' }}>
            <h3>☀️ 昼フェーズ (投票)</h3>
            <p>【担当2】投票UIなど</p>
            <label style={{ display: 'block', margin: '10px 0' }}>
              <input type="checkbox" checked={isKiraExiled} onChange={(e) => setIsKiraExiled(e.target.checked)} />
              （テスト用）ここでキラを追放する
            </label>
            <button onClick={handleNextPhase}>夜へ進む</button>
          </div>
        )}

        {phase === "night" && (
          <div style={{ backgroundColor: '#1a1a2a', padding: 30, borderRadius: '8px' }}>
            <h3>🌙 夜フェーズ (アクション)</h3>
            <p>【担当3】個別能力UIなど</p>
            <button onClick={() => setKiraKillCount(kiraKillCount + 1)}>
              （テスト用）キラが殺害実行 (現在:{kiraKillCount})
            </button>
            <br />
            <button onClick={handleNextPhase} style={{ marginTop: '20px' }}>次のターンへ</button>
          </div>
        )}
      </main>
    </div>
  );
}
