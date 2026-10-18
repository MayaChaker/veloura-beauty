import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POLICIES } from "../../../../data/policies";
import PolicyPage from "../../../../views/PolicyPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(POLICIES).map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: PageProps<"/care/[policy]">): Promise<Metadata> {
  const { policy } = await params;
  const content = POLICIES[policy];
  return content ? { title: content.title, description: content.intro } : {};
}

export default async function Page({ params }: PageProps<"/care/[policy]">) {
  const { policy } = await params;
  const content = POLICIES[policy];
  if (!content) notFound();
  return <PolicyPage slug={policy} content={content} />;
}
