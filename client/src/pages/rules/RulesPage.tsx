import { useRef, useState } from 'react';

import kiraImg from '../../assets/img/kira_hito.png';
import lImg from '../../assets/img/L_hito.png';
import citizenImg from '../../assets/img/siminn_hito.png';
import cakeImg from '../../assets/img/cake.png';
import eyeImg from '../../assets/img/sinigaminome.png';

type Props = {
  onBack: () => void;
};

type Direction = 'next' | 'prev';

export default function RulesPage({ onBack }: Props) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<Direction>('next');
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const pages = [
    <RuleSlide
      key="intro"
      direction={direction}
      title="この世界のルール"
      subtitle="名前を知られた者は、消える。"
      accent="#8a0303"
    >
      <p style={infoTextStyle}>
        キラは正体を隠し、市民陣営は会議でキラを追放するゲームです。
      </p>
      <p style={hintTextStyle}>左右にスワイプして確認できます</p>
    </RuleSlide>,

    <RoleSlide
      key="kira"
      direction={direction}
      title="キラ"
      accent="#b31414"
      image={kiraImg}
      catchCopy="名前を書かれた人間は死ぬ。"
      points={[
        '毎晩、ランダムで一人の本名の一文字を知ることができる',
        'ミニゲーム1位で【死神の目】を入手',
        '5日目までに追放されなければ勝利',
        '5日までに誰も殺せなかった場合は敗北',
      ]}
    />,

    <RoleSlide
      key="l"
      direction={direction}
      title="L"
      accent="#2f6fff"
      image={lImg}
      catchCopy="真実は、調査すればするほど浮かび上がる。"
      points={[
        '毎晩、プレイヤー１人の順位を確認できる',
        'ミニゲーム1位で【ショートケーキ】を入手',
        'キラを追放できれば勝利',
        'キラが５日までに誰も殺せなかった場合は勝利',
      ]}
    />,

    <RoleSlide
      key="citizen"
      direction={direction}
      title="市民"
      accent="#8fbf3f"
      image={citizenImg}
      catchCopy="君の力が未来を変える鍵になる。"
      points={[
        '特殊能力は持たない',
        '夜は「休む」を選ぶ',
        '投票でキラを追放へ導く',
      ]}
    />,

    <RuleSlide
      key="item"
      direction={direction}
      title="アイテム"
      subtitle="ミニゲーム1位の報酬"
      accent="#d9b36c"
    >
      <ItemBox
        name="死神の目"
        desc="その夜、ランダムで誰か1人の本名を知る。"
        color="#b31414"
        image={eyeImg}
      />
      <ItemBox
        name="ショートケーキ"
        desc="1人を指定し、その人がキラかどうかを知る。"
        color="#2f6fff"
        image={cakeImg}
      />
    </RuleSlide>,

    <RuleSlide
      key="flow"
      direction={direction}
      title="ゲームの流れ"
      subtitle="1ターンの進み方"
      accent="#8a0303"
    >
      <Flow />
    </RuleSlide>,

    <RuleSlide
      key="end"
      direction={direction}
      title="準備はいい？"
      subtitle="疑え。それが生き残る唯一の方法。"
      accent="#8a0303"
    >
      <p style={infoTextStyle}>ルールを確認したら、ゲームを始めましょう。</p>
    </RuleSlide>,
  ];

  const isLastPage = page === pages.length - 1;
  const threshold = 70;

  const goNext = () => {
    setDirection('next');
    setPage((p) => Math.min(p + 1, pages.length - 1));
  };

  const goPrev = () => {
    setDirection('prev');
    setPage((p) => Math.max(p - 1, 0));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    setDragX(e.touches[0].clientX - touchStartX.current);
  };

  const resetDrag = () => {
    setDragX(0);
    touchStartX.current = null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const diff = e.changedTouches[0].clientX - touchStartX.current;

    if (diff > threshold && page > 0) goPrev();
    if (diff < -threshold && page < pages.length - 1) goNext();

    resetDrag();
  };

  const limitedDrag =
    (page === 0 && dragX > 0) || (isLastPage && dragX < 0)
      ? dragX * 0.3
      : dragX;

  return (
    <div
      className="rules-container"
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetDrag}
    >
      <style>{`
        @keyframes pageNext {
          from { opacity: 0; transform: rotateY(-8deg) translateX(18px); }
          to { opacity: 1; transform: rotateY(0) translateX(0); }
        }

        @keyframes pagePrev {
          from { opacity: 0; transform: rotateY(8deg) translateX(-18px); }
          to { opacity: 1; transform: rotateY(0) translateX(0); }
        }

        .rule-button {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .rule-button:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .rules-container {
          min-height: 100dvh;
        }

        @media (max-width: 480px) {
          .rules-container {
            padding: 18px 12px 18px !important;
            justify-content: flex-start !important;
          }

          .rule-slide {
            min-height: auto !important;
            padding: 22px 18px !important;
            border-radius: 14px !important;
          }

          .role-slide {
            background-position: center top !important;
            background-size: cover !important;
          }

          .role-text-area {
            width: 100% !important;
            min-height: auto !important;
            padding-top: clamp(120px, 32vw, 180px) !important;
          }

          .rule-title {
            font-size: 28px !important;
          }

          .rule-subtitle {
            font-size: 15px !important;
          }

          .rule-point {
            font-size: 14px !important;
            line-height: 1.55 !important;
            margin-bottom: 12px !important;
          }

          .item-image {
            height: 120px !important;
          }

          .button-row {
            margin-top: 18px !important;
            padding-bottom: 8px !important;
          }
        }
      `}</style>

      <div style={bookFrameStyle}>
        <div
          style={{
            transform: `translateX(${limitedDrag}px) scale(${touchStartX.current !== null ? 0.98 : 1})`,
            transition: touchStartX.current !== null ? 'none' : '0.25s ease',
          }}
        >
          {pages[page]}
        </div>

        <div style={dotsStyle}>
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > page ? 'next' : 'prev');
                setPage(i);
              }}
              style={{
                ...dotStyle,
                background: i === page ? '#8a0303' : '#555',
                transform: i === page ? 'scale(1.35)' : 'scale(1)',
              }}
              aria-label={`${i + 1}ページ目へ`}
            />
          ))}
        </div>
      </div>

      <div className="button-row" style={buttonRowStyle}>
        {page > 0 ? (
          <Button onClick={goPrev} sub>
            戻る
          </Button>
        ) : (
          <div style={{ width: 112 }} />
        )}

        {!isLastPage ? (
          <Button onClick={goNext}>次へ</Button>
        ) : (
          <Button onClick={onBack}>裁きを始める</Button>
        )}
      </div>
    </div>
  );
}

function RuleSlide({
  title,
  subtitle,
  children,
  accent,
  direction,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent: string;
  direction: Direction;
}) {
  return (
    <section
      className="rule-slide"
      style={{
        ...slideStyle,
        borderColor: rgbaFromHex(accent, 0.6),
        boxShadow: `0 0 28px ${rgbaFromHex(accent, 0.16)}`,
        animation: direction === 'next' ? 'pageNext 0.35s ease' : 'pagePrev 0.35s ease',
      }}
    >
      <p style={{ ...labelStyle, color: accent }}>RULE FILE</p>
      <h2 style={titleStyle}>{title}</h2>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      <div style={{ marginTop: 28 }}>{children}</div>
    </section>
  );
}

function RoleSlide({
  title,
  catchCopy,
  points,
  accent,
  image,
  direction,
}: {
  title: string;
  catchCopy: string;
  points: string[];
  accent: string;
  image: string;
  direction: Direction;
}) {
  return (
    <section
      className="rule-slide role-slide"
      style={{
        ...slideStyle,
        borderColor: rgbaFromHex(accent, 0.6),
        boxShadow: `0 0 32px ${rgbaFromHex(accent, 0.28)}`,
        animation: direction === 'next' ? 'pageNext 0.35s ease' : 'pagePrev 0.35s ease',
        backgroundImage: `
          linear-gradient(90deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.46) 48%, rgba(5,5,5,0.18) 100%),
          url(${image})
        `,
        backgroundSize: 'cover',
        backgroundPosition: title === '市民' ? 'center 18%' : 'center right',
        backgroundBlendMode: 'overlay',
        overflow: 'hidden',
      }}
    >
      <div
        className="role-text-area"
        style={{
          ...roleTextAreaStyle,
          paddingTop: title === '市民' ? '18%' : undefined,
        }}
      >
        <p style={{ ...labelStyle, color: accent }}>ROLE</p>
        <h2 className="rule-title" style={{ ...titleStyle, color: accent }}>{title}</h2>
        <p style={catchStyle}>{catchCopy}</p>

        <div style={{ marginTop: 24 }}>
          {points.map((point, index) => (
            <div key={point} className="rule-point" style={pointStyle}>
              <span style={{ ...numberStyle, borderColor: accent, color: accent }}>
                {index + 1}
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ItemBox({
  name,
  desc,
  color,
  image,
}: {
  name: string;
  desc: string;
  color: string;
  image: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${rgbaFromHex(color, 0.5)}`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 18,
        background: 'rgba(255,255,255,0.03)',
        boxShadow: `0 0 18px ${rgbaFromHex(color, 0.12)}`,
      }}
    >
      <div
        className="item-image"
        style={{
          height: 150,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.85)',
        }}
      />

      <div style={{ padding: '16px' }}>
        <p
          style={{
            color,
            fontWeight: 'bold',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          {name}
        </p>

        <p
          style={{
            lineHeight: 1.7,
            opacity: 0.82,
            fontSize: 14,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function Flow() {
  const steps = [
    ['朝', '昨夜の結果を確認して話し合え'],
    ['ミニゲーム', '最下位は本名の一部が全体に公表され、一位はアイテムを得るものもいる'],
    ['追放', '投票で追放するプレイヤーを選べ'],
    ['夜', '自陣営の勝利のために行動しよう'],
  ];

  return (
    <div style={flowWrapStyle}>
      {steps.map(([title, desc], index) => (
        <div key={title} style={flowItemStyle}>
          <div style={flowCircleStyle}>{index + 1}</div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</p>
            <p style={{ opacity: 0.72, fontSize: 13 }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Button({
  children,
  onClick,
  sub,
}: {
  children: React.ReactNode;
  onClick: () => void;
  sub?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rule-button"
      style={{
        width: 112,
        padding: '14px 0',
        borderRadius: 10,
        border: sub ? '1px solid rgba(255,255,255,0.22)' : 'none',
        background: sub
          ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(90deg, #8a0303, #c40000)',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: sub ? 'none' : '0 8px 20px rgba(138, 3, 3, 0.22)',
      }}
    >
      {children}
    </button>
  );
}

function rgbaFromHex(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '28px 18px 24px',
  color: 'white',
  maxWidth: 620,
  margin: '0 auto',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const bookFrameStyle: React.CSSProperties = {
  perspective: 900,
};

const slideStyle: React.CSSProperties = {
  minHeight: 620,
  padding: '28px 22px',
  border: '1px solid',
  borderRadius: 18,
  background:
    'linear-gradient(180deg, rgba(18,18,18,0.96), rgba(5,5,5,0.96))',
  textAlign: 'left',
};

const roleTextAreaStyle: React.CSSProperties = {
  width: '60%',
  minHeight: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 2,
  fontWeight: 'bold',
  marginBottom: 12,
};

const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontFamily: 'serif',
  marginBottom: 10,
  lineHeight: 1.2,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 17,
  opacity: 0.82,
  lineHeight: 1.7,
};

const catchStyle: React.CSSProperties = {
  fontSize: 17,
  opacity: 0.9,
  lineHeight: 1.7,
  borderLeft: '3px solid rgba(255,255,255,0.2)',
  paddingLeft: 12,
};

const pointStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 16,
  lineHeight: 1.65,
};

const numberStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  border: '1px solid',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: 12,
  fontWeight: 'bold',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.8,
  opacity: 0.86,
};

const hintTextStyle: React.CSSProperties = {
  marginTop: 28,
  fontSize: 13,
  opacity: 0.5,
};

const flowWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const flowItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.055)',
};

const flowCircleStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: '#8a0303',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  flexShrink: 0,
};

const dotsStyle: React.CSSProperties = {
  marginTop: 18,
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
};

const dotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  border: 'none',
  padding: 0,
  transition: '0.2s',
};

const buttonRowStyle: React.CSSProperties = {
  marginTop: 26,
  display: 'flex',
  justifyContent: 'center',
  gap: 12,
};