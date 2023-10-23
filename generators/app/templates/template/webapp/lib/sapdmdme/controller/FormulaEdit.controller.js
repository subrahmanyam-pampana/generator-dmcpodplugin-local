sap.ui.define([
    "sap/dm/dme/controller/BaseObject.controller",
    "sap/dm/dme/model/AjaxUtil",
    "sap/m/MessageBox",
    "sap/dm/dme/controller/ListManipulator",
    "sap/dm/dme/browse/FormulasBrowse",
    "sap/dm/dme/controller/FormulaValidationDialog.controller",
    "sap/dm/dme/controller/FormulaLinkDialog.controller",
    "sap/ui/model/odata/type/Decimal",
    "sap/dm/dme/formatter/NumberFormatter"
], function(BaseObjectController, AjaxUtil, MessageBox, ListManipulator, FormulasBrowse, FormulaValidationDialog, FormulaLinkDialog, Decimal, NumberFormatter) {
    "use strict";
    let logger = jQuery.sap.log.getLogger("dm.dme.BaseObject", jQuery.sap.log.Level.DEBUG);
    let EXPAND_VARIABLES_PATH = "?$expand=variables($expand=variableContext($select=ref,contextType,columnName,tableName,contextRef,resultContextRef))";
    let I18N_FORMULA_PATH = "i18n-formula";
    const oFieldValueConstraints = NumberFormatter.dmcLocaleDecimalConstraints();

    return BaseObjectController.extend("sap.dm.dme.controller.FormulaEdit", {
        _oVariablesListManipulator: null,
        fieldValueDecimalType: new Decimal({
            "parseAsString": true,
            "strictGroupingValidation": true
        }, oFieldValueConstraints),

        onInit: function() {
            this.createAuxModel();
            this._initVariablesListManipulator();
            this._oBuilder = null;
            this._setEditMode(true);
            this._setCheckFormulaExist(false);
        },

        _setEditMode: function(bValue) {
            this._EditMode = bValue;
        },

        _setCheckFormulaExist: function(bValue) {
            this._checkFormulaExist = bValue;
        },

        _getCheckFormulaExist: function() {
            return this._checkFormulaExist;
        },

        _getEditMode: function() {
            return this._EditMode;
        },

        _initVariablesListManipulator: function() {
            this._oVariablesListManipulator = new ListManipulator(this.getAuxModel(), "/variables", this._getNewVariable);
            this._oVariablesListManipulator.initOrderingButtons(this.getView());
        },

        _initFormulaBuilder: function() {
            if (!this._oBuilder) {
                let that = this;
                this._oBuilder = this.getView().byId("formulaBuilder");
                // Disable standard functions (SQRT, ROUND) because beck does not support these functions
                this._oBuilder._getAllFunctions().forEach(function(oFunction) {
                    that._oBuilder.allowFunction(oFunction.key, false);
                });
            }
        },

        performGetRequest: function(sUrl, oParameters, fnSuccessCallback, fnErrorCallback, oFnContext) {
            let oView = oFnContext.getView();
            oView.setBusy(true);
            AjaxUtil.get(sUrl, oParameters,
                function(oResponseData) {
                    oFnContext.getView().setBusy(false);
                    fnSuccessCallback.call(oFnContext, oResponseData);
                },
                function(oError, oHttpErrorMessage) {
                    oFnContext.getView().setBusy(false);
                    fnErrorCallback.call(oFnContext, oError, oHttpErrorMessage);
                }
            );
        },

        performPostRequest: function(sUrl, oParameters, fnSuccessCallback, fnErrorCallback, oFnContext) {
            let oView = oFnContext.getView();
            oView.setBusy(true);
            AjaxUtil.post(sUrl, oParameters,
                function(oResponseData) {
                    oView.setBusy(false);
                    fnSuccessCallback.call(oFnContext, oResponseData);
                },
                function(oError, oHttpErrorMessage) {
                    oView.setBusy(false);
                    fnErrorCallback.call(oFnContext, oError, oHttpErrorMessage);
                }
            );
        },

        performPatchRequest: function(sUrl, oPayload, fnSuccessCallback, fnErrorCallback, oFnContext) {
            let oView = oFnContext.getView();
            oView.setBusy(true);
            AjaxUtil.patch(sUrl, oPayload,
                function(oResponseData) {
                    oView.setBusy(false);
                    fnSuccessCallback.call(oFnContext, oResponseData);
                },
                function(oError, oHttpErrorMessage) {
                    oView.setBusy(false);
                    fnErrorCallback.call(oFnContext, oError, oHttpErrorMessage);
                }
            );
        },

        performDeleteRequest: function(sUrl, fnSuccessCallback, fnErrorCallback) {
            let oView = this.getView();
            let that = this;
            oView.setBusy(true);
            AjaxUtil.delete(sUrl,
                function(oResponseData) {
                    oView.setBusy(false);
                    fnSuccessCallback.call(that, oResponseData);
                },
                function(oError, oHttpErrorMessage) {
                    oView.setBusy(false);
                    fnErrorCallback.call(that, oError, oHttpErrorMessage);
                }
            );
        },

        loadFormula: function(sFormulaRef, oResultContext) {
            if (sFormulaRef) {
                let sUrl = this.getODataEndpointUrl(sFormulaRef,
                    "Formulas", EXPAND_VARIABLES_PATH);
                this.performGetRequest(sUrl, null,
                    this._retrieveFormulaSuccess, this._ajaxError, this);
            } else {
                this.setFormulaData(this._initNewHeaderFormulaData(true));
            }
            if (oResultContext) {
                this._setResultContextData(oResultContext);
            }
        },

        _setResultContextData: function(oResultContext) {
            this.getViewModel().setProperty("/resultContext", oResultContext);
            if (oResultContext.requestController) {
                this._initRequestController(oResultContext.requestController);
            }
        },

        getResultContextProperty: function(sProperty) {
            return this.getViewModel().getProperty("/resultContext")[sProperty];
        },

        _initRequestController: function(oController) {
            if (!this.oRequestControllerCallback) {
                this.oRequestControllerCallback = oController;
            }
        },

        _setContextSpecificCheckBox: function() {
            let that = this;
            this._getFormulaVariables().map(function(oItem) {
                oItem.contextSpecific = oItem.variableContext.length > 0;

                let aResult = that.filterVariableContext(oItem.variableContext);
                if (aResult.length > 0) {
                    oItem.contextDbFieldName = that.getResourceBundle(I18N_FORMULA_PATH).getText("contextField." +
                        aResult[0].contextType + "." + aResult[0].columnName);
                }
            });
        },

        filterVariableContext: function(aVariableContext) {
            let sResultContextRef = this.getResultContextProperty("resultContextRef");
            let aResult = aVariableContext.filter(function(oItem) {
                return oItem.resultContextRef === sResultContextRef;
            });
            return aResult;
        },

        _initNewHeaderFormulaData: function(bIsLoad) {
            let oData = this.getAuxModel().getData();
            let sFormulaName = null;
            if (!bIsLoad) {
                sFormulaName = oData.formulaName;
            }
            return {
                description: null,
                expression: "",
                ref: null,
                formulaName: sFormulaName,
                variables: []
            };
        },

        /**
         * @param {string} sEntityRef The context object Ref of the maintained entity.
         * @returns {string} sEntityName Entity Name.
         */
        getODataEndpointUrl: function(sEntityRef, sEntityName, sExpandChild) {
            let sODataEndpointUrl = this.getOwnerComponent().getDataSourceUriByName("product-oDataSource") + sEntityName;
            if (sEntityRef) {
                sODataEndpointUrl += "('" + sEntityRef + "')";
            }
            if (sExpandChild) {
                sODataEndpointUrl += sExpandChild;
            }

            return sODataEndpointUrl;
        },

        _retrieveFormulaSuccess: function(oResponseData) {
            this.setFormulaData(oResponseData);
        },

        _getNewVariable: function() {
            return {
                contextSpecific: false,
                fieldName: null,
                fieldValue: null,
                ref: null,
                userSpecific: false,
                variableContext: [],
                rowId: Math.random().toString(36).substr(2, 9)
            };
        },

        _initVariablesListData: function() {
            this._setContextSpecificCheckBox();
            this._getVariablesListManipulator().updateState();
        },

        _retrieveBrowseFormulaSuccess: function(oResponseData) {
            if (oResponseData.value.length > 0) {
                this.setFormulaData(oResponseData.value[0]);
            } else {
                this._confirmNewFormula(function() {
                    this.setFormulaData(this._initNewHeaderFormulaData(false));
                }.bind(this));
            }
        },

        _getVariablesListManipulator: function() {
            return this._oVariablesListManipulator;
        },

        onFormulaBrowse: function(oEvent) {
            let oField = oEvent.getSource();
            FormulasBrowse.open(this.getView(), oField.getValue(), this._formulaBrowseAttachCallback.bind(this));
        },

        _formulaBrowseAttachCallback: function(oSelectedEntity) {
            this.setFormulaData(oSelectedEntity);
        },

        onItemSelectionChange: function() {
            this._getVariablesListManipulator().updateState();
        },

        _getFormulaRef: function() {
            return this.getAuxModel().getData().ref;
        },

        getFormulaName: function() {
            return this.getAuxModel().getData().formulaName;
        },

        _getFormulaVariables: function() {
            return this.getAuxModel().getData().variables;
        },

        onShowValidateFormulaView: function() {
            if (!this._getBlankContextVariableDetected()) {
                let oClonedData = jQuery.extend(true, {}, this.getAuxModel().getData());
                FormulaValidationDialog.open(this.getView(), oClonedData, {});
            }
        },

        getRestEndpointUrl: function() {
            return this.getOwnerComponent().getDataSourceUriByName("product-RestSource", this.getView());
        },

        _ajaxError: function(oError, oHttpErrorMessage) {
            this.showServiceErrorMessage(oError, oHttpErrorMessage);
        },

        _clearCalculationBuilderExpression: function() {
            let oBuilder = this._getCalculationBuilder();
            if (oBuilder) {
                oBuilder.setExpression("");
            }
        },

        _getCalculationBuilder: function() {
            return this._oBuilder;
        },

        onFormulaNameChanged: function(oEvent) {
            if (this._getEditMode()) {
                let sObjectName = oEvent.getParameter("value").toUpperCase();
                if (sObjectName.length > 0) {
                    this._checkObjectExistence(sObjectName);
                } else {
                    this.setFormulaData(this._initNewHeaderFormulaData(false));
                }
            }
        },

        setFormulaData: function(oData) {
            let oModel = this.getAuxModel();
            if (!oData.expression) {
                this._clearCalculationBuilderExpression();
            }
            oModel.setData(oData);
            oModel.refresh();
            this._initFormulaBuilder();
            this._initVariablesListData();
            this._setEditMode(true);
            this._setCheckFormulaExist(false);
        },

        _checkObjectExistence: function(sObjectName) {
            this._setCheckFormulaExist(true);
            let sUrl = this.getODataEndpointUrl(null, "Formulas", EXPAND_VARIABLES_PATH);
            let sFilter = "$filter=" + jQuery.sap.encodeURL("formulaName" + " eq '" + sObjectName + "'");
            this.performGetRequest(sUrl, sFilter,
                this._retrieveBrowseFormulaSuccess, this._ajaxError, this);
        },

        showServiceErrorMessage: function(oError, oHttpErrorMessage) {
            let sMessage = null;
            if (oError && oError.message) {
                sMessage = oError.message;
            } else if (oError && oError.error && oError.error.message) {
                sMessage = oError.error.message;
            } else if (oHttpErrorMessage && oHttpErrorMessage.message) {
                sMessage = oHttpErrorMessage.message;
            }
            MessageBox.error(sMessage);
        },

        onSave: function() {
            if (!this._getCheckFormulaExist()) {
                if (!this._getErrorsDetected()) {
                    let sFormulaRef = this._getFormulaRef();
                    let sFormulaName = this.getFormulaName();
                    let sUrl = "";
                    sUrl = this.getODataEndpointUrl(sFormulaRef, "Formulas");

                    if (sFormulaRef && sFormulaName) {
                        this.performPatchRequest(sUrl, this._createPayloadForCreateOrUpdate(),
                            this._updateFormulaSuccess, this._ajaxError, this);
                    } else if (!sFormulaRef && sFormulaName) {
                        this.performPostRequest(sUrl, this._createPayloadForCreateOrUpdate(),
                            this._createFormulaSuccess, this._ajaxError, this);
                    } else if (!this._getEditMode() && !sFormulaName) {
                        this.showErrorMessage(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.copyBlankFormulaName"));
                        this.focusOnFormulaNameField();
                    } else {
                        this._saveRequestController(sFormulaRef);
                    }
                } else {
                    logger.info("----- Abort saving. There are form validation errors.");
                }
            }
        },

        onCopy: function() {
            this._confirmCopy(function() {
                this._copyFormula();
            }.bind(this));
        },

        _confirmCopy: function(fnCallback) {
            let that = this;
            sap.m.MessageBox.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.copy"), {
                icon: sap.m.MessageBox.Icon.WARNING,
                title: this.getResourceBundle(I18N_FORMULA_PATH).getText("confirmationDialog.copy.title"),
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL
                ],
                initialFocus: sap.m.MessageBox.Action.CANCEL,
                onClose: function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        fnCallback();
                        that.focusOnFormulaNameField();
                    }
                }
            });
        },

        _copyFormula: function() {
            let oModel = this.getAuxModel();
            let oData = oModel.getData();
            oData.ref = null;
            oData.formulaName = null;
            let aVariables = this._getFormulaVariables();

            aVariables.forEach(function(oItem) {
                oItem.ref = null;
                oItem.variableContext = [];
                oItem.contextSpecific = false;
                oItem.contextDbFieldName = "";
            });

            this._setEditMode(false);
            oModel.refresh();
        },

        onDelete: function() {
            let sFormulaRef = this._getFormulaRef();
            if (sFormulaRef) {
                this._confirmDeletion(function() {
                    this._deleteFormula(sFormulaRef);
                }.bind(this));
            } else {
                this.showErrorMessage(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.noFormulaSelected"));
            }
        },

        _confirmDeletion: function(fnCallback) {
            sap.m.MessageBox.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.delete"), {
                icon: sap.m.MessageBox.Icon.WARNING,
                title: this.getResourceBundle(I18N_FORMULA_PATH).getText("confirmationDialog.delete.title"),
                actions: [
                    sap.m.MessageBox.Action.DELETE,
                    sap.m.MessageBox.Action.CANCEL
                ],
                initialFocus: sap.m.MessageBox.Action.CANCEL,
                onClose: function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.DELETE) {
                        fnCallback();
                    }
                }
            });
        },

        /**
         * Get Blank Context variable detected
         */
        _getBlankContextVariableDetected: function() {
            let aResult = this._getFormulaVariables().filter(function(oItem) {
                return (oItem.contextSpecific && !oItem.contextDbFieldName);
            });

            if (aResult.length > 0) {
                this.showErrorMessage(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.blankContextField", aResult[0].fieldName));
                return true;
            }

            return false;
        },

        _deleteFormula: function(sFormulaRef) {
            let sUrl = this.getODataEndpointUrl(sFormulaRef, "Formulas");
            this.performDeleteRequest(sUrl,
                this._deleteFormulaSuccess, this._ajaxError);
        },

        /**
         * Prepares JSON payload with create or update data depending on the transient state of the entity context
         * @returns {Object} Payload JSON object;
         * @private
         */
        _createPayloadForCreateOrUpdate: function() {
            return this._createHeaderDataPayload(this.getAuxModel().getData());
        },

        _createHeaderDataPayload: function(oData) {
            let oReturn = {
                description: oData.description,
                expression: oData.expression,
                formulaName: oData.formulaName.toUpperCase()
            };

            if (oData.ref) {
                oReturn.ref = oData.ref;
            }
            if (oData.variables.length > 0) {
                oReturn.variables = this._createVariablesPayload(oData.variables);
            }

            return oReturn;
        },

        _createVariablesPayload: function(aVariables) {
            let aPayloadVariables = [];
            let oVariable = {};
            let that = this;
            aVariables.map(function(oItem) {
                oVariable = {
                    fieldName: oItem.fieldName
                };
                if (oItem.fieldValue) {
                    oVariable.fieldValue = Number(oItem.fieldValue);
                    oVariable.userSpecific = false;
                } else {
                    oVariable.userSpecific = true;
                }

                if (oItem.ref) {
                    oVariable.ref = oItem.ref;
                }
                if (oItem.variableContext.length > 0) {
                    oVariable.userSpecific = false;
                    oVariable.variableContext = that._createVariableContextPayload(oItem.variableContext);
                } else {
                    oVariable.variableContext = [];
                }

                aPayloadVariables.push(oVariable);
            });

            return aPayloadVariables;
        },

        _createVariableContextPayload: function(aVariableContext) {
            let aPayloadVariables = [];
            let oVariable = {};
            aVariableContext.map(function(oItem) {
                oVariable = {
                    columnName: oItem.columnName,
                    contextRef: oItem.contextRef,
                    contextType: oItem.contextType,
                    resultContextRef: oItem.resultContextRef,
                    tableName: oItem.tableName
                };

                if (oItem.ref) {
                    oVariable.ref = oItem.ref;
                }

                aPayloadVariables.push(oVariable);
            });

            return aPayloadVariables;
        },

        _updateFormulaSuccess: function(oResponseData) {
            sap.m.MessageToast.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.updateSuccess"), {
                duration: 3000
            });
            this._saveRequestController(oResponseData.ref);
            this._getFormulaAfterSave(oResponseData.ref);
        },

        _deleteFormulaSuccess: function(oResponseData) {
            sap.m.MessageToast.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.deleteSuccess"), {
                duration: 2000
            });
            this.setFormulaData(this._initNewHeaderFormulaData(true));
        },

        _createFormulaSuccess: function(oResponseData) {
            sap.m.MessageToast.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.creationSuccess"), {
                duration: 3000
            });
            this._saveRequestController(oResponseData.ref);
            this._getFormulaAfterSave(oResponseData.ref);
        },

        _saveRequestController: function(sRef) {
            if (this.oRequestControllerCallback) {
                this.oRequestControllerCallback.onSave(sRef);
            }
        },

        onChangeFieldName: function(oEvent) {
            let oControl = oEvent.getSource();
            let sValue = oControl.getValue();
            let aFilterVariables = this._getFormulaVariables().filter(function(oItem) {
                return (oItem.fieldName === sValue);
            });

            if (aFilterVariables.length > 1) {
                this._setErrorState(oControl, "message.formula.duplicateVariable");
                this._setDuplicateDetected(oEvent.getSource().getParent(), true);
            } else {
                this._setDuplicateDetected(oEvent.getSource().getParent(), false);
                this._clearErrorState(oControl);
            }
        },

        /**
         * Get Errors Detected flag
         */
        _getErrorsDetected: function() {
            if (this._getDuplicateDetected()) {
                this.showErrorMessage(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.duplicateVariable"));
                return true;
            }

            if (this._getBlankFieldNameDetected()) {
                this.showErrorMessage(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.blankFieldName"));
                return true;
            }

            return false;
        },

        /**
         * Get Duplicate Detected
         */
        _getDuplicateDetected: function() {
            let aResult = this._getFormulaVariables().filter(function(item) {
                return item.isDuplicate;
            });

            return aResult.length > 0;
        },

        /**
         * Get Blank field name detected
         */
        _getBlankFieldNameDetected: function() {
            let aResult = this._getFormulaVariables().filter(function(item) {
                return !item.fieldName;
            });

            return aResult.length > 0;
        },

        /**
         * Set Duplicate Error Detected flag
         */
        _setDuplicateDetected: function(oTable, bValue) {
            let aItemContextPath = oTable.getBindingContextPath("auxData").split("/");
            let iItemPositionAtModel = +aItemContextPath[aItemContextPath.length - 1];
            this._getFormulaVariables()[iItemPositionAtModel].isDuplicate = bValue;
        },

        /**
         * Displays the input error as a MessageBox
         * @param sMessage string containing message to display
         * @public
         */
        showErrorMessage: function(sMessage) {
            sap.m.MessageBox.error(sMessage);
        },

        /***
         * Set the Error State of the control.
         * @param {object} oControl : Control
         */
        _setErrorState: function(oControl, sMessage) {
            oControl.setValueStateText(this.getResourceBundle(I18N_FORMULA_PATH).getText(sMessage));
            oControl.setValueState(sap.ui.core.ValueState.Error);
        },

        /***
         * Clear the Error State of the control.
         * @param {object} oControl : Control
         */
        _clearErrorState: function(oControl) {
            if (oControl.getValueState() === sap.ui.core.ValueState.Error) {
                oControl.setValueStateText("");
                oControl.setValueState(sap.ui.core.ValueState.None);
            }
        },

        _contextLinkToCallBack: function(oData) {
            let aFormulaVariables = this._getFormulaVariables();

            let aFilterVariables = [];
            if (oData.variableRowId) {
                aFilterVariables = aFormulaVariables.filter(function(oItem) {
                    return oItem.rowId === oData.variableRowId;
                });
            } else {
                aFilterVariables = aFormulaVariables.filter(function(oItem) {
                    return oItem.ref === oData.variablesRef;
                });
            }

            let aResult = this.filterVariableContext(aFilterVariables[0].variableContext);

            if (aResult.length > 0) {
                jQuery.each(aFilterVariables[0].variableContext, function(iIndex, oItem) {
                    if (oItem.resultContextRef === oData.resultContextRef) {
                        if (!oData.columnName || !oData.contextRef) {
                            aFilterVariables[0].variableContext.splice(iIndex, 1);
                            aFilterVariables[0].contextDbFieldName = null;
                        } else {
                            aFilterVariables[0].variableContext[iIndex] = oData;
                        }
                        return false;
                    }
                });
            } else {
                aFilterVariables[0].variableContext.push(oData);
            }

            this._setContextSpecificCheckBox();
            this.getAuxModel().refresh();
        },

        _getFormulaAfterSave: function(sRef) {
            let sUrl = this.getODataEndpointUrl(sRef,
                "Formulas", EXPAND_VARIABLES_PATH);
            this.performGetRequest(sUrl, null,
                this._getFormulaAfterSaveSuccess, this._ajaxError, this);
        },

        _getFormulaAfterSaveSuccess: function(oResponseData) {
            this.setFormulaData(oResponseData);
        },

        onPressLinkTo: function() {
            let aIndexes = this._getVariablesListManipulator().getSelectedItemIndexes();
            if (aIndexes && aIndexes.length > 0) {
                let oClonedData = jQuery.extend(true, {}, this._getFormulaVariables()[aIndexes[0]]);
                FormulaLinkDialog.open(this.getView(), oClonedData,
                    this._contextLinkToCallBack.bind(this));
            }
        },

        _confirmNewFormula: function(fnCallback) {
            let that = this;
            sap.m.MessageBox.show(this.getResourceBundle(I18N_FORMULA_PATH).getText("message.formula.notExists"), {
                icon: sap.m.MessageBox.Icon.WARNING,
                title: this.getResourceBundle(I18N_FORMULA_PATH).getText("confirmationDialog.validation.title"),
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL
                ],
                initialFocus: sap.m.MessageBox.Action.CANCEL,
                onClose: function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        fnCallback();
                    }
                    if (oAction === sap.m.MessageBox.Action.CANCEL) {
                        that.focusOnFormulaNameField();
                    }
                }
            });
        },

        focusOnFormulaNameField: function() {
            // will place focus back on Formula Name Field after small delay
            let oView = this.getView();
            if (oView) {
                // view not defined and cannot be stubbed in some QUnit tests
                let oFormulaField = oView.byId("formulaName");
                if (oFormulaField) {
                    setTimeout(function() {
                        oFormulaField.focus();
                    }, 500);
                }
            }
        }

    });
});