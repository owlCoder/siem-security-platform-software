import { ValidationResult } from "../../Domain/types/ValidationResult";

export function validateEventId(id: number): ValidationResult {
  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "Event id is not in valid format!" };
  }
  return { success: true };
}