from datetime import date, time
from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, OptionalEnabled
from show import show


def my_function(
    birthday: Annotated[
        date,
        Label("Birthday"),
        Description("Your date of birth"),
    ],

    start_date: date,

    deadline: date = date(2025, 12, 31),

    vacation: Annotated[
        date,
        Label("Vacation Start"),
        Description("When does your vacation start?"),
    ] | None = None,

    follow_up: Annotated[
        date,
        Label("Follow-up Date"),
    ] | OptionalEnabled = None,

    milestones: Annotated[
        list[date],
        Field(min_length=2, max_length=5),
        Label("Milestones"),
        Description("Add between 2 and 5 milestone dates"),
    ] = None,

    holidays: list[date] = [date(2025, 1, 1), date(2025, 12, 25)],

    reminders: list[date] | None = [],
):
    pass


if __name__ == "__main__":
    show(my_function)