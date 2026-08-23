"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketplaceWorkspaceRecord } from "../../lib/marketplace-v12-workspaces";
import styles from "./MarketplaceSpatialStage.module.css";

type SceneNode = Pick<MarketplaceWorkspaceRecord, "productId" | "name" | "family" | "sceneCluster" | "positionSeed" | "relationshipProductIds" | "objectArchetype">;
type View = { yaw: number; pitch: number; zoom: number; panX: number; panY: number };

function hash(value: string) { let valueHash = 2166136261; for (let index = 0; index < value.length; index += 1) valueHash = Math.imul(valueHash ^ value.charCodeAt(index), 16777619); return valueHash >>> 0; }
function color(value: string) { return [[0.15, 0.78, 0.94], [0.97, 0.72, 0.26], [0.55, 0.52, 0.98], [0.28, 0.88, 0.64], [0.97, 0.38, 0.5]][hash(value) % 5]; }
function location(node: SceneNode) { const seed = Math.abs(node.positionSeed) || hash(node.productId), cluster = hash(node.sceneCluster), clusterAngle = (cluster % 628) / 100, clusterRadius = 0.18 + ((Math.floor(cluster / 628) % 5) * 0.11), localAngle = (seed % 628) / 100, localRadius = 0.025 + ((Math.floor(seed / 628) % 100) / 1000); return [Math.cos(clusterAngle) * clusterRadius + Math.cos(localAngle) * localRadius, Math.sin(clusterAngle) * clusterRadius + Math.sin(localAngle) * localRadius, ((Math.floor(seed / 97) % 100) / 100) - 0.5] as const; }
function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export default function MarketplaceSpatialStage({ label, nodes, selectedId, onSelect, emptyMessage }: { label: string; nodes: SceneNode[]; selectedId?: string | null; onSelect?: (node: SceneNode) => void; emptyMessage: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const redraw = useRef<(() => void) | null>(null);
  const geometry = useRef<{ node: SceneNode; x: number; y: number; radius: number }[]>([]);
  const view = useRef<View>({ yaw: -0.35, pitch: 0.18, zoom: 1, panX: 0, panY: 0 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [mode, setMode] = useState<"loading" | "ready" | "fallback">("loading");
  const visible = useMemo(() => nodes.slice(0, 48), [nodes]);

  useEffect(() => {
    const element = canvas.current;
    if (!element || visible.length === 0) { setMode("fallback"); return; }
    const gl = element.getContext("webgl2", { alpha: true, antialias: true }) ?? element.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) { setMode("fallback"); return; }
    const compile = (kind: number, source: string) => { const shader = gl.createShader(kind); if (!shader) throw new Error("WebGL shader creation failed"); gl.shaderSource(shader, source); gl.compileShader(shader); return shader; };
    const program = gl.createProgram();
    const lineProgram = gl.createProgram();
    if (!program || !lineProgram) { setMode("fallback"); return; }
    const vertex = compile(gl.VERTEX_SHADER, "attribute vec3 p;attribute vec3 c;attribute float s;varying vec3 v;void main(){float d=1.0+p.z*.30;gl_Position=vec4(p.xy*d,p.z,1.0);gl_PointSize=s*d;v=c;}");
    const fragment = compile(gl.FRAGMENT_SHADER, "precision mediump float;varying vec3 v;void main(){vec2 d=gl_PointCoord-vec2(.5);if(dot(d,d)>.25)discard;gl_FragColor=vec4(v,1.0-dot(d,d)*2.0);}");
    const lineVertex = compile(gl.VERTEX_SHADER, "attribute vec3 p;void main(){float d=1.0+p.z*.30;gl_Position=vec4(p.xy*d,p.z,1.0);}");
    const lineFragment = compile(gl.FRAGMENT_SHADER, "precision mediump float;void main(){gl_FragColor=vec4(.19,.70,.84,.48);}");
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.attachShader(lineProgram, lineVertex); gl.attachShader(lineProgram, lineFragment); gl.linkProgram(lineProgram);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !gl.getProgramParameter(lineProgram, gl.LINK_STATUS) || !gl.getShaderParameter(vertex, gl.COMPILE_STATUS) || !gl.getShaderParameter(fragment, gl.COMPILE_STATUS) || !gl.getShaderParameter(lineVertex, gl.COMPILE_STATUS) || !gl.getShaderParameter(lineFragment, gl.COMPILE_STATUS)) { setMode("fallback"); return; }
    const draw = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2), width = Math.max(1, Math.floor(element.clientWidth * ratio)), height = Math.max(1, Math.floor(element.clientHeight * ratio));
      if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
      const camera = view.current, cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw), cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
      const positions = visible.map((node) => { const [x, y, z] = location(node), yawX = x * cy - z * sy, yawZ = x * sy + z * cy, pitchY = y * cp - yawZ * sp, pitchZ = y * sp + yawZ * cp; return [yawX * camera.zoom + camera.panX, pitchY * camera.zoom + camera.panY, pitchZ] as const; });
      const indexes = new Map(visible.map((node, index) => [node.productId, index])); const points: number[] = []; const links: number[] = [];
      visible.forEach((node, index) => { const [x, y, z] = positions[index], nodeColor = color(node.family); points.push(x, y, z, ...nodeColor, (8 + (hash(node.productId) % 5)) * (node.productId === selectedId ? 1.55 : 1)); node.relationshipProductIds.forEach((targetId) => { const target = indexes.get(targetId); if (target !== undefined && index < target) links.push(...positions[index], ...positions[target]); }); });
      gl.viewport(0, 0, width, height); gl.clearColor(0.01, 0.05, 0.08, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      if (links.length) { const lineBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(links), gl.STATIC_DRAW); gl.useProgram(lineProgram); const linePosition = gl.getAttribLocation(lineProgram, "p"); gl.enableVertexAttribArray(linePosition); gl.vertexAttribPointer(linePosition, 3, gl.FLOAT, false, 12, 0); gl.drawArrays(gl.LINES, 0, links.length / 3); gl.deleteBuffer(lineBuffer); }
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW); gl.useProgram(program); const pointPosition = gl.getAttribLocation(program, "p"), pointColor = gl.getAttribLocation(program, "c"), pointSize = gl.getAttribLocation(program, "s"); gl.enableVertexAttribArray(pointPosition); gl.enableVertexAttribArray(pointColor); gl.enableVertexAttribArray(pointSize); gl.vertexAttribPointer(pointPosition, 3, gl.FLOAT, false, 28, 0); gl.vertexAttribPointer(pointColor, 3, gl.FLOAT, false, 28, 12); gl.vertexAttribPointer(pointSize, 1, gl.FLOAT, false, 28, 24); gl.drawArrays(gl.POINTS, 0, visible.length); gl.deleteBuffer(buffer);
      geometry.current = visible.map((node, index) => { const [x, y, z] = positions[index], depth = 1 + z * .3; return { node, x: ((x * depth) + 1) * .5 * element.clientWidth, y: (1 - ((y * depth) + 1) * .5) * element.clientHeight, radius: 14 }; }); setMode("ready");
    };
    redraw.current = draw; const observer = new ResizeObserver(draw); observer.observe(element); draw();
    const contextLost = (event: Event) => { event.preventDefault(); setMode("fallback"); };
    element.addEventListener("webglcontextlost", contextLost, false);
    return () => { observer.disconnect(); element.removeEventListener("webglcontextlost", contextLost); gl.deleteProgram(program); gl.deleteProgram(lineProgram); gl.deleteShader(vertex); gl.deleteShader(fragment); gl.deleteShader(lineVertex); gl.deleteShader(lineFragment); };
  }, [visible, selectedId]);

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => { drag.current = { x: event.clientX, y: event.clientY, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); };
  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!drag.current) return; const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y; if (Math.abs(dx) + Math.abs(dy) > 2) drag.current.moved = true; view.current.yaw += dx * .009; view.current.pitch = Math.max(-1.1, Math.min(1.1, view.current.pitch + dy * .009)); drag.current.x = event.clientX; drag.current.y = event.clientY; redraw.current?.(); };
  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => { const moved = drag.current?.moved; drag.current = null; if (moved || !onSelect) return; const box = event.currentTarget.getBoundingClientRect(), x = event.clientX - box.left, y = event.clientY - box.top; const hit = geometry.current.reduce<{ item: typeof geometry.current[number]; distance: number } | null>((nearest, item) => { const distance = Math.hypot(item.x - x, item.y - y); return distance <= item.radius && (!nearest || distance < nearest.distance) ? { item, distance } : nearest; }, null); if (hit) onSelect(hit.item.node); };
  const wheel = (event: React.WheelEvent<HTMLCanvasElement>) => { event.preventDefault(); view.current.zoom = Math.max(.65, Math.min(1.9, view.current.zoom * (event.deltaY > 0 ? .9 : 1.1))); redraw.current?.(); };

  return <section className={styles.stage} aria-label={label}>
    <div className={styles.canvasShell} data-mode={mode}>
      {visible.length > 0 && <canvas ref={canvas} role="application" tabIndex={0} aria-label={`${label}. Drag to orbit, use the scroll wheel to zoom, and select a plotted catalog record.`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onWheel={wheel} />}
      {mode !== "ready" && <div className={styles.staticMap} aria-hidden="true"><i /><i /><i /><b>OBSERRA<br />EPI</b></div>}
      <p className={styles.status}>{visible.length === 0 ? emptyMessage : mode === "ready" ? "Catalog-derived spatial projection. Lines appear only for declared relationships inside this bounded selection." : "A semantic spatial projection remains available while WebGL is unavailable."}</p>
    </div>
    {visible.length > 0 && <div className={styles.index} aria-label={`${label} semantic scene index`}><span>Semantic scene index</span><div>{visible.map((node) => <button type="button" key={node.productId} aria-pressed={node.productId === selectedId} onClick={() => onSelect?.(node)}><b>{initials(node.name)}</b><span>{node.name}</span><small>{node.objectArchetype?.replace(/-/g, " ") ?? node.family}</small></button>)}</div></div>}
  </section>;
}
