"use client";

import StoreShell from "../components/layout/StoreShell";
import ErrorPage from "../views/ErrorPage";

// Pages outside the store layout (checkout) fail here; the store chrome is added back.
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <StoreShell>
      <ErrorPage digest={error.digest} retry={retry} />
    </StoreShell>
  );
}
