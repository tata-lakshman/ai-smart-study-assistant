from fastapi.testclient import TestClient

import app.main as main

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "AI Smart Study Assistant API is running!"
    }

def test_get_tasks():
    response = client.get("/tasks")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, dict)
    assert "tasks" in data
    assert isinstance(data["tasks"], list)

def test_create_task_invalid():
    response = client.post("/tasks", json={})

    assert response.status_code == 422

def test_get_task():
    response = client.get("/tasks/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert "title" in data
    assert "description" in data
    assert "subject" in data
    assert "priority" in data
    assert "due_date" in data

def test_get_task_not_found():
    response = client.get("/tasks/999999")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Task not found"
    }

def test_recommend():
    main.generate_study_advice = lambda user_query, recommendations: "TEST ADVICE"

    response = client.post(
        "/recommend",
        params={"user_query": "I want to study Python"}
    )

    assert response.status_code == 200

    data = response.json()

    assert "recommendations" in data
    assert "study_advice" in data

    assert isinstance(data["recommendations"], list)
    assert data["study_advice"] == "TEST ADVICE"

    if data["recommendations"]:
        first = data["recommendations"][0]

        assert "task" in first
        assert "score" in first
        assert "reason" in first