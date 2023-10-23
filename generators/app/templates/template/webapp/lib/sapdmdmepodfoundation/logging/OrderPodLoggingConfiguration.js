sap.ui.define([
    "sap/dm/dme/podfoundation/logging/LoggingConfiguration",
    "sap/dm/dme/podfoundation/logging/OrderPodClientContext",
    "sap/dm/dme/serverevent/NotificationConfig"
], function(LoggingConfiguration, OrderPodClientContext, NotificationConfig) {
    "use strict";

    return LoggingConfiguration.extend("sap.dm.dme.podfoundation.logging.OrderPodLoggingConfiguration", {

        constructor: function(oBackendConfiguration) {
            LoggingConfiguration.call(this, oBackendConfiguration);
            this._oClientContext = new OrderPodClientContext(oBackendConfiguration.clientContext.workCenter,
                oBackendConfiguration.clientContext.resource,
                oBackendConfiguration.clientContext.material,
                oBackendConfiguration.clientContext.order
            ).getInterface();

            this._oNotificationConfig = new NotificationConfig({
                "subscribeWorkCenter": true,
                "subscribeResource": this._oClientContext.hasResource(),
                "subscribeMaterial": this._oClientContext.hasMaterial(),
                "subscribeOrder": this._oClientContext.hasOrder(),
                "uiLoggingNotification": true
            });

            this.getNotificationContext().setPodType("R"); // Type must match a value from com.sap.dm.dme.podfoundation.domain.model.PodType
            this.getNotificationContext().setWorkCenter(oBackendConfiguration.clientContext.workCenter);
            this.getNotificationContext().setResource(oBackendConfiguration.clientContext.resource);
            this.getNotificationContext().setMaterial(oBackendConfiguration.clientContext.material);
            this.getNotificationContext().setOrder(oBackendConfiguration.clientContext.order);
        }
    });
});