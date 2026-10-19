// Coordinates confirmed from the existing Chick Buck outlet information.
// Add the sixth delivery branch only after its exact Google Maps coordinates
// and printer integration details are available.
export const DELIVERY_RADIUS_KM = Number(process.env.DELIVERY_RADIUS_KM || 5);

export const outlets = Object.freeze([
  { id: 'vengara', name: 'Chick Buck Vengara', latitude: 11.0571618, longitude: 75.9783179 },
  { id: 'parappanangadi', name: 'Chick Buck Parappanangadi', latitude: 11.0478, longitude: 75.8954 },
  { id: 'malappuram', name: 'Chick Buck Malappuram', latitude: 11.051705, longitude: 76.0633693 },
  { id: 'puthanathani', name: 'Chick Buck Puthanathani', latitude: 10.9271459, longitude: 76.0051252 },
  { id: 'kadappadi', name: 'Chick Buck Kadappadi', latitude: 11.1128265, longitude: 75.9428563 }
]);
