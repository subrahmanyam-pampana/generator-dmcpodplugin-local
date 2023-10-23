sap.ui.define([
    "sap/dm/dme/controller/BaseObject.controller",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/dm/dme/controller/UnsavedChangesCheck",
    "sap/dm/dme/util/ServiceErrorAlert"
], function(BaseObjectController, AjaxUtil, JSONModel, MessageBox, UnsavedChangesCheck, ServiceErrorAlert) {
    "use strict";

    let WI_ENTITY_NAME = "WorkInstructions";
    let DC_ENTITY_NAME = "DataCollectionGroups";

    return BaseObjectController.extend("sap.dm.dme.controller.BaseRoutingRecipeObject.controller", {

        onInit: function() {
            BaseObjectController.prototype.onInit.apply(this, arguments);
            this.setExpandedPropertyWiHeaderPanel(false);
            this.setExpandedPropertyDcHeaderPanel(false);
        },

        setExpandedPropertyWiHeaderPanel: function(bExpand) {
            this.getViewModel().setProperty("/wiExpand", bExpand);
        },

        setExpandedPropertyDcHeaderPanel: function(bExpand) {
            this.getViewModel().setProperty("/dcExpand", bExpand);
        },

        performGetRequest: function(sUrl, fnSuccessCallback, fnErrorCallback, oFnContext, sErrorMessage) {
            let oView = oFnContext._oDialog || oFnContext.getView();
            oView.setBusy(true);
            AjaxUtil.get(sUrl, null,
                function(oResponseData) {
                    oView.setBusy(false);

                    if (oResponseData) {
                        fnSuccessCallback.call(oFnContext, oResponseData);
                    } else {
                        let oError = {
                            message: sErrorMessage
                        };
                        fnErrorCallback.call(oFnContext, oError, null);
                    }
                },
                function(oError, oHttpErrorMessage) {
                    oView.setBusy(false);
                    fnErrorCallback.call(oFnContext, oError, oHttpErrorMessage);
                }
            );
        },

        performPostRequest: function(sUrl, oParameters, fnSuccessCallback, fnErrorCallback, oFnContext) {
            let oView = oFnContext._oDialog || oFnContext.getView();
            oView.setBusy(true);
            AjaxUtil.post(sUrl, oParameters,
                function(oResponseData) {
                    oView.setBusy(false);
                    fnSuccessCallback.call(oFnContext, oResponseData);
                },
                function(oError, oHttpErrorMessage, nStatus) {
                    oView.setBusy(false);
                    fnErrorCallback.call(oFnContext, oError, oHttpErrorMessage, nStatus);
                }
            );
        },

        getDataSourceUri: function(sPath, oView) {
            let oOwnerComponent = oView.getController().getOwnerComponent();
            if (oOwnerComponent) {
                return oOwnerComponent.getDataSourceUriByName(sPath);
            }

            return null;
        },

        createModel: function(sModelName, oData) {
            this.setModel(new JSONModel(oData), sModelName);
        },

        _addNewItemDataToModel: function(oData, sModelName, oFnContext) {
            let oModel = oFnContext.getModel(sModelName);
            let oModelData = oModel.getData();
            oModelData.result.push(oData.result);
            oModelData.counter = oModelData.result.length;
            oModel.setData(oModelData);
            oModel.refresh();
        },

        onDeleteItem: function(oEvent, sModel, sAttachModel, sDeleteModel, oFnContext) {
            let oContext = this._getContext(oFnContext);
            let aDeletedItemContextPath = oEvent.getSource().getParent().getBindingContextPath(sModel).split("/");
            let iItemPositionAtModel = +aDeletedItemContextPath[aDeletedItemContextPath.length - 1];
            let oItem = {
                result: oContext.getModel(sModel).getData().result[iItemPositionAtModel]
            };
            if (!this._isItemInCurrentModelById(oItem.result, sAttachModel, oContext)) {
                this._addNewItemDataToModel(oItem, sDeleteModel, oContext);
            } else {
                this._findAndDeleteItemFromModel(oItem.result, sAttachModel, oContext);
            }
            this._findAndDeleteItemFromModel(oItem.result, sModel, oContext);
        },

        _findAndDeleteItemFromModel: function(oData, sModelName, oFnContext) {
            let oFilteredModelData = {};
            let oModel = oFnContext.getModel(sModelName);
            let oModelData = oModel.getData();
            oFilteredModelData.result = oModelData.result.filter(function(item) {
                return item.id !== oData.id;
            });

            oFilteredModelData.counter = oFilteredModelData.result.length;
            oModel.setData(oFilteredModelData);
        },

        _isItemInCurrentModel: function(oItem, sModel, oFnContext) {
            let oContext = this._getContext(oFnContext);
            let oModel = oContext.getModel(sModel).getData();
            let oModelItems = oModel.result;
            if (oModel.counter) {
                return oModelItems.some(function(item) {
                    return item.ref === oItem.ref;
                });
            } else {
                return false;
            }
        },

        _isItemInCurrentModelById: function(oItem, sModel, oFnContext) {
            let oModel = oFnContext.getModel(sModel).getData();
            let oModelItems = oModel.result;
            if (oModel.counter) {
                return oModelItems.some(function(item) {
                    return item.id === oItem.id;
                });
            } else {
                return false;
            }
        },

        _showServiceErrorMessage: function(oError, oHttpErrorMessage, nStatus) {
            // controller can be used in dialogs that don't have owner component on them.
            let oComponent = this.getOwnerComponent ? this.getOwnerComponent() : this.getView();
            let oBundleGlobal = oComponent.getModel("i18n-global").getResourceBundle();
            let sForbiddenErrorMessage = oBundleGlobal.getText("message.errorNoAccessToModifyData", this.getResourceBundle().getText("appTitle"));
            ServiceErrorAlert.showServiceErrorMessage({
                oError,
                oHttpErrorMessage,
                nStatus,
                sForbiddenErrorMessage
            });
        },

        getMessageText: function(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        _retrieveWiDcSuccess: function(sModelName, oResponseData) {
            let oData = oResponseData;
            let oDataWiItemId = {};
            oDataWiItemId.result = oData.map(function(item) {
                item.id = "_" + Math.random().toString(36).substr(2, 9);
                return item;
            });
            oDataWiItemId.counter = oDataWiItemId.result.length;
            this.getModel(sModelName).setData(oDataWiItemId);
        },

        onWiListUpdate: function() {
            let iLength = this.byId("workInstructionsTable").getItems().length;
            this.getViewModel().setProperty("/wiListLength", iLength);
        },

        onDcListUpdate: function() {
            let iLength = this.byId("dataCollectionTable").getItems().length;
            this.getViewModel().setProperty("/dcListLength", iLength);
        },

        _addWiRow: function(oData, sWiModelName, sWiAttachModelName, oFnContext) {
            let oContext = this._getContext(oFnContext);
            let sUrl = this.getDataSourceUri("workinstruction-oDataSource", oContext.getView()) + WI_ENTITY_NAME + "('" + oData.ref + "')" +
                "?$select=*&$expand=attachedPoints,workInstructionElements";
            this.performGetRequest(sUrl, this._retrieveAddWiDcSuccess.bind(this, sWiModelName, sWiAttachModelName, oContext), this._showServiceErrorMessage.bind(this), oContext);
        },

        _addDcRow: function(oData, sDcModelName, sDcAttachModelName, oFnContext) {
            let oContext = this._getContext(oFnContext);
            let sUrl = this.getDataSourceUri("datacollection-oDataSource", oContext.getView()) + DC_ENTITY_NAME + "('" + oData.ref + "')" +
                "?$select=*&$expand=attachedPoints,dcParameters";
            this.performGetRequest(sUrl, this._retrieveAddWiDcSuccess.bind(this, sDcModelName, sDcAttachModelName, oContext), this._showServiceErrorMessage.bind(this), oContext);
        },

        _retrieveAddWiDcSuccess: function(sModelName, sAttachModelName, oFnContext, oResponseData) {
            let oContext = this._getContext(oFnContext);
            let oResponse = oResponseData || {};
            oResponse.id = "_" + Math.random().toString(36).substr(2, 9);
            let oData = {
                result: oResponse
            };
            this._addNewItemDataToModel(oData, sModelName, oContext);
            this._addNewItemDataToModel(oData, sAttachModelName, oContext);
        },

        _getModelCounter: function(sModelName, oFnContext) {
            let oContext = this._getContext(oFnContext);
            return oContext.getModel(sModelName).getData().counter;
        },

        _getContext: function(oFnContext) {
            return oFnContext || this;
        },

        _getBaseRef: function(sModelName) {
            return this.getModel(sModelName).getData().ref;
        },

        attachmentApply: function(sModelName, sEntityName, sConstantsPath, oParameters, oFnContext, fnCallback) {
            let oContext = this._getContext(oFnContext);
            let oView = oContext._oDialog || oContext.getView();
            oView.setBusy(true);
            let sUrl = this.getDataSourceUri(sConstantsPath, oContext.getView());
            let aAttachData = oContext.getModel(sModelName).getData().result.slice(0);
            aAttachData.forEach(function(oItem) {
                oItem.attachedPoints.push(oParameters);
                delete oItem["@odata.context"];
                delete oItem["id"];
                AjaxUtil.patch(
                    sUrl + sEntityName + "('" + oItem.ref + "')",
                    oItem,
                    function(oResponseData) {
                        oView.setBusy(false);
                        this._onSaveAttachmentSuccessHandler(sModelName, oContext, fnCallback, oResponseData);
                    }.bind(this),
                    function(oError, oHttpErrorMessage, nStatus) {
                        oView.setBusy(false);
                        this._showServiceErrorMessage(oError, oHttpErrorMessage, nStatus);
                    }.bind(this)
                );
            }, this);
        },

        _onSaveAttachmentSuccessHandler: function(sModelName, oContext, fnCallback, oAttachment) {
            let oModel = oContext.getModel(sModelName);
            let aData = oModel.getData().result;
            aData.splice(aData.indexOf(oAttachment), 1);
            let iLength = aData.length;
            oModel.getData().counter = iLength;
            oModel.refresh();

            if (iLength === 0) {
                let sMessage = "";
                let oAttachmentModelsName = this.getWiDcAttachmentModelsName();
                if (sModelName === oAttachmentModelsName.DC_ATTACH_MODEL) {
                    sMessage = "message.dataCollection.attachedSuccess";
                    let sDcDeleteModelName = oAttachmentModelsName.DC_DELETE_MODEL;
                    this._getModelCounter(sDcDeleteModelName, oContext) ? this.deletionApply(sDcDeleteModelName, oContext, fnCallback) : fnCallback();
                } else if (sModelName === oAttachmentModelsName.WI_ATTACH_MODEL) {
                    sMessage = "message.workInstruction.attachedSuccess";
                    let sWiDeleteModelName = oAttachmentModelsName.WI_DELETE_MODEL;
                    this._getModelCounter(sWiDeleteModelName, oContext) ? this.deletionApply(sWiDeleteModelName, oContext, fnCallback) : fnCallback();
                }
                if (sMessage) {
                    sap.m.MessageToast.show(oContext.getResourceBundle().getText(sMessage));
                }
            }
        },

        getWiDcAttachmentModelsName: function() {
            return {
                DC_ATTACH_MODEL: "dcAttachModel",
                DC_DELETE_MODEL: "dcDeleteModel",
                WI_ATTACH_MODEL: "wiAttachModel",
                WI_DELETE_MODEL: "wiDeleteModel"
            };
        },

        deletionApply: function(sModelName, oFnContext, fnCallback) {
            let oContext = this._getContext(oFnContext);
            let oView = oContext._oDialog || oContext.getView();
            oView.setBusy(true);
            if (this._getModelCounter(sModelName, oContext)) {
                let oData = oContext.getModel(sModelName).getData();
                let getEndpointUrl = sModelName.indexOf("dc") !== -1 ? this._getEndpointUrlForDc.bind(this) : this._getEndpointUrlForWi.bind(this);
                oData.result.forEach(function(oItem) {
                    AjaxUtil.delete(
                        getEndpointUrl(oItem, oFnContext),
                        function() {
                            oView.setBusy(false);
                            this._retrieveDeleteSuccess(oItem, sModelName, oContext, fnCallback);
                        }.bind(this),
                        function(oError, oHttpErrorMessage, nStatus) {
                            oView.setBusy(false);
                            this._showServiceErrorMessage(oError, oHttpErrorMessage, nStatus);
                        }.bind(this)
                    );
                }.bind(this));
            }
        },

        _getEndpointUrlForWi: function(oItem, oFnContext) {
            let oContext = this._getContext(oFnContext);
            return this.getDataSourceUri("workinstruction-RestSource", oContext.getView()) + "workInstructions/" + oItem.ref + "/attachmentPoints/" + oItem.attachedPoint.ref;
        },

        _getEndpointUrlForDc: function(oItem, oFnContext) {
            let oContext = this._getContext(oFnContext);
            return this.getDataSourceUri("datacollection-RestSource", oContext.getView()) + "dataCollectionGroups/" + oItem.ref + "/attachmentPoints/" + oItem.attachedPoint.ref;
        },

        _retrieveDeleteSuccess: function(oItem, sModelName, oFnContext, fnCallback) {
            let oContext = this._getContext(oFnContext);
            let oModel = oContext.getModel(sModelName);
            let aData = oModel.getData().result;
            aData.splice(aData.indexOf(oItem), 1);
            let iLength = aData.length;
            oModel.getData().counter = iLength;
            oModel.refresh();

            if (iLength === 0) {
                let sMessage = "";
                let oAttachmentModelsName = this.getWiDcAttachmentModelsName();
                if (sModelName === oAttachmentModelsName.DC_DELETE_MODEL) {
                    sMessage = "message.dataCollection.deletedSuccess";
                    fnCallback();
                } else if (sModelName === oAttachmentModelsName.WI_DELETE_MODEL) {
                    sMessage = "message.workInstruction.deletedSuccess";
                    fnCallback();
                }
                if (sMessage) {
                    sap.m.MessageToast.show(oContext.getResourceBundle().getText(sMessage));
                }
            }
        },

        _checkUnsavedData: function(isStep, oFnContext) {
            let oContext = this._getContext(oFnContext);
            let oAttachmentModelsName = this.getWiDcAttachmentModelsName();
            let iWiCounter = oContext._getModelCounter(oAttachmentModelsName.WI_ATTACH_MODEL);
            let iWiDeleteCounter = oContext._getModelCounter(oAttachmentModelsName.WI_DELETE_MODEL);
            let iDcCounter = oContext._getModelCounter(oAttachmentModelsName.DC_ATTACH_MODEL);
            let iDcDeleteCounter = oContext._getModelCounter(oAttachmentModelsName.DC_DELETE_MODEL);
            let isChangedPrt = this._isChangePtr(oFnContext);
            let aItemsForCreateCollectMessage = [];
            let sCollectMessage = "";
            let oResourceBundle = oContext.getResourceBundle();
            if (iWiCounter === 0 && iDcCounter === 0 && iWiDeleteCounter === 0 && iDcDeleteCounter === 0 && !isChangedPrt) {
                UnsavedChangesCheck._resetChange();
            } else {
                if (iWiCounter > 0 || iWiDeleteCounter > 0) {
                    aItemsForCreateCollectMessage.push(oResourceBundle.getText("unsaved.workInstruction.msg"));
                }
                if (iDcCounter > 0 || iDcDeleteCounter > 0) {
                    aItemsForCreateCollectMessage.push(oResourceBundle.getText("unsaved.dataCollection.msg"));
                }
                if (isChangedPrt) {
                    aItemsForCreateCollectMessage.push(oResourceBundle.getText("unsaved.prt.msg"));
                }
                sCollectMessage = aItemsForCreateCollectMessage.join(", ");
            }

            if (sCollectMessage) {
                UnsavedChangesCheck._setChangeDetected();
                let message = this._getConfirmUnsavedMessage(isStep);
                UnsavedChangesCheck._setCustomUnsavedWarningMessage(oResourceBundle.getText(message, sCollectMessage));
            }
        },

        _isChangePtr: function(oContext) {
            let bReturn = false;
            if (oContext) {
                let oModel = this._getContext(oContext).getModel("toolingModel");
                if (oModel) {
                    bReturn = oModel.getData().isChanged;
                }
            }

            return bReturn;
        },

        _getConfirmUnsavedMessage: function(isStep) {
            return isStep ? "message.confirmUnsavedData" : "message.header.confirmUnsavedData";
        },

        _setDataToModels: function(arr, oFnContext) {
            let oContext = this._getContext(oFnContext);
            arr.forEach(function(oData) {
                let oModel = oContext.getModel(oData.modelName);
                oModel.setData(oData.modelData);
                oModel.refresh();
            }, this);
        },

        _addFlagIsCurrentBom: function(aData, sBom) {
            return aData.map(function(oItem) {
                (oItem.bomComponent.bom.ref === sBom) ? oItem.isCurrentBom = true: oItem.isCurrentBom = false;
                return oItem;
            });
        },

        _filteredDataComponentListByErpSequence: function(aComponentList) {
            let aFilteredComponentList = [];
            aComponentList.forEach(function(oItem) {
                if (oItem.isCurrentBom) {
                    if (this._isItemWithCurrentErpSequence(oItem, aFilteredComponentList)) {
                        let iIndex = this._getItemIndexInArray(oItem.bomComponent.erpSequence, aFilteredComponentList);
                        aFilteredComponentList[iIndex].bomComponent.quantity += oItem.bomComponent.quantity;
                    } else {
                        aFilteredComponentList.push(oItem);
                    }
                }
            }, this);
            return aFilteredComponentList;
        },

        _isItemWithCurrentErpSequence: function(oItem, aItemList) {
            return aItemList.some(function(oListItem) {
                return oListItem.bomComponent.erpSequence === oItem.bomComponent.erpSequence;
            });
        },

        _getItemIndexInArray: function(iItemErpSequence, aItemList) {
            let iIndex;
            aItemList.some(function(oListItem, index) {
                if (oListItem.bomComponent.erpSequence === iItemErpSequence) {
                    iIndex = index;
                    return true;
                }
            });
            return iIndex;
        },

        _getCountItemsWithCurrentBom: function(aData) {
            let counter = 0;
            aData.forEach(function(oItem) {
                !oItem.isCurrentBom || counter++;
            });
            return counter;
        }

    });
}, true);