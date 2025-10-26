"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { TreeVisualState } from "@/lib/tree/state";
import { clamp } from "@/lib/utils/math";

type BranchData = {
  geometry: TubeGeometry;
  color: string;
};

type LeafInstance = {
  position: { x: number; y: number; z: number };
  rotation: [number, number, number];
  scale: number;
  color: string;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
};

type TreeGeometry = {
  trunkGeometry: TubeGeometry;
  trunkColor: string;
  branches: BranchData[];
  leaves: LeafInstance[];
};

function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function buildTreeGeometry(state: TreeVisualState): TreeGeometry {
  const rand = createSeededRandom(state.seed);
  const trunkHeight = 2.2 + state.branchCount * 0.18 + state.overallHealth * 1.3;
  const segmentCount = 6;
  const points: Vector3[] = [new Vector3(0, 0, 0)];

  let current = new Vector3(0, 0, 0);
  for (let i = 1; i <= segmentCount; i++) {
    const progress = i / segmentCount;
    const step = trunkHeight / segmentCount;
    const leanX = state.palette.branchLean * progress * 1.3 + (rand() - 0.5) * 0.3;
    const leanZ = (rand() - 0.5) * 0.35;
    current = current.clone().add(new Vector3(leanX, step, leanZ));
    points.push(current.clone());
  }

  const trunkCurve = new CatmullRomCurve3(points, false, "catmullrom", 0.5);
  const trunkGeometry = new TubeGeometry(trunkCurve, 140, 0.4, 16, false);

  const tmpVec = new Vector3();
  const center = new Vector3();
  const positions = trunkGeometry.attributes.position;
  const uvs = trunkGeometry.attributes.uv;

  for (let i = 0; i < positions.count; i++) {
    const t = uvs.getY(i);
    trunkCurve.getPointAt(t, center);
    tmpVec.fromBufferAttribute(positions, i);
    tmpVec.sub(center);
    const radius = 0.5 - t * 0.32 + state.overallHealth * 0.08;
    tmpVec.setLength(Math.max(0.12, radius));
    tmpVec.add(center);
    positions.setXYZ(i, tmpVec.x, tmpVec.y, tmpVec.z);
  }
  positions.needsUpdate = true;
  trunkGeometry.computeVertexNormals();

  const sentimentFactor = clamp((state.sentimentScore + 1) / 2, 0, 1);
  const branchCount = Math.max(4, Math.min(10, state.branchCount + 2));
  const branches: BranchData[] = [];

  for (let i = 0; i < branchCount; i++) {
    const baseT = 0.2 + (i / branchCount) * 0.6;
    const start = trunkCurve.getPointAt(baseT);
    const tangent = trunkCurve.getTangentAt(baseT).normalize();
    const normal = new Vector3(0, 0, 1).cross(tangent);
    if (normal.lengthSq() < 0.001) {
      normal.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    } else {
      normal.normalize();
    }
    normal.applyAxisAngle(tangent, state.palette.branchTwist + rand() * Math.PI * 2);

    const length =
      1.1 + sentimentFactor * 0.9 + (1 - baseT) * 0.5 + (rand() - 0.5) * 0.4;
    const control = start
      .clone()
      .add(tangent.clone().multiplyScalar(length * 0.35))
      .add(normal.clone().multiplyScalar(length * 0.55));
    const end = start
      .clone()
      .add(
        normal
          .clone()
          .multiplyScalar(length)
          .add(new Vector3((rand() - 0.5) * 0.4, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.4))
      );

    const branchCurve = new CatmullRomCurve3([start, control, end], false, "catmullrom", 0.5);
    const branchGeometry = new TubeGeometry(branchCurve, 50, 0.14, 12, false);

    const branchPositions = branchGeometry.attributes.position;
    const branchUV = branchGeometry.attributes.uv;
    for (let idx = 0; idx < branchPositions.count; idx++) {
      const t = branchUV.getY(idx);
      branchCurve.getPointAt(t, center);
      tmpVec.fromBufferAttribute(branchPositions, idx);
      tmpVec.sub(center);
      const radius = 0.16 - t * 0.12;
      tmpVec.setLength(Math.max(0.04, radius));
      tmpVec.add(center);
      branchPositions.setXYZ(idx, tmpVec.x, tmpVec.y, tmpVec.z);
    }
    branchPositions.needsUpdate = true;
    branchGeometry.computeVertexNormals();

    const branchColor = new Color(state.palette.barkHighlight)
      .lerp(new Color(state.palette.barkColor), 0.4)
      .getHexString();
    branches.push({
      geometry: branchGeometry,
      color: `#${branchColor}`,
    });
  }

  const dominantColors = state.dominantEmotions
    .filter((emotion) => typeof emotion.colorHex === "string")
    .map((emotion) => new Color(emotion.colorHex as string));

  const leafCount = Math.min(220, Math.max(90, Math.round(state.leafCount * 1.6)));
  const leafPrimary = new Color(state.palette.leafPrimary);
  const leafSecondary = new Color(state.palette.leafSecondary);
  const accentColor = new Color(state.palette.accentColor);

  const leaves: LeafInstance[] = [];
  for (let i = 0; i < leafCount; i++) {
    const branch = branches[Math.floor(rand() * branches.length)];
    const t = clamp(Math.pow(rand(), 0.7), 0.05, 0.98);

    const curve = branch.geometry.parameters.path as CatmullRomCurve3;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const perp = new Vector3(rand() - 0.5, rand() - 0.2, rand() - 0.5).normalize();
    const binormal = new Vector3().crossVectors(tangent, perp).normalize();
    const normal = new Vector3().crossVectors(binormal, tangent).normalize();

    const radialOffset = 0.24 + rand() * 0.32;
    const lateralOffset = binormal.multiplyScalar((rand() - 0.5) * 0.35);
    const position = point
      .clone()
      .add(normal.multiplyScalar(radialOffset))
      .add(lateralOffset);

    const scale = 0.35 + rand() * 0.55 + sentimentFactor * 0.2;
    const swayAmplitude = 0.08 + rand() * 0.12 + state.palette.windStrength * 0.04;
    const swaySpeed = 0.6 + rand() * 0.7 + state.palette.windStrength * 0.9;
    const swayOffset = rand() * Math.PI * 2;

    const baseColor = leafPrimary.clone().lerp(leafSecondary, rand() * 0.6);
    if (dominantColors.length && rand() < 0.35) {
      baseColor.lerp(dominantColors[Math.floor(rand() * dominantColors.length)], 0.6);
    }
    baseColor.lerp(accentColor, sentimentFactor * 0.2);

    leaves.push({
      position: { x: position.x, y: position.y, z: position.z },
      rotation: [
        Math.PI / 2 + (rand() - 0.5) * 0.6,
        (rand() - 0.5) * Math.PI,
        (rand() - 0.5) * 0.4,
      ],
      scale,
      color: `#${baseColor.getHexString()}`,
      swayAmplitude,
      swaySpeed,
      swayOffset,
    });
  }

  return {
    trunkGeometry,
    trunkColor: state.palette.barkColor,
    branches,
    leaves,
  };
}

const TreeModelComponent = ({ state }: { state: TreeVisualState }) => {
  const treeGeometry = useMemo(() => buildTreeGeometry(state), [state]);

  useEffect(() => {
    return () => {
      treeGeometry.trunkGeometry.dispose();
      treeGeometry.branches.forEach((branch) => branch.geometry.dispose());
    };
  }, [treeGeometry]);

  return (
    <group>
      <Ground color={state.palette.barkHighlight} />
      <Trunk geometry={treeGeometry.trunkGeometry} color={treeGeometry.trunkColor} />
      <Branches branches={treeGeometry.branches} />
      <Leaves leaves={treeGeometry.leaves} />
      <EmotionParticles palette={state.palette} />
    </group>
  );
};

const Trunk = memo(function Trunk({
  geometry,
  color,
}: {
  geometry: TubeGeometry;
  color: string;
}) {
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
});

const Branches = memo(function Branches({ branches }: { branches: BranchData[] }) {
  return (
    <group>
      {branches.map((branch, index) => (
        <mesh key={index} geometry={branch.geometry} castShadow>
          <meshStandardMaterial color={branch.color} roughness={0.65} metalness={0.12} />
        </mesh>
      ))}
    </group>
  );
});

const Leaves = memo(function Leaves({
  leaves,
}: {
  leaves: LeafInstance[];
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const object = useMemo(() => new Object3D(), []);
  const colors = useMemo(() => leaves.map((leaf) => new Color(leaf.color)), [leaves]);
  const baseData = useMemo(
    () =>
      leaves.map((leaf) => ({
        position: new Vector3(leaf.position.x, leaf.position.y, leaf.position.z),
        rotation: leaf.rotation,
        scale: leaf.scale,
        swayAmplitude: leaf.swayAmplitude,
        swaySpeed: leaf.swaySpeed,
        swayOffset: leaf.swayOffset,
      })),
    [leaves]
  );

  const geometry = useMemo(() => new PlaneGeometry(0.4, 0.9, 1, 1), []);
  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: "#ffffff",
      side: DoubleSide,
      roughness: 0.5,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
    });
    return mat;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const instance = meshRef.current;
    if (!instance) return;
    baseData.forEach((leaf, index) => {
      object.position.copy(leaf.position);
      object.rotation.set(leaf.rotation[0], leaf.rotation[1], leaf.rotation[2]);
      object.scale.setScalar(leaf.scale);
      object.updateMatrix();
      instance.setMatrixAt(index, object.matrix);
      instance.setColorAt(index, colors[index]);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) {
      instance.instanceColor.needsUpdate = true;
    }
  }, [baseData, colors, object]);

  useFrame(({ clock }) => {
    const instance = meshRef.current;
    if (!instance) return;
    const time = clock.getElapsedTime();
    baseData.forEach((leaf, index) => {
      const sway = Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * leaf.swayAmplitude;
      object.position.copy(leaf.position);
      object.position.x += sway * 0.6;
      object.position.z += sway * 0.4;
      object.rotation.set(
        leaf.rotation[0] + sway * 0.6,
        leaf.rotation[1] + sway * 0.4,
        leaf.rotation[2] + sway * 0.2
      );
      object.scale.setScalar(leaf.scale);
      object.updateMatrix();
      instance.setMatrixAt(index, object.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, leaves.length]} castShadow />;
});

const EmotionParticles = memo(function EmotionParticles({
  palette,
}: {
  palette: TreeVisualState["palette"];
}) {
  if (!palette.particle) return null;
  const color = palette.accentColor;
  switch (palette.particle) {
    case "fireflies":
      return <Sparkles count={40} size={2} speed={0.4} color={color} scale={[4, 4, 4]} />;
    case "embers":
      return (
        <Sparkles
          count={30}
          size={2.5}
          speed={0.7}
          color={color}
          scale={[3, 3.5, 3]}
        />
      );
    case "rain":
      return <Sparkles count={60} size={1.8} speed={1.2} color={color} scale={[4, 5, 4]} />;
    case "sparks":
      return <Sparkles count={35} size={2.2} speed={0.9} color={color} scale={[3, 4, 3]} />;
    case "motes":
    default:
      return <Sparkles count={25} size={1.6} speed={0.3} color={color} scale={[3, 3, 3]} />;
  }
});

const Ground = memo(function Ground({ color }: { color: string }) {
  const groundColor = new Color(color).lerp(new Color("#2f3d32"), 0.65).getStyle();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[6, 36]} />
      <meshStandardMaterial color={groundColor} roughness={0.9} />
    </mesh>
  );
});

export const TreeModel = memo(TreeModelComponent);
