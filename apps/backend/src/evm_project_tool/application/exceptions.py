class ValidationError(Exception):
    """Application validation failure (maps to HTTP 422 in infra)."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(Exception):
    """Missing resource (maps to HTTP 404 in infra)."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)
