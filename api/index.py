from backend.main import app

# Vercel needs the `app` variable to be exposed at the module level.
# This file acts as a proxy to the actual FastAPI app.
handler = app
