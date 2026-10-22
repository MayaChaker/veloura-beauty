"use client";

import ErrorPage from "../../views/ErrorPage";

// Inside the store layout, so the header and footer stay around the message.
export default function StoreError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorPage digest={error.digest} retry={retry} />;
}
