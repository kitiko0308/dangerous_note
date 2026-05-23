import { useState } from "react";
import SampleGame from "./minigames/SampleGame";
import type { Player } from "../../types";

type MiniGameResults = {
  rankingIds: number[];
  taps: Record<number, number>;
};

type Props = {
  players: Player[];
  onNext: (results?: MiniGameResults) => void;
};

export default function MiniGamePhase({ players, onNext }: Props) {
  const [selectedGame, _setSelectedGame] = useState<string>("sample");

  return (
    <div>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        🎲 ミニゲームフェーズ
      </h2>

      {selectedGame === "sample" && (
        <SampleGame players={players} onFinish={(results) => onNext(results)} />
      )}
    </div>
  );
}
