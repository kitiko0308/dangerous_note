import React from 'react';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
};

export default function NoonResultPhase({ players, setPlayers, onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#4a4a2a', padding: 30, borderRadius: '8px' }}>
      <h3>📊 ミニゲーム結果発表</h3>
      
      <div style={{ border: '1px solid #666', padding: '15px', marginBottom: '20px' }}>
        <p>【担当2】ここに派手な演出を実装してください：</p>
        <ul style={{ textAlign: 'left' }}>
          <li>ミニゲームの順位表示（1位〜5位）</li>
          <li>最下位のプレイヤーの発表</li>
          <li>最下位のプレイヤーの本名一文字を全員に公開</li>
          <li>1位がキラかLだった場合、アイテム付与の演出</li>
        </ul>
      </div>

      <button onClick={onNext} style={{ marginTop: '20px' }}>投票フェーズへ進む</button>
    </div>
  );
}
