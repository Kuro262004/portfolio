from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Set ENVIRONMENT=production when deploying: the app then refuses to start with the dev defaults below.
    environment: str = "development"
    secret_key: str = "dev-secret-change-me"
    admin_email: str = "admin@example.com"
    admin_password: str = "admin12345"
    database_url: str = "sqlite:///./portfolio.db"
    cors_origins: str = "http://localhost:5173"
    access_token_minutes: int = 60 * 8
    message_retention_days: int = 90

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

_DEV_DEFAULTS = {"secret_key": "dev-secret-change-me", "admin_password": "admin12345"}


def check_production_settings() -> None:
    """Fail fast if a production deploy is still using the public dev defaults from the repo."""
    if settings.environment.lower() != "production":
        return
    weak = [name for name, default in _DEV_DEFAULTS.items() if getattr(settings, name) == default]
    if weak or len(settings.secret_key) < 32:
        raise RuntimeError(
            "Refusing to start in production with default or weak credentials. "
            "Set a strong SECRET_KEY (32+ chars), ADMIN_EMAIL and ADMIN_PASSWORD in the environment or backend/.env."
        )
