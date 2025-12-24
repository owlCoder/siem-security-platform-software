import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { EventDTO } from "../../Domain/DTOs/EventDTO";


export class EventCollectorGatewayController{
    private readonly router: Router;
    
      constructor(private readonly gatewayService: IGatewayService, 
                  private readonly authenticate: any,
                  private readonly loggerService:ILogerService) {
        this.router = Router();
        this.initializeRoutes();
      }

       private initializeRoutes(): void {
          this.router.get(
            "/siem/events",
            this.authenticate,
            requireSysAdmin,
            this.getAllEvents.bind(this)
        );
        this.router.get(
           "/siem/events/topSource",
          //  this.authenticate, TODO WHEN IMPLEMENT AUTHENTICATE WITH TOKEN
          //  requireSysAdmin,
           this.getTopSourceEvent.bind(this)
        );

           this.router.get(
            "/siem/events/sortedEventsByDate",
            this.authenticate,
            requireSysAdmin,
            this.getSortedEventsByDate.bind(this)
          );

          this.router.get(
            "/siem/events/percentages",
            this.authenticate,
            requireSysAdmin,
            this.getEventPercentagesByEvent.bind(this)
          );

          this.router.get(
            "/siem/events/:id",
            this.authenticate,
            requireSysAdmin,
            this.getEventById.bind(this)
          );

          this.router.get(
            "/siem/events/from/:fromId/to/:toId",
            this.authenticate,
            requireSysAdmin,
            this.getEventsFromId1ToId2.bind(this)
          );

          this.router.get(
            "/siem/events",
            this.authenticate,
            requireSysAdmin,
            this.createEvent.bind(this)
          );

          this.router.delete(
            "/siem/events/:id",
            this.authenticate,
            requireSysAdmin,
            this.deleteEvent.bind(this)
          );

        }


            private async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const dto = req.body as EventDTO;

            const created = await this.gatewayService.createEvent(dto);
            res.status(201).json(created);
        } catch (err) {
            const message = (err as Error).message;
            
            res.status(500).json({ message });
        }
    }

    private async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.gatewayService.getAll();
            res.status(200).json(events);
        } catch (err) {
            const message = (err as Error).message;
           
            res.status(500).json({ message });
        }
    }

    private async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

           

            const event = await this.gatewayService.getById(id);
           
                res.status(200).json(event);
           
        } catch (err) {
            res.status(404).json({ message: (err as Error).message });
        }
    }

    private async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

           

            const deleted = await this.gatewayService.deleteById(id);
            if (!deleted) {
                res.status(404).json({ message: `Event with id=${id} not found` });
                return;
            }

            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    

    private async getMaxId(req: Request, res: Response): Promise<void> {
        try {
            //const created = await this.gatewayService.getMaxId();
            
                res.status(404).json({ message: "Event with this ID not found" })
            
        }
        catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message });
        }
    }

    private async getEventsFromId1ToId2(req: Request, res: Response): Promise<void> {
        try {
            const fromId = Number(req.params.fromId);
            const toId = Number(req.params.toId);

            
            const events = await this.gatewayService.getEventsFromId1ToId2(fromId, toId)
            res.status(200).json(events);

        }
        catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message });
        }
    }

    private async getSortedEventsByDate(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.gatewayService.getSortedEventsByDate();
            res.status(200).json(events);
        } catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message });
        }
    }

    private async getEventPercentagesByEvent(req: Request, res: Response): Promise<void> {
        try {
            const percentages = await this.gatewayService.getEventPercentagesByEvent()
            res.status(200).json(percentages)
        }
        catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message });
        }
    }

    private async getTopSourceEvent(req: Request, res: Response): Promise<void>{
        try {
            const result = await this.gatewayService.getTopSourceEvent()
            res.status(200).json(result)
        }
        catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message });
        }
    }
    public getRouter(): Router {
        return this.router;
    }
}