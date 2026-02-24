from datetime import time
from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, OptionalEnabled
from show import show


def my_function(
    alarm: Annotated[
        time,
        Label("Alarm"),
        Description("Set your alarm time"),
    ],

    start: time,

    lunch: time = time(13, 0, 23),

    reminder: Annotated[
        time,
        Label("Reminder"),
        Description("Optional reminder time"),
    ] | None = None,

    meeting: Annotated[
        time,
        Label("Meeting Time"),
    ] | OptionalEnabled = None,

    schedule: Annotated[
        list[time],
        Field(min_length=2, max_length=5),
        Label("Schedule"),
        Description("Add between 2 and 5 time slots"),
    ] = None,

    breaks: list[time] = [time(10, 30), time(15, 0)],

    alarms: list[time] | None = [],
):
    pass


if __name__ == "__main__":
    show(my_function)