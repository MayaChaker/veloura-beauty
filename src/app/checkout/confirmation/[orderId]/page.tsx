import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderConfirmationPage from "../../../../features/checkout/OrderConfirmationPage";
import { getOrder } from "../../../../server/orders/getOrder";

// An unknown id gets the 404's own title, not "Order confirmed" (getOrder is cached, so the
// page below does not query again).
export async function generateMetadata({
  params,
}: PageProps<"/checkout/confirmation/[orderId]">): Promise<Metadata> {
  const order = await getOrder((await params).orderId);
  return { title: order ? "Order confirmed" : "Page not found", robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/checkout/confirmation/[orderId]">) {
  const order = await getOrder((await params).orderId);
  if (!order) notFound();
  return <OrderConfirmationPage order={order} />;
}
