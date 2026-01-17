import { ValidationResult } from "../../Domain/types/ValidationResult";
import { CreateInsiderThreatDTO } from "../../Domain/DTOs/CreateInsiderThreatDTO";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

export function validateThreatId(id: number): ValidationResult {
  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "Threat ID must be a positive integer!" };
  }
  return { success: true };
}

export function validateUserId(userId: string): ValidationResult {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return { success: false, message: "Invalid userId: must be a non-empty string!" };
  }
  return { success: true };
}

export function validateCreateInsiderThreatDTO(data: CreateInsiderThreatDTO): ValidationResult {
  if (!data.userId || typeof data.userId !== "string" || data.userId.trim().length === 0) {
    return { success: false, message: "Invalid input: 'userId' must be a non-empty string!" };
  }

  if (!data.username || typeof data.username !== "string" || data.username.trim().length === 0) {
    return { success: false, message: "Invalid input: 'username' must be a non-empty string!" };
  }

  if (!data.threatType || !Object.values(ThreatType).includes(data.threatType)) {
    return { success: false, message: "Invalid threat type!" };
  }

  if (!data.riskLevel || !Object.values(RiskLevel).includes(data.riskLevel)) {
    return { success: false, message: "Invalid risk level!" };
  }

  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    return { success: false, message: "Invalid input: 'description' must be a non-empty string!" };
  }

  if (!Array.isArray(data.correlatedEventIds)) {
    return { success: false, message: "Invalid input: 'correlatedEventIds' must be an array!" };
  }

  if (!data.source || typeof data.source !== "string" || data.source.trim().length === 0) {
    return { success: false, message: "Invalid input: 'source' must be a non-empty string!" };
  }

  return { success: true };
}

export function validateThreatType(type: string): ValidationResult {
  if (!type || !Object.values(ThreatType).includes(type as ThreatType)) {
    return { success: false, message: "Invalid threat type value!" };
  }
  return { success: true };
}

export function validateRiskLevel(level: string): ValidationResult {
  if (!level || !Object.values(RiskLevel).includes(level as RiskLevel)) {
    return { success: false, message: "Invalid risk level value!" };
  }
  return { success: true };
}