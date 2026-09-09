# 147704 Gartenberg — orbit explorer

An isolated static site; do not modify or link from the academic website yet. GitHub hosting only.

Full-viewport observatory view with dark ink background, restrained serif heading, gold asteroid path, fine planetary paths, readable selectable labels. Three.js camera drag, zoom, plane view; true AU distances, intentionally enlarged bodies. All eight planets. Default inner-system view with full-system preset. An Earth globe shows spin at the same simulated rate. No invented asteroid shape or rotation claim.

Time: selectable five-second Earth day and five-second Earth year; pause, reverse, timeline, date reset. One clock drives positions and spin. Actual time scaling labeled. Orbital elements from JPL Horizons at a common epoch, stored locally with raw responses. Kepler two-body propagation, explicitly described as an approximation (not navigation ephemeris). Show complete asteroid elements and source links in a drawer. Preserve original data and reference vectors for tests.

Implementation sequence:
1. Retrieve and parse NASA/JPL elements and reference vectors; source metadata and physical period citations.
2. Write failing orbital-math tests: residual, perihelion/aphelion, period closure, inclination, JPL vectors, shared-clock speed ratios. Implement math.
3. Build complete recognizable orbital scene, information panel, timeline and view controls; open local preview.
4. Finish interactions, mobile layout, keyboard handling, reduced motion and rendering error fallback.
5. Run calculation tests and production build. Publish isolated GitHub repo/site, verify live assets. Keep academic site untouched.
