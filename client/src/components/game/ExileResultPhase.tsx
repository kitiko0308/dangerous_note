import type { Player } from '../../types';

type Props = {
  exiledPlayerId: number | null; // nullなら追放なし
  players: Player[];
  onNext: () => void;
};

export default function ExileResultPhase({ exiledPlayerId, players, onNext }: Props) {
  const exiledPlayer = exiledPlayerId !== null ? players.find(p => p.id === exiledPlayerId) : null;

  return (
    <div style={{ backgroundColor: '#000', padding: 30, borderRadius: '8px', border: '2px solid #8a0303', textAlign: 'center' }}>
      <h3 style={{ fontSize: '24px', color: '#ff4444' }}>追放結果発表</h3>
      
      <div style={{ margin: '40px 0' }}>
        {exiledPlayer ? (
          <>
            <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>{exiledPlayer.nickname}</h1>
            <p style={{ fontSize: '20px' }}>が追放されました。</p>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#222' }}>
              <p style={{ color: '#aaa' }}>その正体は...</p>
              <h2 style={{ fontSize: '32px', color: exiledPlayer.role === 'kira' ? '#ff4444' : '#44ff44' }}>
                {exiledPlayer.role === 'kira' ? 'キラでした！' : 'キラではありませんでした。'}
              </h2>
            </div>
          </>
        ) : (
          <h2 style={{ fontSize: '32px' }}>今回は誰も追放されませんでした。</h2>
        )}
      </div>

      <div style={{ border: '1px solid #444', padding: '15px', marginBottom: '20px' }}>
        <p>【担当2】ここにドラマチックな追放演出を実装してください。</p>
      </div>

      <button onClick={onNext} style={{ padding: '15px 30px', backgroundColor: '#8a0303', color: 'white', border: 'none', cursor: 'pointer' }}>
        次へ進む
      </button>
    </div>
  );
}
