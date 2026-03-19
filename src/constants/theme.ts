export const Colors = {
  primary: {
    DEFAULT: "#1B4332",
    light: "#2D6A4F",
    dark: "#143325",
  },
  accent: {
    DEFAULT: "#D4AF37",
    light: "#F0D060",
    dark: "#B8941E",
  },
  bg: {
    DEFAULT: "#0A0F14",
    surface: "#121A24",
    elevated: "#1A2332",
    card: "#162029",
  },
  text: {
    primary: "#ECDFCC",
    secondary: "#8A9BA8",
    muted: "#5A6B78",
    accent: "#D4AF37",
  },
  success: "#40C057",
  warning: "#FFB300",
  error: "#E53935",
} as const;

export const Fonts = {
  amiri: "Amiri_400Regular",
  amiriBold: "Amiri_700Bold",
  amiriItalic: "Amiri_400Regular_Italic",
  reem: "ReemKufi_400Regular",
  reemMedium: "ReemKufi_500Medium",
  reemSemiBold: "ReemKufi_600SemiBold",
  reemBold: "ReemKufi_700Bold",
  inter: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
