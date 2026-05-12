import React from 'react';

type Props = {
  onNext: () => void;
};

export default function RoleRevealScreen({ onNext }: Props) {
  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>役職確認画面</h2>
      <p style={{ marginBottom: '40px' }}>
        【担当1】誰がどの役職になったか、スマホを回し読みして一人ずつ確認する演出をここに実装します。
      </p>
      <button 
        onClick={onNext} 
        style={{ padding: '15px 30px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#8a0303', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        全員確認完了！ゲーム開始
      </button>
    </div>
  );
}
