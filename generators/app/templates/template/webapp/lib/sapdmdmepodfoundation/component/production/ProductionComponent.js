sap.ui.define([
    "sap/ui/core/Component",
    "sap/dm/dme/podfoundation/popup/PopupHandler",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/model/ResourceModelEnhancer",
    "sap/dm/dme/podfoundation/model/Selection",
    "sap/dm/dme/podfoundation/model/SfcKeyData"
], function(Component, PopupHandler, PodUtility, Constants, ResourceModelEnhancer, Selection, SfcKeyData) {
    "use strict";

    const sOpenNcCodeErrorCode = "checkForOpenNonConformanceExtension.openNc.found";

    /**
     * Constructor for a new Component
     *
     * @param {string} [sId] Id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * <code>sap.dm.dme.podfoundation.component.production.ProductionComponent</code> control provides a set of functions
     * for use by Execution type POD plugins.
     *
     * @extends sap.ui.core.Component
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.component.production.ProductionComponent
     */
    let ProductionComponent = Component.extend("sap.dm.dme.podfoundation.component.production.ProductionComponent", {
        metadata: {
            metadata: {
                manifest: "json"
            },
            properties: {
                /**
                 * Defines the name of the execution plugin
                 */
                id: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the execution plugin class name
                 */
                pluginId: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the name of the page the plugin is assigned to
                 */
                pageName: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the Main POD Controller
                 */
                podController: {
                    type: "object",
                    group: "Misc"
                },
                /**
                 * Defines the plugins configuration settings
                 */
                configuration: {
                    type: "object",
                    group: "Misc"
                },
                /**
                 * Defines whether this is the last button action
                 */
                lastButtonAction: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                }
            },
            publicMethods: [
                "execute",
                "complete",
                "isBlockingEnabled",
                "subscribe",
                "unsubscribe",
                "publish"
                //TODO Add unsubscribe to destroy event of execution plugin
            ]
        },

        init: function() {
            // applies any Process Industry type bundles that may be defined (i.e. pi_i18n.properties or others with a pi_ prefix)
            ResourceModelEnhancer.enhanceModelsfromManifest(this);
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
    ProductionComponent.prototype.subscriptions = {};

    /*
     * Goes through the subscription map and subscribes to the events attaching given handlers.
     * If handler name is not provided use default name by prefixing event name with with "on".
     * @private
     */
    ProductionComponent.prototype._subscribeEvents = function() {
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
    ProductionComponent.prototype._unsubscribeEvents = function() {
        for (let sEventName in this.subscriptions) {
            let vHandler = this.subscriptions[sEventName];
            if (vHandler === true) {
                vHandler = "on" + sEventName;
            }

            this.unsubscribe(sEventName, this[vHandler], this);
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
    ProductionComponent.prototype.subscribe = function(sEventId, fnFunction, oListener) {
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
    ProductionComponent.prototype.unsubscribe = function(sEventId, fnFunction, oListener) {
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

    /*
     * used internally to set the POD Controller
     *
     * @param {sap.ui.core.mvc.Controller} oPodController main POD controller object
     * @private
     */
    ProductionComponent.prototype.setPodController = function(oPodController) {
        this.setProperty("podController", oPodController);
        return this;
    };

    /*
     * used internally to set the id
     *
     * @param {string} sId
     * @private
     */
    ProductionComponent.prototype.setId = function(sId) {
        this.setProperty("id", sId);
        return this;
    };

    /*
     * used internally to set the plugin id
     *
     * @param {string} sPluginId
     * @private
     */
    ProductionComponent.prototype.setPluginId = function(sPluginId) {
        this.setProperty("pluginId", sPluginId);
        return this;
    };

    /*
     * used internally to set the configuration
     *
     * @param {object} oConfiguration
     * @private
     */
    ProductionComponent.prototype.setConfiguration = function(oConfiguration) {
        this.setProperty("configuration", oConfiguration);
        return this;
    };

    /**
     * returns the POD Selection Model
     *
     * @returns sap.dm.dme.podfoundation.pod.model.PodSelectionModel
     * @public
     */
    ProductionComponent.prototype.getPodSelectionModel = function() {
        // get from pod controller first
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPodSelectionModel) {
            let oPodSelectionModel = oPodController.getPodSelectionModel();
            if (oPodSelectionModel) {
                return oPodSelectionModel;
            }
        }
        // not found, get from view
        let oParentView = this._getPodControllerViewParent();
        if (oParentView && oParentView.getModel) {
            let oModel = oParentView.getModel("podSelectionModel");
            return oModel.getData();
        }
        return null;
    };

    /*
     * function defined for unit tests returns Main POD views parent
     * @private
     */
    ProductionComponent.prototype._getPodControllerViewParent = function() {
        let oView = this._getPodControllerView();
        if (oView && oView.getParent) {
            return oView.getParent();
        }
        return null;
    };

    /*
     * function defined for unit tests returns Main POD view
     * @private
     */
    ProductionComponent.prototype._getPodControllerView = function() {
        return this.getPodController().getView();
    };

    /**
     * starts execution of the plugin
     *
     * @returns false to terminate processing; else will not terminate processing
     * @public
     */
    ProductionComponent.prototype.execute = function() {
        return true;
    };

    /**
     * This describes if the execute function will run synchronously.  If not
     * the complete() function must be called to end asynchronous execution of
     * the plugin
     *
     * @returns true if execute will execute Synchronously; else false  (default)
     * @public
     */
    ProductionComponent.prototype.isSynchronousExecution = function() {
        return false;
    };

    /**
     * This describes if the execute function returns a Promise or
     * a boolean result
     *
     * @returns true if execute() function returns a Promise; else false (default)
     * @public
     */
    ProductionComponent.prototype.isExecuteReturningPromise = function() {
        return false;
    };

    /**
     * completes the current executing execution plugin
     *
     * @param {boolean} bTerminateProcessing true to terminate processing and not continue to next activity; else false
     * @public
     */
    ProductionComponent.prototype.complete = function(bTerminateProcessing) {
        let _bTerminateProcessing = bTerminateProcessing;
        if (typeof bTerminateProcessing === "undefined") {
            _bTerminateProcessing = false;
        }
        let oPodController = this.getPodController();
        this._delayedCall(oPodController, _bTerminateProcessing);
    };

    /**
     * Destroys the current executing execution plugin.  This should
     * only be called in cases when another class is managing
     * lifecycle of plugin.  In normal circumstances you should
     * call complete() to stop execution
     *
     * @public
     */
    ProductionComponent.prototype.destroyPlugin = function() {
        let oPodController = this.getPodController();
        oPodController.destroyExecutionPlugin(this);
    };

    /*
     * runs complete in delayed call (in case is called from execute() method.
     * Added to support mocking in QUnit tests
     * @private
     */
    ProductionComponent.prototype._delayedCall = function(oPodController, bTerminateProcessing) {
        let iTimerValue = this.getCompleteTimeoutTimerValue();
        setTimeout(function() {
            oPodController.completeExecution(bTerminateProcessing);
        }, iTimerValue);
    };

    /**
     * Handles the execution of an navigation button
     *
     * @param {string} sNavigationButtonId Navigation button id
     * @param {function} fnCallback optional function to call when processing is done
     * @param {object} fnContext optional context to call function with
     * @public
     */
    ProductionComponent.prototype.executeNavigationButton = function(sNavigationButtonId, fnCallback, fnContext) {
        if (PodUtility.isNotEmpty(sNavigationButtonId)) {
            this.getPodController().executeNavigationButton(sNavigationButtonId, fnCallback, fnContext);
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
    ProductionComponent.prototype.executeActionButton = function(sActionButtonId, fnCallback, fnContext) {
        if (PodUtility.isNotEmpty(sActionButtonId)) {
            this.getPodController().executeActionButton(sActionButtonId, fnCallback, fnContext);
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
    ProductionComponent.prototype.executePlugin = function(sPluginId, fnCallback, fnContext) {
        if (PodUtility.isNotEmpty(sPluginId)) {
            this.getPodController().executePlugin(sPluginId, fnCallback, fnContext);
        }
    };

    /**
     * Removes a message from the POD Message Popover
     *
     * @param {string} sMessageId Unique ID for message to remove
     * @param {boolean} bDontPublish false to publish event to all pages (default), true to not publish to all pages
     * @public
     */
    ProductionComponent.prototype.removeMessageFromPopover = function(sMessageId, bDontPublish) {
        this.getPodController().removeMessageFromPopover(sMessageId, bDontPublish);
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
    ProductionComponent.prototype.addMessageToPopover = function(sMessageId, oMessageData, bDontPublish) {
        return this.getPodController().addMessageToPopover(sMessageId, oMessageData, bDontPublish);
    };

    /**
     * Closes the Message Popover control
     *
     * @public
     */
    ProductionComponent.prototype.closeMessagePopover = function() {
        this.getPodController().closeMessagePopover();
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
    ProductionComponent.prototype.addMessage = function(sType, sTitle, sDescription, sSubtitle) {
        return this.getPodController().addMessage(sType, sTitle, sDescription, sSubtitle);
    };

    /**
     * Clears all messages in the POD Message Popover
     *
     * @public
     */
    ProductionComponent.prototype.clearMessages = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.clearMessages) {
            this.getPodController().clearMessages();
        }
    };


    /**
     * Clears all messages in the POD Message Popover
     *
     * @protected
     */
    ProductionComponent.prototype.isUsingEventBus = function() {
        let oPodController = this.getPodController();
        if (oPodController.isUsingEventBus) {
            return oPodController.isUsingEventBus();
        }
        return true;
    };

    // gets EventHandler for unit tests
    ProductionComponent.prototype._getEventHandler = function() {
        let oPodController = this.getPodController();
        if (oPodController.getEventHandler) {
            return oPodController.getEventHandler();
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
    ProductionComponent.prototype.publish = function(sEventId, oData) {
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
     * Sets Busy indicator in POD
     *
     * @param {boolean} bShow true to show indicator, false to hide
     * @public
     */
    ProductionComponent.prototype.setBusy = function(bShow) {
        this.getPodController().getView().setBusy(bShow);
    };

    /**
     * makes an Ajax get request
     *
     * @param {string} sUrl request
     * @param {string} sParameters parameters to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                   if not defined, standard error message
     *                   will be displayed.
     * @public
     */
    ProductionComponent.prototype.ajaxGetRequest = function(sUrl, sParameters, fnSuccess, fnFailure) {
        this.getPodController().ajaxGetRequest(sUrl, sParameters, fnSuccess, fnFailure);
    };

    /**
     * makes an Ajax post request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                   if not defined, standard error message
     *                   will be displayed.
     * @public
     */
    ProductionComponent.prototype.ajaxPostRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        this.getPodController().ajaxPostRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
    };

    /**
     * makes an Ajax patch request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                   if not defined, standard error message
     *                   will be displayed.
     * @public
     */
    ProductionComponent.prototype.ajaxPatchRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        this.getPodController().ajaxPatchRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
    };

    /**
     * makes an Ajax put request
     *
     * @param {string} sUrl request
     * @param {object} oJsonPayload object to send
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                   if not defined, standard error message
     *                   will be displayed.
     * @public
     */
    ProductionComponent.prototype.ajaxPutRequest = function(sUrl, oJsonPayload, fnSuccess, fnFailure) {
        this.getPodController().ajaxPutRequest(sUrl, oJsonPayload, fnSuccess, fnFailure);
    };

    /**
     * makes an Ajax delete request
     *
     * @param {string} sUrl request
     * @param {function} fnSuccess function to call on success
     * @param {function} fnFailure optional function to call on error.
     *                   if not defined, standard error message
     *                   will be displayed.
     * @param oJsonPayload optional object to send
     * @public
     */
    ProductionComponent.prototype.ajaxDeleteRequest = function(sUrl, fnSuccess, fnFailure, oJsonPayload) {
        this.getPodController().ajaxDeleteRequest(sUrl, fnSuccess, fnFailure, oJsonPayload);
    };

    /**
     * Returns the query parameter value
     *
     * @param {string} sParameter name of query parameter to return value for
     * @public
     */
    ProductionComponent.prototype.getQueryParameter = function(sParameter) {
        return this.getPodController().getQueryParameter(sParameter);
    };

    /**
     * Displays the input error as a MessageToast or MessageBox
     * <p>
     * oError can be a string or oError.message or oError.error.message
     *
     * @param {object | string} oError object or string containing message to display
     * @param {boolean} bShowAsToast Flag to display message a toast instead of the modal message box. <code>false</code> by default.
     * @param {boolean} bAddToMessagePopover Frag whether to add the message to the Message Popover. <code>false</code> by default.
     * @public
     */
    ProductionComponent.prototype.showErrorMessage = function(oError, bShowAsToast, bAddToMessagePopover) {
        oError = this._enrichOpenNcError(oError);
        this.getPodController().showErrorMessage(oError, bShowAsToast, bAddToMessagePopover);
    };

    /**
     * Displays success message as a MessageToast or MessageBox
     *
     * @param sMessage string message to display
     * @param bShowAsToast Flag to display message a toast instead of the modal message box. <code>false</code> by default.
     * @param bAddToMessagePopover Flag whether to add the message to the Message Popover. <code>false</code> by default.
     * @public
     */
    ProductionComponent.prototype.showSuccessMessage = function(sMessage, bShowAsToast, bAddToMessagePopover) {
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
    ProductionComponent.prototype.showMessage = function(sMessage, bShowAsToast, bAddToMessagePopover, sMessageType) {
        let oPodController = this.getPodController();
        if (oPodController) {
            oPodController.showMessage(sMessage, bShowAsToast, bAddToMessagePopover, sMessageType);
        }
    };

    /*
     * Checks whether oError is an open nc error. If yes, then function adds all opened NCs from oError.error.openNcs to the
     * error message and returns it. Otherwise does nothing and returns the same input.
     * @param {Object | String }  oError object returned by REST
     * @returns {String | Object} if error has open nc code then returns string with all NC codes listed. Otherwise returns the same error.
     * @private
     */
    ProductionComponent.prototype._enrichOpenNcError = function(oError) {
        if (this._isOpenNcError(oError)) {
            let sMessage = oError.error.message;
            for (let sKey in oError.error.openNcs) {
                sMessage += "\n";
                sMessage += sKey + ": " + oError.error.openNcs[sKey].join(", ");
            }
            return sMessage;
        } else {
            return oError;
        }
    };

    /*
     * @param {String | Object}  oError object from REST call
     * @returns {boolean} true if error is for open NC code. False otherwise
     * @private
     */
    ProductionComponent.prototype._isOpenNcError = function(oError) {
        return typeof oError === "object" && oError.error && oError.error.code === sOpenNcCodeErrorCode;
    };

    /**
     * returns the i18n text for the input key
     *
     * @param {string} sKey key of text to get
     * @param {Object[]} aArgs List of parameter values which should replace the placeholders "{n}".
     * @returns i18n text if found, else the input key
     * @See jQuery.sap.util.ResourceBundle.getText()
     * @public
     */
    ProductionComponent.prototype.getI18nText = function(sKey, aArgs) {
        if (!this.i18nResourceBundle) {
            let oI18nModel = this.getModel("i18n");
            if (oI18nModel) {
                this.i18nResourceBundle = oI18nModel.getResourceBundle();
            }
        }
        if (!this.i18nResourceBundle) {
            return sKey;
        }
        return this.i18nResourceBundle.getText(sKey, aArgs);
    };

    /**
     * returns the currently connected user id
     *
     * @returns {string} user id
     * @public
     */
    ProductionComponent.prototype.getUserId = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getUserId) {
            return oPodController.getUserId();
        }
        return null;
    };

    /**
     * returns the uri for the Plant DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getPlantDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPlantDataSourceUri) {
            return oPodController.getPlantDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Product DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getProductDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductDataSourceUri) {
            return oPodController.getProductDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Production DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getProductionDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getProductionDataSourceUri) {
            return oPodController.getProductionDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Pod Foundation DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getPodFoundationDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPodFoundationDataSourceUri) {
            return oPodController.getPodFoundationDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Non Conformance DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getNonConformanceDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getNonConformanceDataSourceUri) {
            return oPodController.getNonConformanceDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Assembly DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getAssemblyDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getAssemblyDataSourceUri) {
            return oPodController.getAssemblyDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Inventory DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getInventoryDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getInventoryDataSourceUri) {
            return oPodController.getInventoryDataSourceUri();
        }
        return null;
    };

    /**
     * returns the uri for the Public API Hub
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getPublicApiRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPublicApiRestDataSourceUri) {
            return oPodController.getPublicApiRestDataSourceUri();
        }
        return null;
    };

    /**
     * Returns the uri for the Process Engine (PE) Rest DataSource.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    ProductionComponent.prototype.getPeRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getPeRestDataSourceUri) {
            return oPodController.getPeRestDataSourceUri();
        }
        return null;
    };

    /**
     * Returns the uri for the Time Tracking Rest DataSource.
     *
     * @returns {string} URI part having dataSource prefix for backend calls.
     * @public
     */
    ProductionComponent.prototype.getTimeTrackingRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getTimeTrackingRestDataSourceUri) {
            return oPodController.getTimeTrackingRestDataSourceUri();
        }
        return null;
    };

    /**
     * Returns the uri for the Activity Confirmation Rest DataSource
     *
     * @returns {string} uri
     * @public
     */
    ProductionComponent.prototype.getActivityConfirmationRestDataSourceUri = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getActivityConfirmationRestDataSourceUri) {
            return oPodController.getActivityConfirmationRestDataSourceUri();
        }
        return null;
    };

    // gets EventBus for unit tests
    ProductionComponent.prototype._getEventBus = function() {
        let oPodController = this.getPodController();
        if (oPodController && oPodController.getEventBus) {
            return oPodController.getEventBus();
        }
        return null;
    };

    /*
     * Refreshes work list and ends plugin's execution.
     * Work list is refreshed when execution plugin's backend call is completed successfully or when
     * it's failed and number of processed SFCs more than one. In this case some of SFCs can change
     * their state and it should be reflected in a list plugin.
     *
     * @param {Object} oParameters backend call payload that will be included in refresh event
     * @param {boolean} onError true if backed call ends with an error
     * @param {boolean} autoAssembleEnabled true if autoAssembleComponents extension has being triggered on backend
     * @private
     */
    ProductionComponent.prototype._refreshDataAndEndExecution = function(oParameters, onError, autoAssembleEnabled) {

        let bLastButtonAction = this.getLastButtonAction();
        if (bLastButtonAction) {
            // this will allow worklist to process WorklistRefreshEvent
            // since this is the last action on the button
            this.fireFinishedExecution(oParameters);
        }

        if (!onError || oParameters.processLot || oParameters.sfcs.length > 1) {
            oParameters.source = this;
            oParameters.sendToAllPages = true;
            this.publish("WorklistRefreshEvent", oParameters);
        }
        if (autoAssembleEnabled) {
            this.publish("AutoAssembledSfcStateChangedEvent", oParameters);
        }

        let iTimeout = 0;
        if (!bLastButtonAction) {
            // need to be after WorklistRefreshEvent so worklist
            // does not change POD Selection model when other actions
            // follow this one.
            this.fireFinishedExecution(oParameters);

            // delay complete until model updates are complete from WorklistRefreshEvent
            // in order for following execution plugins to have latest data
            iTimeout = 1000;
        }

        let that = this;
        setTimeout(function() {
            that.complete();
        }, iTimeout);
    };

    /*
     * fires event to listeners that execution is going to start
     *
     * @param {Object} oParameters describing event that is starting
     * @private
     */
    ProductionComponent.prototype.fireStartExecution = function(oEventData) {
        oEventData.source = this;
        oEventData.sendToAllPages = true;
        this.publish("StartExecutionEvent", oEventData);
    };

    /*
     * fires event to listeners that execution is finished
     *
     * @param {Object} oParameters describing event that is ending
     * @private
     */
    ProductionComponent.prototype.fireFinishedExecution = function(oEventData) {
        oEventData.source = this;
        oEventData.sendToAllPages = true;
        this.publish("FinishedExecutionEvent", oEventData);
    };

    /**
     * Retrieve the timeout value used to call complete()
     * @returns timeout value to use in _delayedCall()
     * @protected
     */
    ProductionComponent.prototype.getCompleteTimeoutTimerValue = function() {
        return 125;
    };

    /**
     * Retrieve the POD Controllers owner component
     * @returns POD's UIComponent
     * @public
     */
    ProductionComponent.prototype.getPodOwnerComponent = function() {
        let oPodController = this.getPodController();
        if (oPodController) {
            return oPodController.getOwnerComponent();
        }
        return null;
    };

    /**
     * Retrieve a value from a global POD model
     * @param {string} sPropertyName property name for retrieving a value
     * @returns Property object
     * @public
     */
    ProductionComponent.prototype.getGlobalProperty = function(sPropertyName) {
        let oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalProperty(sPropertyName);
        }
        return null;
    };

    /**
     * Store a value in a global POD model
     * @param {string} sPropertyName property name for storing a value
     * @param {object} oValue stored value
     * @public
     */
    ProductionComponent.prototype.setGlobalProperty = function(sPropertyName, oValue) {
        let oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            oOwnerComponent.setGlobalProperty(sPropertyName, oValue);
        }
    };

    /**
     * Retrieve and remove a value from a global POD model
     * @param {string} sPropertyName property name for retrieving a value
     * @public
     */
    ProductionComponent.prototype.removeGlobalProperty = function(sPropertyName) {
        let oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.removeGlobalProperty(sPropertyName);
        }

        return null;
    };

    /**
     * Returns the POD application JSONModel
     *
     * @returns The global JSONModel
     * @public
     */
    ProductionComponent.prototype.getGlobalModel = function() {
        let oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalModel();
        }
        return null;
    };

    return ProductionComponent;
});