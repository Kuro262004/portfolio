export const ROW_H = 176; // vertical distance between tiers
export const NODE_R = 32; // node circle radius (px)
export const PAD_TOP = 44;
const LABEL_SPACE = 80; // room under the last row for names + level pips

/**
 * Turns the flat skill list into a laid-out tree for one class.
 * A virtual root (the class itself) sits on top; real skills hang below via parent_id.
 * x is a percentage of the canvas width (so the tree scales); y is in pixels.
 */
export function buildTree(skills, category) {
  const inClass = skills.filter((s) => s.category === category);
  const ids = new Set(inClass.map((s) => s.id));
  const byLevel = (a, b) => b.level - a.level || a.name.localeCompare(b.name);
  const childrenOf = (id) => inClass.filter((s) => s.parent_id === id).sort(byLevel);
  // A skill whose parent is missing (deleted / other class) is treated as a root rather than lost.
  const roots = inClass.filter((s) => s.parent_id == null || !ids.has(s.parent_id)).sort(byLevel);

  const make = (skill) => ({ key: `s${skill.id}`, skill, children: childrenOf(skill.id).map(make) });
  const root = { key: `class-${category}`, skill: null, children: roots.map(make) };

  let slot = 0;
  const place = (node, depth) => {
    node.depth = depth;
    node.children.forEach((c) => place(c, depth + 1));
    node.x = node.children.length
      ? (node.children[0].x + node.children[node.children.length - 1].x) / 2
      : slot++;
  };
  place(root, 0);

  const leaves = Math.max(1, slot);
  const nodes = [];
  const edges = [];
  const walk = (node) => {
    nodes.push({
      key: node.key,
      skill: node.skill,
      depth: node.depth,
      xPct: ((node.x + 0.5) / leaves) * 100,
      y: PAD_TOP + node.depth * ROW_H,
    });
    node.children.forEach((c) => {
      edges.push({ from: node.key, to: c.key });
      walk(c);
    });
  };
  walk(root);

  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  return {
    nodes,
    edges,
    leaves,
    maxDepth,
    height: PAD_TOP + maxDepth * ROW_H + NODE_R + LABEL_SPACE,
  };
}

/** 0-100 proficiency → 1-5 "level" shown as pips. */
export const toLevel = (value) => Math.max(1, Math.min(5, Math.round(value / 20)));
