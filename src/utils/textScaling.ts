import { Text, TextInput } from "react-native";

/**
 * Yazı ölçeklemesine üst sınır koyar.
 *
 * ⚠️ SORUN NEYDİ
 * React Native'de `allowFontScaling` varsayılan olarak AÇIK — yani metin sistem
 * yazı boyutu ayarını zaten takip ediyordu. Ama **sınırsız** takip ediyordu.
 *
 * iOS'un erişilebilirlik boyutlarında çarpan 3,12'ye kadar çıkıyor:
 *   58px tesbih sayacı → 181px
 *   12px etiket        → 37px
 *
 * Uygulamada 56 adet sabit yükseklikli kap var (ikon kutuları, gün hücreleri,
 * sekme çubuğu). Bu çarpanlarda metin kaplarından taşıyor, üst üste biniyor ve
 * uygulama **erişilebilirliğe en çok ihtiyaç duyan kullanıcıda** kullanılamaz
 * hale geliyordu. Yani özellik "yok" değil, "kontrolsüz" olduğu için zararlıydı.
 *
 * ⚠️ NEDEN defaultProps DEĞİL
 * React 19'da forwardRef bileşenlerinde `defaultProps` yok sayılıyor. RN'in Text
 * bileşeni forwardRef ile üretildiği için `render` fonksiyonunu sarmalıyoruz —
 * bu, sürümden bağımsız çalışan tek güvenilir yöntem.
 *
 * Çağrı yeri: app/_layout.tsx, uygulamanın en başında (bileşenler render
 * edilmeden önce).
 */

/**
 * Gövde metni için üst sınır.
 * 1,5 = iOS'un erişilebilirlik dışı en büyük ayarını (xxxLarge, 1,35) tamamen
 * karşılar, üstüne biraz pay bırakır. Erişilebilirlik boyutlarında kullanıcı
 * istediğinin tamamını alamaz ama arayüz ayakta kalır.
 */
const MAX_SCALE = 1.5;

/**
 * Büyük görsel sayılar için daha dar sınır (tesbih sayacı, vakit geri sayımı).
 * Bunlar zaten 48-58px; 1,5x'te ekrana sığmıyorlar ve büyütülmelerine de
 * gerek yok — okunaklılık sorunu yaşayan öğeler bunlar değil.
 */
const MAX_SCALE_DISPLAY = 1.2;

/** Bu boyutun üstündeki metin "görsel sayı" sayılır */
const DISPLAY_SIZE_THRESHOLD = 32;

type Renderable = { render?: (...args: unknown[]) => unknown };

function flattenFontSize(style: unknown): number | undefined {
  if (!style) return undefined;

  if (Array.isArray(style)) {
    for (let i = style.length - 1; i >= 0; i--) {
      const found = flattenFontSize(style[i]);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  if (typeof style === "object" && "fontSize" in (style as Record<string, unknown>)) {
    const size = (style as { fontSize?: unknown }).fontSize;
    return typeof size === "number" ? size : undefined;
  }

  return undefined;
}

let applied = false;

export function applyTextScalingLimits(): void {
  if (applied) return;
  applied = true;

  for (const Component of [Text, TextInput] as unknown as Renderable[]) {
    const original = Component.render;
    if (typeof original !== "function") continue;

    Component.render = function patchedRender(this: unknown, ...args: unknown[]) {
      const props = args[0] as Record<string, unknown> | undefined;

      // Bileşen kendi sınırını belirtmişse ona dokunma
      if (props && props.maxFontSizeMultiplier === undefined) {
        const fontSize = flattenFontSize(props.style);
        const limit =
          fontSize !== undefined && fontSize >= DISPLAY_SIZE_THRESHOLD
            ? MAX_SCALE_DISPLAY
            : MAX_SCALE;

        args[0] = { ...props, maxFontSizeMultiplier: limit };
      }

      return original.apply(this, args);
    };
  }
}
