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

TASK_CARD_FIELDS = (
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
)


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


class Answer(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: TaskField
    answer: str


class CreateTaskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    draft: str
    topic: str
    answers: list[Answer]


class TaskCard(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    topic: str
    context: str
    need: str
    users: str
    data_materials: str
    constraints: str
    expected_result: str
    success_criteria: str
    contact: str
    interaction_format: str

    @field_validator(*TASK_CARD_FIELDS)
    @classmethod
    def trim_field(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def required_fields_must_be_present(self) -> "TaskCard":
        if not self.title:
            raise ValueError("Title is required")
        if not self.topic:
            raise ValueError("Topic is required")
        return self


class Breakdown(BaseModel):
    context_need: int
    data_materials: int
    expected_result: int
    success_criteria: int
    constraints: int
    users: int
    business_connection: int


Readiness = Literal["draft", "working", "ready", "priority"]


class RatingResult(BaseModel):
    score: int
    readiness: Readiness
    breakdown: Breakdown
    missing_fields: list[TaskField]


class TaskResponse(TaskCard):
    id: int
    score: int
    readiness: Readiness
    breakdown: Breakdown
    missing_fields: list[TaskField]
    status: Literal["draft"]
