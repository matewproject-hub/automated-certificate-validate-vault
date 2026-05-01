POINTS = {
    "HACKATHON": 20,
    "INTERNSHIP": 30,
    "NPTEL": 50,
    "WORKSHOP": 10,
    "SPORTS": 10,
    "GENERAL": 5,
    "COURSERA": 50
}

def map_points(category):
    return POINTS.get(category, 0)