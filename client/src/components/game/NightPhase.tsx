import React from 'react';

type Props = {
  onNext: () => void;
};

export default function NightPhase({ onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#1a1a2a', padding: 30, borderRadius: '8px' }}>
      <h3>🌙 夜フェーズ</h3>
      <p>【担当3】一人ずつ交代で操作し、役職ごとの能力を使うUIをここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>夜を終了して次のターンへ</button>
    </div>
  );
}
