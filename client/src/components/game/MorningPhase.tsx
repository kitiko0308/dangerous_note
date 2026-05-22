import { useEffect, useRef, useState } from 'react';
import asaImage from '../../assets/img/asa.png';

type Props = {
  events: string[];
  onNext: () => void;
};

export default function MorningPhase({ events, onNext }: Props) {
  const TOTAL_SECONDS = 60 * 5; // 5分
  const INTRO_SECONDS = 5;
  const [showMorningPhase, setShowMorningPhase] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [isBlinkVisible, setIsBlinkVisible] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);
  const blinkRef = useRef<number | null>(null);
  const introRef = useRef<number | null>(null);

  useEffect(() => {
    if (introRef.current) return;

    introRef.current = window.setTimeout(() => {
      setShowMorningPhase(true);
      introRef.current = null;
    }, INTRO_SECONDS * 1000);

    return () => {
      if (introRef.current) {
        clearTimeout(introRef.current);
        introRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showMorningPhase) return;
    if (intervalRef.current) return;

    setSecondsLeft(TOTAL_SECONDS);

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
  }, [onNext, showMorningPhase]);

  useEffect(() => {
    if (!showMorningPhase) return;

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
  }, [secondsLeft, showMorningPhase]);

  useEffect(() => {
    if (!showMorningPhase) return;

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
  }, [showMorningPhase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = (secondsLeft / TOTAL_SECONDS) * 100;

  if (!showMorningPhase) {
    return (
      <div
        className="dn-panel"
        style={{
          maxWidth: 740,
          margin: '0 auto',
          textAlign: 'center',
          minHeight: 520,
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <img
          src={asaImage}
          alt="朝の背景画像"
          style={{
            display: 'block',
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="dn-panel"
      style={{
        maxWidth: 740,
        margin: '0 auto',
        textAlign: 'center',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.56)), url(${asaImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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

      <div
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.26))',
          border: '1px solid rgba(214, 204, 188, 0.22)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 12px 24px rgba(0,0,0,0.25)',
          padding: 18,
          borderRadius: 10,
          marginTop: 44,
          marginBottom: 20,
          textAlign: 'left',
        }}
      >
        <h4
          style={{
            color: '#e8ded1',
            marginTop: 0,
            marginBottom: 12,
            letterSpacing: '0.12em',
            fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
            fontWeight: 500,
            borderBottom: '1px solid rgba(232, 222, 209, 0.2)',
            paddingBottom: 8,
          }}
        >
          昨夜の出来事
        </h4>
        <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none' }}>
          {events.map((event, i) => (
            <li
              key={i}
              style={{
                color: '#efe7db',
                lineHeight: 1.8,
                letterSpacing: '0.04em',
                fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                paddingLeft: 14,
                position: 'relative',
                marginBottom: 6,
              }}
            >
              <span style={{ position: 'absolute', left: 0, color: 'rgba(239, 231, 219, 0.72)' }}>◇</span>
              {event}
            </li>
          ))}
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
