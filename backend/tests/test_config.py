import pytest

from app import config


def test_production_refuses_default_credentials(monkeypatch):
    monkeypatch.setattr(config.settings, "environment", "production")
    with pytest.raises(RuntimeError):
        config.check_production_settings()


def test_production_accepts_strong_credentials(monkeypatch):
    monkeypatch.setattr(config.settings, "environment", "production")
    monkeypatch.setattr(config.settings, "secret_key", "x" * 40)
    monkeypatch.setattr(config.settings, "admin_password", "a-real-password-123")
    config.check_production_settings()  # no exception


def test_development_allows_defaults(monkeypatch):
    monkeypatch.setattr(config.settings, "environment", "development")
    config.check_production_settings()
