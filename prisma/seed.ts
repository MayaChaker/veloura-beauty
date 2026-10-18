// Fills the database from the catalogue files in src/data: `npx prisma db seed`.
// Safe to run again: brands, products and shades are upserted by their ids.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { brandSlug } from "../src/data/brands";
import { PRODUCTS } from "../src/data/products";

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

  for (const product of PRODUCTS) {
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
      stock: product.variants?.length ? null : (product.stock ?? null),
      image: product.image ?? null,
      gallery: product.gallery ?? [],
    };
    const variants = (product.variants ?? []).map((variant, position) => ({
      key: variant.id,
      name: variant.name,
      swatch: variant.swatch,
      priceCents: cents(variant.price),
      stock: variant.stock,
      image: variant.image ?? null,
      position,
    }));

    // Shades are replaced as a whole, so one removed from the catalogue disappears here too.
    await db.$transaction([
      db.product.upsert({
        where: { id: product.id },
        update: fields,
        create: { id: product.id, ...fields },
      }),
      db.variant.deleteMany({ where: { productId: product.id } }),
      db.variant.createMany({
        data: variants.map((variant) => ({ ...variant, productId: product.id })),
      }),
    ]);
  }

  const [brands, products, variants] = await Promise.all([
    db.brand.count(),
    db.product.count(),
    db.variant.count(),
  ]);
  console.log(`Seeded ${brands} brands, ${products} products and ${variants} shades.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
