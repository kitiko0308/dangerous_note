import { useEffect, useRef, useState } from 'react';

type Props = {
  events: string[];
  onNext: () => void;
};

export default function MorningPhase({ events, onNext }: Props) {
  const TOTAL_SECONDS = 60 * 5; // 5分
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [isBlinkVisible, setIsBlinkVisible] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);
  const blinkRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // タイマー終了
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onNext]);

  useEffect(() => {
    if (secondsLeft <= 10) {
      if (blinkRef.current) return;

      blinkRef.current = window.setInterval(() => {
        setIsBlinkVisible(prev => !prev);
      }, 250);
      return () => {
        if (blinkRef.current) {
          clearInterval(blinkRef.current);
          blinkRef.current = null;
        }
        setIsBlinkVisible(true);
      };
    }

    setIsBlinkVisible(true);
    if (blinkRef.current) {
      clearInterval(blinkRef.current);
      blinkRef.current = null;
    }

    return undefined;
  }, [secondsLeft]);

  useEffect(() => {
    // コンポーネントがマウントされたときにタイマーをリセット
    setSecondsLeft(TOTAL_SECONDS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (blinkRef.current) {
        clearInterval(blinkRef.current);
        blinkRef.current = null;
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = (secondsLeft / TOTAL_SECONDS) * 100;

  return (
    <div className="dn-panel" style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
      <h1 className="title-logo" style={{ fontSize: '2.2rem', marginBottom: 8 }}>朝フェーズ</h1>
      <p className="title-sub" style={{ marginBottom: 48 }}>夜明けの報告</p>
      <p
        className="title-tagline"
        style={{
          marginTop: 24,
          marginBottom: 26,
          lineHeight: 1.9,
          fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
          letterSpacing: '0.08em',
        }}
      >
        <span style={{ display: 'block', fontSize: '1.18rem', fontWeight: 700 }}>夜が明けた。</span>
        <span style={{ display: 'block', fontSize: '1rem', fontWeight: 400 }}>真実を語る者は、まだ沈黙の中にいる。</span>
        <span
          style={{
            display: 'block',
            fontSize: '0.98rem',
            fontWeight: 300,
            color: secondsLeft < 30 ? '#ff5a5a' : 'inherit',
          }}
        >
          言葉の裏に潜む影を見抜け。
        </span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 18, marginBottom: 18 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: secondsLeft < 30 ? '#ff5a5a' : 'var(--text-main)',
            opacity: secondsLeft <= 10 ? (isBlinkVisible ? 1 : 0.2) : 1,
            transition: secondsLeft <= 10 ? 'opacity 0.08s linear' : 'color 0.2s ease',
          }}
        >
          {formatTime(secondsLeft)}
        </div>
        <div style={{ width: '100%', maxWidth: 420, height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--kira-red)', borderRadius: 6 }} />
        </div>
        {/* 一時停止ボタンは削除（タイマーは自動で動作） */}
      </div>

      <div style={{ backgroundColor: 'rgba(0,0,0,0.28)', padding: 18, borderRadius: 8, marginTop: 44, marginBottom: 20, textAlign: 'left' }}>
        <h4 style={{ color: '#ff6b6b', marginTop: 0 }}>昨夜の出来事</h4>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {events.map((event, i) => <li key={i} style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>{event}</li>)}
        </ul>
      </div>

      

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120, marginTop: 6 }}>
        <button
          type="button"
          className="title-menu__button title-menu__button--primary"
          onClick={onNext}
          style={{ padding: '8px 14px', fontSize: '1rem', borderRadius: 6, justifySelf: 'center', minWidth: 180 }}
        >
          話し合いを終了してミニゲームへ
        </button>
      </div>
    </div>
  );
}
