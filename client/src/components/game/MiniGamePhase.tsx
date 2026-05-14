import React, { useState } from 'react';
import SampleGame from './minigames/SampleGame';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  onNext: (rankingIds: number[]) => void;
};

export default function MiniGamePhase({ players, onNext }: Props) {
  const [selectedGame, setSelectedGame] = useState<string>("sample");

  return (
    <div>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🎲 ミニゲームフェーズ</h2>
      
      {selectedGame === "sample" && (
        <SampleGame 
          players={players} 
          onFinish={(rankingIds) => onNext(rankingIds)} 
        />
      )}
    </div>
  );
}
