import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";

/**
 * Hata ve çökme izleme.
 *
 * NEDEN GEREKLİ
 * Şu ana kadar kaç kullanıcının hangi ekranda çöktüğünü bilmenin hiçbir yolu
 * yoktu. Kod boyunca sessizce yutulan `catch {}` blokları var; bir kullanıcı
 * "açılmıyor" dediğinde elimizde tek bir kayıt bulunmuyordu.
 *
 * DSN YOKSA NE OLUR
 * Hiçbir şey. `init` çağrılmaz, `captureError` sessizce döner. Sentry hesabı
 * açılana kadar uygulama normal çalışmaya devam eder — geliştirme ortamında da
 * gereksiz gürültü üretmez.
 *
 * DSN nereye yazılır: app.json > expo.extra.sentryDsn
 */

const DSN: string | undefined = (
  Constants.expoConfig?.extra as { sentryDsn?: string } | undefined
)?.sentryDsn;

let enabled = false;

export function initErrorTracking(): void {
  if (!DSN) return;

  try {
    Sentry.init({
      dsn: DSN,

      // Geliştirmede yakalanan hatalar Sentry kotasını yakar ve gerçek
      // sinyali gizler — sadece üretimde gönder
      enabled: !__DEV__,

      environment: __DEV__ ? "development" : "production",
      release: Application.nativeApplicationVersion ?? undefined,
      dist: Application.nativeBuildVersion ?? undefined,

      // Performans izleme: kullanıcının %20'si yeterli, kota israfı olmasın
      tracesSampleRate: 0.2,

      // Ekran görüntüsü ve DOM kaydı GÖNDERİLMEZ.
      // Bu bir ibadet uygulaması; kullanıcının kaza borcu, zikir sayacı ve
      // konumu ekranda görünüyor. Hata ayıklama için bunları toplamaya değmez.
      attachScreenshot: false,
      attachViewHierarchy: false,

      // Gönderilmeden önce hassas veriyi temizle
      beforeSend(event) {
        if (event.user) {
          delete event.user.ip_address;
          delete event.user.email;
        }
        return event;
      },

      // Kullanıcı davranışı izi — gürültülü olanları at
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === "console" && breadcrumb.level === "debug") {
          return null;
        }
        return breadcrumb;
      },
    });

    enabled = true;
  } catch {
    // İzleme aracının kendisi uygulamayı çökertmemeli
  }
}

/**
 * Bir hatayı bağlamıyla birlikte gönderir.
 *
 * Kullanım: sessiz `catch {}` yerine. Kullanıcıya bir şey göstermek gerekmiyorsa
 * bile en azından biz haberdar olalım.
 *
 * @param where  Nerede oldu — "quran-reader:loadPages" gibi
 * @param error  Yakalanan hata
 * @param extra  Teşhise yarayacak ek bilgi (kişisel veri KOYMAYIN)
 */
export function captureError(
  where: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  if (!enabled) {
    if (__DEV__) console.warn(`[${where}]`, error);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("where", where);
    if (extra) scope.setContext("detay", extra);
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
}

/** Hata olmayan ama bilinmesi gereken durumlar */
export function captureMessage(message: string, extra?: Record<string, unknown>): void {
  if (!enabled) return;

  Sentry.withScope((scope) => {
    if (extra) scope.setContext("detay", extra);
    Sentry.captureMessage(message, "warning");
  });
}

/**
 * Cihaz kimliğini ilişkilendirir — analytics'teki `device_id` ile aynı.
 * Böylece bir çökme kaydından o cihazın olay geçmişine bakılabilir.
 * Kişisel veri değil, istemcide üretilen rastgele bir dize.
 */
export function setErrorUser(deviceId: string): void {
  if (!enabled) return;
  Sentry.setUser({ id: deviceId });
}

/** Kullanıcının hangi ekranda olduğunu iz olarak bırakır */
export function trackScreen(pathname: string): void {
  if (!enabled) return;
  Sentry.addBreadcrumb({ category: "navigation", message: pathname, level: "info" });
}
