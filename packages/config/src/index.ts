interface Config {
  redis: {
    host: string;
    port: number;
  };
  database: {
    url: string;
  };
  minio: {
    endpoint: string;
    port: number;
    useSSL: boolean;
  };
}

export const config: Config = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/bkg",
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
  },
};

export { config as default };
