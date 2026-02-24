from typing import Annotated
from pydantic import Field
from pytypeinput.types import Label, Description, IsPassword, Placeholder, Rows, PatternMessage, OptionalEnabled, Email
from show import show


def my_function(
    username: Annotated[
        str,
        Field(min_length=3, max_length=20),
        Label("Username Suu"),
        Description("Choose a unique username"),
        Placeholder("e.g. john_doe"),
    ],
    name: str,
    greeting: str = "Hello",
    secret: Annotated[
        str,
        Field(min_length=8),
        IsPassword(),
        Label("Password"),
        Description("At least 8 characters Su"),
        Placeholder("Enter your password"),
    ] = None,
    bio: Annotated[
        str,
        Field(max_length=500),
        Rows(4),
        Label("Biography"),
        Description("Tell us about yourself"),
        Placeholder("Write something..."),
    ] = None,
    email: Annotated[
        str,
        Field(pattern=r"^[\w.+-]+@[\w-]+\.[\w.]+$"),
        PatternMessage("Must be a valid email address"),
        Label("Email"),
        Placeholder("user@example.com"),
    ] = None,
    nickname: Annotated[
        str,
        Field(max_length=30),
        Label("Nickname"),
        Placeholder("Optional nickname"),
    ] | None = None,
    website: Annotated[
        str,
        Label("Website"),
        Placeholder("https://..."),
    ] | OptionalEnabled = None,
    tags: Annotated[
        list[Annotated[str, Field(min_length=1, max_length=20)]],
        Field(min_length=2, max_length=5),
        Label("Tags"),
        Description("Add between 2 and 5 tags"),
    ] = None,
    colors: list[str] = ["red", "green", "blue"],
    notes: list[str] | None = [],
    email_official: Email | None = None,
    comments: Annotated[
        list[Annotated[str, Rows(5), Field(min_length=10, max_length=20)]],
        Field(min_length=1, max_length=4),
        Label("Comments"),
        Description("Add your comments"),
    ] = None,
    comments2: Annotated[
        list[Annotated[str, Rows(5), Field(min_length=10, max_length=20)]],
        Field(min_length=2, max_length=4),
        Label("Comments"),
        Description("Add your comments"),
    ] | None= None,
):
    pass


if __name__ == "__main__":
    show(my_function)