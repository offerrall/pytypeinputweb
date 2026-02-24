from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, Slider, Step, OptionalEnabled
from show import show


def my_function(
    weight: Annotated[
        float,
        Field(ge=0.0, le=200.0),
        Slider(),
        Label("Your Weight"),
        Description("Weight in kg")
    ],
    opacity: Annotated[
        float,
        Field(ge=0.0, le=1.0),
        Slider(show_value=False),
    ],
    score: Annotated[float, Field(gt=0.0, lt=100.0)] | None,
    score2: Annotated[float, Field(gt=0.0, lt=100.0)] | OptionalEnabled,
    temperature: Annotated[
        float,
        Field(ge=36.0, le=42.0),
        Slider(),
        Step(1),
        Description("Body temperature in °C")
    ] | None,
    learning_rate: Annotated[
        float,
        Field(ge=0.001, le=1.0),
        Step(0.001),
        Label("Learning Rate"),
        Description("Step size for gradient descent")
    ],
    threshold: Annotated[
        float,
        Field(ge=0.0, le=100.0),
        Step(2),
        Label("Threshold"),
        Description("Decision boundary threshold")
    ],
    measurements: Annotated[
        list[Annotated[float, Field(ge=0.0, le=999.99)]],
        Field(min_length=2, max_length=5),
        Label("Measurements"),
        Description("Enter between 2 and 5 measurements")
    ] = None,
    list_simple: list[float] = [1.5, 2.7, 3.14],
    list_simple_optional: list[float] | None = [],
):
    pass


if __name__ == "__main__":
    show(my_function)
