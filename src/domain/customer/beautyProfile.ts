import type { BeautyProfile } from "../../types/customer";

/** The choices of the beauty profile, shared by the form and the server's validation. */
export const SKIN_TYPES = ["Balanced", "Dry", "Combination", "Oily", "Sensitive"] as const;
export const SKIN_CONCERNS = ["Dehydration", "Dullness", "Sensitive skin", "Fine lines"] as const;
export const TEXTURE_PREFERENCES = [
  "Natural coverage",
  "Fragrance-free feel",
  "Weightless textures",
  "Rich textures",
] as const;

/** Nothing chosen yet: the shopper fills it in. */
export const EMPTY_PROFILE: BeautyProfile = { skinType: "", skinGoals: [], preferences: [] };

export const isEmptyProfile = (profile: BeautyProfile) =>
  !profile.skinType && !profile.skinGoals.length && !profile.preferences.length;
