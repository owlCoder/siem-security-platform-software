import { AlertCategory } from "../../Domain/enums/AlertCategory";

export function parseAlertCategory(raw: string): AlertCategory {
  if ((Object.values(AlertCategory) as string[]).includes(raw)) {
    return raw as AlertCategory;
  }

  return AlertCategory.OTHER;
}
