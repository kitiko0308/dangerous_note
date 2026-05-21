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
  const [previewRole, setPreviewRole] = useState<Player['role']>(() => players[0]?.role ?? 'villager');

  const currentPlayer = players[currentPlayerIndex];

  // previewRole は初期化で players[0] の役職に合わせるため、
  // isShowing の変化で同期させる useEffect は不要です。

  // 役職名の日本語表示用
  const roleNames = {
    kira: "キラ",
    l: "L",
    villager: "市民"
  };

  const roleAccentColors = {
    kira: '#dc2626',
    l: '#3b82f6',
    villager: '#22c55e',
  } as const;

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      const nextIdx = currentPlayerIndex + 1;
      setCurrentPlayerIndex(nextIdx);
      // 先に previewRole を次プレイヤーの役職にしておくことで
      // Next Player 押下時のタブ選択ラグを防ぐ
      setPreviewRole(players[nextIdx].role);
      setIsShowing(false);
    } else {
      onNext();
    }
  };

  // isShowing の有無による表示切替:
  // - isShowing=true のときは左側画像 + 右側パネルの詳細レイアウト（タブで previewRole を切替）
  // - isShowing=false のときは簡易な確認レイアウトを表示
  const displayRole = isShowing ? previewRole : currentPlayer.role;
  const isVillager = isShowing && displayRole === 'villager';
  const isL = isShowing && displayRole === 'l';
  const isKira = isShowing && displayRole === 'kira';
  const accentColor = roleAccentColors[displayRole];
  const tabRoles = (() => {
    const base: Player['role'][] = ['kira', 'l', 'villager'];
    if (currentPlayer && base.includes(currentPlayer.role)) {
      return [currentPlayer.role, ...base.filter((r) => r !== currentPlayer.role)];
    }
    return base;
  })();
  const roleIntroText = displayRole !== currentPlayer.role
    ? '彼は...'
    : `${currentPlayer.nickname} さんの役職は...`;

  if (isVillager || isL || isKira) {
    return (
      <div className="title-screen">
        <div className="title-screen__grain" aria-hidden="true" />
        <div className="title-screen__vignette" aria-hidden="true" />

        <main style={{ position: 'relative', zIndex: 3, minHeight: '100svh', display: 'flex', flexDirection: 'column', padding: '0.55rem 1.4rem 0.85rem', paddingTop: '0.35rem' }}>
          {/* ヘッダー */}
          <div style={{ textAlign: 'center', marginBottom: '0.1rem' }}>
            <h2 className="title-logo" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              役職の確認
            </h2>
            <p className="title-sub"><span style={{ color: '#dc2626' }}>{currentPlayerIndex + 1}</span> / {players.length} 人目の確認</p>
          </div>

          {/* 左画像 + 右パネルレイアウト */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', maxWidth: '1000px', margin: '0 auto', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* 左: 画像 */}
            <div style={{ flexShrink: 0, width: '280px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '-2rem' }}>
              {isShowing && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '-0.95rem' }}>
                  {tabRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setPreviewRole(role)}
                      className="role-preview-tab"
                      aria-pressed={displayRole === role}
                      style={{
                        borderColor: displayRole === role ? roleAccentColors[role] : 'rgba(255,255,255,.12)',
                        background: displayRole === role ? `${roleAccentColors[role]}22` : 'rgba(0,0,0,.35)',
                        color: displayRole === role ? '#ffffff' : '#cbd5e1',
                      }}
                    >
                      {roleNames[role]}
                    </button>
                  ))}
                </div>
              )}
              <img src={isKira ? kiraImg : isL ? lImg : siminnImg} alt={isKira ? "キラ" : isL ? "L" : "市民"} className={isKira ? "role-kira-art-side" : isL ? "role-l-art-side" : "role-villager-art-side"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* 右: 情報パネル */}
            <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 役職確認パネル */}
              <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 12px', letterSpacing: '.15em' }}>{roleIntroText}</p>
                <h1 style={{ fontSize: 48, margin: '10px 0', color: accentColor, fontWeight: 900 }}>{roleNames[displayRole]}</h1>
                {isKira && (
                  <p style={{ fontSize: 14, color: '#fca5a5', margin: '6px 0 0', fontWeight: 700 }}>名前を書かれた人間は死ぬ。</p>
                )}
                {isL && (
                  <p style={{ fontSize: 14, color: '#93c5fd', margin: '6px 0 0', fontWeight: 700 }}>真実は、調査すればするほど浮かび上がる。</p>
                )}
                {isVillager && (
                  <p style={{ fontSize: 14, color: '#86efac', margin: '6px 0 0', fontWeight: 700 }}>あなたの一票が、村を救う。</p>
                )}
              </div>

              {isKira ? (
                <>
                  {/* キラの勝利条件パネル (先に表示) */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>勝利条件</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　<span style={{ color: '#dc2626' }}>追放されなければ</span>勝利する。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>　　ただし、5ターン以内に誰も殺せなかった場合は敗北する。</p>
                  </div>

                  {/* キラの能力パネル (勝利条件の下) */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>能力</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　<span style={{ color: '#ffffff' }}>毎晩</span>、ランダムで1人の本名の<span style={{ color: '#dc2626' }}>一文字を知る</span>ことができる。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　ミニゲームで<span style={{ color: '#ffffff' }}>1位</span>になった場合、アイテム <span><span style={{ color: '#ffffff' }}>【　</span><span style={{ color: accentColor }}>死神の目</span><span style={{ color: '#ffffff' }}>　】</span></span> を入手できる。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>　　<span><span style={{ color: '#ffffff' }}>【　</span><span style={{ color: accentColor }}>死神の目</span><span style={{ color: '#ffffff' }}>　】</span></span> を使用すると、その夜にランダムで1人の<span style={{ color: '#dc2626' }}>本名を知る</span>ことができる。</p>
                  </div>
                </>
              ) : isL ? (
                <>
                  {/* L の勝利条件パネル (先に表示) */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>勝利条件</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　<span style={{ color: '#3b82f6' }}>キラを追放</span>する。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　キラが5ターン以内に誰も裁けなかった場合、市民陣営の勝利となる。</p>
                  </div>

                  {/* L の能力パネル (勝利条件の下) */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>能力</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　毎晩、プレイヤー1人の、その日のミニゲームの<span style={{ color: '#3b82f6' }}>「順位」を調査</span>できる。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　昼のミニゲームで1位になったとき、アイテム <span><span style={{ color: '#ffffff' }}>【　</span><span style={{ color: accentColor }}>ショートケーキ</span><span style={{ color: '#ffffff' }}>　】</span></span> を入手できる。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>　　<span><span style={{ color: '#ffffff' }}>【　</span><span style={{ color: accentColor }}>ショートケーキ</span><span style={{ color: '#ffffff' }}>　】</span></span> を使用すると、任意のプレイヤー1人を指名し、その人が<span style={{ color: '#3b82f6' }}>キラか</span><span style={{ color: '#3b82f6' }}>どうかを知る</span>ことができる。</p>
                  </div>
                </>
              ) : (
                <>
                  {/* 市民の勝利条件パネル */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>勝利条件</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　<span style={{ color: '#22c55e' }}>キラを追放</span>する。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　キラが5ターン以内に誰も裁けなかった場合、市民陣営の勝利となる。</p>
                  </div>

                  {/* 市民の能力パネル */}
                  <div style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', position: 'relative', boxShadow: `0 0 18px ${accentColor}14` }}>
                    <h3 style={{ fontSize: 13, letterSpacing: '.2em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '10px', marginTop: 0, marginBottom: '12px' }}>能力</h3>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: 0 }}>♦　特殊能力は<span style={{ color: '#22c55e' }}>持たない</span>。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　夜の行動では「休む」を選択する。</p>
                    <p style={{ fontSize: 13, color: '#d1d5db', letterSpacing: '.08em', lineHeight: 1.7, margin: '8px 0 0' }}>♦　話し合いと投票でキラ（敵）を追放へ導く。</p>
                  </div>
                </>
              )}

              {/* ボタン */}
              <button className="dn-button role-reveal-action-button" onClick={handleNext} style={{ marginTop: '0.5rem', padding: '12px 24px', fontSize: 14, letterSpacing: '.15em' }}>
                {currentPlayerIndex < players.length - 1 ? 'Next Player' : (currentPlayer.role === 'kira' ? <><span style={{ color: accentColor }}>狩り</span>を始める</> : <><span style={{ color: accentColor }}>裁き</span>を始める</>)}
              </button>
            </div>
          </div>

          {/* プログレスドット */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: 10 }}>
            {players.map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: i === currentPlayerIndex ? 'var(--kira-red)' : 'var(--border-color)' }} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // isShowing が false の場合に表示される既存の簡易レイアウト
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
        <div style={{ width: '100%', display: 'grid', placeItems: 'center', gap: '1rem' }}>
          <h2 className="title-logo" style={{ fontSize: '2.2rem' }}>
            役職の確認
          </h2>
          <p className="title-sub"><span style={{ color: '#dc2626' }}>{currentPlayerIndex + 1}</span> / {players.length} 人目の確認</p>

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
                <button className="dn-button role-reveal-action-button" onClick={handleNext}>
                  {currentPlayerIndex < players.length - 1 ? 'Next Player' : (currentPlayer.role === 'kira' ? <><span style={{ color: accentColor }}>狩り</span>を始める</> : <><span style={{ color: accentColor }}>裁き</span>を始める</>)}
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
