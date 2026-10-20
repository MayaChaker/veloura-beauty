import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderConfirmationPage from "../../../../features/checkout/OrderConfirmationPage";
import { getOrder } from "../../../../server/orders/getOrder";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function Page({ params }: PageProps<"/checkout/confirmation/[orderId]">) {
  const order = await getOrder((await params).orderId);
  if (!order) notFound();
  return <OrderConfirmationPage order={order} />;
}
