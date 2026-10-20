"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExpandMore } from "@mui/icons-material";
import { money } from "../../lib/money";
import { useCommerce } from "../../hooks/useCommerce";
import { useSession } from "../../lib/authClient";
import { orderService } from "../../services/orderService";
import type { ContactDetails, PaymentMethod, ShippingAddress } from "../../types/commerce";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutStepper from "./CheckoutStepper";
import DeliveryStep from "./DeliveryStep";
import InformationStep from "./InformationStep";
import OrderSummary from "./OrderSummary";
import PaymentStep from "./PaymentStep";
import styles from "./checkout.module.css";

const emptyContact: ContactDetails = { email: "", firstName: "", lastName: "", phone: "" };
const emptyShipping: ShippingAddress = {
  area: "",
  street: "",
  building: "",
  floor: "",
  directions: "",
  country: "Lebanon",
};

/** Checkout in three steps, one screen each: information, delivery, payment. */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, hydrated, totals, promoCode, addOrder, clearCart } = useCommerce();
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState(emptyContact);
  const { data: session } = useSession();
  const [shipping, setShipping] = useState(emptyShipping);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const emptyBag = hydrated && !cart.length && !placed;

  // Wait until the saved bag has loaded before deciding it is empty.
  useEffect(() => {
    if (emptyBag) router.replace("/shop");
  }, [emptyBag, router]);

  // A signed-in shopper's name and email are filled in once, without replacing anything typed.
  // Adjusting state while rendering (not in an effect) avoids a second render with empty fields.
  const account = session?.user;
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (account && prefilledFor !== account.id) {
    setPrefilledFor(account.id);
    const [firstName = "", ...rest] = account.name.trim().split(/\s+/);
    setContact((current) => ({
      ...current,
      email: current.email || account.email,
      firstName: current.firstName || firstName,
      lastName: current.lastName || rest.join(" "),
    }));
  }

  // Each step starts at the top of the page.
  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [step]);

  if (!hydrated || !cart.length) return null;

  const goTo = (nextStep: number) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(nextStep);
  };
  const deliveryLabel = `Standard delivery · ${totals.shipping ? money(totals.shipping) : "Free"}`;

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPlacing(true);
    setCheckoutError("");
    try {
      const order = await orderService.create({
        cart,
        contact,
        shipping,
        paymentMethod,
        promoCode,
        total: totals.total,
      });
      addOrder(order);
      setPlaced(true);
      router.replace(`/checkout/confirmation/${order.id}`);
      clearCart();
    } catch (error) {
      setCheckoutError(
        (error instanceof Error && error.message) || "Your order could not be placed.",
      );
      setPlacing(false);
    }
  };

  const summary = <OrderSummary cart={cart} totals={totals} promoCode={promoCode} />;

  return (
    <div className={styles.page}>
      <CheckoutHeader />

      <details className={styles.mobileSummary}>
        <summary>
          <span>
            Order summary <ExpandMore aria-hidden="true" />
          </span>
          <strong>{money(totals.total)}</strong>
        </summary>
        {summary}
      </details>

      <main className={styles.wrap}>
        <h1 className="srOnly">Checkout</h1>
        <CheckoutStepper step={step} />
        <div className={styles.grid}>
          <div className={styles.steps}>
            {step > 1 && step < 3 && (
              <section className={`${styles.card} ${styles.doneCard}`}>
                <p>
                  <strong>Information</strong>
                  {contact.firstName} {contact.lastName} · {contact.email} · {contact.phone}
                </p>
                <button type="button" onClick={() => setStep(1)} aria-label="Edit information">
                  Edit
                </button>
              </section>
            )}
            {step === 1 && (
              <InformationStep contact={contact} setContact={setContact} onSubmit={goTo(2)} />
            )}
            {step === 2 && (
              <DeliveryStep
                shipping={shipping}
                setShipping={setShipping}
                totals={totals}
                onSubmit={goTo(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <PaymentStep
                contact={contact}
                shipping={shipping}
                deliveryLabel={deliveryLabel}
                method={paymentMethod}
                onMethod={setPaymentMethod}
                total={totals.total}
                placing={placing}
                error={checkoutError}
                onSubmit={placeOrder}
                onEdit={setStep}
                onBack={() => setStep(2)}
              />
            )}
          </div>
          <aside className={`${styles.card} ${styles.summary}`} aria-label="Order summary">
            <h2 className={styles.cardTitle}>Order summary</h2>
            {summary}
          </aside>
        </div>
      </main>
    </div>
  );
}
