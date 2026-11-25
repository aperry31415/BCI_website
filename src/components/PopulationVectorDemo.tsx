import { useMemo, useState } from "react";
import { angleLabel } from "./Dial";
import {
  makePopulation,
  tuningResponse,
  populationVector,
  vecAngle,
  angularErrorDeg,
  mulberry32,
  gaussian,
} from "../lib/neuro";

export function PopulationVectorDemo() {
  const [trueTheta, setTrueTheta] = useState(Math.PI / 6);
  const [n, setN] = useState(16);
  const [noiseOn, setNoiseOn] = useState(true);
  const [trial, setTrial] = useState(0);

  const neurons = useMemo(() => makePopulation(n, 7), [n]);

  const noise = useMemo(() => {
    const rand = mulberry32(1000 + trial * 37 + n);
    return neurons.map(() => gaussian(rand, 0, 7));
  }, [neurons, trial, n]);

  const rates = neurons.map((nr, i) =>
    Math.max(0, tuningResponse(trueTheta, nr) + (noiseOn ? noise[i] : 0)),
  );

  const pv = populationVector(neurons, rates);
  const decodedAngle = vecAngle(pv);
  const error = angularErrorDeg(decodedAngle, trueTheta);

  const size = 280;
  const center = size / 2;
  const radius = size * 0.38;
  const spokeScale = radius * 0.62;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
            <circle cx={center} cy={center} r={radius} fill="var(--bg-sunken)" stroke="var(--border)" />

            {/* individual neuron contribution vectors */}
            {neurons.map((nr, i) => {
              const w = (rates[i] - nr.b0) / nr.b1;
              const x2 = center + w * spokeScale * Math.cos(nr.pd);
              const y2 = center - w * spokeScale * Math.sin(nr.pd);
              return (
                <line
                  key={nr.id}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="var(--text-faint)"
                  strokeWidth={1.4}
                  opacity={0.55}
                />
              );
            })}

            {/* true direction (dashed) */}
            <DragArrow
              svgSize={size}
              center={center}
              radius={radius * 0.97}
              angle={trueTheta}
              color="var(--accent-2)"
              dashed
              onChange={setTrueTheta}
            />
            {/* decoded population vector (solid) */}
            <DragArrow
              svgSize={size}
              center={center}
              radius={radius * 0.97}
              angle={decodedAngle}
              color="var(--accent)"
            />
          </svg>
          <div className="flex flex-wrap justify-center gap-4 text-[13px]" style={{ color: "var(--text-faint)" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4" style={{ background: "var(--accent-2)" }} />
              true direction {angleLabel(trueTheta)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4" style={{ background: "var(--accent)" }} />
              decoded {angleLabel(decodedAngle)}
            </span>
          </div>
          <p className="text-center text-[13px]" style={{ color: "var(--text-faint)" }}>
            Drag the orange line to set the true movement direction.
          </p>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-xl px-5 py-4 text-center"
            style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
          >
            <div className="text-[13px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              angular decoding error
            </div>
            <div className="mt-1 text-[30px] font-semibold" style={{ color: "var(--accent)" }}>
              {error.toFixed(1)}°
            </div>
          </div>

          <label className="block">
            <div className="mb-1.5 flex justify-between text-[14px]" style={{ color: "var(--text)" }}>
              <span>number of neurons</span>
              <span style={{ color: "var(--text-faint)" }}>{n}</span>
            </div>
            <input
              type="range"
              min={1}
              max={80}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[14px]" style={{ color: "var(--text)" }}>
              <input
                type="checkbox"
                checked={noiseOn}
                onChange={(e) => setNoiseOn(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              add trial-to-trial noise
            </label>
            <button
              onClick={() => setTrial((t) => t + 1)}
              disabled={!noiseOn}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition disabled:opacity-40"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              resample trial
            </button>
          </div>

          <p className="text-[14.5px] leading-[1.65]" style={{ color: "var(--text-muted)" }}>
            Each thin gray line is one neuron's contribution — pointing along its preferred
            direction, scaled by how far its (noisy) firing rate sits above or below baseline.
            Summing all of them gives the thick purple decode. Push the neuron count down and
            the decode gets noticeably worse; push it up and it locks onto the true direction
            even though no single neuron is a reliable compass by itself.
          </p>
        </div>
      </div>
    </div>
  );
}

function DragArrow({
  svgSize,
  center,
  radius,
  angle,
  color,
  dashed,
  onChange,
}: {
  svgSize: number;
  center: number;
  radius: number;
  angle: number;
  color: string;
  dashed?: boolean;
  onChange?: (a: number) => void;
}) {
  const x2 = center + radius * Math.cos(angle);
  const y2 = center - radius * Math.sin(angle);

  const handlePointer = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!onChange) return;
    const svg = (e.target as SVGElement).ownerSVGElement;
    if (!svg) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const compute = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const scale = svgSize / rect.width;
      const x = (clientX - rect.left) * scale - center;
      const y = (clientY - rect.top) * scale - center;
      onChange(Math.atan2(-y, x));
    };
    compute(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => compute(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <g>
      <line
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={dashed ? 2 : 3}
        strokeDasharray={dashed ? "6 4" : undefined}
        strokeLinecap="round"
      />
      <circle
        cx={x2}
        cy={y2}
        r={onChange ? 10 : 6}
        fill={color}
        stroke="var(--bg-raised)"
        strokeWidth={2}
        style={{ cursor: onChange ? "grab" : "default" }}
        onPointerDown={handlePointer}
      />
    </g>
  );
}
