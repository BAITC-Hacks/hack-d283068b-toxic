from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProposalCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    team_name: str = Field(min_length=1)
    idea: str = Field(min_length=1)
    plan: str = Field(min_length=1)
    deadline: str
    prototype_url: str

    @field_validator("team_name", "idea", "plan")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field must not be blank")
        return value


class ProposalStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str


class ProposalResponse(BaseModel):
    id: int
    task_id: int
    team_name: str
    idea: str
    plan: str
    deadline: str
    prototype_url: str
    status: Literal["pending", "accepted", "rejected"]
