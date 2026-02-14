import pytest

from fastapi.testclient import TestClient
from src.app import get_app
import copy

def fresh_activities():
    return {
        "Chess Club": {
            "description": "Learn strategies and compete in chess tournaments",
            "schedule": "Fridays, 3:30 PM - 5:00 PM",
            "max_participants": 12,
            "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
        },
        "Programming Class": {
            "description": "Learn programming fundamentals and build software projects",
            "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
            "max_participants": 20,
            "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
        },
        "Gym Class": {
            "description": "Physical education and sports activities",
            "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
            "max_participants": 30,
            "participants": ["john@mergington.edu", "olivia@mergington.edu"]
        }
    }

def test_get_activities():
    app = get_app(copy.deepcopy(fresh_activities()))
    client = TestClient(app)
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "Programming Class" in data
    assert "Gym Class" in data

def test_signup_for_activity():
    app = get_app(copy.deepcopy(fresh_activities()))
    client = TestClient(app)
    response = client.post("/activities/Chess Club/signup?email=testuser@mergington.edu")
    assert response.status_code == 200
    data = response.json()
    assert "Signed up testuser@mergington.edu for Chess Club" in data["message"]
    # Check participant added
    response = client.get("/activities")
    assert "testuser@mergington.edu" in response.json()["Chess Club"]["participants"]

def test_remove_participant():
    app = get_app(copy.deepcopy(fresh_activities()))
    client = TestClient(app)
    # Add participant first and verify
    add_resp = client.post("/activities/Programming Class/signup?email=removeuser@mergington.edu")
    assert add_resp.status_code == 200
    # Remove participant
    del_resp = client.delete("/activities/Programming Class/participant?email=removeuser@mergington.edu")
    assert del_resp.status_code == 200
    data = del_resp.json()
    assert "Removed removeuser@mergington.edu from Programming Class" in data["message"]
    # Check participant removed
    get_resp = client.get("/activities")
    assert "removeuser@mergington.edu" not in get_resp.json()["Programming Class"]["participants"]
