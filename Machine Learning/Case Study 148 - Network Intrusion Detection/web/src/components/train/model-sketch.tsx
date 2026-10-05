import type { Sketch } from "@/lib/models"

// Small schematic drawings of how each model decides. Ink for structure, orange for "attack", green for "normal".
const INK = "var(--ink)", OR = "var(--orange)", GR = "var(--normal)", MU = "#c9c9ce"

function Tree({ x, y, s = 1, hot = false }: { x: number; y: number; s?: number; hot?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L-14 16 M0 0 L14 16 M-14 16 L-20 30 M-14 16 L-8 30 M14 16 L8 30 M14 16 L20 30" stroke={INK} strokeWidth={1.4} fill="none" />
      <circle cx={0} cy={0} r={3.5} fill={INK} />
      {[-20, -8, 8, 20].map((lx, i) => <circle key={lx} cx={lx} cy={30} r={3.5} fill={(i + (hot ? 1 : 0)) % 2 ? OR : GR} />)}
    </g>
  )
}

export function ModelSketch({ kind }: { kind: Sketch }) {
  return (
    <svg viewBox="0 0 240 130" className="h-auto w-full max-w-[280px]" role="img" aria-label={`Diagram: ${kind}`}>
      {kind === "linear" && (
        <g>
          {[18, 38, 58].map((y, i) => <g key={y}><circle cx={18} cy={y + 20} r={5} fill={MU} /><line x1={24} y1={y + 20} x2={78} y2={58} stroke={INK} strokeWidth={1 + i} /></g>)}
          <circle cx={86} cy={58} r={11} fill="white" stroke={INK} strokeWidth={1.5} /><text x={86} y={62} textAnchor="middle" fontSize={12} fill={INK}>Σ</text>
          <line x1={97} y1={58} x2={122} y2={58} stroke={INK} strokeWidth={1.4} markerEnd="url(#a)" />
          <path d="M130 100 C 165 100, 165 18, 200 18 L 230 18" stroke={OR} strokeWidth={2.5} fill="none" />
          <path d="M130 100 L 130 18 M130 100 L 230 100" stroke={MU} strokeWidth={1} fill="none" />
          <text x={232} y={14} textAnchor="end" fontSize={9} fill={INK}>100%</text><text x={232} y={113} textAnchor="end" fontSize={9} fill={INK}>0%</text>
        </g>
      )}
      {kind === "knn" && (
        <g>
          {[[40, 30], [60, 95], [190, 30], [205, 100], [30, 70], [185, 70], [215, 55]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={i % 2 ? GR : OR} opacity={0.35} />)}
          {[[105, 50], [140, 48], [112, 85], [148, 82], [128, 30]].map(([x, y], i) => (
            <g key={i}><line x1={126} y1={64} x2={x} y2={y} stroke={MU} strokeDasharray="3 2" /><circle cx={x} cy={y} r={5} fill={i === 3 ? GR : OR} /></g>
          ))}
          <circle cx={126} cy={64} r={30} fill="none" stroke={INK} strokeDasharray="4 3" />
          <circle cx={126} cy={64} r={6} fill="white" stroke={INK} strokeWidth={2} />
          <text x={126} y={124} textAnchor="middle" fontSize={10} fill={INK}>4 of 5 neighbours: attack → 80%</text>
        </g>
      )}
      {kind === "tree" && (
        <g fontSize={9} fill={INK}>
          <rect x={70} y={6} width={100} height={20} rx={2} fill="white" stroke={INK} /><text x={120} y={19} textAnchor="middle">rst_count &gt; 113?</text>
          <path d="M95 26 L60 48 M145 26 L180 48" stroke={INK} />
          <rect x={14} y={48} width={92} height={20} rx={2} fill="white" stroke={INK} /><text x={60} y={61} textAnchor="middle">duration &gt; 38s?</text>
          <rect x={134} y={48} width={92} height={20} rx={2} fill="white" stroke={INK} /><text x={180} y={61} textAnchor="middle">Rate &gt; 265?</text>
          <path d="M40 68 L30 92 M80 68 L90 92 M160 68 L150 92 M200 68 L210 92" stroke={INK} />
          {[[30, GR], [90, OR], [150, OR], [210, GR]].map(([x, c]) => <rect key={x as number} x={(x as number) - 16} y={92} width={32} height={18} rx={2} fill={c as string} opacity={0.85} />)}
          <text x={120} y={126} textAnchor="middle">each end point: normal or attack</text>
        </g>
      )}
      {kind === "kmeans" && (
        <g>
          {[[60, 50], [110, 80], [160, 45]].map(([cx, cy], k) => (
            <g key={k}>
              <circle cx={cx} cy={cy} r={24} fill={GR} opacity={0.08} stroke={GR} strokeDasharray="3 2" />
              {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={Math.round((cx + Math.cos(i * 1.1 + k) * 12) * 10) / 10} cy={Math.round((cy + Math.sin(i * 1.7 + k) * 10) * 10) / 10} r={2.6} fill={GR} />)}
              <path d={`M${cx - 4} ${cy} h8 M${cx} ${cy - 4} v8`} stroke={INK} strokeWidth={1.6} />
            </g>
          ))}
          <circle cx={212} cy={106} r={5} fill={OR} /><text x={204} y={124} textAnchor="end" fontSize={9} fill={INK}>far from every centre → alarm</text>
        </g>
      )}
      {kind === "forest" && (
        <g fontSize={9} fill={INK}>
          <rect x={6} y={50} width={36} height={26} rx={2} fill={MU} /><text x={24} y={88} textAnchor="middle">rows</text>
          {[0, 1, 2, 3].map((i) => <g key={i}><line x1={42} y1={63} x2={70} y2={14 + i * 28} stroke={MU} /><text x={76} y={18 + i * 28} fontSize={7}>random rows + columns</text></g>)}
          {[0, 1, 2, 3].map((i) => <Tree key={i} x={168} y={4 + i * 30} s={0.62} hot={i % 2 === 1} />)}
          <text x={168} y={126} textAnchor="middle" fontSize={7}>… 200 trees</text>
          <path d="M190 62 L206 62" stroke={INK} /><rect x={206} y={50} width={30} height={24} rx={2} fill={OR} /><text x={221} y={66} textAnchor="middle" fill="white">vote</text>
        </g>
      )}
      {kind === "bagging" && (
        <g fontSize={9} fill={INK}>
          <rect x={6} y={50} width={36} height={26} rx={2} fill={MU} /><text x={24} y={88} textAnchor="middle">rows</text>
          {[0, 1, 2].map((i) => <g key={i}><line x1={42} y1={63} x2={84} y2={24 + i * 38} stroke={MU} /><rect x={84} y={16 + i * 38} width={18} height={16} rx={1} fill={MU} /><text x={93} y={45 + i * 38} textAnchor="middle" fontSize={7}>½</text></g>)}
          {[0, 1, 2].map((i) => <Tree key={i} x={146} y={10 + i * 38} s={0.7} hot={i === 1} />)}
          <path d="M175 62 L200 62" stroke={INK} /><rect x={200} y={50} width={34} height={24} rx={2} fill={OR} /><text x={217} y={66} textAnchor="middle" fill="white">vote</text>
          <text x={146} y={126} textAnchor="middle" fontSize={7}>… 100 trees</text>
        </g>
      )}
      {kind === "adaboost" && (
        <g fontSize={8} fill={INK}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${14 + i * 56} 30)`}>
              <path d="M18 0 L6 22 M18 0 L30 22" stroke={INK} /><circle cx={18} cy={0} r={3.5} fill={INK} />
              <circle cx={6} cy={22} r={4} fill={GR} /><circle cx={30} cy={22} r={4} fill={OR} />
              {[0, 1, 2].map((d) => <circle key={d} cx={6 + d * 12} cy={48} r={1.5 + i * 0.9 * (d === i % 3 ? 1 : 0.2)} fill={OR} />)}
              {i < 3 && <path d="M38 12 L50 12" stroke={INK} markerEnd="url(#a)" />}
            </g>
          ))}
          <text x={120} y={112} textAnchor="middle">each stump weighs the misses (bigger dots) more</text>
        </g>
      )}
      {kind === "boost" && (
        <g fontSize={8} fill={INK}>
          {[0, 1, 2, 3].map((i) => <Tree key={i} x={30 + i * 55} y={8} s={0.55} hot={i % 2 === 1} />)}
          {[0, 1, 2].map((i) => <text key={i} x={57 + i * 55} y={20} textAnchor="middle" fontSize={12}>+</text>)}
          <path d="M14 104 L 60 92 L 105 70 L 150 60 L 195 56 L 226 54" stroke={OR} strokeWidth={2.2} fill="none" />
          <line x1={14} y1={56} x2={226} y2={56} stroke={GR} strokeDasharray="4 3" />
          <text x={226} y={48} textAnchor="end">truth</text><text x={14} y={120}>score creeps towards the truth, tree by tree</text>
        </g>
      )}
      {kind === "neuron" && (
        <g>
          {[22, 44, 66, 88, 110].map((y, i) => <g key={y}><circle cx={22} cy={y} r={5} fill={MU} /><line x1={27} y1={y} x2={108} y2={66} stroke={INK} strokeWidth={0.6 + (i % 3)} /></g>)}
          <circle cx={120} cy={66} r={14} fill="white" stroke={INK} strokeWidth={1.6} /><text x={120} y={70} textAnchor="middle" fontSize={11} fill={INK}>Σ</text>
          <path d="M134 66 L160 66" stroke={INK} />
          <path d="M162 90 L190 90 L190 40 L226 40" stroke={OR} strokeWidth={2.4} fill="none" />
          <text x={226} y={34} textAnchor="end" fontSize={9} fill={INK}>attack</text><text x={162} y={104} fontSize={9} fill={INK}>normal</text>
        </g>
      )}
      {kind === "mlp" && (
        <g>
          {[[20, 6], [92, 5], [164, 4], [222, 1]].map(([x, n], l, all) => (
            <g key={l}>
              {Array.from({ length: n }, (_, i) => {
                const y = 65 + (i - (n - 1) / 2) * 20
                const next = all[l + 1]
                return (
                  <g key={i}>
                    {next && Array.from({ length: next[1] }, (_, j) => <line key={j} x1={x} y1={y} x2={next[0]} y2={65 + (j - (next[1] - 1) / 2) * 20} stroke={MU} strokeWidth={0.8} />)}
                    <circle cx={x} cy={y} r={6} fill={l === 3 ? OR : l === 0 ? MU : "white"} stroke={INK} strokeWidth={l === 0 || l === 3 ? 0 : 1.3} />
                  </g>
                )
              })}
            </g>
          ))}
          {[["45 in", 20], ["64", 92], ["32", 164], ["1 out", 222]].map(([t, x]) => <text key={t} x={x as number} y={126} textAnchor="middle" fontSize={9} fill={INK}>{t}</text>)}
        </g>
      )}
      {kind === "bayes" && (
        <g fontSize={9} fill={INK}>
          <path d="M10 100 C 50 100, 55 24, 80 24 C 105 24, 110 100, 150 100" stroke={GR} strokeWidth={2.2} fill={GR} fillOpacity={0.08} />
          <path d="M90 100 C 130 100, 135 40, 160 40 C 185 40, 190 100, 230 100" stroke={OR} strokeWidth={2.2} fill={OR} fillOpacity={0.08} />
          <line x1={10} y1={100} x2={230} y2={100} stroke={INK} />
          <line x1={128} y1={30} x2={128} y2={100} stroke={INK} strokeDasharray="3 2" />
          <text x={128} y={22} textAnchor="middle">a new value</text><text x={60} y={116}>normal</text><text x={168} y={116}>attack</text>
        </g>
      )}
      <defs><marker id="a" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill={INK} /></marker></defs>
    </svg>
  )
}
