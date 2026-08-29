const { getIO } = require("./socketHandler");

const emitDeliveryCreated = (delivery) => {
    const io = getIO();

    io.to(`user:${delivery.created_by}`).emit(
        "delivery:created",
        {
            delivery
        }
    );

    io.to("role:dispatcher").emit(
        "delivery:created",
        {
            delivery
        }
    );
};

const emitDeliveryAssigned = (delivery) => {
    const io = getIO();

    io.to(`rider:${delivery.assigned_rider_id}`).emit(
        "delivery:assigned",
        {
            delivery
        }
    );

    io.to("role:dispatcher").emit(
        "delivery:assigned",
        {
            delivery
        }
    );

    io.to(`user:${delivery.created_by}`).emit(
        "delivery:assigned",
        {
            delivery
        }
    );
};

const emitDeliveryStatusUpdated = (delivery) => {
    const io = getIO();

    io.to(`rider:${delivery.assigned_rider_id}`).emit(
        "delivery:status_updated",
        {
            delivery
        }
    );

    io.to("role:dispatcher").emit(
        "delivery:status_updated",
        {
            delivery
        }
    );

    io.to(`user:${delivery.created_by}`).emit(
        "delivery:status_updated",
        {
            delivery
        }
    );
};

const emitDeliveryCancelled = (delivery) => {
    const io = getIO();

    io.to("role:dispatcher").emit(
        "delivery:cancelled",
        {
            delivery
        }
    );

    if (delivery.assigned_rider_id) {
        io.to(`rider:${delivery.assigned_rider_id}`).emit(
            "delivery:cancelled",
            {
                delivery
            }
        );
    }

    io.to(`user:${delivery.created_by}`).emit(
        "delivery:cancelled",
        {
            delivery
        }
    );
};

const emitDeliveryConfirmed = (delivery) => {
    const io = getIO();

    io.to("role:dispatcher").emit(
        "delivery:confirmed",
        {
            delivery
        }
    );

    if (delivery.assigned_rider_id) {
        io.to(`rider:${delivery.assigned_rider_id}`).emit(
            "delivery:confirmed",
            {
                delivery
            }
        );
    }

    io.to(`user:${delivery.created_by}`).emit(
        "delivery:confirmed",
        {
            delivery
        }
    );
};

module.exports = {
    emitDeliveryCreated,
    emitDeliveryAssigned,
    emitDeliveryStatusUpdated,
    emitDeliveryCancelled,
    emitDeliveryConfirmed
};