sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/browse/OperationActivityBrowse",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/model/ResourceModelEnhancer",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BaseObject, OperationActivityBrowse, StatusFormatter, ObjectTypeFormatter, ResourceModelEnhancer, Filter, FilterOperator) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.OperationBrowseValueHelp", {

        statusFormatter: StatusFormatter,

        /**
         * Constructor
         *
         * @param {PluginViewController} oController - Plugin Controller.
         * @param {object} mSettings - Optional sSettings used in creation of browse
         * <pre>
         *    {
         *        tableSelectMode:  Table selection mode
         *        sfcBrowseFragment: Browse fragement,
         *        validStatuses: Array of valid statuses
         *    }
         * </pre>
         */
        constructor: function(oController, mSettings) {
            this._oController = oController;
            this._mSettings = mSettings;
            this.initialize(oController);
        },

        initialize: function(oController) {
            let oView = oController.getView();

            this.oOperationActivityModel = oView.getModel("product");

            let oOwnerComponent = oController.getOwnerComponent();

            let oOperationi18nModel = oOwnerComponent.getModel("i18n-operation");
            ResourceModelEnhancer.enhanceIndustryTypes("sap.dm.dme.i18n.operation", oOperationi18nModel);
            let oStatusi18nModel = oOwnerComponent.getModel("i18n-status");
            let oObjectTypei18nModel = oOwnerComponent.getModel("i18n-objectType");
            let oGlobalTypeModel = oOwnerComponent.getModel("i18n-global");

            oView.setModel(oStatusi18nModel, "i18n-status");
            oView.setModel(oOperationi18nModel, "i18n-operation");
            oView.setModel(oGlobalTypeModel, "i18n-global");
            oView.setModel(oObjectTypei18nModel, "i18n-objectType");

            StatusFormatter.init(oStatusi18nModel.getResourceBundle());
            ObjectTypeFormatter.init(oObjectTypei18nModel.getResourceBundle());
        },

        open: function(oEvent) {
            let oInput = oEvent;
            if (oEvent.getSource) {
                oInput = oEvent.getSource();
            }
            let oView = this.getView();

            let oBrowseFilter = this.getOperationBrowseDefaultFilter();
            let that = this;
            OperationActivityBrowse.open(oView, oInput.getValue(), function(oSelectedObject) {
                that._handleOperationBrowse(oInput, oSelectedObject);
            }, this.oOperationActivityModel, oBrowseFilter);
        },

        getOperationBrowseDefaultFilter: function() {
            let oCurrentFilter = new Filter({
                path: "currentVersion",
                operator: FilterOperator.EQ,
                value1: true
            });
            let oOperationFilter = new Filter({
                path: "operation",
                operator: FilterOperator.NE,
                value1: "_SYSTEM"
            });
            return new Filter({
                filters: [
                    oCurrentFilter,
                    oOperationFilter,
                ],
                and: true,
            });
        },

        _handleOperationBrowse: function(oInputField, oSelectedObject) {
            this.processOperationBrowseSelection(oInputField, oSelectedObject);
        },

        getView: function() {
            return this._oController.getView();
        },

        processOperationBrowseSelection: function(oInputField, oSelectedObject) {
            return this._oController.processOperationBrowseSelection(oInputField, oSelectedObject);
        }
    });
});