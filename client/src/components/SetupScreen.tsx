import React from 'react';

type Props = {
  onNext: () => void;
};

export default function SetupScreen({ onNext }: Props) {
  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>ゲーム準備画面</h2>
      <p style={{ marginBottom: '40px' }}>
        【担当1の作業場所】<br />
        プレイヤー名入力や役職割り当てUIをここに作ります。
      </p>
      
      <div>
        <button 
          onClick={onNext} 
          style={{ padding: '15px 30px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#8a0303', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          ゲームスタート！
        </button>
      </div>
    </div>
  );
}
