import { useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../../../types";

type Props = {
  players: Player[];
  onFinish: (rankingIds: number[]) => void; // ゲーム終了時に順位（ID配列）を渡す
};

import SampleGame3 from "./SampleGame3";

export default function SampleGame({ players, onFinish }: Props) {
  // 一時的ラッパー: SampleGame3 を表示して動作確認するための差し替え
  return <SampleGame3 players={players} onFinish={onFinish} />;
}
