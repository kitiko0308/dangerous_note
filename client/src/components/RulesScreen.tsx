import React from 'react';

type Props = {
  onBack: () => void;
};

export default function RulesScreen({ onBack }: Props) {
  return (
    <div style={{ padding: '40px 20px', color: 'white', maxWidth: '800px', margin: '0 auto', textAlign: 'left', lineHeight: '1.6' }}>
      <h2 style={{ textAlign: 'center', borderBottom: '2px solid #8a0303', paddingBottom: '10px' }}>ルール説明</h2>
      
      <section style={{ marginTop: '20px' }}>
        <h3>💎 勝利条件</h3>
        <ul>
          <li><strong>村人側:</strong> 5ターン以内にキラを追放する。</li>
          <li><strong>キラ側:</strong> 5ターン逃げ切る。</li>
          <li><strong>キラの敗北:</strong> 5ターン以内に一度も殺害を行わなかった場合。</li>
        </ul>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h3>🎭 役職の能力</h3>
        <p><strong>【キラ】</strong></p>
        <ul>
          <li>深夜フェーズ：ランダムに誰かの本名を1文字知る。</li>
          <li>ミニゲーム1位：アイテム「死神の目」を入手（その夜、誰かの本名を完全に知る）。</li>
        </ul>
        <p><strong>【L】</strong></p>
        <ul>
          <li>深夜フェーズ：指名した相手のミニゲーム順位を知る。</li>
          <li>ミニゲーム1位：アイテム「ショートケーキ」を入手（指名した相手がキラか判定）。</li>
        </ul>
      </section>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={onBack}
          style={{ padding: '15px 40px', backgroundColor: '#444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  );
}
