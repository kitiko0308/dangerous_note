import React from 'react';

type Props = {
  onNext: () => void;
};

export default function NoonResultPhase({ onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#4a4a2a', padding: 30, borderRadius: '8px' }}>
      <h3>📊 ミニゲーム結果発表</h3>
      <p>【担当2】最下位の発表と、本名一文字公開の演出をここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>投票フェーズへ</button>
    </div>
  );
}
