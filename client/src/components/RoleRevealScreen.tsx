import React, { useState } from 'react';

type Props = {
  onNext: () => void;
};

export default function RoleRevealScreen({ onNext }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);

  // 本来はPlayerデータから取得しますが、今は仮の役職を割り当て
  const roles = ["キラ", "L", "村人", "村人", "村人"];

  const handleNext = () => {
    if (currentPlayerIndex < 4) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsShowing(false);
    } else {
      onNext();
    }
  };

  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '30px' }}>役職の確認 ({currentPlayerIndex + 1} / 5人目)</h2>

      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#222', padding: '40px', borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {!isShowing ? (
          <>
            <p style={{ fontSize: '20px', marginBottom: '30px' }}>
              プレイヤー {currentPlayerIndex + 1} さん<br />以外は見ないでください
            </p>
            <button 
              onClick={() => setIsShowing(true)} 
              style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#8a0303', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              役職を確認する
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '18px', color: '#aaa' }}>あなたの役職は...</p>
            <h1 style={{ fontSize: '64px', margin: '20px 0', color: roles[currentPlayerIndex] === "キラ" ? "#ff4444" : "#44ff44" }}>
              {roles[currentPlayerIndex]}
            </h1>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>
              確認したらボタンを押して隠してください
            </p>
            <button 
              onClick={handleNext} 
              style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              {currentPlayerIndex < 4 ? "隠して次のプレイヤーへ" : "全員確認完了！ゲーム開始"}
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: i === currentPlayerIndex ? '#8a0303' : '#444' 
          }} />
        ))}
      </div>
    </div>
  );
}
