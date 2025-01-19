import { getDistance } from "geolib";
import { getMapData } from "@/utils/maps/map";

class Location {
  id: number;
  location: string;
  edge: number[];

  constructor(id: number, location: string, edge: number[]) {
    this.id = id;
    this.location = location;
    this.edge = edge;
  }
}

const calculateDistance = (start: number[], end: number[]) =>
  getDistance(
    { latitude: start[1], longitude: start[0] },
    { latitude: end[1], longitude: end[0] }
  );

const randPos = (start: number[], end: number[]) => {
  const random = Math.random();
  const dy = end[1] - start[1];
  const dx = end[0] - start[0];
  return [start[0] + dx * random, start[1] + dy * random];
};

const randAccuracy = () => 10 * Math.random();

const randInt = (start: number, end: number) => {
  if (start === end) {
    console.log("范围空!");
  }
  const len = end - start;
  return Math.floor(start + len * Math.random());
};

const gen = (distance: number, locations: Location[]) => {
  let currentDistance = 0;
  const startIndex = Math.floor(Math.random() * locations.length);
  let currentLocation = locations[startIndex];
  const result = Array(10).fill("");

  let startTime = Date.now() - 30 * 60 * 1000;
  let lastIndex = -1;

  let current = currentLocation.location.split(",");
  result[0] = `${current[0]}-${
    current[1]
  }-${startTime}-${randAccuracy().toFixed(1)}`;

  let i = 1;
  while (currentDistance < distance) {
    current = currentLocation.location.split(",");
    const edge = currentLocation.edge;

    if (!edge) {
      console.log("edge为空");
    }
    const randIndex = randInt(0, edge.length);
    let edgeIndex = edge[randIndex];
    if (edgeIndex === lastIndex) {
      edgeIndex = edge[(randIndex + 1) % edge.length];
    }
    const next = locations[edgeIndex];

    const start = current.map(Number);
    const end = next.location.split(",").map(Number);

    const goDistance = calculateDistance(start, end);
    currentDistance += goDistance;

    let lastRandPos = start;
    for (let j = 0; j < 10; j++) {
      const newRandPos = randPos(lastRandPos, end);
      const distance1 = calculateDistance(lastRandPos, newRandPos);
      lastRandPos = newRandPos;
      startTime += (distance1 / randInt(1, 5)) * 1000;
      result[i++] = `${lastRandPos[0]}-${
        lastRandPos[1]
      }-${startTime}-${randAccuracy().toFixed(1)}`;
    }
    const distance1 = calculateDistance(lastRandPos, end);
    startTime += (distance1 / randInt(1, 5)) * 1000;
    result[i++] = `${end[0]}-${end[1]}-${startTime}-${randAccuracy().toFixed(
      1
    )}`;

    lastIndex = currentLocation.id;
    currentLocation = next;
  }

  startTime += randInt(5, 10) * 1000;
  const replace = currentLocation.location.replace(",", "-");
  result[i] = `${replace}-${startTime}-${randAccuracy().toFixed(1)}`;
  return JSON.stringify(result);
};

const getDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30);
  return now.toISOString().replace("T", " ").substring(0, 19);
};

const genTrackPoints = (distance: number, mapChoice: string) => {
  const data = getMapData(mapChoice);
  const locations = data.map((d) => new Location(d.id, d.location, d.edge));

  return gen(distance, locations);
};

export { genTrackPoints, getDate };
