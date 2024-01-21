export type LatLong = [number, number];

export interface Tracker {
  user_locations: Map<string, LatLong>;
  admin_locations: Map<string, LatLong>;
}

export function createTracker(): Tracker {
  return {
    user_locations: new Map(),
    admin_locations: new Map(),
  };
}

export function trackerUpdateUser(tracker: Tracker, hash: string, location: LatLong) {
  tracker.user_locations.set(hash, location);
}

export function trackerInitialUpdateAdmin(tracker: Tracker, hash: string) {
  tracker.admin_locations.set(hash, [0, 0]);
}

export function trackerUpdateAdmin(tracker: Tracker, hash: string, location: LatLong) {
  tracker.admin_locations.set(hash, location);
}

const AVG_BUS_DENSITY_AREA: number = 0.000054793;

export function trackerCalculateDensity(tracker: Tracker, admin: string) {
  let bus_loc = tracker.admin_locations.get(admin)!;
  let accum_value = 0;
  tracker.user_locations.forEach((user) => {
    if (vecLength(vecSub(user, bus_loc)) < AVG_BUS_DENSITY_AREA) {
      accum_value += 1;
    }
  });
  return accum_value / 20;
}

export function trackerGetClosestAdmin(tracker: Tracker, user: string): string | null {
  let min_dist = 999;
  let selected = null;
  let user_loc = tracker.user_locations.get(user)!;
  for (let admin in tracker.admin_locations.keys()) {
    let dist = vecLength(vecSub(user_loc, tracker.admin_locations.get(admin)!));
    if (dist < min_dist) {
      min_dist = dist;
      selected = admin;
    }
  }
  return selected;
}

function vecSub(a: LatLong, b: LatLong): LatLong {
  return [a[0] - b[0], a[1] - b[1]];
}

function vecLength(a: LatLong) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}
