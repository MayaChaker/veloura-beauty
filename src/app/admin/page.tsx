import { parseRange } from "../../domain/admin/dashboard";
import Overview from "../../features/admin/Overview";
import { getDashboard } from "../../server/admin/dashboard";
import { adminTitle, requireAdmin } from "../../server/session";

export const generateMetadata = adminTitle("Overview");

export default async function Page({ searchParams }: PageProps<"/admin">) {
  await requireAdmin("/admin");
  const { days } = await searchParams;
  return <Overview data={await getDashboard(parseRange(days))} />;
}
