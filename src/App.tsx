import { motion } from "framer-motion";
import { Section, M, Eq, Callout, Figure } from "./components/Prose";
import { TuningCurveDemo } from "./components/TuningCurveDemo";
import { PopulationVectorDemo } from "./components/PopulationVectorDemo";
import { ErrorVsN } from "./components/ErrorVsN";

const NAV = [
  { id: "problem", label: "The problem" },
  { id: "one-neuron", label: "One neuron" },
  { id: "vector-form", label: "Vector form" },
  { id: "population", label: "Population vector" },
  { id: "why-it-works", label: "Why it works" },
  { id: "noise", label: "Noise & N" },
  { id: "modern", label: "Modern BCIs" },
];

function App() {
  return (
    <div>
      <Header />
      <Hero />

      <Section id="problem" eyebrow="Setting the scene" title="Guessing where a cursor is headed, from spikes alone">
        <p>
          When you reach for a cup of coffee, neurons in your motor cortex — a strip of brain
          tissue just in front of the central sulcus — start firing in patterns that encode the
          movement before your arm even moves. A <strong>brain-computer interface (BCI)</strong>{" "}
          reads those patterns with an implanted electrode array and tries to answer one
          question, over and over, many times a second:
        </p>
        <Callout kind="insight">
          Given the firing rates of a handful of neurons right now, which direction is the
          person trying to move?
        </Callout>
        <p>
          For someone with paralysis from spinal cord injury, ALS, or stroke, a good answer to
          that question — turned into cursor motion or a robotic arm — can restore a meaningful
          degree of independence. The question is also, underneath the neuroscience, a clean
          piece of applied math: an inverse problem of recovering an angle{" "}
          <M tex="\theta \in [0, 2\pi)" /> from a set of noisy, individually-unreliable
          measurements.
        </p>
        <p>
          The approach below is the one that first showed this was possible at all: the{" "}
          <strong>population vector</strong>, introduced by Apostolos Georgopoulos and
          colleagues in the early 1980s from recordings in monkey motor cortex during an
          arm-reaching task. It's decades old and far from the most accurate method used today,
          but it is the clearest window into <em>why</em> decoding movement from neurons works
          at all — and everything modern BCI decoders do is a more sophisticated descendant of
          this same idea.
        </p>
      </Section>

      <Section
        id="one-neuron"
        eyebrow="Step 1"
        title="A single neuron is a bad, biased compass"
      >
        <p>
          Record from one motor-cortex neuron while a monkey reaches in different directions,
          and a striking pattern shows up: the neuron doesn't just fire for "movement," it fires
          <em> most</em> for movement in one particular direction, its{" "}
          <strong>preferred direction (PD)</strong>, and less as the actual movement direction
          swings away from that one. Georgopoulos found this falls off almost exactly like a
          cosine:
        </p>
        <Eq
          tex={"d_i(\\theta) \\;=\\; b_{0,i} \\;+\\; b_{1,i}\\cos(\\theta - PD_i)"}
          label="cosine tuning law (Georgopoulos et al., 1982)"
        />
        <p>
          Here <M tex="\theta" /> is the movement direction, <M tex="d_i(\theta)" /> is neuron{" "}
          <M tex="i" />'s firing rate, <M tex="b_{0,i}" /> is its baseline rate when movement is
          directly opposite its preference, and <M tex="b_{1,i}" /> is how strongly its rate is
          modulated by direction. Play with the sliders below: drag the orange dot to move
          neuron's preferred direction, and the purple dot to choose a movement direction, and
          watch where that lands on the tuning curve.
        </p>
        <Figure caption="A single simulated neuron's tuning curve. The firing rate peaks exactly at the preferred direction and falls off as a cosine on either side.">
          <TuningCurveDemo />
        </Figure>
        <p>
          Notice the problem: the curve is broad. A firing rate of, say, 30 Hz is consistent with
          a fairly wide range of possible movement directions — and real neurons also have
          trial-to-trial noise on top of this curve, so the same movement direction doesn't even
          produce the exact same firing rate twice. One neuron, on its own, is a weak and
          ambiguous vote for any particular direction.
        </p>
      </Section>

      <Section id="vector-form" eyebrow="Step 2" title="Rewriting the tuning law as a dot product">
        <p>
          The cosine-difference structure is a hint: it's secretly a dot product. Using the angle
          subtraction identity <M tex="\cos(\theta-\phi)=\cos\theta\cos\phi+\sin\theta\sin\phi" />
          , define a movement vector and a per-neuron weight vector:
        </p>
        <Eq
          tex={
            "\\mathbf{M}(\\theta) = (\\cos\\theta,\\ \\sin\\theta), \\qquad \\mathbf{C}_i = b_{1,i}\\,(\\cos PD_i,\\ \\sin PD_i)"
          }
        />
        <p>Then the tuning law is exactly a linear function of the movement direction's unit vector:</p>
        <Eq tex={"d_i(\\theta) \\;=\\; b_{0,i} \\;+\\; \\mathbf{C}_i \\cdot \\mathbf{M}(\\theta)"} />
        <p>
          That's worth sitting with: each neuron is computing (is tuned to) the projection of the
          movement direction onto its own preferred-direction axis, scaled by its modulation
          depth. This reframing is what makes the decoding step — going the other way, from
          firing rates back to <M tex="\theta" /> — into a solvable vector problem instead of a
          biological mystery.
        </p>
      </Section>

      <Section
        id="population"
        eyebrow="Step 3"
        title="One bad vote, many times, sums to a good decode"
      >
        <p>
          Georgopoulos's decoding rule, the <strong>population vector</strong>, is almost
          embarrassingly simple given the setup above. For each neuron, normalize how far its
          current firing rate sits above or below baseline, relative to its own modulation
          depth, to get a weight:
        </p>
        <Eq tex={"w_i(\\theta) \\;=\\; \\frac{d_i(\\theta) - b_{0,i}}{b_{1,i}}"} />
        <p>
          then use that weight to scale a unit vector pointing along that neuron's preferred
          direction, <M tex="\mathbf{u}_i = (\cos PD_i,\sin PD_i)" />, and simply add up every
          neuron's vote:
        </p>
        <Eq
          tex={"\\mathbf{V}(\\theta) \\;=\\; \\sum_{i=1}^{N} w_i(\\theta)\\, \\mathbf{u}_i"}
          label="population vector"
        />
        <p>
          The direction of <M tex="\mathbf{V}" /> is the decoded movement direction. That's the
          entire algorithm. Try it below with a simulated population — set the true movement
          direction, and watch each neuron cast its (weak, noisy) vote and the population sum
          lock onto something much closer to the truth than any individual neuron managed on its
          own.
        </p>
        <Figure caption="Each gray spoke is one neuron's weighted vote. The dashed orange line is the true movement direction; the solid purple line is the population vector's decode.">
          <PopulationVectorDemo />
        </Figure>
      </Section>

      <Section id="why-it-works" eyebrow="Step 4" title="Why summing votes recovers the true direction">
        <p>
          This isn't a coincidence, and we don't have to take it on faith — it falls out of a
          short integral. Suppose, for a moment, that preferred directions are smoothly and
          evenly distributed around the circle, with density <M tex="\rho" /> neurons per radian.
          Replace the discrete sum in <M tex="\mathbf{V}(\theta)" /> with the corresponding
          integral over preferred direction <M tex="\phi" />:
        </p>
        <Eq
          tex={
            "\\mathbf{V}(\\theta) \\;\\approx\\; \\rho \\int_0^{2\\pi} \\cos(\\theta-\\phi)\\,(\\cos\\phi,\\ \\sin\\phi)\\, d\\phi"
          }
        />
        <p>Expand each component using the same angle-subtraction identity and integrate term by term:</p>
        <Eq
          tex={
            "\\int_0^{2\\pi}\\cos(\\theta-\\phi)\\cos\\phi\\,d\\phi = \\pi\\cos\\theta, \\qquad \\int_0^{2\\pi}\\cos(\\theta-\\phi)\\sin\\phi\\,d\\phi = \\pi\\sin\\theta"
          }
        />
        <p>since <M tex="\int_0^{2\pi}\cos^2\phi\,d\phi=\int_0^{2\pi}\sin^2\phi\,d\phi=\pi" /> and the cross term <M tex="\int_0^{2\pi}\sin\phi\cos\phi\,d\phi=0" />. Putting the two components back together:</p>
        <Eq tex={"\\mathbf{V}(\\theta)\\ \\approx\\ \\rho\\pi\\,(\\cos\\theta,\\ \\sin\\theta)"} />
        <p>
          The population vector points <em>exactly</em> along the true movement direction, scaled
          by a constant that depends only on how many neurons you have, not which direction they
          prefer. A population that evenly samples preferred directions is, in the limit, an
          unbiased direction detector — even though it's built entirely out of individually
          biased, individually ambiguous neurons.
        </p>
        <Callout>
          This is the same trick behind a lot of applied math: a basis that doesn't look special
          component-by-component (here, cosine-tuned neurons pointing every which way) can still
          sum to something exact, as long as it covers the space symmetrically enough.
        </Callout>
      </Section>

      <Section id="noise" eyebrow="Step 5" title="Real neurons are noisy — more neurons still wins">
        <p>
          Real recordings never have a perfectly smooth, infinite, noise-free population. Firing
          rates vary trial to trial around the tuning curve, and you only ever get to record from
          a finite handful of neurons — tens or low hundreds, out of the roughly{" "}
          <M tex="10^5" /> motor neurons involved in a single reach. The integral argument above
          is the noiseless, infinite-population limit; with a finite noisy population, each
          neuron's vote has some random error, but those errors are largely independent across
          neurons; averaging <M tex="N" /> of them shrinks the noise in the sum roughly like{" "}
          <M tex="1/\sqrt{N}" />, the same reasoning behind the law of large numbers. The signal
          — every neuron's vote pointing on average toward the true direction — doesn't cancel,
          so it survives this averaging while the noise does not.
        </p>
        <p>You can see this directly by simulating many noisy trials and plotting average decoding error against population size:</p>
        <Figure caption="Each point averages decoding error over many simulated noisy trials at a fixed true movement direction, for a population of that size. Try turning the noise slider up — more neurons matters more when neurons are noisier.">
          <ErrorVsN />
        </Figure>
        <p>
          This is the quantitative version of "no single neuron can tell you much, but a
          population can" — and it's the reason BCI engineers spend so much effort on electrode
          arrays that record from as many neurons as possible.
        </p>
      </Section>

      <Section id="modern" eyebrow="Where this goes next" title="From a hand-derived vector sum to learned decoders">
        <p>
          The population vector is linear, hand-derived, and assumes cosine tuning — convenient
          for a 1986 paper (and for an explainer like this one), but modern BCIs mostly don't use
          it directly anymore. The same underlying problem — map a high-dimensional, noisy
          pattern of neural activity onto an intended movement — is now usually solved with
          statistical decoders fit to each person's data: Kalman filters, and increasingly,
          trained neural networks.
        </p>
        <p>
          A striking recent example is Willett et al.'s 2021 <em>Nature</em> paper, which decoded
          attempted <em>handwriting</em> — not reaching, but imagined pen strokes — from motor
          cortex using a recurrent neural network, reaching communication rates competitive with
          typical smartphone typing for a person with paralysis. The RNN there learns a far more
          complex, nonlinear mapping than a cosine-weighted vector sum, but it is answering the
          exact same question this page started with: given these spikes, what movement was
          intended? A closer look at how that decoder works — and how it relates to the linear
          picture above — is a natural next addition to this site.
        </p>
      </Section>

      <References />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur"
      style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
        <a href="#top" className="font-serif-display text-[15px] font-medium" style={{ color: "var(--text)" }}>
          Decoding Movement
        </a>
        <nav className="hidden gap-5 text-[13px] lg:flex" style={{ color: "var(--text-muted)" }}>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="hover:opacity-70" style={{ color: "inherit" }}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div id="top" className="mx-auto max-w-[820px] px-6 pt-20 pb-10 text-center md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
          The math of brain-computer interfaces
        </div>
        <h1 className="font-serif-display text-[40px] font-medium leading-[1.1] md:text-[56px]" style={{ color: "var(--text)" }}>
          Decoding movement
          <br /> from the brain
        </h1>
        <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-[1.65]" style={{ color: "var(--text-muted)" }}>
          How a handful of noisy, individually-unreliable neurons combine into a precise guess
          about where you intend to move — an interactive walkthrough of Georgopoulos's
          population vector model.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-10 text-[13px]"
        style={{ color: "var(--text-faint)" }}
      >
        scroll to begin ↓
      </motion.div>
    </div>
  );
}

function References() {
  return (
    <Section id="references" eyebrow="Sources" title="References & data">
      <ul className="list-disc space-y-3 pl-5">
        <li>
          Georgopoulos, A. P., Kalaska, J. F., Caminiti, R., &amp; Massey, J. T. (1982).{" "}
          <em>On the relations between the direction of two-dimensional arm movements and cell
          discharge in primate motor cortex.</em> Journal of Neuroscience, 2(11), 1527–1537.
        </li>
        <li>
          Georgopoulos, A. P., Schwartz, A. B., &amp; Kettner, R. E. (1986).{" "}
          <em>Neuronal population coding of movement direction.</em> Science, 233(4771), 1416–1419.
        </li>
        <li>
          Willett, F. R., Avansino, D. T., Hochberg, L. R., Henderson, J. M., &amp; Shenoy, K. V.
          (2021). <em>High-performance brain-to-text communication via handwriting.</em> Nature,
          593, 249–254.
        </li>
        <li>
          Simulated neuron data on this page follows the cosine-tuning model from the papers
          above; it is synthetic, generated in-browser. A later revision may incorporate recorded
          data from{" "}
          <a
            href="https://github.com/Brain-AI-Interface-lab/Population-vector-decoding"
            target="_blank"
            rel="noreferrer"
          >
            Brain-AI-Interface-lab/Population-vector-decoding
          </a>
          .
        </li>
      </ul>
    </Section>
  );
}

function Footer() {
  return (
    <footer
      className="mx-auto max-w-[760px] px-6 py-12 text-center text-[13px]"
      style={{ color: "var(--text-faint)", borderTop: "1px solid var(--border)" }}
    >
      Built as a math communication project exploring the mathematics of neural decoding and
      brain-computer interfaces.
    </footer>
  );
}

export default App;
