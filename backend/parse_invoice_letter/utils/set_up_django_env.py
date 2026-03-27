import os
import sys
import django
from pathlib import Path


def set_up_django_env():
    backend_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../backend")
    )
    sys.path.append(backend_path)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()
