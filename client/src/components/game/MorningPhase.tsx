import { useEffect, useRef, useState } from 'react';

type Props = {
  events: string[];
  onNext: () => void;
};

export default function MorningPhase({ events, onNext }: Props) {
  const TOTAL_SECONDS = 60 * 5; // 5分
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const intervalRef = useRef<number | null>(null);

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
    // コンポーネントがマウントされたときにタイマーをリセット
    setSecondsLeft(TOTAL_SECONDS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
      <p className="title-sub" style={{ marginBottom: 8 }}>夜明けの報告</p>
      <p className="title-tagline" style={{ marginBottom: 18 }}>話し合いで真実を見抜き、次の行動を決めよう。</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-main)' }}>{formatTime(secondsLeft)}</div>
        <div style={{ width: '100%', maxWidth: 420, height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--kira-red)', borderRadius: 6 }} />
        </div>
        {/* 一時停止ボタンは削除（タイマーは自動で動作） */}
      </div>

      <div style={{ backgroundColor: 'rgba(0,0,0,0.28)', padding: 18, borderRadius: 8, marginBottom: 20, textAlign: 'left' }}>
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
