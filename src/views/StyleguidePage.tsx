"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { reviewsFor } from "../data/reviews";
import type { Product } from "../types/commerce";
import { useCartDrawer } from "../hooks/useCartDrawer";
import { useCatalogue } from "../hooks/useCatalogue";
import Accordion from "../components/ui/Accordion";
import Badge from "../components/ui/Badge";
import Breadcrumb from "../components/ui/Breadcrumb";
import Button from "../components/ui/Button";
import Drawer from "../components/ui/Drawer";
import { Check, Input, Select } from "../components/ui/Field";
import FiltersSidebar from "../components/ui/FiltersSidebar";
import Pagination from "../components/ui/Pagination";
import Price from "../components/ui/Price";
import ProductGrid, { ProductGridItem } from "../components/ui/ProductGrid";
import Rating from "../components/ui/Rating";
import Reviews from "../components/ui/Reviews";
import SectionHeader from "../components/ui/SectionHeader";
import ProductCard from "../features/products/ProductCard";
import styles from "./StyleguidePage.module.css";

const SAMPLE_SLUGS = [
  "estee-lauder-double-wear",
  "dior-sauvage-eau-de-parfum",
  "glossier-solution",
  "olaplex-no-6-bond-smoother",
];

const COLOURS = [
  ["--color-ivory", "#F6F2EB", "Page background"],
  ["--color-bone", "#ECE5D9", "Product mats, quiet bands, footer"],
  ["--color-sand", "#C3B09C", "Hero ground, from the campaign backdrop"],
  ["--color-paper", "#FBF9F5", "Inputs, raised surfaces"],
  ["--color-umber", "#2A231E", "Text, primary buttons"],
  ["--color-taupe", "#716559", "Secondary text"],
  ["--color-line", "#DDD3C5", "Borders, dividers"],
  ["--color-accent", "#7C2A2A", "Oxblood: hover, sale price, focus"],
] as const;

const TYPE = [
  ["text-h1", "H1 · Noto Serif Display 300 · 44–76", "Beauty from the houses ", "you trust."],
  ["text-h2", "H2 · Noto Serif Display 300 · 34–52", "Discover by ", "category"],
  ["text-h3", "H3 · Noto Serif Display 300 · 24–34", "Makeup"],
  ["text-h4", "H4 · Noto Serif Display 400 · 24", "Your bag"],
  ["text-h5", "H5 · Noto Serif Display 400 · 20", "Shop makeup"],
  ["text-label", "Label · Albert Sans 600 · 11 capitals", "Most loved"],
  ["text-body", "Body · Albert Sans 15", "A long-wear foundation with a natural matte finish."],
  ["text-small", "Small · Albert Sans 13", "Product names, links, form labels"],
  ["text-caption", "Caption · Albert Sans 12", "6W1 Sandalwood · 30 ml"],
] as readonly (readonly [string, string, string, string?])[];

const SPACES = [4, 8, 12, 16, 24, 32, 48, 64, 96];

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h2 className="text-h3">{title}</h2>
        {note && <p className="text-small text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const countBy = (products: readonly Product[], key: (product: Product) => string) =>
  products.reduce<Record<string, number>>((counts, product) => {
    counts[key(product)] = (counts[key(product)] ?? 0) + 1;
    return counts;
  }, {});

export default function StyleguidePage() {
  const { products, getBySlug } = useCatalogue();
  const sample = SAMPLE_SLUGS.map((slug) => getBySlug(slug)).filter(
    (product) => product !== undefined,
  );
  const { openCart } = useCartDrawer();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const categories = countBy(products, (product) => product.category);
  const brandCounts = countBy(products, (product) => product.brand);

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.intro}>
        <p className="text-label text-muted">Design system</p>
        <h1>Veloura styleguide</h1>
        <p className="text-muted">
          Every token and shared component, rendered from the real code. Pages may only use what is
          on this page. The header and footer above and below are the shared ones.
        </p>
      </header>

      <Block
        title="Colour"
        note="Taken from the campaign photography: ivory, bone and sand grounds, umber text and one oxblood accent."
      >
        <ul className={styles.swatches}>
          {COLOURS.map(([token, hex, use]) => (
            <li key={token}>
              <span
                className={styles.swatch}
                style={{ "--fill": `var(${token})` } as CSSProperties}
              />
              <strong className="text-small">{hex}</strong>
              <code className="text-caption">{token}</code>
              <span className="text-caption text-muted">{use}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        title="Type scale"
        note="Noto Serif Display for headings, Albert Sans for everything else. These nine sizes only."
      >
        <dl className={styles.type}>
          {TYPE.map(([className, label, sampleText, italic]) => (
            <div key={className}>
              <dt className="text-caption text-muted">{label}</dt>
              <dd className={className}>
                {sampleText}
                {italic && <em>{italic}</em>}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block
        title="Space, radius, grid"
        note="4px base. Square corners everywhere. Container 1440px; gutter 18 / 32 / 32–56px."
      >
        <ul className={styles.spaces}>
          {SPACES.map((space) => (
            <li key={space}>
              <span style={{ width: space, height: space }} />
              <span className="text-caption">{space}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Buttons" note="Primary, secondary and text. Hover changes colour in 200ms.">
        <div className={styles.row}>
          <Button>Add to bag</Button>
          <Button variant="secondary">View all</Button>
          <Button variant="text">Clear filters</Button>
          <Button disabled>Out of stock</Button>
          <Button variant="secondary" disabled>
            Choose shade
          </Button>
          <Button href="/shop" variant="secondary">
            A link styled as a button
          </Button>
        </div>
      </Block>

      <Block title="Badges" note="Only these three. Other labels in the data are not shown.">
        <div className={`${styles.row} ${styles.onSurface}`}>
          <Badge kind="New" />
          <Badge kind="Bestseller" />
          <Badge kind="Exclusive" />
        </div>
      </Block>

      <Block title="Forms">
        <div className={styles.forms}>
          <Input label="Email address" type="email" placeholder="you@example.com" />
          <Input label="Postcode" hint="Used for delivery estimates only." />
          <Input
            label="Phone"
            error="Enter a phone number with the country code."
            defaultValue="12"
          />
          <Select
            label="Sort by"
            options={[
              { value: "featured", label: "Featured" },
              { value: "price-low", label: "Price: low to high" },
              { value: "price-high", label: "Price: high to low" },
            ]}
          />
          <div>
            <Check label="In stock only" />
            <Check label="Under $50" defaultChecked />
          </div>
        </div>
      </Block>

      <Block title="Breadcrumb, price, rating">
        <div className={styles.stack}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Makeup", href: "/shop/makeup" },
              { label: "Double Wear Stay-in-Place Foundation" },
            ]}
          />
          <div className={styles.row}>
            <Price amount={52} />
            <Price amount={39} compareAt={52} />
            <Price amount={28} from />
            <Price amount={52} size="large" />
          </div>
          <p className="text-small text-muted">
            Rating and Reviews render nothing until real reviews exist (src/data/reviews.ts is
            empty). Nothing appears below this line, which is correct:
          </p>
          <Rating reviews={reviewsFor(1)} />
          <Reviews reviews={reviewsFor(1)} />
        </div>
      </Block>

      <Block title="Accordion" note="Native details and summary. Used on the product page.">
        <div className={styles.narrow}>
          <Accordion
            defaultOpen="details"
            items={[
              {
                id: "details",
                title: "Details",
                content: <p>Product details from the catalogue.</p>,
              },
              {
                id: "use",
                title: "How to use",
                content: <p>Application steps from the catalogue.</p>,
              },
              {
                id: "ingredients",
                title: "Ingredients",
                content: <p>The full ingredient list.</p>,
              },
            ]}
          />
        </div>
      </Block>

      <Block title="Pagination" note="Renders nothing when everything fits on one page.">
        <Pagination page={2} pageCount={4} hrefFor={(page) => `/styleguide?page=${page}`} />
      </Block>

      <Block
        title="Product card and grid"
        note="4:5 bone mat. With a mouse, the photograph eases forward and the bag action slides up; on touch it sits under the photograph."
      >
        <ProductGrid>
          {sample.map((product) => (
            <ProductGridItem key={product.id}>
              <ProductCard product={product} onAdded={openCart} />
            </ProductGridItem>
          ))}
        </ProductGrid>
      </Block>

      <Block
        title="Section header"
        note="Every section starts with this row: label, title with one italic word, link."
      >
        <SectionHeader
          eyebrow="Most loved"
          title="Bestsellers"
          link={{ label: "Shop all", href: "/shop?collection=bestsellers" }}
        />
      </Block>

      <Block
        title="Filters sidebar and drawer"
        note="The same filters sit beside the grid on desktop and in a drawer on phones."
      >
        <div className={styles.filters}>
          <FiltersSidebar
            groups={[
              {
                id: "category",
                legend: "Category",
                multiple: false,
                selected: category,
                onChange: setCategory,
                options: Object.entries(categories).map(([value, count]) => ({
                  value,
                  label: value,
                  count,
                })),
              },
              {
                id: "brand",
                legend: "Brand",
                multiple: true,
                selected: brands,
                onChange: setBrands,
                options: Object.entries(brandCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(0, 8)
                  .map(([value, count]) => ({ value, label: value, count })),
              },
            ]}
            onClear={() => {
              setCategory([]);
              setBrands([]);
            }}
          />
          <div>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open a drawer
            </Button>
          </div>
        </div>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Drawer"
          footer={
            <Button fullWidth onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-muted">
            The bag, the filters on phones and the mobile menu all use this panel. It slides in over
            300ms; Escape, the close button or a click outside closes it.
          </p>
        </Drawer>
      </Block>
    </main>
  );
}
