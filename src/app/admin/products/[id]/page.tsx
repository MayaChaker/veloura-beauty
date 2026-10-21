import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "../../../../features/admin/ProductForm";
import styles from "../../../../features/admin/admin.module.css";
import { getAdminProduct } from "../../../../server/admin/adminProducts";
import { adminTitle, requireAdmin } from "../../../../server/session";

export const generateMetadata = adminTitle("Product");

export default async function Page({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  const productId = Number(id);
  const product = Number.isInteger(productId) ? await getAdminProduct(productId) : null;
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className={styles.back}>
        ← Products
      </Link>
      <div className={styles.productHead}>
        <span className={styles.thumb}>
          {product.image && (
            <Image src={product.image} alt="" width={128} height={160} sizes="64px" />
          )}
        </span>
        <div>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.hint}>
            {product.brand.name} · {product.category} ·{" "}
            <Link href={`/product/${product.slug}`} target="_blank">
              View in store
            </Link>
          </p>
        </div>
      </div>
      <ProductForm
        product={{
          id: product.id,
          priceCents: product.priceCents,
          wasPriceCents: product.originalPriceCents,
          stock: product.stock,
          shades: product.variants.map((variant) => ({
            key: variant.key,
            name: variant.name,
            swatch: variant.swatch,
            stock: variant.stock,
          })),
          soldLast30Days: product.soldLast30Days,
        }}
      />
    </>
  );
}
