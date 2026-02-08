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
import { ILogerService } from "./Domain/services/ILoggerService";
import { LogerService } from "./Services/LoggerService";
import cors from "cors";

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
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*",
      methods: process.env.CORS_METHODS?.split(",") ?? ["GET"],
      credentials: true
    })
  );

  const loger: ILogerService = new LogerService();



  app.get("/health", async (req, res) => {
    try {
      // Provera baze: 
      await Db.query("SELECT 1");

      res.status(200).json({
        status: "OK",
        service: "SecurityMaturityService",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (err) {
      // Ako baza padne, ceo status je DOWN sa kodom 503
      res.status(503).json({
        status: "DOWN",
        service: "SecurityMaturityService",
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    // 1) Database initialization
    const dbOk = await initialize_database(loger);
    if (!dbOk) {
      loger.log("[App] DB initialization returned false. Starting DEGRADED mode.");
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
      new KpiRepositoryService(kpiRepo, categoryRepo, loger);

    const kpiAggregationService: IKpiAggregationService =
      new KpiAggregationService();

    const securityMaturityService: ISecurityMaturityService =
      new SecurityMaturityService();

    const kpiSnapshotService: IKpiSnapshotService = new KpiSnapshotService(
      kpiRepositoryService,
      securityMaturityService,
      loger,
    );

    const recommendationRepositoryService: IRecommendationRepositoryService =
      new RecommendationRepositoryService(recommendationSnapshotRepo, recommendationRepo, loger);

    const analysisEngineClient = new AnalysisEngineClient(process.env.ANALYSIS_ENGINE_API ?? "", loger);



    // 4) Scheduler start
    try {
      const job = new CalculateHourlyKpiSnapshotJob(kpiSnapshotService);
      
      /*job.execute().catch(err =>
        loger.log("[Startup KPI Job] Failed: " + err)
      );*/

      const scheduler = new HourlyAlignedScheduler(job, loger);
      scheduler.start();
      loger.log("[App] Scheduler started");
    } catch (err) {
      loger.log("[App] Failed to start scheduler: " + err);
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
      recommendationContextService,
      loger
    );



    const securityMaturityController = new SecurityMaturityController(
      kpiSnapshotQuery,
      kpiSnapshotService,
      recommendationService,
      loger
    );

    app.use("/api/v1", securityMaturityController.getRouter());

    loger.log("[App] Application started in FULL mode");
    return app;
  } catch (err) {
    loger.log("[App] Failed to initialize application: " + err);
    attachDegradedRoutes(app);
    loger.log("[App] Application started in DEGRADED mode");
    return app;
  }
}
