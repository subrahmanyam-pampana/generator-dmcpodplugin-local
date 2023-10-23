sap.ui.define([
    "sap/dm/dme/podfoundation/component/production/ProductionComponent",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/util/PlantSettings",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/podfoundation/model/InputType"
], function(ProductionComponent, PodUtility, PlantSettings, PodType, InputType) {
    "use strict";

    return ProductionComponent.extend("sap.dm.dme.podfoundation.component.production.ProductionProcessComponent", {

        constructor: function(sId, mSettings) {
            ProductionComponent.apply(this, arguments);
        },

        _getPodSelectionData: function() {

            let oPodSelectionModel = this.getPodSelectionModel();
            if (!oPodSelectionModel) {
                return {};
            }

            let oPodData = this._getSelectionDataFromModel(oPodSelectionModel);

            oPodData.operations = this._getOperationsFromModel(oPodSelectionModel);

            let oResource;
            if (oPodSelectionModel.podType === PodType.Order) {
                oResource = this.getGlobalProperty("selectedPhaseResource");
                if (PodUtility.isNotEmpty(oResource)) {
                    oPodData.resource = oResource;
                }
                oPodData.workCenter = oPodSelectionModel.getSelectedPhaseWorkCenter();
            } else {
                oResource = oPodSelectionModel.getResource();
                if (oResource && PodUtility.isNotEmpty(oResource.resource)) {
                    oPodData.resource = oResource.resource;
                }
                oPodData.workCenter = oPodSelectionModel.getWorkCenter();
            }

            oPodData.quantity = oPodSelectionModel.getQuantity();

            oPodData.plant = PlantSettings.getCurrentPlant();

            return oPodData;
        },

        _getSelectionDataFromModel: function(oPodSelectionModel) {
            const sInputType = oPodSelectionModel.getInputType();
            let oPodData = {};
            let aInputs = [],
                aOrders = [],
                aMaterials = [],
                aRoutings = [],
                oSfcData, oShopOrder, sTypeOfSelections;
            let aSelections = oPodSelectionModel.getSelections();
            if (aSelections && aSelections.length > 0) {
                aSelections.forEach(function(oItem) {
                    let oInput = oItem.getInput();
                    if (PodUtility.isEmpty(oInput)) {
                        if (oItem.getSfc()) {
                            oInput = oItem.getSfc().getSfc();
                            sTypeOfSelections = InputType.Sfc;
                        } else if (oItem.getProcessLot()) {
                            oInput = oItem.getProcessLot().getProcessLot();
                            sTypeOfSelections = InputType.ProcessLot;
                        }
                    } else {
                        sTypeOfSelections = sInputType;
                    }
                    if (PodUtility.isNotEmpty(oInput)) {
                        aInputs.push(oInput);
                        oShopOrder = oItem.getShopOrder();
                        if (oShopOrder && oShopOrder.getShopOrder()) {
                            aOrders.push(oShopOrder.getShopOrder());
                        }
                        oSfcData = oItem.getSfcData();
                        if (oSfcData) {
                            aMaterials.push({
                                material: oSfcData.getMaterial(),
                                version: oSfcData.getMaterialVersion()
                            });
                            aRoutings.push({
                                routing: oSfcData.getRouting(),
                                version: oSfcData.getRoutingVersion()
                            });
                        }
                    }
                });
            }
            if (sTypeOfSelections === InputType.Sfc) {
                oPodData.processLots = null;
                oPodData.sfcs = aInputs;
            } else if (sTypeOfSelections === InputType.ProcessLot) {
                oPodData.sfcs = null;
                oPodData.processLots = aInputs;
            }
            oPodData.orders = aOrders;
            oPodData.materials = aMaterials;
            oPodData.routings = aRoutings;

            return oPodData;
        },

        _getOperationsFromModel: function(oPodSelectionModel) {
            let aOperations = oPodSelectionModel.getOperations();
            let aOpers = [];
            if (aOperations && aOperations.length > 0) {
                aOperations.forEach(function(oOperation) {
                    if (oOperation.operation) {
                        aOpers.push(oOperation.operation);
                    }
                });
            }
            return aOpers;
        },

        _getStringParameterData: function(oParameter, oPodData) {
            let oDataValue = null;
            if (oParameter.variable !== "EMPTY") {
                oDataValue = this._getPodDataValue(oParameter, oPodData);
            } else if (oParameter.type === "string") {
                oDataValue = oParameter.constant;
            } else if (PodUtility.isNotEmpty(oParameter.constant)) {
                let sValues = oParameter.constant.split(",");
                oDataValue = [];
                for (let i = 0; i < sValues.length; i++) {
                    if (PodUtility.isNotEmpty(sValues[i])) {
                        oDataValue[oDataValue.length] = sValues[i];
                    }
                }
            }
            if (!oDataValue) {
                return null;
            }
            return {
                key: oParameter.parameter,
                value: oDataValue
            };
        },

        _getPodDataValue: function(oParameter, oPodData) {
            let oResultData;
            switch (oParameter.variable) {
                case "WORK_CENTER":
                    oResultData = this._getResultData(oPodData.workCenter, oParameter, "required.workcenter.missing");
                    break;
                case "RESOURCE":
                    oResultData = this._getResultData(oPodData.resource, oParameter, "required.resource.missing");
                    break;
                case "SFC":
                    oResultData = this._getResultData(oPodData.sfcs, oParameter, "required.sfc.missing");
                    break;
                case "OPERATION":
                    oResultData = this._getResultData(oPodData.operations, oParameter, "required.operation.missing");
                    break;
                case "ORDER":
                    oResultData = this._getResultData(oPodData.orders, oParameter, "required.order.missing");
                    break;
                case "PLANT":
                    oResultData = this._getResultData(oPodData.plant, oParameter, "required.plant.missing");
                    break;
                case "MATERIAL":
                    oResultData = this._getMaterialResultData(oPodData.materials, oParameter);
                    break;
                case "ROUTING":
                    oResultData = this._getRoutingResultData(oPodData.routings, oParameter);
                    break;
                case "QUANTITY":
                    oResultData = this._getResultData(oPodData.quantity, oParameter, "required.quantity.missing");
                    break;
                case "USER_ID":
                    oResultData = this._getResultData(this.getUserId(), oParameter, "required.userId.missing");
                    break;
                case "PROCESS_LOT":
                    oResultData = this._getResultData(oPodData.processLots, oParameter, "required.processLot.missing");
                    break;
                default:
                    throw {
                        message: "Invalid variable name encountered (" + oParameter.variable + ""
                    };
            }

            return oResultData;
        },

        _getResultData: function(vPodDataValue, oParameter, sMissingKey) {
            if (PodUtility.isEmpty(vPodDataValue) && oParameter.required) {
                throw {
                    message: this.getI18nText(sMissingKey)
                };
            }
            return this._formatPodDataReturnValue(vPodDataValue, oParameter);
        },

        _getRoutingResultData: function(aRoutingsData, oParameter) {
            if (PodUtility.isEmpty(aRoutingsData) && oParameter.required) {
                throw {
                    message: this.getI18nText("required.routing.missing")
                };
            }
            let aRoutings = [];
            for (let i = 0; i < aRoutingsData.length; i++) {
                aRoutings[aRoutings.length] = aRoutingsData[i].routing;
            }
            return this._formatPodDataReturnValue(aRoutings, oParameter);
        },

        _getMaterialResultData: function(aMaterialsData, oParameter) {
            if (PodUtility.isEmpty(aMaterialsData) && oParameter.required) {
                throw {
                    message: this.getI18nText("required.material.missing")
                };
            }
            let aMaterials = [];
            for (let i = 0; i < aMaterialsData.length; i++) {
                aMaterials[aMaterials.length] = aMaterialsData[i].material;
            }
            return this._formatPodDataReturnValue(aMaterials, oParameter);
        },

        _formatPodDataReturnValue: function(vValue, oParameter) {
            if (!vValue) {
                // nothing input, return null
                return null;
            }
            let oResult = null;
            if (!Array.isArray(vValue) && PodUtility.isNotEmpty(vValue)) {
                // input value is not an array
                oResult = vValue;
                if (oParameter.type === "array") {
                    // return in array format
                    oResult = [vValue];
                }
            } else if (Array.isArray(vValue) && vValue.length > 0) {
                // input value is an array of values (assume format is array)
                oResult = vValue;
                if (oParameter.type !== "array") {
                    // output is not an array, return single value
                    oResult = vValue[0];
                }
            }
            return oResult;
        },

        _addParameter: function(sCurrentParameters, sSeparatorCharacter, sKey, sValue) {
            return sCurrentParameters + sSeparatorCharacter + sKey + "=" + sValue;
        }
    });

});