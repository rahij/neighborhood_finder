import  shapefile
import math
import json
from flask import Flask
from flask import render_template
from flask import request
app = Flask(__name__)

sf = shapefile.Reader("shapefiles/ZillowNeighborhoods-CA")
shape_records = sf.shapeRecords()
polygons = []
for sr in shape_records:
  cur_polygon = []
  for point in sr.shape.points:
    cur_polygon.append(tuple(point))
  polygons.append((cur_polygon, sr.record[3]))

def point_in_polygon(lat_long,poly):
  # lat_long is reversed in zillow data/mine
  x = lat_long[1]
  y = lat_long[0]

  n = len(poly)
  inside = False

  p1x,p1y = poly[0]
  for i in range(n+1):
      p2x,p2y = poly[i % n]
      if y > min(p1y,p2y):
          if y <= max(p1y,p2y):
              if x <= max(p1x,p2x):
                  if p1y != p2y:
                      xints = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                  if p1x == p2x or x <= xints:
                      inside = not inside
      p1x,p1y = p2x,p2y

  return inside

def midpoint(pointA, pointB):
  latA = math.radians(pointA[0])
  latB = math.radians(pointB[0])
  lonA = math.radians(pointA[1])
  lonB = math.radians(pointB[1])

  dLon = lonB - lonA

  Bx = math.cos(latB) * math.cos(dLon)
  By = math.cos(latB) * math.sin(dLon)

  latC = math.atan2(math.sin(latA) + math.sin(latB),
                math.sqrt((math.cos(latA) + Bx) * (math.cos(latA) + Bx) + By * By))
  lonC = lonA + math.atan2(By, math.cos(latA) + Bx)
  lonC = (lonC + 3 * math.pi) % (2 * math.pi) - math.pi

  return [math.degrees(latC), math.degrees(lonC)]

def get_origin_lat_and_long(request):
  # return [37.68149, -122.446232]
  return [float(request.form['originLat']), float(request.form['originLng'])]

def get_dest_lat_and_long(request):
  # return [37.801761,-122.408638]
  return [float(request.form['destLat']), float(request.form['destLng'])]

def find_neighborhood(lat_long):
  for polygon in polygons:
    if point_in_polygon(lat_long, polygon[0]):
      return polygon
  return ''

def get_midpoints_recursively(pointA, pointB, num_passes_left, midpoints):
  if num_passes_left == 0:
    return midpoints
  new_midpoint = midpoint(pointA, pointB)
  midpoints.append(new_midpoint)
  return get_midpoints_recursively(pointA, new_midpoint, num_passes_left - 1, midpoints) + get_midpoints_recursively(new_midpoint, pointB, num_passes_left - 1, midpoints)

@app.route('/get_passing_neighborhoods', methods=['POST'])
def get_passing_neighborhoods():
  origin_lat_long = get_origin_lat_and_long(request)
  dest_lat_long = get_dest_lat_and_long(request)
  points_to_find = [origin_lat_long]
  passing_neighborhoods = []
  all_midpoints = get_midpoints_recursively(origin_lat_long, dest_lat_long, 4, [])
  for mp in all_midpoints:
    points_to_find.append(mp)
  points_to_find.append(dest_lat_long)
  for point in points_to_find:
    neighborhood = find_neighborhood(point)
    if neighborhood and neighborhood not in passing_neighborhoods:
      passing_neighborhoods.append(neighborhood)
  return json.dumps(passing_neighborhoods)

@app.route('/')
def index():
  return render_template('index.html')

if __name__ == '__main__':
  app.run(debug=True)