import requests
from config import GOOGLE_API_KEY

def get_place_suggestions(input_text):
    """
    Fetches location autocomplete suggestions from the Google Places API 
    based on the user's text input.
    """
    url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

    params = {
        "input": input_text,
        "key": GOOGLE_API_KEY,
    }

    response = requests.get(url, params=params)
    data = response.json()

    # Returns an empty list if the API request fails or returns no results
    if data.get("status") != "OK":
        return []

    # Extracts the human-readable description and unique place_id for each suggestion
    suggestions = []
    for item in data["predictions"]:
        suggestions.append({
            "description": item["description"],
            "place_id": item["place_id"]
        })

    return suggestions


def get_coordinates(place_id):
    """
    Converts a specific Google place_id into geographic latitude and longitude 
    coordinates using the Place Details API.
    """
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

    # Navigates the JSON response to find the lat/lng coordinates
    location = data["result"]["geometry"]["location"]
    return location["lat"], location["lng"]


def get_nearby_metrics(lat, lng, radius=1000):
    """
    Scans the area around the given coordinates for specific safety and 
    infrastructure indicators within a set radius.
    """
    # Categories of places that influence the safety score logic
    place_types = ["police", "hospital", "restaurant", "store"]

    metrics = {
        "police": 0,
        "hospitals": 0,
        "total_places": 0,
        "open_now": 0,
        "high_engagement_places": 0
    }

    # Iterate through each place type to gather data from Google Nearby Search
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
            # Track the total volume of points of interest found
            metrics["total_places"] += 1

            # Count critical infrastructure specifically
            if place_type == "police":
                metrics["police"] += 1
            elif place_type == "hospital":
                metrics["hospitals"] += 1

            # Check if the business is currently active (crucial for night safety)
            if result.get("opening_hours", {}).get("open_now"):
                metrics["open_now"] += 1

            # Use high review counts as a proxy for high-traffic/well-lit areas
            if result.get("user_ratings_total", 0) > 100:
                metrics["high_engagement_places"] += 1

    # Calculate a density metric to understand how urbanized the area is
    metrics["activity_density"] = metrics["total_places"] / radius

    return metrics


def fetch_place_data(place_id):
    """
    Master function that chains coordinate lookup and metric gathering 
    together for a single place_id.
    """
    coords = get_coordinates(place_id)
    if not coords:
        return None

    lat, lng = coords
    return get_nearby_metrics(lat, lng)