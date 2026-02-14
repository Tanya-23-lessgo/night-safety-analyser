# logic.py

def calculate_safety(data, time_segment):
    """
    Calculates a numerical safety score and categorical risk level 
    based on nearby infrastructure and activity.
    """
    score = 0

    # Infrastructure: High weight given to emergency services
    score += data.get("police", 0) * 5
    score += data.get("hospitals", 0) * 3

    # Activity Indicators: Rewarding well-lit and active urban areas
    score += data.get("open_now", 0) * 2
    score += data.get("activity_density", 0) * 100
    score += data.get("high_engagement_places", 0) * 2

    # Time-based risk adjustment: Multipliers reduce the score based on night-time risk
    if time_segment == "Evening (5PM - 9PM)":
        score *= 1.0  # Standard risk

    elif time_segment == "Night (9PM - 12AM)":
        score *= 0.9  # 10% penalty for late night

    elif time_segment == "After Midnight (12AM - 5AM)":
        score *= 0.7  # 30% penalty for high-risk early hours

    elif time_segment == "Early Morning (5AM - 9AM)":
        score *= 0.85 # 15% penalty for dawn hours

    # Cap maximum at 95: Realistically, no urban area is 100% safe
    score = min(score, 95)

    # Determine qualitative safety level based on threshold scores
    if score >= 65:
        level = "Safe"
    elif score >= 40:
        level = "Moderate"
    else:
        level = "Risky"

    # Generate the human-readable reasoning string for the UI
    reasoning = (
        f"Police: {data.get('police',0)}, "
        f"Hospitals: {data.get('hospitals',0)}, "
        f"Open Businesses: {data.get('open_now',0)}, "
        f"Activity Density: {round(data.get('activity_density',0),3)}, "
        f"Highly Rated Places (>1000 reviews): {data.get('high_engagement_places',0)}"
    )

    return round(score, 2), level, reasoning