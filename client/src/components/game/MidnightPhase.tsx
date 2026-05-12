import React, { useState } from 'react';
import type { Player, Item } from '../../types';

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
    // 自分以外の生存者からランダムに1人選ぶ
    const targets = players.filter(p => p.id !== currentPlayer.id && p.isAlive);
    if (targets.length === 0) return;
    
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    // その人の本名から未公開の文字を1つ選ぶ（表示するだけ、全体公開はしない）
    const nameLength = target.realName.length;
    const charIdx = Math.floor(Math.random() * nameLength);
    
    // 〇山〇〇 の形式を作成
    const maskedName = target.realName.split('').map((char, i) => 
      i === charIdx ? char : "〇"
    ).join('');
    
    setActionLog(`${target.nickname} の本名の一部は 「${maskedName}」 だと判明した。`);
  };

  // --- Lの行動 ---
  const handleLAction = (targetId: number) => {
    const target = players.find(p => p.id === targetId);
    if (!target) return;
    
    // 実際に保存された順位を表示
    const rank = target.miniGameRank || "?";
    setActionLog(`${target.nickname} のミニゲーム順位は ${rank}位 だった。`);
  };

  // --- アイテム使用 ---
  const useItem = (item: Item, targetId?: number) => {
    if (item === "death_note_eye") {
      // 生存者からランダムに1人選んでフルネームを表示
      const targets = players.filter(p => p.id !== currentPlayer.id && p.isAlive);
      const target = targets[Math.floor(Math.random() * targets.length)];
      setActionLog(`【死神の目】を使用。${target.nickname} の本名は 「${target.realName}」 だ！`);
    } else if (item === "shortcake" && targetId !== undefined) {
      // 指定したターゲットがキラか判定
      const target = players.find(p => p.id === targetId);
      if (target) {
        const isKira = target.role === "kira";
        setActionLog(`【ショートケーキ】を使用。${target.nickname} は ${isKira ? "キラだ！" : "キラではない。"}`);
      }
    }

    // アイテムを消費
    const newPlayers = players.map(p => {
      if (p.id === currentPlayer.id) {
        return { ...p, items: p.items.filter(i => i !== item) };
      }
      return p;
    });
    setPlayers(newPlayers);
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
                      <button onClick={() => useItem('death_note_eye')} style={itemBtnStyle}>【アイテム】死神の目を使用</button>
                    )}
                    <button style={disabledBtnStyle}>殺害する（本名が必要）</button>
                  </div>
                )}

                {/* Lのボタン */}
                {currentPlayer.role === 'l' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>調査する相手を選んでください：</p>
                    {players.filter(p => p.id !== currentPlayer.id && p.isAlive).map(p => (
                      <div key={p.id} style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleLAction(p.id)} 
                          style={{ ...actionBtnStyle, flex: 1 }}
                        >
                          {p.nickname} の順位を調査
                        </button>
                        {currentPlayer.items.includes('shortcake') && (
                          <button 
                            onClick={() => useItem('shortcake', p.id)} 
                            style={{ ...itemBtnStyle, fontSize: '12px' }}
                          >
                            キラ鑑定
                          </button>
                        )}
                      </div>
                    ))}
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
