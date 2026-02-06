import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { BusinessLLMInputDto } from "../../Domain/DTOs/businessInsights/BusinessLLMInputDto";

export class AnalysisGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService,
              private readonly loggerService:ILogerService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/analysis-engine/generateBusinessInsights", this.analysisEngineGenerateBusinessInsights.bind(this));
  }

  private async analysisEngineGenerateBusinessInsights(req:Request, res: Response): Promise<void> {
    try{
      const businessLLMInput = req.body as BusinessLLMInputDto;
      const result = await this.gatewayService.analysisEngineGenerateBusinessInsights(businessLLMInput);

      res.status(200).json(result);
    }catch(err){
      this.loggerService.error(`[AnalysisEngineError] ${err}`);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
