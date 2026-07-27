import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";
import Purchases, {
  LOG_LEVEL,
  PRODUCT_CATEGORY,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from "react-native-purchases";
import {
  ENTITLEMENT_PRO,
  OFFERING_SUPPORT,
  SUPPORT_PRODUCT_IDS,
  SUPPORT_PRODUCT_META,
  SUPPORT_STATIC_PRICES,
  type SupportProductId,
} from "../constants/purchases";
import { getAnalyticsDeviceId, analyticsTrack } from "./analytics";
import { useProStore } from "../stores/appStore";

export type SupportPackageOption = {
  productId: SupportProductId;
  title: string;
  subtitle: string;
  emoji: string;
  priceString: string;
  package?: PurchasesPackage;
  storeProduct?: PurchasesStoreProduct;
};

export type SupportPackagesResult = {
  items: SupportPackageOption[];
  source: "offerings" | "products" | "static" | "none";
  initialized: boolean;
  error?: string;
};

type RevenueCatExtra = {
  iosApiKey?: string;
  androidApiKey?: string;
};

let initialized = false;
let initPromise: Promise<void> | null = null;
let lastInitError: string | null = null;

/** Native modül derlemeye dahil mi (Expo Go'da yok) */
export function isPurchasesNativeModuleLinked(): boolean {
  if (Platform.OS === "web") return false;
  return !!NativeModules.RNPurchases;
}

/** Satın alma akışı bu ortamda denenebilir mi */
export function isPurchasesRuntimeAvailable(): boolean {
  if (Platform.OS === "web") return false;
  if (NativeModules.RNPurchases) return true;
  return Constants.appOwnership === "expo";
}

export function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

function getRevenueCatConfig(): RevenueCatExtra {
  const extra = (Constants.expoConfig?.extra?.revenueCat ?? {}) as RevenueCatExtra;
  const testKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
  return {
    iosApiKey:
      extra.iosApiKey ||
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
      testKey ||
      "",
    androidApiKey:
      extra.androidApiKey ||
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
      testKey ||
      "",
  };
}

export function isPurchasesConfigured(): boolean {
  if (Platform.OS === "web") return false;
  const cfg = getRevenueCatConfig();
  return Platform.OS === "ios" ? !!cfg.iosApiKey : !!cfg.androidApiKey;
}

export function parseProFromCustomerInfo(info: CustomerInfo): {
  isPro: boolean;
  activatedAt: string | null;
} {
  const entitlement = info.entitlements.active[ENTITLEMENT_PRO];
  return {
    isPro: !!entitlement?.isActive,
    activatedAt: entitlement?.originalPurchaseDate ?? null,
  };
}

export function applyCustomerInfoToStore(info: CustomerInfo): void {
  const { isPro, activatedAt } = parseProFromCustomerInfo(info);
  useProStore.getState().setFromCustomerInfo(isPro, activatedAt);
}

/** Uygulama açılışında bir kez çağırın */
export async function initPurchases(): Promise<void> {
  if (initialized || Platform.OS === "web") return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    lastInitError = null;

    if (!isPurchasesConfigured()) {
      lastInitError = "RevenueCat API anahtarı tanımlı değil.";
      return;
    }

    if (!isPurchasesRuntimeAvailable()) {
      lastInitError = "Satın alma native modülü bu derlemede yok.";
      return;
    }

    if (!isPurchasesNativeModuleLinked() && !isExpoGo()) {
      lastInitError =
        "Satın alma native modülü bu derlemede yok. Expo Go yerine cihaza kurulu Ümmet uygulamasını kullanın.";
      if (__DEV__) console.warn("[purchases]", lastInitError);
      return;
    }

    try {
      const cfg = getRevenueCatConfig();
      const apiKey = Platform.OS === "ios" ? cfg.iosApiKey! : cfg.androidApiKey!;

      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      const deviceId = await getAnalyticsDeviceId();
      Purchases.configure({ apiKey, appUserID: deviceId });

      Purchases.addCustomerInfoUpdateListener((info) => {
        applyCustomerInfoToStore(info);
      });

      initialized = true;

      try {
        const info = await Purchases.getCustomerInfo();
        applyCustomerInfoToStore(info);
      } catch {
        // RevenueCat erişilemezse sessiz kal
      }
    } catch (error) {
      initialized = false;
      lastInitError = error instanceof Error ? error.message : "RevenueCat başlatılamadı.";
      if (__DEV__) console.warn("[purchases] initPurchases", error);
    }
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

export function getPurchasesInitError(): string | null {
  return lastInitError;
}

export async function syncPurchases(): Promise<CustomerInfo | null> {
  if (!initialized) return null;

  try {
    const info = await Purchases.getCustomerInfo();
    applyCustomerInfoToStore(info);
    return info;
  } catch {
    return null;
  }
}

function packagesFromOffering(offering: PurchasesOffering): PurchasesPackage[] {
  const candidates = [
    offering.monthly,
    offering.annual,
    offering.sixMonth,
    offering.threeMonth,
    offering.twoMonth,
    offering.weekly,
    offering.lifetime,
    ...offering.availablePackages,
  ];

  const seen = new Set<string>();
  const result: PurchasesPackage[] = [];

  for (const pkg of candidates) {
    if (!pkg) continue;
    if (seen.has(pkg.identifier)) continue;
    seen.add(pkg.identifier);
    result.push(pkg);
  }

  return result;
}

function collectSupportPackages(
  offerings: Awaited<ReturnType<typeof Purchases.getOfferings>>,
): PurchasesPackage[] {
  const supportIds = new Set<string>(SUPPORT_PRODUCT_IDS);
  const byId = new Map<string, PurchasesPackage>();

  const orderedOfferings = [
    offerings.all[OFFERING_SUPPORT],
    offerings.current,
    ...Object.values(offerings.all),
  ].filter((o): o is PurchasesOffering => !!o);

  for (const offering of orderedOfferings) {
    for (const pkg of packagesFromOffering(offering)) {
      const id = pkg.product.identifier;
      if (supportIds.has(id) && !byId.has(id)) {
        byId.set(id, pkg);
      }
    }
    if (byId.size === SUPPORT_PRODUCT_IDS.length) break;
  }

  return sortSupportPackages([...byId.values()]);
}

function sortSupportPackages(packages: PurchasesPackage[]): PurchasesPackage[] {
  const order = ["ummet_support_tea", "ummet_support_standard", "ummet_support_generous"];
  return [...packages].sort((a, b) => {
    const ai = order.indexOf(a.product.identifier);
    const bi = order.indexOf(b.product.identifier);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function mapSupportOptions(
  entries: Array<{ productId: SupportProductId; priceString: string; pkg?: PurchasesPackage; storeProduct?: PurchasesStoreProduct }>,
): SupportPackageOption[] {
  const order = ["ummet_support_tea", "ummet_support_standard", "ummet_support_generous"];

  return entries
    .map(({ productId, priceString, pkg, storeProduct }): SupportPackageOption | null => {
      const meta = SUPPORT_PRODUCT_META[productId];
      if (!meta) return null;

      return {
        productId,
        title: meta.title,
        subtitle: meta.subtitle,
        emoji: meta.emoji,
        priceString,
        package: pkg,
        storeProduct,
      };
    })
    .filter((item): item is SupportPackageOption => item !== null)
    .sort((a, b) => {
      const ai = order.indexOf(a.productId);
      const bi = order.indexOf(b.productId);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}

function buildStaticSupportPackages(): SupportPackageOption[] {
  return SUPPORT_PRODUCT_IDS.map((productId) => {
    const meta = SUPPORT_PRODUCT_META[productId];
    return {
      productId,
      title: meta.title,
      subtitle: meta.subtitle,
      emoji: meta.emoji,
      priceString: SUPPORT_STATIC_PRICES[productId],
    };
  });
}

async function resolveStoreProduct(productId: SupportProductId): Promise<PurchasesStoreProduct | null> {
  try {
    const products = await Purchases.getProducts([productId], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    if (products[0]) return products[0];
  } catch {
    // yedek denenecek
  }

  try {
    const products = await Purchases.getProducts([productId]);
    return products[0] ?? null;
  } catch {
    return null;
  }
}

async function loadSupportFromOfferings(): Promise<SupportPackageOption[]> {
  const offerings = await Purchases.getOfferings();
  const packages = collectSupportPackages(offerings);
  if (packages.length === 0) {
    if (__DEV__) {
      console.warn("[purchases] Offering'de destek ürünü yok.", {
        current: offerings.current?.identifier ?? null,
        offerings: Object.keys(offerings.all),
      });
    }
    return [];
  }

  return mapSupportOptions(
    packages.map((pkg) => ({
      productId: pkg.product.identifier as SupportProductId,
      priceString: pkg.product.priceString,
      pkg,
    })),
  );
}

async function loadSupportFromProducts(): Promise<SupportPackageOption[]> {
  const ids = [...SUPPORT_PRODUCT_IDS];
  let products: PurchasesStoreProduct[] = [];

  try {
    products = await Purchases.getProducts(ids, PRODUCT_CATEGORY.NON_SUBSCRIPTION);
  } catch (error) {
    if (__DEV__) {
      console.warn("[purchases] getProducts(NON_SUBSCRIPTION) başarısız", error);
    }
    try {
      products = await Purchases.getProducts(ids);
    } catch (fallbackError) {
      if (__DEV__) {
        console.warn("[purchases] getProducts yedek çağrısı başarısız", fallbackError);
      }
      throw fallbackError;
    }
  }

  if (products.length === 0) {
    if (__DEV__) {
      console.warn("[purchases] App Store ürünleri boş döndü. RevenueCat → Products ve ASC durumunu kontrol edin.");
    }
    return [];
  }

  return mapSupportOptions(
    products.map((product) => ({
      productId: product.identifier as SupportProductId,
      priceString: product.priceString,
      storeProduct: product,
    })),
  );
}

export async function getSupportPackagesResult(): Promise<SupportPackagesResult> {
  await initPurchases();

  if (!initialized) {
    return {
      items: buildStaticSupportPackages(),
      source: "static",
      initialized: false,
      error: lastInitError ?? "Satın alma modülü başlatılamadı.",
    };
  }

  try {
    const fromOfferings = await loadSupportFromOfferings();
    if (fromOfferings.length > 0) {
      return { items: fromOfferings, source: "offerings", initialized: true };
    }

    const fromProducts = await loadSupportFromProducts();
    if (fromProducts.length > 0) {
      return { items: fromProducts, source: "products", initialized: true };
    }

    return {
      items: buildStaticSupportPackages(),
      source: "static",
      initialized: true,
      error:
        "App Store ürünleri henüz yüklenemedi. RevenueCat'te ürünlerin App Store'a bağlı olduğundan emin olun; satın alma yine de denenebilir.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    if (__DEV__) console.warn("[purchases] getSupportPackagesResult", error);
    return {
      items: buildStaticSupportPackages(),
      source: "static",
      initialized: true,
      error: message,
    };
  }
}

export async function getSupportPackages(): Promise<SupportPackageOption[]> {
  const result = await getSupportPackagesResult();
  return result.items;
}

export async function purchaseSupportOption(item: SupportPackageOption): Promise<boolean> {
  if (!initialized) {
    await initPurchases();
  }
  if (!initialized) return false;

  const productId = item.productId;

  await analyticsTrack({
    name: "purchase_started",
    props: { product_id: productId, type: "support" },
  });

  try {
    let storeProduct = item.storeProduct;
    if (!item.package && !storeProduct) {
      storeProduct = (await resolveStoreProduct(productId)) ?? undefined;
    }

    const { customerInfo } = item.package
      ? await Purchases.purchasePackage(item.package)
      : storeProduct
        ? await Purchases.purchaseStoreProduct(storeProduct)
        : await Promise.reject(
            new Error(
              "Ürün App Store'dan alınamadı. RevenueCat panelinde ürünlerin App Store'a bağlı olduğundan emin olun.",
            ),
          );

    applyCustomerInfoToStore(customerInfo);

    await analyticsTrack({
      name: "purchase_completed",
      props: { product_id: productId, type: "support" },
    });

    return true;
  } catch (error: unknown) {
    const cancelled =
      typeof error === "object" &&
      error !== null &&
      "userCancelled" in error &&
      (error as { userCancelled?: boolean }).userCancelled;

    if (!cancelled) {
      await analyticsTrack({
        name: "purchase_failed",
        props: {
          product_id: productId,
          type: "support",
          message: error instanceof Error ? error.message : "unknown",
        },
      });
    }

    if (cancelled) {
      return false;
    }

    throw error;
  }
}

/** @deprecated purchaseSupportOption kullanın */
export async function purchaseSupportPackage(pkg: PurchasesPackage): Promise<boolean> {
  const productId = pkg.product.identifier as SupportProductId;
  const meta = SUPPORT_PRODUCT_META[productId];
  if (!meta) return false;

  return purchaseSupportOption({
    productId,
    title: meta.title,
    subtitle: meta.subtitle,
    emoji: meta.emoji,
    priceString: pkg.product.priceString,
    package: pkg,
  });
}

export async function restorePurchases(): Promise<boolean> {
  if (!initialized) {
    await initPurchases();
  }
  if (!initialized) return false;

  await analyticsTrack({ name: "restore_purchases" });

  const info = await Purchases.restorePurchases();
  applyCustomerInfoToStore(info);
  return parseProFromCustomerInfo(info).isPro;
}

export async function trackPaywallShown(source: string): Promise<void> {
  await analyticsTrack({
    name: "paywall_shown",
    props: { source, type: "support" },
  });
}
