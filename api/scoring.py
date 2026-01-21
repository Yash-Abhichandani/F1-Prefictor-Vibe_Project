"""
F1 Apex Scoring Engine
Calculates prediction points with streak multipliers.
"""


# =============================================================================
# SCORING CONSTANTS
# =============================================================================

# Qualifying Points
QUALI_P1_POINTS = 5
QUALI_P2_POINTS = 3
QUALI_P3_POINTS = 1

# Race Points
RACE_POINTS = {
    1: 10,   # P1
    2: 8,    # P2
    3: 6,    # P3
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
    9: 1,
    10: 1
}

# Bonus Points
FASTEST_LAP_POINTS = 3
HAT_TRICK_POINTS = 2     # Pole + Win
PODIUM_EXACT_POINTS = 5  # P1-P2-P3 exact order
PODIUM_ANY_POINTS = 2    # P1-P2-P3 any order

# Streak Multipliers
STREAK_THRESHOLDS = {
    5: 2.0,   # 5+ correct predictions = 2x multiplier
    3: 1.5,   # 3-4 correct predictions = 1.5x multiplier
    0: 1.0    # Default, no multiplier
}


# =============================================================================
# STREAK CALCULATION
# =============================================================================

def calculate_streak_multiplier(streak: int) -> float:
    """
    Calculate the points multiplier based on current streak.
    
    Args:
        streak: Number of consecutive races with correct P1 prediction
    
    Returns:
        Multiplier (1.0, 1.5, or 2.0)
    """
    for threshold, multiplier in sorted(STREAK_THRESHOLDS.items(), reverse=True):
        if streak >= threshold:
            return multiplier
    return 1.0


def is_streak_qualifying_prediction(prediction: dict, result: dict) -> bool:
    """
    Check if a prediction qualifies for streak continuation.
    A streak continues if the user correctly predicted the race winner (P1).
    
    Args:
        prediction: User's prediction dict
        result: Actual race result dict
    
    Returns:
        True if P1 prediction was correct
    """
    return prediction.get('race_p1_driver') == result.get('race_p1_driver')


# =============================================================================
# MAIN SCORING FUNCTION
# =============================================================================

def calculate_points(prediction: dict, result: dict, current_streak: int = 0) -> dict:
    """
    Calculate points for a prediction with streak multiplier.
    
    Args:
        prediction: dict with user's picks (quali_p1_driver, race_p1_driver, etc.)
        result: dict with actual race results (same keys)
        current_streak: User's current streak count (for multiplier)
    
    Returns:
        dict with:
            - base_points: Points before multiplier
            - multiplier: Applied multiplier
            - total_points: Final points after multiplier
            - streak_continues: Whether streak continues
            - breakdown: Detailed point breakdown
    """
    base_score = 0
    breakdown = {
        "qualifying": 0,
        "race": 0,
        "bonuses": 0
    }
    
    # --- QUALIFYING ---
    if prediction.get('quali_p1_driver') == result.get('quali_p1_driver'):
        base_score += QUALI_P1_POINTS
        breakdown["qualifying"] += QUALI_P1_POINTS
    
    if prediction.get('quali_p2_driver') == result.get('quali_p2_driver'):
        base_score += QUALI_P2_POINTS
        breakdown["qualifying"] += QUALI_P2_POINTS
    
    if prediction.get('quali_p3_driver') == result.get('quali_p3_driver'):
        base_score += QUALI_P3_POINTS
        breakdown["qualifying"] += QUALI_P3_POINTS

    # --- RACE ---
    race_hits = []
    
    # P1 - P3 with position-specific points
    race_positions = [
        ('race_p1_driver', 1),
        ('race_p2_driver', 2),
        ('race_p3_driver', 3)
    ]
    
    for field, position in race_positions:
        if prediction.get(field) == result.get(field):
            points = RACE_POINTS.get(position, 0)
            base_score += points
            breakdown["race"] += points
            race_hits.append(prediction.get(field))

    # --- BONUSES ---
    
    # 1. HAT TRICK (Pole + Win by same driver)
    if (prediction.get('quali_p1_driver') == result.get('quali_p1_driver') and 
        prediction.get('race_p1_driver') == result.get('race_p1_driver') and
        prediction.get('quali_p1_driver') == prediction.get('race_p1_driver')):
        base_score += HAT_TRICK_POINTS
        breakdown["bonuses"] += HAT_TRICK_POINTS

    # 2. PODIUM TRIO
    user_podium = {
        prediction.get('race_p1_driver'), 
        prediction.get('race_p2_driver'), 
        prediction.get('race_p3_driver')
    }
    actual_podium = {
        result.get('race_p1_driver'), 
        result.get('race_p2_driver'), 
        result.get('race_p3_driver')
    }
    
    # Check Exact Order (All 3 matches in specific slots)
    if len(race_hits) == 3:
        base_score += PODIUM_EXACT_POINTS
        breakdown["bonuses"] += PODIUM_EXACT_POINTS
    # Check Any Order (All 3 drivers present, but not necessarily in right slots)
    elif user_podium == actual_podium:
        base_score += PODIUM_ANY_POINTS
        breakdown["bonuses"] += PODIUM_ANY_POINTS

    # 3. FASTEST LAP (if field exists)
    if (prediction.get('fastest_lap_driver') and 
        prediction.get('fastest_lap_driver') == result.get('fastest_lap_driver')):
        base_score += FASTEST_LAP_POINTS
        breakdown["bonuses"] += FASTEST_LAP_POINTS

    # --- STREAK MULTIPLIER ---
    multiplier = calculate_streak_multiplier(current_streak)
    total_points = int(base_score * multiplier)
    
    # Check if streak continues
    streak_continues = is_streak_qualifying_prediction(prediction, result)

    # --- MANUAL GRADING (Added by Admin later) ---
    manual_points = prediction.get('manual_points', 0) or prediction.get('manual_score', 0) or 0
    total_points += manual_points

    return {
        "base_points": base_score,
        "multiplier": multiplier,
        "total_points": total_points,
        "streak_continues": streak_continues,
        "breakdown": breakdown,
        "manual_points": manual_points
    }


# =============================================================================
# LEGACY COMPATIBILITY
# =============================================================================

def calculate_points_legacy(prediction: dict, result: dict) -> int:
    """
    Legacy function for backward compatibility.
    Returns just the total points as an integer.
    """
    result_dict = calculate_points(prediction, result, current_streak=0)
    return result_dict["total_points"]


# Alias for backward compatibility with existing code
def calculate_points_simple(prediction, result):
    """Simple wrapper that returns integer for existing code."""
    score = 0
    
    # Qualifying
    if prediction.get('quali_p1_driver') == result.get('quali_p1_driver'):
        score += 5
    if prediction.get('quali_p2_driver') == result.get('quali_p2_driver'):
        score += 3
    if prediction.get('quali_p3_driver') == result.get('quali_p3_driver'):
        score += 1

    # Race
    race_hits = []
    if prediction.get('race_p1_driver') == result.get('race_p1_driver'):
        score += 10
        race_hits.append(prediction.get('race_p1_driver'))
    if prediction.get('race_p2_driver') == result.get('race_p2_driver'):
        score += 8
        race_hits.append(prediction.get('race_p2_driver'))
    if prediction.get('race_p3_driver') == result.get('race_p3_driver'):
        score += 6
        race_hits.append(prediction.get('race_p3_driver'))

    # Hat Trick
    if (prediction.get('quali_p1_driver') == result.get('quali_p1_driver') and 
        prediction.get('race_p1_driver') == result.get('race_p1_driver') and
        prediction.get('quali_p1_driver') == prediction.get('race_p1_driver')):
        score += 2

    # Podium Trio
    user_podium = {prediction.get('race_p1_driver'), prediction.get('race_p2_driver'), prediction.get('race_p3_driver')}
    actual_podium = {result.get('race_p1_driver'), result.get('race_p2_driver'), result.get('race_p3_driver')}
    
    if len(race_hits) == 3:
        score += 5
    elif user_podium == actual_podium:
        score += 2

    # Manual
    if prediction.get('manual_points'):
        score += prediction['manual_points']

    return score