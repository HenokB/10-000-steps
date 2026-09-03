# 10-000-steps

Give 10k steps a start and an end. It draws a walking route of about 10,000 steps on a free OpenStreetMap — no API key.

## What it does

1. Save home and work once.
2. Start from your location, home, work, or another address.
3. End at home, work, or somewhere else.
4. Follow the map, turn-by-turn directions, or open the walk in Google Maps.

If the straight path is short, the route wanders so it still lands near 10,000 steps. If you are already at the destination, it draws a loop back to the same spot.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Maps

- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/copyright)
- Address search: [Photon](https://photon.komoot.io/)
- Walking routes: [OSRM](https://project-osrm.org/)
- “Open in Google Maps” is a regular maps link. It does not need a developer key.

## Stride

Steps are distance ÷ stride. The default stride is 0.78 m, a typical adult walking step. Change it in Settings if yours is shorter or longer.

## Health notes

The app includes short, sourced notes on why daily walking matters, including work from *The Lancet Public Health* (Ding et al., 2025; Paluch et al., 2022).
