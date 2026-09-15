import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password=os.getenv("MYSQL_PASSWORD"),
    database="ai_study_assistant"
)

cursor = db.cursor()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import TaskCreate
from app.ai import recommend_tasks, generate_study_advice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI Smart Study Assistant API is running!"
    }


@app.get("/tasks")
def get_tasks():
    cursor.execute("SELECT * FROM tasks")

    rows = cursor.fetchall()

    tasks = []

    for row in rows:
        task = {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "subject": row[3],
            "completed": row[4],
            "priority": row[5],
            "due_date": row[6]      
        }

        tasks.append(task)

    return {
        "tasks": tasks
    }

@app.get("/tasks/{task_id}")
def get_task(task_id: int):

    cursor.execute(
        "SELECT * FROM tasks WHERE id = %s",
        (task_id,)
    )

    row = cursor.fetchone()

    if row is None:
        return {"message": "Task not found"}

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "subject": row[3],
        "completed": row[4],
        "priority": row[5],
        "due_date": row[6]
    }


@app.post("/tasks")
def create_task(task: TaskCreate):

    sql = """
    INSERT INTO tasks (title, description, subject, priority, due_date)
    VALUES (%s, %s, %s, %s, %s)
    """

    values = (
    task.title,
    task.description,
    task.subject,
    task.priority,
    task.due_date
    )

    cursor.execute(sql, values)
    db.commit()

    return {
        "message": "Task saved successfully",
        "task": task
    }

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):

    sql = "DELETE FROM tasks WHERE id = %s"

    cursor.execute(sql, (task_id,))
    db.commit()

    return {
        "message": "Task deleted successfully"
    }

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskCreate):

    cursor.execute(
        """
        UPDATE tasks
        SET title = %s, description = %s, subject = %s, priority = %s, due_date = %s
        WHERE id = %s
        """,
        (
            task.title,
            task.description,
            task.subject,
            task.priority,
            task.due_date,
            task_id
        )
    )

    db.commit()

    if cursor.rowcount == 0:
        return {"message": "Task not found"}

    return {
        "message": "Task updated successfully"
    }

@app.put("/tasks/{task_id}/complete")
def complete_task(task_id: int):

    cursor.execute(
        """
        UPDATE tasks
        SET completed = TRUE
        WHERE id = %s
        """,
        (task_id,)
    )

    db.commit()

    if cursor.rowcount == 0:
        return {"message": "Task not found"}

    return {
        "message": "Task marked as completed"
    }

@app.put("/tasks/{task_id}/uncomplete")
def uncomplete_task(task_id: int):

    cursor.execute(
        """
        UPDATE tasks
        SET completed = FALSE
        WHERE id = %s
        """,
        (task_id,)
    )

    db.commit()

    if cursor.rowcount == 0:
        return {"message": "Task not found"}

    return {
        "message": "Task marked as pending"
    }

@app.post("/recommend")
def recommend(user_query: str):

    cursor.execute("""
    SELECT title, description, subject, priority, due_date, completed
    FROM tasks
    """)

    rows = cursor.fetchall()

    tasks = []

    for row in rows:
        tasks.append({
            "title": row[0],
            "description": row[1],
            "subject": row[2],
            "priority": row[3],
            "due_date": row[4],
            "completed": row[5]
        })

    recommendations = recommend_tasks(tasks, user_query)
    study_advice = generate_study_advice(user_query, recommendations)

    return {
        "recommendations": recommendations,
        "study_advice": study_advice
    }