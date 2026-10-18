"use client";

import { useId, type ComponentType, type CSSProperties, type ReactElement } from "react";
import type { ProductType } from "../../types/commerce";
import { shade } from "./color";
import type { PackagingColors } from "./packaging";

// Fonts come from next/font CSS variables (see src/app/layout.jsx).
const SERIF: CSSProperties = { fontFamily: "var(--font-display)" };
const SANS: CSSProperties = { fontFamily: "var(--font-body)" };

export interface ShapeProps {
  pack: PackagingColors;
  /** Formula colour (lipstick bullet, blush pan, foundation liquid). */
  tint?: string;
  /** Range name printed under the wordmark, e.g. "SKIN". */
  line?: string;
}

// Every shape is drawn in a 200 × 260 box, standing on a baseline at y = 242.
// Gradients run left to right so each piece reads as a lit cylinder.

function Cylinder({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={shade(color, -0.2)} />
      <stop offset="0.32" stopColor={shade(color, 0.22)} />
      <stop offset="0.62" stopColor={color} />
      <stop offset="1" stopColor={shade(color, -0.28)} />
    </linearGradient>
  );
}

type GradientFills = Record<"body" | "cap" | "tint", string>;

function useGradients(
  pack: PackagingColors,
  tint?: string,
): { defs: ReactElement; fill: GradientFills } {
  const id = useId().replace(/:/g, "");
  const ids = { body: `${id}b`, cap: `${id}c`, tint: `${id}t` };
  const defs = (
    <defs>
      <Cylinder id={ids.body} color={pack.body} />
      <Cylinder id={ids.cap} color={pack.cap} />
      {tint && <Cylinder id={ids.tint} color={tint} />}
    </defs>
  );
  const fill = {
    body: `url(#${ids.body})`,
    cap: `url(#${ids.cap})`,
    tint: `url(#${ids.tint})`,
  };
  return { defs, fill };
}

const Shadow = ({ width }: { width: number }) => (
  <ellipse cx="100" cy="244" rx={width / 2} ry="6" fill="#2a1712" opacity="0.16" />
);

const Highlight = ({ x, y, height }: { x: number; y: number; height: number }) => (
  <rect x={x} y={y} width="5" height={height} rx="2.5" fill="#fff" opacity="0.32" />
);

interface WordmarkProps {
  y: number;
  color: string;
  size?: number;
  line?: string;
}

function Wordmark({ y, color, size = 8.5, line }: WordmarkProps) {
  return (
    <g fill={color} textAnchor="middle" style={SERIF}>
      <text x="100" y={y} fontSize={size} letterSpacing={size * 0.24}>
        VELOURA
      </text>
      {line && (
        <text x="100" y={y + 12} fontSize={size * 0.58} letterSpacing="1.6" style={SANS}>
          {line}
        </text>
      )}
    </g>
  );
}

export function Serum({ pack, line }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={88} />
      <rect x="60" y="108" width="80" height="134" rx="18" fill={fill.body} />
      <rect x="78" y="94" width="44" height="20" rx="3" fill={fill.cap} />
      <rect x="84" y="38" width="32" height="60" rx="16" fill={fill.cap} />
      <rect x="70" y="158" width="60" height="46" rx="2" fill={pack.label} opacity="0.92" />
      <Wordmark y={178} color={pack.ink} line={line} />
      <Highlight x={67} y={120} height={108} />
    </g>
  );
}

export function Bottle({ pack, line }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={74} />
      <rect x="66" y="78" width="68" height="164" rx="26" fill={fill.body} />
      <rect x="80" y="34" width="40" height="52" rx="5" fill={fill.cap} />
      <rect x="74" y="142" width="52" height="56" rx="2" fill={pack.label} opacity="0.92" />
      <Wordmark y={164} color={pack.ink} size={7.5} line={line} />
      <Highlight x={73} y={96} height={130} />
    </g>
  );
}

export function Pump({ pack, tint = "#d8ad8e", line }: ShapeProps) {
  const { defs, fill } = useGradients(pack, tint);
  return (
    <g>
      {defs}
      <Shadow width={82} />
      <rect x="62" y="112" width="76" height="130" rx="14" fill={pack.body} />
      <rect x="68" y="124" width="64" height="112" rx="10" fill={fill.tint} />
      <rect x="62" y="112" width="76" height="130" rx="14" fill="#fff" opacity="0.18" />
      <rect x="62" y="166" width="76" height="42" fill={pack.label} opacity="0.94" />
      <Wordmark y={184} color={pack.ink} size={8} line={line} />
      <rect x="82" y="98" width="36" height="16" rx="3" fill={fill.cap} />
      <rect x="96" y="86" width="8" height="14" fill={fill.cap} />
      <rect x="80" y="72" width="40" height="16" rx="4" fill={fill.cap} />
      <rect x="118" y="75" width="22" height="7" rx="3" fill={fill.cap} />
      <Highlight x={68} y={124} height={104} />
    </g>
  );
}

export function Wand({ pack, tint = "#d3a481" }: ShapeProps) {
  const { defs, fill } = useGradients(pack, tint);
  return (
    <g>
      {defs}
      <Shadow width={50} />
      <rect x="80" y="146" width="40" height="96" rx="8" fill={fill.tint} />
      <rect x="80" y="146" width="40" height="96" rx="8" fill="#fff" opacity="0.2" />
      <rect x="82" y="40" width="36" height="110" rx="6" fill={fill.body} />
      <rect x="82" y="140" width="36" height="8" fill={fill.cap} />
      <text x="100" y="100" fill={pack.ink} fontSize="20" textAnchor="middle" style={SERIF}>
        V
      </text>
      <Highlight x={86} y={52} height={84} />
    </g>
  );
}

export function Gloss({ pack, tint = "#c97a82" }: ShapeProps) {
  const { defs, fill } = useGradients(pack, tint);
  return (
    <g>
      {defs}
      <Shadow width={52} />
      <rect x="78" y="118" width="44" height="124" rx="10" fill={fill.tint} opacity="0.92" />
      <rect x="84" y="128" width="32" height="106" rx="7" fill="#fff" opacity="0.14" />
      <rect x="82" y="38" width="36" height="84" rx="6" fill={fill.cap} />
      <Wordmark y={196} color="#fff" size={6.5} />
      <Highlight x={83} y={128} height={100} />
    </g>
  );
}

export function Mascara({ pack }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={42} />
      <rect x="84" y="116" width="32" height="126" rx="6" fill={fill.body} />
      <rect x="84" y="32" width="32" height="88" rx="6" fill={fill.body} />
      <rect x="84" y="114" width="32" height="7" fill={fill.cap} />
      <text
        x="100"
        y="182"
        fill={pack.ink}
        fontSize="8"
        letterSpacing="2"
        textAnchor="middle"
        transform="rotate(-90 100 182)"
        style={SERIF}
      >
        VELOURA
      </text>
      <Highlight x={88} y={44} height={186} />
    </g>
  );
}

export function Tube({ pack, line }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={68} />
      <rect x="72" y="204" width="56" height="38" rx="6" fill={fill.cap} />
      <path
        d="M48 46 L152 46 L136 196 Q134 208 124 208 L76 208 Q66 208 64 196 Z"
        fill={fill.body}
      />
      <rect x="46" y="36" width="108" height="14" rx="2" fill={shade(pack.body, -0.08)} />
      {[56, 68, 80, 92, 104, 116, 128, 140].map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1="38"
          y2="48"
          stroke={shade(pack.body, -0.2)}
          strokeWidth="1"
        />
      ))}
      <Wordmark y={112} color={pack.ink} size={10} line={line} />
      <path d="M62 60 L68 60 L78 190 L74 190 Z" fill="#fff" opacity="0.28" />
    </g>
  );
}

export function Jar({ pack, line }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={136} />
      <rect x="36" y="166" width="128" height="76" rx="14" fill={fill.body} />
      <rect x="32" y="128" width="136" height="44" rx="8" fill={fill.cap} />
      {Array.from({ length: 16 }, (_, index) => 40 + index * 8).map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1="132"
          y2="168"
          stroke="#000"
          strokeWidth="1"
          opacity="0.08"
        />
      ))}
      <Wordmark y={206} color={pack.ink} size={10} line={line} />
      <rect x="44" y="176" width="6" height="56" rx="3" fill="#fff" opacity="0.25" />
    </g>
  );
}

export function Lipstick({ pack, tint = "#8f4f58" }: ShapeProps) {
  const { defs, fill } = useGradients(pack, tint);
  return (
    <g>
      {defs}
      <Shadow width={56} />
      <rect x="76" y="150" width="48" height="92" rx="4" fill={fill.body} />
      <rect x="76" y="146" width="48" height="8" fill={fill.cap} />
      <rect x="81" y="112" width="38" height="36" rx="2" fill={fill.cap} />
      <path d="M84 114 L84 78 Q84 70 92 66 L116 52 L116 114 Z" fill={fill.tint} />
      <text
        x="100"
        y="200"
        fill={pack.ink}
        fontSize="8"
        letterSpacing="2"
        textAnchor="middle"
        transform="rotate(-90 100 200)"
        style={SERIF}
      >
        VELOURA
      </text>
      <Highlight x={81} y={158} height={76} />
    </g>
  );
}

export function Compact({ pack, tint = "#cf8991" }: ShapeProps) {
  const { defs, fill } = useGradients(pack, tint);
  return (
    <g>
      {defs}
      <Shadow width={150} />
      <ellipse cx="100" cy="112" rx="76" ry="62" fill={fill.body} />
      <ellipse cx="100" cy="112" rx="63" ry="50" fill="#e9e3df" />
      <ellipse cx="86" cy="98" rx="30" ry="18" fill="#fff" opacity="0.45" />
      <rect x="86" y="166" width="28" height="10" rx="2" fill={fill.cap} />
      <ellipse cx="100" cy="214" rx="78" ry="28" fill={shade(pack.body, -0.25)} />
      <ellipse cx="100" cy="206" rx="78" ry="28" fill={fill.body} />
      <ellipse cx="100" cy="204" rx="56" ry="19" fill={shade(pack.cap, -0.1)} />
      <ellipse cx="100" cy="204" rx="52" ry="17" fill={fill.tint} />
    </g>
  );
}

const PALETTE_PANS = ["#ecc7b4", "#d79f89", "#b97a6c", "#f2dcc6"];

export function Palette({ pack }: ShapeProps) {
  const { defs, fill } = useGradients(pack);
  return (
    <g>
      {defs}
      <Shadow width={140} />
      <rect x="34" y="56" width="132" height="98" rx="8" fill={fill.body} />
      <rect x="44" y="66" width="112" height="78" rx="4" fill="#e7e1de" />
      <path d="M50 70 L96 70 L60 140 L50 140 Z" fill="#fff" opacity="0.4" />
      <rect x="88" y="150" width="24" height="10" rx="2" fill={fill.cap} />
      <rect x="34" y="158" width="132" height="84" rx="8" fill={fill.body} />
      {PALETTE_PANS.map((color, index) => (
        <circle key={color} cx={58 + index * 28} cy="200" r="12" fill={color} />
      ))}
      <Wordmark y={232} color={pack.ink} size={7} />
    </g>
  );
}

const SHAPES: Readonly<Record<Exclude<ProductType, "set">, ComponentType<ShapeProps>>> = {
  serum: Serum,
  bottle: Bottle,
  pump: Pump,
  wand: Wand,
  gloss: Gloss,
  mascara: Mascara,
  tube: Tube,
  jar: Jar,
  lipstick: Lipstick,
  compact: Compact,
  palette: Palette,
};

/**
 * Draws the packaging for a product type. Sets have no shape of their own
 * (ProductArt composes their contents), so they fall back to a bottle.
 */
export function ProductShape({ type, ...props }: ShapeProps & { type: ProductType }) {
  const Shape = SHAPES[type === "set" ? "bottle" : type];
  return <Shape {...props} />;
}
