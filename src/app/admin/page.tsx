import { redirect } from "next/navigation";
import { adminTitle, requireAdmin } from "../../server/session";

export const generateMetadata = adminTitle("Admin");

export default async function Page() {
  await requireAdmin("/admin");
  redirect("/admin/orders");
}
