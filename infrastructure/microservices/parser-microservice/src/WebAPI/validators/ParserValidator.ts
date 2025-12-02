import { ValidationResult } from "../../Domain/types/ValidationResult";

export function ValidateInputParameters(message: string, source: string): ValidationResult {
    if (!message || typeof message !== "string")
        return { success: false, message: "Invalid input: 'message' must be a non-empty string!" };

    if (!source)
        return { success: false, message: "Invalid input: 'source' must be a non-empty string!" };

    if (message.length > 10000)
        return { success: false, message: "Message exceeds maximum allowed size (10k chars)!" };


    return { success: true };
}