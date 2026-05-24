import { useEffect, useState } from "react";
import SampleGame from "./minigames/SampleGame";
import SampleGame2 from "./minigames/SampleGame2";
import SampleGame3 from "./minigames/SampleGame3";
import SampleGame4 from "./minigames/SampleGame4";
import type { Player } from "../../types";
import minigameBg from "../../assets/img/gamehaikei.png";

type MiniGameResults = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onNext: (results?: MiniGameResults) => void;
  gamePlayCounts: Record<number, number>;
  onGamePlayed: (gameIndex: number) => void;
};

const ALL_GAME_INDICES = [0, 1, 2, 3];

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function getAvailableGameIndices(): number[] {
  if (isMobileDevice()) return ALL_GAME_INDICES;
  return ALL_GAME_INDICES.filter((i) => i !== 1);
}

function selectGameIndex(playCounts: Record<number, number>): number {
  const available = getAvailableGameIndices();
  const counts = available.map((i) => playCounts[i] ?? 0);
  const minCount = Math.min(...counts);
  const candidates = available.filter((i) => (playCounts[i] ?? 0) === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function MiniGamePhase({ players, onNext, gamePlayCounts, onGamePlayed }: Props) {
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(
    () => selectGameIndex(gamePlayCounts),
  );

  useEffect(() => {
    setSelectedGameIndex(selectGameIndex(gamePlayCounts));
  }, [gamePlayCounts]);

  const handleFinish = (results: number[] | MiniGameResults) => {
    onGamePlayed(selectedGameIndex);
    if (Array.isArray(results)) {
      onNext({ rankingIds: results, taps: {} });
    } else {
      onNext(results);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />

      <div style={contentStyle}>
        <p style={labelStyle}>MINI GAME</p>

        <h1 style={titleStyle}>ミニゲームフェーズ</h1>

        <div style={gameCardStyle}>
          {selectedGameIndex === 0 && (
            <SampleGame players={players} onFinish={(results) => handleFinish(results)} />
          )}
          {selectedGameIndex === 1 && (
            <SampleGame2 players={players} onFinish={(rankingIds) => handleFinish(rankingIds)} />
          )}
          {selectedGameIndex === 2 && (
            <SampleGame3 players={players} onFinish={(rankingIds) => handleFinish(rankingIds)} />
          )}
          {selectedGameIndex === 3 && (
            <SampleGame4 players={players} onFinish={(results) => handleFinish(results)} />
          )}
        </div>
      </div>
    </div>
  );
}

const serifFont =
  'var(--font-serif), "Yu Mincho", "Hiragino Mincho ProN", serif';

const containerStyle: React.CSSProperties = {
  minHeight: "100svh",
  width: "100vw",
  marginLeft: "calc(50% - 50vw)",
  marginRight: "calc(50% - 50vw)",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflow: "auto",
  backgroundImage: `url(${minigameBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  padding: "8px 20px 20px",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(
      rgba(0,0,0,0.18),
      rgba(0,0,0,0.42)
    )
  `,
  backdropFilter: "blur(0.4px)",
  WebkitBackdropFilter: "blur(0.4px)",
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "min(1400px, 96%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(228, 196, 160, 0.75)",
  fontSize: "10px",
  letterSpacing: "0.4em",
  marginBottom: "2px",
  fontWeight: 600,
  fontFamily: serifFont,
  textTransform: "uppercase",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  color: "#f4efe7",
  fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
  fontFamily: serifFont,
  fontWeight: 700,
  letterSpacing: "0.08em",
  marginBottom: "8px",
  textAlign: "center",
  textShadow: "0 2px 18px rgba(0,0,0,0.38)",
  lineHeight: 1.2,
};

const gameCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "min(1240px, 98vw)",
  minHeight: "calc(100svh - var(--mini-game-header-height, 78px))",
  borderRadius: "18px",
  background: "rgba(10, 8, 6, 0.34)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.32)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  padding: "clamp(8px, 2vw, 14px)",
  margin: "0 auto",
};