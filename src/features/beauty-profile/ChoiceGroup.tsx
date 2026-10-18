import { useId } from "react";
import { Check } from "@mui/icons-material";
import styles from "../account/account.module.css";

interface ChoiceGroupProps {
  legend: string;
  hint: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

/** One question of the beauty profile: a labelled group of toggle buttons. */
export default function ChoiceGroup({
  legend,
  hint,
  values,
  selected,
  onToggle,
}: ChoiceGroupProps) {
  const id = useId();
  return (
    <div className={styles.question} role="group" aria-labelledby={id}>
      <p className={styles.legend} id={id}>
        {legend}
        <small>{hint}</small>
      </p>
      <div className={styles.choices}>
        {values.map((value) => {
          const on = selected.includes(value);
          return (
            <button type="button" aria-pressed={on} onClick={() => onToggle(value)} key={value}>
              {on && <Check aria-hidden="true" />}
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
