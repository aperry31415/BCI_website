import { useMemo, useState } from "react";
import { simulateErrorVsN, degToRad } from "../lib/neuro";

const NS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96];

export function ErrorVsN() {
  const [noiseStd, setNoiseStd] = useState(8);

  const data = useMemo(() => {
    // average over several true directions and seeds for a stable, representative curve
    const seeds = [11, 23, 47, 101];
    const runs = seeds.map((seed) =>
      simulateErrorVsN(degToRad(35 + seed), NS, { trials: 200, noiseStd, seed }),
    );
    return NS.map((n, i) => ({
      n,
      meanError: runs.reduce((sum, r) => sum + r[i].meanError, 0) / runs.length,
    }));
  }, [noiseStd]);

  const W = 520;
  const H = 240;
  const padL = 42;
  const padB = 32;
  const padT = 14;
  const padR = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxN = NS[NS.length - 1];
  const maxErr = 90;

  const xFor = (n: number) => padL + (Math.log(n) / Math.log(maxN)) * plotW;
  const yFor = (e: number) => padT + plotH - (Math.min(e, maxErr) / maxErr) * plotH;

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(d.n).toFixed(1)} ${yFor(d.meanError).toFixed(1)}`)
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--border)" />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--border)" />
        {[1, 2, 4, 8, 16, 32, 64].map((n) => (
          <g key={n}>
            <line x1={xFor(n)} y1={padT + plotH} x2={xFor(n)} y2={padT + plotH + 4} stroke="var(--border)" />
            <text x={xFor(n)} y={padT + plotH + 17} fontSize="11" textAnchor="middle" fill="var(--text-faint)">
              {n}
            </text>
          </g>
        ))}
        {[0, 30, 60, 90].map((e) => (
          <g key={e}>
            <line x1={padL - 4} y1={yFor(e)} x2={padL} y2={yFor(e)} stroke="var(--border)" />
            <text x={padL - 8} y={yFor(e) + 4} fontSize="11" textAnchor="end" fill="var(--text-faint)">
              {e}°
            </text>
          </g>
        ))}
        <text x={padL + plotW / 2} y={H - 2} fontSize="11.5" textAnchor="middle" fill="var(--text-faint)">
          number of neurons (log scale)
        </text>
        <text
          x={10}
          y={padT + plotH / 2}
          fontSize="11.5"
          textAnchor="middle"
          fill="var(--text-faint)"
          transform={`rotate(-90 10 ${padT + plotH / 2})`}
        >
          mean error
        </text>

        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        {data.map((d) => (
          <circle key={d.n} cx={xFor(d.n)} cy={yFor(d.meanError)} r={3.5} fill="var(--accent)" />
        ))}
      </svg>

      <label className="mt-2 block">
        <div className="mb-1.5 flex justify-between text-[14px]" style={{ color: "var(--text)" }}>
          <span>per-trial noise (std. dev. of firing rate)</span>
          <span style={{ color: "var(--text-faint)" }}>{noiseStd} Hz</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          value={noiseStd}
          onChange={(e) => setNoiseStd(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </label>
    </div>
  );
}
