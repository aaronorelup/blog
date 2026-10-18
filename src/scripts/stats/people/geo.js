// Where countries are, written from memory: no geography file was downloaded, none exists in the
// repo, and none may be (BRIEF.md, hard constraint 7). Three tables:
//
// CENTROIDS  ISO 3166-1 alpha-2 -> [lat, lon, continent]. A point a cluster can stand on, not a
//            surveyed centroid: for big countries it leans toward where the people are (Russia sits
//            west of the Urals, Canada and Brazil toward their populated south), because the map
//            shows where readers were, and a dot in the middle of Siberia would say otherwise.
//            Continents follow the usual convention (Russia and Cyprus in Europe, Turkey in Asia).
// CONTINENT_LABELS  where each continent's name is written on the map, on open land or sea.
// LAND       a coarse 3-degree land mask, one row per latitude, as longitude spans. It is what
//            makes 240 country points read as a world: the grid of quiet dots under the clusters.
//            Accurate to a cell or so, which is all a backdrop needs; geo.test.mjs checks that
//            every country point lands on (or next to) one of these cells.

const RAW = `AD 42.5 1.5 EU|AE 24 54 AS|AF 33.9 67.7 AS|AG 17.1 -61.8 NA|AI 18.2 -63.1 NA|AL 41.1 20 EU|AM 40.1 45 AS|AO -12.3 17.5 AF|AQ -75 0 AN|AR -34 -64 SA|AS -14.3 -170.7 OC|AT 47.5 14.6 EU|AU -25.3 133.8 OC|AW 12.5 -70 NA|AX 60.2 20 EU|AZ 40.1 47.6 AS|BA 43.9 17.7 EU|BB 13.2 -59.5 NA|BD 23.7 90.4 AS|BE 50.5 4.5 EU|BF 12.2 -1.6 AF|BG 42.7 25.5 EU|BH 26 50.6 AS|BI -3.4 29.9 AF|BJ 9.3 2.3 AF|BL 17.9 -62.8 NA|BM 32.3 -64.8 NA|BN 4.5 114.7 AS|BO -16.3 -63.6 SA|BQ 12.2 -68.3 NA|BR -12 -50 SA|BS 25 -77.4 NA|BT 27.5 90.4 AS|BV -54.4 3.4 AN|BW -22.3 24.7 AF|BY 53.7 28 EU|BZ 17.2 -88.5 NA|CA 56 -100 NA|CC -12.2 96.9 AS|CD -2.9 23.7 AF|CF 6.6 20.9 AF|CG -0.7 15.2 AF|CH 46.8 8.2 EU|CI 7.5 -5.5 AF|CK -21.2 -159.8 OC|CL -33.5 -70.7 SA|CM 5.7 12.4 AF|CN 34 104 AS|CO 4.6 -74.1 SA|CR 9.7 -84 NA|CU 21.5 -79 NA|CV 15.1 -23.6 AF|CW 12.2 -69 NA|CX -10.5 105.7 AS|CY 35.1 33.4 EU|CZ 49.8 15.5 EU|DE 51.2 10.4 EU|DJ 11.8 42.6 AF|DK 56 9.5 EU|DM 15.4 -61.4 NA|DO 18.7 -70.2 NA|DZ 28 2.6 AF|EC -1.8 -78.2 SA|EE 58.6 25 EU|EG 26.8 30.8 AF|EH 24.2 -12.9 AF|ER 15.2 39.8 AF|ES 40.2 -3.7 EU|ET 9.1 40.5 AF|FI 62 26 EU|FJ -17.7 178.1 OC|FK -51.8 -59.5 SA|FM 6.9 158.2 OC|FO 62 -6.9 EU|FR 46.6 2.4 EU|GA -0.8 11.6 AF|GB 53.5 -2 EU|GD 12.1 -61.7 NA|GE 42.3 43.4 AS|GF 4 -53 SA|GG 49.5 -2.6 EU|GH 7.9 -1 AF|GI 36.1 -5.4 EU|GL 72 -40 NA|GM 13.4 -15.3 AF|GN 10.4 -10.9 AF|GP 16.3 -61.6 NA|GQ 1.6 10.3 AF|GR 39.1 22 EU|GS -54.4 -36.6 AN|GT 15.8 -90.2 NA|GU 13.4 144.8 OC|GW 12 -15.2 AF|GY 4.9 -58.9 SA|HK 22.3 114.2 AS|HM -53.1 73.5 AN|HN 15.2 -86.2 NA|HR 45.1 15.2 EU|HT 19 -72.3 NA|HU 47.2 19.5 EU|ID -2.5 118 AS|IE 53.2 -8 EU|IL 31.4 34.9 AS|IM 54.2 -4.5 EU|IN 22 79 AS|IO -6.3 71.9 AS|IQ 33.2 43.7 AS|IR 32.4 53.7 AS|IS 64.9 -18.6 EU|IT 42.8 12.6 EU|JE 49.2 -2.1 EU|JM 18.1 -77.3 NA|JO 31 36.2 AS|JP 36.2 138.3 AS|KE 0 37.9 AF|KG 41.2 74.8 AS|KH 12.6 104.9 AS|KI 1.9 -157.4 OC|KM -11.9 43.9 AF|KN 17.3 -62.7 NA|KP 40.3 127.5 AS|KR 36.5 127.9 AS|KW 29.3 47.5 AS|KY 19.3 -81.3 NA|KZ 48 67 AS|LA 19.9 102.5 AS|LB 33.9 35.9 AS|LC 13.9 -61 NA|LI 47.2 9.6 EU|LK 7.9 80.8 AS|LR 6.4 -9.4 AF|LS -29.6 28.2 AF|LT 55.2 23.9 EU|LU 49.8 6.1 EU|LV 56.9 24.6 EU|LY 26.3 17.2 AF|MA 31.8 -7.1 AF|MC 43.7 7.4 EU|MD 47.4 28.4 EU|ME 42.7 19.4 EU|MF 18.1 -63.1 NA|MG -18.8 46.9 AF|MH 7.1 171.2 OC|MK 41.6 21.7 EU|ML 17.6 -4 AF|MM 21 96 AS|MN 46.9 103.8 AS|MO 22.2 113.5 AS|MP 15.2 145.7 OC|MQ 14.6 -61 NA|MR 21 -10.9 AF|MS 16.7 -62.2 NA|MT 35.9 14.4 EU|MU -20.3 57.6 AF|MV 3.2 73.2 AS|MW -13.3 34.3 AF|MX 23.6 -102.5 NA|MY 3.5 102 AS|MZ -18.7 35.5 AF|NA -22.9 18.5 AF|NC -21.3 165.6 OC|NE 17.6 8.1 AF|NF -29 168 OC|NG 9.1 8.7 AF|NI 12.9 -85.2 NA|NL 52.1 5.3 EU|NO 61 9 EU|NP 28.4 84.1 AS|NR -0.5 166.9 OC|NU -19.1 -169.9 OC|NZ -41 174 OC|OM 21.5 55.9 AS|PA 8.5 -80.8 NA|PE -9.2 -75 SA|PF -17.7 -149.4 OC|PG -6.3 145 OC|PH 12.9 121.8 AS|PK 30.4 69.3 AS|PL 51.9 19.1 EU|PM 46.9 -56.3 NA|PN -25.1 -130.1 OC|PR 18.2 -66.6 NA|PS 31.9 35.2 AS|PT 39.6 -8.2 EU|PW 7.5 134.6 OC|PY -23.4 -58.4 SA|QA 25.4 51.2 AS|RE -21.1 55.5 AF|RO 45.9 25 EU|RS 44 21 EU|RU 56 44 EU|RW -1.9 29.9 AF|SA 23.9 45.1 AS|SB -9.6 160.2 OC|SC -4.7 55.5 AF|SD 15.5 30 AF|SE 60.1 15 EU|SG 1.35 103.8 AS|SH -15.9 -5.7 AF|SI 46.2 15 EU|SJ 78 16 EU|SK 48.7 19.7 EU|SL 8.5 -11.8 AF|SM 43.9 12.4 EU|SN 14.5 -14.5 AF|SO 5.2 46.2 AF|SR 4 -56 SA|SS 7 30 AF|ST 0.2 6.6 AF|SV 13.8 -88.9 NA|SX 18 -63.1 NA|SY 35 38.5 AS|SZ -26.5 31.5 AF|TC 21.7 -71.8 NA|TD 15.5 18.7 AF|TF -49.3 69.3 AN|TG 8.6 0.8 AF|TH 15.9 101 AS|TJ 38.9 71.3 AS|TK -9.2 -171.8 OC|TL -8.9 125.7 AS|TM 39 59.6 AS|TN 34 9.5 AF|TO -21.2 -175.2 OC|TR 39 35.2 AS|TT 10.7 -61.2 NA|TV -7.1 177.6 OC|TW 23.7 121 AS|TZ -6.4 34.9 AF|UA 49 31.2 EU|UG 1.4 32.3 AF|UM 19.3 166.6 OC|US 39 -97 NA|UY -32.5 -55.8 SA|UZ 41.4 64.6 AS|VA 41.9 12.45 EU|VC 13.3 -61.2 NA|VE 6.4 -66.6 SA|VG 18.4 -64.6 NA|VI 18.3 -64.9 NA|VN 16 107.8 AS|VU -15.4 166.9 OC|WF -13.8 -177.2 OC|WS -13.8 -172.1 OC|XK 42.6 20.9 EU|YE 15.6 48.5 AS|YT -12.8 45.2 AF|ZA -29 25 AF|ZM -13.1 27.8 AF|ZW -19 29.2 AF`;

/** @type {Record<string, [number, number, string]>} */
export const CENTROIDS = {};
for (const row of RAW.split('|')) {
  const [code, lat, lon, cont] = row.split(' ');
  CENTROIDS[code] = [Number(lat), Number(lon), cont];
}

/** The continent a country code belongs to, or null when it has no place on the map (XX, T1, …). */
export const continentOf = (code) => (CENTROIDS[code] ? CENTROIDS[code][2] : null);

// On land or open sea away from the countries most likely to carry a cluster; the map still hides
// any that would touch a cluster.
export const CONTINENT_LABELS = {
  NA: [63, -108],
  SA: [-26, -62],
  EU: [64, 22],
  AF: [16, 14],
  AS: [62, 98],
  OC: [-45, 136],
};

// Land, as [lat, [[lonFrom, lonTo], …]] every 3 degrees from 78 N to 54 S. A span covers the
// sample longitudes (…, -1.5, 1.5, 4.5, …) within 1.5 degrees of it, so a one-point span such as
// [9, 9] (Corsica) still shows one dot.
export const LAND = [
  [78, [[-95, -66], [-72, -18], [11, 27], [96, 106]]],
  [75, [[-124, -80], [-60, -20], [54, 60], [88, 112], [138, 148]]],
  [72, [[-157, -142], [-125, -100], [-96, -70], [-56, -22], [52, 58], [66, 130], [140, 158]]],
  [69, [[-165, -141], [-141, -64], [-54, -24], [15, 42], [56, 180], [-180, -172]]],
  [66, [[-166, -141], [-141, -87], [-75, -62], [-53, -37], [-23, -14], [12, 32], [42, 180], [-180, -170]]],
  [63, [[-166, -141], [-141, -94], [-78, -64], [-50, -41], [-22, -14], [6, 18], [22, 180], [-180, -174]]],
  [60, [[-164, -140], [-140, -95], [-78, -64], [-48, -43], [5, 18], [21, 180]]],
  [57, [[-158, -152], [-136, -93], [-77, -62], [-6, -2], [8, 10], [12, 17], [21, 140], [156, 163]]],
  [54, [[-131, -82], [-79, -57], [-10, -6], [-4, 0], [6, 141], [142, 143], [156, 162]]],
  [51, [[-128, -56], [-10, -6], [-5, 1], [2, 141], [142, 143], [156, 158]]],
  [48, [[-124, -65], [-59, -53], [-4, 141], [142, 144]]],
  [45, [[-124, -62], [-1, 12], [14, 29], [33, 36], [38, 47], [52, 136], [140, 145]]],
  [42, [[-124, -70], [-9, 3], [9, 9], [11, 16], [19, 28], [41, 48], [53, 130], [140, 142]]],
  [39, [[-123, -75], [-9, 0], [8, 9], [16, 17], [20, 23], [26, 49], [53, 118], [124, 129], [139, 142]]],
  [36, [[-121, -76], [-6, 10], [28, 120], [126, 129], [132, 140]]],
  [33, [[-118, -79], [-8, 11], [35, 121], [130, 136]]],
  [30, [[-115, -81], [-10, 32], [33, 122], [130, 131]]],
  [27, [[-114, -112], [-110, -97], [-82, -80], [-13, 34], [36, 50], [56, 120]]],
  [24, [[-111, -110], [-106, -98], [-78, -77], [-16, 35], [38, 57], [67, 120], [120, 121]]],
  [21, [[-157, -155], [-105, -97], [-90, -87], [-84, -75], [-17, 37], [40, 59], [70, 87], [93, 107], [110, 111]]],
  [18, [[-156, -155], [-103, -88], [-78, -76], [-74, -68], [-67, -65], [-16, 39], [42, 56], [73, 84], [94, 107], [120, 122]]],
  [15, [[-92, -83], [-17, 39], [43, 52], [74, 80], [98, 109], [120, 122]]],
  [12, [[-87, -83], [-72, -71], [-16, 43], [44, 45], [53, 54], [75, 80], [98, 100], [102, 109], [120, 126]]],
  [9, [[-84, -77], [-76, -60], [-13, 51], [77, 79], [80, 81], [98, 100], [104, 106], [122, 126]]],
  [6, [[-77, -55], [-10, 49], [80, 82], [95, 97], [100, 103], [116, 117], [122, 126]]],
  [3, [[-78, -51], [10, 46], [97, 104], [110, 118]]],
  [0, [[-80, -50], [9, 42], [98, 104], [109, 119], [120, 125], [127, 128]]],
  [-3, [[-80, -40], [10, 40], [101, 106], [110, 116], [119, 122], [126, 131], [132, 150]]],
  [-6, [[-81, -35], [12, 39], [105, 115], [138, 148]]],
  [-9, [[-79, -35], [13, 40], [119, 127], [141, 148]]],
  [-12, [[-77, -37], [13, 41], [49, 50], [131, 137], [141, 143]]],
  [-15, [[-76, -39], [12, 41], [46, 50], [124, 136], [141, 145]]],
  [-18, [[-71, -39], [12, 37], [44, 49], [122, 147]]],
  [-21, [[-70, -41], [14, 35], [44, 48], [115, 149], [164, 166]]],
  [-24, [[-70, -46], [14, 35], [44, 47], [113, 151]]],
  [-27, [[-71, -48], [15, 32], [113, 153]]],
  [-30, [[-71, -50], [17, 31], [115, 153]]],
  [-33, [[-71, -53], [18, 28], [115, 123], [134, 152]]],
  [-36, [[-73, -57], [136, 150], [173, 176]]],
  [-39, [[-74, -62], [173, 178]]],
  [-42, [[-74, -64], [145, 148], [171, 174]]],
  [-45, [[-75, -66], [167, 171]]],
  [-48, [[-75, -66]]],
  [-51, [[-75, -68], [-61, -58]]],
  [-54, [[-71, -65]]],
];

/** Every land sample as [lat, lon]: the dots of the backdrop. */
export function landPoints(step = 3) {
  const out = [];
  for (const [lat, spans] of LAND) {
    for (let lon = -180 + step / 2; lon < 180; lon += step) {
      for (const [a, b] of spans) {
        if (lon >= a - step / 2 && lon <= b + step / 2) { out.push([lat, lon]); break; }
      }
    }
  }
  return out;
}
