"use client";

// MUI icons render through Emotion, which needs the client runtime.
import type { ReactNode } from "react";
import { Add } from "@mui/icons-material";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/** Native <details> sections: keyboard and screen-reader support come from the browser. */
export default function Accordion({
  items,
  defaultOpen,
  variant = "caps",
}: {
  items: AccordionItem[];
  /** Id of the item open on first render. */
  defaultOpen?: string;
  /** "caps": small capital titles, e.g. product details. "sentence": questions, e.g. customer care. */
  variant?: "caps" | "sentence";
}) {
  return (
    <div className={`${styles.accordion} ${styles[variant]}`}>
      {items.map((item) => (
        <details key={item.id} className={styles.item} open={item.id === defaultOpen}>
          <summary className={styles.summary}>
            <span>{item.title}</span>
            <Add className={styles.icon} aria-hidden="true" />
          </summary>
          <div className={styles.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
