sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/model/InputType",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/util/PlantSettings",
    "sap/dm/dme/logging/Logging"
], function(BaseObject, JSONModel, InputType, PodUtility, PlantSettings, Logging) {
    "use strict";
    return BaseObject.extend("sap.dm.dme.podfoundation.handler.SfcPodHelper", {

        constructor: function(oController) {
            this._oController = oController;
            this._oLogger = Logging.getLogger("sap.dm.dme.podfoundation.handler.SfcPodHelper");
        },

        clearOperationField: function() {
            let oInputField = this.byId("operationFilter");
            if (oInputField) {
                oInputField.setValue("");
            }
            this.processChange("operationFilter", "");
            this.clearResourceField();
        },

        clearWorkCenterField: function() {
            let oInputField = this.byId("workCenterFilter");
            if (oInputField) {
                oInputField.setValue("");
            }
            this.processChange("workCenterFilter", "");
            this.clearResourceField();
        },

        clearResourceField: function() {
            let oInputField = this.byId("resourceFilter");
            if (oInputField) {
                oInputField.setValue("");
            }
            this.processChange("resourceFilter", "");
        },

        isSfcSelectionsDefined: function() {
            let oPodSelectionModel = this.getPodSelectionModel();
            let aSelections = oPodSelectionModel.getSelections();
            return (aSelections && aSelections.length > 0);
        },

        loadOperationField: function(aOperations) {
            let that = this;
            return new Promise(function(resolve) {
                that._oLogger.debug("SfcPodHelper(LO): Enter loadOperationField()");
                if (!that.isSfcSelectionsDefined()) {
                    let sResult = null;
                    if (aOperations) {
                        sResult = aOperations;
                    }
                    that._oLogger.debug("SfcPodHelper(LO): loadOperationField() -  MISSING RESOURCE.  Results: " + sResult);
                    resolve({
                        resourceLoaded: false
                    });
                    return;
                }
                let sOperation = null;
                let sOperationVersion = null;
                let oOperation = that.getActiveOperation(aOperations);
                if (oOperation) {
                    sOperation = oOperation.operation;
                    sOperationVersion = oOperation.operationVersion;
                }
                if (PodUtility.isEmpty(sOperation)) {
                    that.clearOperationField();
                    resolve({
                        resourceLoaded: false
                    });
                    that._oLogger.debug("SfcPodHelper(LO): loadOperationField() - PodUtility.isEmpty() = false-  MISSING RESOURCE");
                    return;
                }
                that._updateOperationFieldAndModel(sOperation, sOperationVersion);

                if (PodUtility.isNotEmpty(oOperation.resource)) {
                    // active (in-work) - use resource defined
                    that._updateResourceFieldAndModel(oOperation.resource);
                    that._oLogger.debug("SfcPodHelper: loadOperationField(LO) - _updateResourceFieldAndModel() - resourceLoaded: true, value='" + oOperation.resource + "'");
                    resolve({
                        resourceLoaded: true
                    });
                    return;
                }

                // loading resource from selected operation's default resource
                return that._loadDefaultResourceFromOperation()
                    .then(function(oResponse) {
                        if (!oResponse.updated) {
                            // try loading resource from POD's default resource value
                            this._loadDefaultResourceFromConfiguration();
                            that._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromConfiguration - NOT updated");
                        } else {
                            that._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromConfiguration - ALREADY updated");
                        }

                        resolve({
                            resourceLoaded: true
                        });

                    }.bind(that));
            });
        },

        loadWorkCenterField: function() {
            let that = this;
            return new Promise(function(resolve, reject) {
                if (!that.isSfcSelectionsDefined()) {
                    resolve({
                        resourceLoaded: false
                    });
                    return;
                }
                let oPodSelectionModel = that.getPodSelectionModel();
                let aSelections = oPodSelectionModel.getSelections();
                let sWorkCenter = that.getSelectedWorkCenter(aSelections);

                if (PodUtility.isEmpty(sWorkCenter)) {
                    that.clearWorkCenterField();
                    resolve({
                        resourceLoaded: false
                    });
                    return;
                }
                let sUserId = that.getUserId();
                return that.validateWorkCenterForCurrentUser(sWorkCenter, sUserId)
                    .then(function(bValid) {
                        if (!bValid) {
                            that.clearWorkCenterField();
                            let aArgs = [sWorkCenter, sUserId];
                            let sMessage = this.getPodI18nText("workCenterNotAssignedToUser", aArgs);
                            reject({
                                message: sMessage
                            });
                            return;
                        }
                        this._updateWorkCenterFieldAndModel(sWorkCenter);

                        return this.retrieveResourcesForWorkCenter(sWorkCenter)
                            .then(function(oResponseData) {
                                let aMembers = [];
                                if (oResponseData && oResponseData.members) {
                                    aMembers = oResponseData.members;
                                }
                                this.loadActiveResourceFromSelections(aMembers);
                                resolve({
                                    resourceLoaded: true
                                });
                            }.bind(this));
                    }.bind(that));
            });
        },

        getSelectedWorkCenter: function(aSelections) {
            let sWorkCenter = null;
            if (aSelections && aSelections.length > 0) {
                let oSfcData;
                for (let oSelection of aSelections) {
                    oSfcData = oSelection.getSfcData();
                    if (!oSfcData) {
                        continue;
                    }
                    if (PodUtility.isEmpty(sWorkCenter)) {
                        sWorkCenter = oSfcData.getWorkCenter();
                    } else if (sWorkCenter !== oSfcData.getWorkCenter()) {
                        // multiple selections and different work centers
                        sWorkCenter = null;
                        break;
                    }
                }
            }
            return sWorkCenter;
        },

        loadActiveResourceFromSelections: function(aMembers) {
            let oPodSelectionModel = this.getPodSelectionModel();

            let sResource = this.getActiveResourceFromSelections(oPodSelectionModel);

            if (PodUtility.isEmpty(sResource)) {
                // no resouces assigned to current selections
                if (aMembers && aMembers.length === 1) {
                    // if only one resource assigned to WC, us it.
                    if (aMembers[0].childResource && PodUtility.isNotEmpty(aMembers[0].childResource.resource)) {
                        sResource = aMembers[0].childResource.resource;
                    }
                }
                if (PodUtility.isEmpty(sResource)) {
                    // no resouces assigned to work center, check for default
                    sResource = this.getDefaultResource();
                }
            }
            if (PodUtility.isEmpty(sResource)) {
                oPodSelectionModel.setResource(null);
                this.clearResourceField();
                return;
            }
            this._updateResourceFieldAndModel(sResource);
        },

        getActiveResourceFromSelections: function(oModel) {
            let oPodSelectionModel = oModel;
            if (!oModel) {
                oPodSelectionModel = this.getPodSelectionModel();
            }
            let aSelections = oPodSelectionModel.getSelections();
            let sResource = null;
            if (aSelections.length > 0) {
                let oSfcData;
                for (let oSelection of aSelections) {
                    oSfcData = oSelection.getSfcData();
                    if (!oSfcData || oSfcData.getStatusCode() !== "403") {
                        // not defined or not in-work
                        continue;
                    }
                    if (PodUtility.isEmpty(sResource)) {
                        sResource = oSfcData.getResource();
                    } else if (sResource !== oSfcData.getResource()) {
                        // multiple selections and different resources
                        sResource = null;
                        break;
                    }
                }
            }
            return sResource;
        },

        getDefaultResource: function() {
            let sResource = this.toUpperCase(this.getQueryParameter("RESOURCE"));
            if (PodUtility.isEmpty(sResource)) {
                let oConfigData = this.getConfiguration();
                if (oConfigData && PodUtility.isNotEmpty(oConfigData.resource)) {
                    sResource = this.toUpperCase(oConfigData.resource);
                }
            }
            return sResource;
        },

        retrieveResourcesForWorkCenter: function(sWorkCenter) {
            let that = this;
            return new Promise(function(resolve) {
                let sPlant = PlantSettings.getCurrentPlant();
                let sWorkCenterBO = `WorkCenterBO:${sPlant},${sWorkCenter}`;
                let sExpandResourceType = "$expand=resourceType($select=ref,resourceType,description,createdDateTime)";
                let sExpandResources = `$expand=resourceTypeResources(${sExpandResourceType})`;
                let sExpandChildResource = `$expand=childResource($select=ref,resource,description,status,plant,resourceTypeResources;${sExpandResources})`;
                let sExpandMembers = `$expand=members(${sExpandChildResource})`;
                let sPlantEndPoint = that.getPlantDataSourceUri();
                let sQuery = `${sPlantEndPoint}Workcenters('${sWorkCenterBO}')?${sExpandMembers}`;
                that.ajaxGetRequest(sQuery, {}, function(oResponseData) {
                    resolve(oResponseData);
                });
            });
        },

        getResourcesForWorkCenter: function(sWorkCenter, fnCallback, fnContext) {
            return this.retrieveResourcesForWorkCenter(sWorkCenter)
                .then(function(oResponseData) {
                    fnCallback.call(fnContext, oResponseData);
                });
        },

        onOperationListSelectEvent: function() {
            let oPodSelectionModel = this.getPodSelectionModel();
            let sWorkCenter = oPodSelectionModel.getWorkCenter();
            if (PodUtility.isEmpty(sWorkCenter)) {
                // in-work resource found
                return;
            }
            let sResource = this.getActiveResourceFromSelections(oPodSelectionModel);
            if (PodUtility.isNotEmpty(sResource)) {
                this._updateResourceFieldAndModel(sResource);
                return;
            }
            this.getResourcesForWorkCenter(sWorkCenter, this._loadResourceFromWorkCenterRequest, this);
        },

        _loadResourceFromWorkCenterRequest: function(oResponseData) {
            let oAssignedResources = new JSONModel(oResponseData);
            let oWorkCenterResources = this.getChildResources(oAssignedResources);
            if (oWorkCenterResources && oWorkCenterResources.resourceList.length > 0) {
                // try loading resource from work center resources
                if (oWorkCenterResources.resourceList.length === 1) {
                    this._loadDefaultResourceFromWorkCenter(oWorkCenterResources.resourceList[0].resource);
                }
                return null;
            }

            // no resources defined to Work Center, try loading resource from selected operation's default resource
            return this._loadDefaultResourceFromOperation()
                .then(function(oResponse) {
                    if (!oResponse.updated) {
                        // try loading resource from POD's default resource value
                        this._loadDefaultResourceFromConfiguration();
                    }
                }.bind(this));
        },

        _loadDefaultResourceFromWorkCenter: function(sResource) {
            let sValue = this.toUpperCase(sResource);
            if (PodUtility.isNotEmpty(sValue)) {
                let oInputField = this.byId("resourceFilter");
                if (oInputField) {
                    oInputField.setValue(sValue);
                }
                this.processChange("resourceFilter", sValue);
            }
        },

        _loadDefaultResourceFromOperation: function() {
            let that = this;
            return new Promise(function(resolve) {
                let oPodSelectionModel = that.getPodSelectionModel();
                let aOperations = oPodSelectionModel.getOperations();
                if (!aOperations || aOperations.length === 0) {
                    that._updateResourceFieldAndModel(null);
                    resolve({
                        updated: false
                    });
                }
                let sProductEndPoint = that.getProductDataSourceUri();
                let sPlant = PlantSettings.getCurrentPlant();
                let sOperationBO = `OperationBO:${sPlant},${aOperations[0].operation},${aOperations[0].version}`;
                let sQuery = `${sProductEndPoint}Operations('${sOperationBO}')`;
                that.ajaxGetRequest(sQuery, {}, function(oResponseData) {
                    let bModelUpdated = that._loadResourceFromOperationRequest(oResponseData);
                    that._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromOperation updated=" + bModelUpdated);
                    resolve({
                        updated: bModelUpdated
                    });
                });
            });
        },

        _loadResourceFromOperationRequest: function(oResponseData) {
            if (!oResponseData || PodUtility.isEmpty(oResponseData.resource)) {
                this._updateResourceFieldAndModel(null);
                return false;
            }
            let sResource = oResponseData.resource;
            if (typeof sResource !== "string") {
                sResource = oResponseData.resource.resource;
            }
            this._updateResourceFieldAndModel(sResource);
            return true;
        },

        _loadDefaultResourceFromConfiguration: function() {
            let oViewData = this.getConfiguration();
            if (oViewData && PodUtility.isNotEmpty(oViewData.resource)) {
                this._updateResourceFieldAndModel(oViewData.resource);
            }
        },

        validateWorkCenterForCurrentUser: function(sWorkCenter, sUserId) {
            let that = this;
            return new Promise(function(resolve) {
                let sPlant = PlantSettings.getCurrentPlant();
                let sWorkCenterBO = `WorkCenterBO:${sPlant},${sWorkCenter}`;
                let sExpand = "?$expand=userWorkCenters($expand=user($select=ref,userId))";
                let sFilter = `&$filter=ref eq ('${sWorkCenterBO}')`;
                let sPlantEndPoint = that.getPlantDataSourceUri();
                let sQuery = `${sPlantEndPoint}Workcenters${sExpand}${sFilter}`;
                that.ajaxGetRequest(sQuery, {}, function(oResponseData) {
                    resolve(that._isValidWorkCenterForCurrentUser(oResponseData, sUserId));
                });
            });
        },

        _isValidWorkCenterForCurrentUser: function(oResponseData, sUserId) {
            if (!oResponseData || !oResponseData.value || oResponseData.value.length === 0) {
                return false;
            }
            for (let oUserWorkCenter of oResponseData.value[0].userWorkCenters) {
                if (oUserWorkCenter.user.userId === sUserId) {
                    return true;
                }
            }
            return false;
        },

        _updateResourceFieldAndModel: function(sResource) {
            let oInputField = this.byId("resourceFilter");
            if (oInputField) {
                let sOldResource = oInputField.getValue();
                if (PodUtility.isEmpty(sOldResource) || sOldResource !== sResource) {
                    oInputField.setValue(sResource);
                }
            }
            this.processChange("resourceFilter", sResource);
        },

        _updateWorkCenterFieldAndModel: function(sWorkCenter) {
            let oInputField = this.byId("workCenterFilter");
            if (oInputField) {
                oInputField.setValue(sWorkCenter);
            }
            this.processChange("workCenterFilter", sWorkCenter);
        },

        _updateOperationFieldAndModel: function(sOperation, sOperationVersion) {
            let oInputField = this.byId("operationFilter");
            if (oInputField) {
                oInputField.setValue(sOperation);
            }
            let sOperationRef = null;
            if (PodUtility.isNotEmpty(sOperation) && PodUtility.isNotEmpty(sOperationVersion)) {
                let sPlant = PlantSettings.getCurrentPlant();
                sOperationRef = `OperationBO:${sPlant},${sOperation},${sOperationVersion}`;
            }
            this.changeOperationActivityInPodSelectionModel(sOperation, sOperationRef);
        },

        loadSfcDetails: function(sInputValue) {
            let that = this;
            return new Promise(function(resolve, reject) {
                let sUrl = that.getSfcDetailsRequestUrl(sInputValue, true);
                that._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() called");
                that._postSfcDetailsRequest(sUrl)
                    .then(function(oSfcDetails) {
                        that._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() RESOLVED");
                        resolve(oSfcDetails);
                    }.bind(that))
                    .catch(function(oError) {
                        that._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() ERROR");
                        reject(oError)
                    }.bind(that));
            });
        },

        getSfcDetailsRequestUrl: function(sInputValue) {
            this._sRequestInputValue = sInputValue;
            const sUri = this.getProductionDataSourceUri();
            const sPlant = PlantSettings.getCurrentPlant();
            return `${sUri}sfc/v1/sfcdetail?plant=${sPlant}&sfc=${sInputValue}`;
        },

        _postSfcDetailsRequest: function(sUrl) {
            let that = this;
            return new Promise(function(resolve, reject) {
                that.ajaxGetRequest(sUrl, null,
                    function(oResponseData) {
                        let oSfcDetails = that._loadSfcDetails(oResponseData);
                        resolve(oSfcDetails);
                    },
                    function(oError, sHttpErrorMessage) {
                        let err = oError || sHttpErrorMessage;
                        reject(err);
                    }
                );
            });
        },

        _loadSfcDetails: function(oResponseData) {
            this._oFlattenedResponse = this.flattenResponse(oResponseData);
            return this._oFlattenedResponse;
        },

        flattenResponse: function(oResponseData) {
            let oResponse = {};
            oResponse.sfc = oResponseData.sfc;
            oResponse.quantity = oResponseData.quantity;
            if (oResponseData.status) {
                oResponse.statusCode = oResponseData.status.code;
                oResponse.statusDescription = oResponseData.status.description;
            }
            oResponse.startDate = null;
            oResponse.datetimeQueued = null;
            oResponse.dueDatetime = null;
            if (oResponseData.routing) {
                oResponse.routing = oResponseData.routing.routing;
                oResponse.routingType = oResponseData.routing.type;
                oResponse.routingRevision = oResponseData.routing.version;
                oResponse.routingSequence = null;
                oResponse.routingAndRevision = oResponseData.routing.routing + "/" + oResponseData.routing.version;
            }
            if (oResponseData.material) {
                oResponse.material = oResponseData.material.material;
                oResponse.materialDescription = oResponseData.material.description;
                oResponse.materialRevision = oResponseData.material.version;
                oResponse.materialAndRevision = oResponseData.material.material + "/" + oResponseData.material.version;
                oResponse.materialGroup = "";
            }
            if (oResponseData.order) {
                oResponse.shopOrder = oResponseData.order.order;
                oResponse.shopOrderType = oResponseData.order.type;
                oResponse.orderPlannedStartDatetime = oResponseData.order.orderPlannedStartDateTime_Z;
            }
            this._flattenStepsResponse(oResponse, oResponseData);
            return {
                value: [oResponse]
            };
        },

        _flattenStepsResponse: function(oResponse, oResponseData) {
            oResponse.stepID = null;
            oResponse.quantityInWork = 0;
            oResponse.quantityInQueue = 0;
            oResponse.quantityCompletePending = 0;
            oResponse.operationScheduleStartDate = null;
            oResponse.operationScheduleEndDate = null;
            // check if Operation is defined
            let oPodSelectionModel = this.getPodSelectionModel()
            let oOperation = oPodSelectionModel.getOperation();
            let sSelectedOperation = null
            if (oOperation && PodUtility.isNotEmpty(oOperation.operation)) {
                sSelectedOperation = oOperation.operation;
            }
            if (oResponseData.steps && oResponseData.steps.length > 0) {
                for (let oStep of oResponseData.steps) {
                    if (!oStep.operation || PodUtility.isEmpty(oStep.operation.operation)) {
                        continue;
                    }

                    this._addToOperationList(oResponse, oStep);

                    if (PodUtility.isNotEmpty(sSelectedOperation) && oStep.operation.operation === sSelectedOperation) {
                        if (PodUtility.isEmpty(this._sSelectedOperation)) {
                            this._sSelectedOperation = oStep.operation.operation;
                        }
                        oResponse.operation = oStep.operation.operation;
                        oResponse.stepID = oStep.stepId;
                        oResponse.quantityInWork = oStep.quantityInWork;
                        oResponse.quantityInQueue = oStep.quantityInQueue;
                        oResponse.quantityCompletePending = oStep.quantityCompletePending;
                        oResponse.operationScheduleStartDate = oStep.operationScheduledStartDate;
                        oResponse.operationScheduleEndDate = oStep.operationScheduledCompletionDate;
                    }
                }
            }
        },

        _addToOperationList: function(oResponse, oStep) {
            if (!this._aSfcOperations) {
                this._aSfcOperations = [];
            };
            let sOperation = oStep.operation.operation;
            let sOperationVersion = oStep.operation.version;
            let sStepId = oStep.stepId;

            let oOperation = this._findOperationInList(sOperation);
            if (oOperation) {
                if (oOperation.sfc !== oResponse.sfc) {
                    oOperation.sfc = this._sMultipleTextTitle;
                }
                if (oOperation.routing !== oResponse.routing) {
                    oOperation.routing = this._sMultipleTextTitle;
                    oOperation.routingRevision = this._sMultipleTextTitle;
                    oOperation.routingAndRevision = this._sMultipleTextTitle;
                }
                if (oOperation.stepId !== sStepId) {
                    oOperation.stepId = this._sMultipleTextTitle;
                }
                return;
            }
            this._aSfcOperations[this._aSfcOperations.length] = {
                sfc: oResponse.sfc,
                routing: oResponse.routing,
                routingRevision: oResponse.routingRevision,
                routingAndRevision: oResponse.routingAndRevision,
                operation: sOperation,
                operationVersion: sOperationVersion,
                stepId: sStepId,
                quantityInWork: oStep.quantityInWork,
                quantityInQueue: oStep.quantityInQueue,
                quantityCompletePending: oStep.quantityCompletePending,
                resource: oStep.resource,
                stepDone: oStep.stepDone
            };
        },

        _findOperationInList: function(sOperation) {
            if (!this._aSfcOperations || this._aSfcOperations.length === 0) {
                return null;
            };
            for (let oOperation of this._aSfcOperations) {
                if (oOperation.operation === sOperation) {
                    return oOperation;
                }
            }
            return null;
        },

        findExactMatch: function(aSelectionData, sInputValue, sInputType) {
            if (!aSelectionData || aSelectionData.length === 0) {
                return null;
            }
            for (let oData of aSelectionData) {
                if ((sInputType === InputType.Sfc && sInputValue === oData.sfc) ||
                    (sInputType === InputType.ProcessLot && sInputValue === oData.processLot)) {
                    return oData;
                }
            }
            return null;
        },

        getActiveOperation: function(aOperations) {
            let oFoundOperation = null;
            if (aOperations && aOperations.length > 0) {
                for (let oOperation of aOperations) {
                    if (oOperation.stepDone) {
                        continue;
                    }
                    if (this._onlyInQueueQuantities(oOperation) ||
                        this._onlyInWorkQuantities(oOperation) ||
                        this._onlyCompletePendingQuantities(oOperation)) {
                        oFoundOperation = oOperation;
                        break;
                    }
                }
            }
            return oFoundOperation;
        },

        _onlyInQueueQuantities: function(oOperation) {
            // Return true if at least one "in queue" quantity > 0 and all other types are 0
            if (oOperation.quantityInQueue > 0 && (oOperation.quantityInWork === 0 && oOperation.quantityCompletePending === 0)) {
                return true;
            }
            return false;
        },

        _onlyInWorkQuantities: function(oOperation) {
            // Return true if at least one "in work" quantity > 0 and all other types are 0
            if (oOperation.quantityInWork > 0 && (oOperation.quantityInQueue === 0 && oOperation.quantityCompletePending === 0)) {
                return true;
            }
            return false;
        },

        _onlyCompletePendingQuantities: function(oOperation) {
            // Return true if at least one "complete pending" quantity > 0 and all other types are 0
            if (oOperation.quantityCompletePending > 0 && (oOperation.quantityInQueue === 0 && oOperation.quantityInWork === 0)) {
                return true;
            }
            return false;
        },

        getSfcDetails: function() {
            return this._oFlattenedResponse;
        },

        getSfcOperations: function() {
            return this._aSfcOperations;
        },

        getSelectedOperation: function() {
            return this._sSelectedOperation;
        },

        clearSfcDetails: function() {
            this._oFlattenedResponse = null;
            this._aSfcOperations = null;
            this._sSelectedOperation = null;
        },

        byId: function(sId) {
            return this._oController.getView().byId(sId);
        },

        getPodSelectionModel: function() {
            return this._oController._getPodSelectionModel();
        },

        getPlantDataSourceUri: function() {
            return this._oController.getPlantDataSourceUri();
        },

        getProductDataSourceUri: function() {
            return this._oController.getProductDataSourceUri();
        },

        getProductionDataSourceUri: function() {
            return this._oController.getProductionDataSourceUri();
        },

        ajaxGetRequest: function(sUrl, sParameters, fnSuccess, fnFailure) {
            this._oController.ajaxGetRequest(sUrl, sParameters, fnSuccess, fnFailure);
        },

        getChildResources: function(oAssignedResources) {
            return this._oController._getChildResources(oAssignedResources);
        },

        changeOperationActivityInPodSelectionModel: function(sOperation, sOperationVersion) {
            this._oController.changeOperationActivityInPodSelectionModel(sOperation, sOperationVersion, false);
        },

        processChange: function(sId, vValue) {
            this._oController._processChange(sId, vValue);
        },

        toUpperCase: function(sValue) {
            if (PodUtility.isNotEmpty(sValue)) {
                return sValue.toUpperCase();
            }
            return sValue
        },

        getQueryParameter: function(sParameter) {
            return this._oController.getQueryParameter(sParameter);
        },

        getConfiguration: function() {
            return this._oController.getConfiguration();
        },

        getUserId: function() {
            return this._oController.getUserId();
        },

        getPodI18nText: function(sKey, aArgs) {
            return this._oController.getPodController().getI18nText(sKey, aArgs);
        }
    });
});