import sqlite3
from contextlib import closing
from pathlib import Path

from app.schemas.tasks import TASK_CARD_FIELDS, RatingResult, TaskCard


DB_PATH = Path(__file__).resolve().parents[1] / "tasks.db"


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    try:
        connection.row_factory = sqlite3.Row
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                topic TEXT NOT NULL,
                context TEXT NOT NULL,
                need TEXT NOT NULL,
                users TEXT NOT NULL,
                data_materials TEXT NOT NULL,
                constraints TEXT NOT NULL,
                expected_result TEXT NOT NULL,
                success_criteria TEXT NOT NULL,
                contact TEXT NOT NULL,
                interaction_format TEXT NOT NULL,
                score INTEGER NOT NULL,
                readiness TEXT NOT NULL,
                status TEXT NOT NULL
            )
            """
        )
        connection.commit()
    except sqlite3.Error:
        connection.close()
        raise
    return connection


def create_task(card: TaskCard, rating: RatingResult) -> int:
    fields = (*TASK_CARD_FIELDS, "score", "readiness", "status")
    placeholders = ", ".join("?" for _ in fields)
    columns = ", ".join(fields)
    values = tuple(getattr(card, field) for field in TASK_CARD_FIELDS)
    values += (rating.score, rating.readiness, "draft")

    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                f"INSERT INTO tasks ({columns}) VALUES ({placeholders})",
                values,
            )
        if cursor.lastrowid is None:
            raise sqlite3.DatabaseError("Task insert did not return an id")
        return cursor.lastrowid


def update_task(task_id: int, card: TaskCard, rating: RatingResult) -> bool:
    fields = (*TASK_CARD_FIELDS, "score", "readiness")
    assignments = ", ".join(f"{field} = ?" for field in fields)
    values = tuple(getattr(card, field) for field in TASK_CARD_FIELDS)
    values += (rating.score, rating.readiness, task_id)

    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                f"UPDATE tasks SET {assignments} WHERE id = ?",
                values,
            )
        return cursor.rowcount > 0
