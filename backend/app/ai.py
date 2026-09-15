from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import date
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()


def recommend_tasks(tasks, user_query):
    """
    Recommend study tasks based on similarity
    between the user's request and task information.
    """

    if not tasks:
        return []

    task_texts = []

    for task in tasks:
        text = (
            f"{task['title']} "
            f"{task['description']} "
            f"{task['subject']} "
            f"Priority {task['priority']} "
            f"Due date {task['due_date']} "
            f"Completed {task['completed']}"
        )
        task_texts.append(text)

    documents = [user_query] + task_texts

    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarities = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:]
    )[0]

    recommendations = []

    for index, score in enumerate(similarities):
        task = tasks[index]

        priority_bonus = 0

        due_date_bonus = 0

        completed_penalty = 0

        direct_match_bonus = 0

        stop_words = {
            "i",
            "want",
            "to",
            "study",
            "learn",
            "about",
            "the",
            "a",
            "an",
            "for",
            "on",
        }

        query_words = {
            word
            for word in user_query.lower().split()
            if word not in stop_words
        }

        task_words = set(
            f"{task['title']} {task['description']} {task['subject']}"
            .lower()
            .split()
        )         

        if query_words & task_words:
            direct_match_bonus = 0.25

        if task["completed"]:
            completed_penalty = 0.30

        if task["due_date"]:
            due_date = task["due_date"]

            if hasattr(due_date, "date"):
                due_date = due_date.date()

            days_left = (due_date - date.today()).days

            if days_left <= 1:
                due_date_bonus = 0.20
            elif days_left <= 3:
                due_date_bonus = 0.10

        if task["priority"] == "High":
            priority_bonus = 0.20
        elif task["priority"] == "Medium":
            priority_bonus = 0.10

        final_score = (
            float(score)
            + direct_match_bonus
            + priority_bonus
            + due_date_bonus
            - completed_penalty
        )
        final_score = max(0, min(final_score, 1))

        reason_parts = []

        if task["priority"] == "High":
            reason_parts.append("high priority")
        elif task["priority"] == "Medium":
            reason_parts.append("medium priority")

        if task["due_date"]:
            if days_left <= 1:
                reason_parts.append("due very soon")
            elif days_left <= 3:
                reason_parts.append("due within 3 days")

        if task["completed"]:
            reason_parts.append("already completed")
        else:
            reason_parts.append("still pending")

        if float(score) >= 0.4:
            reason_parts.append("strong match for your study request")
        else:
            reason_parts.append("related to your study request")

        reason = "Recommended because it is " + ", ".join(reason_parts) + "."

        recommendations.append({
            "task": task,
            "score": final_score,
            "reason": reason
        })

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return recommendations

def generate_study_advice(user_query, recommendations):
    prompt = f"""
You are an AI study assistant.

The student asked:
{user_query}

Here are the recommended study tasks:
{recommendations}

Give the student a short, practical study plan.

Explain:
1. What they should study first
2. Why it is important
3. What they should do next

Keep the response clear, friendly, and concise.
"""

    try:
        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        return response.output_text

    except Exception as error:
        print("OpenAI API unavailable:", error)

        return (
            "Live AI study advice is temporarily unavailable. "
            "Your recommended tasks are still available below."
        )