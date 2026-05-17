import type { Player } from '../../../types';

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void;
};

export default function SampleGame({ players, onFinish }: Props) {
  const alivePlayers = players.filter(p => p.isAlive);

  const handleDummyFinish = () => {
    const dummyRanking = alivePlayers.map(p => p.id);
    onFinish(dummyRanking);
  };

  return (
    <div style={{ backgroundColor: '#2a4a2a', padding: 30, borderRadius: '8px', textAlign: 'center' }}>
      <h3>🎮 ミニゲーム：サンプルゲーム3</h3>
      
      <div style={{ margin: '20px 0', padding: '10px', backgroundColor: '#111', borderRadius: '5px' }}>
        <p style={{ color: '#aaa', marginBottom: '10px' }}>【今回の参加者】</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {alivePlayers.map(p => (
            <span key={p.id} style={{ padding: '5px 10px', backgroundColor: '#444', borderRadius: '15px' }}>
              {p.nickname}
            </span>
          ))}
        </div>
      </div>

      <p style={{ marginTop: '10px', color: '#aaa' }}>
        【担当2】ここにミニゲーム3の実装を書いてください。
      </p>
      
      <button 
        onClick={handleDummyFinish} 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: '#4cafa2',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        ゲームクリア（結果フェーズへ進む）
      </button>
    </div>
  );
}
