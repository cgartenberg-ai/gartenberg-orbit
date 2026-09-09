# 147704 Gartenberg — An orbital observatory

Independent interactive solar system illustration, intentionally separate from Claudine Gartenberg's academic website.

## Run

`npm install`, then `npm run dev`. Build static output with `npm run build`. Tests: `npm test`.

## Data and model

All nine bodies use NASA/JPL Horizons heliocentric osculating elements at JD 2461292.5 (2026-09-09 00:00 TDB), ecliptic J2000. The full raw responses, including physical data and independent vectors, are in `public/data/raw/`. `scripts/fetch-data.py` reproduces retrieval. The SBDB response includes the naming citation and published physical parameters.

The model solves Kepler's equation and rotates the resulting ellipse into the J2000 frame. Tests check all epoch positions against independently fetched JPL vectors, Kepler residuals, period closure, plane tilt, and shared time scaling. This is a fixed-element two-body illustration, not an N-body integration or precision ephemeris. It loops over twenty years; accuracy diverges from a full ephemeris as perturbations accumulate.

The five-second day preset uses Earth's sidereal day. Year presets use the same model's osculating Earth orbital period so one modeled orbit takes exactly the displayed time. Planets rotate with relative sidereal rates from the physical headers in Horizons. Rotation phase/axis longitude is illustrative. Gartenberg is an enlarged point, not a fabricated shape or spin.

AU distances are linear and shared. Visible planet sizes are exaggerated and adaptive for legibility. Stars are decorative, not catalogued. No main-site files are modified by this project.

## Interaction

Drag/pinch/scroll to rotate and zoom; view presets frame the inner or whole system. Click a body label to inspect, and Follow to keep it centered. All controls are keyboard accessible. Space toggles playback outside form controls. Reduced-motion users start paused. Data and story dialogs pause time while open. All data and texture assets are bundled locally.

Earth texture: NASA Blue Marble, land surface/ocean/ice, https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.png (public NASA imagery).
