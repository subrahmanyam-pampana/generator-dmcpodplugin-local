sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/type/Decimal",
    "sap/dm/dme/formatter/NumberFormatter"
], function(BaseObject, JSONModel, Decimal, NumberFormatter) {
    "use strict";
    let MODEL_NAME = "validationModel";
    const oFieldValueConstraints = NumberFormatter.dmcLocaleDecimalConstraints();
    let FormulaValidationDialogType = BaseObject.extend("sap.dm.dme.controller.FormulaValidationDialog", {
        fieldValueDecimalType: new Decimal({
            "parseAsString": true,
            "strictGroupingValidation": true
        }, oFieldValueConstraints),
        numberFormatter: NumberFormatter,
        constructor: function(sId, mSettings) {
            this.oView = mSettings.oParentView;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.fragment.FormulaBuilderValidation", this);
            this.getView().addDependent(this.getDialog());
            this.createModel(mSettings.oFormulaData, MODEL_NAME);
            this.getDialog().open();
            this._getContextVariables();
        },

        _getParentController: function() {
            return this.getView().getController();
        },

        /**
         * Creates all dialog models.
         * @param {Object} oData - element data.
         * @param {String} sModelName - Model Name.
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
        },

        onValidateResult: function() {
            if (!this._getBlankVariableValueDetected()) {
                this._getCalculateResult();
            }
        },

        getView: function() {
            return this.oView;
        },

        getDialog: function() {
            return this._oDialog;
        },

        _calculateFormulaSuccess: function(oResponseData) {
            this.getModel(MODEL_NAME).setProperty("/calculationResult", oResponseData);
        },

        _getContextVariableSuccess: function(oResponseData) {
            this.convertContextVariables(oResponseData);
        },

        _ajaxError: function(oError, oHttpErrorMessage) {
            this._getParentController().showServiceErrorMessage(oError, oHttpErrorMessage);
        },

        convertContextVariables: function(oData) {
            let oModel = this.getModel(MODEL_NAME);
            let aVariablesData = this._getVariables();
            if (aVariablesData.length > 0) {
                let aVariables = aVariablesData.filter(function(oItem) {
                    return oItem.contextSpecific === true;
                });

                aVariables.forEach(function(oItem) {
                    oItem.fieldValue = oData[oItem.fieldName];
                });
            }
            oModel.refresh();
        },

        _getCalculateResult: function() {
            let oParentController = this._getParentController();
            let sUrl = oParentController.getRestEndpointUrl() + "formula/calculate";
            let oPayloadParameters = {
                resultContextRef: oParentController.getResultContextProperty("resultContextRef"),
                formulaName: oParentController.getFormulaName(),
                variableValues: this._getUserVariablesToCalculate()
            };

            oParentController.performPostRequest(sUrl, oPayloadParameters, this._calculateFormulaSuccess, this._ajaxError, this);
        },

        _getContextVariables: function() {
            let oParentController = this._getParentController();
            let sFormulaName = oParentController.getFormulaName();
            let sResultContextRef = oParentController.getResultContextProperty("resultContextRef");
            let sUrl = oParentController.getRestEndpointUrl() + "formula/" + sFormulaName + "/contextVariables/" + sResultContextRef;
            oParentController.performGetRequest(sUrl, null, this._getContextVariableSuccess, this._ajaxError, this);
        },

        /**
         * Get Blank variable value detected
         */
        _getBlankVariableValueDetected: function() {
            let oParentController = this._getParentController();
            let aResult = this._getVariables().filter(function(item) {
                return !item.fieldValue;
            });

            if (aResult.length > 0) {
                oParentController.showErrorMessage(oParentController.getResourceBundle("i18n-formula").getText("message.formula.blankValue", aResult[0].fieldName));
                return true;
            }

            return false;
        },

        _getUserVariablesToCalculate: function() {
            let oValues = {};
            this._getVariables().map(function(oItem) {
                oValues[oItem.fieldName] = Number(oItem.fieldValue);
            });

            return oValues;
        },

        _getVariables: function() {
            return this.getModel(MODEL_NAME).getData().variables;
        }

    });

    return {
        /**
         * Instantiates and opens the dialog.
         * @param {sap.ui.core.Element} oView the parent view this dialog will be set as dependent.
         * @param {Object} oFormulaData - Formula data.
         * @param fnSaveCallback - callback function called when user presses save.
         */
        open: function(oView, oFormulaData, fnSaveCallback) {
            return new FormulaValidationDialogType("formulaData", {
                oParentView: oView,
                oFormulaData: oFormulaData,
                fnSaveCallback: fnSaveCallback
            });
        }
    };
});