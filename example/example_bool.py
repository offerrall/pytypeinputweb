from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, OptionalEnabled
from show import show


def my_function(
    accept_terms: Annotated[
        bool,
        Label("Accept Terms Suu"),
        Description("You must accept the terms to continue")
    ],
    dark_mode: Annotated[
        bool,
        Label("Dark Mode Suu"),
        Description("Enable dark mode theme")
    ] = True,
    notifications: bool = False,
    verbose: Annotated[
        bool,
        Label("Verbose Output"),
    ] | None = None,
    debug: Annotated[
        bool,
        Description("Enable debug logging"),
    ] | OptionalEnabled = None,
    features: Annotated[
        list[bool],
        Field(min_length=2, max_length=5),
        Label("Feature Flags"),
        Description("Toggle features on/off"),
    ] = [True, False, True],
    toggles_list: list[bool] | None = [],
):
    pass


if __name__ == "__main__":
    show(my_function)