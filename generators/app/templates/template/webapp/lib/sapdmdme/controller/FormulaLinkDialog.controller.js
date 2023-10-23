/**
 * Controller for the  FormulaLinksDialog fragment. Provides methods for moving objects between
 * the available table and the assigned table. Both drag and drop and manual object
 * move is supported.
 *
 * This control only supports desktop and tablet.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/browse/FormulaBomComponentBrowse",
    "sap/dm/dme/util/PlantSettings",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BaseObject, JSONModel, FormulaBomComponentBrowse, PlantSettings, Filter, FilterOperator) {
    "use strict";
    let LINK_MODEL = "linkContextModel";
    let JSON_SOURCE_CONTEXT_FIELDS = "formulaContextFieldsModel";
    let CONTEXT_FIELDS = "contextFields";

    let BROWSES = {
        BC: FormulaBomComponentBrowse
    };

    let FormulaLinkDialogType = BaseObject.extend("sap.dm.dme.controller.FormulaLinkDialog", {

        constructor: function(sId, mSettings) {
            this.oView = mSettings.oParentView;
            this._fnCallback = mSettings.fnSaveCallback;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._setContextType();
            let sContextType = this._getContextType();
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.fragment.FormulaLinkDialogType" + sContextType, this);
            this.getView().addDependent(this.getDialog());
            this._initContextModel(mSettings.oVariable);
            this.getDialog().open();
            this._initObjectBrowse(sContextType);
        },

        _setContextType: function() {
            this._sContextType = this._getParentController().getResultContextProperty("contextType");
        },

        _initContextModel: function(aVariableContextData) {
            this._setTextForContextFields();
            let oData = {};
            let aResult = this._getParentController().filterVariableContext(aVariableContextData.variableContext);
            if (aResult.length > 0) {
                oData = aResult[0];
            } else {
                oData = this._getNewVariableContextRow();
            }
            oData.variablesRef = aVariableContextData.ref;
            oData.variableRowId = aVariableContextData.rowId || null;
            this.createModel(oData, LINK_MODEL);

            if (aResult.length > 0) {
                this._getContextName(aResult[0].contextRef, aResult[0].contextType);
            }
        },

        getView: function() {
            return this.oView;
        },

        getDialog: function() {
            return this._oDialog;
        },

        _initObjectBrowse: function(sContextType) {
            this._ContextObjectBrowse = BROWSES[sContextType];
        },

        _getContextObjectBrowse: function() {
            return this._ContextObjectBrowse;
        },

        _getContextName: function(sRef, sContextType) {
            let oParentController = this._getParentController();
            let sUrl = null;
            if (sContextType === "BC") {
                sUrl = oParentController.getODataEndpointUrl(sRef, "BomComponents", "?$expand=material($select=ref,material)");
            } else {
                this._getContextNameSuccess({});
            }
            if (sUrl) {
                oParentController.performGetRequest(sUrl, null, this._getContextNameSuccess, this._ajaxError, this);
            }
        },

        _ajaxError: function(oError, oHttpErrorMessage) {
            this._getParentController().showServiceErrorMessage(oError, oHttpErrorMessage);
        },

        _getNewVariableContextRow: function() {
            let oController = this._getParentController();
            let oReturn = {
                columnName: null,
                contextRef: null,
                contextType: this._getContextType(),
                resultContextRef: oController.getResultContextProperty("resultContextRef"),
                tableName: oController.getResultContextProperty("contextTable"),
                contextName: null
            };

            return oReturn;
        },

        _getContextType: function() {
            return this._sContextType;
        },

        _getContextNameSuccess: function(oResponseData) {
            let oModel = this.getModel(LINK_MODEL);
            let oData = oModel.getData();
            oData.contextName = this._getContextByType(oResponseData);
            oModel.refresh();
        },

        _getContextByType: function(oData) {
            let sType = this._getContextType();
            if (sType === "BC") {
                return oData.material.material;
            } else if (sType === "B") {
                return "BOM_HEADER";
            }
        },
        /**
         * Creates all dialog models.
         * @param {Object} oWieData - WI element data.
         */
        createModel: function(oData, sModelName) {
            this.setModel(new JSONModel(oData), sModelName);
        },

        setModel: function(oModel, sName) {
            this.getDialog().setModel(oModel, sName);
        },

        getModel: function(sModelName) {
            return this.getDialog().getModel(sModelName);
        },

        onContextObjectBrowse: function(oEvent) {
            let sFilterValue = this._getParentController().getResultContextProperty("contextFilterValue") || null;
            this._getContextObjectBrowse().open(this.getView(), oEvent.getSource().getValue(), sFilterValue, this._contextBrowseAttachCallback.bind(this));
        },

        _contextBrowseAttachCallback: function(oSelectedItem) {
            let oModel = this.getModel(LINK_MODEL);
            let oData = oModel.getData();
            oData.contextName = oSelectedItem.name;
            oData.contextRef = oSelectedItem.ref;
            oModel.refresh();
        },

        _filterContextModelByPlant: function(sContextType) {
            if (sContextType === "BC") {
                let oComboBox = this.returnById("contextFieldsComboBox");
                if (oComboBox) {
                    let sFieldName = "TOTAL_QTY";
                    if (PlantSettings.getIndustryType() === "PROCESS") {
                        sFieldName = "QTY";
                    }
                    let aFilter = [];
                    aFilter.push(new Filter("fieldName", FilterOperator.NE, sFieldName));
                    oComboBox.getBinding("items").filter(aFilter);
                }
            }
        },

        /**
         * Returns dialog's control by ID.
         */
        returnById: function(sId) {
            return sap.ui.getCore().byId(this._getFullId(sId));
        },

        /**
         * Constructs full ID for getting control by ID using sap.ui.core.Core.byId method.
         */
        _getFullId: function(sId) {
            return this._sBaseId + "--" + sId;
        },

        getContextFieldText: function(sValue) {
            return this._getParentController().getResourceBundle("i18n-formula")
                .getText("contextField." + this._getContextType() + "." + sValue);
        },

        _setTextForContextFields: function() {
            let that = this;
            let sContextType = this._getContextType();
            let aFields = this.getModel(JSON_SOURCE_CONTEXT_FIELDS).getData()[sContextType];
            aFields.map(function(oItem) {
                oItem.fieldText = that.getContextFieldText(oItem.fieldName);
            });
            this.createModel(aFields, CONTEXT_FIELDS);
            this._filterContextModelByPlant(sContextType);
        },

        _getParentController: function() {
            return this.getView().getController();
        },

        /**
         * Handles the apply event on pressing Apply buttonы
         */
        onLink: function() {
            if (this._validateForm()) {
                this._fnParentCallback(this._convertLinkModelToParent());
                this.dialogClose();
            }
        },

        _fnParentCallback: function(oData) {
            this._fnCallback(oData);
        },

        onContextFieldsChange: function(oEvent) {
            let oModel = this.getModel(LINK_MODEL);
            let oData = oModel.getData();
            if (oEvent.getParameters().newValue) {
                // BOM Header
                if (this._getContextType() === "B") {
                    oData.contextRef = this._getParentController().getResultContextProperty("resultContextRef");
                    oData.contextName = "BOM_HEADER";
                }
            } else {
                oData.contextRef = null;
                oData.contextName = null;
            }
        },

        _validateForm: function() {
            let oModel = this.getModel(LINK_MODEL);
            let oData = oModel.getData();
            if ((oData.contextRef && oData.columnName && oData.contextName) ||
                (!oData.columnName && !oData.contextName)) {
                return true;
            } else {
                let oController = this._getParentController();
                let sMessage = oController.getResourceBundle("i18n-formula")
                    .getText("message.formula.blankContextFields");
                oController.showErrorMessage(sMessage);
                return false;
            }
        },

        _convertLinkModelToParent: function() {
            let oData = this.getModel(LINK_MODEL).getData();
            let oResult = {
                columnName: oData.columnName,
                contextRef: oData.contextRef,
                contextType: oData.contextType,
                resultContextRef: oData.resultContextRef,
                variablesRef: oData.variablesRef,
                variableRowId: oData.variableRowId,
                tableName: oData.tableName
            };
            if (oData.ref) {
                oResult.ref = oData.ref;
            }

            return oResult;
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
         * @param {sap.ui.core.Element} oView the parent view this dialog will be set as dependent.
         * @param {Object} oVariable - Data of variable.
         * @param fnSaveCallback - callback function called when user presses save.
         */
        open: function(oView, oVariable, fnSaveCallback) {
            return new FormulaLinkDialogType("formulaLinkDialog", {
                oParentView: oView,
                oVariable: oVariable,
                fnSaveCallback: fnSaveCallback
            });
        }
    };
});