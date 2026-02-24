from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, Slider, Step, OptionalEnabled
from show import show


def my_function(
    age: Annotated[
        int,
        Field(ge=0, le=120),
        Slider(),
        Label("Your Age"),
        Description("How old are you?")
    ],
    brightness: Annotated[
        int,
        Field(ge=0, le=100),
        Slider(show_value=False),
    ],
    score: Annotated[int, Field(gt=0, lt=100)] | None,
    score2: Annotated[int, Field(gt=0, lt=100)] | OptionalEnabled,
    temperature: Annotated[
        int,
        Field(ge=2700, le=6500),
        Slider(),
        Step(100),
        Description("Warm (2700K) to cool (6500K)")
    ] | None,
    retry_count: Annotated[
        int,
        Field(ge=1, le=10),
        Step(1),
        Label("Max Retries"),
        Description("Number of retry attempts before giving up")
    ],
    retry_count2: Annotated[
        int,
        Field(ge=1, le=10),
        Step(5),
        Label("Max Retries"),
        Description("Number of retry attempts before giving up")
    ],
    lucky_numbers: Annotated[
        list[Annotated[int, Field(ge=1, le=99)]],
        Field(min_length=2, max_length=5),
        Label("Lucky Numbers"),
        Description("Pick between 2 and 5 lucky numbers")
    ] = None,
    list_simple: list[int] = [1, 2, 3],
    list_simple_optional: list[int] | None = [],
    slider_list: Annotated[
        list[Annotated[int, Field(ge=0, le=100), Slider()]],
        Field(min_length=2, max_length=3),
        Label("Slider List"),
        Description("Pick 2 to 3 values with sliders")
    ] | None = None,

):
    pass


if __name__ == "__main__":
    show(my_function)
