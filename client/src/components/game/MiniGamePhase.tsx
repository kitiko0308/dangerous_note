import { useState } from "react";
import SampleGame5 from "./minigames/SampleGame5.tsx";
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
  const [selectedGame, _setSelectedGame] = useState<string>("sample5");
  type SampleGame5Results = {
    rankingIds: number[];
    taps: Record<number, number>;
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        🎲 ミニゲームフェーズ
      </h2>

      {selectedGame === "sample5" && (
        <SampleGame5
          players={players}
          onFinish={(results: SampleGame5Results) => onNext(results)}
        />
      )}
    </div>
  );
}
