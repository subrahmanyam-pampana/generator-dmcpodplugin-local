sap.ui.define([
    "sap/dm/dme/podfoundation/logging/LoggingConfiguration",
    "sap/dm/dme/podfoundation/logging/WorkCenterPodClientContext",
    "sap/dm/dme/serverevent/NotificationConfig"
], function(LoggingConfiguration, WorkCenterPodClientContext, NotificationConfig) {
    "use strict";

    return LoggingConfiguration.extend("sap.dm.dme.podfoundation.logging.WorkCenterPodLoggingConfiguration", {

        constructor: function(oBackendConfiguration) {
            LoggingConfiguration.call(this, oBackendConfiguration);
            this._oClientContext = new WorkCenterPodClientContext(oBackendConfiguration.clientContext.workCenter, {
                resource: oBackendConfiguration.clientContext.resource
            }).getInterface();
            this._oNotificationConfig = new NotificationConfig({
                "subscribeWorkCenter": true,
                "subscribeResource": this._oClientContext.hasResource(),
                "uiLoggingNotification": true
            });

            this.getNotificationContext().setPodType("W"); // Type must match a value from com.sap.dm.dme.podfoundation.domain.model.PodType
            this.getNotificationContext().setWorkCenter(oBackendConfiguration.clientContext.workCenter);
            this.getNotificationContext().setResource(oBackendConfiguration.clientContext.resource);
        }
    });
});