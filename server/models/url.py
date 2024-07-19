from pydantic import BaseModel  # Import Pydantic model for request validation


class Url(BaseModel):  # Define a Pydantic model for the expected JSON body
    url: str
