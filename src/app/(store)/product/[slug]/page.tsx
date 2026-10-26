import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage, { ProductView } from "../../../../features/products/ProductPage";
import { getCatalogue } from "../../../../server/catalogue";

// Every product page is pre-rendered at build time; unknown slugs 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const { products } = await getCatalogue();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getCatalogue()).getBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    // Child openGraph objects replace the parent's, so the share image is repeated here.
    openGraph: {
      title: `${product.name} | Veloura Beauty`,
      description: product.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  if (!(await getCatalogue()).getBySlug(slug)) notFound();
  return (
    <Suspense fallback={<ProductView slug={slug} />}>
      <ProductPage slug={slug} />
    </Suspense>
  );
}
