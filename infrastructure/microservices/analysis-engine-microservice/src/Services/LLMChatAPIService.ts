import axios from "axios";
import dotenv from "dotenv";
import { ILLMChatAPIService } from "../Domain/Services/ILLMChatAPIService";
import { ChatMessage } from "../Domain/types/ChatMessage";

dotenv.config();
const API_URL = process.env.API_URL!;
const MODEL_ID = process.env.MODEL_ID!;

export class LLMChatAPIService implements ILLMChatAPIService {

    constructor() {
        if (!API_URL || !MODEL_ID) {
            throw new Error("API_URL or MODEL_ID not defined in environment variables");
        }
    }

    async sendPromptToLLM(rawMessage: string): Promise<string | JSON> {
        try {

            const llmPromptSystem: ChatMessage = {
                role: "system",
                content: `You are an analyzer that transforms raw logs into Event JSON objects.
                        Instructions:
                        1. Output a single JSON object matching the Event entity:
                        {
                            "type": "INFO" | "ERROR" | "WARNING",
                            "description": string
                        }
                        2. Ensure 'type' matches one of the EventType enum values.
                        3. 'timestamp' must be a valid ISO 8601 string.
                        4. 'description' should summarize the content concisely.
                        5. Output only the JSON, no explanations or extra text.`
            };

            const llmPromptUser: ChatMessage = {
                role: "user",
                content: `TASK: Create an Event JSON\nInput: ${rawMessage}`
            };

            const messages: ChatMessage[] = [llmPromptSystem, llmPromptUser];

            const res = await axios.post(
                API_URL,
                {
                    model: MODEL_ID,
                    messages,
                    temperature: 0.1,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer lm-studio",
                    },
                }
            );

            const responseText = res.data?.choices?.[0]?.message?.content ?? "No response from the model.";

            // Remove markdown ```json blocks if present
            const cleaned = responseText.replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();

            // Parse JSON
            const processedEventJson = JSON.parse(cleaned);

            return processedEventJson;

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.error?.message ?? error.response?.data?.message;
                throw new Error(`LLM error: ${apiMsg ?? error.message}`);
            }
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
}
