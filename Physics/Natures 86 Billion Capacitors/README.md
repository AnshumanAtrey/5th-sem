# 86 Billion Capacitors: The Physics of a Thought

Physics viva topic. Plan for a 5–10 slide PDF, told as a story.

Every number in this file was checked against primary papers, textbooks (Kandel, Purves, Dayan & Abbott), the Nobel Prize site, FDA records or CODATA. Claims that were flagged got a second, independent check. Sources are listed at the end.

---

## The story arc

**Start:** a dead frog's leg twitches (1791). **End:** physicists read and write the brain's signals (2024).

**The thread:** you already know every part of a neuron from the physics syllabus.

| Neuron part | Circuit part | Physics concept |
|---|---|---|
| Membrane | Capacitor | C = εA/d, E = V/d, Q = CV |
| Ion gradients | Battery | Nernst equation, thermodynamics |
| Ion channels | Switch | Hodgkin–Huxley circuit |
| Axon | Leaky transmission line | Cable equation |
| Myelin | Insulation | C = εA/d, larger d gives smaller C |

**Out of scope:** consciousness, memory, neurotransmitter chemistry, the "quantum brain" idea. These are hypotheses or not physics, and they give the examiner an easy way to catch you out.

---

## Slide plan (10 slides)

### 1 · 86 Billion Capacitors: The Physics of a Thought
- Visual: a glowing neuron, or a brain drawn as a circuit board.
- **Say:** *"Right now there's an electric field of about 10 million volts per metre across every neuron in your head."*

### 2 · The Frog, the Fight and the Battery (1791–1800)
- **Galvani (1791):** frog legs twitch when touched with metal. He concluded that animals make their own electricity.
- **Volta** set out to prove him wrong, and in 1800 invented the first battery. In his letter to the Royal Society he called it an **"artificial electric organ"**, modelled on the electric torpedo fish.
- Pose the question: *is the brain chemistry or physics?* Answer: **electrochemical.** Chemistry charges the battery; physics carries the signal.

### 3 · Part 1: The Capacitor (the membrane)
- The fatty membrane (about 5 nm thick) is the dielectric, and the ions on either side act as the plates. **C = εA/d**, which works out to about **1 µF/cm²** (measured about 0.9 µF/cm²).
- A resting voltage of about **−70 mV** across 5 nm gives **E ≈ 1.4 × 10⁷ V/m**, about 5× the field that makes air spark (3 × 10⁶ V/m).
- **Q = CV:** 1 µF/cm² × 0.1 V is about 6 × 10¹¹ ions/cm², or **about 6,000 ions per µm²**. That is roughly 1 in 100,000 of the ions inside a cell body, so one spike barely changes the concentrations.

### 4 · Part 2: The Battery (ion gradients)
- Concentrations:

  | Ion | Inside | Outside |
  |---|---|---|
  | K⁺ | ~140 mM | ~5 mM |
  | Na⁺ | ~10–15 mM | ~145 mM |

- **Nernst:** V = (RT/zF) ln(C_out/C_in). At 37 °C, RT/F ≈ 26.7 mV, which is about **61.5 mV for each tenfold ratio**.
  - **E_K ≈ −90 mV**
  - **E_Na ≈ +60 to +70 mV**, depending on the internal Na⁺ you use
- **The charger:** the Na⁺/K⁺ pump pushes **3 Na⁺ out and brings 2 K⁺ in for every ATP** it uses (Skou, Nobel Chemistry 1997). Most of the brain's energy goes into recharging these batteries.
- **Mind-blowing extra:** the electric eel (*Electrophorus voltai*) stacks about 6,000 of these cells **in series** to reach **860 V**, about 0.14 V per cell. The marine torpedo ray wires its cells **in parallel** instead: about 50 V, but over 1 kW at the peak of a pulse. Evolution solved the series/parallel circuit problem, matching each design to its water (impedance matching).

### 5 · Part 3: The Switch (the action potential)
- Graph: at the threshold (about **−50 to −55 mV**) the voltage spikes to about **+30 to +50 mV** and lasts **1–2 ms**. The spike is all-or-none.
- **Hodgkin & Huxley (1952, Nobel 1963)** modelled the neuron as a circuit: a capacitor, batteries and variable resistors. Show the circuit diagram:
  `C_m dV/dt = −g_Na(V−E_Na) − g_K(V−E_K) − g_L(V−E_L) + I`
- **Proof it works:** their equations predicted a signal speed of **18.8 m/s**, and the measured speed in the same squid axon was **21.2 m/s**. That is within about 10%, from physics alone.
- **Patch clamp (Neher & Sakmann, Nobel 1991):** it measures the current through **a single protein channel**, about **1–2 pA** (about 10⁷ ions/s). You can watch one molecule flip open and shut like a transistor.

### 6 · Part 4: The Wire (the transmission line)
- In the 1840s, **Müller**, the leading physiologist of the time, said nerve signals were too fast ever to be measured. In **1850** his student **Helmholtz**, a physicist, measured them with a galvanometer: **about 27 m/s** in frog nerve.
- **Cable equation:** William Thomson (later Lord Kelvin) derived it in 1854–55 for submarine telegraph cables. It gives the "law of squares": signal delay grows with the square of the length. Neuroscience took over the same equation and added membrane leak. Hodgkin & Rushton (1946) tested it on a lobster axon.
- **Why nerves are slow:** an axon is a leaky RC cable in which signals spread out, not a copper wire where signals travel at about 2 × 10⁸ m/s.
- **Myelin = insulation.** Many wrapped layers make d larger, so C = εA/d gets smaller, and the membrane's resistance goes up. The spike is regenerated only at the gaps (nodes of Ranvier) and appears to jump between them (**saltatory conduction**).
  - Speed goes from **0.5–2 m/s** (no myelin) to **80–120 m/s** (thickest myelinated fibres).
  - The gaps are up to about 1–1.5 mm apart in body nerves and only about 30–150 µm apart in the brain.
- **Multiple sclerosis:** the immune system strips myelin, and conduction slows or is blocked. A delayed visual evoked potential (VEP) is one of the signs doctors look for.

### 7 · Part 5: The Code (and the one chemical step)
- Signal strength is coded by **how often** the neuron fires, not by how big each spike is. It works like **FM radio, not AM** (Adrian & Zotterman 1926; Adrian, Nobel 1932).
- The refractory period of about 1 ms sets a theoretical ceiling near 1 kHz. Most neurons stay at a few hundred Hz.
- **Synapse:** the electrical signal turns chemical and then electrical again. This is where chemistry really comes in, and it adds about **0.5–1 ms** of delay (minimum about 0.3 ms).
- **Electrical synapses** (gap junctions) also exist in the brain and pass current almost instantly. So the brain isn't "just chemical".

### 8 · The Scale
- **86 billion neurons** (Azevedo 2009). About **69 billion of them (80%) are in the cerebellum**, which is only about 10% of the brain's mass. The cortex has about 16 billion.
- About **150 trillion synapses** in the neocortex alone.
- **150,000–180,000 km** of myelinated wiring at age 20, enough to go **about 4 times around the Earth**. It shrinks by about 10% per decade.
- It all runs on **about 20 W**: 2% of body mass, 20% of the body's energy. One NVIDIA H100 draws 700 W, which is **35×** more.

### 9 · Reading the Capacitors (each tool is a different syllabus chapter)

| Tool | Signal | Physics |
|---|---|---|
| **EEG** (Berger 1924) | 10–100 µV on the scalp; alpha waves at 8–13 Hz | Electrostatics |
| **MEG** (Cohen 1968; with a SQUID, 1972) | 10 fT–1 pT, **10⁸–10⁹ times weaker than Earth's field** | Superconductivity (SQUIDs) |
| **fMRI** (BOLD: Ogawa 1990; in humans from 1992) | Proton spin: γ/2π = **42.58 MHz/T**, so **about 128 MHz at 3 T** | Quantum spin, magnetism |
| **PET** | Positron + electron → two **511 keV** gamma rays, back to back | Antimatter, **E = mc²** |

- How fMRI works: blood that has given up its oxygen (deoxyhemoglobin) is **paramagnetic**, and oxygenated blood is diamagnetic (Pauling & Coryell 1936). When a region is active, blood flow rises more than its oxygen use, so deoxyhemoglobin drops and the signal gets brighter. **fMRI is indirect: it measures blood, not neurons.**

### 10 · Writing Back (the finale)
- **TMS (Faraday's law):** a pulse of about 1.5 T in about 200 µs from a coil induces currents that make neurons fire (Barker 1985). The FDA **cleared** it in 2008 for depression that hasn't responded to medication.
- **Focused ultrasound:** 1,024 ultrasound emitters, each with its phase calculated from a CT scan of the patient's skull, so the waves **add up at one millimetre-sized point** in the thalamus. It treats tremor without opening the skull, and MRI measures the temperature in real time (FDA 2016). *Interference and phased arrays, the same principle as phased-array radar.*
- **Cochlear implants:** electrical pulses stimulate the auditory nerve directly. About 1 million implants by 2022, the most successful neural implant so far.
- **Brain implants (BCIs):**
  - **2006:** a paralysed man moves a cursor by thought (BrainGate, Utah array).
  - **2023:** two implants decode speech at **62 and 78 words per minute** (Stanford and UCSF). Normal speech is about 160.
  - **Jan 2024:** Neuralink's first human patient.
- **Closing line:** *"A thought is charge moving across 86 billion capacitors, and physics has learned to read it."*

---

## 7-slide version

Merge 2 into 1, 7 into 6, and 10 into 9. Budget about 30 seconds per slide.

---

## Viva comebacks

| If the examiner asks | Say |
|---|---|
| "Isn't the brain chemical?" | "Electrochemical. Chemistry charges the battery and handles the synapse; physics does the signalling. Some synapses are purely electrical." |
| "Can you compare a nm gap to air sparking?" | "Only as a sense of scale. A 5 nm gap is far too short for an air-style spark avalanche. The membrane only tears open (electroporation) at roughly 0.2–1 V across it, several times its resting voltage." |
| "Why is the inside negative?" | "K⁺ leaks out through open channels and leaves negative charge behind, so the resting potential sits close to E_K." |
| "Why are nerves slower than wires?" | "A wire carries an electromagnetic wave. In an axon, each membrane patch has to be charged through the salty core before it fires and charges the next, like a burning fuse. Passive spread slows with length² (Kelvin's law of squares), so neurons re-fire the spike at every patch and use myelin to make each hop faster." |
| "Is 42.58 the gyromagnetic ratio?" | "It's γ/2π. γ itself is 2.675 × 10⁸ rad s⁻¹ T⁻¹." |
| "Does fMRI measure neurons?" | "No. It measures blood oxygen, so it's an indirect stand-in." |
| "Why was the gigaseal the breakthrough?" | "Johnson noise: current noise = √(4kTB/R). A 10 GΩ seal pushes the noise below the pA signal of a single channel." |
| "Is the brain quantum?" | "That's outside what I'm presenting. Tegmark (2000) calculated that quantum states in the brain would fall apart in about 10⁻¹³ s, while neurons fire over about 10⁻³ s." |
| "Resting potential exactly?" | "About −65 to −70 mV typically. Across cell types it ranges from about −40 to −90 mV." |

## Numbers corrected during the fact-check (don't use the old versions)

| Old | Say instead |
|---|---|
| "100 trillion synapses" | about 150 trillion in the **neocortex alone** |
| "Lord Kelvin, 1855" | William Thomson (**later** Lord Kelvin), 1854–55 |
| "E_Na = +60 mV" | +60 to +70 mV (it depends on the internal Na⁺) |
| "Nodes 0.2–2 mm apart" | up to about 1–1.5 mm in body nerves, only 30–150 µm in the brain |
| "TMS approved for treatment-resistant depression" | **cleared** for depression that hasn't responded to medication |
| "Over 1 million people have cochlear implants" | about 1 million **implants** by 2022 |
| "Nerve conduction tests diagnose MS" | evoked potentials (VEP) and MRI; nerve conduction studies rule out other causes |
| "Ogawa 1990 = human fMRI" | Ogawa 1990 was in rats and mice; the first human studies came in 1992 |

---

## Backup facts (proven, use if you have time or get asked)

- **Your eye counts photons.** A single rod cell responds to a single photon with a pulse of about 1 pA (Baylor, Lamb & Yau 1979). Humans report single photons slightly above chance (Tinsley 2016: 51.6%, p ≈ 0.05; 60% on high-confidence trials). Physics: E = hν.
- **Your eardrum moves about 1 picometre** at the threshold of hearing, roughly 100× smaller than a hydrogen atom (Bergevin et al. 2025). Physics: acoustic intensity I = p²/Z, decibels.
- **Potassium channels let the bigger ion through.** K⁺ (1.33 Å) passes at 10⁷–10⁸ ions/s while the smaller Na⁺ (0.95 Å) is blocked. A cage of 8 oxygen atoms mimics the water shell around K⁺ (MacKinnon, Nobel 2003). Physics: electrostatics, the energy cost of stripping water from an ion.
- **Optogenetics:** a light-gated channel from algae (channelrhodopsin-2, peak about 470 nm, about 2.64 eV) lets blue light fire single spikes with millisecond precision (Boyden et al. 2005). It is routine in animals and at the early-clinical stage in humans (a 2021 case of partial vision restored in a blind patient).

---

## Sources

- Galvani, L. (1791). *De viribus electricitatis in motu musculari commentarius*. Bologna.
- Volta, A. (1800). Letter to Sir Joseph Banks, *Phil. Trans. R. Soc.* 90:403–431.
- Thomson, W. (1855). On the theory of the electric telegraph. *Proc. R. Soc. Lond.* 7:382–399.
- Adrian, E.D. & Zotterman, Y. (1926). *J. Physiol.* 61:151–171.
- Hodgkin, A.L. & Rushton, W.A.H. (1946). *Proc. R. Soc. Lond. B* 133:444–479.
- Hodgkin, A.L. & Huxley, A.F. (1952). *J. Physiol.* 117:500–544. (18.8 vs 21.2 m/s on p. 528.)
- Neher, E. & Sakmann, B. (1976). *Nature* 260:799–802. Hamill, O.P. et al. (1981). *Pflügers Arch.* 391:85–100.
- Nobel Prize summaries: Medicine 1932, 1963, 1991; Chemistry 1997, 2003. nobelprize.org
- Gentet, L.J., Stuart, G.J. & Clements, J.D. (2000). *Biophys. J.* 79:314–320. (Cm ≈ 0.9 µF/cm².)
- Carter, B.C. & Bean, B.P. (2009). *Neuron* 64:898–909. (Na⁺ entry per spike.)
- Attwell, D. & Laughlin, S.B. (2001). *J. Cereb. Blood Flow Metab.* 21:1133–1145. Howarth, C. et al. (2012). *JCBFM* 32:1222–1232.
- Azevedo, F.A.C. et al. (2009). *J. Comp. Neurol.* 513:532–541. (86 billion neurons.)
- Tang, Y. et al. (2001). *Synapse* 41:258–273. Pakkenberg, B. et al. (2003). *Exp. Gerontol.* 38:95–99.
- Marner, L. et al. (2003). *J. Comp. Neurol.* 462:144–152. (Myelinated fibre length.)
- de Santana, C.D. et al. (2019). *Nat. Commun.* 10:4000. (Electric eel, 860 V.)
- Schmidgen, H. (2002). *Endeavour* 26:142–148. (Helmholtz 1850.)
- Katz, B. & Miledi, R. (1965). *Proc. R. Soc. B* 161:483–495. (Synaptic delay.)
- Berger, H. (1929). *Arch. Psychiatr. Nervenkr.* 87:527–570.
- Cohen, D. (1968). *Science* 161:784–786. Cohen, D. (1972). *Science* 175:664–666.
- Hämäläinen, M. et al. (1993). *Rev. Mod. Phys.* 65:413–497. (MEG field range.)
- Pauling, L. & Coryell, C.D. (1936). *PNAS* 22:210–216. Ogawa, S. et al. (1990). *PNAS* 87:9868–9872.
- CODATA 2022: proton gyromagnetic ratio.
- Barker, A.T., Jalinous, R. & Freeston, I.L. (1985). *Lancet* 1:1106–1107. FDA 510(k) K061053 (NeuroStar, 2008).
- Elias, W.J. et al. (2016). *NEJM* 375:730–739. (Focused ultrasound for essential tremor.)
- Hochberg, L.R. et al. (2006). *Nature* 442:164–171. (BrainGate.)
- Willett, F.R. et al. (2023). *Nature* 620:1031–1036. Metzger, S.L. et al. (2023). *Nature* 620:1037–1046.
- Zeng, F.-G. (2022). *JASA Express Lett.* (About 1 million cochlear implants.)
- Baylor, D.A., Lamb, T.D. & Yau, K.-W. (1979). *J. Physiol.* 288:613–634. Tinsley, J.N. et al. (2016). *Nat. Commun.* 7:12172.
- Boyden, E.S. et al. (2005). *Nat. Neurosci.* 8:1263–1268.
- Tegmark, M. (2000). *Phys. Rev. E* 61:4194–4206.
