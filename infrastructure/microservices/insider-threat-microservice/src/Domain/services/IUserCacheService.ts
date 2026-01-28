import { UserCache } from "../models/UserCache";

export interface IUserCacheService {

  getUserByUserId(userId: string): Promise<UserCache | null>;

  createOrUpdateUser(userId: string, username: string, role: number): Promise<UserCache>;

  getUserByUsername(username: string): Promise<UserCache | null>;

  getAllPrivilegedUsers(): Promise<UserCache[]>;

  deleteUser(userId: string): Promise<boolean>;
}