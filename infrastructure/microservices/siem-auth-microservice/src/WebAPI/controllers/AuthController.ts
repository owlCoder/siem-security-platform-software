import { Router, Request, Response } from "express";
import { ValidationService } from "../../Services/ValidationService";

export class AuthController {
    private readonly router: Router;

    constructor(private readonly validationService: ValidationService){
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void{
        this.router.post('/validate', this.validateToken.bind(this));
    }

    private async validateToken(req: Request, res: Response): Promise<void> {
        try{
            const token = req.body.token as string;

            if(!token){
                res.status(400).json({
                    success: false,
                    message: 'Token is required',
                });

                return;
            }

            const result = await this.validationService.verifyToken(token);

            if(!result.valid){
                res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });

                return;
            }

            res.status(200).json({
                success: true,
                valid: true,
                isSysAdmin: result.isSysAdmin,
                user: result.payload,
            });
        } catch(err) {
            res.status(500).json({
                success: false,
                message: (err as Error).message,
            });
        }
    }

    public getRouter(): Router{
        return this.router;
    }
}