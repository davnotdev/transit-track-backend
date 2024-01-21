"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adm_zip_1 = __importDefault(require("adm-zip"));
const sync_1 = require("csv-parse/sync");
const GITHUB_GTFS_SOURCES = "https://api.github.com/repos/MobilityData/mobility-database-catalogs/contents/catalogs/sources/gtfs/schedule";
const WHITELISTED_SOURCES = [
    "us-california-san-francisco-municipal-transportation-agency-sfmta-gtfs-50.json",
];
const EXTRA_TRANSIT_UNITS = [];
const EXTRA_TRANSIT_STOPS = [];
function fetchTransitData() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield (yield fetch(GITHUB_GTFS_SOURCES)).json();
        let whitelisted_downloads = res
            .filter((it) => WHITELISTED_SOURCES.find((ws) => ws == it.name))
            .map((it) => it.download_url);
        let gtfs_source_res_list = yield Promise.all(whitelisted_downloads.map((it) => fetch(it)));
        let gtfs_sources = yield Promise.all(gtfs_source_res_list.map((it) => it.json()));
        let gtfs_source_zip_res_list = yield Promise.all(gtfs_sources.map((it) => fetch(it.urls.direct_download)));
        let gtfs_source_zips = yield Promise.all(gtfs_source_zip_res_list.map((it) => it.arrayBuffer()));
        let final_stops = [];
        let final_units = [];
        gtfs_source_zips.forEach((it) => {
            const buf = Buffer.from(it);
            let zip = new adm_zip_1.default(buf);
            let raw_stops = zip.getEntry("stops.txt");
            let raw_routes = zip.getEntry("routes.txt");
            let stops_data = raw_stops === null || raw_stops === void 0 ? void 0 : raw_stops.getData().toString().replace(",\n", "\n");
            let routes_data = raw_routes === null || raw_routes === void 0 ? void 0 : raw_routes.getData().toString().replace(",\n", "\n");
            let gtfs_stops = (0, sync_1.parse)(stops_data, {
                columns: true,
                record_delimiter: "\r\n",
            });
            let gtfs_routes = (0, sync_1.parse)(routes_data, {
                columns: true,
                record_delimiter: "\r\n",
            });
            gtfs_stops.forEach((it) => {
                final_stops.push({
                    name: it.stop_name,
                    code: it.stop_code,
                    lat: it.stop_lat,
                    long: it.stop_long,
                });
            });
            gtfs_routes.forEach((it) => {
                final_units.push({
                    id: it.route_id,
                    short_name: it.route_short_name,
                    long_name: it.route_long_name,
                    color: it.route_color,
                    text_color: it.route_text_color,
                });
            });
            final_stops.push(...EXTRA_TRANSIT_STOPS);
            final_units.push(...EXTRA_TRANSIT_UNITS);
        });
        return {
            stops: final_stops,
            units: final_units,
        };
    });
}
