import React, { useState } from 'react';
import type { Player, Item } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setNightActionLogs: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
};

export default function MidnightPhase({ players, setPlayers, setNightActionLogs, onNext }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(() => {
    // 最初の生存者のインデックスを見つける
    const firstAlive = players.findIndex(p => p.isAlive);
    return firstAlive !== -1 ? firstAlive : 0;
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [actionLogs, setActionLogs] = useState<string[]>([]);
  const [usedActions, setUsedActions] = useState<string[]>([]); // 使用済みアクションの記録

  const currentPlayer = players[currentPlayerIndex];

  // 次のプレイヤーへ（全員終わったらonNext）
  const handleNextPlayer = () => {
    // 次の生存者を探す
    let nextIndex = currentPlayerIndex + 1;
    while (nextIndex < players.length && !players[nextIndex].isAlive) {
      nextIndex++;
    }

    if (nextIndex < players.length) {
      setCurrentPlayerIndex(nextIndex);
      setIsConfirmed(false);
      setActionLogs([]);
      setUsedActions([]);
    } else {
      onNext();
    }
  };

  // --- キラの行動 ---
  const handleKiraAction = () => {
    // 自分以外の生存者で、かつ本名がまだ完全に判明していない人を選ぶ
    const targets = players.filter(p => {
      if (p.id === currentPlayer.id || !p.isAlive) return false;
      const combined = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
      return combined.length < p.realName.length;
    });

    // もし全員判明していたら、自分以外の生存者全員を候補にする（念のため）
    const finalTargets = targets.length > 0 
      ? targets 
      : players.filter(p => p.id !== currentPlayer.id && p.isAlive);

    if (finalTargets.length === 0) return;
    
    const target = finalTargets[Math.floor(Math.random() * finalTargets.length)];
    
    // その人の本名から未公開の文字を1つ選ぶ
    const nameLength = target.realName.length;
    // 全員公開とキラ公開の両方に含まれていないインデックスを探す
    const availableIndices = Array.from({ length: nameLength }, (_, i) => i)
      .filter(i => !target.revealedChars.includes(i) && !target.kiraRevealedChars.includes(i));
    
    // もし全部バレてたらランダムに選ぶ
    const charIdx = availableIndices.length > 0 
      ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
      : Math.floor(Math.random() * nameLength);
    
    // 〇山〇〇 の形式を作成
    const maskedName = target.realName.split('').map((char, i) => 
      i === charIdx ? char : "〇"
    ).join('');
    
    // キラ専用の知識として保存
    const newPlayers = players.map(p => {
      if (p.id === target.id) {
        return { ...p, kiraRevealedChars: [...new Set([...p.kiraRevealedChars, charIdx])] };
      }
      return p;
    });
    setPlayers(newPlayers);

    setActionLogs(prev => [...prev, `${target.nickname} の本名の一部は 「${maskedName}」 だと判明した。`]);
    setUsedActions(prev => [...prev, 'steal']);
  };

  // --- キラの殺害アクション ---
  const handleKillAction = (targetId: number) => {
    const target = players.find(p => p.id === targetId);
    if (!target) return;

    // 即座に生存フラグを折らず、キラによる殺害フラグ（予約）だけを立てる
    const newPlayers = players.map(p => 
      p.id === targetId ? { ...p, isKilledByKira: true } : p
    );
    setPlayers(newPlayers);
    
    // 朝に表示するログを記録
    setNightActionLogs(prev => [...prev, `恐ろしい事件が発生しました。${target.nickname} さんが心臓麻痺で亡くなりました。`]);
    
    setActionLogs(prev => [...prev, `${target.nickname} を始末した...。`]);
    setUsedActions(prev => [...prev, 'kill']);
  };

  // --- Lの行動 ---
  const handleLAction = (targetId: number) => {
    const target = players.find(p => p.id === targetId);
    if (!target) return;
    
    // 実際に保存された順位を表示
    const rank = target.miniGameRank ?? "?";
    setActionLogs(prev => [...prev, `${target.nickname} のミニゲーム順位は ${rank}位 だった。`]);
    setUsedActions(prev => [...prev, 'rank_check']);
  };

  // --- アイテム使用 ---
  const useItem = (item: Item, targetId?: number) => {
    let effectiveTargetId = targetId;

    // 死神の目の場合はランダムにターゲットを決定
    if (item === "death_note_eye") {
      // 本名が未知の生存者を優先
      const targets = players.filter(p => {
        if (p.id === currentPlayer.id || !p.isAlive) return false;
        const combined = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
        return combined.length < p.realName.length;
      });

      const finalTargets = targets.length > 0 
        ? targets 
        : players.filter(p => p.id !== currentPlayer.id && p.isAlive);

      if (finalTargets.length === 0) return;
      const target = finalTargets[Math.floor(Math.random() * finalTargets.length)];
      effectiveTargetId = target.id;
      setActionLogs(prev => [...prev, `【死神の目】を使用。${target.nickname} の本名は 「${target.realName}」 だ！`]);
    } else if (item === "shortcake" && effectiveTargetId !== undefined) {
      // 指定したターゲットがキラか判定
      const target = players.find(p => p.id === effectiveTargetId);
      if (target) {
        const isKira = target.role === "kira";
        setActionLogs(prev => [...prev, `【ショートケーキ】を使用。${target.nickname} は ${isKira ? "キラだ！" : "キラではない。"}`]);
      }
    }

    // アイテム消費と効果を同時に適用する
    const newPlayers = players.map(p => {
      let updated = { ...p };
      // 効果の適用（死神の目：全文字判明）
      if (item === "death_note_eye" && p.id === effectiveTargetId) {
        updated.kiraRevealedChars = p.realName.split('').map((_, i) => i);
      }
      // アイテムの消費（自分）
      if (p.id === currentPlayer.id) {
        updated.items = p.items.filter(i => i !== item);
      }
      return updated;
    });
    setPlayers(newPlayers);
    setUsedActions(prev => [...prev, item]);
  };

  const alivePlayers = players.filter(p => p.isAlive);
  const currentSurvivorNumber = alivePlayers.findIndex(p => p.id === currentPlayer.id) + 1;
  const totalSurvivors = alivePlayers.length;

  return (
    <div style={{ backgroundColor: '#0a0a1a', padding: 30, borderRadius: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{ color: '#888', marginBottom: '40px' }}>🌑 深夜 ({currentSurvivorNumber} / {totalSurvivors}人目)</h3>

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
          <p style={{ color: '#aaa', marginBottom: '10px' }}>あなたの役職: {currentPlayer.role === 'kira' ? 'キラ' : currentPlayer.role === 'l' ? 'L' : '市民'}</p>
          
          <div style={{ backgroundColor: '#1a1a2a', padding: '20px', borderRadius: '8px', marginBottom: '20px', minHeight: '150px', textAlign: 'left' }}>
            {actionLogs.length > 0 && (
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                {actionLogs.map((log, i) => (
                  <p key={i} style={{ fontSize: '16px', color: '#ff4444', margin: '5px 0' }}>✓ {log}</p>
                ))}
              </div>
            )}

            <div>
                {/* キラのボタン */}
                {currentPlayer.role === 'kira' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      onClick={handleKiraAction} 
                      disabled={usedActions.includes('steal')}
                      style={usedActions.includes('steal') ? disabledBtnStyle : actionBtnStyle}
                    >
                      本名を1文字盗む {usedActions.includes('steal') && "済"}
                    </button>
                    
                    {currentPlayer.items.includes('death_note_eye') && !usedActions.includes('death_note_eye') && (
                      <button onClick={() => useItem('death_note_eye')} style={itemBtnStyle}>【アイテム】死神の目を使用 (今夜のみ有効！)</button>
                    )}
                    
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>本名が全て分かれば殺害可能：</p>
                      {players.filter(p => p.id !== currentPlayer.id && p.isAlive).map(p => {
                        const combinedRevealed = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
                        const isFullyKnown = combinedRevealed.length >= p.realName.length;
                        const hasAlreadyKilled = usedActions.includes('kill');
                        
                        // 殺害可能条件：本名判明済み ＋ 未殺害
                        const canKillNow = isFullyKnown && !hasAlreadyKilled;

                        return (
                          <button 
                            key={p.id}
                            onClick={() => handleKillAction(p.id)}
                            disabled={!canKillNow}
                            style={canKillNow ? killBtnStyle : disabledBtnStyle}
                          >
                            {p.nickname} を殺害する {hasAlreadyKilled && "済"} 
                            {!hasAlreadyKilled && !isFullyKnown && "(本名が不明です)"}
                          </button>
                        );
                      })}
                    </div>

                    {/* キラ専用：本名判明状況一覧 */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>現在の本名把握状況 (公開+秘密):</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {players.filter(p => p.id !== currentPlayer.id && p.isAlive).map(p => {
                          const combinedRevealed = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
                          const combinedName = (p.realName || "").split('').map((char, i) => 
                            combinedRevealed.includes(i) ? char : "〇"
                          ).join('');
                          return (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', backgroundColor: '#000', padding: '5px 10px', borderRadius: '4px' }}>
                              <span>{p.nickname}</span>
                              <span style={{ color: '#ffaaaa', fontFamily: 'monospace' }}>{combinedName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lのボタン */}
                {currentPlayer.role === 'l' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentPlayer.items.includes('shortcake') && !usedActions.includes('shortcake') && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontSize: '12px', color: '#ffaaaa', marginBottom: '5px' }}>⚠️ アイテム使用 (今夜使い切る必要があります):</p>
                        {players.filter(p => p.id !== currentPlayer.id && p.isAlive).map(p => (
                          <button 
                            key={p.id}
                            onClick={() => useItem('shortcake', p.id)} 
                            style={{ ...itemBtnStyle, width: '100%', marginBottom: '5px', fontSize: '14px' }}
                          >
                            {p.nickname} を鑑定
                          </button>
                        ))}
                      </div>
                    )}

                    <p style={{ fontSize: '14px', marginBottom: '10px', color: '#aaa' }}>調査する相手を選んでください：</p>
                    {players.filter(p => p.id !== currentPlayer.id && p.isAlive).map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => handleLAction(p.id)} 
                        disabled={usedActions.includes('rank_check')}
                        style={usedActions.includes('rank_check') ? disabledBtnStyle : actionBtnStyle}
                      >
                        {p.nickname} の順位を調査 {usedActions.includes('rank_check') && "済"}
                      </button>
                    ))}
                  </div>
                )}

                {/* 村人のボタン */}
                {currentPlayer.role === 'villager' && (
                  <p>特にできることはありません。静かに夜を過ごしましょう。</p>
                )}
              </div>
          </div>

          <button 
            onClick={handleNextPlayer}
            style={{ 
              padding: '15px 40px', 
              backgroundColor: '#444', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              borderRadius: '5px', 
              width: '100%' 
            }}
          >
            {currentSurvivorNumber < totalSurvivors ? "行動を終了して次のプレイヤーへ" : "行動を終了して夜明けを迎える"}
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

const killBtnStyle = {
  padding: '10px',
  backgroundColor: '#ff0000',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '5px',
  fontWeight: 'bold',
  width: '100%',
  marginBottom: '5px'
};

const disabledBtnStyle = {
  padding: '10px',
  backgroundColor: '#222',
  color: '#555',
  border: '1px solid #333',
  cursor: 'not-allowed',
  borderRadius: '5px',
  width: '100%',
  marginBottom: '5px'
};
