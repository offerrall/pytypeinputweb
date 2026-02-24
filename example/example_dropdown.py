from typing import Annotated, Literal
from enum import Enum
from pydantic import Field
from pytypeinput.types import (
    Label, Description, Dropdown, OptionalEnabled,
)
from show import show


class Role(Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


def get_available_themes():
    return ["light", "dark", "solarized", "monokai", "dracula"]


def get_available_languages():
    return ["Python", "JavaScript", "TypeScript", "Rust", "Go", "C++"]


def my_function(
    # ── Enum dropdowns ──
    role: Annotated[
        Role,
        Label("Role"),
        Description("Select user role"),
    ] = Role.VIEWER,

    priority: Annotated[
        Priority,
        Label("Priority"),
        Description("Task priority level"),
    ] = Priority.MEDIUM,

    # ── Literal dropdowns ──
    size: Annotated[
        Literal["S", "M", "L", "XL"],
        Label("T-Shirt Size"),
        Description("Choose your size"),
    ] = "M",

    status: Annotated[
        Literal["draft", "published", "archived"],
        Label("Status"),
        Description("Content status"),
    ] = "draft",

    # ── Dynamic function dropdowns ──
    theme: Annotated[
        str,
        Dropdown(get_available_themes),
        Label("Theme"),
        Description("Select a color theme"),
    ] = "dark",

    language: Annotated[
        str,
        Dropdown(get_available_languages),
        Label("Language"),
        Description("Preferred programming language"),
    ] = "Python",

    # ── Optional dropdown ──
    backup_role: Annotated[
        Role,
        Label("Backup Role"),
        Description("Secondary role (optional)"),
    ] | None = None,

    # ── Optional + enabled dropdown ──
    fallback_theme: Annotated[
        str,
        Dropdown(get_available_themes),
        Label("Fallback Theme"),
        Description("Used when main theme unavailable"),
    ] | OptionalEnabled = "light",

    # ── List of dropdowns ──
    allowed_sizes: Annotated[
        list[Literal["S", "M", "L", "XL"]],
        Field(min_length=1, max_length=4),
        Label("Allowed Sizes"),
        Description("Select which sizes are available"),
    ] = ["M", "L"],

    spoken_languages: Annotated[
        list[Annotated[str, Dropdown(get_available_languages)]],
        Field(min_length=1, max_length=3),
        Label("Known Languages"),
        Description("Languages you know"),
    ] = ["Python"],

    spoken_languages2: Annotated[
        list[Annotated[str, Dropdown(get_available_languages)]],
        Field(min_length=2, max_length=3),
        Label("Known Languages"),
        Description("Languages you know"),
    ] = None,
):
    pass


if __name__ == "__main__":
    show(my_function)