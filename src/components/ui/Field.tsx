import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ExpandMore } from "@mui/icons-material";
import styles from "./Field.module.css";

interface FieldProps {
  label: string;
  /** Shown under the control; replaced by the error when there is one. */
  hint?: string;
  error?: string;
  /** Keep the label for screen readers only, e.g. the header search. */
  hideLabel?: boolean;
}

function FieldFrame({
  id,
  label,
  hint,
  error,
  hideLabel,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  const message = error || hint;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={hideLabel ? "srOnly" : styles.label}>
        {label}
      </label>
      {children}
      {message && (
        <p id={`${id}-message`} className={error ? styles.error : styles.hint}>
          {message}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, { hint, error }: FieldProps) =>
  hint || error ? `${id}-message` : undefined;

/** Text input with its label, hint and error. */
export function Input({
  label,
  hint,
  error,
  hideLabel,
  trailing,
  id,
  className,
  ...rest
}: FieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    /** A control inside the field's right edge, e.g. a password's Show button. */
    trailing?: ReactNode;
  }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const input = (
    <input
      id={inputId}
      className={[styles.control, trailing ? styles.hasTrailing : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(inputId, { label, hint, error })}
      {...rest}
    />
  );
  return (
    <FieldFrame id={inputId} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      {trailing ? (
        <div className={styles.withTrailing}>
          {input}
          <div className={styles.trailing}>{trailing}</div>
        </div>
      ) : (
        input
      )}
    </FieldFrame>
  );
}

/** Multi-line text with the same frame as Input. */
export function TextArea({
  label,
  hint,
  error,
  hideLabel,
  id,
  className,
  ...rest
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  return (
    <FieldFrame id={textareaId} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <textarea
        id={textareaId}
        className={[styles.control, styles.textarea, className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(textareaId, { label, hint, error })}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Native select with the same frame as Input. */
export function Select({
  label,
  hint,
  error,
  hideLabel,
  id,
  options,
  className,
  ...rest
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldFrame id={selectId} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <div className={styles.selectWrap}>
        <select
          id={selectId}
          className={[styles.control, styles.select, className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, { label, hint, error })}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ExpandMore className={styles.chevron} aria-hidden="true" />
      </div>
    </FieldFrame>
  );
}

/** Checkbox or radio with its label on the right, used by filters and forms. */
export function Check({
  label,
  count,
  type = "checkbox",
  ...rest
}: { label: string; count?: number; type?: "checkbox" | "radio" } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>) {
  return (
    <label className={styles.check}>
      <input type={type} className={styles.checkInput} {...rest} />
      <span>{label}</span>
      {count !== undefined && <span className={styles.count}>({count})</span>}
    </label>
  );
}
