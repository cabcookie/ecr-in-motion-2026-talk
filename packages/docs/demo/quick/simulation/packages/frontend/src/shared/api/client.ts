const API_BASE = "http://localhost:8000/api";

export interface QueryParams {
  filter?: string | string[];
  _limit?: number;
  _offset?: number;
  _sort?: string;
  _order?: "ASC" | "DESC";
  [key: string]: string | string[] | number | boolean | undefined;
}

function toQuery(params?: QueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        searchParams.append(key, v);
      }
    } else {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  next: { _offset: number; _limit: number } | null;
}

export const api = {
  tables: {
    getRows: <T>(table: string, params?: QueryParams): Promise<T[]> =>
      fetch(`${API_BASE}/tables/${table}/rows?${toQuery(params)}`, {
        headers: { "Content-Type": "application/json" },
      })
        .then((r) => handleResponse<PaginatedResponse<T>>(r))
        .then((r) => r.data),

    insertRow: <T>(table: string, data: Partial<T>): Promise<Response> =>
      fetch(`${API_BASE}/tables/${table}/rows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),

    updateRow: <T>(
      table: string,
      id: number,
      data: Partial<T>,
    ): Promise<Response> =>
      fetch(`${API_BASE}/tables/${table}/rows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),

    deleteRow: (table: string, id: number): Promise<Response> =>
      fetch(`${API_BASE}/tables/${table}/rows/${id}`, {
        method: "DELETE",
      }),
  },

  simulation: {
    triggerDisruption: (scenarioId: string): Promise<Response> =>
      fetch(`${API_BASE}/simulation/trigger-disruption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      }),

    activatePreAged: (scenarioId: string): Promise<Response> =>
      fetch(`${API_BASE}/simulation/activate-pre-aged`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      }),

    getStatus: (): Promise<Response> => fetch(`${API_BASE}/simulation/status`),

    reset: (): Promise<Response> =>
      fetch(`${API_BASE}/simulation/reset`, { method: "POST" }),
  },
};
