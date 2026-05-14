import { useRef, useState } from 'react';

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
    <FadeSlide key="title" direction={direction}>
      <h2 style={titleStyle}>この世界のルール</h2>
      <p style={subText}>名前を知られた者は、消える。</p>
    </FadeSlide>,

    <FadeSlide key="kira" direction={direction}>
      <Card title="キラ" color="#8a0303">
        正体を隠しながら、全員を消し去れ。
      </Card>
    </FadeSlide>,

    <FadeSlide key="l" direction={direction}>
      <Card title="L陣営" color="#2f6fff">
        会議でキラを見つけ出し、追放せよ。
      </Card>
    </FadeSlide>,

    <FadeSlide key="flow" direction={direction}>
      <h3 style={flowTitle}>ゲームの流れ</h3>
      <div style={flowStyle}>
        <Step title="朝" desc="ミニゲーム" />
        <Arrow />
        <Step title="会議" desc="追放" />
        <Arrow />
        <Step title="夜" desc="キラ行動" />
      </div>
      <p style={subTextSmall}>朝は競い、昼は疑い、夜は誰かが消える。</p>
    </FadeSlide>,

    <FadeSlide key="end" direction={direction}>
      <h2 style={titleStyle}>準備はいい？</h2>
      <p style={subText}>疑え。それが生き残る唯一の方法。</p>
    </FadeSlide>,
  ];

  const isLastPage = page === pages.length - 1;

  const goNext = () => {
    setDirection('next');
    setPage((current) => Math.min(current + 1, pages.length - 1));
  };

  const goPrev = () => {
    setDirection('prev');
    setPage((current) => Math.max(current - 1, 0));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    setDragX(currentX - touchStartX.current);
  };

  const resetDragState = () => {
    setDragX(0);
    touchStartX.current = null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 70;

    if (diff > threshold && page > 0) {
      goPrev();
    } else if (diff < -threshold && page < pages.length - 1) {
      goNext();
    }

    resetDragState();
  };

  const handleTouchCancel = () => {
    resetDragState();
  };

  const limitedDrag =
    (page === 0 && dragX > 0) || (page === pages.length - 1 && dragX < 0)
      ? dragX * 0.3
      : dragX;

  return (
    <div
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <style>{`
        @keyframes fadeSlideInRight {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .rule-button {
          transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .rule-button:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={contentStyle}>
        <div
          style={{
            minHeight: '300px',
            transform: `translateX(${limitedDrag}px) scale(${touchStartX.current !== null ? 0.97 : 1})`,
            transition: touchStartX.current !== null ? 'none' : '0.3s',
          }}
        >
          {pages[page]}
        </div>

        <div style={{ marginTop: '24px' }}>
          {pages.map((_, i) => (
            <span
              key={i}
              onClick={() => {
                setDirection(i > page ? 'next' : 'prev');
                setPage(i);
              }}
              style={{
                ...dotStyle,
                cursor: 'pointer',
                background: i === page ? '#8a0303' : '#555',
                transform: i === page ? 'scale(1.3)' : 'scale(1)',
                transition: '0.2s',
              }}
            />
          ))}
        </div>
      </div>

      <div style={buttonRow}>
        {page > 0 ? (
          <Button onClick={goPrev} sub>
            戻る
          </Button>
        ) : (
          <div style={{ width: 120 }} />
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

function FadeSlide({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: Direction;
}) {
  return (
    <div
      style={{
        animation:
          direction === 'next'
            ? 'fadeSlideInRight 0.35s ease'
            : 'fadeSlideInLeft 0.35s ease',
      }}
    >
      {children}
    </div>
  );
}

function Card({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: rgbaFromHex(color, 0.14),
        border: `1px solid ${color}`,
        borderRadius: '14px',
        padding: '26px',
        textAlign: 'left',
        boxShadow: `0 0 20px ${rgbaFromHex(color, 0.2)}`,
      }}
    >
      <h3 style={{ color, marginBottom: '14px', fontSize: '22px' }}>{title}</h3>
      <p style={{ lineHeight: 1.9, fontSize: '16px' }}>{children}</p>
    </div>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{title}</p>
      <p style={{ opacity: 0.7 }}>{desc}</p>
    </div>
  );
}

function Arrow() {
  return <div style={{ opacity: 0.4 }}>→</div>;
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
        padding: '14px 50px',
        borderRadius: '8px',
        border: sub ? '1px solid #555' : 'none',
        background: sub
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(90deg,#8a0303,#c40000)',
        color: 'white',
        cursor: 'pointer',
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
  padding: '60px 20px',
  color: 'white',
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  borderBottom: '2px solid #8a0303',
  paddingBottom: '10px',
  display: 'inline-block',
};

const subText: React.CSSProperties = {
  opacity: 0.75,
  marginTop: '20px',
  fontSize: '18px',
};

const subTextSmall: React.CSSProperties = {
  opacity: 0.6,
  marginTop: '20px',
  fontSize: '14px',
};

const flowTitle: React.CSSProperties = {
  marginBottom: '24px',
  color: '#8a0303',
  fontSize: '24px',
};

const flowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const dotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  margin: '0 5px',
  borderRadius: '999px',
};

const buttonRow: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: '40px',
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  alignItems: 'center',
};