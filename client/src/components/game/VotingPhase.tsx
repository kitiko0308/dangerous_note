import React from 'react';

type Props = {
  onNext: () => void;
};

export default function VotingPhase({ onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#4a2a2a', padding: 30, borderRadius: '8px' }}>
      <h3>🗳️ 投票フェーズ</h3>
      <p>【担当2】誰を追放するか選ぶ投票UIと、追放結果の発表をここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>夜フェーズへ</button>
    </div>
  );
}
