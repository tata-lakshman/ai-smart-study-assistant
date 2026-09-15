from pydantic import BaseModel

class Task:

    def __init__(self, id, title, description, subject, completed=False):
        self.id = id
        self.title = title
        self.description = description
        self.subject = subject
        self.completed = completed

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "subject": self.subject,
            "completed": self.completed
        }


class TaskCreate(BaseModel):
    title: str
    description: str
    subject: str
    priority: str = "Medium"
    due_date: str | None = None