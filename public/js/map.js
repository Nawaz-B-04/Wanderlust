window.onload = function () {
    // Check if mapToken is available
    if (mapToken) {
        mapboxgl.accessToken = mapToken;
        // Ensure listing data is available in this scope
        const coordinates = listing.geometry.coordinates; // Get coordinates from the listing object
        const title = listing.title;
        const location = listing.location;

        // Initialize the map
        const map = new mapboxgl.Map({
            container: 'map', // ID of the HTML element where the map will be rendered
            style: 'mapbox://styles/mapbox/streets-v11', // Map style URL
            center: coordinates, // Coordinates passed dynamically [longitude, latitude]
            zoom: 9, // Initial zoom level
        });

        // Add the marker after the map is initialized
        new mapboxgl.Marker({color: "red"})
            .setLngLat(coordinates) // Coordinates for the marker
            .setPopup(new mapboxgl.Popup({offset: 25})
            .setHTML(`<h4>${title}</h4><p>${location}</p>`)) // Dynamic content in popup
            .addTo(map);
    } else {
        console.error('Map token is not defined.');
    }
  };