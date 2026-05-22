type Props = {
  events: string[];
  onNext: () => void;
};

export default function MorningPhase({ events, onNext }: Props) {
  return (
    <div className="dn-panel" style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
      <h1 className="title-logo" style={{ fontSize: '2.2rem', marginBottom: 8 }}>🌅 朝フェーズ</h1>
      <p className="title-sub" style={{ marginBottom: 8 }}>夜明けの報告</p>
      <p className="title-tagline" style={{ marginBottom: 18 }}>話し合いで真実を見抜き、次の行動を決めよう。</p>

      <div style={{ backgroundColor: 'rgba(0,0,0,0.28)', padding: 18, borderRadius: 8, marginBottom: 20, textAlign: 'left' }}>
        <h4 style={{ color: '#ff6b6b', marginTop: 0 }}>昨夜の出来事</h4>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {events.map((event, i) => <li key={i} style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>{event}</li>)}
        </ul>
      </div>

      <p style={{ color: 'var(--text-dim)', marginBottom: 18 }}>※ ここに5分間の話し合い用タイマーや補助UIを実装します。</p>

      <div className="title-menu" style={{ justifyContent: 'center' }}>
        <button type="button" className="title-menu__button title-menu__button--primary" onClick={onNext}>
          話し合いを終了してミニゲームへ
        </button>
      </div>
    </div>
  );
}
