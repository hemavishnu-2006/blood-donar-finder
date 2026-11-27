# Blood Donor Finder — Full Stack Project

A learning/demo project with a browser-based donor dashboard, GPS location, nearest blood-group donor search, hospital pins, and road-route display.

## Requirements
- Node.js 18 or later
- Internet connection for OpenStreetMap tiles and the public OSRM route service

## Run in VS Code (Windows)
1. Extract the project ZIP and open the `Blood_Donor_Finder_Complete` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run `npm install` (if `node_modules` is not included or after deleting it).
4. Run `npm start`.
5. Open `http://localhost:3000` in Chrome.
6. Allow location permission when prompted.

## Project structure
- `index.html` — frontend (HTML, CSS, JavaScript, Leaflet map)
- `src/server.js` — Express backend and REST API
- `data/donors.json` — donor records saved by the backend
- `package.json` / `package-lock.json` — Node project and locked dependencies
- `start_here.txt` — quick start instructions

## API endpoints
- `GET /api/health` — backend status
- `GET /api/donors` — list donor records
- `POST /api/donors` — register a donor
- `DELETE /api/donors/:id` — delete a donor
- `GET /api/hospitals` — hospital list
- `GET /api/nearest-donor?blood=O%2B&lat=16.50&lng=80.64` — nearest matching donor with GPS coordinates

## GPS and map notes
- Browser geolocation works on `localhost` or HTTPS and requires the user to grant permission.
- A donor must have latitude and longitude to be included in nearest-donor search.
- The map uses Leaflet and OpenStreetMap; no Google Maps API key is required.
- Driving route requests use the public OSRM demo service; service availability and travel estimates are not guaranteed.
- Demo donor details are fictional. Hospital coordinates are approximate placeholders and contact information must be verified directly with each hospital.
- This is an educational prototype, not a medical compatibility checker or emergency dispatch service. A hospital/blood bank must verify donor availability and compatibility.

## Before real-world deployment
The local JSON file is for demonstration only. A production system needs authentication, donor consent, secure database storage, access controls, HTTPS, privacy safeguards, and a reliable routing/hosting service.
