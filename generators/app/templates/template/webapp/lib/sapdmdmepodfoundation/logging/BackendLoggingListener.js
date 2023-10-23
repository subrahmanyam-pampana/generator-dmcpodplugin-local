sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/serverevent/Notifications",
    "sap/dm/dme/serverevent/NotificationConfig",
    "sap/dm/dme/podfoundation/logging/LoggingSession",
    "sap/dm/dme/podfoundation/logging/WorkCenterPodClientContext",
    "sap/dm/dme/podfoundation/logging/OperationPodClientContext",
    "sap/dm/dme/podfoundation/logging/OrderPodClientContext"
], function(BaseObject, Log, Constants, PodType, Notifications, NotificationConfig, LoggingSession, WorkCenterPodClientContext, OperationPodClientContext, OrderPodClientContext) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.BackendLoggingListener", {

        constructor: function(oController, oBackendLoggingSession) {
            this._oController = oController;
            this._oBackendLoggingSession = oBackendLoggingSession;
            this._oNotifications = new Notifications(this);
            this._oNotifications.setRetainSubscriptions(true);
            this._activeUiLoggingConfiguration = null;
            let oEventHandler = this._oController.getEventHandler();
            oEventHandler.subscribe(this, "PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this);
        },

        destroy: function() {
            this._unsubscribePodSelectionChange();
        },

        // If the POD type is supported, create a LoggingSession and initialize logging based on the backend logging
        // configuration.
        onPodSelectionChangeEvent: function() {

            try {
                let oPodSelectionModel = this.getPodSelectionModel();
                let oPodType = this.getPodSelectionModel().getPodType();
                if (this._isSupportedPodType(oPodType)) {
                    this._createLoggingSession(oPodType);
                    let oConfiguration = this._getConfigurationForPodSelection(oPodSelectionModel, oPodType);
                    if (oConfiguration) {
                        // If there is a different (than the current) UI logging configuration that matches the changed POD
                        // selection values, then initialize backend logging for that configuration.

                        // User may have triggered a POD selection for the same selection values. Currently, the POD framework
                        // sends the selection change event when Go is pressed even if POD selection values are not changed. So,
                        // only initialize logging if POD selection values have changed.
                        if (!this._isActiveLoggingConfiguration(oConfiguration)) {

                            // This must be done before oConfiguration is set as the active configuration.
                            this._addLogListener();

                            // Turn off UI console logging for the previously enabled loggers.
                            this._clearLoggingLevels(this._activeUiLoggingConfiguration);
                            this._initUi5Loggers(oConfiguration);
                            this._createSubscription(oConfiguration);
                        }
                    } else {
                        // There is no logging configuration for the POD selection values.
                        // Tear down logging if one is currently active so that logs are no longer sent.
                        this._removeLogListener();

                        // Do not remove logging subscriptions. Even though backend logging is being disabled, maintain the logging
                        // update notification subscriptions so that configuration updates are still processed.

                        // Turn off UI console logging for the previously enabled loggers.
                        this._clearLoggingLevels(this._activeUiLoggingConfiguration);

                        this._activeUiLoggingConfiguration = null;
                    }
                } else {
                    console.debug("BackendLoggingListener.onPodSelectionChangeEvent - Pod type " + oPodType + " is not supported.")
                }
            } catch (oError) {
                console.error("BackendLoggingListener.onPodSelectionChange - Error processing POD selection change event: " + oError);
            }
        },

        // UI5 logging listener callback that receives logs for components with logging enabled.
        onLogEntry: function(oLog) {
            // Errors from logging should not affect POD function.
            try {
                if (this.getLoggingSession().filterLogMessage(oLog, this._activeUiLoggingConfiguration.getId())) {
                    this._sendLogMessage(oLog);
                }
            } catch (oError) {
                // Should we log anything to the console? This could lead to a lot of console messages (one per log attempt).
            }
        },

        getPodSelectionModel: function() {
            return this.getController().getView().getModel("podSelectionModel").getData();
        },

        getController: function() {
            return this._oController;
        },

        setController: function(oController) {
            this._oController = oController;
        },

        getLoggingSession: function() {
            return this._oLoggingSession;
        },

        setLoggingSession: function(oLoggingSession) {
            this._oLoggingSession = oLoggingSession;
        },

        getNotifications: function() {
            return this._oNotifications;
        },

        // Required for POD selection change event handling
        getPluginId: function() {
            return "BackendLoggingListener_pluginId";
        },

        // Required for POD selection change event handling
        getPageName: function() {
            // Page name must be this value for onPodSelectionChange handler to be called.
            return "@POD_PAGE@";
        },

        // Required by Notifications.js
        getPodController: function() {},

        getBackendLoggingSession: function() {
            return this._oBackendLoggingSession;
        },

        _createLoggingSession: function(oPodType) {
            if (!this.getLoggingSession()) {
                this.setLoggingSession(new LoggingSession(oPodType, this.getBackendLoggingSession()));
            }
        },

        _isSupportedPodType: function(oPodType) {
            return PodType.WorkCenter === oPodType || PodType.Operation === oPodType || PodType.Order === oPodType;
        },

        // Set UI component logging levels as defined in the logging configuration.
        _initUi5Loggers: function(oConfiguration) {
            this._activeUiLoggingConfiguration = oConfiguration;
            for (let oLogSetting of oConfiguration.getLogSettings()) {
                Log.setLevel(oLogSetting.getLevel(), oLogSetting.getComponent());
            }
        },

        // Disable logging for all components currently configured. This turns off logging in the browser console.
        _clearLoggingLevels: function(oConfiguration) {
            // oConfiguration may be the active configuration, which may be null because there is nothing currently active.
            if (oConfiguration) {
                let oLogSettings = oConfiguration.getLogSettings();
                for (let oLogSetting of oLogSettings) {
                    Log.setLevel(Log.Level.NONE, oLogSetting.getComponent());
                }
            }
        },

        _sendLogMessage: function(oLog) {
            let oStompClient = this._oNotifications._getStompClient();
            let logLevelVal = this._getLogLevelStringFromIntLevel(oLog.level);
            oStompClient.connected && oStompClient.publish({
                destination: "/UI_LOG",
                body: "{component: \"" + oLog.component + "\",message:\"[" + oLog.time + "] " + oLog.message + "\",level:\"" + logLevelVal + "\"}"

            });
        },

        // Create a subscription for the UI_LOG topic to receive notifications of logging configuration changes, such
        // as changes to logging levels or deletion of the logging configuration.
        // Notifications.subscribeServerEvent is idempotent and will not create duplicate subscriptions in the case that
        // the subscription already exists.
        _createSubscription: function(oConfiguration) {
            this._oNotifications.createStompConnection()
                .then(function() {
                    this._oNotifications.subscribeServerEvent({
                        notificationContext: oConfiguration.getNotificationContext(),
                        notificationConfig: oConfiguration.getNotificationConfig(),
                        msgHandler: this._handleBackendConfigurationUpdated.bind(this)
                    });
                    oConfiguration.notificationContext = oConfiguration.getNotificationContext();
                }.bind(this));
        },

        // Handler for UI logging configuration changes. This includes both logging settings changes to a configuration
        // in the session and deletion of a configuration.
        _handleBackendConfigurationUpdated: function(oBackendConfiguration) {
            let oConfiguration = this.getLoggingSession().createLoggingConfiguration(oBackendConfiguration);
            if (oConfiguration.isDeleted()) {
                this._handleBackendConfigurationDeleted(oConfiguration);
            } else if (this._isActiveLoggingConfiguration(oConfiguration)) {

                // Disable logging for the currently active configuration, so disable logging for configured loggers.
                this._clearLoggingLevels(this._activeUiLoggingConfiguration);

                // Update the configuration log settings.
                this._activeUiLoggingConfiguration.setLogSettings(oConfiguration.getLogSettings());

                this.getLoggingSession().refreshLogLevelMap();

                // Configure logging per the modified settings.
                this._initUi5Loggers(this._activeUiLoggingConfiguration);
            } else {
                // Just update the log settings for the inactive configuration so that they are loaded
                // if it becomes active.
                this.getLoggingSession().updateLogSettingsForConfiguration(oConfiguration.getId(), oConfiguration.getLogSettings());
            }
        },

        _handleBackendConfigurationDeleted: function(oConfiguration) {

            let oRemovedConfig = this.getLoggingSession().removeConfiguration(oConfiguration.getId());
            if (oRemovedConfig) {

                if (this._isActiveLoggingConfiguration(oRemovedConfig)) {

                    // The removed configuration was active, so disable logging for configured loggers.
                    this._clearLoggingLevels(oRemovedConfig);

                    // Tear down the Notifications subscription that went with the removed configuration.
                    this._oNotifications.unsubscribeServerEvent(oRemovedConfig.getNotificationContext());

                    // The active configuration has been deleted, so stop listening for logs. This object will be added
                    // again as a listener if POD selection values are changed that match another logging configuration.
                    this._removeLogListener();
                    this._activeUiLoggingConfiguration = null;
                }

                if (!this.getLoggingSession().hasConfigurations()) {
                    // There are no more configurations in the session, so tear down all logging.
                    this._removeLogListener();
                    this._unsubscribePodSelectionChange();
                    this._oNotifications.destroy(); // No more logging configurations remain, so destroy the logging Notifications instance.
                    this._oLoggingSession = null;
                    this._activeUiLoggingConfiguration = null;
                }
            }
        },

        _unsubscribePodSelectionChange: function() {
            let oEventHandler = this._oController.getEventHandler()
            oEventHandler.unsubscribe(this, "PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this);
        },

        _hasActiveLoggingConfiguration: function() {
            return !!this._activeUiLoggingConfiguration;
        },

        _isActiveLoggingConfiguration: function(oConfiguration) {
            return this._activeUiLoggingConfiguration && this._activeUiLoggingConfiguration.getId() === oConfiguration.getId();
        },

        _getConfigurationForPodSelection: function(oPodSelectionModel, oPodType) {
            if (PodType.Order === oPodType) {
                return this._getConfigurationForOrderPodSelection(oPodSelectionModel);
            } else {
                let oClientContext = this._createClientContextForPodSelection(oPodSelectionModel, oPodType);
                return this.getLoggingSession().getConfiguration(oClientContext);
            }
        },

        _createClientContextForPodSelection: function(oPodSelectionModel, oPodType) {

            if (PodType.WorkCenter === oPodType) {
                return new WorkCenterPodClientContext(oPodSelectionModel.getWorkCenter(), oPodSelectionModel.getResource());
            } else if (PodType.Operation === oPodType) {
                return new OperationPodClientContext(oPodSelectionModel.getOperation().operation, oPodSelectionModel.getResource().resource);
            }
        },

        _getConfigurationForOrderPodSelection: function(oPodSelectionModel) {

            // TODO: Check if it is possible that this pod selection change handling runs before the model is updated
            let oConfiguration = null;
            let oClientContext = null;
            let aWorkCenters = oPodSelectionModel.getSelectedWorkCenters();
            let aOrders = oPodSelectionModel.getShopOrders();
            if (aWorkCenters && aWorkCenters.length > 0) {
                let sResource = oPodSelectionModel.getResource();
                let sMaterial = oPodSelectionModel.getMaterialNo();
                for (let sWorkCenter of aWorkCenters) {
                    if (aOrders && aOrders.length > 0) {
                        for (let sOrder of aOrders) {
                            oClientContext = new OrderPodClientContext(sWorkCenter, sResource, sMaterial, sOrder);
                            oConfiguration = this.getLoggingSession().getConfiguration(oClientContext);
                            if (oConfiguration) {
                                return oConfiguration;
                            }
                        }
                    } else {
                        oClientContext = new OrderPodClientContext(sWorkCenter, sResource, sMaterial);
                        oConfiguration = this.getLoggingSession().getConfiguration(oClientContext);
                        if (oConfiguration) {
                            return oConfiguration;
                        }
                    }
                }
            }
        },

        _getLogLevelStringFromIntLevel: function(iLevel) {
            switch (iLevel) {
                case 1:
                    return "ERROR"
                case 2:
                    return "WARNING"
                case 3:
                    return "INFO"
                case 4:
                    return "DEBUG"
                case 5:
                    return "TRACE"
            }
        },

        _addLogListener: function() {
            if (!this._hasActiveLoggingConfiguration()) {
                Log.addLogListener(this);
            }
        },

        _removeLogListener: function() {
            Log.removeLogListener(this);
        }

    });
});