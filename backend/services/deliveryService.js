import { DELIVERY_RADIUS_KM, outlets } from '../config/outlets.js';

const toRadians = (degrees) => degrees * (Math.PI / 180);

// Haversine calculates the straight-line radius requested for delivery zones.
// Use a distance-matrix provider later only if road-distance rules are needed.
export const calculateDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const latitudeA = toRadians(from.latitude);
  const latitudeB = toRadians(to.latitude);
  const value = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
};

export const findDeliveryOutlet = ({ latitude, longitude }) => {
  const customerLocation = { latitude: Number(latitude), longitude: Number(longitude) };
  const nearest = outlets
    .map((outlet) => ({ ...outlet, distanceKm: calculateDistanceKm(customerLocation, outlet) }))
    .sort((first, second) => first.distanceKm - second.distanceKm)[0];

  if (!nearest || nearest.distanceKm > DELIVERY_RADIUS_KM) {
    return { available: false, radiusKm: DELIVERY_RADIUS_KM };
  }

  return {
    available: true,
    radiusKm: DELIVERY_RADIUS_KM,
    outlet: { id: nearest.id, name: nearest.name },
    distanceKm: Number(nearest.distanceKm.toFixed(2))
  };
};
