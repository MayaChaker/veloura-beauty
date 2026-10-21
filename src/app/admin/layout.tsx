import type { Metadata } from "next";
import AdminShell from "../../features/admin/AdminShell";
import { countToShip } from "../../server/admin/adminOrders";
import { getAdmin } from "../../server/session";

// Only an admin gets the admin title template: anyone else must see an ordinary 404.
export async function generateMetadata(): Promise<Metadata> {
  if (!(await getAdmin())) return {};
  return {
    title: { default: "Admin", template: "%s | Veloura Admin" },
    robots: { index: false, follow: false },
  };
}

/**
 * The admin tool, without the store's header and footer. Each admin page checks the role
 * itself (requireAdmin), because a layout is not re-run on every navigation. Here the check
 * only decides whether to draw the admin menu, so a customer sees the store's ordinary 404.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdmin();
  if (!admin) return children;
  return (
    <AdminShell admin={admin} toShip={await countToShip()}>
      {children}
    </AdminShell>
  );
}
