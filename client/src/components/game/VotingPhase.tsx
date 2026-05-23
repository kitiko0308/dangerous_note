import React from 'react';
import touhyoImg from '../../assets/img/touhyo.png';
import type { Player } from '../../types';

type Props = {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onVote: (playerId: number | null) => void; // 追放する人のID、またはnull（追放なし）
};

export default function VotingPhase({ players, setPlayers: _setPlayers, onVote }: Props) {
  const alivePlayers = players.filter((player) => player.isAlive);

  return (
    <div className="voting-phase" style={containerStyle}>
      <style>{`
        .vote-player-button {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .vote-player-button:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.32);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
        }

        .vote-player-button:active {
          transform: translateY(0);
        }

        .vote-no-button {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .vote-no-button:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive tweaks: tablet */
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

        /* Responsive tweaks: mobile */
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
            min-height: 110px !important;
            padding: 14px 12px !important;
            font-size: 15px !important;
            border-radius: 10px !important;
          }

          .vote-no-button {
            max-width: 100% !important;
            padding: 12px 16px !important;
          }
        }
      `}</style>

      <div style={cardStyle} className="vote-card">
        <p style={labelStyle}>VOTING PHASE</p>
        <h2 className="vote-title" style={titleStyle}>追放投票</h2>

        <p style={descriptionStyle}>
          怪しい人物を1人選んでください。名前の一部が公開されている場合があります。
        </p>

        <div className="vote-grid" style={playerGridStyle}>
          {alivePlayers.map((player) => {
            const revealedSet = new Set(player.revealedChars);
            const maskedName = player.realName
              .split('')
              .map((char, index) => (revealedSet.has(index) ? char : '〇'))
              .join('');

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onVote(player.id)}
                className="vote-player-button"
                style={{
                  ...playerButtonStyle
                }}
              >
                <span style={nicknameStyle}>{player.nickname}</span>
                <span style={maskedNameStyle}>本名: {maskedName}</span>
              </button>
            );
          })}
        </div>

        <div style={dividerStyle} />

        <button type="button" onClick={() => onVote(null)} className="vote-no-button" style={noVoteButtonStyle}>
          誰も追放しない
        </button>

        <p style={noteStyle}>※誰かを選択すると、その人の追放結果演出へ進みます</p>
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
  marginBottom: 28,
  color: 'var(--text-main)',
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

const noteStyle: React.CSSProperties = {
  marginTop: 18,
  fontSize: 12,
  opacity: 0.62,
  color: 'var(--text-dim)',
};
