import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ParserEventDTO } from "../../models/parser/ParserEventDTO";
import { IParserAPI } from "./IParserAPI";

export class ParserAPI implements IParserAPI {
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_GATEWAY_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async getParserEventById(id: number, token: string): Promise<ParserEventDTO> {
        const response: AxiosResponse<ParserEventDTO> = await this.axiosInstance.get(`/parserEvents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
}