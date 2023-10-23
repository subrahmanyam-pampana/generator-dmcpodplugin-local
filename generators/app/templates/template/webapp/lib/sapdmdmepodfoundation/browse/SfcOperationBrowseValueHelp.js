sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/model/ResourceModelEnhancer",
    "sap/dm/dme/podfoundation/util/PodUtility",
], function(BaseObject, Fragment, StatusFormatter, ObjectTypeFormatter, ResourceModelEnhancer, PodUtility) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.SfcOperationBrowseValueHelp", {

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

            let oOwnerComponent = oController.getOwnerComponent();

            let oOperationi18nModel = oOwnerComponent.getModel("i18n-operation");
            ResourceModelEnhancer.enhanceIndustryTypes("sap.dm.dme.i18n.operation", oOperationi18nModel);

            let oStatusi18nModel = oOwnerComponent.getModel("i18n-status");
            let oGlobalTypeModel = oOwnerComponent.getModel("i18n-global");
            let oSfcI18nModel = oOwnerComponent.getModel("i18n-sfc");
            let oRoutingI18nModel = oOwnerComponent.getModel("i18n-routing");
            let oObjectTypei18nModel = oOwnerComponent.getModel("i18n-objectType");

            oView.setModel(oStatusi18nModel, "i18n-status");
            oView.setModel(oOperationi18nModel, "i18n-operation");
            oView.setModel(oGlobalTypeModel, "i18n-global");
            oView.setModel(oSfcI18nModel, "i18n-sfc");
            oView.setModel(oRoutingI18nModel, "i18n-routing");
            oView.setModel(oObjectTypei18nModel, "i18n-objectType");

            StatusFormatter.init(oStatusi18nModel.getResourceBundle());
            ObjectTypeFormatter.init(oObjectTypei18nModel.getResourceBundle());
        },
        /*
         *@param  aSfcOperations SFC operations (step) (See NcPodRefreshHandler.getOperations())
         */
        onSfcOperationValueHelp: function(oOperationInputField, aSfcOperations) {
            this._oOperationInputField = oOperationInputField;
            return this.loadOperations(aSfcOperations)
                .then(function(aOperations) {
                    this.showSfcOperationValueHelpDialog(aOperations)
                }.bind(this))
                .catch(function(sError) {
                    this.showErrorMessage(sError, true, true);
                }.bind(this))
        },

        showSfcOperationValueHelpDialog: function(aOperations) {
            this.loadViewModel(aOperations);
            return this.getSfcOperationValueHelpDialogPromise()
                .then(function(oValueHelpDialog) {
                    oValueHelpDialog.open();
                    this._oValueHelpDialog = oValueHelpDialog;
                }.bind(this));
        },

        loadViewModel: function(aOperations) {
            let oView = this.getView();

            let oModel = oView.getModel();
            oModel.setProperty("/Operations", aOperations);
        },

        getSfcOperationValueHelpDialogPromise: function() {
            let oView = this.getView();
            return Fragment.load({
                id: oView.getId(),
                name: "sap.dm.dme.podfoundation.browse.view.SfcOperationBrowse",
                controller: this
            }).then(function(oValueHelpDialog) {
                oView.addDependent(oValueHelpDialog);
                return oValueHelpDialog;
            });
        },

        loadOperations: function(aSfcOperations) {
            if (!aSfcOperations || aSfcOperations.length === 0) {
                return Promise.resolve([]);
            }

            const sOperationFilter = aSfcOperations
                .map((oOperation) => `operation eq '${oOperation.operation}'`)
                .join(" or ");
            const sUrl = this.getProductDataSourceUri() +
                `Operations?$select=ref,operation,description,status&$filter=currentVersion eq true and (${sOperationFilter})`;

            return new Promise((resolve, reject) => {
                this.ajaxGetRequest(sUrl, null,
                    (oResponseData) => {
                        resolve(this.combineSfcOperationData(oResponseData.value, aSfcOperations));
                    },
                    (oError, sHttpErrorMessage) => {
                        reject(oError || sHttpErrorMessage);
                    }
                );
            });
        },

        combineSfcOperationData: function(aOperations, aSfcOperations) {
            aOperations.forEach((oOperation) => {
                const oSfcOperation =
                    aSfcOperations.find((oSfcOperation) => oSfcOperation.operation === oOperation.operation) || {};

                oOperation.stepId = oSfcOperation.stepId;
                oOperation.sfc = oSfcOperation.sfc;
                oOperation.routingAndRevision = oSfcOperation.routingAndRevision;
            });

            return aOperations;
        },

        onSelectOperation: function(oEvent) {
            let oClickedListItem = oEvent.getParameter("listItem");
            let oBindingContext = oClickedListItem.getBindingContext();
            let sOperationActivityName = this.toUpperCase(oBindingContext.getProperty("operation"));
            let sOperationActivityRef = oBindingContext.getProperty("ref");
            oClickedListItem.setSelected(false);
            this._oValueHelpDialog.close();
            let oSelectedObject = {
                name: sOperationActivityName,
                ref: sOperationActivityRef
            };
            this.processOperationBrowseSelection(this._oOperationInputField, oSelectedObject);
        },

        onCancel: function() {
            this._oValueHelpDialog.close();
        },

        onClose: function() {
            let oView = this.getView();
            oView.removeDependent(this._oValueHelpDialog);
            this._oValueHelpDialog.destroy();
            this._oValueHelpDialog = null;
        },

        getView: function() {
            return this._oController.getView();
        },

        showErrorMessage: function(sError, bShowAsToast, bAddToMessagePopover) {
            this._oController.showErrorMessage(sError, bShowAsToast, bAddToMessagePopover);
        },

        getProductDataSourceUri: function() {
            return this._oController.getProductDataSourceUri();
        },

        processOperationBrowseSelection: function(oInputField, oSelectedObject) {
            return this._oController.processOperationBrowseSelection(oInputField, oSelectedObject);
        },

        ajaxGetRequest: function(sUrl, sParameters, fnSuccess, fnFailure) {
            this._oController.ajaxGetRequest(sUrl, sParameters, fnSuccess, fnFailure);
        },

        toUpperCase: function(sValue) {
            if (PodUtility.isNotEmpty(sValue)) {
                return sValue.toUpperCase();
            }
            return sValue
        }
    });
});