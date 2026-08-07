import networkx as nx
from geopy.distance import geodesic
from typing import List, Dict, Any

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return geodesic((lat1, lon1), (lat2, lon2)).km

def find_nearest_resource(incident_loc: tuple, resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Finds the nearest emergency vehicle using NetworkX spatial graphs."""
    G = nx.Graph()
    incident_node = "INCIDENT"
    G.add_node(incident_node, pos=incident_loc)

    closest_unit = None
    min_dist = float("inf")

    for res in resources:
        res_node = res["name"]
        res_pos = (res["latitude"], res["longitude"])
        G.add_node(res_node, pos=res_pos)
        
        dist = calculate_haversine(incident_loc[0], incident_loc[1], res_pos[0], res_pos[1])
        G.add_edge(incident_node, res_node, weight=dist)

        if dist < min_dist:
            min_dist = dist
            closest_unit = res

    # Compute shortest path trajectory via Dijkstra
    path = nx.dijkstra_path(G, incident_node, closest_unit["name"])
    
    # Estimate time (average emergency velocity 45 km/h)
    eta_minutes = round((min_dist / 45) * 60, 1)

    return {
        "vehicle": closest_unit["name"],
        "type": closest_unit["resource_type"],
        "distance": f"{round(min_dist, 2)} km",
        "time": f"{max(int(eta_minutes), 1)} mins",
        "path": path
    }