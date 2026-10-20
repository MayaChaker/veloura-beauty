// Shared types for the catalogue and the commerce domain.

export type ProductId = number;

export type Category = "Makeup" | "Skincare" | "Fragrance" | "Hair" | "Sets";

/** Packaging shape drawn by ProductArt. */
export type ProductType =
  | "serum"
  | "bottle"
  | "pump"
  | "wand"
  | "gloss"
  | "mascara"
  | "tube"
  | "jar"
  | "lipstick"
  | "compact"
  | "palette"
  | "set";

/** Packaging material, see components/product-art/packaging.js. */
export type Packaging = "porcelain" | "blush" | "burgundy" | "lacquer";

/** Background tone class used behind product art. */
export type Tone = "ivory" | "blush" | "plum" | "sand" | "rose" | "sage" | "clay" | "espresso";

export interface Variant {
  id: string;
  name: string;
  /** Hex colour of the formula, used for swatches and product art. */
  swatch: string;
  price: number;
  stock: number;
  /** Photograph of this shade, under /public. */
  image?: string;
}

interface ProductBase {
  id: ProductId;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  /** Slug from src/data/subcategories.ts, e.g. "lips". */
  subcategory?: string;
  price: number;
  originalPrice?: number;
  size: string;
  badge?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  note: string;
  description: string;
  ingredients: string;
  benefits: string[];
  texture: string;
  finish: string;
  ritual: string;
  order: string;
  matches: string[];
  color: Tone;
  variants?: Variant[];
  stock?: number;
  /** Photograph under /public; the SVG art is drawn when it is missing. */
  image?: string;
  /** More photographs after the main one: the gallery shows thumbnails and the card swaps on hover only when this has items. */
  gallery?: string[];
}

/** A single item: drawn from its packaging type and material. */
export interface SingleProduct extends ProductBase {
  type: Exclude<ProductType, "set">;
  packaging: Packaging;
}

/** A set: drawn by composing the products it includes. */
export interface ProductSet extends ProductBase {
  type: "set";
  includes: ProductId[];
  /** The products in `includes`, attached by createCatalogue so the set can be drawn. */
  parts?: SingleProduct[];
}

export type Product = SingleProduct | ProductSet;

/** A customer review. Only real, attributable reviews may be stored (src/data/reviews.ts). */
export interface Review {
  id: string;
  productId: ProductId;
  author: string;
  /** 1 to 5. */
  rating: number;
  title: string;
  body: string;
  /** ISO 8601 date. */
  date: string;
}

/** A product as chosen by the shopper: the base product merged with the selected variant. */
export type ProductSelection = Product & {
  productId: ProductId;
  /** Unique per product + variant, e.g. "7:deep". */
  cartId: string;
  variantId?: string;
  selectedVariant?: string;
  swatch?: string;
};

export type CartLine = ProductSelection & { quantity: number };

/**
 * A bag line as persisted in localStorage. Only the identity fields are trusted;
 * everything else is re-read from the catalogue (older saves may carry stale data).
 */
export interface StoredCartLine {
  productId?: ProductId;
  id?: ProductId | string;
  variantId?: string;
  cartId?: string;
  quantity?: number | string;
  [key: string]: unknown;
}

export interface Promotion {
  /** Fraction taken off the subtotal, e.g. 0.1 for 10%. */
  rate: number;
  label: string;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
  promotion: Promotion | null;
}

export interface ContactDetails {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * Where an order goes. Addresses in Lebanon rarely use postcodes, so couriers rely on the
 * area, building and directions, and on the pin dropped on the map.
 */
export interface ShippingAddress {
  area: string;
  street: string;
  building: string;
  floor: string;
  /** Free text for the courier, e.g. "Next to the pharmacy, blue door". */
  directions: string;
  country: string;
  /** The pin dropped on the map, when the shopper placed one. */
  location?: { lat: number; lng: number };
}

export type PaymentMethod = "card" | "apple-pay" | "whish" | "cash";

/** What checkout collects before an order is placed. */
export interface OrderRequest {
  cart: CartLine[];
  contact: ContactDetails;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  promoCode: string;
  total: number;
}

/** A placed order, as this browser keeps it for the order history and confirmation page. */
export interface Order extends Omit<OrderRequest, "cart"> {
  /** The server's unguessable id: the confirmation page's URL. */
  id: string;
  /** Short reference shown to the shopper, e.g. "VB-7K2M9Q". Missing on orders placed before the API. */
  reference?: string;
  /** ISO 8601 timestamp. */
  placedAt: string;
  status: "Placed" | "Confirmed";
  items: CartLine[];
  payment: string;
}
