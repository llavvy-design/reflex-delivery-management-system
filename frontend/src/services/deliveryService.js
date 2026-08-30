import api from "./api";

export const getDeliveries = async () => {
    const response = await api.get("/deliveries");

    return response.data.deliveries;
};

export const getDelivery = async (deliveryId) => {
    const response = await api.get(`/deliveries/${deliveryId}`);

    return response.data.delivery;
};

export const createDelivery = async (deliveryData) => {
    const response = await api.post("/deliveries", deliveryData);

    return response.data.delivery;
};

export const updateDelivery = async (deliveryId, deliveryData) => {
    const response = await api.patch(
        `/deliveries/${deliveryId}`,
        deliveryData
    );

    return response.data.delivery;
};

export const cancelDelivery = async (deliveryId) => {
    const response = await api.post(
        `/deliveries/${deliveryId}/cancel`
    );

    return response.data.delivery;
};

export const confirmDelivery = async (
    deliveryId,
    confirmationCode
) => {
    const response = await api.post(
        `/deliveries/${deliveryId}/confirm`,
        {
            confirmationCode
        }
    );

    return response.data.confirmation;
};

export const getDeliveryConfirmation = async (deliveryId) => {
    const response = await api.get(
        `/deliveries/${deliveryId}/confirmation`
    );

    return response.data.confirmation;
};

export const getDeliveryHistory = async (deliveryId) => {
    const response = await api.get(
        `/deliveries/${deliveryId}/history`
    );

    return response.data.history;
};

export const updateDeliveryStatus = async (
    deliveryId,
    status
) => {
    const response = await api.patch(
        `/deliveries/${deliveryId}/status`,
        {
            status
        }
    );

    return response.data.delivery;
};

export const getDeliveryStats = async () => {
    const response = await api.get("/deliveries/stats");

    return response.data.stats;
};

export const getRiders = async () => {
    const response = await api.get("/users/riders");

    return response.data.riders;
};

export const assignDelivery = async (
    deliveryId,
    riderId
) => {
    const response = await api.post(
        `/deliveries/${deliveryId}/assign`,
        {
            riderId
        }
    );

    return response.data.delivery;
};

export const updateRiderAvailability = async (isAvailable) => {
    const response = await api.patch(
        "/users/riders/me/availability",
        {
            isAvailable
        }
    );

    return response.data.rider;
};

export const getCurrentRider = async () => {
    const response = await api.get("/users/riders/me");

    return response.data.rider;
};