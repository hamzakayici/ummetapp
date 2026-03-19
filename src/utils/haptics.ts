import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../stores/appStore";

/**
 * Haptic geri bildirimini merkezi olarak yöneten yardımcı fonksiyonlar.
 * Ayarlardan haptic kapatılmışsa hiçbir titreşim yapmaz.
 */

export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

export function hapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
) {
  const { hapticEnabled } = useSettingsStore.getState();
  if (!hapticEnabled) return;
  Haptics.impactAsync(style);
}

export function hapticNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
) {
  const { hapticEnabled } = useSettingsStore.getState();
  if (!hapticEnabled) return;
  Haptics.notificationAsync(type);
}

export function hapticSelection() {
  const { hapticEnabled } = useSettingsStore.getState();
  if (!hapticEnabled) return;
  Haptics.selectionAsync();
}

// Eski isimlendirme ile uyumluluk
export const triggerHaptic = hapticImpact;
export const triggerHapticNotification = hapticNotification;
