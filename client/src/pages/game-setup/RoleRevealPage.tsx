import { useState } from 'react';
import kiraImg from '../../assets/img/kira_hito.png';
import lImg from '../../assets/img/L_hito.png';
import siminnImg from '../../assets/img/siminn_hito.png';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  onNext: () => void;
};

export default function RoleRevealPage({ players, onNext }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  // 役職名の日本語表示用
  const roleNames = {
    kira: "キラ",
    l: "L",
    villager: "市民"
  };

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((s) => s + 1);
      setIsShowing(false);
    } else {
      onNext();
    }
  };

  return (
    <div className="title-screen">
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />

      <main className="title-content">
        {isShowing && currentPlayer.role === 'kira' && (
          <img src={kiraImg} alt="kira" className="role-kira-art" />
        )}
        {isShowing && currentPlayer.role === 'l' && (
          <img src={lImg} alt="L" className="role-l-art" />
        )}
        {isShowing && currentPlayer.role === 'villager' && (
          <img src={siminnImg} alt="市民" className="role-villager-art" />
        )}
        <div style={{ width: '100%', display: 'grid', placeItems: 'center', gap: '1rem' }}>
          <h2 className="title-logo" style={{ fontSize: '2.2rem' }}>
            役職の確認
          </h2>
          <p className="title-sub">{currentPlayerIndex + 1} / {players.length} 人目の確認</p>

          <div className="dn-panel" style={{ maxWidth: 520, width: '92%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {!isShowing ? (
              <>
                <p style={{ fontSize: 20, marginBottom: 24 }}>
                  <strong>{currentPlayer.nickname || `プレイヤー ${currentPlayer.id + 1}`}</strong> さん<br />以外は見ないでください
                </p>
                <button className="dn-button dn-button-primary" onClick={() => setIsShowing(true)}>
                  役職を確認する
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 18, color: 'var(--text-dim)' }}>{currentPlayer.nickname} さんの役職は...</p>
                <h1 style={{ fontSize: 56, margin: '18px 0', color: currentPlayer.role === 'kira' ? 'var(--kira-red)' : 'var(--l-blue)' }}>
                  {roleNames[currentPlayer.role]}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 20 }}>
                  確認したらボタンを押して隠してください
                </p>
                <button className="dn-button" onClick={handleNext}>
                  {currentPlayerIndex < players.length - 1 ? '隠して次のプレイヤーへ' : '全員確認完了！ゲーム開始'}
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
            {players.map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: i === currentPlayerIndex ? 'var(--kira-red)' : 'var(--border-color)' }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
