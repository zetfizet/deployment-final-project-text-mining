import axios from "axios";
import {
  AnalyzeResponse,
  BatchAnalyzeResponse,
  ModelInfoResponse,
  PerformanceResponse,
} from "./types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Intercept untuk logging error
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Terjadi kesalahan pada server.";
    return Promise.reject(new Error(typeof msg === "string" ? msg : JSON.stringify(msg)));
  }
);

export const analyzeText = async (text: string): Promise<AnalyzeResponse> => {
  const { data } = await API.post<AnalyzeResponse>("/api/analyze", { text });
  return data;
};

export const analyzeBatch = async (
  texts: string[]
): Promise<BatchAnalyzeResponse> => {
  const { data } = await API.post<BatchAnalyzeResponse>("/api/analyze/batch", {
    texts,
  });
  return data;
};

export const getModelInfo = async (): Promise<ModelInfoResponse> => {
  const { data } = await API.get<ModelInfoResponse>("/api/model-info");
  return data;
};

export const getPerformance = async (): Promise<PerformanceResponse> => {
  const { data } = await API.get<PerformanceResponse>("/api/performance");
  return data;
};

export default API;
