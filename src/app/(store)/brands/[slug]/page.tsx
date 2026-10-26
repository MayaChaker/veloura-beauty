import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopPage, { ShopView } from "../../../../features/products/ShopPage";
import { getCatalogue } from "../../../../server/catalogue";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { brands } = await getCatalogue();
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const brand = (await getCatalogue()).getBrand((await params).slug);
  return brand
    ? {
        title: brand.name,
        description: `Shop ${brand.name} at Veloura: ${brand.productCount} ${
          brand.productCount === 1 ? "product" : "products"
        }.`,
      }
    : {};
}

export default async function Page({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  if (!(await getCatalogue()).getBrand(slug)) notFound();
  return (
    <Suspense fallback={<ShopView brandSlug={slug} />}>
      <ShopPage brandSlug={slug} />
    </Suspense>
  );
}
