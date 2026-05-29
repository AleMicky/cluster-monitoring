from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@postgres:5432/storage_cluster"
    PROMETHEUS_URL: str = "http://prometheus:9090"
    BACKEND_PORT: int = 8000
    SIMULATE_METRICS: bool = True
    CORS_ORIGINS: str = "http://localhost:3000"


settings = Settings()
