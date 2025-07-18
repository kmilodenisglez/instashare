from api.config import settings, Settings

def test_settings_defaults():
    # Verifica que los valores por defecto existen
    assert settings.OUTPUT_DIR == "./output"
    assert settings.DATABASE_URL.startswith("sqlite")
    assert settings.SESSION_SECRET_KEY == "your-secret-key-for-sessions"
    assert settings.IPFS_GATEWAY_URL.startswith("https://")

def test_settings_env(monkeypatch):
    # Prueba que los valores se pueden sobreescribir por variables de entorno
    monkeypatch.setenv("OUTPUT_DIR", "/tmp/test_output")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///tmp/test.db")
    monkeypatch.setenv("SESSION_SECRET_KEY", "supersecret")
    s = Settings()
    assert s.OUTPUT_DIR == "/tmp/test_output"
    assert s.DATABASE_URL == "sqlite:///tmp/test.db"
    assert s.SESSION_SECRET_KEY == "supersecret"