"use server";

import { z } from "zod";
import {
  SKIN_CONCERNS,
  SKIN_TYPES,
  TEXTURE_PREFERENCES,
  isEmptyProfile,
} from "../domain/customer/beautyProfile";
import { db } from "../lib/db";
import type { BeautyProfile } from "../types/customer";
import { getCurrentUser } from "./session";

// Server actions are public endpoints like any API route: each one checks who is calling and
// validates what it receives, whatever the page that calls it sends.

const productIds = z.array(z.number().int().positive()).max(200);
const profileSchema = z.object({
  skinType: z.union([z.enum(SKIN_TYPES), z.literal("")]),
  skinGoals: z.array(z.enum(SKIN_CONCERNS)).max(SKIN_CONCERNS.length),
  preferences: z.array(z.enum(TEXTURE_PREFERENCES)).max(TEXTURE_PREFERENCES.length),
});

const savedIds = async (userId: string) =>
  (
    await db.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { productId: true },
    })
  ).map((item) => item.productId);

/**
 * Adds what this browser saved as a guest to the account's wishlist, then returns the
 * account's wishlist. Null for a guest: the browser keeps its own.
 */
export async function syncWishlist(localIds: number[]): Promise<number[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const ids = productIds.parse(localIds);
  if (ids.length) {
    const existing = await db.product.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    await db.wishlistItem.createMany({
      data: existing.map((product) => ({ userId: user.id, productId: product.id })),
      skipDuplicates: true,
    });
  }
  return savedIds(user.id);
}

/** Saves or removes one product. Does nothing for a guest. */
export async function setWishlistItem(productId: number, saved: boolean): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = z.number().int().positive().parse(productId);
  if (saved) {
    await db.wishlistItem.createMany({
      data: [{ userId: user.id, productId: id }],
      skipDuplicates: true,
    });
  } else {
    await db.wishlistItem.deleteMany({ where: { userId: user.id, productId: id } });
  }
}

/**
 * The account's beauty profile. When the account has none yet, the one this browser holds
 * becomes it. Null for a guest.
 */
export async function syncBeautyProfile(local: BeautyProfile): Promise<BeautyProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const stored = await db.beautyProfile.findUnique({ where: { userId: user.id } });
  if (stored) {
    return {
      skinType: stored.skinType,
      skinGoals: stored.skinGoals,
      preferences: stored.preferences,
    };
  }
  const parsed = profileSchema.safeParse(local);
  if (!parsed.success || isEmptyProfile(parsed.data)) return local;
  await db.beautyProfile.create({ data: { userId: user.id, ...parsed.data } });
  return parsed.data;
}

/** Saves the beauty profile to the account. Does nothing for a guest. */
export async function saveBeautyProfile(profile: BeautyProfile): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const data = profileSchema.parse(profile);
  await db.beautyProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });
}
