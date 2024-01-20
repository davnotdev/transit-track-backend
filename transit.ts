import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";

interface TransitData {
    stops: TransitStop[];
    units: TransitUnit[];
}

interface TransitUnit {
    id: string;
    short_name: string;
    long_name: string;
    color: string;
    text_color: string;
}

interface TransitStop {
    name: string;
    code: number;
    lat: number;
    long: number;
}

const GITHUB_GTFS_SOURCES =
    "https://api.github.com/repos/MobilityData/mobility-database-catalogs/contents/catalogs/sources/gtfs/schedule";
const WHITELISTED_SOURCES = [
    "us-california-san-francisco-municipal-transportation-agency-sfmta-gtfs-50.json",
];
const EXTRA_TRANSIT_UNITS: TransitUnit[] = [];
const EXTRA_TRANSIT_STOPS: TransitStop[] = [];

async function fetchTransitData(): Promise<TransitData> {
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
        gtfs_sources.map((it) => fetch(it.urls.direct_download)),
    );

    let gtfs_source_zips = await Promise.all(
        gtfs_source_zip_res_list.map((it) => it.arrayBuffer()),
    );

    let final_stops: TransitStop[] = [];
    let final_units: TransitUnit[] = [];

    gtfs_source_zips.forEach((it) => {
        const buf = Buffer.from(it);
        let zip = new AdmZip(buf);

        let raw_stops = zip.getEntry("stops.txt");

        let raw_routes = zip.getEntry("routes.txt");

        let stops_data = raw_stops?.getData().toString().replace(",\n", "\n");
        let routes_data = raw_routes?.getData().toString().replace(",\n", "\n");

        let gtfs_stops = parse(stops_data!, {
            columns: true,
            record_delimiter: "\r\n",
        });
        let gtfs_routes = parse(routes_data!, {
            columns: true,
            record_delimiter: "\r\n",
        });

        gtfs_stops.forEach((it: any) => {
            final_stops.push({
                name: it.stop_name,
                code: it.stop_code,
                lat: it.stop_lat,
                long: it.stop_long,
            });
        });

        gtfs_routes.forEach((it: any) => {
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
}
