import React, { useState, useEffect } from 'react';
import type { Player, Item } from '../../types';
import sinyaBg from '../../assets/img/sinya.png';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setNightActionLogs: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
};

const villagerLogs = [
  '廊下で物音を聞いた…しかし正体は分からなかった。',
  '誰かが部屋を移動していた気がする。',
  '監視を続けたが、有力な情報は得られなかった。',
  '不自然な気配を感じたが、確証は持てない。',
  '遠くで扉が閉まる音がした。',
  'メモを整理した。',
  '少し休もうとしたが、結局眠れなかった。',
  '天井を眺めながら、しばらく考え込んでいた。',
  '考え事をしていたら時間が過ぎていた。',
  '静かすぎて逆に落ち着かなかった。',
  '誰かの足音が聞こえた気がした。',
  '画面をぼんやり眺めていたら、時間が過ぎていた。',
  'TLを徘徊していたら、気づけばかなり時間が過ぎていた。',
  '唐突にお腹がすき、深夜にカロリー爆弾を食べてしまった。',
  '眠気を覚ますために冷たい水を飲んだ。',
  '眠れず、意味もなく画面を何度も見返してしまった。',
  '時計の音が妙に気になった。',
  '何か忘れている気がして、しばらく考え込んでいた。',
  '部屋の静けさに耐えきれず、少しだけ音楽を流した。',
  '気を紛らわせるため、適当にメモを書き続けていた。',
  '意味もなくスマホを開いては閉じるのを繰り返していた。',
  '緊張のせいか、妙に喉が渇いていた。',
  'ぼーっとしていたら、いつの間にか時間が過ぎていた。',
  '誰かの気配を感じた気がしたが、気のせいだったかもしれない。',
  '深夜テンションでどうでもいいことを考えてしまった。',
  '不安になり、何度も鍵を確認してしまった。',
  'なんとなく眠れず、ベッドに座ったまま過ごしていた。',
  'ふと鏡を見たら、自分でも少し顔色が悪い気がした。',
];

export default function MidnightPhase({
  players,
  setPlayers,
  setNightActionLogs,
  onNext,
}: Props) {
  type ActionLog = { id: string; text: string };

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(() => {
    const firstAlive = players.findIndex((p) => p.isAlive);
    return firstAlive !== -1 ? firstAlive : 0;
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [usedActions, setUsedActions] = useState<string[]>([]);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const genLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  useEffect(() => {
    if (currentPlayerIndex >= players.length || !players[currentPlayerIndex]?.isAlive) {
      const firstAlive = players.findIndex((p) => p.isAlive);
      setCurrentPlayerIndex(firstAlive !== -1 ? firstAlive : 0);
    }
  }, [players, currentPlayerIndex]);

  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const handleNextPlayer = () => {
    if (isLoadingAction) return;

    let nextIndex = currentPlayerIndex + 1;
    while (nextIndex < players.length && !players[nextIndex].isAlive) {
      nextIndex++;
    }

    if (nextIndex < players.length) {
      setCurrentPlayerIndex(nextIndex);
      setIsConfirmed(false);
      setActionLogs([]);
      setUsedActions([]);
      setIsLoadingAction(false);
    } else {
      onNext();
    }
  };

  const handleKiraAction = async () => {
    setIsLoadingAction(true);

    const targets = players.filter((p) => {
      if (p.id === currentPlayer.id || !p.isAlive) return false;
      const combined = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
      return combined.length < p.realName.length;
    });

    const finalTargets =
      targets.length > 0
        ? targets
        : players.filter((p) => p.id !== currentPlayer.id && p.isAlive);

    if (finalTargets.length === 0) {
      setIsLoadingAction(false);
      return;
    }

    const target = finalTargets[Math.floor(Math.random() * finalTargets.length)];
    const nameLength = target.realName.length;

    const availableIndices = Array.from({ length: nameLength }, (_, i) => i).filter(
      (i) => !target.revealedChars.includes(i) && !target.kiraRevealedChars.includes(i),
    );

    const charIdx =
      availableIndices.length > 0
        ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
        : Math.floor(Math.random() * nameLength);

    const maskedName = target.realName
      .split('')
      .map((char, i) => (i === charIdx ? char : '〇'))
      .join('');

    await new Promise((resolve) => setTimeout(resolve, 700));

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              kiraRevealedChars: [...new Set([...p.kiraRevealedChars, charIdx])],
            }
          : p,
      ),
    );

    setActionLogs((prev) => [
      ...prev,
      { id: genLogId(), text: `${target.nickname} の本名の一部は「${maskedName}」だと判明した。` },
    ]);
    setUsedActions((prev) => [...prev, 'steal']);
    setIsLoadingAction(false);
  };

  const handleKillAction = (targetId: number) => {
    const target = players.find((p) => p.id === targetId);
    if (!target) return;

    setPlayers((prev) =>
      prev.map((p) => (p.id === targetId ? { ...p, isKilledByKira: true } : p)),
    );

    setNightActionLogs((prev) => [
      ...prev,
      `恐ろしい事件が発生しました。${target.nickname} さんが心臓麻痺で亡くなりました。`,
    ]);

    setActionLogs((prev) => [...prev, { id: genLogId(), text: `${target.nickname} を始末した...。` }]);
    setUsedActions((prev) => [...prev, 'kill']);
  };

  const handleLAction = (targetId: number) => {
    const target = players.find((p) => p.id === targetId);
    if (!target) return;

    const rank = target.miniGameRank ?? '?';
    setActionLogs((prev) => [
      ...prev,
      { id: genLogId(), text: `${target.nickname} のミニゲーム順位は ${rank}位 だった。` },
    ]);
    setUsedActions((prev) => [...prev, 'rank_check']);
  };

  const handleVillagerAction = (targetId: number) => {
    const target = players.find((p) => p.id === targetId);
    if (!target) return;

    const randomLog = villagerLogs[Math.floor(Math.random() * villagerLogs.length)];

    setActionLogs((prev) => [
      ...prev,
      { id: genLogId(), text: `${target.nickname} を気にしながら夜を過ごした。${randomLog}` },
    ]);

    setUsedActions((prev) => [...prev, 'observe']);
  };

  const useItem = (item: Item, targetId?: number) => {
    let effectiveTargetId = targetId;

    if (item === 'death_note_eye') {
      const targets = players.filter((p) => {
        if (p.id === currentPlayer.id || !p.isAlive) return false;
        const combined = [...new Set([...p.revealedChars, ...p.kiraRevealedChars])];
        return combined.length < p.realName.length;
      });

      const finalTargets =
        targets.length > 0
          ? targets
          : players.filter((p) => p.id !== currentPlayer.id && p.isAlive);

      if (finalTargets.length === 0) return;

      const target = finalTargets[Math.floor(Math.random() * finalTargets.length)];
      effectiveTargetId = target.id;

      setActionLogs((prev) => [
        ...prev,
        { id: genLogId(), text: `【死神の目】を使用。${target.nickname} の本名は「${target.realName}」だ！` },
      ]);
    } else if (item === 'shortcake' && effectiveTargetId !== undefined) {
      const target = players.find((p) => p.id === effectiveTargetId);
      if (target) {
        setActionLogs((prev) => [
          ...prev,
          { id: genLogId(), text: `【ショートケーキ】を使用。${target.nickname} は ${
            target.role === 'kira' ? 'キラだ！' : 'キラではない。'
          }` },
        ]);
      }
    }

    setPlayers((prev) =>
      prev.map((p) => {
        const updated = { ...p };

        if (item === 'death_note_eye' && p.id === effectiveTargetId) {
          updated.kiraRevealedChars = p.realName.split('').map((_, i) => i);
        }

        if (p.id === currentPlayer.id) {
          updated.items = p.items.filter((i) => i !== item);
        }

        return updated;
      }),
    );

    setUsedActions((prev) => [...prev, item]);
  };

  const alivePlayers = players.filter((p) => p.isAlive);
  const currentSurvivorNumber = alivePlayers.findIndex((p) => p.id === currentPlayer.id) + 1;
  const totalSurvivors = alivePlayers.length;

  const roleLabel =
    currentPlayer.role === 'kira' ? 'キラ' : currentPlayer.role === 'l' ? 'L' : '市民';

  return (
    <>
      <style>{`
        .midnight-confirm-button,
        .midnight-action-button,
        .midnight-item-button,
        .midnight-kill-button,
        .midnight-next-button {
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .midnight-confirm-button:hover,
        .midnight-action-button:hover,
        .midnight-item-button:hover,
        .midnight-kill-button:hover,
        .midnight-next-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 720px) {
          .midnight-panel { padding: 18px 14px !important; border-radius: 14px !important; }
          .midnight-title { font-size: clamp(1.2rem, 5.6vw, 1.6rem) !important; }
          .midnight-count { font-size: 14px !important; }
          .midnight-confirm-button { width: 100% !important; min-width: 0 !important; padding: 12px 14px !important; }
          .midnight-action-button, .midnight-item-button, .midnight-kill-button { width: 100% !important; padding: 12px 14px !important; }
          .midnight-next-button { width: 100% !important; }
          .midnight-action-card { padding: 14px !important; }
          .midnight-name-row { font-size: 13px !important; }
          .midnight-log p { font-size: 13px !important; }
        }

        @media (max-width: 420px) {
          .midnight-panel { max-width: 92% !important; }
          .midnight-title { font-size: clamp(1.05rem, 6.5vw, 1.25rem) !important; }
        }

        @keyframes fadeInLog {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          ...containerStyle,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.26), rgba(0,0,0,0.64)),
            url(${sinyaBg})
          `,
        }}
      >
        <div style={panelStyle} className="midnight-panel">
          <p style={phaseLabelStyle}>MIDNIGHT PHASE</p>
          <h2 style={titleStyle} className="midnight-title">
            深夜行動
          </h2>
          <p style={countStyle} className="midnight-count">
            {currentSurvivorNumber} / {totalSurvivors} 人目
          </p>

          {!isConfirmed ? (
            <div style={confirmBoxStyle}>
              <p style={warningStyle}>
                <strong>{currentPlayer.nickname}</strong> さん以外は見ないでください
              </p>

              <button
                type="button"
                onClick={() => setIsConfirmed(true)}
                style={confirmButtonStyle}
                className="midnight-confirm-button"
              >
                自分であることを確認
              </button>
            </div>
          ) : (
            <div style={actionAreaStyle}>
              <p style={roleStyle}>あなたの役職：{roleLabel}</p>

              <div style={actionCardStyle} className="midnight-action-card">
                {(actionLogs.length > 0 || isLoadingAction) && (
                  <div style={logBoxStyle}>
                    <p style={logTitleStyle}>ACTION LOG</p>

                    {isLoadingAction && (
                      <p style={loadingStyle} aria-live="polite">
                        解析中...
                      </p>
                    )}

                    {actionLogs.map((log, i) => (
                      <p
                        key={log.id}
                        style={{
                          ...logStyle,
                          opacity: 0,
                          animation: 'fadeInLog 0.45s ease forwards',
                          animationDelay: `${i * 0.08}s`,
                        }}
                      >
                        ✓ {log.text}
                      </p>
                    ))}
                  </div>
                )}

                {currentPlayer.role === 'kira' && (
                  <div style={sectionStyle}>
                    <button
                      type="button"
                      onClick={handleKiraAction}
                      disabled={usedActions.includes('steal') || isLoadingAction}
                      style={
                        usedActions.includes('steal') || isLoadingAction
                          ? disabledBtnStyle
                          : actionBtnStyle
                      }
                      className="midnight-action-button"
                    >
                      本名を1文字盗む {usedActions.includes('steal') && '済'}
                    </button>

                    {currentPlayer.items.includes('death_note_eye') &&
                      !usedActions.includes('death_note_eye') && (
                        <button
                          type="button"
                          onClick={() => useItem('death_note_eye')}
                          style={itemBtnStyle}
                          className="midnight-item-button"
                        >
                          【死神の目】を使用
                        </button>
                      )}

                    <p style={sectionLabelStyle}>本名が全て分かれば殺害可能：</p>

                    {players
                      .filter((p) => p.id !== currentPlayer.id && p.isAlive)
                      .map((p) => {
                        const combinedRevealed = [
                          ...new Set([...p.revealedChars, ...p.kiraRevealedChars]),
                        ];
                        const isFullyKnown = combinedRevealed.length >= p.realName.length;
                        const hasAlreadyKilled = usedActions.includes('kill');
                        const canKillNow = isFullyKnown && !hasAlreadyKilled;

                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => handleKillAction(p.id)}
                            disabled={!canKillNow}
                            style={canKillNow ? killBtnStyle : disabledBtnStyle}
                            className={canKillNow ? 'midnight-kill-button' : ''}
                          >
                            {p.nickname} の名前をノートに書く
                            {hasAlreadyKilled && ' 済'}
                            {!hasAlreadyKilled && !isFullyKnown && '（本名が不明です）'}
                          </button>
                        );
                      })}

                    <div style={nameListStyle}>
                      <p style={sectionLabelStyle}>現在の本名把握状況：</p>

                      {players
                        .filter((p) => p.id !== currentPlayer.id && p.isAlive)
                        .map((p) => {
                          const combinedRevealed = [
                            ...new Set([...p.revealedChars, ...p.kiraRevealedChars]),
                          ];
                          const combinedName = (p.realName || '')
                            .split('')
                            .map((char, i) => (combinedRevealed.includes(i) ? char : '〇'))
                            .join('');

                          return (
                            <div key={p.id} style={nameRowStyle} className="midnight-name-row">
                              <span>{p.nickname}</span>
                              <span style={secretNameStyle}>{combinedName}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {currentPlayer.role === 'l' && (
                  <div style={sectionStyle}>
                    {currentPlayer.items.includes('shortcake') &&
                      !usedActions.includes('shortcake') && (
                        <>
                          <p style={itemNoticeStyle}>ショートケーキを使用できます</p>

                          {players
                            .filter((p) => p.id !== currentPlayer.id && p.isAlive)
                            .map((p) => (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => useItem('shortcake', p.id)}
                                style={itemBtnStyle}
                                className="midnight-item-button"
                              >
                                {p.nickname} を鑑定
                              </button>
                            ))}
                        </>
                      )}

                    <p style={sectionLabelStyle}>調査する相手を選んでください：</p>

                    {players
                      .filter((p) => p.id !== currentPlayer.id && p.isAlive)
                      .map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleLAction(p.id)}
                          disabled={usedActions.includes('rank_check')}
                          style={
                            usedActions.includes('rank_check')
                              ? disabledBtnStyle
                              : actionBtnStyle
                          }
                          className="midnight-action-button"
                        >
                          {p.nickname} の順位を調査 {usedActions.includes('rank_check') && '済'}
                        </button>
                      ))}
                  </div>
                )}

                {currentPlayer.role === 'villager' && (
                  <div style={sectionStyle}>
                    <p style={sectionLabelStyle}>気になる相手を選んでください：</p>

                    {players
                      .filter((p) => p.id !== currentPlayer.id && p.isAlive)
                      .map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleVillagerAction(p.id)}
                          disabled={usedActions.includes('observe')}
                          style={
                            usedActions.includes('observe')
                              ? disabledBtnStyle
                              : actionBtnStyle
                          }
                          className="midnight-action-button"
                        >
                          {p.nickname} を気にして過ごす {usedActions.includes('observe') && '済'}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextPlayer}
                disabled={isLoadingAction}
                aria-busy={isLoadingAction}
                style={isLoadingAction ? disabledBtnStyle : nextButtonStyle}
                className="midnight-next-button"
              >
                {currentSurvivorNumber < totalSurvivors
                  ? '行動を終了して次のプレイヤーへ'
                  : '行動を終了して夜明けを迎える'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const serifFont =
  'var(--font-serif), "Yu Mincho", "Hiragino Mincho ProN", serif';

const containerStyle: React.CSSProperties = {
  minHeight: '100svh',
  width: '100vw',
  marginLeft: 'calc(50% - 50vw)',
  padding: '24px 16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
};

const panelStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 640,
  padding: '28px 24px',
  borderRadius: 20,
  background: 'rgba(4, 6, 18, 0.34)',
  border: '1px solid rgba(180, 200, 255, 0.12)',
  boxShadow: '0 18px 50px rgba(0,0,0,0.46)',
  backdropFilter: 'blur(1.5px)',
  color: '#f4f1ea',
  textAlign: 'center',
  fontFamily: serifFont,
};

const phaseLabelStyle: React.CSSProperties = {
  color: '#9fbaff',
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 4,
  marginBottom: 10,
  fontFamily: 'serif',
};

const titleStyle: React.CSSProperties = {
  fontSize: 34,
  fontFamily: serifFont,
  marginBottom: 8,
  color: '#f5efdf',
};

const countStyle: React.CSSProperties = {
  opacity: 0.78,
  marginBottom: 24,
  fontFamily: serifFont,
};

const confirmBoxStyle: React.CSSProperties = {
  padding: '20px 18px 8px',
};

const warningStyle: React.CSSProperties = {
  fontSize: 20,
  marginBottom: 26,
  fontFamily: serifFont,
};

const actionAreaStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  margin: '0 auto',
};

const roleStyle: React.CSSProperties = {
  color: '#e8e0d4',
  marginBottom: 14,
  fontFamily: serifFont,
};

const actionCardStyle: React.CSSProperties = {
  background: 'rgba(4, 6, 18, 0.38)',
  border: '1px solid rgba(180,200,255,0.1)',
  borderRadius: 16,
  padding: 20,
  textAlign: 'left',
  marginBottom: 20,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  fontFamily: serifFont,
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#c3c9df',
  margin: '8px 0 0',
};

const logBoxStyle: React.CSSProperties = {
  borderLeft: '3px solid rgba(159,186,255,0.8)',
  paddingLeft: 12,
  marginBottom: 18,
};

const logTitleStyle: React.CSSProperties = {
  color: '#9fbaff',
  fontSize: 11,
  letterSpacing: 2,
  fontWeight: 'bold',
  marginBottom: 8,
};

const logStyle: React.CSSProperties = {
  color: '#ffb0b0',
  fontSize: 14,
  lineHeight: 1.7,
  margin: '4px 0',
};

const loadingStyle: React.CSSProperties = {
  color: '#9fbaff',
  fontSize: 13,
  letterSpacing: '0.12em',
  marginBottom: 16,
  opacity: 0.8,
  animation: 'fadeInLog 0.3s ease',
};

const baseButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.045)',
  color: '#f5efdf',
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: serifFont,
};

const confirmButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  width: 'auto',
  minWidth: 220,
  padding: '14px 32px',
  border: '1px solid rgba(180, 200, 255, 0.32)',
  boxShadow: '0 0 18px rgba(120,140,255,0.12)',
};

const actionBtnStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(150,170,255,0.24)',
  boxShadow: '0 0 16px rgba(90,110,255,0.08)',
};

const itemBtnStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(190,145,255,0.28)',
  color: '#eadcff',
  boxShadow: '0 0 16px rgba(150,100,255,0.1)',
};

const killBtnStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(190,60,60,0.36)',
  color: '#ffdede',
  boxShadow: '0 0 18px rgba(180,40,40,0.14)',
};

const disabledBtnStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: 'rgba(255,255,255,0.025)',
  color: 'rgba(255,255,255,0.28)',
  border: '1px solid rgba(255,255,255,0.06)',
  cursor: 'not-allowed',
  boxShadow: 'none',
};

const nameListStyle: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 14,
  borderTop: '1px solid rgba(255,255,255,0.12)',
};

const nameRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  background: 'rgba(0,0,0,0.42)',
  padding: '8px 12px',
  borderRadius: 8,
  marginTop: 6,
};

const secretNameStyle: React.CSSProperties = {
  color: '#ffb0b0',
  fontFamily: 'monospace',
};

const itemNoticeStyle: React.CSSProperties = {
  color: '#d9c3ff',
  fontSize: 13,
  marginBottom: 0,
};

const nextButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(220,220,220,0.18)',
  background: 'rgba(255,255,255,0.055)',
  boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
};