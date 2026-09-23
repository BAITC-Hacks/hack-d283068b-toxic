from app.schemas.tasks import Breakdown, RatingResult, TaskCard


RATED_FIELDS = (
    "context",
    "need",
    "data_materials",
    "expected_result",
    "success_criteria",
    "constraints",
    "users",
    "contact",
    "interaction_format",
)


def calculate_rating(card: TaskCard) -> RatingResult:
    filled = {field: bool(getattr(card, field).strip()) for field in RATED_FIELDS}
    breakdown = Breakdown(
        context_need=10 * filled["context"] + 10 * filled["need"],
        data_materials=20 * filled["data_materials"],
        expected_result=15 * filled["expected_result"],
        success_criteria=15 * filled["success_criteria"],
        constraints=10 * filled["constraints"],
        users=10 * filled["users"],
        business_connection=5 * filled["contact"] + 5 * filled["interaction_format"],
    )
    score = sum(breakdown.model_dump().values())

    if score < 40:
        readiness = "draft"
    elif score < 70:
        readiness = "working"
    elif score < 90:
        readiness = "ready"
    else:
        readiness = "priority"

    return RatingResult(
        score=score,
        readiness=readiness,
        breakdown=breakdown,
        missing_fields=[field for field in RATED_FIELDS if not filled[field]],
    )
