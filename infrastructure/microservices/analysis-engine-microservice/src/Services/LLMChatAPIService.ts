import axios from "axios";
import { ILLMChatAPIService } from "../Domain/Services/ILLMChatAPIService";
import { ChatMessage } from "../Domain/types/ChatMessage";

export class LLMChatAPIService implements ILLMChatAPIService {

    private readonly apiUrl: string;
    private readonly gemmaModelId: string;
    private readonly deepseekModelId: string;

    constructor() {
        this.apiUrl = process.env.LLM_API_URL ?? "";
        this.gemmaModelId = process.env.GEMMA_MODEL_ID ?? "";
        this.deepseekModelId = process.env.DEEPSEEK_MODEL_ID ?? "";

        if (!this.apiUrl) throw new Error("LLM_API_URL not configured");
        if (!this.gemmaModelId) throw new Error("GEMMA_MODEL_ID not configured");
        if (!this.deepseekModelId) throw new Error("DEEPSEEK_MODEL_ID not configured");
    }

    async sendNormalizationPrompt(rawMessage: string): Promise<string | JSON> {
        const messages: ChatMessage[] = [
            {
                role: "system",
                content: `
                You are a deterministic SIEM normalization engine.

                RULES:
                - Output ONLY a JSON object matching:
                  {"type":"INFO"|"ERROR"|"WARNING","description":string}
                - No explanations.
                - No commentary.
                - Absolutely no <think>.
                `
            },
            {
                role: "user",
                content: `Normalize this raw log:\n${rawMessage}`
            }
        ];

        return this.sendChatCompletion(this.gemmaModelId, messages, 0.0);
    }

    async sendCorrelationPrompt(rawMessage: string): Promise<string | JSON> {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: `
                You are a deterministic SIEM Correlation Engine.

                Your job is to analyze a list of security events and determine if a correlation exists.

                ### OUTPUT FORMAT (STRICT)
                Return ONLY a JSON object with EXACTLY the following fields:

                {
                "correlation_detected": boolean,
                "confidence": number,
                "description": string,
                "severity": "LOW" | "MEDIUM" | "HIGH",
                "related_event_ids": number[]
                }

                ### RULES
                - Output ONLY raw JSON.
                - NO markdown.
                - NO <think>.
                - NO explanation text outside the JSON.
                - Deterministic: same input must always produce the same output.
                - "confidence" must be a number between 0 and 1.
                - "related_event_ids" must contain ONLY event_id numbers that directly participate in the correlation.
                - Use ONLY the provided event list — do not invent data.

                ### CORRELATION CATEGORIES TO CHECK
                You may detect correlations such as:
                - privilege_escalation chains
                - brute_force → auth_success sequence
                - ransomware (multiple file_encrypt / crypto events)
                - lateral_movement sequences
                - cloud_login anomalies
                - multi_stage_attack (multiple categories in sequence)

                ONLY mark correlation_detected=true if the evidence is strong.
            `
        },
        {
            role: "user",
            content: `Analyze the following events:\n${rawMessage}`
        }
    ];

    return this.sendChatCompletion(this.deepseekModelId, messages, 0.0);
}


    private async sendChatCompletion(
        modelId: string,
        messages: ChatMessage[],
        temperature: number
    ): Promise<string | JSON> {
        try {
            const res = await axios.post(
                this.apiUrl,
                {
                    model: modelId,
                    messages,
                    temperature
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer lm-studio"
                    }
                }
            );

            let responseText =
                res.data?.choices?.[0]?.message?.content ??
                "No response from the model.";

            // Remove DeepSeek R1 <think> 
            let cleaned = responseText
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/```(?:json)?/gi, "")
                .replace(/```/g, "")
                .trim();

            
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleaned = jsonMatch[0];

            try {
                return JSON.parse(cleaned);
            } catch {
                return cleaned; 
            }

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const apiMsg =
                    error.response?.data?.error?.message ??
                    error.response?.data?.message;
                throw new Error(`LLM error: ${apiMsg ?? error.message}`);
            }
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
}
