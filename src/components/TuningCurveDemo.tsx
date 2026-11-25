import { useMemo, useState } from "react";
import { Dial, angleLabel } from "./Dial";
import { tuningResponse, radToDeg } from "../lib/neuro";

const B0 = 24; // baseline, spikes/s
const B1 = 18; // modulation depth, spikes/s

export function TuningCurveDemo() {
  const [pd, setPd] = useState(Math.PI / 4); // preferred direction, radians
  const [theta, setTheta] = useState(0); // current movement direction, radians

  const rate = tuningResponse(theta, { pd, b0: B0, b1: B1 });

  const curve = useMemo(() => {
    const pts: { deg: number; rate: number }[] = [];
    for (let d = -180; d <= 180; d += 4) {
      pts.push({ deg: d, rate: tuningResponse((d * Math.PI) / 180, { pd, b0: B0, b1: B1 }) });
    }
    return pts;
  }, [pd]);

  const W = 460;
  const H = 220;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const padR = 10;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxRate = B0 + B1 + 4;

  const xForDeg = (deg: number) => padL + ((deg + 180) / 360) * plotW;
  const yForRate = (r: number) => padT + plotH - (r / maxRate) * plotH;

  const pdDeg = (((radToDeg(pd) % 360) + 540) % 360) - 180;
  const thetaDegSigned = (((radToDeg(theta) % 360) + 540) % 360) - 180;

  const pathD = curve
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xForDeg(p.deg).toFixed(1)} ${yForRate(p.rate).toFixed(1)}`)
    .join(" ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
      <div className="flex flex-col items-center gap-2">
        <Dial
          size={190}
          handles={[
            { angle: pd, color: "var(--accent-2)", label: "Preferred direction", onChange: setPd },
            { angle: theta, color: "var(--accent)", label: "Movement direction", onChange: setTheta },
          ]}
        />
        <div className="flex gap-4 text-[13px]" style={{ color: "var(--text-faint)" }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-2)" }} />
            preferred dir. {angleLabel(pd)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
            movement dir. {angleLabel(theta)}
          </span>
        </div>
        <p className="text-center text-[13px]" style={{ color: "var(--text-faint)" }}>
          Drag either dot.
        </p>
      </div>

      <div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%">
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--border)" />
          <line
            x1={padL}
            y1={padT + plotH}
            x2={padL + plotW}
            y2={padT + plotH}
            stroke="var(--border)"
          />
          {[-180, -90, 0, 90, 180].map((d) => (
            <g key={d}>
              <line
                x1={xForDeg(d)}
                y1={padT + plotH}
                x2={xForDeg(d)}
                y2={padT + plotH + 4}
                stroke="var(--border)"
              />
              <text
                x={xForDeg(d)}
                y={padT + plotH + 17}
                fontSize="11"
                textAnchor="middle"
                fill="var(--text-faint)"
              >
                {d}°
              </text>
            </g>
          ))}
          <text
            x={padL - 8}
            y={padT + 6}
            fontSize="11"
            textAnchor="end"
            fill="var(--text-faint)"
          >
            {Math.round(maxRate)}
          </text>
          <text
            x={padL - 8}
            y={padT + plotH}
            fontSize="11"
            textAnchor="end"
            fill="var(--text-faint)"
          >
            0
          </text>
          <text
            x={padL + plotW / 2}
            y={H - 2}
            fontSize="11.5"
            textAnchor="middle"
            fill="var(--text-faint)"
          >
            movement direction θ
          </text>
          <text
            x={12}
            y={padT + plotH / 2}
            fontSize="11.5"
            textAnchor="middle"
            fill="var(--text-faint)"
            transform={`rotate(-90 12 ${padT + plotH / 2})`}
          >
            firing rate (Hz)
          </text>

          {/* curve */}
          <path d={pathD} fill="none" stroke="var(--accent-2)" strokeWidth={2.5} />

          {/* PD marker */}
          <line
            x1={xForDeg(pdDeg)}
            y1={padT}
            x2={xForDeg(pdDeg)}
            y2={padT + plotH}
            stroke="var(--accent-2)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />

          {/* current point */}
          <line
            x1={xForDeg(thetaDegSigned)}
            y1={padT}
            x2={xForDeg(thetaDegSigned)}
            y2={padT + plotH}
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <circle
            cx={xForDeg(thetaDegSigned)}
            cy={yForRate(rate)}
            r={6}
            fill="var(--accent)"
            stroke="var(--bg-raised)"
            strokeWidth={2}
          />
        </svg>
        <div
          className="mt-1 rounded-lg px-4 py-2.5 text-center text-[15px]"
          style={{ background: "var(--bg-sunken)", color: "var(--text)" }}
        >
          firing rate at θ&nbsp;=&nbsp;{angleLabel(theta)} is{" "}
          <strong style={{ color: "var(--accent)" }}>{rate.toFixed(1)} Hz</strong>
        </div>
      </div>
    </div>
  );
}
