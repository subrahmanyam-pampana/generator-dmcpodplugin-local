sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/dm/dme/message/ErrorHandler"
], function(Controller, History, MessageToast, MessageBox, ErrorHandler) {
    "use strict";

    return Controller.extend("sap.dm.dme.controller.Base", {
        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function() {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for retrieving the routing for the specified name.
         * @public
         * @returns {sap.ui.core.routing.Route} the route or undefined if not found
         */
        getRoute: function(sRoute) {

            // Note: Must do in two lines otherwise the sinon stub does
            // not return the stubbed route
            let oRouter = this.getRouter();
            return oRouter.getRoute(sRoute);
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @param {string} sI18nModel The name of the resource model. Defaults to the application
         * resource model 'i18n'
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function(sI18nModel) {

            let sModelName = sI18nModel || "i18n";
            return this.getOwnerComponent().getModel(sModelName).getResourceBundle();
        },

        /**
         * Convenience method for getting a property value from the resource bundle.
         * In case if no property found in component's bundle, the key searched in global bundle.
         * @param {string} sKey The property bundle key
         * @param {Array} aParameters Arguments to pass in the parameterized text.
         * @public
         * @returns {string} localized text if found, the sKey otherwise
         */
        getLocalizedText: function(sKey, aParameters) {
            let sText = this.getResourceBundle().getText(sKey, aParameters);
            if (sText === sKey) {
                sText = this.getResourceBundle("i18n-global").getText(sKey, aParameters);
            }
            return sText;
        },


        /**
         * Event handler for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
        onNavBack: function() {
            this.navigateToPreviousObject("masterList");
        },

        getEventBus: function() {
            return sap.ui.getCore().getEventBus();
        },

        getListSelector: function() {
            return this.getOwnerComponent().oListSelector;
        },

        /**
         * Store a value in a global model
         * @param sPropertyName property name for storing a value
         * @param oValue stored value
         */
        setGlobalProperty: function(sPropertyName, oValue) {
            return this.getOwnerComponent().setGlobalProperty(sPropertyName, oValue);
        },

        /**
         * Retrieve a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        getGlobalProperty: function(sPropertyName) {
            return this.getOwnerComponent().getGlobalProperty(sPropertyName);
        },

        /**
         * Retrieve and remove a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        removeGlobalProperty: function(sPropertyName) {
            return this.getOwnerComponent().removeGlobalProperty(sPropertyName);
        },

        /**
         * @return The global application JSONModel
         */
        getGlobalModel: function() {
            return this.getOwnerComponent().getGlobalModel();
        },

        /**
         * If there is a previous hash, navigate one entry back in the browser history.  Otherwise navigate to the
         * specified view.
         *
         * @param sView Name of the view to navigate to if there is no previous hash.
         */
        navigateToPreviousObject: function(sView) {
            let sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo(sView, {}, true);
            }
        },

        showMessageToast: function(sMessageKey, sParameters) {
            MessageToast.show(this.getLocalizedText(sMessageKey, sParameters), {
                closeOnBrowserNavigation: false
            });
        },

        showErrorMessageBox: function(oError) {
            let sMessage = ErrorHandler.getErrorMessage(oError);
            MessageBox.error(sMessage, {
                details: oError
            });
        }

    });
});