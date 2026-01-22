import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ParserEventDTO } from "../../models/parser/ParserEventDTO";
import { IParserAPI } from "./IParserAPI";

export class ParserAPI implements IParserAPI {
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_FIREWALL_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async getParserEventById(id: number, token: string): Promise<ParserEventDTO> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: `parserEvents/${id}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.response;  // Response of firewall includes response of gateway
    }
}