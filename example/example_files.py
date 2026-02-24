from typing import Annotated
from pydantic import Field
from pytypeinput.types import (
    Label, Description, OptionalEnabled,
    ImageFile, File, DataFile, AudioFile, VideoFile, DocumentFile
)
from show import show


def my_function(
    avatar: Annotated[
        ImageFile,
        Label("Avatar Image"),
        Description("Upload a profile picture"),
    ],
    resume: Annotated[
        File,
        Label("Resume or CV"),
        Description("Upload your CV"),
    ] | None = None,
    photos: Annotated[
        list[ImageFile],
        Field(min_length=1, max_length=10),
        Label("Photos Album"),
        Description("Upload up to 10 images"),
    ] = None,
    gallery: Annotated[
        list[ImageFile],
        Field(min_length=3, max_length=5),
        Label("Gallery Images"),
        Description("Upload between 3 and 5 images"),
    ] = None,
    spreadsheet: Annotated[
        DataFile,
        Description("Upload a data file"),
    ] | OptionalEnabled = None,
    song: AudioFile = None,
    clip: Annotated[
        VideoFile,
        Label("Video Clip"),
    ] | None = None,
    docs: list[DocumentFile] = None,
):
    pass


if __name__ == "__main__":
    show(my_function)