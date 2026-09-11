from evm_project_tool.application.exceptions import ValidationError


def validate_non_empty_name(name: str, *, entity: str) -> None:
    if not name or not name.strip():
        raise ValidationError(f"{entity} name must not be empty")
