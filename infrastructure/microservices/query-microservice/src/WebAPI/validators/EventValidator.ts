import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { EventType } from "../../Domain/enums/EventType";

export function validateEventData(
  data: EventDTO,
): { success: boolean; message?: string } {
  if (!data.source || data.source.trim().length === 0) {
    return { success: false, message: "Source is required" };
  }

  if (data.source.length > 255) {
    return { success: false, message: "Source must be <= 255 characters" };
  }

  if (!data.type || !Object.values(EventType).includes(data.type)) {
    return { success: false, message: "Invalid event type" };
  }

  if (!data.description || data.description.trim().length === 0) {
    return { success: false, message: "Description is required" };
  }

  if (data.description.length > 255) {
    return {
      success: false,
      message: "Description must be <= 255 characters",
    };
  }

  if (data.timestamp !== undefined) {
    const ts = new Date(data.timestamp);
    if (Number.isNaN(ts.getTime())) {
      return { success: false, message: "Invalid timestamp format" };
    }
  }

  return { success: true };
}