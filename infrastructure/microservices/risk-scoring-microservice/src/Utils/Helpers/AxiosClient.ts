import axios, { AxiosInstance } from "axios";

export function createAxiosClient(baseUrl: string, timeout = 5000): AxiosInstance {
    return axios.create({
        baseURL: baseUrl,
        headers: { "Content-Type": "application/json" },
        timeout,
    });
}