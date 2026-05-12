import React from 'react';

type Props = {
  onNext: () => void;
};

export default function MiniGamePhase({ onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#2a4a2a', padding: 30, borderRadius: '8px' }}>
      <h3>🎮 ミニゲームフェーズ</h3>
      <p>【担当2】ミニゲーム本体（今は一旦1つ）をここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>ゲーム終了・結果発表へ</button>
    </div>
  );
}
