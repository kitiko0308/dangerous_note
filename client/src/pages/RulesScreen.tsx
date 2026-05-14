import React from 'react';

type Props = {
  onBack: () => void;
};

export default function RulesScreen({ onBack }: Props) {
  return (
    <div style={{ padding: '60px 20px', color: 'white', maxWidth: '600px', margin: '0 auto', textAlign: 'center', lineHeight: '2' }}>
      <h2 style={{ fontSize: '32px', borderBottom: '2px solid #8a0303', paddingBottom: '20px', marginBottom: '40px', fontFamily: 'serif' }}>HOW TO PLAY</h2>
      
      <div style={{ fontSize: '18px', marginBottom: '40px' }}>
        <p><strong>🍎 キラ側:</strong> 正体がバレないように全員を消し去れ。</p>
        <p><strong>🔍 L陣営:</strong> 会議で本物のキラを見つけ出し、追放せよ。</p>
      </div>

      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', textAlign: 'left' }}>
        <h3 style={{ textAlign: 'center', color: '#8a0303' }}>ゲームの流れ</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}><strong>1. ミニゲーム:</strong> 全力で遊ぶ。1位は強く、最下位はピンチに。</li>
          <li style={{ marginBottom: '15px' }}><strong>2. 追放会議:</strong> 怪しい人を1人選んで追放する。</li>
          <li style={{ marginBottom: '15px' }}><strong>3. 深夜の行動:</strong> キラが暗躍する。朝、誰かが消えているかも…。</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <button 
          onClick={onBack}
          style={{ padding: '15px 60px', backgroundColor: '#8a0303', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}
        >
          わかった
        </button>
      </div>
    </div>
  );
}
