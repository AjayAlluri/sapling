"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { TreeVisualState } from "@/lib/tree/state";
import { TreeModel } from "@/components/tree/tree-model";
import { Color } from "three";

type Props = {
  state: TreeVisualState;
};

export function TreeScene({ state }: Props) {
  const gradientStyle = useMemo(() => {
    const top = new Color(state.palette.ambientLight).offsetHSL(0, 0, -0.2).getStyle();
    const mid = new Color(state.palette.leafSecondary).offsetHSL(0, -0.15, -0.2).getStyle();
    return {
      background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, #0b1224 100%)`,
      borderColor: `${state.palette.accentColor}30`,
    };
  }, [state.palette]);

  const ambientColor = useMemo(
    () => new Color(state.palette.ambientLight),
    [state.palette.ambientLight]
  );
  const keyLightColor = useMemo(
    () => new Color(state.palette.accentColor),
    [state.palette.accentColor]
  );

  return (
    <div
      className="h-[420px] w-full overflow-hidden rounded-3xl border"
      style={gradientStyle}
    >
      <Canvas shadows camera={{ position: [4, 4, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} color={ambientColor} />
          <directionalLight
            position={[5, 10, 4]}
            intensity={1}
            color={keyLightColor}
            castShadow
          />
          <hemisphereLight
            skyColor={state.palette.leafSecondary}
            groundColor={state.palette.barkColor ?? "#2d2d2d"}
            intensity={0.35}
          />

          <TreeModel state={state} />

          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={11}
            maxPolarAngle={Math.PI / 2.25}
          />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
