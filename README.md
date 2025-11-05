# TravelHub (MERN-Stack based Hotels Booking App)

TravelHub is a small listings-and-reviews application built with Node.js, Express and MongoDB. It provides a simple marketplace-style interface to browse, create, edit, and review travel listings (hotels/resorts/etc.). The app uses server-rendered EJS templates and integrates image uploads (Cloudinary), authentication, and location geocoding.

## User-facing features

- Browse listings
  - View all listings on an index page with thumbnail, location and price.
  - Click into a listing's detail page to see full description, images, reviews and location.

- Create and manage listings (authenticated users)
  - Registered users can create new listings with title, description, location, country, price and an uploaded image.
  - Images are uploaded via a file input and stored using Cloudinary (via multer + cloud storage adapter).
  - When creating a listing the app attempts to geocode the supplied location (via OpenStreetMap/Nominatim) and saves GeoJSON coordinates on the listing for future mapping use.
  - Owners can edit or delete their own listings.

- Reviews
  - Logged-in users can add reviews (rating + comment) to any listing.
  - Review ratings are validated and displayed on listing pages.
  - Authors can delete their own reviews.

- Auth & sessions
  - Local username/password registration and login via passport-local + passport-local-mongoose.
  - Session-backed flash messages for user feedback (success/error).

## Technical overview

- Runtime / frameworks
  - Node.js (server), Express (web framework)
  - EJS templating with `ejs-mate` for layout support
  - Bootstrap 5 for front-end components and client-side validation helpers

- Database
  - MongoDB via Mongoose ODM
  - Models: `Listing`, `Review`, `User`
  - Listings store an `image` object { url, filename } and an optional `geography` GeoJSON Point for mapping

- File uploads
  - `multer` is used on the server to parse `multipart/form-data` and receive uploaded files
  - Cloudinary (configured via `cloudConfig.js`) stores uploaded images and multer is wired to that storage adapter
  - The routes use `upload.single('image')` so the uploaded file appears as `req.file` in controllers

- Geocoding (location -> coordinates)
  - The app uses the OpenStreetMap Nominatim service (unauthenticated HTTP endpoint) to convert location or country strings into coordinates
  - On create and update, the app attempts a precise search with the submitted `location`, and falls back to a search by `country` when necessary
  - Geocoding code writes a GeoJSON Point to `listing.geography = { type: 'Point', coordinates: [lon, lat] }`

- Validation
  - Joi is used to validate request shapes (see `schema.js`) before saving
  - There is middleware (`validateListing`) that normalizes nested (`listing[...]`) and top-level forms into the same shape for validation

- Authentication
  - `passport-local` + `passport-local-mongoose` provide user registration and login
  - `express-session` stores session state (development memory store) and `connect-flash` shows messages to users

## Notes, caveats and future improvements

- Nominatim Usage: The app currently uses the public OpenStreetMap Nominatim endpoint for geocoding. That endpoint has usage policies and rate limits — for production usage use a proper geocoding provider or a self-hosted instance.

- Image lifecycle: When updating a listing and replacing an image, the old Cloudinary file is not automatically deleted by the current code. Implementing cleanup (and an explicit UI to remove images) is a recommended follow-up.

- Tests: The project currently lacks automated tests. Adding unit tests for controllers and integration tests for routes would improve robustness.
