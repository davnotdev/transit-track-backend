"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackerGetClosestAdmin = exports.trackerCalculateDensity = exports.trackerUpdateAdmin = exports.trackerUpdateUser = exports.createTracker = void 0;
function createTracker() {
    return {
        user_locations: new Map(),
        admin_locations: new Map(),
    };
}
exports.createTracker = createTracker;
function trackerUpdateUser(tracker, hash, location) {
    if (tracker.admin_locations.get(hash)) {
        throw "Admin not authenticated";
    }
    tracker.user_locations.set(hash, location);
}
exports.trackerUpdateUser = trackerUpdateUser;
function trackerUpdateAdmin(tracker, hash, location) {
    tracker.admin_locations.set(hash, location);
}
exports.trackerUpdateAdmin = trackerUpdateAdmin;
const FT_TO_LAT_CONV = 0.00000273965;
const AVG_BUS_DENSITY_AREA = 0.000054793;
function trackerCalculateDensity(tracker, admin) {
    let bus_loc = tracker.admin_locations.get(admin);
    let accum_value = 0;
    tracker.user_locations.forEach((user) => {
        if (vecLength(vecSub(user, bus_loc)) < AVG_BUS_DENSITY_AREA) {
            accum_value += 1;
        }
    });
    return accum_value / 20;
}
exports.trackerCalculateDensity = trackerCalculateDensity;
function trackerGetClosestAdmin(tracker, user) {
    let min_dist = 999;
    let selected = null;
    let user_loc = tracker.user_locations.get(user);
    for (let admin in tracker.admin_locations.keys()) {
        let dist = vecLength(vecSub(user_loc, tracker.admin_locations.get(admin)));
        if (dist < min_dist) {
            min_dist = dist;
            selected = admin;
        }
    }
    return selected;
}
exports.trackerGetClosestAdmin = trackerGetClosestAdmin;
function vecSub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}
function vecLength(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}
