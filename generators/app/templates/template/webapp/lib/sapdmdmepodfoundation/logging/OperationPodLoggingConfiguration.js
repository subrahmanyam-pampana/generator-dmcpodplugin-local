sap.ui.define([
    "sap/dm/dme/podfoundation/logging/LoggingConfiguration",
    "sap/dm/dme/podfoundation/logging/OperationPodClientContext",
    "sap/dm/dme/serverevent/NotificationConfig"
], function(LoggingConfiguration, OperationPodClientContext, NotificationConfig) {
    "use strict";

    return LoggingConfiguration.extend("sap.dm.dme.podfoundation.logging.OperationPodLoggingConfiguration", {

        constructor: function(oBackendConfiguration) {
            LoggingConfiguration.call(this, oBackendConfiguration);
            this._oClientContext = new OperationPodClientContext(oBackendConfiguration.clientContext.operationActivity, oBackendConfiguration.clientContext.resource).getInterface();
            this._oNotificationConfig = new NotificationConfig({
                "subscribeOperation": true,
                "subscribeResource": true,
                "uiLoggingNotification": true
            });

            this.getNotificationContext().setPodType("O"); // Type must match a value from com.sap.dm.dme.podfoundation.domain.model.PodType
            this.getNotificationContext().setOperation(oBackendConfiguration.clientContext.operationActivity);
            this.getNotificationContext().setResource(oBackendConfiguration.clientContext.resource);
        }
    });
});