"use client";

import { memo, useMemo } from "react";
import { Color } from "three";
import { getEmotionColor, computeLeafDensity, computeTrunkHeight, normalizeHealth } from "@/lib/tree/visuals";
import type { TreeVisualState } from "@/lib/tree/state";

type Branch = {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  radiusTop: number;
  radiusBottom: number;
  color: string;
};

type Leaf = {
  position: [number, number, number];
  scale: number;
  color: string;
};

function createBranches(state: TreeVisualState): Branch[] {
  const branchCount = Math.max(state.branchCount, 3);
  const baseColor = new Color(getEmotionColor(state.lastEmotion));
  const health = normalizeHealth(state.overallHealth);

  return Array.from({ length: branchCount }, (_, index) => {
    const t = index / branchCount;
    const angle = t * Math.PI * 2;
    const height = 0.8 + t * 1.8;
    const radius = 0.6 + t * 0.8;

    const color = baseColor.clone().offsetHSL(0, 0, (health - 0.5) * 0.2).getHexString();

    return {
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      rotation: [-0.4 + health * 0.3, angle + Math.PI / 4, 0],
      length: 1.2 + health * 1.1,
      radiusTop: 0.04 + (1 - t) * 0.06,
      radiusBottom: 0.08 + (1 - t) * 0.12,
      color: `#${color}`,
    };
  });
}

function createLeaves(state: TreeVisualState): Leaf[] {
  const density = computeLeafDensity(state.leafCount);
  const totalLeaves = Math.round(60 * density);
  const baseColor = new Color(getEmotionColor(state.lastEmotion));

  return Array.from({ length: totalLeaves }, (_, index) => {
    const t = index / totalLeaves;
    const angle = t * Math.PI * 2;
    const radius = 0.6 + Math.random() * 1.2;
    const height = 1.2 + Math.random() * 2.2;
    const variation = (Math.random() - 0.5) * 0.15;

    const color = baseColor.clone().offsetHSL(variation, 0, variation).getHexString();

    return {
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ],
      scale: 0.18 + Math.random() * 0.25,
      color: `#${color}`,
    };
  });
}

type Props = {
  state: TreeVisualState;
};

function TreeModelComponent({ state }: Props) {
  const trunkHeight = computeTrunkHeight(state.branchCount);
  const branches = useMemo(() => createBranches(state), [state]);
  const leaves = useMemo(() => createLeaves(state), [state]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#2f3d32" />
      </mesh>

      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, trunkHeight, 16]} />
        <meshStandardMaterial color="#4b3621" roughness={0.8} />
      </mesh>

      {/* Branches */}
      {branches.map((branch, index) => (
        <mesh
          key={`branch-${index}`}
          position={branch.position}
          rotation={branch.rotation}
          castShadow
        >
          <cylinderGeometry args={[branch.radiusTop, branch.radiusBottom, branch.length, 12]} />
          <meshStandardMaterial color={branch.color} roughness={0.6} metalness={0.1} />
        </mesh>
      ))}

      {/* Leaves */}
      {leaves.map((leaf, index) => (
        <mesh
          key={`leaf-${index}`}
          position={leaf.position}
          scale={leaf.scale}
          castShadow
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={leaf.color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export const TreeModel = memo(TreeModelComponent);
