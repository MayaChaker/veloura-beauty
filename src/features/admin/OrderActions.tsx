"use client";

import { useState, useTransition } from "react";
import Button from "../../components/ui/Button";
import { formatCents } from "../../domain/orders/receipt";
import { ACTION_LABELS, canCancel, nextStatus } from "../../domain/orders/status";
import type { OrderStatus } from "../../domain/orders/summary";
import { updateOrderStatus } from "../../server/admin/orderActions";
import styles from "./admin.module.css";

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
  totalCents: number;
}

/**
 * The next step for an order, one button at a time, and cancelling with a second click to
 * confirm. The buttons only offer what the server allows; the server checks it again.
 */
export default function OrderActions({ orderId, status, totalCents }: OrderActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const next = nextStatus(status);

  const move = (to: OrderStatus) =>
    startTransition(async () => {
      setError("");
      const result = await updateOrderStatus(orderId, to);
      if (!result.ok) setError(result.error);
      setConfirming(false);
    });

  if (!next && !canCancel(status)) {
    return (
      <p className={styles.hint}>
        {status === "Delivered" ? "Delivered and paid." : "This order was cancelled."}
      </p>
    );
  }

  return (
    <div className={styles.actions}>
      {status !== "Cancelled" && (
        <p className={styles.collect}>
          <span>{status === "Delivered" ? "Collected" : "Collect on delivery"}</span>
          <strong>{formatCents(totalCents)}</strong>
        </p>
      )}
      {next && (
        <Button fullWidth disabled={pending} onClick={() => move(next)}>
          {pending && !confirming ? "Saving…" : ACTION_LABELS[next]}
        </Button>
      )}
      {canCancel(status) &&
        (confirming ? (
          <div className={styles.confirm}>
            <p>Cancel this order? The items go back in stock.</p>
            <Button variant="secondary" disabled={pending} onClick={() => move("Cancelled")}>
              {pending ? "Cancelling…" : "Yes, cancel it"}
            </Button>
            <Button variant="text" disabled={pending} onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </div>
        ) : (
          <Button variant="secondary" fullWidth onClick={() => setConfirming(true)}>
            Cancel order
          </Button>
        ))}
      <p className={styles.hint}>Cancelling puts the items back in stock. It cannot be undone.</p>
      <p role="alert" className={styles.error}>
        {error}
      </p>
    </div>
  );
}
