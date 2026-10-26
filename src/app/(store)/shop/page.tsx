import { Suspense } from "react";
import ShopPage, { ShopView } from "../../../features/products/ShopPage";

export const metadata = {
  title: "Shop",
  description:
    "Shop makeup, skincare, fragrance and haircare from the brands you love, at Veloura Beauty.",
};

export default function Page() {
  // ShopPage reads filters from the query string, which is only known in the browser.
  return (
    <Suspense fallback={<ShopView />}>
      <ShopPage />
    </Suspense>
  );
}
