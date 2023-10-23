sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/serverevent/Topic",
    "sap/dm/dme/serverevent/NotificationConfig",
    "sap/dm/dme/logging/Logging"
], function(BaseObject, Topic, NotificationConfig, Logging) {
    "use strict";

    // must start with alphabetic character, allow alpha-numeric and can include .-_
    var VALID_EVENT_REGEX = /^[a-zA-Z]{1}[a-zA-Z0-9\-_\.]+$/;

    var oLogger = Logging.getLogger("sap.dm.dme.podfoundation.serverevent.ServerNotificationSubscription");

    return BaseObject.extend("sap.dm.dme.podfoundation.serverevent.ServerNotificationSubscription", {

        constructor: function(oViewController, bGroupSubscriptionSupport) {
            BaseObject.call(this);
            this._oViewController = oViewController;
            this._oNotifications = null;

            // assume the view controller is actually the POD controller
            this._bIsPluginController = false;
            if (oViewController.getPluginName) {
                // this is a PluginViewController
                this._bIsPluginController = true;
            }
            this._bGroupSubscriptionSupport = !!bGroupSubscriptionSupport;
        },

        init: function() {
            this._createNotificationsObject();

            // Execute one-time before/after view rendering initialization for POD plugin controllers only. An example
            // of a controller that is not a plugin is ProcessNotificationDelegate.
            if (this._oViewController.isSubscribingToNotifications() && this._bIsPluginController) {
                this._oViewController.getView().attachEventOnce("beforeRendering", function() {
                    this._onBeforeRendering();
                }.bind(this));
                this._oViewController.getView().attachEventOnce("afterRendering", function() {
                    this._onAfterRendering();
                }.bind(this));
            }
        },

        destroy: function() {
            if (this._oViewController.isSubscribingToNotifications()) {
                this._oViewController.unsubscribe("PodSelectionChangeEvent", this._onPodSelectionChangeEvent, this);
                var oNotifications = this._getNotifications();
                if (oNotifications) {
                    oNotifications.destroy();
                }
            }
        },

        _onBeforeRendering: function(oEvent) {
            this._oViewController.subscribe("PodSelectionChangeEvent", this._onPodSelectionChangeEvent, this);
        },

        _onAfterRendering: function(oEvent) {
            var that = this;
            setTimeout(function() {
                // need to give time for _createNotificationsObject()
                // to create instance of Notifications class
                that._updateNotificationSubscriptions();
            }, 1000);
        },

        _onPodSelectionChangeEvent: function(sChannelId, sEventId, oData) {
            this._updateNotificationSubscriptions();
        },

        _updateNotificationSubscriptions: function() {
            var oNotificationConfig = this._getNotificationConfiguration();
            var oCheckNotificationContext = this._getCurrentNotificationContext();

            if (oNotificationConfig.isNotificationsEnabled() &&
                oNotificationConfig.hasValuesForSubscription(oCheckNotificationContext)) {

                oLogger.info("_updateNotificationSubscriptions: Notifications enabled and there are values selected for subscription.");

                var oNotifications = this._getNotifications();
                if (!oNotifications) {
                    oLogger.warning("_updateNotificationSubscriptions: Notifications object not defined, aborting subscription processing.");
                    return;
                }

                oLogger.debug("_updateNotificationSubscriptions: Calling creation of STOMP connection.");
                oNotifications.createStompConnection()
                    .then(function() {

                        // Create subscriptions after the connection is available
                        var aTopics = oNotificationConfig.getTopics();
                        oLogger.info("_updateNotificationSubscriptions: Connection created, begin creating subscriptions for topics=." + aTopics);
                        for (var i = 0; i < aTopics.length; i++) {

                            var oNewNotificationContext = this._getCurrentNotificationContext();
                            this._updateContextWithTopic(oNewNotificationContext, aTopics[i]);

                            var sEventName = aTopics[i];
                            if (oNewNotificationContext.getTopic() === "/" + Topic.CUSTOM + "/") {
                                sEventName = oNewNotificationContext.getCustomEventName();
                            }
                            oLogger.debug("_updateNotificationSubscriptions: Processing subscription for event=" + sEventName);
                            var fnMsgHandler = this._getNotificationMessageHandler(sEventName);
                            if (fnMsgHandler) {
                                oLogger.debug("_updateNotificationSubscriptions: Message handler function defined, proceeding with subscription creation.");
                                oNotifications.subscribeServerEvent({
                                    notificationContext: oNewNotificationContext,
                                    notificationConfig: oNotificationConfig,
                                    msgHandler: fnMsgHandler.bind(this._oViewController)
                                });
                            }
                        }
                    }.bind(this));
            }
        },

        _updateContextWithTopic: function(oNotificationContext, sConfiguredTopic) {
            // this updated the topic into the context and if it is for a
            // custom topic, it separates the topic from the event name so
            // the event name can be assigned to the header information
            var sTopic = sConfiguredTopic;
            var sCustomEventName = null;
            if (sTopic.indexOf(Topic.CUSTOM + ".") === 0) {
                sCustomEventName = sTopic.substring(7);
                sTopic = Topic.CUSTOM;
            }
            oNotificationContext.setTopic(sTopic);
            if (sCustomEventName) {
                oNotificationContext.setCustomEventName(sCustomEventName);
            }
        },

        _getNotificationConfiguration: function() {
            var oConfigData = this._getNotificationConfigurationData();
            var oNotificationConfig = new NotificationConfig(oConfigData);
            if (oNotificationConfig.addCustomTopics) {
                var aCustomEvents = this._getCustomNotificationEvents();
                if (aCustomEvents.length > 0) {
                    oNotificationConfig.addCustomTopics(aCustomEvents);
                }
            }
            return oNotificationConfig;
        },

        _getCurrentNotificationContext: function() {
            var oConfigData = this._getNotificationConfigurationData();
            var oContextData = this._getNotificationContextData();
            var oNotifications = this._getNotifications();
            if (!oNotifications) {
                return null;
            }
            var oNotificationContext = oNotifications.createNotificationContext();
            if (oConfigData) {
                if (oConfigData.subscribeResource) {
                    oNotificationContext.setResource(oContextData.resource);
                }
                if (oConfigData.subscribeWorkCenter) {
                    oNotificationContext.setWorkCenter(oContextData.workCenter);
                }
                if (oConfigData.subscribeOperation) {
                    oNotificationContext.setOperation(oContextData.operation);
                }
            }
            oNotificationContext.setPlant(this._getUserPlant());
            return oNotificationContext;
        },

        _getNotificationMessageHandler: function(sTopic) {
            return this._oViewController.getNotificationMessageHandler(sTopic);
        },

        _getCustomNotificationEvents: function() {
            var aCustomEvents = this._oViewController.getCustomNotificationEvents();
            return this._getValidCustomEventNames(aCustomEvents);
        },

        _getNotificationContextData: function() {
            return this._oViewController.getNotificationContextData();
        },

        _getNotificationConfigurationData: function() {
            return this._oViewController.getNotificationsConfiguration();
        },

        _getUserPlant: function() {
            return this._oViewController.getPodController().getUserPlant();
        },

        _getNotifications: function() {
            return this._oNotifications;
        },

        _createNotificationsObject: function() {
            // this is to get around issue with stomp library messing
            // up QUnit coverage test errors
            var that = this;
            sap.ui.require(["sap/dm/dme/serverevent/Notifications"], function(NotificationsClass) {
                that._oNotifications = new NotificationsClass(that._oViewController, that._bGroupSubscriptionSupport);
            }, function(oError) {
                // This may be a severe error that prevents notifications from working. Rethrow
                // so that an error message appears in the console.
                throw oError;
            });
        },

        _getValidCustomEventNames: function(aCustomEvents) {
            var aValidEvents = [];
            if (aCustomEvents && aCustomEvents.length > 0) {
                for (var i = 0; i < aCustomEvents.length; i++) {
                    if (this._isValidCustomEventName(aCustomEvents[i])) {
                        aValidEvents[aValidEvents.length] = aCustomEvents[i];
                    }
                }
            }
            return aValidEvents;
        },

        _isValidCustomEventName: function(sCustomEvent) {
            if (sCustomEvent.length < 4 || sCustomEvent.length > 24) {
                oLogger.error("'" + sCustomEvent + "' contains " + sCustomEvent.length + " characters.  Must be 4 to 24 characters in length.");
                return false;
            }
            if (!VALID_EVENT_REGEX.test(sCustomEvent)) {
                oLogger.error("'" + sCustomEvent + "' is not valid. Must start with alphabetic character and contain only alpha-numeric and .-_ special characters.");
                return false;
            }
            return true;
        }
    });
}, true);