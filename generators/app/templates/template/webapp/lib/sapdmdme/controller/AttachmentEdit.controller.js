sap.ui.define([
    "sap/dm/dme/controller/BaseObject.controller",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/dm/dme/browse/RoutingBrowse",
    "sap/dm/dme/browse/RecipeBrowse",
    "sap/dm/dme/controller/UnsavedChangesCheck",
    "sap/dm/dme/browse/ResourceBrowse",
    "sap/dm/dme/browse/ShopOrderBrowse",
    "sap/dm/dme/browse/OperationNoVersionBrowse",
    "sap/dm/dme/browse/WorkCenterBrowse",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/formatter/AttachmentFormatter",
    "sap/m/MessageBox",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/json/JSONModel"
], function(BaseObjectController, MaterialBrowse, RoutingBrowse, RecipeBrowse, UnsavedChangesCheck, ResourceBrowse, ShopOrderBrowse,
    OperationNoVersionBrowse, WorkCenterBrowse, ErrorHandler, ObjectTypeFormatter, AttachmentFormatter, MessageBox, AjaxUtil, JSONModel) {
    "use strict";
    const I18N_ATTACHMENT = "i18n-attachment";
    let ATTACHMENT_POINTS = "attachmentPoints";
    let ACITVITY_ID_SELECT = "activityId";
    let RECIPE = "recipe";
    let ROUTING = "routing";
    let sShowRecipePath = "/bShowRecipe";

    return BaseObjectController.extend("sap.dm.dme.controller.AttachmentEdit", {
        // used as a flag to set selected key for Activity Id Combobox when the data is loaded from
        // the model and not from the backend.
        bLoadActivityFromModel: false,

        attachmentFormatter: AttachmentFormatter,

        onInit: function() {
            this._initRoutes();
            this._initToggleFullScreenButton();
            this._initErrorHandling();
            this._enableActivityId(false);
            this._initRelatedObjectControls();
            this.createAuxModel();
        },

        onAttachmentEditMatched: function(oEvent) {
            this._initAttachmentPointsModel();
            this._initRelatedObjectModels();
            this.removeGlobalProperty(ATTACHMENT_POINTS);
        },

        _clearAttachmentsErrorState: function() {
            if (this.oMaterial) {
                this.oMaterial.clearErrorState();
            }
            if (this.oOperation) {
                this.oOperation.clearErrorState();
            }
            if (this.oWorkCenter) {
                this.oWorkCenter.clearErrorState();
            }
            if (this.oResource) {
                this.oResource.clearErrorState();
            }
            if (this.oShopOrder) {
                this.oShopOrder.clearErrorState();
            }
            if (this.oRouting) {
                this.oRouting.clearErrorState();
            }
            if (this.oRecipe) {
                this.oRecipe.clearErrorState();
            }
        },

        onCancelEdit: function() {
            UnsavedChangesCheck.confirmPageLeave({}, function() {
                this._clearAttachmentsErrorState();
                this._navigateBack();
            }.bind(this));
        },

        /**
         * It's possible to override this function in the child controller and add custom validation.
         */
        validateFields: function() {
            return true;
        },

        _getAttachmentRoutingData: function(isRecipeItem) {
            let oEntity;
            if (isRecipeItem) {
                oEntity = this.oRecipe;
            } else {
                oEntity = this.oRouting;
            }

            return oEntity.getObjectModelData();
        },

        onAttachmentApply: function(oEvent) {
            if (!this.validateFields()) {
                return;
            }

            let isRecipeItem = this.getShowRecipe();
            let oRoutingData = this._getAttachmentRoutingData(isRecipeItem);
            let oRouting = this._getAttachmentPointPayloadFromRelatedObjectData({
                sPropName: ROUTING,
                oData: oRoutingData,
                bVersionRequired: true
            });

            oRouting && (oRouting["routingType"] = oRoutingData["routingType"]);
            let oStep = this._createRoutingStepFromRoutingData(oRoutingData);

            if (oRouting && this._isDuplicateItem(oRouting, oStep)) {
                let sMessage = isRecipeItem ? "message.attachRecipeDuplicate" : "message.attachRoutingDuplicate";
                MessageBox.warning(
                    this.getResourceBundle(I18N_ATTACHMENT).getText(sMessage), {
                        actions: [MessageBox.Action.OK]
                    });
                return false;
            }

            let oAttachmentPoints = {
                material: this._getAttachmentPointPayloadFromRelatedObjectData({
                    sPropName: "material",
                    oData: this.oMaterial.getObjectModelData(),
                    bVersionRequired: true
                }),
                routing: oRouting,
                operation: this._getAttachmentPointPayloadFromRelatedObjectData({
                    sPropName: "operation",
                    oData: this.oOperation.getObjectModelData(),
                    bVersionRequired: true
                }),
                resource: this._getAttachmentPointPayloadFromRelatedObjectData({
                    sPropName: "resource",
                    oData: this.oResource.getObjectModelData()
                }),
                shopOrder: this._getAttachmentPointPayloadFromRelatedObjectData({
                    sPropName: "shopOrder",
                    oData: this.oShopOrder.getObjectModelData()
                })
            };

            if (oStep) {
                oAttachmentPoints.routingStep = oStep;
            }
            if (this.oWorkCenter) {
                oAttachmentPoints.workCenter = this._getAttachmentPointPayloadFromRelatedObjectData({
                    sPropName: "workcenter",
                    oData: this.oWorkCenter.getObjectModelData()
                });
            }

            this.setAttachments(oAttachmentPoints);
            this._navigateBack();
        },

        setAttachments: function(oAttachmentPoints) {
            let oExtendedAttachmentPoints = this.setCustomAttachmentPoints(oAttachmentPoints);
            // If all properties have no value then we don't want an empty
            // row added to the attachments table
            let bAllEmpty = true;
            for (let prop in oExtendedAttachmentPoints) {
                if (oExtendedAttachmentPoints[prop]) {
                    bAllEmpty = false;
                    break;
                }
            }
            if (!bAllEmpty) {
                this.setGlobalProperty(ATTACHMENT_POINTS, oExtendedAttachmentPoints);
            }
        },

        /**
         * It's possible to override this function in the child controller and add custom logic.
         */
        setCustomAttachmentPoints: function(oAttachmentPoints) {
            return oAttachmentPoints;
        },

        _isDuplicateItem: function(oRouting, oStep) {
            let aAllAttachments = this.getGlobalProperty("allAttachments") || [];
            let bReturn = false;
            if (aAllAttachments.length) {
                let oRefCurrentPoint = this._getAttachmentPointRef();
                let sStepId = oStep ? oStep.stepId : null;

                if (oRefCurrentPoint && !sStepId) {
                    bReturn = aAllAttachments.some(function(oAttachmentItem) {
                        let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                        if (oAttachmentItemRouting) {
                            return oAttachmentItem.attachmentPoints.ref !== oRefCurrentPoint &&
                                oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                oAttachmentItemRouting.routingType === oRouting.routingType;
                        }
                    });
                } else if (!oRefCurrentPoint && !sStepId) {
                    bReturn = aAllAttachments.some(function(oAttachmentItem) {
                        let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                        if (oAttachmentItemRouting) {
                            return oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                oAttachmentItemRouting.routingType === oRouting.routingType;
                        }
                    });
                } else if (oRefCurrentPoint && sStepId) {
                    bReturn = aAllAttachments.some(function(oAttachmentItem) {
                        let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                        if (oAttachmentItemRouting) {
                            return oAttachmentItem.attachmentPoints.ref !== oRefCurrentPoint &&
                                oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                oAttachmentItemRouting.routingType === oRouting.routingType && !oAttachmentItem.attachmentPoints.routingStep;
                        }
                    });

                    if (!bReturn) {
                        bReturn = aAllAttachments.some(function(oAttachmentItem) {
                            let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                            if (oAttachmentItemRouting) {
                                return oAttachmentItem.attachmentPoints.ref !== oRefCurrentPoint &&
                                    oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                    oAttachmentItemRouting.routingType === oRouting.routingType && oAttachmentItem.attachmentPoints.routingStep.stepId === sStepId;
                            }
                        });
                    }
                } else if (!oRefCurrentPoint && sStepId) {
                    bReturn = aAllAttachments.some(function(oAttachmentItem) {
                        let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                        if (oAttachmentItemRouting) {
                            return oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                oAttachmentItemRouting.routingType === oRouting.routingType && !oAttachmentItem.attachmentPoints.routingStep;
                        }
                    });

                    if (!bReturn) {
                        bReturn = aAllAttachments.some(function(oAttachmentItem) {
                            let oAttachmentItemRouting = oAttachmentItem.attachmentPoints.routing;
                            if (oAttachmentItemRouting) {
                                return oAttachmentItemRouting.routing === oRouting.routing && oAttachmentItemRouting.version === oRouting.version &&
                                    oAttachmentItemRouting.routingType === oRouting.routingType && oAttachmentItem.attachmentPoints.routingStep.stepId === sStepId;
                            }
                        });
                    }
                }
            }

            return bReturn;
        },

        _navigateBack: function() {
            this.navigateToPreviousObject();
        },

        _initRoutes: function() {
            this.getRouter().getRoute("attachmentEdit").attachPatternMatched(this.onAttachmentEditMatched, this);
        },

        /**
         * Model for fields other than related object fields. RelatedObject fields have their own model.
         */
        _initAttachmentPointsModel: function() {
            let oSelectedAttachmentPoints = this.getGlobalProperty(ATTACHMENT_POINTS);

            if (oSelectedAttachmentPoints) {
                this.getAuxModel().setData(oSelectedAttachmentPoints);
                this._setAttachmentPointRef(oSelectedAttachmentPoints);
            } else {
                this.getAuxModel().setData({});
                this._setAttachmentPointRef(null);
            }

            this.getAuxModel().updateBindings(true);
        },

        _setAttachmentPointRef: function(oAttachmentPoints) {
            let sRef = null;
            if (oAttachmentPoints) {
                sRef = oAttachmentPoints.attachmentPoints.ref || null;
            }
            this.getViewModel().setProperty("/attachmentPointRef", sRef);
        },

        _getAttachmentPointRef: function(sRef) {
            return this.getViewModel().getProperty("/attachmentPointRef");
        },

        /**
         * Check if Routing Type is Recipe to Show Recipe(Routing) attachment point
         */
        checkRecipeOrRouting: function() {
            let oSelectedAttachmentPoints = this.getGlobalProperty(ATTACHMENT_POINTS);
            this.showRecipeBrowse(false);
            this._enableActivityId(false);
            if (oSelectedAttachmentPoints) {
                if (oSelectedAttachmentPoints.attachmentPoints.routing) {
                    this._enableActivityId(true);
                    if (ObjectTypeFormatter.isRecipeType(oSelectedAttachmentPoints.attachmentPoints.routing.routingType)) {
                        this.showRecipeBrowse(true);
                    }
                }
            }
        },

        showRecipeBrowse: function(bShow) {
            let oViewModel = this.getViewModel();
            oViewModel.setProperty(sShowRecipePath, bShow);
            let oView = this.getView();
            oView.byId(ROUTING).setVisible(!bShow);
            oView.byId(RECIPE).setVisible(bShow);

            if (bShow) {
                oViewModel.setProperty("/labelStepPhase", this.getResourceBundle(I18N_ATTACHMENT).getText("attachmentPoint.recipePhase.lbl"));
            } else {
                oViewModel.setProperty("/labelStepPhase", this.getResourceBundle(I18N_ATTACHMENT).getText("attachmentPoint.routingStep.lbl"));
            }
        },

        _enableActivityId: function(bShow) {
            this.getViewModel().setProperty("/bEnableActivityId", bShow);
        },

        _initMaterial: function(oProductModel) {
            let oControlMaterial = this.byId("material");
            if (oControlMaterial) {
                this.oMaterial = oControlMaterial.getController();
                this.oMaterial.setConfiguration({
                    sObjectPropertyName: "material",
                    oModel: oProductModel,
                    sEntitySetName: "Materials",
                    oBrowse: MaterialBrowse,
                    sI18NModel: "i18n-material",
                    sObjectLabelKey: "common.material.lbl",
                    sObjectVersionLabelKey: "common.materialVersion.lbl"
                });
            }
        },

        _initRouting: function(oProductModel) {
            let oControlRouting = this.byId(ROUTING);
            if (oControlRouting) {
                this.oRouting = oControlRouting.getController();
                this.oRouting.setConfiguration({
                    sObjectPropertyName: ROUTING,
                    oAdditionalText: {
                        path: "routingType",
                        type: "sap.ui.model.odata.type.String",
                        formatter: ObjectTypeFormatter.getRoutingTypeText
                    },
                    oModel: oProductModel,
                    sEntitySetName: "Routings",
                    oBrowse: RoutingBrowse,
                    sI18NModel: "i18n-routing",
                    sObjectLabelKey: "common.routing.lbl",
                    sObjectVersionLabelKey: "common.routingVersion.lbl",
                    aAdditionalObjectFields: ["routingType"],
                    onObjectNameChanged: this.onRoutingChanged.bind(this),
                    onVersionListReceived: this.onVersionListReceived.bind(this),
                    onVersionChanged: this.onVersionChanged.bind(this),
                    sBrowseDefaultFilter: " and routing ne '_SYSTEM' and taskListType eq 'T'",
                    oActivityIdClear: this.clearActivityIdField.bind(this)
                });
            }
        },

        _initRecipe: function(oProductModel) {
            let oControlRecipe = this.byId(RECIPE);
            if (oControlRecipe) {
                this.oRecipe = oControlRecipe.getController();
                this.oRecipe.setConfiguration({
                    sObjectPropertyName: ROUTING,
                    oAdditionalText: {
                        path: "routingType",
                        type: "sap.ui.model.odata.type.String",
                        formatter: ObjectTypeFormatter.getRecipeTypeText
                    },
                    oModel: oProductModel,
                    sEntitySetName: "Routings",
                    oBrowse: RecipeBrowse,
                    sI18NModel: "i18n-recipe",
                    sObjectLabelKey: "common.recipe.lbl",
                    sObjectVersionLabelKey: "common.recipeVersion.lbl",
                    aAdditionalObjectFields: ["routingType"],
                    onObjectNameChanged: this.onRoutingChanged.bind(this),
                    onVersionListReceived: this.onVersionListReceived.bind(this),
                    onVersionChanged: this.onVersionChanged.bind(this),
                    sBrowseDefaultFilter: " and routing ne '_SYSTEM' and taskListType eq 'C'",
                    oActivityId: this._getActivityIdComboBox()
                });
            }
        },

        _initOperation: function(oProductModel) {
            let oControlOperation = this.byId("operation");
            if (oControlOperation) {
                this.oOperation = oControlOperation.getController();
                this.oOperation.setConfiguration({
                    sObjectPropertyName: "operation",
                    oModel: oProductModel,
                    sEntitySetName: "Operations",
                    oBrowse: OperationNoVersionBrowse,
                    sI18NModel: "i18n-operation",
                    onObjectNameChanged: this.onOperationChanged.bind(this),
                    aAdditionalObjectFields: ["version"],
                    sObjectLabelKey: "common.operation.lbl",
                    sObjectVersionLabelKey: "common.operationVersion.lbl",
                    bHideVersion: true,
                    bVersionRequired: true
                });
            }
        },

        _initWorkCenter: function(oPlantModel) {
            let oWorkCenter = this.byId("workCenter");
            if (oWorkCenter) {
                this.oWorkCenter = oWorkCenter.getController();
                this.oWorkCenter.setConfiguration({
                    sObjectPropertyName: "workcenter",
                    oModel: oPlantModel,
                    sEntitySetName: "Workcenters",
                    oBrowse: WorkCenterBrowse,
                    sI18NModel: "i18n-workCenter",
                    sObjectLabelKey: "common.workCenter.lbl"
                });
            }
        },

        _initResource: function(oPlantModel) {
            let oResource = this.byId("resource");
            if (oResource) {
                this.oResource = oResource.getController();
                this.oResource.setConfiguration({
                    sObjectPropertyName: "resource",
                    oModel: oPlantModel,
                    sEntitySetName: "Resources",
                    oBrowse: ResourceBrowse,
                    sI18NModel: "i18n-resource",
                    sObjectLabelKey: "common.resource.lbl"
                });
            }
        },

        _initShopOrder: function(oDemandModel, oProductModel) {
            let oShopOrder = this.byId("shopOrder");
            if (oShopOrder) {
                this.oShopOrder = oShopOrder.getController();
                this.oShopOrder.setConfiguration({
                    sObjectPropertyName: "shopOrder",
                    oModel: oDemandModel,
                    oRelatedModel: oProductModel,
                    oBrowse: ShopOrderBrowse,
                    sEntitySetName: "ShopOrders",
                    sI18NModel: "i18n-shopOrder",
                    sObjectLabelKey: "common.shopOrder.lbl"
                });
            }
        },

        _getActivityIdComboBox: function() {
            return this.byId(ACITVITY_ID_SELECT);
        },

        _initRelatedObjectControls: function() {
            let oComponent = this.getOwnerComponent();
            let oProductModel = oComponent.getModel("product");
            let oDemandModel = oComponent.getModel("demand");
            let oPlantModel = oComponent.getModel("plant");
            this._initMaterial(oProductModel);
            this._initRouting(oProductModel);
            this._initRecipe(oProductModel);
            this._initOperation(oProductModel);
            this._initWorkCenter(oPlantModel);
            this._initResource(oPlantModel);
            this._initShopOrder(oDemandModel, oProductModel);
        },

        _initRelatedObjectModels: function() {
            let oSelectedAttachmentPoints = this.getGlobalProperty(ATTACHMENT_POINTS);
            let oMaterialAttachmentPoints;
            let oRoutingAttachmentPoints;
            let oRecipeAttachmentPoints;
            let oOperationAttachmentPoints;
            let oWorkCenterAttachmentPoints;
            let oResourceAttachmentPoints;
            let oShopOrderAttachmentPoints;
            let oRoutingStepAttachmentPoints;

            if (oSelectedAttachmentPoints) {
                oMaterialAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.material;
                oRoutingAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.routing;
                oRecipeAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.routing;
                oOperationAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.operation;
                oResourceAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.resource;
                oWorkCenterAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.workCenter;
                oShopOrderAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.shopOrder;
                oRoutingStepAttachmentPoints = oSelectedAttachmentPoints.attachmentPoints.routingStep;
            }
            this.initCustomObject(oSelectedAttachmentPoints);
            this.oMaterial.initializeModel(oMaterialAttachmentPoints);
            this.checkRecipeOrRouting();
            if (this.getShowRecipe()) {
                this.oRecipe.initializeModel(oRecipeAttachmentPoints);
                this.oRouting.initializeModel();
            } else {
                this.oRecipe.initializeModel();
                this.oRouting.initializeModel(oRoutingAttachmentPoints);
            }
            this.oOperation.initializeModel(oOperationAttachmentPoints);
            if (this.oWorkCenter) {
                this.oWorkCenter.initializeModel(oWorkCenterAttachmentPoints, "workcenter");
            }
            this.oResource.initializeModel(oResourceAttachmentPoints);
            this.oShopOrder.initializeModel(oShopOrderAttachmentPoints);
            this._initRoutingStepModel(oRoutingAttachmentPoints, oRoutingStepAttachmentPoints);
        },

        // Init custom objects
        initCustomObject: function(oSelectedAttachmentPoints) {
            return true;
        },

        _initRoutingStepModel: function(oRoutingAttachmentPoints, oRoutingStepAttachmentPoints) {
            let sRoutingStepUrl;
            // fetch routing step details for attached router
            if (oRoutingAttachmentPoints) {
                // step data is loaded from the model
                this.bLoadActivityFromModel = true;
                sRoutingStepUrl = this._createRoutingStepUrlForRoutingAttachment(oRoutingAttachmentPoints);
                AjaxUtil.get(sRoutingStepUrl, null, this._setActivityIdModel(oRoutingStepAttachmentPoints), null);
            } else {
                // if no data is present then clear the activity id field
                this.clearActivityIdField();
            }
        },

        /**
         * Curried function used as a callback to AjaxUtil.get method
         * @param {Object} oRoutingStepAttachmentPoints used to set selected key for Activity ID is stepid was selected.
         * @returns {Function} which takes oRestData as a response from Get call
         * @private
         */
        _setActivityIdModel: function(oRoutingStepAttachmentPoints) {
            return function(oRestData) {
                this._initActivityIdData(oRestData, oRoutingStepAttachmentPoints);
            }.bind(this);
        },

        _initActivityIdData: function(oData, oRoutingStepAttachmentPoints) {
            let oModel = new JSONModel(oData);
            this.setModel(oModel, "AttachedRouting");
            let oSelectActivityId = this._getActivityIdComboBox();
            if (oData) {
                this._enableActivityId(true);
                oSelectActivityId.getBinding("items").filter([new sap.ui.model.Filter("routingOperation", sap.ui.model.FilterOperator.NE, null)]);
            }
            if (this.bLoadActivityFromModel) {
                this.bLoadActivityFromModel = false;
                oSelectActivityId.setSelectedKey("");
                if (oRoutingStepAttachmentPoints) {
                    oSelectActivityId.setSelectedKey(oRoutingStepAttachmentPoints.stepId);
                }
            }
        },

        _createRoutingStepUrlForRoutingAttachment: function(oRoutingAttachmentPoints) {
            let sRouting = oRoutingAttachmentPoints.routing;
            let sType = oRoutingAttachmentPoints.routingType;
            let sRevision = oRoutingAttachmentPoints.version;

            return this._createRoutingStepUrl(sRouting, sRevision, sType);
        },

        /**
         *
         * @param {Object} oSelectedRouting an object generated by RelatedObject configuration callback 'onObjectNameChanged'
         * @returns {string} url to fetch routing step data
         * @private
         */
        _createRoutingStepUrlFromSelectedRouting: function(oSelectedRouting) {
            let sRouting = oSelectedRouting.name || oSelectedRouting.routing;
            let sType = oSelectedRouting.routingType;
            let sRevision = oSelectedRouting.version;

            return this._createRoutingStepUrl(sRouting, sRevision, sType);
        },

        /**
         *
         * @param {string} sRouting name of routing
         * @param {string} sRevision version/revision of routing
         * @param {string} sType type of routing
         * @returns {string} url to fetch Routing step details
         * @private
         */
        _createRoutingStepUrl: function(sRouting, sRevision, sType) {
            return this.getOwnerComponent().getDataSourceUriByName("product-RestSource", this.getView()) + "Routing?routing=" + sRouting + "&revision=" + sRevision + "&type=" + sType;
        },

        _createRoutingStepFromRoutingData: function(oRoutingData) {
            let oActivityId = this._getActivityIdComboBox();
            if (oRoutingData.ref !== "" && oActivityId.getSelectedKey() !== "") {
                return {
                    stepId: oActivityId.getSelectedKey(),
                    routingRef: oRoutingData.ref
                };
            } else {
                return null;
            }
        },

        clearActivityIdField: function() {
            this._getActivityIdComboBox().setSelectedKey("");
            this._initActivityIdData({}, null);
            this._enableActivityId(false);
        },

        // read new routing data and fetch routing steps
        onVersionChanged: function(sVersion) {
            let oRoutingData;
            if (this.getShowRecipe()) {
                oRoutingData = this.oRecipe.getObjectModelData();
            } else {
                oRoutingData = this.oRouting.getObjectModelData();
            }
            // if version is passed into this function
            // then we can immediately update it in the model
            // and use it to do next REST requests
            if (sVersion) {
                oRoutingData.version = sVersion;
            }
            this.clearActivityIdField();
            this._getRoutingSteps(oRoutingData);
        },

        onRoutingChanged: function(oValue) {
            if (oValue) {
                this._getRoutingSteps(oValue);
            } else {
                this.clearActivityIdField();
            }
        },

        onOperationChanged: function(oValue) {
            let oData = this.oOperation.getObjectModelData();
            oData.version = oValue.additional_fields.version;
        },

        onVersionListReceived: function(oRouting) {
            this._getRoutingSteps(oRouting);
        },

        _getRoutingSteps: function(oRouting) {
            let sRoutingStepUrl = this._createRoutingStepUrlFromSelectedRouting(oRouting);
            AjaxUtil.get(sRoutingStepUrl, null, this._setActivityIdModel(oRouting), function() {
                return null;
            });
        },

        /**
         * Get the attachment point payload object from related object attachment point values
         */
        _getAttachmentPointPayloadFromRelatedObjectData: function(mPayloadSettings) {
            let bVersionRequired = !!mPayloadSettings.bVersionRequired;
            let oData = mPayloadSettings.oData;
            let sPropName = mPayloadSettings.sPropName;
            let sTargetName = mPayloadSettings.sTargetPropName || sPropName;
            let oAttachmentData = {};
            if (bVersionRequired && !oData.version) {
                return;
            }

            if (oData.version) {
                oAttachmentData["version"] = oData.version.toUpperCase();
            }
            if (oData.name) {
                oAttachmentData[sTargetName] = oData.name.toUpperCase();
                return oAttachmentData;
            }
        },

        /**
         * Get the attachment point value from the given attachment point payload
         */
        _getAttachmentPointValueFromPayload: function(oAttachmentPointPayload, sPropName) {
            let oAttachmentPoint = oAttachmentPointPayload.attachmentPoints[sPropName];
            if (oAttachmentPoint) {
                return oAttachmentPoint[sPropName];
            }
        },

        _initErrorHandling: function() {
            this.createViewModel();
            this._initMessagePopoverButton();
            this.oMessagePopover = this._initMessagePopover();
        },

        /**
         * Handles the change selection event of Recipe Radio Button
         * @param {object} oEvent - event of changing selection
         */
        onRbSelectRecipe: function(oEvent) {
            this.showRecipeBrowse(true);
            if (this.oRouting) {
                this.clearRelatedObject(this.oRouting);
                this.clearActivityIdField();
            }
        },

        /**
         * Handles the change selection event of Routing Radio Buttons
         * @param {object} oEvent - event of changing selection
         */
        onRbSelectRouting: function(oEvent) {
            this.showRecipeBrowse(false);
            if (this.oRecipe) {
                this.clearRelatedObject(this.oRecipe);
                this.clearActivityIdField();
            }
        },

        /**
         * Clear Input Field and Version(if exists) of Related Object
         * @param {object} oRelatedObject - Related Object(Attachment Point)
         */
        clearRelatedObject: function(oRelatedObject) {
            oRelatedObject._clearObjectName();
            if (oRelatedObject._hasObjectVersion()) {
                oRelatedObject._clearObjectVersion();
            }
        },

        getShowRecipe: function() {
            return this.getViewModel().getProperty(sShowRecipePath);
        }

    });
});