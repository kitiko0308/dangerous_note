import React, { useEffect, useMemo, useState } from 'react';
import touhyoImg from '../../assets/img/touhyo.png';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onVote: (playerId: number | null) => void;
};

type VoteTarget = number | null;
type VoteStage = 'normal' | 'speech' | 'revote';

export default function VotingPhase({ players, setPlayers: _setPlayers, onVote }: Props) {
  const alivePlayers = useMemo(
    () => players.filter((player) => player.isAlive),
    [players],
  );

  const [stage, setStage] = useState<VoteStage>('normal');
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [normalVotes, setNormalVotes] = useState<VoteTarget[]>([]);
  const [revotes, setRevotes] = useState<VoteTarget[]>([]);
  const [tieCandidateIds, setTieCandidateIds] = useState<number[]>([]);
  const [speechTimeLeft, setSpeechTimeLeft] = useState(60);

  useEffect(() => {
    if (currentVoterIndex >= alivePlayers.length) {
      setCurrentVoterIndex(alivePlayers.length > 0 ? Math.max(0, alivePlayers.length - 1) : 0);
      setIsConfirmed(false);
    }
  }, [alivePlayers, currentVoterIndex]);

  const currentVoter = alivePlayers[currentVoterIndex];
  const currentVoterNumber = currentVoterIndex + 1;
  const totalVoters = alivePlayers.length;

  useEffect(() => {
    if (stage !== 'speech') return;
    if (speechTimeLeft <= 0) return;

    const timerId = window.setTimeout(() => {
      setSpeechTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [stage, speechTimeLeft]);

  const getMaskedName = (player: Player) => {
    const revealedSet = new Set(player.revealedChars);

    return player.realName
      .split('')
      .map((char, index) => (revealedSet.has(index) ? char : '〇'))
      .join('');
  };

  const resolveVotes = (votes: VoteTarget[], isFinalVote: boolean) => {
    const voteCounts = new Map<VoteTarget, number>();

    votes.forEach((vote) => {
      voteCounts.set(vote, (voteCounts.get(vote) ?? 0) + 1);
    });

    if (voteCounts.size === 0) {
      onVote(null);
      return;
    }

    const maxCount = Math.max(...Array.from(voteCounts.values()));
    const topTargets = Array.from(voteCounts.entries())
      .filter(([, count]) => count === maxCount)
      .map(([target]) => target);

    if (topTargets.length === 1) {
      onVote(topTargets[0]);
      return;
    }

    if (isFinalVote) {
      onVote(null);
      return;
    }

    const tiedPlayerIds = topTargets.filter(
      (target): target is number => target !== null,
    );

    if (tiedPlayerIds.length === 0) {
      onVote(null);
      return;
    }

    setTieCandidateIds(tiedPlayerIds);
    setStage('speech');
    setSpeechTimeLeft(60);
    setCurrentVoterIndex(0);
    setIsConfirmed(false);
  };

  const moveToNextVoter = () => {
    setCurrentVoterIndex((prev) => Math.min(prev + 1, Math.max(0, alivePlayers.length - 1)));
    setIsConfirmed(false);
  };

  const handleVote = (targetId: VoteTarget) => {
    if (!currentVoter) return;

    if (stage === 'normal') {
      const nextVotes = [...normalVotes, targetId];
      setNormalVotes(nextVotes);

      if (currentVoterIndex + 1 >= alivePlayers.length) {
        resolveVotes(nextVotes, false);
        return;
      }

      moveToNextVoter();
      return;
    }

    if (stage === 'revote') {
      const nextVotes = [...revotes, targetId];
      setRevotes(nextVotes);

      if (currentVoterIndex + 1 >= alivePlayers.length) {
        resolveVotes(nextVotes, true);
        return;
      }

      moveToNextVoter();
    }
  };

  const startRevote = () => {
    setStage('revote');
    setCurrentVoterIndex(0);
    setIsConfirmed(false);
    setRevotes([]);
  };

  const voteCandidates =
    stage === 'revote'
      ? alivePlayers.filter((player) => tieCandidateIds.includes(player.id))
      : alivePlayers;

  return (
    <div className="voting-phase" style={containerStyle}>
      <style>{`
        .vote-player-button,
        .vote-confirm-button,
        .vote-no-button,
        .vote-next-button {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .vote-player-button:hover,
        .vote-confirm-button:hover,
        .vote-no-button:hover,
        .vote-next-button:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.32);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
        }

        .vote-player-button:active,
        .vote-confirm-button:active,
        .vote-no-button:active,
        .vote-next-button:active {
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          .vote-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }

          .vote-card {
            padding: 22px 20px !important;
            max-width: 680px !important;
            margin: 8px;
          }
        }

        @media (max-width: 560px) {
          .voting-phase {
            padding: 10px 12px 36px !important;
          }

          .vote-card {
            padding: 20px 14px !important;
            padding-bottom: 32px !important;
            min-height: auto !important;
            box-shadow: 0 6px 18px rgba(0,0,0,0.45) !important;
            border-radius: 14px !important;
          }

          .vote-title {
            font-size: 24px !important;
          }

          .vote-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-bottom: 18px !important;
          }

          .vote-player-button {
            min-height: 104px !important;
            padding: 14px 12px !important;
            font-size: 15px !important;
            border-radius: 10px !important;
          }

          .vote-no-button,
          .vote-confirm-button,
          .vote-next-button {
            max-width: 100% !important;
            padding: 12px 16px !important;
          }
        }
      `}</style>

      <div style={cardStyle} className="vote-card">
        <p style={labelStyle}>
          {stage === 'revote' ? 'FINAL VOTE' : 'VOTING PHASE'}
        </p>

        <h2 className="vote-title" style={titleStyle}>
          {stage === 'speech'
            ? '決選弁明'
            : stage === 'revote'
              ? '決選投票'
              : '追放投票'}
        </h2>

        {stage === 'speech' ? (
          <>
            <p style={descriptionStyle}>
              投票が割れました。候補者は1分間、弁明を行ってください。
            </p>

            <div style={speechTimerStyle}>
              <span style={speechLabelStyle}>TIME LEFT</span>
              <strong style={speechNumberStyle}>{speechTimeLeft}</strong>
            </div>

            <div style={speechCandidateBoxStyle}>
              <p style={sectionLabelStyle}>候補者</p>

              <div style={speechCandidateListStyle}>
                {tieCandidateIds.map((id) => {
                  const player = alivePlayers.find((p) => p.id === id);
                  if (!player) return null;

                  return (
                    <span key={id} style={speechCandidateStyle}>
                      {player.nickname}
                    </span>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={startRevote}
              className="vote-next-button"
              style={nextButtonStyle}
            >
              弁明を終えて再投票へ
            </button>

            <p style={noteStyle}>
              ※再投票でも最多票が複数の場合、本日は誰も追放されません
            </p>
          </>
        ) : !isConfirmed ? (
          <>
            <p style={descriptionStyle}>
              <strong>{currentVoter?.nickname}</strong> さん以外は見ないでください。
            </p>

            <p style={countStyle}>
              {currentVoterNumber} / {totalVoters} 人目
            </p>

            <button
              type="button"
              onClick={() => setIsConfirmed(true)}
              className="vote-confirm-button"
              style={confirmButtonStyle}
            >
              自分であることを確認
            </button>

            <p style={noteStyle}>
              ※確認後、投票先を選んで次の人へ渡してください
            </p>
          </>
        ) : (
          <>
            <p style={descriptionStyle}>
              怪しい人物を1人選んでください。
            </p>

            <p style={countStyle}>
              投票者：{currentVoter?.nickname}　{currentVoterNumber} / {totalVoters}
            </p>

            <div className="vote-grid" style={playerGridStyle}>
              {voteCandidates.map((player) => {
                const maskedName = getMaskedName(player);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleVote(player.id)}
                    className="vote-player-button"
                    style={playerButtonStyle}
                  >
                    <span style={nicknameStyle}>{player.nickname}</span>
                    <span style={maskedNameStyle}>本名: {maskedName}</span>
                  </button>
                );
              })}
            </div>

            <div style={dividerStyle} />

            <button
              type="button"
              onClick={() => handleVote(null)}
              className="vote-no-button"
              style={noVoteButtonStyle}
            >
              誰も追放しない
            </button>

            <p style={noteStyle}>
              ※選択すると、次のプレイヤーへ進みます
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100svh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '12px 16px 48px',
  backgroundImage: `linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.08)), url(${touhyoImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center 18%',
  backgroundRepeat: 'no-repeat',
  backgroundBlendMode: 'overlay',
  filter: 'brightness(1.06) contrast(1.08)',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  padding: '28px 34px',
  paddingBottom: '44px',
  minHeight: 540,
  borderRadius: 18,
  background: 'rgba(6,6,6,0.12)',
  backdropFilter: 'none',
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
  color: '#e8e0d4',
  textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
  color: '#ff6b6b',
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 2,
  marginBottom: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  fontFamily: 'var(--font-serif)',
  marginBottom: 12,
  color: '#f5efdf',
};

const descriptionStyle: React.CSSProperties = {
  opacity: 0.82,
  lineHeight: 1.7,
  marginBottom: 22,
  color: 'var(--text-main)',
};

const countStyle: React.CSSProperties = {
  opacity: 0.75,
  marginBottom: 24,
  fontFamily: 'var(--font-serif)',
};

const playerGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 20,
  marginBottom: 28,
};

const playerButtonStyle: React.CSSProperties = {
  minHeight: 140,
  padding: '20px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'var(--font-serif)',
};

const nicknameStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: '700',
  letterSpacing: 0.02,
};

const maskedNameStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,179,179,0.9)',
  letterSpacing: 0.06,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.16)',
  margin: '8px 0 22px',
};

const confirmButtonStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 280,
  padding: '14px 20px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
};

const noVoteButtonStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 260,
  padding: '14px 20px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
};

const nextButtonStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 320,
  padding: '14px 20px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(138,3,3,0.42)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
};

const noteStyle: React.CSSProperties = {
  marginTop: 18,
  fontSize: 12,
  opacity: 0.62,
  color: 'var(--text-dim)',
};

const speechTimerStyle: React.CSSProperties = {
  width: 160,
  height: 160,
  margin: '10px auto 24px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(0,0,0,0.28)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 28px rgba(138,3,3,0.22)',
};

const speechLabelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.22em',
  opacity: 0.7,
  marginBottom: 8,
};

const speechNumberStyle: React.CSSProperties = {
  fontSize: 52,
  lineHeight: 1,
  color: '#f5efdf',
  fontFamily: 'var(--font-serif)',
};

const speechCandidateBoxStyle: React.CSSProperties = {
  padding: '18px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.2)',
  marginBottom: 24,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.18em',
  opacity: 0.72,
  marginBottom: 12,
};

const speechCandidateListStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const speechCandidateStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
};