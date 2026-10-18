import Link from "next/link";
import Button from "../../components/ui/Button";
import { CATEGORY_TILES } from "../../data/homepage";
import HeroSlideshow from "./HeroSlideshow";
import styles from "./HomeHero.module.css";

/** The campaign: a sand text panel matched to the photographs' backdrop, then the slideshow. */
export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.text}>
        <div>
          <p className="text-label">The Veloura edit</p>
          <h1 id="hero-title" className={styles.title}>
            Beauty from the houses <em>you trust.</em>
          </h1>
          <p className={styles.lead}>
            Makeup, skincare, fragrance and haircare from celebrated beauty houses, chosen with care
            and delivered in one bag.
          </p>
          <div className={styles.actions}>
            <Button href="/shop">Shop the edit</Button>
            <Button href="/about" variant="text">
              Our story
            </Button>
          </div>
        </div>
        <nav className={styles.categories} aria-label="Shop by category">
          <span>Shop</span>
          {CATEGORY_TILES.map((tile) => (
            <Link key={tile.href} href={tile.href}>
              {tile.label}
            </Link>
          ))}
        </nav>
      </div>
      <HeroSlideshow />
    </section>
  );
}
