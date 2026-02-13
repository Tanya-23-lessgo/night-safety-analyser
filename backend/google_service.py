# google_service.py

import requests
from config import GOOGLE_API_KEY


def get_place_suggestions(input_text):
    url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

    params = {
        "input": input_text,
        "key": GOOGLE_API_KEY,
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") != "OK":
        return []

    suggestions = []
    for item in data["predictions"]:
        suggestions.append({
            "description": item["description"],
            "place_id": item["place_id"]
        })

    return suggestions


def get_coordinates(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"

    params = {
        "place_id": place_id,
        "fields": "geometry",
        "key": GOOGLE_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") != "OK":
        return None

    location = data["result"]["geometry"]["location"]
    return location["lat"], location["lng"]


def get_nearby_metrics(lat, lng, radius=1000):

    place_types = ["police", "hospital", "restaurant", "store"]

    metrics = {
        "police": 0,
        "hospitals": 0,
        "total_places": 0,
        "open_now": 0,
        "high_engagement_places": 0
    }

    for place_type in place_types:

        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": place_type,
            "key": GOOGLE_API_KEY
        }

        response = requests.get(url, params=params)
        data = response.json()

        if data.get("status") != "OK":
            continue

        for result in data.get("results", []):

            metrics["total_places"] += 1

            if place_type == "police":
                metrics["police"] += 1
            elif place_type == "hospital":
                metrics["hospitals"] += 1

            # Open now
            if result.get("opening_hours", {}).get("open_now"):
                metrics["open_now"] += 1

            # High engagement indicator
            if result.get("user_ratings_total", 0) > 100:
                metrics["high_engagement_places"] += 1

    # Derived metrics

    metrics["activity_density"] = metrics["total_places"] / radius

    return metrics


def fetch_place_data(place_id):
    coords = get_coordinates(place_id)
    if not coords:
        return None

    lat, lng = coords
    return get_nearby_metrics(lat, lng)
