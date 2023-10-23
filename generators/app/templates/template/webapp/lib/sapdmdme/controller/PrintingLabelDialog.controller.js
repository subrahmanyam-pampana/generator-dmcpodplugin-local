sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/m/Input",

    "sap/dm/dme/controller/BaseObject.controller",
    "sap/dm/dme/model/AjaxUtil",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/formatter/GeneralFormatter",
    "sap/dm/dme/util/PlantSettings",
], function(BaseObject, JSONModel, Label, Input,
    BaseObjectController, AjaxUtil, DateTimeUtils, GeneralFormatter, PlantSettings) {
    "use strict";

    let PrintingLabelDialog = BaseObject.extend("sap.dm.dme.controller.PrintingLabelDialog", {

        constructor: function(sId, mSettings) {
            this._oView = mSettings.oParentView;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._oPrintLabelConfig = mSettings.oPrintLabelConfig;
            this._oParentController = mSettings.oParentController;
            this._sSelectedOrder = mSettings.sSelectedOrder;
            this._iGRPostingIndex = mSettings.iGRPostingIndex
            this._isGR = this._oPrintLabelConfig.isGR;
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.fragment.PrintingLabelDialog", this);
            this.getView().addDependent(this.getDialog());
            this._oPrintingModel = new JSONModel();
            this._oDialog.setModel(this._oPrintingModel, "printingModel");
            this.getDialog().open();
            this._resetDataPrintingData();

            let oForm = sap.ui.core.Fragment.byId(this._sBaseId, "customFieldsSimpleForm");
            let oViewModel;
            if (this._isGR) {
                oViewModel = this._oParentController.GRPostController.oPostingsModel;
            }
            this._generateCustomFieldSimpleForm(oForm, this._oPrintLabelConfig.customFields, this._oPrintingModel, oViewModel, this._iGRPostingIndex);
        },

        getView: function() {
            return this._oView;
        },

        getDialog: function() {
            return this._oDialog;
        },

        /**
         * returns the property path with index added if configured
         * @param {string} sPropertyPath propertyValuePath of the custom field in configuration
         * @param {number} iIndex index of the row item
         * @returns generated property path
         */
        _getPrintingDialogPropertyValuePath: function(sPropertyPath, iIndex) {
            if (sPropertyPath.indexOf("<index>") != -1) {
                return "/details" + sPropertyPath.replace("<index>", iIndex);
            } else {
                return sPropertyPath;
            }
        },

        /**
         * generates fields in the custom field simple form according to the configuration
         * @param {sap.ui.layout.form.SimpleForm} oCustomFieldsSimpleForm Simple Form control for custom fields
         * @param {object[]} aConfigData configuration data for printing label
         * @param {sap.ui.model.json.JSONModel} oPrintingModel printingModel for printing label dialog
         * @param {sap.ui.model.json.JSONModel} oViewModel the view model
         * @param {number} iIndex index of the item be pressed in View Postings dialog
         */
        _generateCustomFieldSimpleForm: function(oCustomFieldsSimpleForm, aConfigData, oPrintingModel, oViewModel, iIndex) {
            let that = this;
            oCustomFieldsSimpleForm.removeAllContent();
            aConfigData.sort(function(oItem1, oItem2) {
                return +oItem1.columnId - +oItem2.columnId;
            });
            aConfigData.forEach(function(oItem, iConfigIndex, aConfig) {
                if (oItem.name) {
                    // add field label
                    oCustomFieldsSimpleForm.addContent(new Label({
                        text: oItem.label,
                        wrapping: true
                    }));
                    // add field
                    let oField = new Input({
                        value: {
                            path: "printingModel>/customFields/" + oItem.name
                        },
                        editable: !oItem.readOnly
                    });
                    if (!!oItem.propertyValuePath && oViewModel && oViewModel.getProperty) {
                        oPrintingModel.setProperty("/customFields/" + oItem.name, oViewModel.getProperty(that._getPrintingDialogPropertyValuePath(oItem.propertyValuePath, iIndex)));
                    }
                    oCustomFieldsSimpleForm.addContent(oField);
                }
            });
        },

        /**
         * handler for press event of generate preview button on print label dialog
         * load the generated pdf with the pdf viewer for user to preview
         * @param {object} oEvent 
         */
        onGeneratePreviewButtonPressed: function(oEvent) {
            let oPDFViewer = sap.ui.core.Fragment.byId(this._sBaseId, "previewViewer");
            oPDFViewer.setSource("");
            let oPrintingData = this._oPrintingModel.getData();
            let url = this._generatePreviewUrl(oPrintingData, this._oPrintLabelConfig.customFields);

            oPDFViewer.setSource(url);
        },

        /**
         * generates the url for preview pdf from document service
         * @param {object} oPrintingData data from printingModel
         * @returns the target url for preview
         */
        _generatePreviewUrl: function(oPrintingData, aCustomFieldConfigs) {
            let sPlant = PlantSettings.getCurrentPlant() || "";
            let sDocumentName = this._oPrintLabelConfig.labelDocName.value;
            let sDocumentVersion = this._oPrintLabelConfig.labelDocVersion.value;
            let sDocumentDownloadUrl = jQuery.sap.getModulePath("sap/dm/dme/pod") + '/fnd/document-ms/document/v1/download?document={"ref":"DocumentBO:<documentRef>"}&parameters={"order":"ShopOrderBO:<shopOrderBO>","plant":"<currPlant>"}';
            sDocumentDownloadUrl = sDocumentDownloadUrl.replace("<documentRef>", sDocumentName + "," + sDocumentVersion)
                .replace("<shopOrderBO>", sPlant + "," + oPrintingData.shopOrder)
                .replace("<currPlant>", sPlant);

            sDocumentDownloadUrl = sDocumentDownloadUrl + "&customData=";
            let customFieldObj = $.extend({}, oPrintingData.customFields);
            aCustomFieldConfigs.forEach(function(oItem) {
                if (oItem.name && !customFieldObj[oItem.name]) {
                    customFieldObj[oItem.name] = ""
                }
            });

            sDocumentDownloadUrl = sDocumentDownloadUrl + JSON.stringify(customFieldObj);

            return encodeURI(sDocumentDownloadUrl);
        },

        /**
         * reset printing model data to empty
         */
        _resetDataPrintingData: function() {
            this._oPrintingModel.setData({
                shopOrder: this._sSelectedOrder,
                customFields: {}
            });
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onClose: function() {
            this.dialogClose();
        },

        dialogClose: function() {
            this.getView().removeDependent(this.getDialog());
            this.getDialog().destroy();
            this.destroy();
        }


    });

    return {
        /**
         * Instantiates and opens the dialog.
         * @param {string} sSelectedOrderData the selected orderId
         * @param {sap.ui.core.mvc.View} oParentView the parent view from which opens this dialog
         * @param {sap.ui.core.mvc.Controller} oParentController the controller of the parent view
         * @param {object} oPrintLabelConfig the configuration for printingLabelDialog
         * @param {number} optional (required when isGR is true) iGRPostingIndex the index of the item in GR Postings dialog
         * 
         * @returns {object} returns a PrintingLabelDialog instance with the given parameters
         */
        open: function(sSelectedOrder, oParentView, oParentController, oPrintLabelConfig, iGRPostingIndex) {
            return new PrintingLabelDialog("printingLabelDialog", {
                oParentView: oParentView,
                sSelectedOrder: sSelectedOrder,
                oParentController: oParentController,
                oPrintLabelConfig: oPrintLabelConfig,
                iGRPostingIndex: iGRPostingIndex
            });
        }
    };
});