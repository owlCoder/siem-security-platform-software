import { IGatewayService } from "../../Domain/services/IGatewayService";
import { GatewayService } from "./GatewayService";
import { AuthGatewayService } from "../domains/AuthGatewayService";
import { AlertGatewayService } from "../domains/AlertGatewayService";
import { QueryGatewayService } from "../domains/QueryGatewayService";
import { StorageGatewayService } from "../domains/StorageGatewayService";
import { ParserGatewayService } from "../domains/ParserGatewayService";
import { AnalysisGatewayService } from "../domains/AnalysisGatewayService";
import { EventCollectorGatewayService } from "../domains/EventCollectorGatewayService";

/**
 * Factory for creating GatewayService instances with all dependencies.
 * Centralizes object creation and dependency wiring.
 */
export class GatewayServiceFactory {
  static create(): IGatewayService {
    return new GatewayService(
      new AuthGatewayService(),
      new AlertGatewayService(),
      new QueryGatewayService(),
      new StorageGatewayService(),
      new ParserGatewayService(),
      new AnalysisGatewayService(),
      new EventCollectorGatewayService()
    );
  }
}