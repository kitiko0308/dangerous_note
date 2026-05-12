import React from 'react';
import type { GameResult } from '../types';

type Props = {
  result: GameResult;
  onBack: () => void;
};

export default function ResultScreen({ result, onBack }: Props) {
  let resultMessage = "ゲーム終了";
  if (result === "villager_win") resultMessage = "🎉 村人（L陣営）の勝利！";
  if (result === "kira_win") resultMessage = "💀 キラの勝利！";
  if (result === "kira_lose") resultMessage = "🤡 キラの敗北...";

  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h2 style={{ fontSize: '32px', color: '#ff4444' }}>結果発表</h2>
      <h3 style={{ fontSize: '24px', margin: '30px 0' }}>{resultMessage}</h3>
      
      <button 
        onClick={onBack} 
        style={{ padding: '15px 30px', cursor: 'pointer', backgroundColor: '#444', color: 'white', border: 'none' }}
      >
        タイトルへ戻る
      </button>
    </div>
  );
}
