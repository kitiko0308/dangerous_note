import React, { useState } from 'react';
import type { Player, Role } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
};

export default function PlayerSetuppage({ players, setPlayers, onNext }: Props) {
  // 現在何人目のプレイヤーを入力中か (0〜4)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const handleInputChange = (field: 'nickname' | 'realName', value: string) => {
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      [field]: value
    };
    setPlayers(newData);
  };

  const handleFinishSetup = () => {
    // 役職をランダムに割り当てる (キラx1, Lx1, 村人x3)
    const roles: Role[] = ["kira", "l", "villager", "villager", "villager"];
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const finalPlayers = players.map((p, i) => ({
      ...p,
      role: shuffledRoles[i]
    }));

    setPlayers(finalPlayers);
    onNext();
  };

  const handleNext = () => {
    if (currentPlayerIndex < 4) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      handleFinishSetup();
    }
  };

  const isInputValid = players[currentPlayerIndex].nickname.trim() !== '' && players[currentPlayerIndex].realName.trim() !== '';

  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '10px' }}>プレイヤー設定 ({currentPlayerIndex + 1} / 5人目)</h2>
      <p style={{ color: '#aaa', marginBottom: '30px' }}>
        他のプレイヤーに見られないように入力してください
      </p>
      
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#222', padding: '30px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left' }}>ニックネーム</label>
          <input 
            type="text" 
            value={players[currentPlayerIndex].nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }} 
            placeholder="例: たなか"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', textAlign: 'left' }}>本名</label>
          <input 
            type="text" 
            value={players[currentPlayerIndex].realName}
            onChange={(e) => handleInputChange('realName', e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }} 
            placeholder="例: 田中 太郎"
          />
        </div>

        <button 
          onClick={handleNext} 
          disabled={!isInputValid}
          style={{ 
            width: '100%', 
            padding: '15px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            cursor: isInputValid ? 'pointer' : 'not-allowed', 
            backgroundColor: isInputValid ? '#8a0303' : '#444', 
            color: isInputValid ? 'white' : '#888', 
            border: 'none', 
            borderRadius: '5px' 
          }}
        >
          {currentPlayerIndex < 4 ? "次のプレイヤーへ" : "全員の入力を完了する"}
        </button>
      </div>

      {/* 誰の入力中かわかるようにドットを表示 */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: i === currentPlayerIndex ? '#8a0303' : '#444' 
          }} />
        ))}
      </div>
    </div>
  );
}
