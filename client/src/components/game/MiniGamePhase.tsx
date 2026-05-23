import { useState } from "react";
import SampleGame from "./minigames/SampleGame";
import type { Player } from "../../types";
import minigameBg from "../../assets/img/gamehaikei.png";

type MiniGameResults = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onNext: (results?: MiniGameResults) => void;
};

export default function MiniGamePhase({
  players,
  onNext,
}: Props) {
  const [selectedGame, _setSelectedGame] =
    useState<string>("sample");

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />

      <div style={contentStyle}>
        <p style={labelStyle}>MINI GAME</p>

        <h1 style={titleStyle}>
          ミニゲームフェーズ
        </h1>

        <div style={gameCardStyle}>
          {selectedGame === "sample" && (
            <SampleGame
              players={players}
              onFinish={(results) =>
                onNext(results)
              }
            />
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
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,

  width: "100%",
  maxWidth: "min(1400px, 96%)",

  display: "flex",
  flexDirection: "column",

  alignItems: "stretch",
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
  minHeight: "calc(100svh - 78px)",
  borderRadius: "18px",
  background: "rgba(10, 8, 6, 0.34)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.32)",
  backdropFilter: "blur(6px)",
  padding: "clamp(8px, 2vw, 14px)",
  margin: "0 auto",
};