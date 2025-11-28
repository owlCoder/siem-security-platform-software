export interface ILLMChatAPIService {
  sendPromptToLLM(rawMessage: string): Promise<string | JSON>;
}