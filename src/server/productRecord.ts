import type { Category, Packaging, Product, ProductType, Tone, Variant } from "../types/commerce";

/** A product row as Prisma returns it, with its brand and shades included. */
export interface ProductRecord {
  id: number;
  slug: string;
  name: string;
  brand: { name: string };
  category: Category;
  subcategory: string | null;
  priceCents: number;
  originalPriceCents: number | null;
  size: string;
  badge: string | null;
  isNew: boolean;
  isBestseller: boolean;
  note: string;
  description: string;
  ingredients: string;
  benefits: string[];
  texture: string;
  finish: string;
  ritual: string;
  routineStep: string;
  matches: string[];
  type: string;
  packaging: string | null;
  color: string;
  includes: number[];
  stock: number | null;
  image: string | null;
  gallery: string[];
  variants: Array<{
    key: string;
    name: string;
    swatch: string;
    priceCents: number;
    stock: number;
    image: string | null;
  }>;
}

/** 3400 → 34. The database keeps whole cents; the storefront shows dollars. */
const dollars = (cents: number) => cents / 100;

/** Database nulls become missing fields, as in the rest of the app. */
const optional = <T>(value: T | null): T | undefined => value ?? undefined;

/** Turns a database row into the Product the storefront uses. */
export function toProduct(record: ProductRecord): Product {
  const variants = record.variants.map(
    (variant): Variant => ({
      id: variant.key,
      name: variant.name,
      swatch: variant.swatch,
      price: dollars(variant.priceCents),
      stock: variant.stock,
      image: optional(variant.image),
    }),
  );
  const base = {
    id: record.id,
    slug: record.slug,
    name: record.name,
    brand: record.brand.name,
    category: record.category,
    subcategory: optional(record.subcategory),
    price: dollars(record.priceCents),
    originalPrice:
      record.originalPriceCents === null ? undefined : dollars(record.originalPriceCents),
    size: record.size,
    badge: optional(record.badge),
    isNew: record.isNew,
    isBestseller: record.isBestseller,
    note: record.note,
    description: record.description,
    ingredients: record.ingredients,
    benefits: record.benefits,
    texture: record.texture,
    finish: record.finish,
    ritual: record.ritual,
    order: record.routineStep,
    matches: record.matches,
    color: record.color as Tone,
    variants: variants.length ? variants : undefined,
    stock: optional(record.stock),
    image: optional(record.image),
    gallery: record.gallery.length ? record.gallery : undefined,
  };
  return record.type === "set"
    ? { ...base, type: "set", includes: record.includes }
    : {
        ...base,
        type: record.type as Exclude<ProductType, "set">,
        packaging: (record.packaging ?? "porcelain") as Packaging,
      };
}
