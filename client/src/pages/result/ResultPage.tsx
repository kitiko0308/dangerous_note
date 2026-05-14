import type { GameResult, Player } from '../../types';

type Props = {
  result: GameResult;
  players: Player[];
  onBack: () => void;
};

export default function ResultPage({ result, players, onBack }: Props) {
  const isKiraWin = result === "kira_win";
  
  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', color: '#888', letterSpacing: '4px' }}>GAME OVER</h2>
      
      <div style={{ margin: '40px 0' }}>
        <h1 style={{ fontSize: '48px', color: isKiraWin ? '#ff4444' : '#44ff44', textShadow: '0 0 15px rgba(255,255,255,0.1)' }}>
          {isKiraWin ? "キラの勝利" : "L陣営の勝利"}
        </h1>
        <p style={{ marginTop: '10px', fontSize: '18px', color: '#ccc' }}>
          {isKiraWin ? "世界は新世界へと歩み始めた。" : "正義は勝つ。必ず。"}
        </p>
      </div>

      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>真実の記録</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {players.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: p.isAlive ? 'rgba(255,255,255,0.05)' : 'rgba(255,0,0,0.1)', borderRadius: '6px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold' }}>{p.nickname} <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>({p.realName})</span></div>
                <div style={{ fontSize: '12px', color: p.isAlive ? '#88ff88' : '#ff8888' }}>
                  {p.isAlive ? "● 生存" : "✖ 脱落"}
                </div>
              </div>
              <div style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                backgroundColor: p.role === 'kira' ? '#8a0303' : p.role === 'l' ? '#003366' : '#333',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {p.role === 'kira' ? 'キラ' : p.role === 'l' ? 'L' : '村人'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={onBack} 
        style={{ padding: '15px 40px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: '1px solid #666', borderRadius: '5px', width: '100%' }}
      >
        タイトルへ戻る
      </button>
    </div>
  );
}
