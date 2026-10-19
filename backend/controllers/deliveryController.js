import { findDeliveryOutlet } from '../services/deliveryService.js';

export const quoteDelivery = (request, response, next) => {
  try {
    response.json(findDeliveryOutlet(request.body));
  } catch (error) {
    next(error);
  }
};
