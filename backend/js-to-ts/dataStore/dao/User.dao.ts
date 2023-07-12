import { User } from "../types";

export interface UserDao {
  createUser(user: User): Promise<User | undefined>;
  getUserById(userId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
}