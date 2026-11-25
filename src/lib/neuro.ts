// Core math for the cosine-tuning / population-vector model (Georgopoulos et al., 1982, 1986).

export interface Neuron {
  id: number;
  pd: number; // preferred direction, radians
  b0: number; // baseline firing rate (spikes/s)
  b1: number; // modulation depth (spikes/s)
}

export const TAU = Math.PI * 2;

export function degToRad(deg: number): number {
  return (deg / 180) * Math.PI;
}

export function radToDeg(rad: number): number {
  return (rad / Math.PI) * 180;
}

/** Wrap an angle in radians to (-PI, PI]. */
export function wrapAngle(rad: number): number {
  let a = rad % TAU;
  if (a > Math.PI) a -= TAU;
  if (a <= -Math.PI) a += TAU;
  return a;
}

/** Smallest absolute angular difference between two angles, in degrees, range [0, 180]. */
export function angularErrorDeg(aRad: number, bRad: number): number {
  return Math.abs(radToDeg(wrapAngle(aRad - bRad)));
}

/** Cosine tuning law: d(theta) = b0 + b1 * cos(theta - PD). */
export function tuningResponse(theta: number, neuron: Pick<Neuron, "pd" | "b0" | "b1">): number {
  return neuron.b0 + neuron.b1 * Math.cos(theta - neuron.pd);
}

/** Build a population of neurons with preferred directions spread evenly around the circle,
 * each with a small amount of randomness in baseline / modulation depth so they aren't identical. */
export function makePopulation(n: number, seed = 1): Neuron[] {
  const rand = mulberry32(seed);
  const neurons: Neuron[] = [];
  for (let i = 0; i < n; i++) {
    // jittered-even spacing: realistic (not perfectly uniform) but well covering the circle
    const base = (i / n) * TAU;
    const jitter = (rand() - 0.5) * (TAU / n) * 0.6;
    neurons.push({
      id: i,
      pd: base + jitter,
      b0: 20 + rand() * 10, // 20-30 Hz baseline
      b1: 12 + rand() * 10, // 12-22 Hz modulation depth
    });
  }
  return neurons;
}

/** Deterministic PRNG so demos are reproducible across renders. */
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller gaussian sample using a supplied RNG. */
export function gaussian(rand: () => number, mean = 0, std = 1): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2);
  return mean + std * z;
}

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Population vector decode: each neuron "votes" for its preferred direction,
 * weighted by how far its firing rate is above baseline (relative to its own
 * modulation depth so all neurons are on the same scale). The vote vectors
 * are summed to produce the population estimate.
 */
export function populationVector(
  neurons: Neuron[],
  firingRates: number[],
): Vec2 {
  let x = 0;
  let y = 0;
  for (let i = 0; i < neurons.length; i++) {
    const n = neurons[i];
    const w = (firingRates[i] - n.b0) / n.b1; // roughly in [-1, 1]
    x += w * Math.cos(n.pd);
    y += w * Math.sin(n.pd);
  }
  return { x, y };
}

export function vecAngle(v: Vec2): number {
  return Math.atan2(v.y, v.x);
}

export function vecMag(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

/**
 * Simulate decoding error as a function of population size, averaged over many
 * noisy trials, for a fixed true movement direction.
 */
export function simulateErrorVsN(
  trueTheta: number,
  ns: number[],
  opts: { trials?: number; noiseStd?: number; seed?: number } = {},
): { n: number; meanError: number }[] {
  const { trials = 60, noiseStd = 8, seed = 42 } = opts;
  const rand = mulberry32(seed);
  const maxN = Math.max(...ns);
  const fullPop = makePopulation(maxN, seed + 1);

  return ns.map((n) => {
    const neurons = fullPop.slice(0, n);
    let total = 0;
    for (let t = 0; t < trials; t++) {
      const rates = neurons.map((nr) =>
        Math.max(0, tuningResponse(trueTheta, nr) + gaussian(rand, 0, noiseStd)),
      );
      const pv = populationVector(neurons, rates);
      total += angularErrorDeg(vecAngle(pv), trueTheta);
    }
    return { n, meanError: total / trials };
  });
}
