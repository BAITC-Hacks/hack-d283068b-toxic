import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app import database
from app.schemas.tasks import (
    AnalyzeRequest,
    AnalyzeResponse,
    CreateTaskRequest,
    Question,
    RatingResult,
    TaskCard,
    TaskResponse,
)
from app.schemas.proposals import ProposalCreate, ProposalResponse, ProposalStatusUpdate
from app.services.ai_service import (
    AIConfigurationError,
    AIServiceUnavailable,
    InvalidAIResponse,
    analyze_draft,
    create_task_card,
)
from app.services.rating_service import calculate_rating

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def invalid_request_handler(_, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": "Invalid request body"})


@app.post("/api/tasks/analyze", response_model=AnalyzeResponse)
def analyze_task(payload: AnalyzeRequest) -> AnalyzeResponse:
    description = payload.description.strip()
    topic = payload.topic.strip()

    if not description:
        raise HTTPException(status_code=400, detail="Description is required")
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        result = analyze_draft(description=description, topic=topic)
    except AIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from None
    except AIServiceUnavailable:
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable",
        ) from None
    except InvalidAIResponse:
        raise HTTPException(status_code=502, detail="Invalid AI response") from None

    return AnalyzeResponse(
        missing_fields=result.missing_fields,
        questions=[
            Question(id=f"q{index}", field=item.field, question=item.question)
            for index, item in enumerate(result.questions, start=1)
        ],
    )


def _task_response(
    task_id: int,
    card: TaskCard,
    rating: RatingResult,
    status: str = "draft",
) -> TaskResponse:
    return TaskResponse(
        id=task_id,
        **card.model_dump(),
        **rating.model_dump(),
        status=status,
    )


def _task_response_from_row(row: sqlite3.Row) -> TaskResponse:
    card = TaskCard.model_validate({field: row[field] for field in TaskCard.model_fields})
    return _task_response(
        task_id=row["id"],
        card=card,
        rating=calculate_rating(card),
        status=row["status"],
    )


@app.post("/api/tasks", response_model=TaskResponse)
def create_task(payload: CreateTaskRequest) -> TaskResponse:
    draft = payload.draft.strip()
    topic = payload.topic.strip()
    if not draft:
        raise HTTPException(status_code=400, detail="Draft is required")
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        card = create_task_card(draft=draft, topic=topic, answers=payload.answers)
    except AIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from None
    except AIServiceUnavailable:
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable",
        ) from None
    except InvalidAIResponse:
        raise HTTPException(status_code=502, detail="Invalid AI response") from None

    rating = calculate_rating(card)
    try:
        task_id = database.create_task(card, rating)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not save task") from None
    return _task_response(task_id, card, rating)


@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
def edit_task(task_id: int, payload: TaskCard) -> TaskResponse:
    rating = calculate_rating(payload)
    try:
        updated = database.update_task(task_id, payload, rating)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not update task") from None

    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    try:
        row = database.get_task(task_id)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not load task") from None
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_response_from_row(row)


@app.post("/api/tasks/{task_id}/publish", response_model=TaskResponse)
def publish_task(task_id: int) -> TaskResponse:
    try:
        row = database.publish_task(task_id)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not publish task") from None
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_response_from_row(row)


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int) -> TaskResponse:
    try:
        row = database.get_task(task_id)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not load task") from None
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_response_from_row(row)


@app.get("/api/tasks", response_model=list[TaskResponse])
def list_tasks(
    topic: str | None = None,
    readiness: str | None = None,
    sort: str = "rating_desc",
) -> list[TaskResponse]:
    allowed_readiness = {"draft", "working", "ready", "priority"}
    if readiness is not None and readiness not in allowed_readiness:
        raise HTTPException(
            status_code=400,
            detail="Invalid readiness value. Use draft, working, ready, or priority",
        )
    if sort not in {"rating_desc", "rating_asc"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort value. Use rating_desc or rating_asc",
        )

    try:
        rows = database.list_published_tasks(topic=topic, readiness=readiness, sort=sort)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not load catalog") from None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid sort value") from None
    return [_task_response_from_row(row) for row in rows]


@app.post("/api/tasks/{task_id}/proposals", response_model=ProposalResponse)
def create_proposal(task_id: int, payload: ProposalCreate) -> ProposalResponse:
    try:
        task = database.get_task(task_id)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not load task") from None
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        proposal_id = database.create_proposal(task_id, payload.model_dump())
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not save proposal") from None
    return ProposalResponse(
        id=proposal_id,
        task_id=task_id,
        **payload.model_dump(),
        status="pending",
    )


@app.get("/api/tasks/{task_id}/proposals", response_model=list[ProposalResponse])
def list_proposals(task_id: int) -> list[ProposalResponse]:
    try:
        task = database.get_task(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        rows = database.get_proposals(task_id)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not load proposals") from None
    return [ProposalResponse.model_validate(dict(row)) for row in rows]


@app.patch("/api/proposals/{proposal_id}/status", response_model=ProposalResponse)
def change_proposal_status(
    proposal_id: int,
    payload: ProposalStatusUpdate,
) -> ProposalResponse:
    if payload.status not in {"accepted", "rejected"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid proposal status. Use accepted or rejected",
        )

    try:
        row = database.update_proposal_status(proposal_id, payload.status)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Could not update proposal") from None
    if row is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return ProposalResponse.model_validate(dict(row))
