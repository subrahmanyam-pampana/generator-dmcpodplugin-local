sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/podfoundation/controller/MetadataMethodConstants",
    "sap/dm/dme/podfoundation/handler/AssignedButtonsHandler",
    "sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription",
    "sap/dm/dme/podfoundation/extension/PluginExtensionManager",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/podfoundation/model/PodSelectionType"
], function(Controller, Constants, Logging, Bundles, MetadataMethodConstants, AssignedButtonsHandler,
    ServerNotificationSubscription, PluginExtensionManager, PodUtility, PodSelectionType) {
    "use strict";

    const oLogger = Logging.getLogger("sap.dm.dme.podfoundation.controller.PluginViewController");

    /**
     * Constructor for a new Plugin View Controller
     *
     * @param {string} [sId] Id for the new ManagedObject, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new ManagedObject
     *
     * @class
     * <code>sap.dm.dme.podfoundation.controller.PluginViewController</code> provides a set of functions
     * for use by view plugins for executing in the Production Operator Dashboard (POD).
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.controller.PluginViewController
     */
    let PluginViewController = Controller.extend("sap.dm.dme.podfoundation.controller.PluginViewController", {

        metadata: {
            methods: MetadataMethodConstants.PLUGIN_VIEW_CONTROLLER_METHODS
        },

        // This constructor is required so that the Notifications object is created in subclass plugin controllers
        constructor: function(sId, mSettings) {
            Controller.call(this, arguments);
        }
    });

    /**
     * Event subscription map. Contains key-value pairs where:
     * <pre>
     *      `key` is an event name,
     *      `value` is handler function name.
     * </pre>
     * Handler can also accepts boolean `true` value that means that the name of the handler will be
     * the same as the event name prefixed with "on" preposition. For example:
     * <pre>
     * <code>"PodSelectionChangeEvent": true<code> is equal to
     * <code>"PodSelectionChangeEvent": "onPodSelectionChangeEvent"<code>
     * </pre>
     *
     * Use _subscribeEvents and _unsubscribeEvents method to process the entire map accordingly.
     *
     * Override in the plugin populating with needed events.
     */
    PluginViewController.prototype.subscriptions = {};

    /*
     * Goes through the subscription map and subscribes to the events attaching given handlers.
     * If handler name is not provided use default name by prefixing event name with with "on".
     * @private
     */
    PluginViewController.prototype._subscribeEvents = function() {
        for (let sEventName in this.subscriptions) {
            let vHandler = this.subscriptions[sEventName];
            if (vHandler === true) {
                vHandler = "on" + sEventName;
            }

            this.subscribe(sEventName, this[vHandler], this);
        }
    };

    /*
     * Goes through the subscription map and unsubscribes from the events in it.
     * If handler name is not provided use default name by prefixing event name with with "on".
     * @private
     */
    PluginViewController.prototype._unsubscribeEvents = function() {
        for (let sEventName in this.subscriptions) {
            let vHandler = this.subscriptions[sEventName];
            if (vHandler === true) {
                vHandler = "on" + sEventName;
            }

            this.unsubscribe(sEventName, this[vHandler], this);
        }
    };

    PluginViewController.prototype.onInit = function() {
        this._initializeBaseEventHandlers();
        this._getServerNotificationSubscription().init();
        this._getMessageManager().registerObject(this.getView(), true);
    };

    /**
     * Returns the instance of the LifecycleExtension for the controller
     *
     * @returns {object} instance of the LifecycleExtension
     * @protected
     */
    PluginViewController.prototype.getLifecycleExtension = function() {
        // to be implemented by sub-classes
        return null;
    };

    PluginViewController.prototype._initializeBaseEventHandlers = function() {
        this.getView().attachEventOnce("beforeRendering", function() {
            this._onViewEventOnceHandler();
        }.bind(this));
    };

    PluginViewController.prototype._onViewEventOnceHandler = function() {
        this._propagateModelsToPopup();
        this.onBeforeRenderingPlugin();
    };

    PluginViewController.prototype.onExit = function() {
        this._unsubscribeEvents();
        this._getServerNotificationSubscription().destroy();
        this._getMessageManager().unregisterObject(this.getView(), true);

        let oLifecycleExtension = this.getLifecycleExtension();
        if (oLifecycleExtension) {
            oLifecycleExtension.onExit();
        }
    };

    PluginViewController.prototype.handleOnExit = function() {
        // to be implemented by sub-classes
    };

    /*
     * Returns the PluginExtensionManager
     *
     * @returns {PluginExtensionManager} PluginExtensionManager
     * @private
     */
    PluginViewController.prototype._getPluginExtensionManager = function() {
        if (!this._oPluginExtensionManager) {
            this._oPluginExtensionManager = new PluginExtensionManager(this);
        }
        return this._oPluginExtensionManager;
    };

    /**
     * Returns the custom controller extension for the input core extension
     * and extension name.  This will also initialize the extension.
     *
     * @param {object} oCoreExtension Core extension calling this function
     * @param {string} sExtensionName Name of extension to get custom extension for
     * @returns {PluginExtension} Custom PluginExtension if found
     * @public
     */
    PluginViewController.prototype.getCustomControllerExtension = function(oCoreExtension, sExtensionName) {
        let oExtension = this.findCustomControllerExtension(sExtensionName);
        if (oExtension) {
            oExtension.setController(this);
            oExtension.setCoreExtension(oCoreExtension);
        }
        return oExtension;
    };

    /**
     * Returns the custom controller extension for the one defined by the core name
     *
     * @param {string} sExtensionName Name of extension to get custom extension for
     * @returns {PluginExtension} Custom PluginExtension
     * @public
     */
    PluginViewController.prototype.findCustomControllerExtension = function(sExtensionName) {
        let oPluginExtensionManager = this._getPluginExtensionManager();
        return oPluginExtensionManager.findCustomControllerExtension(sExtensionName);
    };

    PluginViewController.prototype._getMessageManager = function() {
        // added to support QUnit tests
        return sap.ui.getCore().getMessageManager();
    };

    /**
     * Function called just once before rendering plugin
     * Add code to subscribe to events and anything
     * else needed for initializing the plugin
     * @public
     */
    PluginViewController.prototype.onBeforeRenderingPlugin = function() {
        this._subscribeEvents();
        let oLifecycleExtension = this.getLifecycleExtension();
        if (oLifecycleExtension) {
            oLifecycleExtension.onBeforeRenderingPlugin();
        }
    };

    PluginViewController.prototype.handleOnBeforeRenderingPlugin = function() {
        // to be implemented by sub-classes
    };

    PluginViewController.prototype.onBeforeRendering = function() {
        let oLifecycleExtension = this.getLifecycleExtension();
        if (oLifecycleExtension) {
            oLifecycleExtension.onBeforeRendering();
        }
    };

    PluginViewController.prototype.handleOnBeforeRendering = function() {
        // to be implemented by sub-classes
    };


    PluginViewController.prototype.onAfterRendering = function() {
        let oLifecycleExtension = this.getLifecycleExtension();
        if (oLifecycleExtension) {
            oLifecycleExtension.onAfterRendering();
        }
    };

    PluginViewController.prototype.handleOnAfterRendering = function() {
        // to be implemented by sub-classes
    };

    /**
     * Function called when the tab that this plugin is
     * assigned to is selected (it's already opened).
     * @public
     */
    PluginViewController.prototype.onTabItemSelected = function() {
        // to be implemented by sub-class
    };

    /**
     * Function called when the tab that this plugin is
     * assigned to is opened on the tab bar.
     * @public
     */
    PluginViewController.prototype.onTabItemOpened = function() {
        // to be implemented by sub-class
    };

    /**
     * Function called when the tab that this plugin is
     * assigned to is closed.
     * @public
     */
    PluginViewController.prototype.onTabItemClosed = function() {
        // to be implemented by sub-class
    };

    /**
     * This will select the tab item that the input tab page
     * is assigned to
     *
     * @param {string} sTabPageName The tab page assigned to the item to select
     * @public
     */
    PluginViewController.prototype.selectTabByTabPageName = function(sTabPageName) {
        if (PodUtility.isNotEmpty(sTabPageName)) {
            let oPodController = this.getPodController();
            if (oPodController) {
                oPodController.selectTabByTabPageName(sTabPageName);
            }
        }
    };

    /**
     * Returns the tab that this plugin is assigned to.
     *
     * @returns {sap.m.IconTabFilter}
     * @public
     */
    PluginViewController.prototype.getTabItem = function() {
        if (!this._oTabItem) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getTabItem) {
                this._oTabItem = ownerComponent.getTabItem();
            }
        }
        return this._oTabItem;
    };

    /**
     * closes the input view plugin
     *
     * @param {object} oViewPlugin The plugin component being closed
     * @public
     */
    PluginViewController.prototype.closePlugin = function(oViewPlugin) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.closePlugin(oViewPlugin);
        }
    };

    /**
     * Default handler for the press event on plugin's Close button
     */
    PluginViewController.prototype.onClosePress = function() {
        this.closePlugin(this);
    };

    /**
     * closes the view plugin and navigates back to previous
     *
     * @param {object} oViewPlugin The plugin component being closed
     * @public
     */
    PluginViewController.prototype.navigateBack = function(oViewPlugin) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.navigateBack(oViewPlugin);
        }
    };

    /**
     * Navigates to the page by the page name
     *
     * @param {string} sPageName The page name to navigate to
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional context to call function with
     * @public
     */
    PluginViewController.prototype.navigateToPage = function(sPageName, fnCallback, fnContext) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.navigateToPage(sPageName, fnCallback, fnContext);
        }
    };

    /**
     * Navigates to the main POD page
     *
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional context to call function with
     * @public
     */
    PluginViewController.prototype.navigateToMainPage = function(fnCallback, fnContext) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.navigateToMainPage(fnCallback, fnContext);
        }
    };

    /**
     * Handles the execution of an navigation button
     *
     * @param {string} sNavigationButtonId Navigation button id
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional context to call function with
     * @public
     */
    PluginViewController.prototype.executeNavigationButton = function(sNavigationButtonId, fnCallback, fnContext) {
        if (PodUtility.isEmpty(sNavigationButtonId)) {
            return;
        }
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.executeNavigationButton(sNavigationButtonId, fnCallback, fnContext);
        }
    };

    /**
     * Handles the execution of an action button
     *
     * @param {string} sActionButtonId Action button id
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional context to call function with
     * @public
     */
    PluginViewController.prototype.executeActionButton = function(sActionButtonId, fnCallback, fnContext) {
        if (PodUtility.isEmpty(sActionButtonId)) {
            return;
        }
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.executeActionButton(sActionButtonId, fnCallback, fnContext);
        }
    };

    /**
     * Handles the execution of a menu button selection
     *
     * @param {string} sButtonId id of button plugin is assigned to
     * @param {string} sPluginId id of plugin to run
     * @public
     */
    PluginViewController.prototype.executeGroupButton = function(sButtonId, sPluginId) {
        if (PodUtility.isEmpty(sButtonId) || PodUtility.isEmpty(sPluginId)) {
            return;
        }
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.executeGroupButton(sButtonId, sPluginId);
        }
    };

    /**
     * Handles the execution of a list containing list of plugin data
     *
     * @param {array} list of plugins to execute (including configuration data)
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional function context to use in calling function
     * @public
     */
    PluginViewController.prototype.executePlugins = function(aPlugins, fnCallback, fnContext) {
        if (PodUtility.isEmpty(aPlugins)) {
            return;
        }
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.executePlugins(aPlugins, fnCallback, fnContext);
        }
    };

    /**
     * Handles the execution of a plugin by it's id
     *
     * @param {string} sPluginId id of plugin to run
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional function context to use in calling function
     * @public
     */
    PluginViewController.prototype.executePlugin = function(sPluginId, fnCallback, fnContext) {
        if (PodUtility.isEmpty(sPluginId)) {
            return;
        }
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.executePlugin(sPluginId, fnCallback, fnContext);
        }
    };

    /**
     * Default handler for the press event on plugin's Back button
     * @public
     */
    PluginViewController.prototype.onBackPress = function() {
        this.navigateBack(this);
    };

    /**
     * Removes a message from the POD Message Popover
     *
     * @param {string} sMessageId Unique ID for message to remove
     * @param {boolean} bDontPublish false to publish event to all pages (default), true to not publish to all pages
     * @public
     */
    PluginViewController.prototype.removeMessageFromPopover = function(sMessageId, bDontPublish) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.removeMessageFromPopover(sMessageId, bDontPublish);
        }
    };

    /**
     * Adds a message to the POD Message Popover.  Providing a unique message ID
     * will allow for the removal of a specific message from the popover
     * using the removeMessageFromPopover() function
     *
     * @param {string} sMessageId Unique ID for message (can be null).  If null a message id will be generated.
     * @param {object} Message data:
     * <pre>
     *    {
     *        type: sap.ui.core.MessageType
     *        title: Error message
     *        description Error Description
     *        subtitle subtitle
     *        linkText text for link (Link will be visible if not null)
     *        linkCallback function to call when link pressed
     *        linkContext function callback context
     *    }
     * </pre>
     * @param {boolean} bDontPublish false to publish event to all pages (default), true to not publish to all pages
     * @return {string} Unique message id for the added message
     * @public
     */
    PluginViewController.prototype.addMessageToPopover = function(sMessageId, oMessageData, bDontPublish) {
        let oPodController = this.getPodController();
        if (oPodController) {
            return oPodController.addMessageToPopover(sMessageId, oMessageData, bDontPublish);
        }
        return null;
    };

    /**
     * Closes the Message Popover control
     *
     * @public
     */
    PluginViewController.prototype.closeMessagePopover = function() {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.closeMessagePopover();
        }
    };

    /**
     * Adds a message to the POD Message Popover
     *
     * @param {string} sType sap.ui.core.MessageType
     * @param {string} sTitle Error message
     * @param {string} sDescription Error Description
     * @param {string} sSubtitle subtitle
     * @return {string} Unique message id for the added message
     * @public
     */
    PluginViewController.prototype.addMessage = function(sType, sTitle, sDescription, sSubtitle) {
        let oPodController = this.getPodController();
        if (oPodController) {
            return oPodController.addMessage(sType, sTitle, sDescription, sSubtitle);
        }
        return null;
    };

    /**
     * Clears all messages in the POD Message Popover
     * @public
     */
    PluginViewController.prototype.clearMessages = function() {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.clearMessages();
        }
    };

    /**
     * Sets focus to a button based on an expired number of milliseconds
     * Example Usage:
     * <pre>
     *     this.setFocus(oControl, 500);
     * </pre>
     * @param {object} oControl the control from the view
     * @param {int} iMilliseconds the number of milliseconds to wait until focus is set (default 500ms)
     * @public
     */
    PluginViewController.prototype.setFocus = function(oControl, iMilliseconds) {
        if (!oControl) {
            return;
        }
        let iTimeout = iMilliseconds || 500;
        setTimeout(function() {
            oControl.focus();
        }, iTimeout);
    };

    /*
     * Returns whether or not the <code>sap.ui.core.EventBus</code> is being used or the POD event handler
     * @private
     */
    PluginViewController.prototype.isUsingEventBus = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.isUsingEventBus) {
            return oPodController.isUsingEventBus();
        }
        return true;
    };

    /**
     * Registers a POD Event Handler to the POD
     *
     * @param {object} POD Event Handler to register
     * @public
     */
    PluginViewController.prototype.registerPodEventHandler = function(oPodEventHandler) {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPodEventController) {
            oPodController.getPodEventController().register(oPodEventHandler);
        }
    };

    /**
     * Attaches an event handler to the event with the given identifier on the given event channel.
     *
     * @param {string} sEventId The identifier of the event to listen for
     * @param {function} fnFunction The handler function to call when the event occurs.
     * @param {object} oListener The object that wants to be notified when the event occurs (this context within the handler function).
     *
     * @see sap.ui.core.EventBus.subscribe
     * @public
     */
    PluginViewController.prototype.subscribe = function(sEventId, fnFunction, oListener) {
        if (this.isUsingEventBus()) {
            let oEventBus = this._getEventBus();
            oEventBus.subscribe(Constants.POD_EVENT_CHANNEL, sEventId, fnFunction, oListener);
            return;
        }
        let oEventHandler = this._getEventHandler();
        oEventHandler.subscribe(this, sEventId, fnFunction, oListener);
    };

    /**
     * Removes a previously subscribed event handler from the event with the given identifier on the given event channel.
     * The passed parameters must match those used for registration with #subscribe beforehand!
     *
     * @param {string} sEventId The identifier of the event to listen for
     * @param {function} fnFunction The handler function to call when the event occurs.
     * @param {object} oListener The object that wants to be notified when the event occurs (this context within the handler function).
     *
     * @see sap.ui.core.EventBus.subscribe
     * @public
     */
    PluginViewController.prototype.unsubscribe = function(sEventId, fnFunction, oListener) {
        if (this.isUsingEventBus()) {
            let oEventBus = this._getEventBus();
            if (oEventBus) {
                oEventBus.unsubscribe(Constants.POD_EVENT_CHANNEL, sEventId, fnFunction, oListener);
            }
            return;
        }
        let oEventHandler = this._getEventHandler();
        oEventHandler.unsubscribe(this, sEventId, fnFunction, oListener);
    };

    /**
     * Attaches a global event handler that will remain until the POD is closed,
     * <p>
     * The main POD controller will manage (unsubsribe) this event when it closes.
     *
     * @param {string} sParentId The unique parent identifier for finding later (i.e.; plugin id)
     * @param {string} sEventId The identifier of the event to listen for
     * @param {function} fnFunction The handler function to call when the event occurs.
     * @param {object} oListener The object that wants to be notified when the event occurs (this context within the handler function).
     *
     * @see sap.ui.core.EventBus.subscribe
     * @public
     */
    PluginViewController.prototype.subscribeGlobalEventHandler = function(sParentId, sEventId, fnFunction, oListener) {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.subscribeGlobalEventHandler) {
            oPodController.subscribeGlobalEventHandler(sParentId, sEventId, fnFunction, oListener);
        }
    };

    /**
     * Finds a global event handler listener object
     *
     * @param {string} sParentId The unique parent identifier
     * @param {string} sEventId The identifier of the event
     * @return {object} event handler object
     * @public
     */
    PluginViewController.prototype.findGlobalEventHandler = function(sParentId, sEventId) {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.findGlobalEventHandler) {
            return oPodController.findGlobalEventHandler(sParentId, sEventId);
        }
        return null;
    };

    /**
     * Fires an event using the specified settings and notifies all attached event handlers..
     *
     * @param {string} sEventId The identifier of the event to fire
     * @param {object} oData The parameters which should be carried by the event
     *
     * @see sap.ui.core.EventBus.subscribe
     * @public
     */
    PluginViewController.prototype.publish = function(sEventId, oData) {
        if (this.isUsingEventBus()) {
            // add plugin id of sending plugin
            let oSendData = oData;
            oSendData.pluginId = this.getPluginId();

            let oEventBus = this._getEventBus();
            oEventBus.publish(Constants.POD_EVENT_CHANNEL, sEventId, oSendData);
            return;
        }

        let oEventHandler = this._getEventHandler();
        oEventHandler.publish(this, sEventId, oData);
    };

    /**
     * Fires event and removes it from the queue
     * @deprecated
     */
    PluginViewController.prototype.fireQueuedEvent = function(oPlugin, sEventId) {
        if (this.isUsingEventBus()) {
            return;
        }
        let oEventHandler = this._getEventHandler();
        if (oEventHandler.fireQueuedEvent) {
            oEventHandler.fireQueuedEvent(oPlugin, sEventId);
        }
    };

    /**
     * Adds a "on request" event to the queue for later retrieval by a plugin.
     * This is only supported when not using the <code>sap.ui.core.EventBus</code>
     *
     * @param {string} sEventId The identifier of the event to fire
     * @param {object} oSendData The parameters which should be carried by the event
     * @public
     */
    PluginViewController.prototype.addOnRequestEvent = function(sEventId, oSendData) {
        if (this.isUsingEventBus()) {
            return;
        }
        let oEventHandler = this._getEventHandler();
        oEventHandler.addOnRequestEvent(sEventId, oSendData);
    };

    /**
     * Fires an on request event and removes it from the queue.
     * This is only supported when not using the <code>sap.ui.core.EventBus</code>
     *
     * @param {string} sEventId The identifier of the event to fire
     * @param {function} fnFunction The handler function to call.
     * @param {object} oListener The context within the handler function.
     * @public
     */
    PluginViewController.prototype.fireOnRequestEvent = function(sEventId, fnFunction, oListener) {
        if (this.isUsingEventBus()) {
            return;
        }
        let oEventHandler = this._getEventHandler();
        oEventHandler.fireOnRequestEvent(sEventId, fnFunction, oListener);
    };

    /**
     * returns if this plugin is the same as the one
     * that fired the original event or not
     *
     * @param {object} oData Object holding "source" or "pluginId" of object firing event
     * @returns {boolean} true if same plugin, else false
     * @public
     */
    PluginViewController.prototype.isEventFiredByThisPlugin = function(oData) {
        if (oData && ((oData.source && oData.source === this) || (oData.pluginId && oData.pluginId === this.getPluginId()))) {
            return true;
        }
        return false;
    };

    /**
     * Returns the POD Selection Model
     *
     * @return {sap.dm.dme.podfoundation.model.PodSelectionModel}
     * @public
     */
    PluginViewController.prototype.getPodSelectionModel = function() {
        let oParentView = this._getPodControllerViewParent();
        if (oParentView && oParentView.getModel) {
            let oModel = oParentView.getModel("podSelectionModel");
            return oModel.getData();
        }
        return null;
    };

    /**
     * Checks if input type is the POD Type
     *
     * @param {string} sPodType POD Type to check
     * @returns {boolean} true if input POD Type is currently active
     * @public
     */
    PluginViewController.prototype.isPodType = function(sPodType) {
        let sType = this.getPodType();
        return (PodUtility.isNotEmpty(sType) && (sPodType === sType));
    };

    /**
     * Returns the POD Type from the model
     *
     * @returns {string} Current POD Type from model
     * @public
     */
    PluginViewController.prototype.getPodType = function() {
        if (PodUtility.isEmpty(this._sPodType)) {
            let oPodSelectionModel = this.getPodSelectionModel();
            if (oPodSelectionModel) {
                this._sPodType = oPodSelectionModel.getPodType();
            }
        }
        return this._sPodType;
    };

    /*
     * function defined for unit tests
     * @private
     */
    PluginViewController.prototype._getPodControllerViewParent = function() {
        let oView = this._getPodControllerView();
        if (oView && oView.getParent) {
            return oView.getParent();
        }
        return null;
    };

    /*
     * function defined for unit tests
     * @private
     */
    PluginViewController.prototype._getPodControllerView = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getView) {
            return oPodController.getView();
        }
        return null;
    };

    /**
     * Returns the current active page view controller
     * @return {sap.ui.core.mvc.Controller} Active Page Controller
     * @public
     */
    PluginViewController.prototype.getActiveViewController = function() {
        let oPodController = this.getPodController();
        if (oPodController) {
            if (oPodController.getActiveViewController) {
                return oPodController.getActiveViewController();
            }
            return oPodController;
        }
        return null;
    };

    /**
     * returns the Main application POD POD controller
     *
     * @returns {sap.ui.core.mvc.Controller} Main application POD controller
     * @public
     */
    PluginViewController.prototype.getPodController = function() {
        if (!this._oPodController) {
            if (!this.isPopup()) {
                let ownerComponent = this.getOwnerComponent();
                if (ownerComponent && ownerComponent.getPodController) {
                    this._oPodController = ownerComponent.getPodController();
                }
            } else {
                // popup needs to go to parent window to get POD Controller
                this._oPodController = window.opener.getPodController();
            }
        }
        return this._oPodController;
    };

    /**
     * Returns the configuration for the running POD
     *
     * @returns {object} POD configuration
     * @public
     */
    PluginViewController.prototype.getPodConfiguration = function() {
        let oPodController = this.getPodController();
        if (!oPodController) {
            // fix for Sonar pipeline build failures
            return null;
        }
        return oPodController.getPodConfiguration();
    };

    /**
     * Returns the Configuration data for the input button ID
     *
     * @param {string} sButtonId Button id
     * @return {object} Button configuration data
     *
     * @public
     */
    PluginViewController.prototype.findButtonConfiguration = function(sButtonId) {
        let oPodController = this.getPodController();
        if (!oPodController) {
            // fix for Sonar pipeline build failures
            return null;
        }
        return oPodController.findButtonConfiguration(sButtonId);
    };

    /*
     * This will propagate the named models from the POD application
     * component container to this plugins owner component.
     * <p>
     * This is required if models defined to the POD application
     * are required by plugins when running in a modal or modeless popup.
     * @private
     */
    PluginViewController.prototype._propagateModelsToPopup = function() {
        let aModels = this.getModelsToPropagate();
        if (!aModels || aModels.length === 0) {
            return;
        }
        let oPodController = this.getPodController();
        if (!oPodController || (!this.isPopup() && !this.isModalPopup())) {
            return;
        }
        for (let i = 0; i < aModels.length; i++) {
            let oModel = oPodController.getOwnerComponent().getModel(aModels[i]);
            if (oModel) {
                this.getOwnerComponent().setModel(oModel, aModels[i]);
            }
        }
    };

    /**
     * Returns the names of models from the POD application
     * that a plugin requires when running in a popup.  The named
     * models will be copied from the POD Owner component to the
     * plugins owner component during initialization.
     *
     * @returns {array} Names of models to propagate
     * @public
     */
    PluginViewController.prototype.getModelsToPropagate = function() {
        return null;
    };

    /*
     * Gets instance of the Server Notifications Subscription class
     *
     * @return ServerNotificationSubscriptions class
     * @private
     */
    PluginViewController.prototype._getServerNotificationSubscription = function() {
        if (!this._oServerNotificationSubscription) {
            this._oServerNotificationSubscription = this.createServerNotificationSubscription();
        }
        return this._oServerNotificationSubscription;
    };

    /**
     * Create the server notification subscription object.  May be overridden by subclasses
     * to create specialized subscriptions.
     *
     * @returns {object} Notifications subscription
     * @public
     */
    PluginViewController.prototype.createServerNotificationSubscription = function() {
        return new ServerNotificationSubscription(this);
    };

    /**
     * Returns the Notifications configuration for the running POD
     * By default this is obtained from the POD configuration
     *
     * @returns {object} Notifications configuration
     * <pre>
     *    {
     *        subscribeWorkCenter: ...,
     *        subscribeOperation: ...,
     *        subscribeResource: ...,
     *        sfcStartNotification: ...,
     *        sfcCompleteNotification: ...,
     *        sfcSelectNotification: ...,
     *        dataCollectionNotification: ...,
     *        backflushFailureMessageNotification: ...,
     *        weighDispenseScaleNotification: ...
     *    }
     * </pre>
     * @public
     */
    PluginViewController.prototype.getNotificationsConfiguration = function() {
        let oPodConfig = this.getPodConfiguration();
        if (!oPodConfig) {
            // fix for Sonar pipeline build failures
            return null;
        }
        return oPodConfig.pages[0].podConfig.notifications;
    };

    /**
     * Returns the instance of the NotificationExtension for the controller
     *
     * @returns {object} instance of the NotificationExtension
     * @protected
     */
    PluginViewController.prototype.getNotificationExtension = function() {
        // to be implemented by sub-classes
        return null;
    };

    /**
     * Returns whether or not this plugin is subscribing to notifications
     *
     * @returns {boolean} false (default), true to enable notifications
     * @protected
     */
    PluginViewController.prototype.isSubscribingToNotifications = function() {
        let oNotificationExtension = this.getNotificationExtension();
        if (oNotificationExtension) {
            return oNotificationExtension.isSubscribingToNotifications();
        }
        return false;
    };

    /**
     * Returns an array of string event names to subscribe to.
     * Event names must be between 4-24 characters in length,
     * start with a alphabetic character and contain only
     * alpha-numeric characters, no spaces and may include
     * _.- special characters.  If these conditions are not
     * met for an event name, the subscription for the event
     * will not be created and an error logged to the console.
     *
     * @returns {array} custom event names to subscribe to
     * @protected
     */
    PluginViewController.prototype.getCustomNotificationEvents = function() {
        let oNotificationExtension = this.getNotificationExtension();
        if (oNotificationExtension) {
            return oNotificationExtension.getCustomNotificationEvents();
        }
        return null;
    };

    /**
     * Returns the function to call when the notification for
     * the input event name is received.
     *
     * @param {string} sEvent is the name of the event (or topic) to get callback function for
     * @returns {function} function handler to call
     * @protected
     */
    PluginViewController.prototype.getNotificationMessageHandler = function(sEvent) {
        let oNotificationExtension = this.getNotificationExtension();
        if (oNotificationExtension) {
            return oNotificationExtension.getNotificationMessageHandler(sEvent);
        }
        return null;
    };

    /**
     * Will update notification subscriptions to latest POD Selection
     * model information.  This not be called in onAfterRendering() or
     * from the handler for "PodSelectionChangeEvent" events since those
     * are already handled by default.
     *
     * @protected
     */
    PluginViewController.prototype.updateNotificationSubscriptions = function() {
        this._getServerNotificationSubscription()._updateNotificationSubscriptions();
    };

    /**
     * Returns the context data for the notification subscription.
     * By default this will be loaded from the POD Selection Model.
     *
     * @returns {object} Object containing following information
     * <pre>
     *    {
     *        resource: ...,
     *        workCenter: ...,
     *        operation: ...
     *    }
     * @protected
     */
    PluginViewController.prototype.getNotificationContextData = function() {
        let oContextData = {};

        // added check for model to fix pipeline Sonar build error.
        let oPodSelectionModel = this.getPodSelectionModel();
        if (oPodSelectionModel) {

            let oResource = oPodSelectionModel.getResource();
            oContextData.resource = oResource ? oResource.resource : undefined;
            //For the type "Order" oContextData.resource is a string instead of object
            if (!oContextData.resource) {
                oContextData.resource = oResource;
            }
            oContextData.workCenter = oPodSelectionModel.getWorkCenter();
            let oOperation = oPodSelectionModel.getOperation();
            //TODO: Handle WC selection when there's a list of operations
            oContextData.operation = oOperation ? oOperation.operation : undefined;
        }
        return oContextData;
    };

    /**
     * Returns the root POD controller's Density Style class
     *
     * @returns {"sapUiSizeCompact" | "sapUiSizeCozy" | null}
     * @public
     */
    PluginViewController.prototype.getContentDensityStyle = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getContentDensityStyle) {
            return oPodController.getContentDensityStyle();
        }
        return null;
    };

    /**
     * returns the plugin name
     *
     * @returns {string} plugin name (i.e.; "sap.dm.dme.plugins.worklistPlugin")
     * @public
     */
    PluginViewController.prototype.getPluginName = function() {
        if (!this._sPluginName) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent) {
                let appConfig = ownerComponent.getManifestEntry("sap.app");
                if (appConfig && appConfig.id) {
                    this._sPluginName = appConfig.id;
                }
            }
        }
        return this._sPluginName;
    };

    /**
     * returns the currently connected user id
     *
     * @returns {string} user id
     * @public
     */
    PluginViewController.prototype.getUserId = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getUserId) {
            return oPodController.getUserId();
        }
        return null;
    };

    /**
     * Returns the plugin id
     *
     * @returns {string} plugin id
     * @public
     */
    PluginViewController.prototype.getPluginId = function() {
        if (!this._sPluginId) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getPluginId) {
                this._sPluginId = ownerComponent.getPluginId();
            }
        }
        return this._sPluginId;
    };

    /**
     * Returns the page name the plugin is assigned to
     *
     * @returns {string} page name
     * @public
     */
    PluginViewController.prototype.getPageName = function() {
        if (!this._sPageName) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getPageName) {
                this._sPageName = ownerComponent.getPageName();
            }
            if (!this._sPageName) {
                this._sPageName = this._getPageNameFromConfiguration();
            }
        }
        return this._sPageName;
    };

    /*
     * Returns the name of the page the plugin was defined on
     * by searching the POD Configuration data
     *
     * @returns {string} Page name plugin is defined on
     * @private
     */
    PluginViewController.prototype._getPageNameFromConfiguration = function() {
        let oPodController = this.getPodController();
        if (oPodController) {
            let sPluginId = this.getPluginId();
            return oPodController.getExecutionUtility().findPageNameByControlId(sPluginId);
        }
        return null;
    };

    /**
     * Returns the name of the page the plugin was defined on.
     * This will be either a tab page or standard page
     *
     * @returns {string} Page name plugin is defined on
     * @public
     */
    PluginViewController.prototype.getDefinedOnPageName = function() {
        if (!this._sDefinedOnPageName) {
            let oPodController = this.getPodController();
            if (oPodController) {
                let sPluginId = this.getPluginId();
                this._sDefinedOnPageName = oPodController.getExecutionUtility().findDefinedOnPageNameByControlId(sPluginId);
            }
        }
        return this._sDefinedOnPageName;
    };

    /**
     * Returns the DynamicPageTitle assigned to the current page
     *
     * @returns {sap.f.DynamicPageTitle} Dynamic page title
     * @public
     */
    PluginViewController.prototype.getDynamicPageTitle = function() {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            return oViewController.getDynamicPageTitle();
        }
        return null;
    };

    /**
     * Returns the display type plugin is in
     *
     * @returns {string} "view" or "popup"
     * @public
     */
    PluginViewController.prototype.getDisplayType = function() {
        if (!this._sDisplayType) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getDisplayType) {
                this._sDisplayType = ownerComponent.getDisplayType();
            }
        }
        return this._sDisplayType;
    };

    /**
     * Returns whether plugin is a default plugin or not
     *
     * @returns {boolean} true if a "default" plugin; else false
     * @public
     */
    PluginViewController.prototype.isDefaultPlugin = function() {
        if (typeof this._bDefaultPlugin === "undefined") {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getDefaultPlugin) {
                this._bDefaultPlugin = ownerComponent.getDefaultPlugin();
            }
        }
        return this._bDefaultPlugin;
    };

    /**
     * returns whether plugin is a modeless popup or not
     *
     * @returns {boolean} true if a modeless "popup"; else false
     * @public
     */
    PluginViewController.prototype.isPopup = function() {
        let displayType = this.getDisplayType();
        if (!displayType || (displayType !== "popup" && displayType !== "popup_modeless")) {
            return false;
        }
        return true;
    };

    /**
     * returns whether plugin is a modal popup or not
     *
     * @returns {boolean} true if a modal "popup"; else false
     * @public
     */
    PluginViewController.prototype.isModalPopup = function() {
        let displayType = this.getDisplayType();
        if (!displayType || displayType !== "popup_modal") {
            return false;
        }
        return true;
    };

    /**
     * returns whether POD is running in SFC POD Selection Mode
     *
     * @returns {boolean} true if SFC Mode; else false
     * @public
     */
    PluginViewController.prototype.isSfcPodSelectionMode = function() {
        let oPodSelectionModel = this.getPodSelectionModel();
        if (oPodSelectionModel) {
            let sPodSelectionType = oPodSelectionModel.getPodSelectionType();
            if (PodUtility.isNotEmpty(sPodSelectionType) && sPodSelectionType === PodSelectionType.Sfc) {
                return true;
            }
        }
        return false;
    };

    /**
     * returns the plugin's unique configuration data
     *
     * @returns {object} plugin's configuration data
     * @public
     */
    PluginViewController.prototype.getConfiguration = function() {
        if (!this._oPluginConfiguration) {
            let ownerComponent = this.getOwnerComponent();
            if (ownerComponent && ownerComponent.getConfiguration) {
                this._oPluginConfiguration = ownerComponent.getConfiguration();
            }
        }
        return this._oPluginConfiguration;
    };

    /**
     * Gets value for the input property from the plugins configuration
     *
     * @param {string} sProperty Property name to get from configuration
     * @returns {object} value for property if defined
     * @public
     */
    PluginViewController.prototype.getConfigurationValue = function(sProperty) {
        let oConfiguration = this.getConfiguration();
        if (oConfiguration) {
            return oConfiguration[sProperty];
        }
        return null;
    };

    /**
     * Renders assigned buttons and optionally assigns them to the input container
     *
     * @param {array} array of button definitions
     * @param {object} oContainer Optional container to add buttons to
     * @return {array} array of created buttons
     * @public
     */
    PluginViewController.prototype.renderAssignedButtons = function(aButtonDefinitions, oContainer) {
        let oAssignedButtonsHandler = this.getAssignedButtonsHandler();
        return oAssignedButtonsHandler.renderButtons(aButtonDefinitions, oContainer);
    };

    /**
     * Returns handler for rendering assigned buttons
     * Must implement function interface renderButtons(aButtonDefinitions, oContainer)
     *
     * @return {object} handler for rendering assigned buttons
     * @public
     */
    PluginViewController.prototype.getAssignedButtonsHandler = function() {
        return new AssignedButtonsHandler(this);
    };

    /**
     * Sets Busy indicator in plugin
     *
     * @param {boolean} bShow true to show indicator, false to hide
     * @param {string} sContextId Optional string to identify the caller
     * @public
     */
    PluginViewController.prototype.setBusy = function(bShow, sContextId) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.getView().setBusy(bShow, sContextId);
            return;
        }
        this.getView().setBusy(bShow);
    };

    /**
     * makes an Ajax get request
     *
     * @param {string} sUrl request
     * @param {string} sParameters parameters to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                  if not defined, standard error message
     *                  will be displayed.
     * @public
     */
    PluginViewController.prototype.ajaxGetRequest = function(sUrl, sParameters, fnSuccess, fnFailure) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.ajaxGetRequest(sUrl, sParameters, fnSuccess, fnFailure);
        }
    };

    /**
     * makes an Ajax post request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                  if not defined, standard error message
     *                  will be displayed.
     * @public
     */
    PluginViewController.prototype.ajaxPostRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.ajaxPostRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
        }
    };

    /**
     * makes an Ajax patch request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                  if not defined, standard error message
     *                  will be displayed.
     * @public
     */
    PluginViewController.prototype.ajaxPatchRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.ajaxPatchRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
        }
    };

    /**
     * makes an Ajax put request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                  if not defined, standard error message
     *                  will be displayed.
     * @public
     */
    PluginViewController.prototype.ajaxPutRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.ajaxPutRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
        }
    };

    /**
     * makes an Ajax delete request
     *
     * @param {string} sUrl request
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                  if not defined, standard error message
     *                  will be displayed.
     * @param {object} oJsonPayload optional object to send
     * @public
     */
    PluginViewController.prototype.ajaxDeleteRequest = function(sUrl, fnSuccess, fnFailure, oJsonPayload) {
        let oViewController = this.getActiveViewController();
        if (oViewController) {
            oViewController.ajaxDeleteRequest(sUrl, fnSuccess, fnFailure, oJsonPayload);
        }
    };

    /**
     * Returns the i18n resource bundle for this controller
     *
     * @returns {sap.base.i18n.ResourceBundle} for this controller
     * @public
     */
    PluginViewController.prototype.getI18nResourceBundle = function() {
        if (!this.i18nResourceBundle && this.getView()) {
            let oI18nModel = this.getView().getModel("i18n");
            if (!oI18nModel) {
                let ownerComponent = this.getOwnerComponent();
                if (ownerComponent && ownerComponent.getModel) {
                    oI18nModel = ownerComponent.getModel("i18n");
                }
            }
            if (oI18nModel) {
                this.i18nResourceBundle = oI18nModel.getResourceBundle();
            }
        }
        return this.i18nResourceBundle;
    };

    /**
     * Returns the plugin i18n text for the input key
     *
     * @param {string} sKey key of text to get
     * @param {Array} aArgs List of parameter values which should replace the placeholders "{n}".
     * @returns {string} i18n text if found, else the input key
     * @public
     */
    PluginViewController.prototype.getI18nText = function(sKey, aArgs) {
        let oResourceBundle = this.getI18nResourceBundle();
        if (!oResourceBundle) {
            return sKey;
        }
        return oResourceBundle.getText(sKey, aArgs);
    };

    /**
     * Returns the global i18n text for the input key
     *
     * @param {string} sKey key of text to get
     * @param {Array} aArgs List of parameter values which should replace the placeholders "{n}".
     * @returns {string} i18n text if found, else the input key
     * @public
     */
    PluginViewController.prototype.getGlobalI18nText = function(sKey, aArgs) {
        return Bundles.getGlobalBundle().getText(sKey, aArgs);
    };

    /**
     * Returns the user preference object for the input key
     *
     * @param {string} sPreferenceKey key of user preference object to get
     * @returns {object} the user preference JSON object
     * @public
     */
    PluginViewController.prototype.getUserPreference = function(sPreferenceKey) {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getUserPreferences) {
            let oUserPreferences = oPodController.getUserPreferences();
            if (oUserPreferences) {
                return oUserPreferences.getPreference(sPreferenceKey);
            }
        }
        return null;
    };

    /**
     * Sets the user preference object by the given key
     *
     * @param {string} sPreferenceKey key of user preference object to set
     * @param {object} oUserPreference user preference object to store
     * @public
     */
    PluginViewController.prototype.setUserPreference = function(sPreferenceKey, oUserPreference) {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getUserPreferences) {
            let oUserPreferences = oPodController.getUserPreferences();
            if (oUserPreferences) {
                oUserPreferences.setPreference(sPreferenceKey, oUserPreference);
            }
        }
    };

    /**
     * Store a value in a global model
     * @param {string} sPropertyName property name for storing a value
     * @param {object} oValue stored value
     * @public
     */
    PluginViewController.prototype.setGlobalProperty = function(sPropertyName, oValue) {
        let oOwnerComponent = this.getOwnerComponent();
        if (oOwnerComponent) {
            oOwnerComponent.setGlobalProperty(sPropertyName, oValue);
        }
    };

    /**
     * Retrieve a value from a global model
     * @param {string} sPropertyName property name for retrieving a value
     * @returns {object} Stored value
     * @public
     */
    PluginViewController.prototype.getGlobalProperty = function(sPropertyName) {
        let oOwnerComponent = this.getOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalProperty(sPropertyName);
        }
        return null;
    };

    /**
     * Retrieve and remove a value from a global model
     * @param {string} sPropertyName property name for retrieving a value
     * @returns {object} Stored value
     * @public
     */
    PluginViewController.prototype.removeGlobalProperty = function(sPropertyName) {
        let oOwnerComponent = this.getOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.removeGlobalProperty(sPropertyName);
        }
        return null;
    };

    /**
     * Returns the global application JSONModel
     * @returns {sap.ui.model.json.JSONModel}
     * @public
     */
    PluginViewController.prototype.getGlobalModel = function() {
        let oOwnerComponent = this.getOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalModel();
        }
        return null;
    };

    /**
     * Returns the query parameter value
     *
     * @param {string} sParameter name of query parameter to return value for
     * @returns {string} parameter value
     * @public
     */
    PluginViewController.prototype.getQueryParameter = function(sParameter) {
        return this.getPodController().getQueryParameter(sParameter);
    };

    /**
     * Returns the uri for the Plant DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPlantDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPlantDataSourceUri) {
            return oPodController.getPlantDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PLANT_DS_PATH);
    };

    /**
     * Returns the uri for the Plant Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPlantRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPlantRestDataSourceUri) {
            return oPodController.getPlantRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PLANT_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Product DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getProductDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductDataSourceUri) {
            return oPodController.getProductDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PRODUCT_DS_PATH);
    };

    /**
     * Returns the uri for the Product Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getProductRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductRestDataSourceUri) {
            return oPodController.getProductRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PRODUCT_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Production DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getProductionDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductionDataSourceUri) {
            return oPodController.getProductionDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PRODUCTION_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Production OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getProductionODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductionODataDataSourceUri) {
            return oPodController.getProductionODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PRODUCTION_DS_PATH);
    };

    /**
     * Returns the uri for the Pod Foundation DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPodFoundationDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPodFoundationDataSourceUri) {
            return oPodController.getPodFoundationDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.POD_FOUNDATION_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Pod Foundation OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPodFoundationODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPodFoundationODataDataSourceUri) {
            return oPodController.getPodFoundationODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.POD_FOUNDATION_DS_PATH);
    };

    /**
     * Returns the uri for the Non Conformance DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getNonConformanceDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getNonConformanceDataSourceUri) {
            return oPodController.getNonConformanceDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.NON_CONFORMANCE_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Non Conformance OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getNonConformanceODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getNonConformanceODataDataSourceUri) {
            return oPodController.getNonConformanceODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.NON_CONFORMANCE_DS_PATH);
    };

    /**
     * Returns the uri for the Assembly DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getAssemblyDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAssemblyDataSourceUri) {
            return oPodController.getAssemblyDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.ASSEMBLY_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Assembly OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getAssemblyODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAssemblyODataDataSourceUri) {
            return oPodController.getAssemblyODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.ASSEMBLY_DS_PATH);
    };

    /**
     * Returns the uri for the Classification DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getClassificationDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getClassificationDataSourceUri) {
            return oPodController.getClassificationDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.CLASSIFICATION_DS_PATH);
    };


    /**
     * Returns the uri for the Demand DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getDemandODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getDemandODataDataSourceUri) {
            return oPodController.getDemandODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.DEMAND_DS_PATH);
    };

    /**
     * Returns the uri for the Demand Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getDemandRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getDemandRestDataSourceUri) {
            return oPodController.getDemandRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.DEMAND_DS_REST_PATH);
    };


    /**
     * Returns the uri for the Inventory DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getInventoryDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getInventoryDataSourceUri) {
            return oPodController.getInventoryDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.INVENTORY_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Inventory OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getInventoryODataDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getInventoryODataDataSourceUri) {
            return oPodController.getInventoryODataDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.INVENTORY_DS_PATH);
    };

    /**
     * Returns the uri for the Work Instruction Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getWorkInstructionRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getWorkInstructionRestDataSourceUri) {
            return oPodController.getWorkInstructionRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.WI_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Work Instruction DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getWorkInstructionDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getWorkInstructionDataSourceUri) {
            return oPodController.getWorkInstructionDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.WI_DS_PATH);
    };

    /**
     * Returns the uri for the Data Collection Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getDataCollectionRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getDataCollectionRestDataSourceUri) {
            return oPodController.getDataCollectionRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.DC_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Data Collection DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getDataCollectionDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getDataCollectionDataSourceUri) {
            return oPodController.getDataCollectionDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.DC_DS_PATH);
    };

    /**
     * Returns the uri for the OEE Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getOEERestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getOEERestDataSourceUri) {
            return oPodController.getOEERestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.OEE_DS_REST_PATH);
    };

    /**
     * Returns the uri for the OEE DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getOEEDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getOEEDataSourceUri) {
            return oPodController.getOEEDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.OEE_DS_PATH);
    };

    /**
     * Returns the uri for the SAP Asset Intelligence Network rest DataSource. It mostly used for file upload.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getAinRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAinRestDataSourceUri) {
            return oPodController.getAinRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.AIN_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Asset Intelligence Network DataSource.  Used to get material image files
     *
     * @return uri
     * @public
     */
    PluginViewController.prototype.getAinDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAinDataSourceUri) {
            return oPodController.getAinDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.AIN_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Packing Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPackingRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPackingRestDataSourceUri) {
            return oPodController.getPackingRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PACKING_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Packing Odata DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPackingODataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPackingRestDataSourceUri) {
            return oPodController.getPackingODataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PACKING_DS_ODATA_PATH);
    };

    /**
     * Returns the uri for the Numbering Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getNumberingRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getNumberingRestDataSourceUri) {
            return oPodController.getNumberingRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.NUMBERING_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Process Engine (PE) Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPeRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPeRestDataSourceUri) {
            return oPodController.getPeRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PE_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Factory Model (FM) Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getFmRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getFmRestDataSourceUri) {
            return oPodController.getFmRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.FM_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Public API Hub Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getPublicApiRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPublicApiRestDataSourceUri) {
            return oPodController.getPublicApiRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.PUBLIC_API_HUB_REST_PATH);
    };

    /**
     * Returns the uri for the Image Overlay DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getImageOverlayDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getImageOverlayDataSourceUri) {
            return oPodController.getImageOverlayDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.IMAGE_OVERLAY_DS_PATH);
    };

    /**
     * Returns the uri for the input dataSource name from the manifest.
     *
     * @returns {string} DataSource URI
     * @public
     */
    PluginViewController.prototype.getDataSourceUriFromManifest = function(sPath) {
        let oOwnerComponent = this.getOwnerComponent();
        if (oOwnerComponent) {
            if (oOwnerComponent.getBaseManifestEntry) {
                // when owner extends from sap.dm.dme.component.base.BaseComponent
                return oOwnerComponent.getBaseManifestEntry(sPath);
            } else if (oOwnerComponent.getManifestEntry) {
                // when owner extends from sap.ui.core.UIComponent
                return oOwnerComponent.getManifestEntry(sPath);
            }
        }
        this._logMessage("getDataSourceUriFromManifest: datasource for '" + sPath + "' not found in manifest");
        return null;
    };

    /**
     * Returns the uri for the Activity Confirmation DataSource
     *
     * @returns {string} uri
     * @public
     */
    PluginViewController.prototype.getActivityConfirmationDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getActivityConfirmationDataSourceUri) {
            return oPodController.getActivityConfirmationDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.AC_DS_PATH);
    };

    /**
     * Returns the uri for the Activity Confirmation Rest DataSource
     *
     * @returns {string} uri
     * @public
     */
    PluginViewController.prototype.getActivityConfirmationRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getActivityConfirmationRestDataSourceUri) {
            return oPodController.getActivityConfirmationRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.AC_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Activity Confirmation Rest DataSource
     *
     * @returns {string} uri
     * @public
     */
    PluginViewController.prototype.getQualityInspectionRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getQualityInspectionRestDataSourceUri) {
            return oPodController.getQualityInspectionRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.QUALITY_INSPECTION_REST_PATH);
    };

    /**
     * Returns the uri for the Quality Inspection DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getQualityInspectionDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getQualityInspectionDataSourceUri) {
            return oPodController.getQualityInspectionDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.QUALITY_INSPECTION_DS_PATH);
    };

    /**
     * Returns the uri for the Tool Rest DataSource
     *
     * @returns {string} uri
     * @public
     */
    PluginViewController.prototype.getToolRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getToolRestDataSourceUri) {
            return oPodController.getToolRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.TOOL_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Logistics Rest DataSource
     *
     * @returns {string} uri
     * @public
     */
    PluginViewController.prototype.getLogisticsRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getLogisticsRestDataSourceUri) {
            return oPodController.getLogisticsRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.LOGISTICS_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Alert Rest DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getAlertRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAlertRestDataSourceUri) {
            return oPodController.getAlertRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.ALERT_DS_REST_PATH);
    };

    /**
     * Returns the uri for the Alert OData DataSource.
     * Gets it from POD normally. If plugin runs stand-alone gets it from plugin's manifest.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getAlertODataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAlertODataSourceUri) {
            return oPodController.getAlertODataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.ALERT_DS_ODATA_PATH);
    };

    /**
     * Returns the uri for the Time Tracking Rest DataSource.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    PluginViewController.prototype.getTimeTrackingRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getTimeTrackingRestDataSourceUri) {
            return oPodController.getTimeTrackingRestDataSourceUri();
        }
        return this.getDataSourceUriFromManifest(Constants.TIMETRACKING_DS_REST_PATH);
    };

    PluginViewController.prototype._logMessage = function(sMessage) {
        // added to support stubbing QUnit tests
        oLogger.error(sMessage);
    };

    /**
     * Displays the input error as a MessageToast or MessageBox
     * <p>
     * oError can be a string or oError.message or oError.error.message
     *
     * @param {string | object} oError object or string containing message to display
     * @param {boolean} bShowAsToast Flag to display message a toast instead of the modal message box. <code>false</code> by default.
     * @param {boolean} bAddToMessagePopover Frag whether to add the message to the Message Popover. <code>false</code> by default.
     * @param {sap.ui.core.MessageType} sMessageType MessageType to use when adding to MessagePopover. <code>MessageType.Error</code> by default.
     * @public
     */
    PluginViewController.prototype.showErrorMessage = function(oError, bShowAsToast, bAddToMessagePopover, sMessageType) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.showErrorMessage(oError, bShowAsToast, bAddToMessagePopover, sMessageType);
        }
    };

    /**
     * Displays success message as a MessageToast or MessageBox
     *
     * @param sMessage string message to display
     * @param bShowAsToast Flag to display message a toast instead of the modal message box. <code>false</code> by default.
     * @param bAddToMessagePopover Flag whether to add the message to the Message Popover. <code>false</code> by default.
     * @public
     */
    PluginViewController.prototype.showSuccessMessage = function(sMessage, bShowAsToast, bAddToMessagePopover) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.showSuccessMessage(sMessage, bShowAsToast, bAddToMessagePopover);
        }
    };

    /**
     * Displays the message as a MessageToast or MessageBox and optionally adds to message popover
     *
     * @param sMessage string message to display
     * @param bShowAsToast Flag to display message a toast instead of the modal message box.
     * @param bAddToMessagePopover Flag whether to add the message to the Message Popover.
     * @param sMessageType MessageType to use when adding to MessagePopover.
     * @public
     */
    PluginViewController.prototype.showMessage = function(sMessage, bShowAsToast, bAddToMessagePopover, sMessageType) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.showMessage(sMessage, bShowAsToast, bAddToMessagePopover, sMessageType);
        }
    };

    /**
     * Returns if this plugin can be closed with a plugin close button
     * @returns true if plugin can be closed, else false
     * @public
     */
    PluginViewController.prototype.isCloseable = function() {
        return !(this.isPopup() || this.isDefaultPlugin());
    };

    // gets EventHandler for unit tests
    PluginViewController.prototype._getEventHandler = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getEventHandler) {
            return oPodController.getEventHandler();
        }
        return null;
    };

    // gets EventBus for unit tests
    PluginViewController.prototype._getEventBus = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getEventBus) {
            return oPodController.getEventBus();
        }
        return null;
    };

    PluginViewController.prototype._configureNavigationButtonVisibility = function() {
        let oView = this.getView();
        let oConfiguration = this.getConfiguration();
        let bBackVisible = true;
        let bCloseVisible = true;
        if (!this.isCloseable()) {
            bCloseVisible = false;
            bBackVisible = false;
        } else if (oConfiguration) {
            bBackVisible = typeof oConfiguration.backButtonVisible === "undefined" ? true : oConfiguration.backButtonVisible;
            bCloseVisible = typeof oConfiguration.closeButtonVisible === "undefined" ? true : oConfiguration.closeButtonVisible;
        }

        let oBackButton = oView.byId("backButton");
        if (oBackButton) {
            oBackButton.setVisible(bBackVisible);
        }
        let oCloseButton = oView.byId("closeButton");
        if (oCloseButton) {
            oCloseButton.setVisible(bCloseVisible);
        }
    };

    return PluginViewController;
});