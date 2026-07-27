/**
 * RevenueCat ürün ve entitlement sabitleri.
 *
 * App Store Connect + RevenueCat panelinde aynı kimlikler kullanılmalı.
 * Destek ürünleri: consumable (abonelik değil).
 * Pro ürünleri: subscription / non-consumable (entitlement: pro).
 */
export const ENTITLEMENT_PRO = "pro";

/** RevenueCat offering kimliği — Destek Ol paketleri */
export const OFFERING_SUPPORT = "support";

/** RevenueCat offering kimliği — Ümmet Pro (ileride) */
export const OFFERING_PRO = "pro";

/** Consumable destek ürünleri */
export const SUPPORT_PRODUCT_IDS = [
  "ummet_support_tea",
  "ummet_support_standard",
  "ummet_support_generous",
] as const;

export type SupportProductId = (typeof SUPPORT_PRODUCT_IDS)[number];

export const SUPPORT_PRODUCT_META: Record<
  SupportProductId,
  { title: string; subtitle: string; emoji: string }
> = {
  ummet_support_tea: {
    title: "Bir çay ısmarla",
    subtitle: "Küçük ama değerli bir destek",
    emoji: "☕",
  },
  ummet_support_standard: {
    title: "Destek ol",
    subtitle: "Geliştirmeye devam etmemizi sağlar",
    emoji: "💚",
  },
  ummet_support_generous: {
    title: "Cömert destek",
    subtitle: "Büyük katkı — çok teşekkürler",
    emoji: "✨",
  },
};

/** App Store fiyatları — mağaza yanıt vermezse gösterim yedeği */
export const SUPPORT_STATIC_PRICES: Record<SupportProductId, string> = {
  ummet_support_tea: "₺29,99",
  ummet_support_standard: "₺79,99",
  ummet_support_generous: "₺199,99",
};

/** Pro abonelik ürünleri (henüz yayında olmayabilir) */
export const PRO_PRODUCT_IDS = [
  "ummet_pro_monthly",
  "ummet_pro_yearly",
  "ummet_pro_lifetime",
] as const;

export function isSupportProduct(productId: string): boolean {
  return (SUPPORT_PRODUCT_IDS as readonly string[]).includes(productId);
}

export function isProProduct(productId: string): boolean {
  return (PRO_PRODUCT_IDS as readonly string[]).includes(productId);
}
