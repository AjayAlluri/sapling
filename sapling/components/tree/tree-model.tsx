"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
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

type TwigData = {
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
  twigs: TwigData[];
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
  const trunkGeometry = new TubeGeometry(trunkCurve, 160, 0.46, 16, false);

  const tmpVec = new Vector3();
  const center = new Vector3();
  const positions = trunkGeometry.attributes.position;
  const uvs = trunkGeometry.attributes.uv;

  for (let i = 0; i < positions.count; i++) {
    const t = uvs.getY(i);
    trunkCurve.getPointAt(t, center);
    tmpVec.fromBufferAttribute(positions, i);
    tmpVec.sub(center);
    const radius = 0.56 - t * 0.36 + state.overallHealth * 0.09; // slightly fuller base taper
    tmpVec.setLength(Math.max(0.12, radius));
    tmpVec.add(center);
    positions.setXYZ(i, tmpVec.x, tmpVec.y, tmpVec.z);
  }
  positions.needsUpdate = true;
  trunkGeometry.computeVertexNormals();

  const sentimentFactor = clamp((state.sentimentScore + 1) / 2, 0, 1);
  const branchCount = Math.max(4, Math.min(10, state.branchCount + 2));
  const branches: BranchData[] = [];
  const twigs: TwigData[] = [];

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
    const branchGeometry = new TubeGeometry(branchCurve, 60, 0.16, 12, false);

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

    // Spawn 1-3 twigs towards the outer half of the branch for a fuller canopy
    const twigCount = 1 + Math.floor(rand() * 3);
    for (let tIndex = 0; tIndex < twigCount; tIndex++) {
      const twigBaseT = clamp(0.55 + rand() * 0.4, 0.55, 0.95);
      const twigStart = branchCurve.getPointAt(twigBaseT);
      const twigTangent = branchCurve.getTangentAt(twigBaseT).normalize();
      // Create a perpendicular direction with slight upward bias
      const twigNormalSeed = new Vector3(rand() - 0.5, Math.abs(rand()), rand() - 0.5).normalize();
      const twigNormal = new Vector3().crossVectors(twigTangent, twigNormalSeed).normalize();
      const twigSide = twigNormal.applyAxisAngle(twigTangent, rand() * Math.PI * 2);

      const twigLen = 0.45 + sentimentFactor * 0.35 + (1 - twigBaseT) * 0.25 + (rand() - 0.5) * 0.15;
      const twigControl = twigStart
        .clone()
        .add(twigTangent.clone().multiplyScalar(twigLen * 0.2))
        .add(twigSide.clone().multiplyScalar(twigLen * 0.6));
      const twigEnd = twigStart
        .clone()
        .add(twigSide.clone().multiplyScalar(twigLen))
        .add(new Vector3((rand() - 0.5) * 0.18, (rand() - 0.3) * 0.12, (rand() - 0.5) * 0.18));

      const twigCurve = new CatmullRomCurve3([twigStart, twigControl, twigEnd], false, "catmullrom", 0.5);
      const twigGeometry = new TubeGeometry(twigCurve, 24, 0.075, 10, false);

      // Gentle taper on twig geometry
      const twigPos = twigGeometry.attributes.position;
      const twigUV = twigGeometry.attributes.uv;
      for (let idx = 0; idx < twigPos.count; idx++) {
        const t = twigUV.getY(idx);
        twigCurve.getPointAt(t, center);
        tmpVec.fromBufferAttribute(twigPos, idx);
        tmpVec.sub(center);
        const radius = 0.09 - t * 0.075;
        tmpVec.setLength(Math.max(0.015, radius));
        tmpVec.add(center);
        twigPos.setXYZ(idx, tmpVec.x, tmpVec.y, tmpVec.z);
      }
      twigPos.needsUpdate = true;
      twigGeometry.computeVertexNormals();

      const twigColor = new Color(`#${branchColor}`).lerp(new Color(state.palette.barkHighlight), 0.35).getHexString();
      twigs.push({ geometry: twigGeometry, color: `#${twigColor}` });
    }
  }

  const dominantColors = state.dominantEmotions
    .filter((emotion) => typeof emotion.colorHex === "string")
    .map((emotion) => new Color(emotion.colorHex as string));

  const leafCount = Math.min(260, Math.max(120, Math.round(state.leafCount * 1.8)));
  const leafPrimary = new Color(state.palette.leafPrimary);
  const leafSecondary = new Color(state.palette.leafSecondary);
  const accentColor = new Color(state.palette.accentColor);

  const leaves: LeafInstance[] = [];
  // Precompute a few cluster centers (either on twigs or branches)
  const clusters = Array.from({ length: Math.max(4, Math.floor(leafCount / 40)) }).map(() => {
    const useTwig = twigs.length > 0 && rand() < 0.6;
    const source = useTwig
      ? (twigs[Math.floor(rand() * twigs.length)].geometry.parameters.path as CatmullRomCurve3)
      : (branches[Math.floor(rand() * branches.length)].geometry.parameters.path as CatmullRomCurve3);
    const tCenter = useTwig ? clamp(0.7 + rand() * 0.28, 0.7, 0.98) : clamp(0.45 + rand() * 0.45, 0.45, 0.95);
    return { source, tCenter };
  });

  for (let i = 0; i < leafCount; i++) {
    // Pick a cluster center and sample around it
    const cluster = clusters[Math.floor(rand() * clusters.length)];
    const t = clamp(cluster.tCenter + (rand() - 0.5) * 0.18, 0.05, 0.98);

    const curve = cluster.source;
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

    const scale = 0.32 + rand() * 0.6 + sentimentFactor * 0.22;
    const swayAmplitude = 0.06 + rand() * 0.12 + state.palette.windStrength * 0.05;
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
    twigs,
    leaves,
  };
}

const TreeModelComponent = ({ state }: { state: TreeVisualState }) => {
  const treeGeometry = useMemo(() => buildTreeGeometry(state), [state]);

  useEffect(() => {
    return () => {
      treeGeometry.trunkGeometry.dispose();
      treeGeometry.branches.forEach((branch) => branch.geometry.dispose());
      treeGeometry.twigs.forEach((twig) => twig.geometry.dispose());
    };
  }, [treeGeometry]);

  return (
    <group>
      <Ground color={state.palette.barkHighlight} />
      <Trunk geometry={treeGeometry.trunkGeometry} color={treeGeometry.trunkColor} />
      <Branches branches={treeGeometry.branches} />
      <Twigs twigs={treeGeometry.twigs} />
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

const Twigs = memo(function Twigs({ twigs }: { twigs: TwigData[] }) {
  return (
    <group>
      {twigs.map((twig, index) => (
        <mesh key={index} geometry={twig.geometry} castShadow>
          <meshStandardMaterial color={twig.color} roughness={0.7} metalness={0.08} />
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

  const geometry = useMemo(() => createLeafGeometry(), []);
  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: "#ffffff",
      side: DoubleSide,
      roughness: 0.65,
      metalness: 0.06,
      transparent: true,
      opacity: 0.95,
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

// Builds a reusable curved leaf geometry (teardrop silhouette with subtle camber)
function createLeafGeometry(): BufferGeometry {
  const length = 0.9; // along +Y
  const maxHalfWidth = 0.22; // across X
  const segmentsL = 14; // lengthwise segments
  const segmentsW = 8; // widthwise segments (each side)

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segmentsL; i++) {
    const u = i / segmentsL; // 0..1 from stem to tip
    // width profile: teardrop-like, fuller near 0.35, narrowing to tip
    const profile = Math.sin(Math.PI * Math.min(u * 0.95 + 0.05, 1)) ** 0.8 * (1 - u * 0.06);
    const halfWidth = maxHalfWidth * profile;
    for (let j = 0; j <= segmentsW; j++) {
      const v = (j / segmentsW) * 2 - 1; // -1..1 across
      const x = halfWidth * v;
      const y = u * length;
      // subtle camber (curve) along Z; stronger near center, smaller at tip/stem
      const camber = (1 - Math.abs(v)) * 0.08 * Math.sin(Math.PI * u) * 0.7;
      const z = camber;
      positions.push(x, y, z);
      uvs.push((v + 1) / 2, u);
    }
  }

  const row = segmentsW + 1;
  for (let i = 0; i < segmentsL; i++) {
    for (let j = 0; j < segmentsW; j++) {
      const a = i * row + j;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
