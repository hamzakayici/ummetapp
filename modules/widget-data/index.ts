import { requireNativeModule } from "expo-modules-core";

interface WidgetDataInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  reloadWidgets(): Promise<void>;
}

const WidgetData: WidgetDataInterface = requireNativeModule("WidgetData");

export default WidgetData;
