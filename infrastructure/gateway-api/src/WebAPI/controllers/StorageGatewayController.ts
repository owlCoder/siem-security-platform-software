import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";

export class StorageGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService, private readonly authenticate: any) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/storageLog", this.authenticate, this.getAllArchives.bind(this));
    this.router.get("/storageLog/search", this.authenticate, this.searchArchives.bind(this));
    this.router.get("/storageLog/sort", this.authenticate, this.sortArchives.bind(this));
    this.router.get("/storageLog/stats", this.authenticate, this.getArchiveStats.bind(this));
    this.router.get("/storageLog/file/:id", this.authenticate, this.downloadArchive.bind(this));
    this.router.post("/storageLog/run", this.authenticate, this.runArchiveProcess.bind(this));
    this.router.get("/storageLog/top", this.authenticate, this.getTopArchives.bind(this));
    this.router.get("/storageLog/volume", this.authenticate, this.getArchiveVolume.bind(this));
    this.router.get("/storageLog/largest",  this.getLargestArchive.bind(this));
  }

  private async getAllArchives(req: Request, res: Response) {
    try {
      const archives = await this.gatewayService.getAllArchives();
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async searchArchives(req: Request, res: Response) {
    try {
      const archives = await this.gatewayService.searchArchives(req.query.q as string);
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async sortArchives(req: Request, res: Response) {
    try {
      const { by, order } = req.query;
      const archives = await this.gatewayService.sortArchives(by as any, order as any);
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getArchiveStats(req: Request, res: Response) {
    try {
      const stats = await this.gatewayService.getArchiveStats();
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async runArchiveProcess(req: Request, res: Response) {
    try {
      const result = await this.gatewayService.runArchiveProcess();
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async downloadArchive(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const fileBuffer = await this.gatewayService.downloadArchive(id);

      res.setHeader("Content-Type", "application/x-tar");
      res.setHeader("Content-Disposition", `attachment; filename="archive_${id}.tar"`);

      res.status(200).send(fileBuffer);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getTopArchives(req: Request, res: Response) {
    try {
      const type = req.query.type as "events" | "alerts";
      const limit = Number(req.query.limit) || 5;
      const result = await this.gatewayService.getTopArchives(type, limit);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getArchiveVolume(req: Request, res: Response) {
    try {
      const period = req.query.period as "daily" | "monthly" | "yearly";
      const result = await this.gatewayService.getArchiveVolume(period);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getLargestArchive(req: Request, res: Response) {
    try {
      const result = await this.gatewayService.getLargestArchive();

      if (!result) {
        res.status(404).json({ message: "No archives found" });
        return;
      }

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
