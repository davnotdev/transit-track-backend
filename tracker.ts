type LatLong = [number, number];

interface Tracker {
  user_locations: Map<string, LatLong>;
  admin_locations: Map<string, LatLong>;
}

function trackerUpdateUser(tracker: Tracker, hash: string, location: LatLong) {
  tracker.user_locations.set(hash, location);
}

function trackerUpdateAdmin(tracker: Tracker, hash: string, location: LatLong) {
  tracker.admin_locations.set(hash, location);
}

const FT_TO_LAT_CONV: number = 0.00000273965;
const AVG_BUS_DENSITY_AREA: number = 0.000054793;

function trackerCalculateDensity(tracker: Tracker, admin: string) {
  let bus_loc = tracker.admin_locations.get(admin)!;
  let accum_value = 0;
  tracker.user_locations.forEach((user) => {
    if (vecLength(vecSub(user, bus_loc)) < AVG_BUS_DENSITY_AREA) {
      accum_value += 1;
    }
  });
  return accum_value / 20;
}

function vecSub(a: LatLong, b: LatLong): LatLong {
  return [a[0] - b[0], a[1] - b[1]];
}

function vecLength(a: LatLong) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}
