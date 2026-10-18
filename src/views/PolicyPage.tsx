import { POLICIES, type Policy } from "../data/policies";
import Accordion from "../components/ui/Accordion";
import Breadcrumb from "../components/ui/Breadcrumb";
import SideNavLayout from "../components/layout/SideNavLayout";
import styles from "./PolicyPage.module.css";

const CARE_LINKS = Object.entries(POLICIES).map(([slug, policy]) => ({
  label: policy.title,
  href: `/care/${slug}`,
}));

/** Server-rendered customer-care page; the route resolves content from POLICIES. */
export default function PolicyPage({ slug, content }: { slug: string; content: Policy }) {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "care@velourabeauty.com";
  return (
    <main className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Customer care", href: "/care/shipping" },
          { label: content.title },
        ]}
      />
      <SideNavLayout label="Customer care" links={CARE_LINKS} current={`/care/${slug}`}>
        <header className={styles.head}>
          <h1 className="text-h3">{content.title}</h1>
          <p>{content.intro}</p>
        </header>
        <Accordion
          variant="sentence"
          defaultOpen={content.sections[0]?.[0]}
          items={content.sections.map(([title, copy]) => ({
            id: title,
            title,
            content: <p>{copy}</p>,
          }))}
        />
        <p className={styles.contact}>
          Can’t find your answer? Write to <a href={`mailto:${contact}`}>{contact}</a> with your
          order number.
        </p>
      </SideNavLayout>
    </main>
  );
}
