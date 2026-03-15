
def get_letter_grade(total_score):
    """Converts a numerical score into a letter grade."""
    if total_score >= 85: return "A+"
    if total_score >= 80: return "A"
    if total_score >= 75: return "B+"
    if total_score >= 70: return "B"
    if total_score >= 65: return "C+"
    if total_score >= 60: return "C"
    if total_score >= 55: return "D+"
    if total_score >= 50: return "D"
    return "F"