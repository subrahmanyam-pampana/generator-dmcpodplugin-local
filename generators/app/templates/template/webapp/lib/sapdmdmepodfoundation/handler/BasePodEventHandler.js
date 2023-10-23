sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/controller/Constants",
], function(BaseObject, Constants) {
    "use strict";

    const PLUGIN_ID = "@POD_EVENT_HANDLER@";
    const PAGE_NAME = "@POD_PAGE@";

    /**
     * Constructor for the <code>BasePodEventHandler</code> that can be extended to
     * provide POD level plugin event handling.
     *
     * @class
     * <code>sap.dm.dme.podfoundation.handler.BasePodEventHandler</code>
     *
     * @extends <code>sap.dm.dme.podfoundation.handler.BasePodEventHandler</code>
     *
     * @constructor
     * @param {object} oPodController Main POD Controller for the application
     * @public
     * @alias <code>sap.dm.dme.podfoundation.handler.BasePodEventHandler</code>
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.handler.BasePodEventHandler", {
        constructor: function() {
            BaseObject.call(this);
        },

        /**
         * Sets the POD Controller.
         * @param {object} oPodController Main POD Controller for the application
         * @public
         */
        setPodController: function(oPodController) {
            this._oPodController = oPodController;
        },

        /**
         * Returns the POD Controller.
         * @returns {object} Main POD Controller for the application
         * @public
         */
        getPodController: function() {
            return this._oPodController;
        },

        /**
         * Called by PodEventController to allow event handler to initialize.
         * @public
         */
        init: function() {
            // called by PodEventController for event handler to subscribe to events using subscribe()
        },

        /**
         * Called by PodEventController to allow event handler to initialize.
         * @public
         */
        getPluginId: function() {
            return PLUGIN_ID;
        },

        /**
         * Called by PodEventController to allow event handler to initialize.
         * @public
         */
        getPageName: function() {
            return PAGE_NAME;
        },

        /**
         * Called by PodEventController to allow event handler to initialize.
         * @public
         */
        getPodSelectionModel: function() {
            return this._oPodController.getPodSelectionModel();
        },

        subscribe: function(sEventId, fnFunction, oListener) {
            this._oPodController.subscribeGlobalEventHandler(this, sEventId, fnFunction, oListener);
        },

        publish: function(sEventName, oSendData) {
            if (this._oPodController.isUsingEventBus()) {
                const oEventBus = this._oPodController.getEventBus();
                oEventBus.publish(Constants.POD_EVENT_CHANNEL, sEventName, oSendData);
                return;
            }
            const oEventHandler = this._oPodController.getEventHandler();
            oEventHandler.publish(this, sEventName, oSendData);
        }
    });
}, true);