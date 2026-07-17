# Geocoding reconciliation report

Generated: 2026-07-17T04:55:14.227266+00:00

## Summary

| Metric | Count |
| --- | ---: |
| Total restaurants | 271 |
| High-confidence matches | 196 |
| Medium-confidence matches | 4 |
| Low-confidence matches | 17 |
| No matches | 54 |
| Approved for markers | 196 |
| Shared-coordinate restaurants (groups) | 7 groups / 14 restaurants |
| Manually approved matches | 5 |
| Manually corrected matches | 0 |
| Overrides file entries | 0 |

## Policy notes

- One-time Nominatim batch: single thread, ≤1 request/second, application User-Agent.
- Every successful and failed query is cached in `data/geocode-query-cache.json`.
- Low-confidence matches are never auto-accepted for markers.
- Medium-confidence matches require review before approval.
- City-centroid fallbacks were cleared and treated as unmatched.
- Nominatim is not exposed as a live client-side search service.
- This batch is not the recurring production geocoding workflow.

## Shared-address pairs (canonical)

- `bom-new-york-ny, oiji-mi-new-york-ny`
- `citrin-santa-monica-ca, melisse-santa-monica-ca`
- `crown-shy-new-york-ny, saga-new-york-ny`
- `isidore-san-antonio-tx, nicosi-san-antonio-tx`
- `joji-new-york-ny, le-pavillon-new-york-ny`
- `kizaki-denver-co, margot-denver-co`
- `l-abeille-new-york-ny, muku-new-york-ny`

Restaurants at the same building intentionally share coordinates; markers receive a small visual offset at render time.

## Medium-confidence (needs review — not marker-approved)

- `meju-queens-ny` — street_match — 5-28, 49th Avenue, Hunters Point, Long Island City, Queens, Queens County, New York, 11101, United States
- `plumed-horse-saratoga-ca` — street_match — Big Basin Way, Saratoga, Santa Clara County, California, 95070, United States
- `saison-san-francisco-ca` — street_match — Townsend Street, Mission Bay, San Francisco, California, 94107, United States
- `selby-s-atherton-ca` — street_match — El Camino Real, Atherton, San Mateo County, California, 94061, United States

## Unmatched / no approved coordinates

Count: 75

- `addison-san-diego-ca` — confidence=none — status=unmatched — no_match
- `aska-brooklyn-ny` — confidence=low — status=unmatched — city_level
- `aubergine-carmel-by-the-sea-ca` — confidence=none — status=unmatched — no_match
- `bacchanalia-atlanta-ga` — confidence=none — status=unmatched — no_match
- `bar-miller-new-york-ny` — confidence=low — status=unmatched — city_level
- `barley-swine-austin-tx` — confidence=none — status=unmatched — no_match
- `boia-de-miami-fl` — confidence=none — status=rejected — rejected_wrong_place
- `caruso-s-montecito-ca` — confidence=none — status=unmatched — no_match
- `chef-s-counter-at-maass-fort-lauderdale-fl` — confidence=none — status=unmatched — no_match
- `chez-noir-carmel-by-the-sea-ca` — confidence=none — status=unmatched — no_match
- `corridor-109-los-angeles-ca` — confidence=none — status=unmatched — no_match
- `cote-miami-miami-fl` — confidence=none — status=unmatched — no_match
- `counter-charlotte-nc` — confidence=none — status=unmatched — no_match
- `craft-omakase-austin-tx` — confidence=none — status=unmatched — no_match
- `cyrus-geyserville-ca` — confidence=none — status=rejected — rejected_wrong_place
- `elcielo-miami-miami-fl` — confidence=low — status=unmatched — city_level
- `elske-chicago-il` — confidence=none — status=unmatched — no_match
- `emelina-west-palm-beach-fl` — confidence=none — status=unmatched — no_match
- `frevo-new-york-ny` — confidence=low — status=unmatched — city_level
- `hayato-los-angeles-ca` — confidence=none — status=unmatched — no_match
- `hestia-austin-tx` — confidence=low — status=unmatched — city_level
- `hiden-miami-fl` — confidence=none — status=rejected — rejected_wrong_place
- `interstellar-bbq-austin-tx` — confidence=none — status=unmatched — no_match
- `joo-ok-new-york-ny` — confidence=none — status=unmatched — no_match
- `kato-los-angeles-ca` — confidence=none — status=unmatched — no_match
- `kochi-new-york-ny` — confidence=none — status=rejected — rejected_wrong_place
- `kojima-los-angeles-ca` — confidence=none — status=unmatched — no_match
- `l-atelier-de-joel-robuchon-miami-miami-fl` — confidence=none — status=rejected — rejected_wrong_place
- `le-coucou-new-york-ny` — confidence=none — status=unmatched — no_match
- `le-jardinier-miami-miami-fl` — confidence=none — status=unmatched — no_match
- `lucien-la-jolla-ca` — confidence=none — status=unmatched — no_match
- `mamani-dallas-tx` — confidence=none — status=unmatched — no_match
- `mari-new-york-ny` — confidence=none — status=rejected — rejected_wrong_place
- `masa-new-york-ny` — confidence=none — status=unmatched — no_match
- `meju-queens-ny` — confidence=medium — status=needs_review — street_match
- `minibar-by-jose-andres-washington-dc` — confidence=low — status=unmatched — city_level
- `mita-washington-dc` — confidence=low — status=unmatched — city_level
- `mixtli-san-antonio-tx` — confidence=none — status=unmatched — no_match
- `mujo-atlanta-ga` — confidence=none — status=unmatched — no_match
- `musaafer-houston-tx` — confidence=none — status=unmatched — no_match
- `mutra-north-miami-fl` — confidence=none — status=unmatched — no_match
- `nari-san-francisco-ca` — confidence=none — status=unmatched — no_match
- `noksu-new-york-ny` — confidence=none — status=unmatched — no_match
- `o-by-brush-atlanta-ga` — confidence=none — status=unmatched — no_match
- `ogawa-miami-fl` — confidence=none — status=unmatched — no_match
- `omakase-at-barracks-row-washington-dc` — confidence=low — status=unmatched — city_level
- `omakase-table-atlanta-ga` — confidence=none — status=unmatched — no_match
- `orsa-and-winston-los-angeles-ca` — confidence=low — status=unmatched — city_level
- `pasta-bar-encino-ca` — confidence=none — status=unmatched — no_match
- `pineapple-and-pearls-washington-dc` — confidence=low — status=unmatched — city_level
- `plumed-horse-saratoga-ca` — confidence=medium — status=needs_review — street_match
- `provenance-philadelphia-pa` — confidence=low — status=unmatched — city_level
- `r-o-rebel-omakase-laguna-beach-ca` — confidence=none — status=unmatched — no_match
- `restaurant-yuu-brooklyn-ny` — confidence=none — status=unmatched — no_match
- `rose-s-luxury-washington-dc` — confidence=low — status=unmatched — city_level
- `saison-san-francisco-ca` — confidence=medium — status=needs_review — street_match
- `selby-s-atherton-ca` — confidence=medium — status=needs_review — street_match
- `seline-santa-monica-ca` — confidence=none — status=unmatched — no_match
- `shin-sushi-encino-ca` — confidence=none — status=unmatched — no_match
- `shmone-new-york-ny` — confidence=low — status=unmatched — city_level
- `shota-omakase-brooklyn-ny` — confidence=low — status=unmatched — city_level
- `six-test-kitchen-paso-robles-ca` — confidence=none — status=unmatched — no_match
- `smyth-chicago-il` — confidence=low — status=unmatched — city_level
- `sun-moon-studio-oakland-ca` — confidence=none — status=unmatched — no_match
- `sushi-kaneyoshi-los-angeles-ca` — confidence=low — status=unmatched — city_level
- `tambourine-room-by-tristan-brandt-miami-beach-fl` — confidence=none — status=unmatched — no_match
- `tatemo-houston-tx` — confidence=none — status=unmatched — no_match
- `tatsu-dallas-dallas-tx` — confidence=none — status=unmatched — no_match
- `the-catbird-seat-nashville-tn` — confidence=none — status=unmatched — no_match
- `the-inn-at-little-washington-washington-dc` — confidence=none — status=unmatched — no_match
- `the-kitchen-sacramento-ca` — confidence=none — status=unmatched — no_match
- `the-restaurant-at-justin-paso-robles-ca` — confidence=none — status=unmatched — no_match
- `the-surf-club-restaurant-surfside-fl` — confidence=none — status=unmatched — no_match
- `tuome-new-york-ny` — confidence=low — status=unmatched — city_level
- `victoria-and-albert-s-orlando-fl` — confidence=none — status=unmatched — no_match

## Full slug inventory

Every restaurant slug appears below with its geocoding status.

| Slug | Confidence | Approved | Review status | Match type | Lat | Lng |
| --- | --- | --- | --- | --- | --- | --- |
| `311-omakase-boston-ma` | high | yes | auto_approved | address_match | 42.343143 | -71.073644 |
| `63-clinton-new-york-ny` | high | yes | auto_approved | address_match | 40.719504 | -73.985132 |
| `7-adams-san-francisco-ca` | high | yes | auto_approved | address_match | 37.786082 | -122.432639 |
| `acquerello-san-francisco-ca` | high | yes | auto_approved | address_match | 37.791695 | -122.421525 |
| `addison-san-diego-ca` | none | no | unmatched | no_match |  |  |
| `albi-washington-dc` | high | yes | auto_approved | address_match | 38.874302 | -76.999798 |
| `alinea-chicago-il` | high | yes | auto_approved | address_match | 41.913437 | -87.648199 |
| `alma-fonda-fina-denver-co` | high | yes | auto_approved | address_match | 39.758103 | -105.011658 |
| `angler-sf-san-francisco-ca` | high | yes | auto_approved | address_match | 37.793083 | -122.392177 |
| `aquavit-new-york-ny` | high | yes | auto_approved | address_match | 40.760782 | -73.972185 |
| `ariete-miami-fl` | high | yes | auto_approved | address_match | 25.725139 | -80.245432 |
| `aska-brooklyn-ny` | low | no | unmatched | city_level |  |  |
| `atelier-crenn-san-francisco-ca` | high | yes | auto_approved | address_match | 37.798322 | -122.435844 |
| `atera-new-york-ny` | high | yes | auto_approved | address_match | 40.716937 | -74.005698 |
| `atlas-atlanta-ga` | high | yes | manually_approved | address_match | 33.839802 | -84.382416 |
| `atomix-new-york-ny` | high | yes | auto_approved | address_match | 40.744222 | -73.982846 |
| `auberge-du-soleil-rutherford-ca` | high | yes | auto_approved | address_match | 38.493420 | -122.406205 |
| `aubergine-carmel-by-the-sea-ca` | none | no | unmatched | no_match |  |  |
| `auro-calistoga-ca` | high | yes | manually_approved | address_match | 38.584793 | -122.567908 |
| `bacchanalia-atlanta-ga` | none | no | unmatched | no_match |  |  |
| `bar-miller-new-york-ny` | low | no | unmatched | city_level |  |  |
| `barley-swine-austin-tx` | none | no | unmatched | no_match |  |  |
| `bastion-nashville-tn` | high | yes | auto_approved | address_match | 36.143206 | -86.767071 |
| `bcn-taste-and-tradition-houston-tx` | high | yes | auto_approved | address_match | 29.734892 | -95.390090 |
| `beckon-denver-co` | high | yes | auto_approved | address_match | 39.761188 | -104.982392 |
| `bell-s-los-alamos-ca` | high | yes | auto_approved | address_match | 34.743901 | -120.279366 |
| `benu-san-francisco-ca` | high | yes | auto_approved | address_match | 37.785462 | -122.399080 |
| `birdsong-san-francisco-ca` | high | yes | auto_approved | address_match | 37.779377 | -122.410340 |
| `blue-hill-at-stone-barns-tarrytown-ny` | high | yes | auto_approved | address_match | 41.103213 | -73.824463 |
| `boia-de-miami-fl` | none | no | rejected | rejected_wrong_place |  |  |
| `boka-chicago-il` | high | yes | auto_approved | address_match | 41.913639 | -87.648202 |
| `bom-new-york-ny` | high | yes | auto_approved | address_match | 40.739666 | -73.992493 |
| `bosq-aspen-co` | high | yes | auto_approved | address_match | 39.188501 | -106.819736 |
| `bresca-washington-dc` | high | yes | auto_approved | address_match | 38.915757 | -77.032187 |
| `bridges-new-york-ny` | high | yes | auto_approved | address_match | 40.714048 | -73.998086 |
| `brut-denver-co` | high | yes | auto_approved | address_match | 39.752793 | -104.996791 |
| `cafe-boulud-new-york-ny` | high | yes | auto_approved | address_match | 40.765401 | -73.968169 |
| `californios-san-francisco-ca` | high | yes | auto_approved | address_match | 37.771282 | -122.413053 |
| `camille-orlando-fl` | high | yes | auto_approved | address_match | 28.568376 | -81.326095 |
| `carino-chicago-il` | high | yes | auto_approved | address_match | 41.967046 | -87.658648 |
| `caruso-s-montecito-ca` | none | no | unmatched | no_match |  |  |
| `casa-mono-new-york-ny` | high | yes | auto_approved | address_match | 40.735926 | -73.987166 |
| `causa-washington-dc` | high | yes | auto_approved | address_match | 38.906553 | -77.024751 |
| `cesar-new-york-ny` | high | yes | auto_approved | address_match | 40.727120 | -74.007536 |
| `chef-s-counter-at-maass-fort-lauderdale-fl` | none | no | unmatched | no_match |  |  |
| `chef-s-table-at-brooklyn-fare-new-york-ny` | high | yes | auto_approved | address_match | 40.756078 | -73.996449 |
| `chez-noir-carmel-by-the-sea-ca` | none | no | unmatched | no_match |  |  |
| `citrin-santa-monica-ca` | high | yes | auto_approved | address_match | 34.024423 | -118.491327 |
| `commis-oakland-ca` | high | yes | auto_approved | address_match | 37.824689 | -122.254890 |
| `corima-new-york-ny` | high | yes | auto_approved | address_match | 40.714683 | -73.993127 |
| `corkscrew-bbq-spring-tx` | high | yes | auto_approved | address_match | 30.080676 | -95.420013 |
| `corridor-109-los-angeles-ca` | none | no | unmatched | no_match |  |  |
| `cote-miami-miami-fl` | none | no | unmatched | no_match |  |  |
| `cote-new-york-ny` | high | yes | auto_approved | address_match | 40.741046 | -73.991420 |
| `counter-charlotte-nc` | none | no | unmatched | no_match |  |  |
| `craft-omakase-austin-tx` | none | no | unmatched | no_match |  |  |
| `crown-shy-new-york-ny` | high | yes | auto_approved | address_match | 40.706473 | -74.007741 |
| `cyrus-geyserville-ca` | none | no | rejected | rejected_wrong_place |  |  |
| `daniel-new-york-ny` | high | yes | auto_approved | address_match | 40.766778 | -73.967571 |
| `dirt-candy-new-york-ny` | high | yes | auto_approved | address_match | 40.717878 | -73.990789 |
| `ebbe-tampa-fl` | high | yes | auto_approved | address_match | 27.953619 | -82.460429 |
| `el-ideas-chicago-il` | high | yes | auto_approved | address_match | 41.862484 | -87.686895 |
| `elcielo-miami-miami-fl` | low | no | unmatched | city_level |  |  |
| `elcielo-washington-dc-washington-dc` | high | yes | auto_approved | address_match | 38.908866 | -76.999742 |
| `eleven-madison-park-new-york-ny` | high | yes | auto_approved | address_match | 40.741598 | -73.987190 |
| `elske-chicago-il` | none | no | unmatched | no_match |  |  |
| `emelina-west-palm-beach-fl` | none | no | unmatched | no_match |  |  |
| `emeril-s-new-orleans-la` | high | yes | auto_approved | address_match | 29.944639 | -90.067349 |
| `enclos-sonoma-ca` | high | yes | auto_approved | address_match | 38.291621 | -122.455809 |
| `esme-chicago-il` | high | yes | auto_approved | address_match | 41.922972 | -87.639006 |
| `essential-by-christophe-new-york-ny` | high | yes | auto_approved | address_match | 40.780940 | -73.976620 |
| `estela-new-york-ny` | high | yes | auto_approved | address_match | 40.724635 | -73.994767 |
| `ever-chicago-il` | high | yes | auto_approved | address_match | 41.886845 | -87.660486 |
| `family-meal-at-blue-hill-new-york-ny` | high | yes | auto_approved | address_match | 40.732040 | -73.999570 |
| `feld-chicago-il` | high | yes | auto_approved | address_match | 41.896082 | -87.677846 |
| `fiola-washington-dc` | high | yes | auto_approved | address_match | 38.893299 | -77.020501 |
| `francie-brooklyn-ny` | high | yes | auto_approved | address_match | 40.710234 | -73.964052 |
| `frasca-food-and-wine-boulder-co` | high | yes | auto_approved | address_match | 40.019300 | -105.272454 |
| `frevo-new-york-ny` | low | no | unmatched | city_level |  |  |
| `friday-saturday-sunday-philadelphia-pa` | high | yes | auto_approved | address_match | 39.948931 | -75.175932 |
| `gabriel-kreuther-new-york-ny` | high | yes | auto_approved | address_match | 40.754120 | -73.982180 |
| `galit-chicago-il` | high | yes | auto_approved | address_match | 41.926284 | -87.649531 |
| `gramercy-tavern-new-york-ny` | high | yes | auto_approved | address_match | 40.738389 | -73.988414 |
| `gravitas-washington-dc` | high | yes | auto_approved | address_match | 38.914503 | -76.984317 |
| `harbor-house-inn-elk-ca` | high | yes | auto_approved | address_match | 39.135738 | -123.719651 |
| `hayakawa-atlanta-ga` | high | yes | auto_approved | address_match | 33.783342 | -84.411423 |
| `hayato-los-angeles-ca` | none | no | unmatched | no_match |  |  |
| `her-place-supper-club-philadelphia-pa` | high | yes | auto_approved | address_match | 39.950770 | -75.170171 |
| `heritage-long-beach-ca` | high | yes | auto_approved | address_match | 33.775260 | -118.167139 |
| `hestia-austin-tx` | low | no | unmatched | city_level |  |  |
| `hiden-miami-fl` | none | no | rejected | rejected_wrong_place |  |  |
| `hilda-and-jesse-san-francisco-ca` | high | yes | auto_approved | address_match | 37.800075 | -122.411038 |
| `holbox-los-angeles-ca` | high | yes | auto_approved | address_match | 34.017354 | -118.278387 |
| `huso-new-york-ny` | high | yes | auto_approved | address_match | 40.717328 | -74.010532 |
| `icca-new-york-ny` | high | yes | auto_approved | address_match | 40.714303 | -74.007680 |
| `imperfecto-the-chef-s-table-washington-dc` | high | yes | auto_approved | address_match | 38.904339 | -77.050322 |
| `indienne-chicago-il` | high | yes | auto_approved | address_match | 41.894559 | -87.635104 |
| `interstellar-bbq-austin-tx` | none | no | unmatched | no_match |  |  |
| `isidore-san-antonio-tx` | high | yes | auto_approved | address_match | 29.440723 | -98.481350 |
| `jean-georges-new-york-ny` | high | yes | manually_approved | address_match | 40.769147 | -73.981540 |
| `jeju-noodle-bar-new-york-ny` | high | yes | auto_approved | address_match | 40.733037 | -74.007343 |
| `jeune-et-jolie-carlsbad-ca` | high | yes | auto_approved | address_match | 33.162904 | -117.351772 |
| `joji-new-york-ny` | high | yes | auto_approved | address_match | 40.752974 | -73.978540 |
| `jont-washington-dc` | high | yes | auto_approved | address_match | 38.915797 | -77.032057 |
| `joo-ok-new-york-ny` | none | no | unmatched | no_match |  |  |
| `jua-new-york-ny` | high | yes | auto_approved | address_match | 40.739699 | -73.987821 |
| `jungsik-new-york-new-york-ny` | high | yes | auto_approved | address_match | 40.718790 | -74.009476 |
| `kadence-orlando-fl` | high | yes | auto_approved | address_match | 28.569036 | -81.346000 |
| `kali-los-angeles-ca` | high | yes | auto_approved | address_match | 34.083411 | -118.324605 |
| `kasama-chicago-il` | high | yes | auto_approved | address_match | 41.899692 | -87.675655 |
| `kato-los-angeles-ca` | none | no | unmatched | no_match |  |  |
| `kiln-san-francisco-ca` | high | yes | auto_approved | address_match | 37.776008 | -122.420382 |
| `kin-khao-san-francisco-ca` | high | yes | manually_approved | address_match | 37.784878 | -122.408856 |
| `kizaki-denver-co` | high | yes | auto_approved | address_match | 39.688393 | -104.980613 |
| `kochi-new-york-ny` | none | no | rejected | rejected_wrong_place |  |  |
| `kojima-los-angeles-ca` | none | no | unmatched | no_match |  |  |
| `kosaka-new-york-ny` | high | yes | auto_approved | address_match | 40.738193 | -74.001486 |
| `kosen-tampa-fl` | high | yes | auto_approved | address_match | 27.962384 | -82.464405 |
| `koya-tampa-fl` | high | yes | auto_approved | address_match | 27.941802 | -82.467808 |
| `l-abeille-new-york-ny` | high | yes | auto_approved | address_match | 40.721825 | -74.009947 |
| `l-atelier-de-joel-robuchon-miami-miami-fl` | none | no | rejected | rejected_wrong_place |  |  |
| `la-barbecue-austin-tx` | high | yes | auto_approved | address_match | 30.254498 | -97.717615 |
| `la-bastide-by-andrea-calstier-north-salem-ny` | high | yes | auto_approved | address_match | 41.337020 | -73.563382 |
| `lazy-bear-san-francisco-ca` | high | yes | auto_approved | address_match | 37.760351 | -122.419703 |
| `lazy-betty-atlanta-ga` | high | yes | auto_approved | address_match | 33.780900 | -84.382998 |
| `le-bernardin-new-york-ny` | high | yes | auto_approved | address_match | 40.761395 | -73.981691 |
| `le-coucou-new-york-ny` | none | no | unmatched | no_match |  |  |
| `le-jardinier-houston-houston-tx` | high | yes | auto_approved | address_match | 29.726546 | -95.389754 |
| `le-jardinier-miami-miami-fl` | none | no | unmatched | no_match |  |  |
| `le-pavillon-new-york-ny` | high | yes | auto_approved | address_match | 40.752974 | -73.978540 |
| `leroy-and-lewis-barbecue-austin-tx` | high | yes | auto_approved | address_match | 30.210317 | -97.787214 |
| `lielle-los-angeles-ca` | high | yes | auto_approved | address_match | 34.055264 | -118.397711 |
| `lilo-carlsbad-ca` | high | yes | auto_approved | address_match | 33.164383 | -117.351481 |
| `little-pearl-washington-dc` | high | yes | auto_approved | address_match | 38.883017 | -76.993135 |
| `localis-sacramento-ca` | high | yes | auto_approved | address_match | 38.566732 | -121.483697 |
| `locust-nashville-tn` | high | yes | auto_approved | address_match | 36.127453 | -86.789250 |
| `los-felix-miami-fl` | high | yes | auto_approved | address_match | 25.727207 | -80.243080 |
| `lucien-la-jolla-ca` | none | no | unmatched | no_match |  |  |
| `madcap-san-anselmo-ca` | high | yes | auto_approved | address_match | 37.974152 | -122.561743 |
| `mako-chicago-il` | high | yes | auto_approved | address_match | 41.885500 | -87.646881 |
| `malagon-mercado-y-taperia-charleston-sc` | high | yes | auto_approved | address_match | 32.792703 | -79.941691 |
| `mamani-dallas-tx` | none | no | unmatched | no_match |  |  |
| `march-houston-tx` | high | yes | auto_approved | address_match | 29.742874 | -95.400163 |
| `margot-denver-co` | high | yes | auto_approved | address_match | 39.688393 | -104.980613 |
| `mari-new-york-ny` | none | no | rejected | rejected_wrong_place |  |  |
| `masa-new-york-ny` | none | no | unmatched | no_match |  |  |
| `masseria-washington-dc` | high | yes | auto_approved | address_match | 38.909717 | -76.999234 |
| `meju-queens-ny` | medium | no | needs_review | street_match | 40.743577 | -73.955214 |
| `melisse-santa-monica-ca` | high | yes | auto_approved | address_match | 34.024423 | -118.491327 |
| `meteora-los-angeles-ca` | high | yes | auto_approved | address_match | 34.083534 | -118.339822 |
| `mezcaleria-alma-denver-co` | high | yes | auto_approved | address_match | 39.757797 | -105.011175 |
| `minibar-by-jose-andres-washington-dc` | low | no | unmatched | city_level |  |  |
| `mister-jiu-s-san-francisco-ca` | high | yes | auto_approved | address_match | 37.793672 | -122.406576 |
| `mita-washington-dc` | low | no | unmatched | city_level |  |  |
| `miura-beverly-hills-ca` | high | yes | auto_approved | address_match | 34.067416 | -118.400586 |
| `mixtli-san-antonio-tx` | none | no | unmatched | no_match |  |  |
| `moody-tongue-chicago-il` | high | yes | auto_approved | address_match | 41.846932 | -87.624879 |
| `mori-nozomi-los-angeles-ca` | high | yes | auto_approved | address_match | 34.033600 | -118.441768 |
| `mujo-atlanta-ga` | none | no | unmatched | no_match |  |  |
| `muku-new-york-ny` | high | yes | auto_approved | address_match | 40.721825 | -74.009947 |
| `musaafer-houston-tx` | none | no | unmatched | no_match |  |  |
| `mutra-north-miami-fl` | none | no | unmatched | no_match |  |  |
| `n-naka-los-angeles-ca` | high | yes | auto_approved | address_match | 34.025127 | -118.412212 |
| `nari-san-francisco-ca` | none | no | unmatched | no_match |  |  |
| `next-chicago-il` | high | yes | auto_approved | address_match | 41.886595 | -87.652007 |
| `nicosi-san-antonio-tx` | high | yes | auto_approved | address_match | 29.440723 | -98.481350 |
| `niku-steakhouse-san-francisco-ca` | high | yes | auto_approved | address_match | 37.769607 | -122.404099 |
| `nisei-san-francisco-ca` | high | yes | auto_approved | address_match | 37.798161 | -122.422004 |
| `noda-new-york-ny` | high | yes | auto_approved | address_match | 40.740815 | -73.993098 |
| `noksu-new-york-ny` | none | no | unmatched | no_match |  |  |
| `noz-17-new-york-ny` | high | yes | auto_approved | address_match | 40.743863 | -74.006577 |
| `nozawa-bar-beverly-hills-ca` | high | yes | auto_approved | address_match | 34.068130 | -118.398268 |
| `o-by-brush-atlanta-ga` | none | no | unmatched | no_match |  |  |
| `odo-new-york-ny` | high | yes | auto_approved | address_match | 40.740332 | -73.992193 |
| `ogawa-miami-fl` | none | no | unmatched | no_match |  |  |
| `oiji-mi-new-york-ny` | high | yes | auto_approved | address_match | 40.739666 | -73.992493 |
| `olamaie-austin-tx` | high | yes | auto_approved | address_match | 30.279902 | -97.743697 |
| `omakase-at-barracks-row-washington-dc` | low | no | unmatched | city_level |  |  |
| `omakase-table-atlanta-ga` | none | no | unmatched | no_match |  |  |
| `omo-by-jont-winter-park-fl` | high | yes | auto_approved | address_match | 28.595104 | -81.350548 |
| `oriole-chicago-il` | high | yes | auto_approved | address_match | 41.886118 | -87.645137 |
| `orsa-and-winston-los-angeles-ca` | low | no | unmatched | city_level |  |  |
| `osteria-mozza-los-angeles-ca` | high | yes | auto_approved | address_match | 34.083374 | -118.338747 |
| `oxomoco-brooklyn-ny` | high | yes | auto_approved | address_match | 40.729770 | -73.955460 |
| `oyster-oyster-washington-dc` | high | yes | auto_approved | address_match | 38.909352 | -77.023093 |
| `pasta-bar-encino-ca` | none | no | unmatched | no_match |  |  |
| `per-se-new-york-ny` | high | yes | auto_approved | address_match | 40.768255 | -73.982852 |
| `pineapple-and-pearls-washington-dc` | low | no | unmatched | city_level |  |  |
| `plumed-horse-saratoga-ca` | medium | no | needs_review | street_match | 37.259308 | -122.031933 |
| `press-saint-helena-ca` | high | yes | auto_approved | address_match | 38.499570 | -122.462482 |
| `protege-palo-alto-ca` | high | yes | auto_approved | address_match | 37.428012 | -122.143564 |
| `provenance-philadelphia-pa` | low | no | unmatched | city_level |  |  |
| `providence-los-angeles-ca` | high | yes | auto_approved | address_match | 34.083625 | -118.330187 |
| `quince-san-francisco-ca` | high | yes | auto_approved | address_match | 37.797432 | -122.403269 |
| `r-o-rebel-omakase-laguna-beach-ca` | none | no | unmatched | no_match |  |  |
| `rania-washington-dc` | high | yes | auto_approved | address_match | 38.895164 | -77.026941 |
| `restaurant-ki-los-angeles-ca` | high | yes | auto_approved | address_match | 34.050066 | -118.241391 |
| `restaurant-naides-san-francisco-ca` | high | yes | auto_approved | address_match | 37.790230 | -122.409129 |
| `restaurant-yuu-brooklyn-ny` | none | no | unmatched | no_match |  |  |
| `rezdora-new-york-ny` | high | yes | auto_approved | address_match | 40.739094 | -73.989369 |
| `rocca-tampa-fl` | high | yes | auto_approved | address_match | 27.962217 | -82.464926 |
| `rooster-and-owl-washington-dc` | high | yes | auto_approved | address_match | 38.921490 | -77.032167 |
| `rose-s-luxury-washington-dc` | low | no | unmatched | city_level |  |  |
| `saga-new-york-ny` | high | yes | auto_approved | address_match | 40.706473 | -74.007741 |
| `saint-germain-new-orleans-la` | high | yes | auto_approved | address_match | 29.967557 | -90.044695 |
| `saison-san-francisco-ca` | medium | no | needs_review | street_match | 37.774506 | -122.398307 |
| `san-ho-won-san-francisco-ca` | high | yes | auto_approved | address_match | 37.759577 | -122.410210 |
| `schwa-chicago-il` | high | yes | auto_approved | address_match | 41.908941 | -87.667950 |
| `scoundrel-greenville-sc` | high | yes | auto_approved | address_match | 34.851235 | -82.398504 |
| `selby-s-atherton-ca` | medium | no | needs_review | street_match | 37.469594 | -122.212484 |
| `seline-santa-monica-ca` | none | no | unmatched | no_match |  |  |
| `semma-new-york-ny` | high | yes | auto_approved | address_match | 40.736072 | -74.000689 |
| `sepia-chicago-il` | high | yes | auto_approved | address_match | 41.883943 | -87.642517 |
| `shin-sushi-encino-ca` | none | no | unmatched | no_match |  |  |
| `shingo-coral-gables-fl` | high | yes | auto_approved | address_match | 25.752878 | -80.257321 |
| `shmone-new-york-ny` | low | no | unmatched | city_level |  |  |
| `shota-omakase-brooklyn-ny` | low | no | unmatched | city_level |  |  |
| `silvers-omakase-santa-barbara-ca` | high | yes | auto_approved | address_match | 34.415204 | -119.691757 |
| `singlethread-healdsburg-ca` | high | yes | auto_approved | address_match | 38.612338 | -122.869692 |
| `six-test-kitchen-paso-robles-ca` | none | no | unmatched | no_match |  |  |
| `smyth-chicago-il` | low | no | unmatched | city_level |  |  |
| `soichi-san-diego-ca` | high | yes | auto_approved | address_match | 32.762674 | -117.141802 |
| `somni-west-hollywood-ca` | high | yes | auto_approved | address_match | 34.082364 | -118.388515 |
| `sons-and-daughters-san-francisco-ca` | high | yes | auto_approved | address_match | 37.761668 | -122.410753 |
| `sorekara-orlando-fl` | high | yes | auto_approved | address_match | 28.568544 | -81.326179 |
| `sorrel-san-francisco-ca` | high | yes | auto_approved | address_match | 37.788586 | -122.446202 |
| `soseki-winter-park-fl` | high | yes | auto_approved | address_match | 28.593214 | -81.361758 |
| `spring-marietta-ga` | high | yes | auto_approved | address_match | 33.953604 | -84.550936 |
| `ssal-san-francisco-ca` | high | yes | auto_approved | address_match | 37.797323 | -122.421932 |
| `state-bird-provisions-san-francisco-ca` | high | yes | auto_approved | address_match | 37.783706 | -122.432948 |
| `stubborn-seed-miami-beach-fl` | high | yes | auto_approved | address_match | 25.770132 | -80.134892 |
| `sun-moon-studio-oakland-ca` | none | no | unmatched | no_match |  |  |
| `sushi-inaba-torrance-ca` | high | yes | auto_approved | address_match | 33.840190 | -118.353509 |
| `sushi-kaneyoshi-los-angeles-ca` | low | no | unmatched | city_level |  |  |
| `sushi-nakazawa-new-york-new-york-ny` | high | yes | auto_approved | address_match | 40.731742 | -74.004534 |
| `sushi-nakazawa-washington-dc-washington-dc` | high | yes | manually_approved | address_match | 38.894118 | -77.027563 |
| `sushi-noz-new-york-ny` | high | yes | auto_approved | address_match | 40.773871 | -73.958118 |
| `sushi-sho-new-york-ny` | high | yes | auto_approved | address_match | 40.752273 | -73.979858 |
| `tambourine-room-by-tristan-brandt-miami-beach-fl` | none | no | unmatched | no_match |  |  |
| `tatemo-houston-tx` | none | no | unmatched | no_match |  |  |
| `tatsu-dallas-dallas-tx` | none | no | unmatched | no_match |  |  |
| `tempura-matsui-new-york-ny` | high | yes | auto_approved | address_match | 40.748150 | -73.974826 |
| `the-catbird-seat-nashville-tn` | none | no | unmatched | no_match |  |  |
| `the-dabney-washington-dc` | high | yes | auto_approved | address_match | 38.906378 | -77.024570 |
| `the-four-horsemen-brooklyn-ny` | high | yes | auto_approved | address_match | 40.713159 | -73.957244 |
| `the-french-laundry-yountville-ca` | high | yes | auto_approved | address_match | 38.404416 | -122.365039 |
| `the-inn-at-little-washington-washington-dc` | none | no | unmatched | no_match |  |  |
| `the-kitchen-sacramento-ca` | none | no | unmatched | no_match |  |  |
| `the-modern-new-york-ny` | high | yes | auto_approved | address_match | 40.761189 | -73.977009 |
| `the-progress-san-francisco-ca` | high | yes | auto_approved | address_match | 37.783663 | -122.433080 |
| `the-restaurant-at-justin-paso-robles-ca` | none | no | unmatched | no_match |  |  |
| `the-surf-club-restaurant-surfside-fl` | none | no | unmatched | no_match |  |  |
| `the-village-pub-woodside-ca` | high | yes | auto_approved | address_match | 37.428952 | -122.251458 |
| `the-wolf-s-tailor-denver-co` | high | yes | auto_approved | address_match | 39.772796 | -105.010986 |
| `topolobampo-chicago-il` | high | yes | auto_approved | address_match | 41.890537 | -87.630921 |
| `torien-new-york-ny` | high | yes | auto_approved | address_match | 40.724756 | -73.993121 |
| `torrisi-new-york-ny` | high | yes | auto_approved | address_match | 40.724217 | -73.995400 |
| `troubadour-healdsburg-ca` | high | yes | auto_approved | address_match | 38.611626 | -122.871004 |
| `tsukimi-new-york-ny` | high | yes | auto_approved | address_match | 40.727827 | -73.982613 |
| `tuome-new-york-ny` | low | no | unmatched | city_level |  |  |
| `vern-s-charleston-sc` | high | yes | auto_approved | address_match | 32.792384 | -79.945662 |
| `vespertine-culver-city-ca` | high | yes | auto_approved | address_match | 34.024204 | -118.381772 |
| `victoria-and-albert-s-orlando-fl` | none | no | unmatched | no_match |  |  |
| `wakuriya-san-mateo-ca` | high | yes | auto_approved | address_match | 37.521337 | -122.336800 |
| `wild-common-charleston-sc` | high | yes | auto_approved | address_match | 32.790500 | -79.946059 |
| `wolfsbane-san-francisco-ca` | high | yes | auto_approved | address_match | 37.758087 | -122.388511 |
| `xiquet-washington-dc` | high | yes | auto_approved | address_match | 38.921278 | -77.072418 |
| `yamada-new-york-ny` | high | yes | auto_approved | address_match | 40.715853 | -73.997291 |
| `yingtao-new-york-ny` | high | yes | auto_approved | address_match | 40.765629 | -73.987507 |
| `yoshino-new-york-ny` | high | yes | auto_approved | address_match | 40.726235 | -73.992185 |
| `zasu-new-orleans-la` | high | yes | auto_approved | address_match | 29.975088 | -90.099739 |

