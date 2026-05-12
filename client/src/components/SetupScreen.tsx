import React, { useState } from 'react';

type Props = {
  onNext: () => void;
};

export default function SetupScreen({ onNext }: Props) {
  // 5人分の名前入力を管理
  const [playerInputs, setPlayerInputs] = useState(
    Array(5).fill({ nickname: '', realName: '' })
  );

  return (
    <div style={{ padding: 40, color: 'white' }}>
      <h2 style={{ textAlign: 'center' }}>プレイヤー設定 (5人固定)</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px' }}>ニックネームと本名を入力してください</p>
      
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {playerInputs.map((_, index) => (
          <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#222', borderRadius: '8px' }}>
            <h4>プレイヤー {index + 1}</h4>
            <input type="text" placeholder="ニックネーム" style={{ marginRight: '10px', padding: '5px' }} />
            <input type="text" placeholder="本名" style={{ padding: '5px' }} />
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={onNext} 
          style={{ padding: '15px 30px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#8a0303', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          次へ（役職の確認）
        </button>
      </div>
    </div>
  );
}
