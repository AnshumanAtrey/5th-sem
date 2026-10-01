// Control-flow graph of the screening routine as static SVG (same geometry as the app's diagram).
export const NODES: Record<string, { x: number; y: number; label: string; decision?: boolean; stmt: string }> = {
  N1: { x: 150, y: 34, label: "skills missing?", decision: true, stmt: "if mandatory skills missing" },
  N2: { x: 40, y: 116, label: "reject", stmt: "reject" },
  N3: { x: 230, y: 116, label: "score band", stmt: "else score experience band" },
  N4: { x: 230, y: 198, label: "≥T & location?", decision: true, stmt: "if score ≥ threshold and location matches" },
  N5: { x: 110, y: 280, label: "shortlist", stmt: "shortlist" },
  N6: { x: 300, y: 280, label: "≥T & remote?", decision: true, stmt: "else if score ≥ threshold and remote allowed" },
  N7: { x: 220, y: 362, label: "shortlist", stmt: "shortlist" },
  N8: { x: 350, y: 362, label: "waitlist", stmt: "else waitlist" },
  N9: { x: 150, y: 444, label: "confidence < 0.6?", decision: true, stmt: "if parse confidence < 0.6" },
  N10: { x: 40, y: 518, label: "review", stmt: "route to manual review" },
  N11: { x: 150, y: 584, label: "end", stmt: "end (decision logged)" },
};

export const EDGES: [string, string, string?][] = [
  ["N1", "N2", "T"], ["N1", "N3", "F"], ["N3", "N4"], ["N4", "N5", "T"], ["N4", "N6", "F"],
  ["N6", "N7", "T"], ["N6", "N8", "F"], ["N2", "N9"], ["N5", "N9"], ["N7", "N9"], ["N8", "N9"],
  ["N9", "N10", "T"], ["N9", "N11", "F"], ["N10", "N11"],
];

const R = 17;

export function cfgSvg({ path = [], edgeIds = false, width = 300, compact = false }: { path?: string[]; edgeIds?: boolean; width?: number; compact?: boolean } = {}) {
  const on = new Set(path);
  const onEdge = (a: string, b: string) => path.some((n, i) => n === a && path[i + 1] === b);
  const lines = EDGES.map(([a, b, tf], i) => {
    const p = NODES[a]!;
    const q = NODES[b]!;
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy);
    const [x1, y1] = [p.x + (dx / len) * R, p.y + (dy / len) * R];
    const [x2, y2] = [q.x - (dx / len) * (R + 3), q.y - (dy / len) * (R + 3)];
    const hot = onEdge(a, b);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const lab = [tf, edgeIds ? `e${i + 1}` : ""].filter(Boolean).join(" ");
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hot ? "#17191c" : "#a3a8b0"}" stroke-width="${hot ? 2.4 : 1.2}" marker-end="url(#${hot ? "ah" : "a"})"/>${
      lab ? `<text x="${mx + (dx >= 0 ? 6 : -6)}" y="${my - 3}" text-anchor="${dx >= 0 ? "start" : "end"}" font-size="11" fill="${hot ? "#17191c" : "#80858f"}" font-weight="${hot ? 600 : 400}">${lab}</text>` : ""
    }`;
  }).join("");
  const nodes = Object.entries(NODES).map(([id, n]) => {
    const hot = on.has(id);
    const fill = hot ? "#17191c" : "#ffffff";
    const stroke = hot ? "#17191c" : "#8f949c";
    const shape = n.decision
      ? `<rect x="${n.x - R}" y="${n.y - R}" width="${2 * R}" height="${2 * R}" rx="4" transform="rotate(45 ${n.x} ${n.y})" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`
      : `<circle cx="${n.x}" cy="${n.y}" r="${R}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
    return `${shape}<text x="${n.x}" y="${n.y + 4}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${hot ? "#fff" : "#4b5059"}">${id}</text>${
      compact ? "" : `<text x="${n.x + R + 7}" y="${n.y + 5}" font-size="13" fill="${hot ? "#17191c" : "#6b7079"}" font-weight="${hot ? 600 : 400}">${n.label}</text>`
    }`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 612" width="${width}" font-family="Inter">
<defs>
<marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#a3a8b0"/></marker>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#17191c"/></marker>
</defs>${lines}${nodes}</svg>`;
}
