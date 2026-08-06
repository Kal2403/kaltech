import axios from "axios";
import { notifySessionCleared, storage } from "../utils/storage";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = storage.getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            const hadToken = Boolean(storage.getToken());
            storage.removeToken();
            if (hadToken) notifySessionCleared();
        }

        return Promise.reject(error);
    }
);
