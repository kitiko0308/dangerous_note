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
  const [randomSeqIndex, setRandomSeqIndex] = useState(0);
  const isNicknameFixed = currentPlayerIndex === players.length - 1 && players.slice(0, players.length - 1).every((p) => p.nickname.trim() !== '');
  
  const getUniqueNickname = (used: Set<string>) => {
    // try base names first
    for (const name of sampleNicknames) {
      if (!used.has(name)) return name;
    }
    // if all base names are used, append numeric suffixes to make unique names
    for (let suffix = 2; suffix < 1000; suffix += 1) {
      for (const base of sampleNicknames) {
        const candidate = `${base}${suffix}`;
        if (!used.has(candidate)) return candidate;
      }
    }
    // fallback (very unlikely)
    return `${sampleNicknames[0]}${Date.now()}`;
  };

  

  const chooseSequentialOrUniqueNickname = () => {
    // exclude current player's existing nickname so re-randomizing can keep base names available
    const used = new Set(players.map((p, i) => (i === currentPlayerIndex ? '' : p.nickname)).filter(Boolean));
    const n = sampleNicknames.length;
    for (let offset = 0; offset < n; offset += 1) {
      const idx = (randomSeqIndex + offset) % n;
      const candidate = sampleNicknames[idx];
      if (!used.has(candidate)) {
        // advance sequence start to next position after chosen
        setRandomSeqIndex((idx + 1) % n);
        return candidate;
      }
    }
    // no available from base sequence, produce a guaranteed-unique nickname
    const unique = getUniqueNickname(used);
    // if unique is based on a base name, advance the sequence start
    const baseMatch = unique.match(new RegExp(`^(${sampleNicknames.join('|')})`));
    if (baseMatch) {
      const baseIdx = sampleNicknames.indexOf(baseMatch[1]);
      if (baseIdx >= 0) setRandomSeqIndex((baseIdx + 1) % n);
    }
    return unique;
  };

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
    const nick = chooseSequentialOrUniqueNickname();
    const real = generateRandomRealName();
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      nickname: nick,
      realName: real,
    };
    setPlayers(newData);
  };

  const fillRandomNickOnly = () => {
    if (isNicknameFixed) return;
    const nick = chooseSequentialOrUniqueNickname();
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      nickname: nick,
    };
    setPlayers(newData);
  };

  const fillRandomRealOnly = () => {
    const real = generateRandomRealName();
    const newData = [...players];
    newData[currentPlayerIndex] = {
      ...newData[currentPlayerIndex],
      realName: real,
    };
    setPlayers(newData);
  };

  

  const handleInputChange = (field: 'nickname' | 'realName', value: string) => {
    if (field === 'nickname' && isNicknameFixed) return;
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={players[currentPlayerIndex].nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  readOnly={isNicknameFixed}
                  aria-readonly={isNicknameFixed}
                  placeholder="例: ミサミサ"
                  className="player-setup__input"
                  style={{ flex: 1 }}
                />
                <button type="button" className="dn-button" onClick={fillRandomNickOnly} style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} disabled={isNicknameFixed} aria-disabled={isNicknameFixed}>ランダム</button>
              </div>
              {currentPlayerIndex === players.length - 1 && players.slice(0, players.length - 1).every((p) => p.nickname.trim() !== '') && (
                <p className="player-setup__hint" style={{ color: 'var(--text-dim)' }}>※ ニックネーム固定</p>
              )}
            </div>

            <div className="player-setup__group">
              <label className="player-setup__label">本名</label>
              <p className="player-setup__hint"><span style={{ color: '#dc2626' }}>真の名</span><span style={{ color: 'var(--text-dim)' }}>を知られた者は、運命から逃れられない。</span></p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={players[currentPlayerIndex].realName}
                  onChange={(e) => handleInputChange('realName', e.target.value)}
                  placeholder="例: 天音海砂"
                  className="player-setup__input"
                  style={{ flex: 1 }}
                />
                <button type="button" className="dn-button" onClick={fillRandomRealOnly} style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>ランダム</button>
              </div>
              {realNameTrimmed.length > 0 && !realNameValid && (
                <p className="player-setup__hint" style={{ color: '#dc2626' }}>※ 本名は ４文字 で入力してください</p>
              )}
            </div>

            

            <div style={{ marginTop: 24 }}>
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
