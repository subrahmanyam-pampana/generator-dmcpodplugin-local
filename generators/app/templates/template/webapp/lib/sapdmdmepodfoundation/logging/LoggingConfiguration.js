sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/logging/LogSetting",
    "sap/dm/dme/serverevent/NotificationContext"
], function(BaseObject, LogSetting, NotificationContext) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.LoggingConfiguration", {

        constructor: function(oBackendConfiguration) {
            this._id = oBackendConfiguration.id;
            this._deleted = !!oBackendConfiguration.deleted;
            this._logSettings = [];

            for (let logSetting of oBackendConfiguration.loggingSettings) {
                this._logSettings.push(new LogSetting(logSetting.component, logSetting.level));
            }

            let oNotificationContext = new NotificationContext("UI_LOG");
            oNotificationContext.setPlant(oBackendConfiguration.plant);
            oNotificationContext.setPodId(oBackendConfiguration.podId);
            oNotificationContext.setBackendLoggingConfigurationId(oBackendConfiguration.id);
            this._oNotificationContext = oNotificationContext;
        },

        //interface
        getId: function() {
            return this._id;
        },

        //interface
        getClientContext: function() {
            return this._oClientContext;
        },

        //interface
        getNotificationContext: function() {
            return this._oNotificationContext;
        },

        //interface
        getNotificationConfig: function() {
            return this._oNotificationConfig;
        },

        //interface
        getLogSettings: function() {
            return this._logSettings;
        },

        //interface
        setLogSettings: function(oLogSettings) {
            this._logSettings = oLogSettings;
        },

        //interface
        isDeleted: function() {
            return this._deleted;
        }
    });
});