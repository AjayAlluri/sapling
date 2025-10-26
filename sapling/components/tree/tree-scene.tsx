"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { TreeVisualState } from "@/lib/tree/state";
import { TreeModel } from "@/components/tree/tree-model";

type Props = {
  state: TreeVisualState;
};

export function TreeScene({ state }: Props) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-emerald-100 via-emerald-50 to-white dark:border-zinc-800 dark:from-emerald-900/40 dark:via-zinc-950 dark:to-black">
      <Canvas
        shadows
        camera={{ position: [4, 4, 6], fov: 45 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <hemisphereLight skyColor="#effff0" groundColor="#202020" intensity={0.4} />

          <TreeModel state={state} />

          <OrbitControls enablePan={false} minDistance={4} maxDistance={12} maxPolarAngle={Math.PI / 2.2} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
