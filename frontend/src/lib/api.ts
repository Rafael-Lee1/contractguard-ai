import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export type Severity = "low" | "medium" | "high" | "critical";

export interface ClauseInsight {
  category: string;
  title: string;
  severity: Severity;
  explanation: string;
  risk_reason?: string;
  excerpt: string;
  recommendation: string;
}

export interface MissingClauseInsight {
  title: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
}

export interface UploadContractResponse {
  id: string;
  filename: string;
  uploaded_at: string;
  text_length: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  contract_id: string;
  created_at: string;
  summary: string;
  risk_score: number;
  risk_clauses: ClauseInsight[];
  important_clauses: ClauseInsight[];
  missing_clauses: MissingClauseInsight[];
  penalties: ClauseInsight[];
  unilateral_obligations: ClauseInsight[];
}

export interface ContractResponse {
  id: string;
  filename: string;
  text_content: string;
  uploaded_at: string;
  latest_analysis: AnalysisResponse | null;
}

export interface ApiError {
  message: string;
  status?: number;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000,
});

export function getApiError(error: unknown, fallback: string): ApiError {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return { message: detail, status: error.response?.status };
    }

    if (Array.isArray(detail)) {
      return {
        message: detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join(" ") || fallback,
        status: error.response?.status,
      };
    }

    return {
      message: error.message || fallback,
      status: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: fallback };
}

export async function uploadContract(file: File): Promise<UploadContractResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post<UploadContractResponse>("/contracts/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Failed to upload contract.");
  }
}

export async function analyzeContract(contractId: string): Promise<AnalysisResponse> {
  try {
    const response = await api.post<AnalysisResponse>("/contracts/analyze", {
      contract_id: contractId,
    });

    return response.data;
  } catch (error) {
    throw getApiError(error, "Failed to analyze contract.");
  }
}

export async function getContract(contractId: string): Promise<ContractResponse> {
  try {
    const response = await api.get<ContractResponse>(`/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    throw getApiError(error, "Failed to fetch contract.");
  }
}
