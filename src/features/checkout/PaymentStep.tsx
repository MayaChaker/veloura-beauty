import type { FormEvent } from "react";
import {
  AccountBalanceWalletOutlined,
  CreditCardOutlined,
  LockOutlined,
  PaymentsOutlined,
  PhoneIphoneOutlined,
} from "@mui/icons-material";
import { PAYMENT_OPTIONS } from "../../domain/commerce/paymentMethods";
import { money } from "../../lib/money";
import Button from "../../components/ui/Button";
import type { ContactDetails, PaymentMethod, ShippingAddress } from "../../types/commerce";
import { formatAddress } from "./checkoutForm";
import styles from "./checkout.module.css";

const ICONS: Record<PaymentMethod, typeof CreditCardOutlined> = {
  card: CreditCardOutlined,
  "apple-pay": AccountBalanceWalletOutlined,
  whish: PhoneIphoneOutlined,
  cash: PaymentsOutlined,
};

interface PaymentStepProps {
  contact: ContactDetails;
  shipping: ShippingAddress;
  deliveryLabel: string;
  method: PaymentMethod;
  onMethod: (method: PaymentMethod) => void;
  total: number;
  placing: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (step: 1 | 2) => void;
  onBack: () => void;
}

export default function PaymentStep({
  contact,
  shipping,
  deliveryLabel,
  method,
  onMethod,
  total,
  placing,
  error,
  onSubmit,
  onEdit,
  onBack,
}: PaymentStepProps) {
  return (
    <form onSubmit={onSubmit}>
      <section className={`${styles.card} ${styles.review}`} aria-label="Your details">
        <div>
          <span>Contact</span>
          <p>
            {contact.email} · {contact.phone}
          </p>
          <button type="button" onClick={() => onEdit(1)} aria-label="Edit contact">
            Edit
          </button>
        </div>
        <div>
          <span>Deliver to</span>
          <p>{formatAddress(shipping)}</p>
          <button type="button" onClick={() => onEdit(2)} aria-label="Edit delivery address">
            Edit
          </button>
        </div>
        <div>
          <span>Method</span>
          <p>{deliveryLabel}</p>
          <button type="button" onClick={() => onEdit(2)} aria-label="Edit delivery method">
            Edit
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Payment</h2>
        <p className={styles.cardNote}>Choose how you’d like to pay.</p>
        <fieldset className={styles.methods}>
          <legend className="srOnly">Payment method</legend>
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const chosen = method === option.id;
            return (
              <div
                key={option.id}
                className={styles.method}
                data-chosen={chosen}
                data-available={option.available}
              >
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={chosen}
                    disabled={!option.available}
                    onChange={() => onMethod(option.id)}
                  />
                  <Icon aria-hidden="true" />
                  <span>
                    {option.label}
                    <small>{option.available ? option.note : "Coming soon"}</small>
                  </span>
                </label>
              </div>
            );
          })}
        </fieldset>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Back to delivery
        </button>
        <Button type="submit" disabled={placing}>
          <LockOutlined aria-hidden="true" />
          {placing ? "Placing order…" : `Place order · ${money(total)}`}
        </Button>
      </div>
      <p className={styles.terms}>
        By placing your order you agree to our terms and refund policy.
      </p>
    </form>
  );
}
