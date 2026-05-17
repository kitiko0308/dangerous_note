type Props = {
  events: string[];
  onNext: () => void;
};

export default function MorningPhase({ events, onNext }: Props) {
  return (
    <div style={{ backgroundColor: '#2a2a4a', padding: 30, borderRadius: '8px' }}>
      <h3>🌅 朝フェーズ (夜明け)</h3>
      
      <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4 style={{ color: '#ff4444', marginTop: 0 }}>昨夜の出来事:</h4>
        <ul style={{ textAlign: 'left' }}>
          {events.map((event, i) => <li key={i}>{event}</li>)}
        </ul>
      </div>

      <p>【担当3】5分間の話し合いUI（タイマーなど）をここに実装します。</p>
      <button onClick={onNext} style={{ marginTop: '20px' }}>話し合いを終了してミニゲームへ</button>
    </div>
  );
}
