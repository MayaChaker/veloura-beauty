"use client";

import ErrorPage from "../../views/ErrorPage";

// Inside the admin layout, so the menu stays and the admin can go elsewhere.
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorPage
      digest={error.digest}
      retry={retry}
      home={{ href: "/admin", label: "Back to the overview" }}
    />
  );
}
