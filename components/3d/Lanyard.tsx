'use client';

import {
  Canvas,
  events as createPointerEvents,
  extend,
  useFrame,
  useThree,
  type ThreeElement,
  type ThreeEvent,
} from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { useTheme, type Theme } from '@/lib/useTheme';
import { createBadgeTextures, type BadgeTextures } from './badgeTextures';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// ── Dimensions (world units) ──────────────────────────────────────────────────
const CARD_W = 1.6;
const CARD_H = 2.25;
const CARD_DEPTH = 0.03;
const CARD_BEVEL = 0.012;
/** Where the strap meets the card, measured up from the card's centre. */
const CARD_ANCHOR_Y = CARD_H / 2 + 0.3;
/** Length of each of the three rope segments between the ceiling and the card. */
const SEGMENT = 1;
const FOV = 25;

interface Layout {
  width: number;
  height: number;
  cameraZ: number;
  /** World position of the fixed point the strap hangs from. */
  anchor: [number, number, number];
}

interface LanyardProps {
  /** The section the canvas covers; pointer events are read from it. */
  sectionRef: RefObject<HTMLElement | null>;
  /** The box in the layout the card should hang in front of. */
  slotRef: RefObject<HTMLElement | null>;
  /** Pause rendering and physics while the section is off screen. */
  visible: boolean;
  photoSrc: string;
  onReady: () => void;
}

/**
 * Works out the camera distance and hanging point so the card rests centred on
 * the slot at a sensible pixel size. Uses offsets, not client rects, so a
 * transform animating on an ancestor does not skew the result.
 */
function measure(section: HTMLElement, slot: HTMLElement): Layout | null {
  const width = section.clientWidth;
  const height = section.clientHeight;
  if (!width || !height || !slot.offsetWidth) return null;

  let left = 0;
  let top = 0;
  let el: HTMLElement | null = slot;
  while (el && el !== section) {
    left += el.offsetLeft;
    top += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  if (el !== section) {
    const a = slot.getBoundingClientRect();
    const b = section.getBoundingClientRect();
    left = a.left - b.left;
    top = a.top - b.top;
  }

  const slotCentreX = left + slot.offsetWidth / 2;
  const slotCentreY = top + slot.offsetHeight / 2;
  const cardPx = Math.max(260, Math.min(slot.offsetHeight * 0.7, (slot.offsetWidth * 0.82 * CARD_H) / CARD_W));

  const visibleHeight = (CARD_H * height) / cardPx;
  const unitsPerPx = visibleHeight / height;
  const cameraZ = visibleHeight / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const restX = (slotCentreX - width / 2) * unitsPerPx;
  // Sit a little below the slot's centre: the clip and strap take the space above.
  const restY = -(slotCentreY - height / 2) * unitsPerPx - 0.12;

  return { width, height, cameraZ, anchor: [restX, restY + SEGMENT * 3 + CARD_ANCHOR_Y, 0] };
}

const layoutKey = (l: Layout) => `${Math.round(l.width / 4)}x${Math.round(l.height / 4)}:${l.anchor[0].toFixed(2)}:${l.anchor[1].toFixed(2)}`;

// ── Card geometry ─────────────────────────────────────────────────────────────
function useCardGeometry() {
  return useMemo(() => {
    const w = CARD_W;
    const h = CARD_H;
    const r = 0.11;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const body = new THREE.ExtrudeGeometry(shape, {
      depth: CARD_DEPTH,
      bevelEnabled: true,
      bevelSize: CARD_BEVEL,
      bevelThickness: CARD_BEVEL,
      bevelSegments: 3,
      curveSegments: 16,
    });
    body.translate(0, 0, -CARD_DEPTH / 2);

    // Flat face with UVs stretched over the whole card
    const face = new THREE.ShapeGeometry(shape, 16);
    const pos = face.attributes.position as THREE.BufferAttribute;
    const uv = face.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    }
    uv.needsUpdate = true;

    return { body, face };
  }, []);
}

// ── Strap + card ──────────────────────────────────────────────────────────────
function Band({ layout, textures, theme, onReady }: { layout: Layout; textures: BadgeTextures; theme: Theme; onReady: () => void }) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  const smoothed = useRef(new Map<RapierRigidBody, THREE.Vector3>());

  const scratch = useMemo(
    () => ({ vec: new THREE.Vector3(), dir: new THREE.Vector3(), ang: new THREE.Vector3(), rot: new THREE.Vector3() }),
    [],
  );
  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal';
    return c;
  }, []);
  const geometry = useCardGeometry();
  const size = useThree((state) => state.size);
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size.width, size.height]);
  const strapRepeat = useMemo(() => new THREE.Vector2(-4, 1), []);

  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const [hovered, setHovered] = useState(false);

  useRopeJoint(fixed as RefObject<RapierRigidBody>, j1 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], SEGMENT]);
  useRopeJoint(j1 as RefObject<RapierRigidBody>, j2 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], SEGMENT]);
  useRopeJoint(j2 as RefObject<RapierRigidBody>, j3 as RefObject<RapierRigidBody>, [[0, 0, 0], [0, 0, 0], SEGMENT]);
  useSphericalJoint(j3 as RefObject<RapierRigidBody>, card as RefObject<RapierRigidBody>, [[0, 0, 0], [0, CARD_ANCHOR_Y, 0]]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (!hovered && !dragOffset) return;
    document.body.style.cursor = dragOffset ? 'grabbing' : 'grab';
    if (dragOffset) document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [hovered, dragOffset]);

  useFrame((state, delta) => {
    const { vec, dir, ang, rot } = scratch;
    const bodies = { fixed: fixed.current, j1: j1.current, j2: j2.current, j3: j3.current, card: card.current };
    if (!bodies.fixed || !bodies.j1 || !bodies.j2 || !bodies.j3 || !bodies.card) return;

    if (dragOffset) {
      // Project the pointer onto the plane the card hangs in and carry the card there
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      for (const body of [bodies.fixed, bodies.j1, bodies.j2, bodies.j3, bodies.card]) body.wakeUp();
      bodies.card.setNextKinematicTranslation({ x: vec.x - dragOffset.x, y: vec.y - dragOffset.y, z: vec.z - dragOffset.z });
    }

    // Smooth the two middle joints so the strap does not jitter when pulled taut
    for (const body of [bodies.j1, bodies.j2]) {
      const target = body.translation();
      let point = smoothed.current.get(body);
      if (!point) {
        point = new THREE.Vector3(target.x, target.y, target.z);
        smoothed.current.set(body, point);
      }
      vec.set(target.x, target.y, target.z);
      const distance = Math.max(0.1, Math.min(1, point.distanceTo(vec)));
      point.lerp(vec, Math.min(1, delta * (10 + distance * 40)));
    }

    const p3 = bodies.j3.translation();
    const p0 = bodies.fixed.translation();
    curve.points[0]!.set(p3.x, p3.y, p3.z);
    curve.points[1]!.copy(smoothed.current.get(bodies.j2)!);
    curve.points[2]!.copy(smoothed.current.get(bodies.j1)!);
    curve.points[3]!.set(p0.x, p0.y, p0.z);
    (band.current?.geometry as MeshLineGeometry | undefined)?.setPoints(curve.getPoints(32));

    // Ease the card back to face the camera
    const angvel = bodies.card.angvel();
    const rotation = bodies.card.rotation();
    ang.set(angvel.x, angvel.y, angvel.z);
    rot.set(rotation.x, rotation.y, rotation.z);
    bodies.card.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
  });

  const segment = { canSleep: true, colliders: false as const, angularDamping: 2, linearDamping: 2 };
  const faceZ = CARD_DEPTH / 2 + CARD_BEVEL + 0.002;
  const glossZ = faceZ + 0.002;
  // Clear glass slab: mostly see-through, a touch more body on the light theme
  const slab = theme === 'dark' ? { color: '#dfe3ea', opacity: 0.1 } : { color: '#ffffff', opacity: 0.3 };

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    const body = card.current;
    if (!body) return;
    e.stopPropagation();
    (e.target as unknown as Element).setPointerCapture(e.pointerId);
    const t = body.translation();
    setDragOffset(new THREE.Vector3().copy(e.point).sub(scratch.vec.set(t.x, t.y, t.z)));
  };
  const handleUp = (e: ThreeEvent<PointerEvent>) => {
    (e.target as unknown as Element).releasePointerCapture(e.pointerId);
    setDragOffset(null);
  };

  return (
    <>
      <group position={layout.anchor}>
        <RigidBody ref={fixed} {...segment} type="fixed" />
        <RigidBody ref={j1} position={[0.5, 0, 0]} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j2} position={[1, 0, 0]} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j3} position={[1.5, 0, 0]} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={card} position={[2, 0, 0]} {...segment} type={dragOffset ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.01]} />
          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            onPointerCancel={() => setDragOffset(null)}
          >
            {/* Glass card, back to front: a clear slab whose bevel catches the light, the
                printed pane (unlit, so its colours stay true), and an additive gloss
                layer that only adds the environment's reflections on top. */}
            <mesh geometry={geometry.body} renderOrder={1}>
              <meshPhysicalMaterial
                color={slab.color}
                transparent
                opacity={slab.opacity}
                depthWrite={false}
                roughness={0.08}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.05}
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={geometry.face} position={[0, 0, faceZ]} renderOrder={2}>
              <meshBasicMaterial map={textures.front} transparent depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh geometry={geometry.face} position={[0, 0, glossZ]} renderOrder={3}>
              <meshPhysicalMaterial color="#000000" metalness={1} roughness={0.16} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
            </mesh>
            <mesh geometry={geometry.face} position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]} renderOrder={2}>
              <meshBasicMaterial map={textures.back} transparent depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh geometry={geometry.face} position={[0, 0, -glossZ]} rotation={[0, Math.PI, 0]} renderOrder={3}>
              <meshPhysicalMaterial color="#000000" metalness={1} roughness={0.16} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
            </mesh>
            {/* Clip and ring that the strap threads through */}
            <mesh position={[0, CARD_H / 2 + 0.05, 0]}>
              <boxGeometry args={[0.36, 0.24, 0.075]} />
              <meshStandardMaterial color="#c9ccd1" metalness={0.75} roughness={0.32} />
            </mesh>
            <mesh position={[0, CARD_H / 2 + 0.22, 0]}>
              <torusGeometry args={[0.1, 0.024, 12, 32]} />
              <meshStandardMaterial color="#c9ccd1" metalness={0.75} roughness={0.32} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Drawn first and kept out of the depth buffer, so the strap always passes
          behind the ring instead of trading places with it from frame to frame. */}
      <mesh ref={band} renderOrder={-1} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution }]}
          color="white"
          depthTest={false}
          depthWrite={false}
          resolution={resolution}
          useMap={1}
          map={textures.strap}
          repeat={strapRepeat}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

/**
 * ID badge on a lanyard with real rope physics: it drops in from above, can be
 * grabbed and thrown, swings, and settles back in front of its slot.
 *
 * The canvas covers the whole section so the card can swing freely, but it
 * never takes pointer events itself. Events are read from the section and
 * raycast into the scene, so text underneath stays selectable and clickable.
 */
export default function Lanyard({ sectionRef, slotRef, visible, photoSrc, onReady }: LanyardProps) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [textures, setTextures] = useState<BadgeTextures | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const section = sectionRef.current;
    const slot = slotRef.current;
    if (!section || !slot) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(section, slot);
        setLayout((prev) => (prev && next && layoutKey(prev) === layoutKey(next) ? prev : next));
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(section);
    observer.observe(slot);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [sectionRef, slotRef]);

  useEffect(() => {
    let cancelled = false;
    let created: BadgeTextures | null = null;
    createBadgeTextures(photoSrc, theme)
      .then((result) => {
        created = result;
        if (cancelled) Object.values(result).forEach((t) => t.dispose());
        else setTextures(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (created) Object.values(created).forEach((t) => t.dispose());
    };
  }, [photoSrc, theme]);

  if (!layout || !textures) return null;

  return (
    <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        key={layoutKey(layout)}
        camera={{ position: [0, 0, layout.cameraZ], fov: FOV }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        frameloop={visible ? 'always' : 'never'}
        style={{ pointerEvents: 'none' }}
        eventSource={sectionRef as RefObject<HTMLElement>}
        events={(store) => ({
          ...createPointerEvents(store),
          // The section, not the canvas, is the event source, so work the pointer
          // out from the canvas's own box rather than the event target's.
          compute: (event, state) => {
            const rect = state.gl.domElement.getBoundingClientRect();
            state.pointer.set(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -((event.clientY - rect.top) / rect.height) * 2 + 1,
            );
            state.raycaster.setFromCamera(state.pointer, state.camera);
          },
        })}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 6]} intensity={2.2} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60} paused={!visible}>
            <Band layout={layout} textures={textures} theme={theme} onReady={onReady} />
          </Physics>
        </Suspense>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
