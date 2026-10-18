"use client";

import AccountLayout from "../account/AccountLayout";
import ProfileForm from "./ProfileForm";

/** Browser-saved skin and texture preferences. */
export default function BeautyProfilePage() {
  return (
    <AccountLayout
      title="Beauty profile"
      current="/profile"
      intro="Your skin type and the textures you like. You can change them at any time."
    >
      <ProfileForm />
    </AccountLayout>
  );
}
