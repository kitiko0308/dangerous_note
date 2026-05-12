import React from 'react';

type Props = {
  onNext: () => void;
};

export default function MorningPhase({ onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#2a2a4a', padding: 30, borderRadius: '8px' }}>
      <h3>🌅 朝フェーズ (話し合い)</h3>
      <p>【担当3】5分間の話し合いUI（タイマーなど）をここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>話し合いを終了してミニゲームへ</button>
    </div>
  );
}
