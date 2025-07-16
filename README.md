python -m venv .venv
source .venv/bin/activate
pip install --no-cache-dir -r requirements.txt
deactivate

uvicorn app.main:app --reload