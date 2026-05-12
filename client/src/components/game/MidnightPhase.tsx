import React, { useState } from 'react';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
};

export default function MidnightPhase({ players, setPlayers, onNext }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [actionLog, setActionLog] = useState("");

  const currentPlayer = players[currentPlayerIndex];

  // 次のプレイヤーへ（全員終わったらonNext）
  const handleNextPlayer = () => {
    if (currentPlayerIndex < 4) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsConfirmed(false);
      setActionLog("");
    } else {
      onNext();
    }
  };

  // --- キラの行動 ---
  const handleKiraAction = () => {
    // 毎晩のランダム本名取得（仮実装：自分以外の誰かの本名の1文字目を公開）
    const targets = players.filter(p => p.id !== currentPlayer.id && p.isAlive);
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    setActionLog(`${target.nickname} の本名の一部を書き記した...`);
    
    // 実際はrevealedCharsを更新する処理が必要
  };

  // --- Lの行動 ---
  const handleLAction = () => {
    setActionLog(`今日のミニゲームの順位を調査した...`);
  };

  return (
    <div style={{ backgroundColor: '#0a0a1a', padding: 30, borderRadius: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{ color: '#888', marginBottom: '40px' }}>🌑 深夜 ({currentPlayerIndex + 1} / 5人目)</h3>

      {!isConfirmed ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '20px', marginBottom: '30px' }}>
            <strong>{currentPlayer.nickname}</strong> さん以外は見ないでください
          </p>
          <button 
            onClick={() => setIsConfirmed(true)}
            style={{ padding: '15px 40px', backgroundColor: '#8a0303', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
          >
            自分であることを確認
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <p style={{ color: '#aaa', marginBottom: '10px' }}>あなたの役職: {currentPlayer.role === 'kira' ? 'キラ' : currentPlayer.role === 'l' ? 'L' : '村人'}</p>
          
          <div style={{ backgroundColor: '#1a1a2a', padding: '20px', borderRadius: '8px', marginBottom: '20px', minHeight: '150px' }}>
            {actionLog ? (
              <p style={{ fontSize: '18px', color: '#ff4444' }}>{actionLog}</p>
            ) : (
              <div>
                {/* キラのボタン */}
                {currentPlayer.role === 'kira' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleKiraAction} style={actionBtnStyle}>本名を1文字盗む</button>
                    {currentPlayer.items.includes('death_note_eye') && (
                      <button style={itemBtnStyle}>【アイテム】死神の目を使用</button>
                    )}
                    <button style={disabledBtnStyle}>殺害する（本名が必要）</button>
                  </div>
                )}

                {/* Lのボタン */}
                {currentPlayer.role === 'l' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleLAction} style={actionBtnStyle}>ミニゲーム順位を確認</button>
                    {currentPlayer.items.includes('shortcake') && (
                      <button style={itemBtnStyle}>【アイテム】ショートケーキを使用</button>
                    )}
                  </div>
                )}

                {/* 村人のボタン */}
                {currentPlayer.role === 'villager' && (
                  <p>特にできることはありません。静かに夜を過ごしましょう。</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleNextPlayer}
            style={{ padding: '15px 40px', backgroundColor: '#444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', width: '100%' }}
          >
            {currentPlayerIndex < 4 ? "次のプレイヤーへ交代" : "夜明けを迎える"}
          </button>
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = {
  padding: '12px',
  backgroundColor: '#444',
  color: 'white',
  border: '1px solid #666',
  cursor: 'pointer',
  borderRadius: '5px'
};

const itemBtnStyle = {
  padding: '12px',
  backgroundColor: '#8a0303',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '5px',
  fontWeight: 'bold'
};

const disabledBtnStyle = {
  padding: '12px',
  backgroundColor: '#222',
  color: '#555',
  border: '1px solid #333',
  cursor: 'not-allowed',
  borderRadius: '5px'
};
