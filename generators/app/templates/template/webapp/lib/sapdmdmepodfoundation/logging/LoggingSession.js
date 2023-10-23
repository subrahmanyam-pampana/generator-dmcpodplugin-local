sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/base/Interface",
    "sap/base/Log",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/podfoundation/logging/WorkCenterPodLoggingConfiguration",
    "sap/dm/dme/podfoundation/logging/OperationPodLoggingConfiguration",
    "sap/dm/dme/podfoundation/logging/OrderPodLoggingConfiguration"
], function(BaseObject,
    Interface,
    Log,
    PodType,
    WorkCenterPodLoggingConfiguration,
    OperationPodLoggingConfiguration,
    OrderPodLoggingConfiguration
) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.LoggingSession", {

        constructor: function(oPodType, oBackendLoggingSession) {
            this._plant = oBackendLoggingSession.plant;
            this._podId = oBackendLoggingSession.podId;
            this._podType = oPodType;
            this._configurationsMap = new Map();
            for (let oBackendConfig of oBackendLoggingSession.configurations) {
                let oConfiguration = this.createLoggingConfiguration(oBackendConfig);
                this._configurationsMap.set(oConfiguration.getClientContext().getKey(), oConfiguration);
            }
            this._logLevelMap = this._createLogLevelMap();
        },

        getPlant: function() {
            return this._plant;
        },

        getPodId: function() {
            return this._podId;
        },

        getPodType: function() {
            return this._podType
        },

        // Factory method to create the POD specific configuration type for the given backend logging config.
        createLoggingConfiguration: function(oBackendConfiguration) {
            oBackendConfiguration.plant = this.getPlant();
            oBackendConfiguration.podId = this.getPodId();
            if (PodType.WorkCenter === this.getPodType()) {
                return new WorkCenterPodLoggingConfiguration(oBackendConfiguration).getInterface();
            } else if (PodType.Operation === this.getPodType()) {
                return new OperationPodLoggingConfiguration(oBackendConfiguration).getInterface();
            } else if (PodType.Order === this.getPodType()) {
                return new OrderPodLoggingConfiguration(oBackendConfiguration).getInterface();
            }
        },

        removeConfiguration: function(sId) {
            let oConfigToRemove = this.getConfigurationById(sId);
            if (oConfigToRemove) {
                this.getConfigurations().delete(oConfigToRemove.getClientContext().getKey());
                this.refreshLogLevelMap();
            }
            return oConfigToRemove;
        },

        hasConfigurations: function() {
            return this.getConfigurations().size > 0;
        },

        getConfiguration: function(oClientContext) {
            return this._configurationsMap.get(oClientContext.getKey());
        },

        getConfigurations: function() {
            return this._configurationsMap;
        },

        getConfigurationById: function(sId) {
            let oReturnConfiguration = null;
            this.getConfigurations().forEach(function(oConfiguration) {
                if (oConfiguration.getId() === sId) {
                    oReturnConfiguration = oConfiguration;
                }
            });
            return oReturnConfiguration;
        },

        // Return the given oLogObject if there exists a log setting of any level for the given sConfigId
        filterLogMessage: function(oLogObject, sConfigId) {
            let oConfigLogLevels = this._logLevelMap[sConfigId];
            if (oConfigLogLevels && oConfigLogLevels[oLogObject.component] && (oLogObject.level > Log.Level.FATAL && oLogObject.level < Log.Level.ALL)) {
                return oLogObject;
            }
        },

        updateLogSettingsForConfiguration: function(sConfigurationId, oLogSettings) {

            this.getConfigurations().forEach(function(oConfiguration) {
                if (oConfiguration.getId() === sConfigurationId) {
                    oConfiguration.setLogSettings(oLogSettings);
                }
            });
            this.refreshLogLevelMap();
        },

        refreshLogLevelMap: function() {
            this._logLevelMap = this._createLogLevelMap();
        },

        // Create a map of logging settings to optimize the performance of filtering log messages. There is one
        // map of log levels per logging configuration, keyed by configuration id.
        _createLogLevelMap: function() {
            let oConfigLogLevelMap = {};
            let oConfigMap = this.getConfigurations();
            let oLogSettingMap = {};
            oConfigMap.forEach(function(oConfiguration) {
                let oLogSettings = oConfiguration.getLogSettings();
                for (let oLogSetting of oLogSettings) {
                    oLogSettingMap[oLogSetting.getComponent()] = oLogSetting.getLevel();
                }
                oConfigLogLevelMap[oConfiguration.getId()] = oLogSettingMap;
            });
            return oConfigLogLevelMap;
        }
    });
});