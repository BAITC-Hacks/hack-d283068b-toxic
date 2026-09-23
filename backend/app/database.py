import sqlite3
from contextlib import closing
from pathlib import Path

from app.schemas.tasks import TASK_CARD_FIELDS, RatingResult, TaskCard


DB_PATH = Path(__file__).resolve().parents[1] / "tasks.db"


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    try:
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
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
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS proposals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                team_name TEXT NOT NULL,
                idea TEXT NOT NULL,
                plan TEXT NOT NULL,
                deadline TEXT NOT NULL,
                prototype_url TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
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


def get_task(task_id: int) -> sqlite3.Row | None:
    with closing(_connect()) as connection:
        return connection.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,),
        ).fetchone()


def publish_task(task_id: int) -> sqlite3.Row | None:
    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                "UPDATE tasks SET status = 'published' WHERE id = ?",
                (task_id,),
            )
            if cursor.rowcount == 0:
                return None
            return connection.execute(
                "SELECT * FROM tasks WHERE id = ?",
                (task_id,),
            ).fetchone()


def list_published_tasks(
    *, topic: str | None, readiness: str | None, sort: str
) -> list[sqlite3.Row]:
    sort_order = {"rating_desc": "DESC", "rating_asc": "ASC"}.get(sort)
    if sort_order is None:
        raise ValueError("Unsupported task sort")

    query = "SELECT * FROM tasks WHERE status = 'published'"
    parameters: list[str] = []
    if readiness is not None:
        query += " AND readiness = ?"
        parameters.append(readiness)
    query += f" ORDER BY score {sort_order}, id ASC"

    with closing(_connect()) as connection:
        rows = connection.execute(query, parameters).fetchall()

    if topic is None:
        return rows
    normalized_topic = topic.strip().casefold()
    return [row for row in rows if row["topic"].strip().casefold() == normalized_topic]


def create_proposal(task_id: int, values: dict[str, str]) -> int:
    fields = ("task_id", "team_name", "idea", "plan", "deadline", "prototype_url")
    proposal_values = (task_id, *(values[field] for field in fields[1:]))
    placeholders = ", ".join("?" for _ in fields)
    columns = ", ".join(fields)

    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                f"INSERT INTO proposals ({columns}) VALUES ({placeholders})",
                proposal_values,
            )
        if cursor.lastrowid is None:
            raise sqlite3.DatabaseError("Proposal insert did not return an id")
        return cursor.lastrowid


def get_proposals(task_id: int) -> list[sqlite3.Row]:
    with closing(_connect()) as connection:
        return connection.execute(
            "SELECT * FROM proposals WHERE task_id = ? ORDER BY id ASC",
            (task_id,),
        ).fetchall()


def get_proposal(proposal_id: int) -> sqlite3.Row | None:
    with closing(_connect()) as connection:
        return connection.execute(
            "SELECT * FROM proposals WHERE id = ?",
            (proposal_id,),
        ).fetchone()


def update_proposal_status(proposal_id: int, status: str) -> sqlite3.Row | None:
    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                "UPDATE proposals SET status = ? WHERE id = ?",
                (status, proposal_id),
            )
            if cursor.rowcount == 0:
                return None
            return connection.execute(
                "SELECT * FROM proposals WHERE id = ?",
                (proposal_id,),
            ).fetchone()
