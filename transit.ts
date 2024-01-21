import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";

export interface TransitData {
  stops: TransitStop[];
  units: TransitUnit[];
}

export interface TransitUnit {
  id: string;
  short_name: string;
  long_name: string;
  color: string;
  text_color: string;

  stop_ids: string[];
}

interface TransitStop {
  stop_id: string;
  name: string;
  code: number;
  lat: number;
  long: number;
}

const GITHUB_GTFS_SOURCES =
  "https://api.github.com/repos/MobilityData/mobility-database-catalogs/contents/catalogs/sources/gtfs/schedule";
const WHITELISTED_SOURCES = [
  //  "us-california-san-francisco-municipal-transportation-agency-sfmta-gtfs-50.json",
  "us-california-santa-cruz-metro-scmtd-gtfs-1211.json",
];
const EXTRA_TRANSIT_UNITS: TransitUnit[] = [];
const EXTRA_TRANSIT_STOPS: TransitStop[] = [];

export async function fetchTransitData(): Promise<TransitData> {
  let res: any[] = await (await fetch(GITHUB_GTFS_SOURCES)).json();

  let whitelisted_downloads = res
    .filter((it) => WHITELISTED_SOURCES.find((ws) => ws == it.name))
    .map((it) => it.download_url);

  let gtfs_source_res_list = await Promise.all(
    whitelisted_downloads.map((it) => fetch(it)),
  );

  let gtfs_sources = await Promise.all(
    gtfs_source_res_list.map((it) => it.json()),
  );

  let gtfs_source_zip_res_list = await Promise.all(
    gtfs_sources.map((it) => fetch(it.urls.latest)),
  );

  let gtfs_source_zips = await Promise.all(
    gtfs_source_zip_res_list.map((it) => it.arrayBuffer()),
  );

  let final_stops: TransitStop[] = [];
  let final_units: TransitUnit[] = [];

  gtfs_source_zips.forEach((it) => {
    const buf = Buffer.from(it);
    let zip = new AdmZip(buf);

    let raw_stops = zip.getEntry("");
    let raw_routes = zip.getEntry("");
    let raw_trips = zip.getEntry("");
    let raw_stop_times = zip.getEntry("");
    zip.forEach((file) => {
      switch (file.name) {
        case "stops.txt":
          raw_stops = file;
          break;
        case "routes.txt":
          raw_routes = file;
          break;
        case "trips.txt":
          raw_trips = file;
          break;
        case "stop_times.txt":
          raw_stop_times = file;
          break;
      }
    });

    let stops_data = raw_stops?.getData().toString();
    let routes_data = raw_routes?.getData().toString();
    let trips_data = raw_trips?.getData().toString();
    let stop_times_data = raw_stop_times?.getData().toString();

    let gtfs_stops = parse(stops_data!, {
      columns: true,
      skipEmptyLines: true,
      ignore_last_delimiters: true,
      skip_records_with_error: true,
    });
    let gtfs_routes = parse(routes_data!, {
      columns: true,
      skipEmptyLines: true,
      ignore_last_delimiters: true,
    });
    let gtfs_trips = parse(trips_data!, {
      columns: true,
      skipEmptyLines: true,
      ignore_last_delimiters: true,
    });
    let gtfs_stop_times = parse(stop_times_data!, {
      columns: true,
      skipEmptyLines: true,
      ignore_last_delimiters: true,
    });

    //  Enumerate all stops / routes

    gtfs_stops.forEach((it: any) => {
      final_stops.push({
        stop_id: it.stop_id,
        name: it.stop_name,
        code: it.stop_code,
        lat: it.stop_lat,
        //  Includes "stop_lon" because San Francisco people can't fucking spell.
        long: it.stop_long || it.stop_lon,
      });
    });

    gtfs_routes.forEach((it: any) => {
      let route_id = it.route_id;
      let route_trip_id = gtfs_trips.find(
        (it: any) => it.route_id == route_id,
      ).trip_id;
      let route_stops = gtfs_stop_times
        .filter((stop: any) => stop.trip_id == route_trip_id)
        .map((it: any) => it.stop_id);

      final_units.push({
        id: it.route_id,
        short_name: it.route_short_name,
        long_name: it.route_long_name,
        color: it.route_color,
        text_color: it.route_text_color,
        stop_ids: route_stops,
      });
    });
  });

  final_stops.push(...EXTRA_TRANSIT_STOPS);
  final_units.push(...EXTRA_TRANSIT_UNITS);

  return {
    stops: final_stops,
    units: final_units,
  };
}
