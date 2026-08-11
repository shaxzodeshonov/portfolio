"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ---------------------------------------------------------------------------
   A tilted lattice of points with travelling waves running through it.
   Chosen over the usual particle sphere because a measured grid is the same
   idea as the blueprint rules elsewhere on the page, just in three dimensions.
   --------------------------------------------------------------------------- */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2  uPointer;
  uniform float uAmplitude;

  attribute float aSeed;

  varying float vHeight;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec3 p = position;

    float t = uTime * 0.55;

    // Three layered sines read as an irregular swell without the cost of
    // real noise, and they stay perfectly seamless when they loop.
    float w =
        sin(p.x * 0.34 + t) * 0.50
      + sin(p.z * 0.27 - t * 0.78) * 0.46
      + sin((p.x + p.z) * 0.19 + t * 0.42) * 0.32;

    // Pointer pushes a shallow dent into the sheet.
    vec2  toPointer = p.xz - uPointer * 9.0;
    float pull      = exp(-dot(toPointer, toPointer) * 0.008);
    w += pull * 1.15;

    p.y += w * uAmplitude;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective-correct sizing, with a floor so distant points stay visible.
    gl_PointSize = max(1.0, uSize * (14.0 / -mv.z));

    vHeight = w;
    vSeed   = aSeed;
    vDepth  = -mv.z;
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uBone;
  uniform vec3 uSignal;
  uniform vec3 uBlueprint;

  varying float vHeight;
  varying float vSeed;
  varying float vDepth;

  void main() {
    // Round the square point sprite off into a soft dot.
    vec2  uv = gl_PointCoord - 0.5;
    float d  = dot(uv, uv);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.02, d);

    // Crests pick up the accent colours; troughs stay bone.
    float crest = smoothstep(0.35, 1.15, vHeight);
    vec3  col   = mix(uBone, uBlueprint, crest * 0.75);
    col = mix(col, uSignal, step(0.972, vSeed) * crest);

    // Fade with distance so the far edge dissolves instead of ending.
    float depthFade = 1.0 - smoothstep(16.0, 46.0, vDepth);
    float nearFade  = smoothstep(2.0, 6.0, vDepth);

    gl_FragColor = vec4(col, alpha * depthFade * nearFade * 0.62);
  }
`;

function Lattice({ density }: { density: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const [positions, seeds] = useMemo(() => {
    const cols = density;
    const rows = Math.round(density * 1.25);
    const width = 42;
    const depth = 52;

    const pos = new Float32Array(cols * rows * 3);
    const seed = new Float32Array(cols * rows);

    let i = 0;
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        // A touch of jitter keeps the lattice from moiréing against the
        // pixel grid at shallow angles.
        const jx = (Math.random() - 0.5) * 0.22;
        const jz = (Math.random() - 0.5) * 0.22;
        pos[i * 3] = (x / (cols - 1) - 0.5) * width + jx;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (z / (rows - 1) - 0.5) * depth + jz;
        seed[i] = Math.random();
        i++;
      }
    }
    return [pos, seed] as const;
  }, [density]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 13 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAmplitude: { value: 1.15 },
      uBone: { value: new THREE.Color("#edeae4") },
      uSignal: { value: new THREE.Color("#4ade80") },
      uBlueprint: { value: new THREE.Color("#3d7eff") },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += Math.min(delta, 1 / 30);

    // Pointer in normalised device coords, eased so the dent trails the mouse.
    target.current.set(state.pointer.x, state.pointer.y);
    pointer.current.lerp(target.current, 1 - Math.pow(0.001, delta));
    mat.uniforms.uPointer.value.set(pointer.current.x, -pointer.current.y);

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.012;
    }
  });

  // Narrow viewports see a slightly smaller, closer slice of the same field.
  const scale = viewport.width < 6 ? 0.82 : 1;

  return (
    <points ref={pointsRef} rotation={[0, 0, 0]} position={[0, -2.4, 0]} scale={scale}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[seeds, 1]}
          count={seeds.length}
          array={seeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function LatticeField({ density = 118 }: { density?: number }) {
  return (
    <Canvas
      // Cap DPR at 1.6: past that the point cloud costs a lot and looks
      // identical, and retina laptops start dropping frames.
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 3.1, 13], fov: 42, near: 0.1, far: 90 }}
      style={{ pointerEvents: "none" }}
    >
      <Lattice density={density} />
    </Canvas>
  );
}
