import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DBConnectionPool";
import { KpiSnapshot } from "./Domain/models/KpiSnapshot";
import { KpiSnapshotCategoryCount } from "./Domain/models/KpiSnapshotCategoryCount";
import { RecommendationEntity } from "./Domain/models/RecommendationEntity";
import { RecommendationSnapshot as RecommendationSnapshotEntity } from "./Domain/models/RecommendationSnapshot";
import { IKpiRepositoryService } from "./Domain/services/IKpiRepositoryService";
import { IKpiAggregationService } from "./Domain/services/IKpiAggregationService";
import { IKpiSnapshotService } from "./Domain/services/IKpiSnapshotService";
import { ISecurityMaturityService } from "./Domain/services/ISecurityMaturityService";
import { IRecommendationRepositoryService } from "./Domain/services/IRecommendationRepositoryService";
import { IRecommendationService } from "./Domain/services/IRecommendationService";
import { KpiRepositoryService } from "./Services/KpiRepositoryService";
import { KpiAggregationService } from "./Services/KpiAggregationService";
import { SecurityMaturityService } from "./Services/SecurityMaturityService";
import { KpiSnapshotService } from "./Services/KpiSnapshotService";
import { RecommendationRepositoryService } from "./Services/RecommendationRepositoryService";
import { RecommendationService } from "./Services/RecommendationService";
import { KpiSnapshotQuery } from "./Application/queries/KpiSnapshotQuery";
import { SecurityMaturityController } from "./WebAPI/controllers/SecurityMaturityController";
import { CalculateHourlyKpiSnapshotJob } from "./Application/jobs/CalculateHourlyKpiSnapshotJob";
import { HourlyAlignedScheduler } from "./Infrastructure/schedulers/HourlyAlignedScheduler";
import { AnalysisEngineClient } from "./Infrastructure/clients/AnalysisEngineClient";
import { RecommendationContextService } from "./Services/RecommendationContextService";
import { IRecommendationContextService } from "./Domain/services/IRecommendaitonContextService";
import { RecommendationContextQuery } from "./Application/queries/RecommendationContextQuery";

dotenv.config();

function attachDegradedRoutes(app: Express): void {
  app.use("/api/v1", (_: Request, res: Response) => {
    res.status(503).json({
      status: "DEGRADED",
      message: "API unavailable - initialization failed",
    });
  });
}

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  // TODO: add CORS setup

  try {
    // 1) Database initialization
    const dbOk = await initialize_database();
    if (!dbOk) {
      console.error("[App] DB initialization returned false. Starting DEGRADED mode.");
      attachDegradedRoutes(app);
      return app;
    }

    // 2) Repositories
    const kpiRepo: Repository<KpiSnapshot> = Db.getRepository(KpiSnapshot);
    const categoryRepo: Repository<KpiSnapshotCategoryCount> =
      Db.getRepository(KpiSnapshotCategoryCount);

    const recommendationRepo: Repository<RecommendationEntity> =
      Db.getRepository(RecommendationEntity);
    const recommendationSnapshotRepo: Repository<RecommendationSnapshotEntity> =
      Db.getRepository(RecommendationSnapshotEntity);

    // 3) Services (DI)
    const kpiRepositoryService: IKpiRepositoryService =
      new KpiRepositoryService(kpiRepo, categoryRepo);

    const kpiAggregationService: IKpiAggregationService =
      new KpiAggregationService();

    const securityMaturityService: ISecurityMaturityService =
      new SecurityMaturityService();

    const kpiSnapshotService: IKpiSnapshotService = new KpiSnapshotService(
      kpiRepositoryService,
      securityMaturityService
    );

    const recommendationRepositoryService: IRecommendationRepositoryService =
      new RecommendationRepositoryService(recommendationSnapshotRepo, recommendationRepo);

    const analysisEngineClient = new AnalysisEngineClient(process.env.ANALYSIS_ENGINE_API ?? "");



    // 4) Scheduler start
    try {
      const job = new CalculateHourlyKpiSnapshotJob(kpiSnapshotService);
      const scheduler = new HourlyAlignedScheduler(job);
      scheduler.start();
      console.log("[App] Scheduler started");
    } catch (err) {
      console.error("[App] Failed to start scheduler", err);
    }

    // 5) Queries + Controllers
    const kpiSnapshotQuery = new KpiSnapshotQuery(
      kpiRepositoryService,
      kpiAggregationService
    );

    const recommendationContextQuery = new RecommendationContextQuery(
      kpiRepositoryService,
      kpiAggregationService
    );

    const recommendationContextService: IRecommendationContextService =
      new RecommendationContextService(recommendationContextQuery);

    const recommendationService: IRecommendationService = new RecommendationService(
      recommendationRepositoryService,
      analysisEngineClient,
      recommendationContextService
    );



    const securityMaturityController = new SecurityMaturityController(
      kpiSnapshotQuery,
      kpiSnapshotService,
      recommendationService
    );

    app.use("/api/v1", securityMaturityController.getRouter());

    console.log("[App] Application started in FULL mode");
    return app;
  } catch (err) {
    console.error("[App] Failed to initialize application", err);
    attachDegradedRoutes(app);
    console.warn("[App] Application started in DEGRADED mode");
    return app;
  }
}
