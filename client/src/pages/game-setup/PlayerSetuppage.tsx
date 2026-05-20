import React, { useState } from 'react';
import type { Player, Role } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
  onBack: () => void;
};

export default function PlayerSetuppage({ players, setPlayers, onNext, onBack }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const handleInputChange = (field: 'nickname' | 'realName', value: string) => {
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      [field]: value,
    };
    setPlayers(newData);
  };

  const handleFinishSetup = () => {
    const roles: Role[] = ['kira', 'l', 'villager', 'villager', 'villager'];
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const finalPlayers = players.map((p, i) => ({
      ...p,
      role: shuffledRoles[i],
    }));

    setPlayers(finalPlayers);
    onNext();
  };

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((s) => s + 1);
    } else {
      handleFinishSetup();
    }
  };

  const isInputValid = players[currentPlayerIndex].nickname.trim() !== '' && players[currentPlayerIndex].realName.trim() !== '';

  return (
    <div className="title-screen">
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />
      <button
        onClick={onBack}
        aria-label="タイトルに戻る"
        className="panel-back-button"
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.35)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          zIndex: 5,
          fontFamily: 'Yu Mincho, Hiragino Mincho ProN, serif',
        }}
      >
        タイトルに戻る
      </button>

      <main className="title-content">
        <div style={{ width: '100%', display: 'grid', placeItems: 'center', gap: '1rem' }}>
          <h2 className="title-logo" style={{ fontSize: '2.4rem' }}>
            プレイヤー設定
          </h2>
          <p className="title-sub">他のプレイヤーに見られないように入力してください</p>

          <div className="dn-panel" style={{ maxWidth: 520, width: '92%' }}>
            <p style={{ marginBottom: 12, color: 'var(--text-dim)' }}>{currentPlayerIndex + 1} / {players.length} 人目の入力</p>

            <div style={{ textAlign: 'left', marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>ニックネーム</label>
              <p style={{ opacity: 0.75, marginTop: 6, marginBottom: 8, fontSize: 14, color: 'var(--text-dim)' }}>
                偽りの名。油断すれば、命取りだ。
              </p>
              <input
                type="text"
                value={players[currentPlayerIndex].nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="例: たなか"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>本名</label>
              <p style={{ opacity: 0.75, marginTop: 6, marginBottom: 8, fontSize: 14, color: 'var(--text-dim)' }}>
                真の名を知られた者は、運命から<strong style={{ color: 'var(--kira-red)' }}>逃れられない。</strong>
              </p>
              <input
                type="text"
                value={players[currentPlayerIndex].realName}
                onChange={(e) => handleInputChange('realName', e.target.value)}
                placeholder="例: 田中 太郎"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)' }}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!isInputValid}
              className={isInputValid ? 'dn-button dn-button-primary' : 'dn-button'}
              style={{ width: '100%' }}
            >
              {currentPlayerIndex < players.length - 1 ? '次のプレイヤーへ' : '全員の入力を完了する'}
            </button>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 10 }}>
              {players.map((_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i === currentPlayerIndex ? 'var(--kira-red)' : 'var(--border-color)' }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
