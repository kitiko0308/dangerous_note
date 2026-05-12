import React from 'react';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onVote: (playerId: number | null) => void; // 追放する人のID、またはnull（追放なし）
};

export default function VotingPhase({ players, setPlayers, onVote }: Props) {
  return (
    <div style={{ backgroundColor: '#4a2a2a', padding: 30, borderRadius: '8px' }}>
      <h3>🗳️ 投票フェーズ</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p>【担当2】投票UIを実装してください。</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          {players.filter(p => p.isAlive).map(p => (
            <button 
              key={p.id} 
              onClick={() => onVote(p.id)}
              style={{ padding: '10px 20px', cursor: 'pointer' }}
            >
              {p.nickname}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #666', paddingTop: '20px' }}>
          <button 
            onClick={() => onVote(null)}
            style={{ padding: '10px 40px', backgroundColor: '#444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
          >
            誰も追放しない
          </button>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#ccc' }}>※誰かを選択した場合は、その人の追放結果演出へ進みます</p>
    </div>
  );
}
