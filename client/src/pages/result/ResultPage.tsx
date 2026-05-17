import React from 'react';
import type { GameResult, Player } from '../../types';
import kekkahaikei from '../../assets/img/kekkahaikei.png';
import lImg from '../../assets/img/L_hito.png';
import kiraImg from '../../assets/img/kira_hito.png';
import siminImg from '../../assets/img/siminn_hito.png';

/* ===== 型定義 ===== */
export type PlayerData = { name: string; nickname: string; role: string; alive: boolean };
export type ResultData = {
  winner: string; turn: number; survivors: number; executed: number;
  destroyedKira: boolean; players: PlayerData[];
};
type Props = { resultData?: ResultData; result?: GameResult; players?: Player[]; onBack?: () => void };

/* ===== メインコンポーネント ===== */
export default function ResultPage({ resultData, result, players, onBack }: Props) {
  const data: ResultData = resultData || {
    winner: result === 'kira_win' ? 'キラ' : 'L',
    turn: 4,
    survivors: players?.filter(p => p.isAlive).length ?? 4,
    executed: players?.filter(p => !p.isAlive).length ?? 1,
    destroyedKira: result !== 'kira_win',
    players: players?.map(p => ({
      name: p.realName || 'Unknown', nickname: p.nickname || '-',
      role: p.role === 'kira' ? 'キラ' : p.role === 'l' ? 'L' : '市民', alive: p.isAlive,
    })) || [
      { name: 'S', nickname: 'ss', role: 'L', alive: true },
      { name: 'd', nickname: 'dd', role: '市民', alive: true },
      { name: 'f', nickname: 'ff', role: '市民', alive: true },
      { name: 'g', nickname: 'gg', role: '市民', alive: true },
      { name: 'a', nickname: 'aa', role: 'キラ', alive: false },
    ],
  };

  const kira = data.winner === 'キラ' || data.winner === 'Kira' || data.winner === 'kira_win';

  // 各役職の生存状況を取得
  const lPlayer = data.players.find(p => p.role === 'L');
  const citizenPlayers = data.players.filter(p => p.role === '市民');
  const kiraPlayer = data.players.find(p => p.role === 'キラ');
  const lAlive = lPlayer?.alive ?? false;
  const citizensAlive = citizenPlayers.filter(p => p.alive);

  // 市民陣営勝利時：生存状況に応じて表示キャラを決定
  // L単独生存 → L表示 / 市民のみ生存 → 市民表示 / 両方生存 → ランダム
  const [showCitizen] = React.useState(() => {
    if (kira) return false;
    if (lAlive && citizensAlive.length === 0) return false;   // Lだけ生存
    if (!lAlive && citizensAlive.length > 0) return true;     // 市民だけ生存
    return Math.random() < 0.5;                               // 両方生存→ランダム
  });
  // テーマカラー：キラ→赤、L→青、市民→緑
  const ac = kira ? '#dc2626' : (showCitizen ? '#22c55e' : '#3b82f6');
  const ac2 = kira ? '#ef4444' : (showCitizen ? '#4ade80' : '#60a5fa');
  const fx = kira
    ? { ring: '220,38,38', fog: '153,27,27', glow: '248,113,113', center: '255,240,240' }
    : showCitizen
      ? { ring: '34,197,94', fog: '21,128,61', glow: '134,239,172', center: '236,253,245' }
      : { ring: '59,130,246', fog: '30,64,175', glow: '147,197,253', center: '239,246,255' };

  // 表示するキャラクター情報を決定
  const portrait = kira ? kiraImg : (showCitizen ? siminImg : lImg);
  const charLabel = kira ? 'キラ' : (showCitizen ? '市民' : 'L');
  const title = kira ? 'キラ陣営の勝利' : '市民陣営の勝利';
  const sub = kira ? '計画通り。俺は新世界の神となる。' : showCitizen ? '恐怖は終わった。真実が勝利した。' : '正義は勝つ。必ず。';
  const qA = kira ? '疑う者、逆らう者は全て排除した。' : showCitizen ? '終わらないと思われた悪夢は、静かに幕を閉じた。' : '張り巡らせた推理は、ついにキラへ辿り着いた。';
  const qB = kira ? '理想の新世界が幕を開ける。' : showCitizen ? '信じる意志は、最後まで消えなかった。' : 'その瞳は、最後まで真実を見逃さなかった。';

  const stats = [
    { l: 'ターン数', v: `${data.turn}ターン` },
    { l: '生存者', v: `${data.survivors}名` },
    { l: '処刑されたプレイヤー', v: `${data.executed}名` },
    { l: 'キラの撃破', v: data.destroyedKira ? '成功' : '失敗', c: data.destroyedKira ? ac : '#dc2626' },
    { l: 'ゲーム結果', v: title, c: ac },
  ];

  const roleColor = (r: string) =>
    r === 'キラ' ? { bg: '#3f0008', border: '#dc2626', color: '#fca5a5' }
    : r === 'L' ? { bg: '#001a33', border: '#3b82f6', color: '#93c5fd' }
    : { bg: '#0a1a0a', border: '#22c55e', color: '#86efac' };

  // タイトルボタンのホバー発光色を決定
  // キラ勝利→赤、L勝利→青、市民勝利→緑
  const btnGlowColor = kira ? '#dc2626' : (charLabel === 'L' ? '#3b82f6' : '#22c55e');
  const portraitTitleSize = charLabel === '市民' ? 36 : 48;
  const portraitNickLabelSize = 10;
  const portraitNickValueSize = kira ? 18 : showCitizen ? 16 : 18;

  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: '#e5e5e5', position: 'relative', overflow: 'hidden', fontFamily: '"Noto Serif JP","Yu Mincho","Hiragino Mincho ProN",serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&display=swap');
        @keyframes rFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rPulse{0%,100%{opacity:.4}50%{opacity:.7}}
        .r-fade{animation:rFadeUp .8s ease-out both}
        .r-scr::-webkit-scrollbar{width:5px}
        .r-scr::-webkit-scrollbar-track{background:rgba(0,0,0,.3);border-radius:3px}
        .r-scr::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
        .r-back-btn{transition:border-color .25s ease,box-shadow .25s ease,background .25s ease}
        .r-back-btn:hover{border-color:var(--glow)!important;box-shadow:0 0 8px var(--glow)!important;background:rgba(255,255,255,.06)!important}
      `}</style>

      {/* 背景 */}
      <div style={{ position:'absolute',inset:0,backgroundImage:`url(${kekkahaikei})`,backgroundSize:'cover',backgroundPosition:'center',opacity:.15 }} />
      <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse at center,rgba(38,38,38,.24) 0%, rgba(14,14,14,.16) 38%, transparent 60%, #000 88%)` }} />

      {/* ヒビ割れSVG */}
      <svg style={{ position:'absolute',top:0,right:0,width:'45%',height:'45%',pointerEvents:'none',zIndex:1,opacity:.5 }} viewBox="0 0 200 200">
        <g stroke="rgba(255,255,255,.18)" fill="none" strokeLinecap="round">
          <path d="M200,0 L170,30 L175,50 L140,80" strokeWidth="0.8"/>
          <path d="M170,30 L155,15" strokeWidth="0.6"/>
          <path d="M175,50 L190,70" strokeWidth="0.5"/>
          <path d="M200,15 L180,40 L165,65" strokeWidth="0.4"/>
        </g>
      </svg>

      {/* 魔法陣風リング */}
      <div style={{ position:'absolute',left:'50%',top:'48%',transform:'translate(-50%,-50%)',width:620,height:620,pointerEvents:'none',opacity:.1,animation:'rPulse 4s ease-in-out infinite' }}>
        {[0,36,94].map((v,i)=><div key={i} style={{ position:'absolute',inset:v,borderRadius:'50%',border:`1px solid rgba(${fx.ring},.36)` }}/>) }
      </div>

      {/* 中央の霧と光 */}
      <div style={{ position:'absolute',left:'50%',top:'42%',transform:'translate(-50%,-50%)',width:'70vw',maxWidth:980,height:430,pointerEvents:'none',background:`radial-gradient(ellipse at center, rgba(${fx.ring},.22) 0%, rgba(${fx.fog},.13) 34%, rgba(0,0,0,0) 72%)` }} />
      <div style={{ position:'absolute',left:'50%',top:'38%',transform:'translate(-50%,-50%)',width:500,height:220,pointerEvents:'none',background:`radial-gradient(ellipse at center, rgba(${fx.glow},.12) 0%, rgba(0,0,0,0) 72%)` }} />

      {/* 中央の視認性を少し持ち上げる */}
      <div style={{ position:'absolute',left:'50%',top:'55%',transform:'translate(-50%,-50%)',width:'76vw',maxWidth:1120,height:'70vh',pointerEvents:'none',background:`radial-gradient(ellipse at center, rgba(${fx.center},.07) 0%, rgba(${fx.center},.03) 26%, rgba(0,0,0,0) 66%)` }} />

      {/* コンテンツ */}
      <div style={{ position:'relative',zIndex:10,minHeight:'100vh',display:'flex',flexDirection:'column' }}>

        {/* ヘッダー */}
        <header className="r-fade" style={{ textAlign:'center',paddingTop:18,paddingBottom:8 }}>
          <p style={{ fontSize:10,letterSpacing:'.5em',color:'#6b7280',margin:0 }}>DANGEROUS NOTE</p>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:4 }}>
            <span style={{ width:28,height:1,background:'#4b5563' }}/>
            <span style={{ fontSize:11,letterSpacing:'.4em',color:'#9ca3af' }}>GAME OVER</span>
            <span style={{ width:28,height:1,background:'#4b5563' }}/>
          </div>
        </header>

        {/* メインレイアウト */}
        <div className="r-fade" style={{ flex:1,display:'flex',flexWrap:'wrap',gap:10,padding:'12px 20px 24px',maxWidth:1320,margin:'0 auto',width:'100%',alignItems:'stretch' }}>

          {/* 左: キャラクター */}
          <div style={{ width:332,flexShrink:0,order:1 }} className="r-portrait-col">
            <div style={{ height:'100%',minHeight:560,border:'1px solid rgba(255,255,255,.12)',background:'rgba(0,0,0,.75)',padding:6,display:'flex',flexDirection:'column',boxShadow:`0 0 34px ${ac}2b`,position:'relative' }}>
              {/* 四隅装飾 */}
              {['top-left','top-right','bottom-left','bottom-right'].map((pos,i)=>{
                const [v,h] = pos.split('-');
                return <div key={i} style={{ position:'absolute',[v]:0,[h]:0,width:10,height:10,
                  [`border${v==='top'?'Top':'Bottom'}`]:'1px solid rgba(255,255,255,.3)',
                  [`border${h==='left'?'Left':'Right'}`]:'1px solid rgba(255,255,255,.3)' }}/>;
              })}
              <div style={{ flex:1,position:'relative',overflow:'hidden',background:'#080808',border:'1px solid rgba(255,255,255,.05)' }}>
                {/* キャラ画像：上半身を表示 */}
                <img src={portrait} alt={charLabel} style={{ position:'absolute',top:showCitizen ? '-1%' : '-2%',left:showCitizen ? '-13%' : '-14%',width:showCitizen ? '126%' : '128%',height:showCitizen ? '126%' : '128%',objectFit:'contain',objectPosition:'center top' }}/>
                {/* 下部グラデーション */}
                <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top, #000 0%, rgba(0,0,0,.7) 25%, rgba(0,0,0,.2) 50%, transparent 70%)' }}/>
                {/* キャラ情報 */}
                <div style={{ position:'absolute',bottom:0,left:0,right:0,textAlign:'center',paddingBottom:16,zIndex:2 }}>
                  <div style={{ fontSize: portraitTitleSize,fontWeight:900,textShadow:`0 0 24px ${ac}aa, 0 2px 8px rgba(0,0,0,.9)`,marginBottom:4,lineHeight:1 }}>{charLabel}</div>
                  <div style={{ fontSize:portraitNickLabelSize,letterSpacing:'.3em',color:'#9ca3af',marginBottom:2 }}>ニックネーム</div>
                  {kira ? (
                    <div style={{ fontSize:portraitNickValueSize,letterSpacing:'.1em',color:'#fff',fontWeight:500 }}>{kiraPlayer?.nickname || 'キラ'}</div>
                  ) : showCitizen ? (
                    <div style={{ fontSize:portraitNickValueSize - 1,letterSpacing:'.1em',color:'#fff',fontWeight:500,lineHeight:1.6 }}>
                      {citizenPlayers.map((cp, i) => (
                        <span key={i}>{cp.nickname}{i < citizenPlayers.length - 1 ? '、' : ''}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:portraitNickValueSize,letterSpacing:'.1em',color:'#fff',fontWeight:500 }}>{lPlayer?.nickname || 'L'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 中央: 結果 */}
          <div style={{ flex:1,minWidth:320,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',order:2,paddingTop:10 }} className="r-result-col">

            {/* 勝利タイトル */}
            <div style={{ textAlign:'center',width:'100%',marginTop:14,marginBottom:28 }}>
              <h1 style={{ fontSize:'clamp(2.35rem,7.8vw,4.2rem)',fontWeight:900,lineHeight:1.12,margin:'0 0 12px',
                background:'linear-gradient(180deg,#fff 0%,#ccc 40%,#ddd 60%,#888 100%)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                filter:`drop-shadow(0 0 26px ${ac}99)` }}>
                {title}
              </h1>
              <p style={{ fontSize:'clamp(.9rem,2.6vw,1.15rem)',letterSpacing:'.28em',color:ac2,margin:0,textShadow:'0 2px 10px rgba(0,0,0,.88)' }}>{sub}</p>
            </div>

            <div className="r-mobile-portrait" style={{ display:'none',width:'100%',maxWidth:610,border:'1px solid rgba(255,255,255,.12)',background:'rgba(0,0,0,.76)',padding:6,marginBottom:16,boxShadow:`0 0 30px ${ac}24`,position:'relative' }}>
              <div style={{ position:'relative',overflow:'hidden',background:'#080808',border:'1px solid rgba(255,255,255,.05)',height:360 }}>
                <img src={portrait} alt={charLabel} style={{ position:'absolute',top:showCitizen ? '-1%' : '-2%',left:showCitizen ? '-11%' : '-12%',width:showCitizen ? '122%' : '124%',height:showCitizen ? '122%' : '124%',objectFit:'contain',objectPosition:'center top' }}/>
                <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top, #000 0%, rgba(0,0,0,.66) 24%, rgba(0,0,0,.18) 48%, transparent 72%)' }}/>
                <div style={{ position:'absolute',bottom:0,left:0,right:0,textAlign:'center',paddingBottom:14,zIndex:2 }}>
                  <div style={{ fontSize:portraitTitleSize + 2,fontWeight:900,textShadow:`0 0 24px ${ac}aa, 0 2px 8px rgba(0,0,0,.9)`,marginBottom:4,lineHeight:1 }}>{charLabel}</div>
                  <div style={{ fontSize:portraitNickLabelSize,letterSpacing:'.3em',color:'#9ca3af',marginBottom:2 }}>ニックネーム</div>
                  {kira ? (
                    <div style={{ fontSize:portraitNickValueSize,letterSpacing:'.1em',color:'#fff',fontWeight:500 }}>{kiraPlayer?.nickname || 'キラ'}</div>
                  ) : showCitizen ? (
                    <div style={{ fontSize:portraitNickValueSize - 1,letterSpacing:'.1em',color:'#fff',fontWeight:500,lineHeight:1.6 }}>
                      {citizenPlayers.map((cp, i) => (
                        <span key={i}>{cp.nickname}{i < citizenPlayers.length - 1 ? '、' : ''}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:portraitNickValueSize,letterSpacing:'.1em',color:'#fff',fontWeight:500 }}>{lPlayer?.nickname || 'L'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 最終記録 */}
            <div style={{ width:'100%',maxWidth:610,border:'1px solid rgba(255,255,255,.1)',background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)',padding:'20px 24px',marginBottom:16,position:'relative',boxShadow:`0 0 18px ${ac}14` }}>
              <h2 style={{ textAlign:'center',fontSize:14,letterSpacing:'.2em',color:'#9ca3af',borderBottom:'1px solid rgba(255,255,255,.08)',paddingBottom:12,marginTop:0,marginBottom:10 }}>最終記録</h2>
              {stats.map((s,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'8px 0',borderBottom:i<stats.length-1?'1px solid rgba(255,255,255,.06)':'none' }}>
                  <span style={{ color:'#9ca3af',fontSize:14,letterSpacing:'.15em' }}>{s.l}</span>
                  <span style={{ fontSize:15,fontWeight:600,letterSpacing:'.1em',color:s.c||'#e5e5e5' }}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* プレイヤー一覧 */}
            <div style={{ width:'100%',maxWidth:610,border:'1px solid rgba(255,255,255,.1)',background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)',padding:'20px 20px',marginBottom:16,position:'relative',boxShadow:`0 0 18px ${ac}10` }}>
              <h2 style={{ textAlign:'center',fontSize:14,letterSpacing:'.2em',color:'#9ca3af',borderBottom:'1px solid rgba(255,255,255,.08)',paddingBottom:12,marginTop:0,marginBottom:10 }}>プレイヤー一覧</h2>
              <div className="r-scr" style={{ maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:10 }}>
                {data.players.map((p,i)=>{
                  const rc = roleColor(p.role);
                  return (
                    <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 15px',borderRadius:12,background:p.alive?'rgba(255,255,255,.03)':'rgba(127,29,29,.15)',border:`1px solid ${p.alive?'rgba(255,255,255,.05)':'rgba(127,29,29,.2)'}`,boxShadow:'0 0 16px rgba(220,38,38,.12)' }}>
                      <div>
                        <div style={{ display:'flex',alignItems:'baseline',gap:8 }}>
                          <span style={{ fontWeight:700,fontSize:15,color:'#e5e5e5' }}>{p.name}</span>
                          <span style={{ fontSize:12,color:'#6b7280' }}>({p.nickname})</span>
                        </div>
                        <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:6 }}>
                          <span style={{ fontSize:11,color:p.alive?'#34d399':'#f87171' }}>{p.alive?'●':'✕'}</span>
                          <span style={{ fontSize:12,letterSpacing:'.15em',color:p.alive?'rgba(52,211,153,.8)':'rgba(248,113,113,.8)' }}>{p.alive?'生存':'処刑'}</span>
                        </div>
                      </div>
                      <span style={{ padding:'4px 0',borderRadius:4,fontSize:12,fontWeight:700,letterSpacing:'.1em',background:rc.bg,border:`1px solid ${rc.border}66`,color:rc.color,minWidth:48,textAlign:'center',display:'inline-block' }}>{p.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* フレーバーテキスト */}
            <div style={{ width:'100%',maxWidth:610,border:'1px solid rgba(255,255,255,.1)',background:'rgba(0,0,0,.4)',padding:'18px 22px',textAlign:'center',marginBottom:20,position:'relative' }}>
              <p style={{ fontSize:14,color:'#d1d5db',letterSpacing:'.15em',lineHeight:1.8,margin:0 }}>{qA}</p>
              <p style={{ fontSize:14,fontWeight:700,letterSpacing:'.15em',color:ac2,margin:'4px 0 0' }}>{qB}</p>
            </div>

            {/* ボタン */}
            <div style={{ width:'100%',maxWidth:610 }}>
              <button className="r-back-btn" onClick={onBack} style={{ '--glow': btnGlowColor, width:'100%',padding:'14px 8px',border:`1px solid ${ac}44`,background:`${ac}10`,color:'#fff',fontSize:14,letterSpacing:'.2em',cursor:'pointer',fontFamily:'inherit' } as React.CSSProperties}>
                タイトルへ戻る
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* レスポンシブ */}
      <style>{`
        @media(min-width:1025px) and (max-width:1440px){
          .r-fade{transform:translateX(16px)}
          .r-portrait-col{margin-top:54px!important;transform:translateX(70px)}
          .r-result-col{transform:translateX(12px)}
        }
        @media(min-width:1025px) and (max-width:1240px){
          .r-fade{transform:none}
          .r-portrait-col{margin-top:46px!important;transform:translateX(28px)}
          .r-result-col{transform:none}
        }
        @media(min-width:1441px){
          .r-fade{transform:translateX(30px)}
          .r-portrait-col{margin-top:54px!important;transform:translateX(110px)}
          .r-result-col{transform:translateX(24px)}
        }
        @media(max-width:1024px){
          .r-portrait-col{width:100%!important;max-width:560px;margin:0 auto;order:unset!important}
          .r-portrait-col>div{min-height:380px!important}
        }
        @media(max-width:860px){
          .r-portrait-col{display:none!important}
          .r-result-col{width:100%!important;min-width:0!important;order:1!important;padding-top:6px!important}
          .r-mobile-portrait{display:block!important}
        }
        @media(max-width:480px){
          .r-mobile-portrait{padding:5px!important}
          .r-mobile-portrait > div{height:320px!important}
        }
      `}</style>
    </div>
  );
}
