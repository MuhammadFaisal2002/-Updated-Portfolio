'use client';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme, useMediaQuery } from '@/lib/useTheme';

// ── Types ─────────────────────────────────────────────────────────────────────
type Vec3 = [number, number, number];

interface NodeDef {
  id: string;
  label: string;
  pos: Vec3;
  showLabel: boolean;
}

interface GraphConfig {
  nodes: NodeDef[];
  edges: [string, string][];
  paths: string[][];
  maxPulses: number;
  spawnInterval: number;
  position: Vec3;
  camera: Vec3;
  fov: number;
  fog: [number, number];
  leftNodes: Set<string>;
  nodeSize: number;
  pulseSize: number;
  labelDistance: number;
  rotationSpeed: number;
}

interface Palette {
  signal: string;
  node: string;
  edge: string;
  fog: string;
  labelBg: string;
  labelFg: string;
}

// ── Tech-stack map — hovering a node reveals the real stack behind it ─────────
const TECH_MAP: Record<string, { label: string; techs: string[] }> = {
  client:   { label: 'CLIENT',       techs: ['Next.js 16 App Router', 'React 19 + TypeScript', 'Tailwind CSS 4', 'Framer Motion'] },
  api:      { label: 'LARAVEL API',  techs: ['Laravel 12 / PHP 8.3', 'RESTful resources', 'Form Request validation', 'Rate limiting'] },
  auth:     { label: 'AUTH',         techs: ['Laravel Passport', 'Bearer tokens', 'Role middleware', 'Bcrypt hashing'] },
  mysql:    { label: 'MYSQL',        techs: ['MySQL 8', 'Eloquent ORM', 'Migrations + seeders', 'Indexed queries'] },
  state:    { label: 'CLIENT STATE', techs: ['React Query cache', 'Zustand stores', 'Axios interceptors', 'Optimistic updates'] },
  realtime: { label: 'REALTIME',     techs: ['Socket.IO', 'Live group chat', 'LLM streaming', 'Presence tracking'] },
  video:    { label: 'VIDEO ENGINE', techs: ['Custom video player', 'Timestamp sync', 'In-video quizzes', 'Progress tracking'] },
  queue:    { label: 'QUEUE',        techs: ['Laravel queues', 'Job retries + backoff', 'Task scheduler', 'Mail queue'] },
  ai:       { label: 'AI',           techs: ['Gemini API', 'OpenAI API', 'Chat assistant', 'Project estimator'] },
  grading:  { label: 'GRADING',      techs: ['Real-time grading', 'Quiz pipeline', 'Score analytics', 'Progress reports'] },
  cache:    { label: 'CACHE',        techs: ['ISR + revalidation', 'stale-while-revalidate', 'Cache-Control headers', 'CDN-ready assets'] },
  storage:  { label: 'STORAGE',      techs: ['AWS S3', 'Local / S3 disk switch', 'Lesson media files', 'Secure file URLs'] },
};

// ── Desktop graph — spread out to the right of the headline ──────────────────
const DESKTOP: GraphConfig = {
  nodes: [
    { id: 'client',   label: 'CLIENT',       pos: [-4.5,  0.1,  1.5], showLabel: false },
    { id: 'api',      label: 'LARAVEL API',  pos: [-2.6,  0.2,  0.6], showLabel: true },
    { id: 'auth',     label: 'AUTH',         pos: [-0.8,  2.6,  0.1], showLabel: true },
    { id: 'mysql',    label: 'MYSQL',        pos: [ 2.2, -0.5, -0.8], showLabel: true },
    { id: 'realtime', label: 'REALTIME',     pos: [ 1.2,  2.2, -0.3], showLabel: true },
    { id: 'video',    label: 'VIDEO ENGINE', pos: [-0.5, -2.2, -0.9], showLabel: true },
    { id: 'queue',    label: 'QUEUE',        pos: [ 1.8, -3.0, -1.6], showLabel: true },
    { id: 'ai',       label: 'AI',           pos: [ 3.4,  0.9, -2.2], showLabel: true },
    { id: 'grading',  label: 'GRADING',      pos: [ 2.8, -2.2, -2.4], showLabel: true },
    { id: 'state',    label: 'STATE',        pos: [-2.4, -1.4, -0.5], showLabel: true },
    { id: 'cache',    label: 'CACHE',        pos: [-0.8,  3.0, -1.0], showLabel: true },
    { id: 'storage',  label: 'S3',           pos: [ 1.2, -3.5, -2.0], showLabel: true },
  ],
  edges: [
    ['client', 'api'], ['client', 'state'],
    ['api', 'auth'], ['api', 'mysql'], ['api', 'cache'], ['api', 'realtime'], ['api', 'video'],
    ['video', 'queue'], ['video', 'grading'],
    ['queue', 'ai'], ['queue', 'storage'],
    ['ai', 'grading'], ['grading', 'mysql'],
    ['auth', 'mysql'], ['cache', 'mysql'],
  ],
  paths: [
    ['client', 'api', 'auth', 'mysql'],
    ['client', 'api', 'mysql'],
    ['client', 'api', 'cache'],
    ['client', 'api', 'realtime'],
    ['client', 'api', 'video', 'queue', 'ai', 'grading'],
    ['client', 'api', 'video', 'grading', 'mysql'],
    ['client', 'api', 'video', 'queue', 'storage'],
    ['client', 'state'],
  ],
  maxPulses: 4,
  spawnInterval: 2.2,
  position: [4.0, 0.2, 0],
  camera: [-2.8, 0.5, 10],
  fov: 56,
  fog: [5, 15],
  leftNodes: new Set(['client', 'api', 'state', 'cache']),
  nodeSize: 0.12,
  pulseSize: 0.07,
  labelDistance: 10,
  rotationSpeed: 0.035,
};

// ── Tablet graph — critical path only, centred and pushed below the text ─────
const TABLET: GraphConfig = {
  nodes: [
    { id: 'client', label: 'CLIENT',       pos: [-2.0,  0.2,  0.0], showLabel: true },
    { id: 'api',    label: 'LARAVEL API',  pos: [ 0.0,  0.0,  0.0], showLabel: true },
    { id: 'ai',     label: 'AI',           pos: [ 1.4,  1.0, -0.4], showLabel: true },
    { id: 'mysql',  label: 'MYSQL',        pos: [ 1.4, -1.0, -0.4], showLabel: true },
    { id: 'video',  label: 'VIDEO ENGINE', pos: [-0.2,  1.4, -0.3], showLabel: true },
  ],
  edges: [['client', 'api'], ['api', 'ai'], ['api', 'mysql'], ['api', 'video']],
  paths: [['client', 'api', 'ai'], ['client', 'api', 'mysql'], ['client', 'api', 'video']],
  maxPulses: 2,
  spawnInterval: 2.5,
  // Pushed right and down so it clears the left-aligned headline + CTAs on tablets
  position: [1.6, -2.4, 0],
  camera: [0, 0.4, 5.6],
  fov: 62,
  fog: [4, 12],
  leftNodes: new Set(['client']),
  nodeSize: 0.15,
  pulseSize: 0.1,
  labelDistance: 8,
  rotationSpeed: 0.03,
};

const PALETTE: Record<'dark' | 'light', Palette> = {
  dark:  { signal: '#dc143c', node: '#8a8a8a', edge: '#4e4e4e', fog: '#1a1a1a', labelBg: 'rgba(26, 26, 26, 0.7)',    labelFg: '#9a9a9a' },
  light: { signal: '#dc143c', node: '#5a5a5a', edge: '#9a9a9a', fog: '#f8f9fa', labelBg: 'rgba(248, 249, 250, 0.8)', labelFg: '#444444' },
};

const HOP_DURATION = 1.2; // seconds per edge — calm, deliberate
const MONO = "var(--font-geist-mono), 'JetBrains Mono', monospace";

// ── Tooltip shown next to a hovered node ─────────────────────────────────────
function NodeTooltip({ nodeId, side }: { nodeId: string; side: 'left' | 'right' }) {
  const info = TECH_MAP[nodeId];
  if (!info) return null;
  return (
    <Html
      position={[0, 0, 0]}
      center={false}
      zIndexRange={[10, 0]}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        transform: side === 'right' ? 'translate(20px, -50%)' : 'translate(calc(-100% - 20px), -50%)',
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(220, 20, 60, 0.3)',
          borderRadius: '8px',
          padding: '8px 10px',
          minWidth: '150px',
          textAlign: side === 'right' ? 'left' : 'right',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: '#dc143c', marginBottom: '5px' }}>
          {info.label}
        </div>
        {info.techs.map((t) => (
          <div key={t} style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.5 }}>
            {t}
          </div>
        ))}
      </div>
    </Html>
  );
}

// ── Graph — nodes, edges, travelling request pulses, hover highlight ──────────
interface Pulse { id: number; path: string[]; hop: number; progress: number; slot: number }

function Graph({ cfg, colors, animate }: { cfg: GraphConfig; colors: Palette; animate: boolean }) {
  const nodePos = useMemo(() => {
    const map: Record<string, THREE.Vector3> = {};
    cfg.nodes.forEach((n) => { map[n.id] = new THREE.Vector3(...n.pos); });
    return map;
  }, [cfg]);

  const adjacency = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    cfg.nodes.forEach((n) => { map[n.id] = new Set(); });
    cfg.edges.forEach(([a, b]) => { map[a]?.add(b); map[b]?.add(a); });
    return map;
  }, [cfg]);

  const edgeGeos = useMemo(
    () => cfg.edges.map(([a, b]) => {
      const pa = nodePos[a]!, pb = nodePos[b]!;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], 3));
      return g;
    }),
    [cfg, nodePos],
  );

  const cSignal = useMemo(() => new THREE.Color(colors.signal), [colors.signal]);
  const cNode   = useMemo(() => new THREE.Color(colors.node), [colors.node]);
  const cEdge   = useMemo(() => new THREE.Color(colors.edge), [colors.edge]);

  const groupRef  = useRef<THREE.Group>(null);
  const meshRefs  = useRef<Record<string, THREE.Mesh>>({});
  const edgeRefs  = useRef<(THREE.LineSegments | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nodeGlow  = useRef<Record<string, number>>({});
  const hoverNode = useRef<string | null>(null);
  const pulses    = useRef<Pulse[]>([]);
  const slots     = useRef<number[]>(Array.from({ length: cfg.maxPulses }, (_, i) => i));
  const lastSpawn = useRef(0);
  const pulseId   = useRef(0);
  const tmpVec    = useMemo(() => new THREE.Vector3(), []);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useFrame(({ clock }, delta) => {
    if (!animate) return;
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = t * cfg.rotationSpeed;
      groupRef.current.position.y = cfg.position[1] + Math.sin(t * 0.28) * 0.07;
    }

    // Spawn a new request pulse on an interval
    if (t - lastSpawn.current > cfg.spawnInterval && pulses.current.length < cfg.maxPulses && slots.current.length > 0) {
      const path = cfg.paths[Math.floor(Math.random() * cfg.paths.length)]!;
      const slot = slots.current.pop()!;
      pulses.current.push({ id: pulseId.current++, path, hop: 0, progress: 0, slot });
      nodeGlow.current[path[0]!] = Math.min(1, (nodeGlow.current[path[0]!] || 0) + 0.5);
      lastSpawn.current = t;
    }

    // Edges: highlight the ones touching the hovered node
    const h = hoverNode.current;
    cfg.edges.forEach(([a, b], i) => {
      const line = edgeRefs.current[i];
      if (!line) return;
      const mat = line.material as THREE.LineBasicMaterial;
      if (h === null) {
        mat.color.copy(cEdge);
        mat.opacity = 0.35;
      } else if (a === h || b === h) {
        mat.color.copy(cSignal);
        mat.opacity = 0.8;
      } else {
        mat.color.copy(cEdge);
        mat.opacity = 0.12;
      }
    });

    // Nodes: glow decays, hover + neighbours light up
    cfg.nodes.forEach((n) => {
      nodeGlow.current[n.id] = Math.max(0, (nodeGlow.current[n.id] || 0) - delta * 1.3);
      const mesh = meshRefs.current[n.id];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const glow = nodeGlow.current[n.id] ?? 0;
      if (h === n.id) {
        mat.color.copy(cSignal);
        mat.emissiveIntensity = 3.0;
        mesh.scale.setScalar(1.35);
      } else if (h !== null && adjacency[h]?.has(n.id)) {
        mat.color.copy(cSignal);
        mat.emissiveIntensity = 1.2;
        mesh.scale.setScalar(1.12);
      } else {
        mat.color.copy(cNode);
        mat.emissiveIntensity = glow * 2.5;
        mesh.scale.setScalar(1 + glow * 0.25);
      }
    });

    // Advance pulses along their path
    const done: number[] = [];
    pulses.current.forEach((pulse) => {
      pulse.progress += delta / HOP_DURATION;
      if (pulse.progress >= 1) {
        const arrived = pulse.path[pulse.hop + 1];
        if (arrived) nodeGlow.current[arrived] = 1;
        pulse.hop++;
        pulse.progress = 0;
        if (pulse.hop >= pulse.path.length - 1) {
          const pm = pulseRefs.current[pulse.slot];
          if (pm) pm.visible = false;
          slots.current.push(pulse.slot);
          done.push(pulse.id);
          return;
        }
      }
      const from = nodePos[pulse.path[pulse.hop]!];
      const to   = nodePos[pulse.path[pulse.hop + 1]!];
      if (!from || !to) return;
      tmpVec.lerpVectors(from, to, pulse.progress);
      const pm = pulseRefs.current[pulse.slot];
      if (pm) { pm.position.copy(tmpVec); pm.visible = true; }
    });
    if (done.length) pulses.current = pulses.current.filter((p) => !done.includes(p.id));
  });

  const onEnter = useCallback((id: string) => {
    hoverNode.current = id;
    setHoveredId(id);
    nodeGlow.current[id] = Math.min(1, (nodeGlow.current[id] || 0) + 0.6);
  }, []);

  const onLeave = useCallback(() => {
    hoverNode.current = null;
    setHoveredId(null);
  }, []);

  return (
    <group ref={groupRef} position={cfg.position} rotation={animate ? [0, 0, 0] : [0.08, 0.25, 0]}>
      {edgeGeos.map((geo, i) => (
        <lineSegments key={`edge-${i}`} geometry={geo} ref={(el) => { edgeRefs.current[i] = el; }}>
          <lineBasicMaterial color={cEdge} transparent opacity={0.35} />
        </lineSegments>
      ))}

      {cfg.nodes.map((node) => (
        <mesh
          key={node.id}
          position={node.pos}
          ref={(el) => { if (el) meshRefs.current[node.id] = el; }}
          onPointerEnter={(e) => { e.stopPropagation(); onEnter(node.id); }}
          onPointerLeave={(e) => { e.stopPropagation(); onLeave(); }}
        >
          <icosahedronGeometry args={[cfg.nodeSize, 1]} />
          <meshStandardMaterial color={cNode} emissive={cSignal} emissiveIntensity={0} toneMapped={false} />
          {node.showLabel && (
            <Html
              position={[0, 0.3, 0]}
              center
              distanceFactor={cfg.labelDistance}
              zIndexRange={[10, 0]}
              style={{
                fontSize: '9px',
                fontFamily: MONO,
                color: colors.labelFg,
                letterSpacing: '0.09em',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                background: colors.labelBg,
                padding: '1px 5px',
                borderRadius: '2px',
              }}
            >
              {node.label}
            </Html>
          )}
          {hoveredId === node.id && (
            <NodeTooltip nodeId={node.id} side={cfg.leftNodes.has(node.id) ? 'right' : 'left'} />
          )}
        </mesh>
      ))}

      {Array.from({ length: cfg.maxPulses }, (_, slot) => (
        <mesh key={`pulse-${slot}`} ref={(el) => { pulseRefs.current[slot] = el; }} visible={false}>
          <sphereGeometry args={[cfg.pulseSize, 8, 8]} />
          <meshStandardMaterial color={cSignal} emissive={cSignal} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HeroScene() {
  const reduced  = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const theme    = useTheme();
  const colors   = PALETTE[theme];
  const cfg      = isTablet ? TABLET : DESKTOP;

  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef    = useRef(true);
  const [visible, setVisible] = useState(true);

  // Pause the render loop when the hero scrolls out of view or the tab is hidden
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry?.isIntersecting ?? false;
      setVisible(!document.hidden && inViewRef.current);
    }, { threshold: 0 });
    observer.observe(el);
    const onVisibility = () => setVisible(!document.hidden && inViewRef.current);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <div
        className="hidden lg:flex"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '6%',
          fontFamily: MONO,
          fontSize: '11px',
          color: colors.labelFg,
          letterSpacing: '0.08em',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none',
        }}
      >
        <span style={{ color: colors.signal, fontSize: '8px' }}>●</span>
        LIVE — request flow
        <span style={{ opacity: 0.6, marginLeft: '6px' }}>· hover a node</span>
      </div>

      {/* The Canvas stays mounted; the render loop is paused via `frameloop` when off-screen.
          Unmounting it while drei <Html> portals exist throws removeChild errors in React 19. */}
      <Canvas
          key={`${theme}-${isTablet ? 'tablet' : 'desktop'}-${reduced ? 'static' : 'live'}`}
          camera={{ position: cfg.camera, fov: cfg.fov }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
          style={{ background: 'transparent', pointerEvents: 'auto' }}
          frameloop={reduced || !visible ? 'never' : 'always'}
        >
          <fog attach="fog" args={[colors.fog, cfg.fog[0], cfg.fog[1]]} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ambientLight intensity={0.45} />
          <Graph cfg={cfg} colors={colors} animate={!reduced} />
          {!reduced && (
            <EffectComposer>
              <Bloom intensity={theme === 'light' ? 0.25 : 0.4} luminanceThreshold={0.25} luminanceSmoothing={0.6} />
            </EffectComposer>
          )}
        </Canvas>
    </div>
  );
}
