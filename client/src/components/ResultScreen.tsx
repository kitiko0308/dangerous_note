import React from 'react';
import type { GameResult } from '../types';

type Props = {
  result: GameResult;
  onBack: () => void;
};

export default function ResultScreen({ result, onBack }: Props) {
  const isKiraWin = result === "kira_win";
  
  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', color: '#888' }}>GAME OVER</h2>
      
      <div style={{ margin: '60px 0' }}>
        <h1 style={{ fontSize: '64px', color: isKiraWin ? '#ff4444' : '#44ff44', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
          {isKiraWin ? "キラの勝利" : "L陣営の勝利"}
        </h1>
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#ccc' }}>
          {isKiraWin ? "世界は新世界へと歩み始めた。" : "正義は勝つ。必ず。"}
        </p>
      </div>
      
      <button 
        onClick={onBack} 
        style={{ padding: '15px 40px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: '1px solid #666', borderRadius: '5px' }}
      >
        タイトルへ戻る
      </button>
    </div>
  );
}
