import { useCallback, useRef } from "react";
import { radToDeg } from "../lib/neuro";

export interface DialHandle {
  angle: number; // radians
  color: string;
  label: string;
  onChange?: (angle: number) => void;
}

/**
 * A circular compass with one or more draggable angle handles.
 * Angles follow standard math convention (0 = +x/east, increasing counter-clockwise),
 * but are drawn with +y pointing up on screen.
 */
export function Dial({
  size = 240,
  handles,
  ticks = true,
}: {
  size?: number;
  handles: DialHandle[];
  ticks?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const center = size / 2;
  const radius = size * 0.38;

  const angleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      // screen y grows downward; flip to get standard math angle
      return Math.atan2(-y, x);
    },
    [center],
  );

  const startDrag = (handle: DialHandle) => (e: React.PointerEvent) => {
    if (!handle.onChange) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      handle.onChange!(angleFromEvent(ev.clientX, ev.clientY));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    handle.onChange(angleFromEvent(e.clientX, e.clientY));
  };

  const pt = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center - r * Math.sin(angle),
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, touchAction: "none" }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="var(--bg-sunken)"
        stroke="var(--border)"
      />
      {ticks &&
        Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const p1 = pt(a, radius - 6);
          const p2 = pt(a, radius);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--text-faint)"
              strokeWidth={1}
            />
          );
        })}
      <circle cx={center} cy={center} r={2.5} fill="var(--text-faint)" />
      {handles.map((h, i) => {
        const tip = pt(h.angle, radius - 14);
        const draggable = !!h.onChange;
        return (
          <g key={i}>
            <line
              x1={center}
              y1={center}
              x2={tip.x}
              y2={tip.y}
              stroke={h.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.85}
            />
            <circle
              cx={tip.x}
              cy={tip.y}
              r={draggable ? 11 : 7}
              fill={h.color}
              stroke="var(--bg-raised)"
              strokeWidth={2}
              style={{ cursor: draggable ? "grab" : "default" }}
              onPointerDown={startDrag(h)}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function angleLabel(angleRad: number): string {
  const deg = ((radToDeg(angleRad) % 360) + 360) % 360;
  return `${Math.round(deg)}°`;
}
