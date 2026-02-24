from typing import Annotated
from pydantic import Field
from pytypeinput.types import Color, Label, Description, OptionalEnabled
from show import show


def my_function(
    primary: Annotated[
        Color,
        Label("Primary Color"),
        Description("Main brand color"),
    ],

    background: Color,

    accent: Color = "#3b82f6",

    border_color: Annotated[
        Color,
        Label("Border Color"),
        Description("Optional border color"),
    ] | None = None,

    highlight: Annotated[
        Color,
        Label("Highlight Color"),
    ] | OptionalEnabled = None,

    palette: Annotated[
        list[Color],
        Field(min_length=2, max_length=5),
        Label("Color Palette"),
        Description("Pick between 2 and 5 colors"),
    ] = None,

    palette2: Annotated[
        list[Color],
        Field(min_length=2, max_length=2),
        Label("Color Palette"),
        Description("Pick between 2 and 5 colors"),
    ] = None,

    theme: list[Color] = ["#ff0000", "#00ff00", "#0000ff"],

    gradients: list[Color] | None = [],
):
    pass


if __name__ == "__main__":
    show(my_function)