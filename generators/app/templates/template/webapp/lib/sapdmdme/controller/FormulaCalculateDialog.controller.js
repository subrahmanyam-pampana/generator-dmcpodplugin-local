sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/odata/type/Decimal",
    "sap/dm/dme/formatter/NumberFormatter"
], function(BaseObject, JSONModel, AjaxUtil, Decimal, NumberFormatter) {
    "use strict";

    let USERSPECIFIC_FIELDS_MODEL = "userSpecificFields";
    let USERSPECIFIC_VARIABLES_MODEL = "userSpecificVariables";
    let HINT_MODEL = "hint";
    const oFieldValueConstraints = NumberFormatter.dmcLocaleDecimalConstraints();

    let CalculateDialogType = BaseObject.extend("sap.dm.dme.controller.FormulaCalculateDialog", {

        fieldValueDecimalType: new Decimal(null, oFieldValueConstraints),

        constructor: function(sId, mSettings) {
            this.oView = mSettings.oParentView;
            this._fnCallback = mSettings.fnSaveCallback;
            this._oFormula = mSettings.oFormula;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.fragment.FormulaCalculateDialog", this);
            this._getView().addDependent(this._getDialog());
            this._getDialog().open();
            this._init();
        },

        /**
         * Initialize Calculate Quantity to Consume dialog screen
         * @private
         */
        _init: function() {
            this._getDialog().setModel(new JSONModel({
                value: "",
                enable: false,
                expression: this._oFormula.expression,
                formulaName: this._oFormula.formulaName
            }), HINT_MODEL);

            this._getDialog().setModel(new JSONModel([]), USERSPECIFIC_VARIABLES_MODEL);
            this._generateUserSpecificFields();
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onCalculateCancel: function(oEvent) {
            this.dialogClose();
        },

        /**
         * Close Calculate Quantity to Consume dialog screen
         */
        dialogClose: function() {
            this._getView().removeDependent(this._getDialog());
            this._getDialog().destroy();
            this.destroy();
        },

        _getView: function() {
            return this.oView;
        },

        _getDialog: function() {
            return this._oDialog;
        },

        /**
         * Handles the clear event. Fired on pressing Clear button.
         *  Clear comments field and user specific fields
         */
        onCalculateClear: function() {
            let aVariables = this._getDialog().getModel(USERSPECIFIC_VARIABLES_MODEL).getData();
            this._clearUserSpecificFields(aVariables);
        },

        /**
         * Clear User Specific fields on Consume dialog screen
         * @param {aFields} fields array
         * @private
         */
        _clearUserSpecificFields: function(aFields) {
            let that = this;
            aFields.forEach(function(oVariable) {
                let sProperty = "/" + oVariable.fieldName;
                that._getDialog().getModel(USERSPECIFIC_FIELDS_MODEL).setProperty(sProperty, "");
            });
            that._getDialog().getModel(USERSPECIFIC_FIELDS_MODEL).setProperty("/comments", "");
        },

        /**
         * Handles the calculate event. Fired on pressing Calculate button.
         */
        onCalculate: function() {
            this._calculate();
        },

        /**
         * Performs calculate
         * @private
         */
        _calculate: function() {
            let aVariables = this._getDialog().getModel(USERSPECIFIC_VARIABLES_MODEL).getData();
            let aResultVariables = this._validateEnteredValues(aVariables);
            if (aResultVariables.length > 0 || aVariables.length === 0) {
                let oPayload = {};
                oPayload.formulaName = this._oFormula.formulaName;
                oPayload.resultContextRef = this._oFormula.resultContextRef;
                let oVariables = {};
                aResultVariables.forEach(function(oVariable) {
                    oVariables[oVariable.name] = oVariable.value;
                });
                oPayload.variableValues = oVariables;
                this._performCalculatePostRequest(oPayload, this._calculationSuccess.bind(this));
            }
        },

        /**
         * Performs calculate Post Request
         * @param {oParameters} payload
         * @param {fnSuccessCallback} callback function for successful request
         * @private
         */
        _performCalculatePostRequest: function(oParameters, fnSuccessCallback) {
            let that = this;
            let sUrl = that._getView().getController().getProductRestDataSourceUri() + "formula/calculate";
            that._getDialog().setBusy(true);

            AjaxUtil.post(sUrl, oParameters,
                function(oResponseData) {
                    that._getDialog().setBusy(false);
                    fnSuccessCallback(oResponseData);
                },
                function(oError, oHttpErrorMessage) {
                    that._getDialog().setBusy(false);
                    let err = oError || oHttpErrorMessage;
                    that._getView().getController().showErrorMessage(err, true, true);
                }
            );
        },

        /**
         * Validates entered values into User Specific fields
         * @param {aVariables} variables array
         * @private
         */
        _validateEnteredValues: function(aVariables) {
            let aResult = [];
            let aEmptyFields = [];
            aVariables.forEach(function(oVariable) {
                let sProperty = oVariable.fieldName;
                let sFieldValue = this._getFieldValue(sProperty);
                if (!sFieldValue) {
                    aEmptyFields.push(sProperty);
                } else {
                    let oVariableValue = {};
                    oVariableValue.name = sProperty;
                    oVariableValue.value = sFieldValue;
                    aResult.push(oVariableValue);
                }
            }, this);

            if (aEmptyFields.length > 0) {
                aResult = [];
                let oParentController = this._getView().getController();
                oParentController.showErrorMessage(oParentController.getI18nText("missingRequiredUserValues", [aEmptyFields]), false, false);
            }
            return aResult;
        },

        _getFieldValue: function(sProperty) {
            let oFieldsModelData = this._getDialog().getModel(USERSPECIFIC_FIELDS_MODEL).getData();
            let sResult;
            oFieldsModelData.variables.some(function(item) {
                if (item.fieldName === sProperty) {
                    sResult = item.fieldValue;
                    return true;
                }
            })
            return sResult;
        },

        /**
         * Callback function for successful request
         * @param {oResponseData} response
         * @private
         */
        _calculationSuccess: function(oResponseData) {
            let oResult = {};
            let oField = {};

            let oDialog = this._getDialog();
            let aVariables = oDialog.getModel(USERSPECIFIC_VARIABLES_MODEL).getData();
            aVariables.forEach(function(oVariable) {
                oField[oVariable.fieldName] = this._getFieldValue(oVariable.fieldName);
            }, this);
            oResult.formulaId = this._oFormula.ref;
            oResult.fields = oField;
            oResult.result = Math.floor(oResponseData * 1000) / 1000;
            oResult.comments = oDialog.getModel(USERSPECIFIC_FIELDS_MODEL).getProperty("/comments");
            oResult.resultContextRef = this._oFormula.resultContextRef;
            this.dialogClose();
            this._fnCallback(oResult);
        },

        /**
         * Adds user specific fields to screen
         * @private
         */
        _generateUserSpecificFields: function() {
            let aVariables = this._oFormula.variables
                .filter(function(oItem) {
                    if (oItem.userSpecific) {
                        return oItem;
                    }
                });
            this._getDialog().setModel(new JSONModel(aVariables), USERSPECIFIC_VARIABLES_MODEL);
            this._generateUserSpecificFieldsModel(aVariables);
        },

        /**
         * Creates user specific fields based on formula variables
         * @param {aVariables} formula variables array
         * @private
         */
        _generateUserSpecificFieldsModel: function(aVariables) {
            let oFieldsModel = {
                variables: []
            };

            aVariables.forEach(function(oVariable) {
                let oField = {};
                oField.fieldName = oVariable.fieldName;
                oField.fieldValue = null;
                oFieldsModel.variables.push(oField);
            });
            this._getDialog().setModel(new JSONModel(oFieldsModel), USERSPECIFIC_FIELDS_MODEL);
        }

    });

    return {
        /**
         * Instantiates and opens the dialog.
         * @param {sap.ui.core.Element} oView the parent view this dialog will be set as dependent.
         * @param {Object} oFormula - Formula object.
         * @param fnSaveCallback - callback function called when user presses save.
         */
        open: function(oView, oFormula, fnSaveCallback) {
            return new CalculateDialogType("calculate", {
                oParentView: oView,
                oFormula: oFormula,
                fnSaveCallback: fnSaveCallback
            });
        }
    };
});