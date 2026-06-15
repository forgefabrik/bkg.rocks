export interface DatabaseClient {
  query: (sql: string, params?: unknown[]) => Promise<unknown[]>;
  disconnect: () => Promise<void>;
}

export function createDatabaseClient(): DatabaseClient {
  return {
    query: async (sql: string, params: unknown[] = []) => {
      console.log("Executing query", sql, params);
      return [];
    },
    disconnect: async () => undefined,
  };
}
