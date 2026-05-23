import type { Player } from '../../types';
import exileBg from '../../assets/img/touhyokekka.png';

type Props = {
  exiledPlayerId: number | null;
  players: Player[];
  onNext: () => void;
};

export default function ExileResultPhase({
  exiledPlayerId,
  players,
  onNext,
}: Props) {
  const exiledPlayer =
    exiledPlayerId !== null
      ? players.find((p) => p.id === exiledPlayerId)
      : null;

  const isKira = exiledPlayer?.role === 'kira';

  return (
    <div
      style={{
        ...containerStyle,
        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,0.18),
            rgba(0,0,0,0.52)
          ),
          url(${exileBg})
        `,
      }}
    >
      <style>{`
        .exile-next-button {
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .exile-next-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
          filter: brightness(1.05);
        }

        .exile-next-button:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .exile-result-container {
            padding: 20px 12px 24px !important;
            align-items: stretch !important;
          }

          .exile-result-card {
            padding: 18px 14px !important;
            border-radius: 16px !important;
          }

          .exile-result-title {
            font-size: 24px !important;
            margin-bottom: 14px !important;
          }

          .exile-result-name {
            font-size: clamp(2.15rem, 11vw, 3rem) !important;
            letter-spacing: 0.04em !important;
          }

          .exile-result-no-exile {
            font-size: clamp(1.8rem, 8vw, 2.4rem) !important;
          }

          .exile-result-identity {
            padding: 16px 14px !important;
          }

          .exile-next-button {
            width: 100% !important;
            max-width: 320px !important;
          }
        }
      `}</style>
      <div style={cardStyle}>
        <p style={labelStyle}>EXILE RESULT</p>

        <h2 style={titleStyle} className="exile-result-title">追放結果発表</h2>

        {exiledPlayer ? (
          <>
            <p style={subTextStyle}>投票の結果、追放されたのは</p>

            <h1 style={nameStyle} className="exile-result-name">{exiledPlayer.nickname}</h1>

            <p style={sentenceStyle}>でした。</p>

            <div
              style={{
                ...identityBoxStyle,
                borderColor: isKira
                  ? 'rgba(179, 20, 20, 0.62)'
                  : 'rgba(255,255,255,0.14)',
                boxShadow: isKira
                  ? '0 0 22px rgba(179,20,20,0.18)'
                  : 'none',
              }}
              className="exile-result-identity"
            >
              <p style={identityLabelStyle}>その正体は...</p>

              <h3
                style={{
                  ...identityTextStyle,
                  color: isKira ? '#ff4d4d' : '#d8d0c2',
                }}
              >
                {isKira ? 'キラでした' : 'キラではありませんでした'}
              </h3>

              <p style={flavorTextStyle}>
                {isKira
                  ? '裁きは、ついに真実へ届いた。'
                  : '疑いは、また別の闇へ向かった。'}
              </p>
            </div>
          </>
        ) : (
          <>
            <p style={subTextStyle}>投票の結果</p>

            <h1 style={noExileStyle} className="exile-result-no-exile">
              誰も追放されませんでした
            </h1>

            <p style={flavorTextStyle}>
              沈黙は、次の夜を呼び寄せる。
            </p>
          </>
        )}

        <div style={dividerStyle} />

        <button type="button" onClick={onNext} style={buttonStyle} className="exile-next-button">
          次へ進む
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100svh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: 'clamp(24px, 6vw, 80px) 16px 32px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 720,
  padding: '24px 28px 26px',
  borderRadius: 18,
  border: 'none',

  background: 'rgba(8, 4, 4, 0.38)',

  boxShadow: '0 8px 24px rgba(0,0,0,0.32)',

  color: '#e8e0d4',
  textAlign: 'center',

  backdropFilter: 'blur(2px)',
};

const labelStyle: React.CSSProperties = {
  color: '#ff6b6b',
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 3,
  marginBottom: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 4vw, 1.95rem)',
  fontFamily: 'var(--font-serif)',
  color: '#f5efdf',
  marginBottom: 18,
};

const subTextStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.72,
  marginBottom: 10,
};

const nameStyle: React.CSSProperties = {
  fontSize: 'clamp(2.3rem, 8vw, 3.2rem)',
  fontFamily: 'var(--font-serif)',
  color: '#fff',
  margin: '6px 0 2px',
  letterSpacing: '0.08em',
  textShadow: '0 0 18px rgba(255,255,255,0.16)',
  lineHeight: 1.08,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

const sentenceStyle: React.CSSProperties = {
  fontSize: 18,
  opacity: 0.82,
};

const identityBoxStyle: React.CSSProperties = {
  marginTop: 18,
  padding: '18px 18px',
  borderRadius: 14,
  border: '1px solid',
  background: 'rgba(0,0,0,0.22)',
};

const identityLabelStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.68,
  marginBottom: 8,
};

const identityTextStyle: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
  fontFamily: 'var(--font-serif)',
  marginBottom: 8,
  lineHeight: 1.15,
};

const flavorTextStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.62,
  lineHeight: 1.7,
};

const noExileStyle: React.CSSProperties = {
  fontSize: 'clamp(2rem, 6vw, 2.5rem)',
  fontFamily: 'var(--font-serif)',
  color: '#f5efdf',
  marginBottom: 12,
  lineHeight: 1.4,
  wordBreak: 'keep-all',
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background:
    'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
  margin: '20px 0 18px',
};

const buttonStyle: React.CSSProperties = {
  width: 'min(100%, 220px)',
  padding: '14px 0',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(90deg, #8a0303, #c40000)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontSize: 16,
  transition: '0.2s ease',
};