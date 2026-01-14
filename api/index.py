# Vercel Python Serverless Entry Point
# This file directly imports and exposes the FastAPI app

import sys
import os

# Add the api directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now import using absolute name (not relative)
from main import app

# Vercel Python runtime looks for `app` variable
handler = app
