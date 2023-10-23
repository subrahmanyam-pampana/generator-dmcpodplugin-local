/**
 * This class provides support for creating a STOMP connection and maintaining subscriptions
 * to message topics.
 *
 * Third party STOMP JS library documentation can be found at https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
 */
sap.ui.require(["sap/dm/dme/thirdparty/stomp.umd.min"]);
sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/dm/dme/serverevent/NotificationContext",
    "sap/dm/dme/thirdparty/stomp.umd"
], function(BaseObject, Log, NotificationContext) {
    "use strict";

    let NOTIFICATIONS_COMPONENT_NAME = "sap.dm.dme.serverevent.Notifications";

    let logger = Log.getLogger(NOTIFICATIONS_COMPONENT_NAME);

    let _oConnectionHandler = {

        _oPodController: null,

        // Share a single websocket connection and client among all subscribing plugins
        WEBSOCKET_PATH: "/dme/podfoundation-ms/ws/websocket",

        // Time to wait between connect retries.
        RECONNECT_INTERVAL: 5000,

        // Time to wait between subscription retries. We want this to be a bit longer than
        // the reconnect interval so that subscriptions are made after reconnect succeeds.
        SUBSCRIPTION_RETRY_INTERVAL: 7500,

        // Global stomp client for the stomp connection and subscriptions
        _oStompClient: null,

        _oConnectPromise: null,

        // Global collection of all notification instances used for connection error handling
        _aNotificationsInstances: [],

        setMainPodController: function(oPodController) {
            this._oPodController = oPodController;
        },

        getMainPodController: function() {
            return this._oPodController;
        },

        createWebSocketConnection: function() {

            if (!this.getStompClient()) {
                this._oConnectPromise = new Promise((resolveConnect, rejectConnect) => {
                    let oStompClientConfig = this._getStompClientConfig(resolveConnect, rejectConnect);
                    this.createStompClient(oStompClientConfig).activate();
                });
                return this._oConnectPromise;
            } else {
                // There can be more than one Notifications client that requests a connection. This is the case when there is more than
                // one plugin loaded in the POD that is configured for Notifications. There is also a separate
                // Notifications client for production process events. Having more than one Notifications client
                // means that it is possible for more than one client to request a STOMP connection. However, we want
                // only one STOMP client/connection for all Notifications clients, and so only one of the calls to create
                // a connection is needed. We do not want to allow multiple calls to create the STOMP client/connection.
                // Therefore, we use Promise.race to return a Promise that resolves when the STOMP connection Promise
                // is resolved.  THIS CAN NOT BE REMOVED.
                return Promise.race([this._oConnectPromise]);
            }
        },

        createStompClient: function(oStompClientConfig) {
            oStompClientConfig.connectHeaders = {
                ack: "client-individual"
            };
            oStompClientConfig.brokerURL = this.getWebSocketUrl();
            this.setStompClient(new StompJs.Client(oStompClientConfig));
            return this.getStompClient();
        },

        getWebSocketUrl: function() {
            let sWsProtocol = "ws:";
            if ("https:" === window.location.protocol) {
                sWsProtocol = "wss:";
            }
            return sWsProtocol + "//" + window.location.host + this.WEBSOCKET_PATH;
        },

        getStompClient: function() {
            return this._oStompClient;
        },

        setStompClient: function(oStompClient) {
            this._oStompClient = oStompClient;
        },

        isStompConnectionCreated: function() {
            let oStompClient = this.getStompClient()
            return oStompClient && oStompClient.connected;
        },

        addNotificationsInstance: function(oInstance) {
            this._aNotificationsInstances.push(oInstance);
        },

        removeNotificationsInstance: function(oInstance) {
            let oInstances = this._getNotificationsInstances();
            let aRemainingInstances = [];
            for (let oCachedInstance in oInstances) {
                if (oCachedInstance !== oInstance) {
                    aRemainingInstances.push(oCachedInstance);
                }
            }
            this._aNotificationsInstances = aRemainingInstances;
        },

        /**
         * Remove subscriptions for all Notifications instances so that subscriptions are recreated when
         * the connection is reestablished.
         */
        handleWebSocketClose: function() {
            let oInstances = this._getNotificationsInstances();
            for (let oCachedInstance of oInstances) {
                oCachedInstance._initNotificationsState();
                if (oCachedInstance._getController().updateNotificationSubscriptions) {

                    let that = this;
                    setTimeout(function() {
                        if (that.isStompConnectionCreated()) {
                            console.log("Notifications - WebSocket connection established, creating subscriptions.");
                            this._getController().updateNotificationSubscriptions();
                        }
                    }.bind(oCachedInstance), that.SUBSCRIPTION_RETRY_INTERVAL);
                }
            }
        },

        _getStompClientConfig: function(resolveConnect, rejectConnect) {
            let that = this;
            return {
                debug: function(str) {
                    // Logs connect and subscribe info
                    if (!(str.includes("PING") || str.includes("PONG"))) {
                        console.log("Notifications - debug: " + str);
                    }
                },
                reconnectDelay: this.RECONNECT_INTERVAL,
                connectionTimeout: this.RECONNECT_INTERVAL,
                onConnect: function() {
                    that._setPodConnectionStatus(true);
                    resolveConnect();
                },
                onDisconnect: function(iFrame) {
                    // not called when server was stopped
                    console.log("Notifications - onDisconnect: " + iFrame);
                },
                onStompError: function(iFrame) {
                    console.log("Notifications - onStompError: " + iFrame);
                },
                onWebSocketClose: function(oCloseEvent) {
                    console.log("Notifications - onWebSocketClose: code=" + oCloseEvent.code + ", reason=" + oCloseEvent.reason + ", wasClean=" + oCloseEvent.wasClean);
                    that._setPodConnectionStatus(false);
                    that.handleWebSocketClose(oCloseEvent);
                    rejectConnect();
                },
                onWebSocketError: function(oEvent) {
                    console.log("Notifications - onWebSocketError: url=" + oEvent.target.url + ", readyState=" + oEvent.target.readyState);
                }
            };
        },

        _getNotificationsInstances: function() {
            return this._aNotificationsInstances;
        },

        _setPodConnectionStatus: function(bConnected) {
            if (bConnected) {
                this.getMainPodController().setNotificationsConnected();
            } else {
                this.getMainPodController().setNotificationsDisconnected();
            }
        }
    }

    return BaseObject.extend(NOTIFICATIONS_COMPONENT_NAME, {

        /**
         *
         * @param oController The controller that will create message subscriptions
         * @param bGroupSubscriptionSupport  Support subscription for multiple objects. This is limited to only work centers.
         */
        constructor: function(oController, bGroupSubscriptionSupport) {
            BaseObject.call(this);
            this._oController = oController;
            this._initNotificationsState();
            this.getConnectionHandler().addNotificationsInstance(this);
            this._bGroupSubscriptionSupport = !!bGroupSubscriptionSupport;
            this._retainSubscriptions = false;
        },

        setRetainSubscriptions: function(bRetain) {
            this._retainSubscriptions = bRetain;
        },

        getRetainSubscriptions: function() {
            return this._retainSubscriptions;
        },

        /**
         * Remove this Notifications instance from the instance collection
         */
        destroy: function() {
            BaseObject.prototype.destroy.call(this);
            this.getConnectionHandler().removeNotificationsInstance(this);
            this._unsubscribeAllServerEvents();
        },

        createStompConnection: function() {

            this.getConnectionHandler().setMainPodController(this._getController().getPodController());
            return this.getConnectionHandler().createWebSocketConnection();
        },

        /**
         * Create a subscription for the given notification context, which includes context objects and a single topic.
         * Topic is synonymous with 'event'.
         * @param oSubscription Object containing properties for the notification context,
         * notification configuration, and message handler to receive messages for the subscription
         */
        subscribeServerEvent: function(oSubscription) {

            // Ensure we have a connection
            if (!this.getConnectionHandler().isStompConnectionCreated()) {
                return;
            }
            const fnMessageCallback = oSubscription.msgHandler;
            const oNotificationConfig = oSubscription.notificationConfig;

            //&* Isn't group subscription implied if aRequestedNotificationContexts size >1? Do we need bGroupSubscriptionSupport?
            //&* aRequestedNotificationContexts may be an empty array if there is no work center value.
            let aRequestedNotificationContexts = this._createNotificationContextForEachWorkCenter(oSubscription.notificationContext);
            if (this._bGroupSubscriptionSupport) {
                // We're in the "multiple contexts of the same type for one topic" subscription case, so unsubscribe all
                // contexts that are not included in the current subscription request
                let sTopic = oSubscription.notificationContext.getTopic();
                aRequestedNotificationContexts = this._unsubscribeRemovedGroupServerContexts(aRequestedNotificationContexts, sTopic);
            }

            //&* How are subscriptions made for PODs that don't have work center, like operation POD? aRequestedNotificationContexts
            // is always an array of work centers.
            for (let i = 0; i < aRequestedNotificationContexts.length; i++) {

                const oNotificationContext = aRequestedNotificationContexts[i];

                // Ensure that only production context values that have subscriptions are considered
                // when determining if there is an existing matching subscription
                oNotificationConfig.clearContextValuesWithNoSubscription(oNotificationContext);

                if (!this._bGroupSubscriptionSupport && !this.getRetainSubscriptions()) {

                    const oSubscriptionDescriptor = this._getSubscriptionForTopic(oNotificationContext);
                    if (oSubscriptionDescriptor) {

                        // Requested subscription topic matches an existing subscription and the
                        // production context does not match, so first unsubscribe the existing.
                        this.unsubscribeServerEvent(oSubscriptionDescriptor.notificationContext);
                    }
                }

                if (this._proceedWithSubscription(oNotificationContext, oNotificationConfig)) {

                    const sMsgHeaders = oNotificationContext.getMessageHeaders();
                    // Must be at least one production context value header to create a subscription
                    if (sMsgHeaders) {
                        const that = this;
                        if (Log.isLoggable(Log.Level.DEBUG, NOTIFICATIONS_COMPONENT_NAME)) {
                            let sMsgHeaders = JSON.stringify(oNotificationContext.getMessageHeaders()).replace(/"/g, "'");
                            logger.debug("Notifications - Subscribing to topic=" + oNotificationContext.getTopic() + " with headers=" + sMsgHeaders);
                        }
                        const oSubscription = this.getConnectionHandler().getStompClient().subscribe(oNotificationContext.getTopic(), function(oMsg) {
                            const oBody = JSON.parse(oMsg.body);
                            that._fireNotificationMessageEvent(fnMessageCallback, oBody);
                            console.log("Notifications - Message received: '" + oMsg.body + "'");
                            if (Log.isLoggable(Log.Level.DEBUG, NOTIFICATIONS_COMPONENT_NAME)) {
                                let oSimplifiedMsg = {
                                    command: oMsg.command,
                                    headers: oMsg.headers,
                                    body: oMsg.body
                                };
                                let escapedMsg = JSON.stringify(oSimplifiedMsg).replace(/"/g, "'");
                                logger.debug("Notifications - Message received: " + escapedMsg);
                            }
                            fnMessageCallback(oBody);
                        }, sMsgHeaders);
                        // Cache so that we can unsubscribe later
                        this._cacheSubscription(oSubscription, oNotificationContext);
                    }

                } else {
                    logger.info("Skipping subscription: Either the subscription already exists, or the notification configuration and context values do not agree");
                }
            }
        },

        /**
         * Unsubscribe from the given notification context
         * @param oNotificationContext
         */
        unsubscribeServerEvent: function(oNotificationContext) {

            // Ensure we have a connection
            if (!this.getConnectionHandler().isStompConnectionCreated()) {
                logger.warning("No WebSocket connection, unsubscribe will not be executed");
                return;
            }
            let oSubscriptionDescriptor = this._getSubscription(oNotificationContext);
            if (oSubscriptionDescriptor) {
                oSubscriptionDescriptor.subscription.unsubscribe();
                delete this._getServerSubscriptions()[oSubscriptionDescriptor.subscription.id];
            } else {
                logger.warning("Subscription was not found, skipping unsubscribe");
            }
        },

        _proceedWithSubscription: function(oNotificationContext, oNotificationConfig) {

            // Don't create a subscription if the subscription already exists for the
            // topic and production context or if there is no context value for the given notification config
            return oNotificationConfig.hasValuesForSubscription(oNotificationContext) && !this._hasSubscription(oNotificationContext);
        },

        _getSubscriptionForTopic: function(oNotificationContext) {
            let oDescriptor;
            for (let sId in this._serverSubscriptions) {
                oDescriptor = this._serverSubscriptions[sId];
                if (oDescriptor.notificationContext.isEqualToTopicOnly(oNotificationContext)) {
                    return oDescriptor;
                }
            }
        },

        _cacheSubscription: function(oSubscription, oNotificationContext) {

            this._serverSubscriptions[oSubscription.id] = {
                subscription: oSubscription,
                notificationContext: oNotificationContext
            };
        },

        _getServerSubscriptions: function() {
            return this._serverSubscriptions;
        },

        _hasSubscription: function(oNotificationContext) {
            return !!this._getSubscription(oNotificationContext);
        },

        hasSubscriptions: function() {
            return Object.keys(this._getServerSubscriptions()).length > 0;
        },

        _getSubscription: function(oNotificationContext) {
            let oDescriptor;
            for (let sId in this._serverSubscriptions) {
                oDescriptor = this._serverSubscriptions[sId];
                if (oDescriptor.notificationContext.isEqualTo(oNotificationContext)) {
                    return oDescriptor;
                }
            }
        },

        _unsubscribeAllServerEvents: function() {

            // Ensure we have a connection
            if (!this.getConnectionHandler().isStompConnectionCreated()) {
                logger.warning("No WebSocket connection, subscriptions will not be removed");
                return;
            }
            let oSubscriptions = this._getServerSubscriptions();
            for (let sSubscriptionId in oSubscriptions) {
                let oSubscriptionDescriptor = this._getServerSubscriptions()[sSubscriptionId];
                oSubscriptionDescriptor.subscription.unsubscribe();
            }
            this._serverSubscriptions = {};
        },

        // Unsubscribe any currently subscribed context object (like work center) that is not
        // included in aNotificationContexts for the given sTopic.
        _unsubscribeRemovedGroupServerContexts: function(aNotificationContexts, sTopic) {

            // Result collection of NotificationContext objects
            const aNewNotificationContexts = [];
            const oSubscriptionCache = {};
            for (let i = 0; i < aNotificationContexts.length; i++) {
                const oRequestedContext = aNotificationContexts[i];
                const oSubscriptionDescriptor = this._getSubscription(oRequestedContext);
                if (oSubscriptionDescriptor) {

                    // Retain existing matching subscriptions.
                    oSubscriptionCache[oSubscriptionDescriptor.subscription.id] = oSubscriptionDescriptor;

                    // Remove existing subscription from the current cache so that when this loop completes
                    // only subscriptions that are not part of the current subscription request are unsubscribed.
                    delete this._getServerSubscriptions()[oSubscriptionDescriptor.subscription.id];
                } else {
                    // The requested subscription is not already subscribed (in the subscription cache).
                    // This is a newly requested context for the given topic and so return it so that it is subscribed.
                    aNewNotificationContexts.push(oRequestedContext);
                }
            }
            // The only subscriptions that should remain are those that were not included in aNotificationContexts. Of those,
            // whichever match sTopic should be unsubscribed.  The remaining (subscriptions for other topics), should be retained.
            this.unsubscribeAllContextsForTopic(sTopic);

            // Add the remaining subscriptions for other topics back to the subscription cache.
            let oSubscriptions = this._getServerSubscriptions();
            for (let sSubscriptionId in oSubscriptions) {
                oSubscriptionCache[sSubscriptionId] = oSubscriptions[sSubscriptionId];
            }

            this._serverSubscriptions = oSubscriptionCache;
            return aNewNotificationContexts;
        },

        unsubscribeAllContextsForTopic: function(sTopic) {

            // Ensure we have a connection
            if (!this.getConnectionHandler().isStompConnectionCreated()) {
                logger.warning("No WebSocket connection, subscriptions will not be removed");
                return;
            }
            let oSubscriptions = this._getServerSubscriptions();
            for (let sSubscriptionId in oSubscriptions) {
                let oSubscriptionDescriptor = this._getServerSubscriptions()[sSubscriptionId];
                if (oSubscriptionDescriptor.notificationContext.getTopic() === sTopic) {
                    oSubscriptionDescriptor.subscription.unsubscribe();
                    delete this._getServerSubscriptions()[oSubscriptionDescriptor.subscription.id];
                }
            }
        },

        // Create a new NotificationContext object for each comma delimited work center in oNotificationContext
        _createNotificationContextForEachWorkCenter: function(oNotificationContext) {
            const aContexts = [];
            const aContextValues = oNotificationContext.getWorkCenter().split(',');
            for (let i = 0; i < aContextValues.length; i++) {
                const newContext = Object.create(oNotificationContext);
                newContext.setWorkCenter(aContextValues[i]);
                aContexts.push(newContext);
            }
            return aContexts;
        },

        _fireNotificationMessageEvent: function(fnMessageHandler, oMessageBody) {
            // Fires an event to the POD controller.  Allows POD to handle processing
            // framework level notifications.  Required to handle session timeouts.
            let oPodController = this._getController().getPodController();
            if (oPodController && oPodController.fireNotificationMessageEvent) {
                oPodController.fireNotificationMessageEvent(fnMessageHandler, oMessageBody);
            }
        },

        /**
         * Factory method for creating the message subscription context.
         * @param sTopic The message topic
         * @returns {NotificationContext}
         */
        createNotificationContext: function(sTopic) {
            return new NotificationContext(sTopic);
        },

        _getController: function() {
            return this._oController;
        },

        getConnectionHandler: function() {
            return _oConnectionHandler;
        },

        _initNotificationsState: function() {
            this._serverSubscriptions = {};
        }

    });
});