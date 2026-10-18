import { useState } from "react";
import { useCustomer } from "../../hooks/useCustomer";
import Button from "../../components/ui/Button";
import type { BeautyProfile } from "../../types/customer";
import styles from "../account/account.module.css";
import ChoiceGroup from "./ChoiceGroup";

const SKIN_TYPES = ["Balanced", "Dry", "Combination", "Oily", "Sensitive"];
const CONCERNS = ["Dehydration", "Dullness", "Sensitive skin", "Fine lines"];
const PREFERENCES = [
  "Natural coverage",
  "Fragrance-free feel",
  "Weightless textures",
  "Rich textures",
];

/** Edits a draft of the profile and saves it to the browser on demand. */
export default function ProfileForm() {
  const { profile, saveProfile } = useCustomer();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  const update = (next: BeautyProfile) => {
    setDraft(next);
    setSaved(false);
  };

  const toggle = (key: "skinGoals" | "preferences", value: string) => {
    const values = draft[key] || [];
    update({
      ...draft,
      [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    });
  };

  const save = () => {
    saveProfile(draft);
    setSaved(true);
  };

  return (
    <section className={styles.form} aria-label="Beauty profile">
      <ChoiceGroup
        legend="Skin type"
        hint="The one that fits most days."
        values={SKIN_TYPES}
        selected={[draft.skinType]}
        onToggle={(value) => update({ ...draft, skinType: value })}
      />
      <ChoiceGroup
        legend="Skin concerns"
        hint="Choose as many as you like."
        values={CONCERNS}
        selected={draft.skinGoals || []}
        onToggle={(value) => toggle("skinGoals", value)}
      />
      <ChoiceGroup
        legend="Texture and finish"
        hint="How you like products to feel."
        values={PREFERENCES}
        selected={draft.preferences || []}
        onToggle={(value) => toggle("preferences", value)}
      />
      <div className={styles.save}>
        <Button onClick={save}>Save profile</Button>
        <p role="status">{saved ? "Saved in this browser." : ""}</p>
      </div>
    </section>
  );
}
