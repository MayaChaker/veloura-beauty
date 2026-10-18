import Image from "next/image";
import styles from "./EditorialImage.module.css";

interface EditorialImageProps {
  /** File name in public/images/editorial, without the extension. */
  name: string;
  alt: string;
  /** Rendered width at each breakpoint, so the browser downloads the right size. */
  sizes: string;
  /** Load eagerly: only for the image above the fold. */
  priority?: boolean;
}

/** A campaign photograph that fills its (positioned) parent, cropped to cover. */
export default function EditorialImage({
  name,
  alt,
  sizes,
  priority = false,
}: EditorialImageProps) {
  return (
    <Image
      className={styles.image}
      src={`/images/editorial/${name}.webp`}
      alt={alt}
      fill
      sizes={sizes}
      quality={85}
      priority={priority}
    />
  );
}
