"""Application ports."""

import importlib

_in_ports = importlib.import_module(".in", __package__)
ProjectRepository = _in_ports.ProjectRepository
ActivityRepository = _in_ports.ActivityRepository

__all__ = ["ProjectRepository", "ActivityRepository"]
