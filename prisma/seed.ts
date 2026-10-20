// Adds the catalogue files in src/data to the database: `npx prisma db seed`.
// Runs on every deploy, so it only creates what is missing. Once a product is in the database,
// the database is its source of truth: prices and stock changed there are never overwritten.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { brandSlug } from "../src/domain/catalogue/catalogue";
import { PRODUCTS } from "../src/data/products";
import { DEFAULT_STOCK } from "../src/domain/commerce/commerceConfig";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** $34.5 → 3450. Money is stored in whole cents. */
const cents = (amount: number) => Math.round(amount * 100);

async function main() {
  const brandIds = new Map<string, number>();
  for (const name of new Set(PRODUCTS.map((product) => product.brand))) {
    const slug = brandSlug(name);
    const brand = await db.brand.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    brandIds.set(name, brand.id);
  }

  const existing = new Set(
    (await db.product.findMany({ select: { id: true } })).map((product) => product.id),
  );
  let created = 0;

  for (const [position, product] of PRODUCTS.entries()) {
    if (existing.has(product.id)) continue;
    const brandId = brandIds.get(product.brand);
    if (brandId === undefined) throw new Error(`No brand for ${product.slug}`);
    const fields = {
      slug: product.slug,
      name: product.name,
      brandId,
      category: product.category,
      subcategory: product.subcategory ?? null,
      priceCents: cents(product.price),
      originalPriceCents: product.originalPrice ? cents(product.originalPrice) : null,
      size: product.size,
      badge: product.badge ?? null,
      isNew: product.isNew ?? false,
      isBestseller: product.isBestseller ?? false,
      note: product.note,
      description: product.description,
      ingredients: product.ingredients,
      benefits: product.benefits,
      texture: product.texture,
      finish: product.finish,
      ritual: product.ritual,
      routineStep: product.order,
      matches: product.matches,
      type: product.type,
      packaging: product.type === "set" ? null : product.packaging,
      color: product.color,
      includes: product.type === "set" ? product.includes : [],
      stock: product.variants?.length ? null : (product.stock ?? DEFAULT_STOCK),
      image: product.image ?? null,
      gallery: product.gallery ?? [],
      position,
    };
    const variants = (product.variants ?? []).map((variant, index) => ({
      key: variant.id,
      name: variant.name,
      swatch: variant.swatch,
      priceCents: cents(variant.price),
      stock: variant.stock,
      image: variant.image ?? null,
      position: index,
    }));

    // A product and its shades are written together, or not at all.
    await db.product.create({
      data: { id: product.id, ...fields, variants: { create: variants } },
    });
    created += 1;
  }

  const [brands, products, variants] = await Promise.all([
    db.brand.count(),
    db.product.count(),
    db.variant.count(),
  ]);
  console.log(
    `Added ${created} products. The database has ${brands} brands, ${products} products and ${variants} shades.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
