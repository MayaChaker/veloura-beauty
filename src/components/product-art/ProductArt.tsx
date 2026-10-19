import type { Category, Product, ProductSet } from "../../types/commerce";
import { getPackaging } from "./packaging";
import { ProductShape } from "./shapes";
import styles from "./ProductVisual.module.css";

/** A catalogue product, optionally with a chosen shade (a ProductSelection fits). */
export type ArtProduct = Product & { selectedVariant?: string; swatch?: string };

interface SetLayout {
  scale: number;
  centres: number[];
}

const LINES: Record<Category, string> = {
  Skincare: "SKIN",
  Makeup: "COLOUR",
  Fragrance: "PARFUM",
  Hair: "HAIR",
  Sets: "RITUALS",
};

// Where each item of a set sits (centre x) and how much it is scaled down.
const THREE_PIECE: SetLayout = { scale: 0.6, centres: [52, 148, 100] };
const SET_LAYOUTS: Record<number, SetLayout> = {
  2: { scale: 0.66, centres: [72, 128] },
  3: THREE_PIECE,
  4: { scale: 0.5, centres: [38, 162, 79, 121] },
};

function Piece({ product, tint }: { product: Product; tint?: string }) {
  const swatch = tint || product.variants?.[0]?.swatch;
  const packaging = product.type === "set" ? undefined : product.packaging;
  return (
    <ProductShape
      type={product.type}
      pack={getPackaging(packaging)}
      tint={swatch}
      line={LINES[product.category]}
    />
  );
}

function SetPieces({ product }: { product: ProductSet }) {
  const items = product.parts ?? [];
  const layout = SET_LAYOUTS[items.length] ?? THREE_PIECE;
  return (
    <g>
      <rect x="12" y="226" width="176" height="18" rx="4" fill="#000" opacity="0.07" />
      {items.map((item, index) => {
        const centre = layout.centres[index] ?? 100;
        const offsetX = centre - 100 * layout.scale;
        const offsetY = 242 - 242 * layout.scale;
        return (
          <g key={item.id} transform={`translate(${offsetX} ${offsetY}) scale(${layout.scale})`}>
            <Piece product={item} />
          </g>
        );
      })}
    </g>
  );
}

interface ProductArtProps {
  product?: ArtProduct | null;
  className?: string;
  /** Hide from assistive tech when a visible name already sits next to the art. */
  decorative?: boolean;
}

/**
 * Vector illustration of a Veloura product. Shade variants recolour the formula
 * (bullet, pan or liquid), so new shades need no new artwork.
 */
export default function ProductArt({
  product,
  className = styles.art,
  decorative = false,
}: ProductArtProps) {
  if (!product) return null;
  const label = `${product.name}${product.selectedVariant ? ` in ${product.selectedVariant}` : ""}`;
  return (
    <svg
      className={className}
      viewBox="0 0 200 260"
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      {product.type === "set" ? (
        <SetPieces product={product} />
      ) : (
        <Piece product={product} tint={product.swatch} />
      )}
    </svg>
  );
}
