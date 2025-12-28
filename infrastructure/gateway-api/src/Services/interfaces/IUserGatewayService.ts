import { UserDTO } from "../../Domain/DTOs/UserDTO";

export interface IUserGatewayService {
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
}