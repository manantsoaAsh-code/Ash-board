from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str
    email: str | None = None


class TokenData(BaseModel):
    email: str | None = None
