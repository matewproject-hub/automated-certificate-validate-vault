POINTS = {
    "HACKATHON": 20,
    "INTERNSHIP": 30,
    "NPTEL": 15,
    "WORKSHOP": 10,
    "SPORTS": 10,
    "GENERAL": 5
}

def map_points(category):
    return POINTS.get(category, 0)
