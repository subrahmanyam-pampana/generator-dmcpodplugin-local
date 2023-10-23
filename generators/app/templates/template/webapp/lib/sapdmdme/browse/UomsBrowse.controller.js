sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/Constants",
    "sap/ui/model/Filter",
    "sap/dm/dme/formatter/GeneralFormatter"
], function(BaseObject, JSONModel, Formatter, Constants, Filter, GeneralFormatter) {
    "use strict";
    let UOMS_MODEL = "uomsModel";

    let UomsDialogType = BaseObject.extend("sap.dm.dme.browse.UomsBrowse", {
        formatter: Formatter,
        generalFormatter: GeneralFormatter,

        constructor: function(sId, mSettings) {
            this.oView = mSettings.oParentView;
            this._fnCallback = mSettings.fnSaveCallback;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.browse.view.UomsBrowse", this);
            this.getView().addDependent(this.getDialog());
            this.createUomModel({
                uoms: mSettings.oData
            }, UOMS_MODEL);
            this.getDialog().open();
        },

        onUomSearch: function(oEvent) {
            let sValue = oEvent.getParameter("value");
            let oFilter = new sap.ui.model.Filter("uom", sap.ui.model.FilterOperator.Contains, sValue);
            let oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        /**
         * Creates all dialog models.
         * @param {Object} oData - element data.
         * @param {String} sModelName - Model Name.
         */
        createUomModel: function(oData, sModelName) {
            this.setModel(new JSONModel(oData), sModelName);
        },

        setModel: function(oModel, sName) {
            this.getDialog().setModel(oModel, sName);
        },

        onConfirm: function(oEvent) {
            // reset the filter
            let oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);

            let aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
                this._fnCallback(aContexts.map(function(oContext) {
                    return oContext.getObject();
                }));
            }
            this.dialogUomClose();
        },

        dialogUomClose: function() {
            this.getView().removeDependent(this.getDialog());
            this.getDialog().destroy();
            this.destroy();
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onCancel: function() {
            this.dialogUomClose();
        },

        getView: function() {
            return this.oView;
        },

        getDialog: function() {
            return this._oDialog;
        }
    });

    return {
        /**
         * Instantiates and opens the dialog.
         * @param {sap.ui.core.Element} oView the parent view this dialog will be set as dependent.
         * @param {Object} oData - Uoms data.
         * @param fnSaveCallback - callback function called when user presses save.
         */
        open: function(oView, oData, fnSaveCallback) {
            return new UomsDialogType("materialUoms", {
                oParentView: oView,
                oData: oData,
                fnSaveCallback: fnSaveCallback
            });
        }
    };
});