from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


TaskField = Literal[
    "title",
    "topic",
    "context",
    "need",
    "users",
    "data_materials",
    "constraints",
    "expected_result",
    "success_criteria",
    "contact",
    "interaction_format",
]


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    description: str
    topic: str


class AnalysisQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: TaskField
    question: str = Field(min_length=1, max_length=300)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Question must not be blank")
        return value.strip()


class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    missing_fields: list[TaskField]
    questions: list[AnalysisQuestion] = Field(min_length=3, max_length=11)

    @model_validator(mode="after")
    def fields_must_be_unique(self) -> "AnalysisResult":
        if len(self.missing_fields) != len(set(self.missing_fields)):
            raise ValueError("Missing fields must be unique")

        question_fields = [item.field for item in self.questions]
        if len(question_fields) != len(set(question_fields)):
            raise ValueError("Question fields must be unique")
        return self


class Question(BaseModel):
    id: str
    field: TaskField
    question: str


class AnalyzeResponse(BaseModel):
    missing_fields: list[TaskField]
    questions: list[Question] = Field(min_length=3)
