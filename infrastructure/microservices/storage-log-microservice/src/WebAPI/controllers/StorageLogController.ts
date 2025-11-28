import { Router, Request, Response } from "express";
import { IStorageLogService } from "../../Domain/services/IStorageLogService";

export class StorageLogController{
    private readonly router: Router;

    constructor(
        private readonly storageLogService: IStorageLogService
    ){
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/storageLog", this.getAllArchives.bind(this));
        this.router.post("/storageLog/run", this.runArchiveProcess.bind(this));
    }

    private async getAllArchives(req: Request, res: Response): Promise<void>{
        try{
            await this.storageLogService.getArchives();
            res.status(201).json({success: true});
        } catch (err){
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async runArchiveProcess(req: Request, res: Response): Promise<void>{
        try{
            const response = this.storageLogService.runArchiveProcess();
            res.status(201).json(response);
        } catch (err){
            res.status(500).json({ message: (err as Error).message });
        }
    }

       public getRouter(): Router {
        return this.router;
    }
}