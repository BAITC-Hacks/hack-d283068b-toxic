from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas.tasks import AnalyzeRequest, AnalyzeResponse, Question
from app.services.ai_service import (
    AIConfigurationError,
    AIServiceUnavailable,
    InvalidAIResponse,
    analyze_draft,
)

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
