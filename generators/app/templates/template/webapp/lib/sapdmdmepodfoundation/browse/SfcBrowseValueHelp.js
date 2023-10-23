sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/browse/SfcBrowse",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/util/PlantSettings",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/EnumFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/formatter/DateTimeUtils"
], function(BaseObject, SfcBrowse, JSONModel, PlantSettings,
    StatusFormatter, EnumFormatter, ObjectTypeFormatter, DateTimeUtils) {
    "use strict";

    const VIEW_MODEL = "viewModel";
    const RESOURCE_DESTINATIONTYPE = "RESOURCE";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.SfcBrowseValueHelp", {

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
            oController.getView().setModel(new JSONModel({
                sfc: null,
                sourceType: RESOURCE_DESTINATIONTYPE,
                source: null,
                destinationType: RESOURCE_DESTINATIONTYPE,
                destination: null,
                dueTime: null,
                dmcDateTimePickerValueFormat: DateTimeUtils.dmcDateValueFormat(),
                industryType: PlantSettings.getIndustryType()
            }), VIEW_MODEL);

            let oOwnerComponent = oController.getOwnerComponent();
            StatusFormatter.init(oOwnerComponent.getModel("i18n-status").getResourceBundle());
            EnumFormatter.init(oOwnerComponent.getModel("i18n-enum").getResourceBundle());
            ObjectTypeFormatter.init(oOwnerComponent.getModel("i18n-objectType").getResourceBundle());
        },

        open: function(oEvent) {
            let oInput = oEvent.getSource();
            let oView = this.getView();
            SfcBrowse.open(oView, oInput.getValue(), this._mSettings, function(aSelectedObjects) {
                this._handleSfcBrowse(oInput, aSelectedObjects)
            }.bind(this), oView.getModel("production"), false, oView.getModel("product"), oView.getModel("demand"));
        },

        _handleSfcBrowse: function(oMainInputField, aSelectedObjects) {
            let aText = [];
            for (let oSelection of aSelectedObjects) {
                aText[aText.length] = oSelection.name.toUpperCase();
            }
            this.processSfcBrowseSelection(oMainInputField, aText);
        },

        getView: function() {
            return this._oController.getView();
        },

        processSfcBrowseSelection: function(oMainInputField, aText) {
            return this._oController.processSfcBrowseSelection(oMainInputField, aText);
        }
    });
});