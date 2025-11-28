import { ChatRole } from "../types/ChatRole";

export type ChatMessage = {
    role: ChatRole;
    content: string;
}