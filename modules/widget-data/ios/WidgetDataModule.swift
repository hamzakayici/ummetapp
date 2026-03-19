import ExpoModulesCore
import WidgetKit

public class WidgetDataModule: Module {

    public func definition() -> ModuleDefinition {
        Name("WidgetData")

        AsyncFunction("setItem") { (key: String, value: String) in
            UserDefaults.standard.set(value, forKey: key)
            UserDefaults.standard.synchronize()
        }

        AsyncFunction("getItem") { (key: String) -> String? in
            return UserDefaults.standard.string(forKey: key)
        }

        AsyncFunction("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetKit.WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
