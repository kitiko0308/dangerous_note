import React, { useState } from 'react';
import type { Player, Role } from '../../types';
import { toFullWidth } from '../../utils/numberFormat';
import aiImg from '../../assets/img/ai.png';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onNext: () => void;
  onBack: () => void;
};

export default function PlayerSetuppage({ players, setPlayers, onNext, onBack }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const sampleNicknames = ['いちか', 'にの', 'みく', 'よつば', 'いつき'];

  // ベースになる本名ソース（ユーザー指定の候補）
  const baseRealNameSources = ['天音海砂', '高橋太一', '山口誠人', '桜井舞子', '鈴木一郎'];
  const realNameCharPool = baseRealNameSources.join('').split('').filter((c) => c.trim() !== '');

  const generateRandomRealName = () => {
    let name = '';
    for (let i = 0; i < 4; i += 1) {
      name += realNameCharPool[Math.floor(Math.random() * realNameCharPool.length)];
    }
    return name;
  };

  const fillRandom = () => {
    const nick = sampleNicknames[currentPlayerIndex % sampleNicknames.length];
    const real = generateRandomRealName();
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      nickname: nick,
      realName: real,
    };
    setPlayers(newData);
  };

  

  const handleInputChange = (field: 'nickname' | 'realName', value: string) => {
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      [field]: value,
    };
    setPlayers(newData);
  };

  const handleFinishSetup = () => {
    if (players.length < 3) {
      return;
    }

    const roles: Role[] = [
      'kira',
      'l',
      ...Array(Math.max(players.length - 2, 0)).fill('villager'),
    ];
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

  const nickValid = players[currentPlayerIndex].nickname.trim() !== '';
  const realNameTrimmed = players[currentPlayerIndex].realName.trim();
  const realNameValid = realNameTrimmed.length === 4;
  const isInputValid = nickValid && realNameValid;

  return (
    <div className="title-screen" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url(${aiImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />
      <button
        onClick={onBack}
        aria-label="タイトルに戻る"
        className="panel-back-button"
      >
        タイトルに戻る
      </button>

      <main className="title-content">
        <div className="player-setup__wrap">
          <h2 className="title-logo player-setup__title">プレイヤー設定</h2>
          <p className="title-sub">他のプレイヤーに<span style={{ color: '#dc2626' }}>見られないように</span>入力してください</p>

          <div className="dn-panel player-setup__panel">
            <p className="player-setup__progress"><span style={{ color: '#dc2626' }}>{toFullWidth(currentPlayerIndex + 1)}</span>/ {toFullWidth(players.length)}</p>

            <div className="player-setup__group">
              <label className="player-setup__label">ニックネーム</label>
              <p className="player-setup__hint"><span style={{ color: '#dc2626' }}>偽りの名</span>。油断すれば、命取りだ。</p>
              <input
                type="text"
                value={players[currentPlayerIndex].nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="例: ミサミサ"
                className="player-setup__input"
              />
            </div>

            <div className="player-setup__group">
              <label className="player-setup__label">本名</label>
              <p className="player-setup__hint"><span style={{ color: '#dc2626' }}>真の名</span><span style={{ color: 'var(--text-dim)' }}>を知られた者は、運命から逃れられない。</span></p>
              <input
                type="text"
                value={players[currentPlayerIndex].realName}
                onChange={(e) => handleInputChange('realName', e.target.value)}
                placeholder="例: 天音海砂"
                className="player-setup__input"
              />
              {realNameTrimmed.length > 0 && !realNameValid && (
                <p className="player-setup__hint" style={{ color: '#dc2626' }}>※ 本名は ４文字 で入力してください</p>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <button type="button" className="dn-button" onClick={fillRandom} style={{ padding: '8px 14px' }}>ランダム入力</button>
            </div>

            <button
              onClick={handleNext}
              disabled={!isInputValid}
              className={isInputValid ? 'dn-button dn-button-primary player-setup__next' : 'dn-button player-setup__next'}
            >
              {currentPlayerIndex < players.length - 1 ? '次のプレイヤーへ' : '全員の入力を完了する'}
            </button>

            <div className="player-setup__dots">
              {players.map((_, i) => (
                <div key={i} className={i === currentPlayerIndex ? 'player-setup__dot player-setup__dot--active' : 'player-setup__dot'} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
