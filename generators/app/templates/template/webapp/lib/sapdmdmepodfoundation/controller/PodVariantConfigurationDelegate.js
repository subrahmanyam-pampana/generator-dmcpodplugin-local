sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/dm/dme/podfoundation/model/OperationKeyData",
    "sap/dm/dme/podfoundation/model/ResourceKeyData",
], function(BaseObject, JSONModel, Token, OperationKeyData, ResourceKeyData) {
    "use strict";

    const DM_POD_VARIANT_PREFIX = "DMPodVariants_";
    const DEFAULT_VARIANT = "*standard*";
    let sVariantSetKey = "";
    let aVariantFilterIds = [];

    /**
     * Delegate will return a service for managing variants on the POD.  On
     * the FLP it will return the "Personalization" service.
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.controller.PodVariantConfigurationDelegate", {

        /**
         * Constructor
         * @param {*} oPluginController - Passes the BasePodSelectionController object.
         */
        constructor: function(oPluginController) {
            this._oPluginController = oPluginController;
            this.bIgnoreOperationChangeEvent = false;
            this.bOperationChangeEvent = false;
        },

        /**
         * If Variant/Personalization is available, then initialize.
         */
        enableVariantConfiguration: function() {
            if (this.isVariantManagementAvailable()) {
                this._initializeVariantManagement();
            }
        },

        /**
         * Checks if the Variant control is available in the Page Header
         * @returns @Boolean if Variant Management/Pesonaliation is available
         */
        isVariantManagementAvailable: function() {
            this.variantManagementAvailable = false
            if (!this._oVariantMgmtControl && (this._oPluginController && this._oPluginController._getPodControllerView)) {
                this._oVariantMgmtControl = this._oPluginController._getPodControllerView().byId("pageHeaderVariant");
            }
            if (this._oVariantMgmtControl) {
                this.variantManagementAvailable = true;
            }
            return this.variantManagementAvailable;
        },

        /**
         * Initializes the Variant/Personalization and retrieves teh seeded values from POD Designer and/or URL Parameters
         */
        _initializeVariantManagement() {
            if (this.isVariantManagementAvailable()) {
                this._oVariantMgmtControl.setBackwardCompatibility(false);
                this._oVariantModel = new JSONModel({
                    "variantSet": [],
                    "defaultVariant": DEFAULT_VARIANT,
                    "initialSelectedVariantKey": DEFAULT_VARIANT,
                    "standardItemText": sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("VARIANT_MANAGEMENT_STANDARD")
                });
                this._oVariantMgmtControl.setModel(this._oVariantModel);
                // Load Defaults
                this.aPluginDefaultValues = this._getSeededValuesFromPlugin();
                this.aUrlDefaultValues = this._getSeededValuesFromUrlParameters();
            }
        },

        /***
         * Returns the Variant Key: made up of the globally defined prefix and POD Type
         */
        getVariantKey: function() {
            return this.sVariantSetKey;
        },

        /**
         * Sets the Variant Key based on a globally defined prefix and the POD Type
         * @param sPodType POD Type String
         */
        setVariantKey: function(sPodType) {
            // Create Variant Key based on the POD Type.
            this.sVariantSetKey = DM_POD_VARIANT_PREFIX + sPodType;
        },

        /***
         * Sets the Filter Id's, may need to change
         * @param {array} filters to assign
         */
        setFilterIds: function(aFilterIds) {
            aVariantFilterIds = aFilterIds;
        },

        /**
         *
         * @returns {array} Filter Ids
         */
        getFilterIds: function() {
            return aVariantFilterIds;
        },

        /***
         * Callback method invoked after filterIds have been assigned.
         *
         * Example:
         * this.getAllVariants(this.variantCallback.bind(this));
         */
        variantCallback: function(aVariants, sInitialSelectedKey) {
            this._oVariantModel.setProperty("/variantSet", aVariants);
            this._oVariantModel.setProperty("/initialSelectedVariantKey", sInitialSelectedKey);
            this._oVariantModel.setProperty("/defaultVariant", sInitialSelectedKey);
            let url = window.location.href;
            let query = {};
            if (url.lastIndexOf("&&") > -1) {
                let str = url.substring(url.lastIndexOf("&&"));
                query = this.parseQueryString(str);
            }
            if (Object.keys(query).length === 0) {
                this._oVariantMgmtControl.fireSelect({
                    id: this._oVariantMgmtControl.getId(),
                    key: sInitialSelectedKey
                });
            }
            // May need an else here to handle if the variant is not found

            this.setCurrentVariantModified(false);
        },

        /**
         * Retrieves all existing variant definitions
         * @param {*} fnCallBack Callback function to be invoked
         */
        getAllVariants: function(fnCallBack) {
            let oPersonalizationVariantSet = {},
                aExistingVariants = [],
                aVariantKeysAndNames = [];
            let sVariantSetKey = this.getVariantKey();
            //get the personalization service of shell
            this._oPersonalizationService = sap.ushell.Container.getService("Personalization");
            this._oPersonalizationContainer = this._oPersonalizationService.getPersonalizationContainer("MyVariantContainer");
            this._oPersonalizationContainer.fail(function() {
                // call back function in case of fail
                fnCallBack(aExistingVariants, DEFAULT_VARIANT);
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);
                aVariantKeysAndNames = oPersonalizationVariantSet.getVariantNamesAndKeys();
                for (let key in aVariantKeysAndNames) {
                    if (aVariantKeysAndNames.hasOwnProperty(key)) {
                        let oVariantItemObject = {
                            VariantKey: aVariantKeysAndNames[key],
                            VariantName: key
                        };
                        aExistingVariants.push(oVariantItemObject);
                    }
                }
                let sVariantKey = oPersonalizationVariantSet.getCurrentVariantKey();
                fnCallBack(aExistingVariants, sVariantKey);
            }.bind(this));
        },


        _getFiltersWithValues: function() {
            let oVariantFilters = {};
            let oFilterBar = this._oPluginController.getView().byId("filterBar");
            let aFilterItems = oFilterBar.getFilterGroupItems();
            aFilterItems.forEach(function(oFilterItem) {
                let oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
                let sName = oFilterItem.getName();
                let sControlType = oControl.getMetadata().getName();
                let sFullControlId = oControl.getId();
                let bControlEnabled = oControl.getEnabled();
                let sControlId = sFullControlId.substring(sFullControlId.lastIndexOf("--") + 2);
                oVariantFilters[sName] = {};
                if (sControlType === "sap.m.Input" && oControl.getValue) {
                    oVariantFilters[sName].value = oControl.getValue();
                } else if (sControlType === "sap.m.Select" && oControl.getSelectedKey) {
                    oVariantFilters[sName].value = oControl.getSelectedKey();
                } else if (sControlType === "sap.m.MultiComboBox" && oControl.getSelectedItems) {
                    let values = oControl.getSelectedItems();
                    let aValues = [];
                    for (let i = 0; i < values.length; i++) {
                        aValues.push(values[i].getKey());
                    }
                    oVariantFilters[sName].value = aValues.join(",");
                } else if (sControlType === "sap.m.DateTimePicker" && oControl.getDateValue) {
                    oVariantFilters[sName].value = oControl.getDateValue() && oControl.getDateValue().toISOString();
                }

                oVariantFilters[sName].visible = oFilterItem.getVisibleInFilterBar();
                oVariantFilters[sName].controlType = sControlType;
                oVariantFilters[sName].controlId = sControlId;
                oVariantFilters[sName].controlEnabled = bControlEnabled;
            }.bind(this));

            return oVariantFilters;
        },

        setCurrentVariantModified: function(bFlag) {
            if (bFlag === true) {
                this._oVariantMgmtControl.currentVariantSetModified(true);
            } else {
                this._oVariantMgmtControl.currentVariantSetModified(false);
            }
        },

        parseQueryString: function(url) {
            let params = {};
            let arr = url.split("&&");
            if (arr.length <= 1) {
                return params;
            }
            if (arr[1] === '') {
                return {};
            }
            arr = arr[1].split("&");
            for (let i = 0, l = arr.length; i < l; i++) {
                let a = arr[i].split("=");
                params[a[0]] = decodeURI(a[1]);
            }
            return params;
        },

        onSaveAsVariant: function(oEvent) {
            //oSelectedFilterData is the json object with the data seleced in the filter bar
            let oSelectedFilterData = this._getFiltersWithValues();
            this.saveVariant(oEvent.mParameters.name, oSelectedFilterData, oEvent.mParameters.def, function() {
                //Do the required actions
            }.bind(this));
        },

        /**
         * This method is to save the variant
         * @param {String} sVariantName- Variant name
         * @param {Object} oFilterData- Filter data object-> consolidated filters in JSON
         * @param {Function} fnCallBack- the call back function with the array of variants
         */
        saveVariant: function(sVariantName, oFilterData, bDefault, fnCallBack) {
            let sVariantSetKey = this.getVariantKey();
            // save variants in personalization container
            this._oPersonalizationContainer.fail(function() {
                // call back function in case of fail
                fnCallBack && fnCallBack(false);
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                let oPersonalizationVariantSet = {},
                    oVariant = {},
                    sVariantKey = "";
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);

                //get if the variant exists or add new variant
                sVariantKey = oPersonalizationVariantSet.getVariantKeyByName(sVariantName);
                if (sVariantKey) {
                    oVariant = oPersonalizationVariantSet.getVariant(sVariantKey);
                } else {
                    oVariant = oPersonalizationVariantSet.addVariant(sVariantName);
                    this._updateNewVariantItemKey(sVariantName, oPersonalizationVariantSet);
                }
                if (oFilterData) {
                    oVariant.setItemValue("Filter", JSON.stringify(oFilterData));
                }
                oPersonalizationContainer.save().fail(function() {
                    //call callback fn with false
                    fnCallBack(false);
                }).done(function() {
                    //call call back with true
                    fnCallBack(true);
                    if (bDefault) {
                        this.changeDefaultVariant(oVariant.getVariantKey());
                    }
                }.bind(this));
            }.bind(this));
        },

        /***
         * Called when the manage method is invoked from the view.
         */
        onManageVariant: function(oEvent) {
            this._oMappedVariants = oEvent.getSource().oVariantList.getItems().reduce(function(oVariantMap, oVariantItem) {
                oVariantMap[oVariantItem.getProperty("key")] = oVariantItem.getProperty("text");
                return oVariantMap;
            }, {});
            let aRenamedVariants = oEvent.getParameter("renamed");
            let sNewDefaultVariantKey = oEvent.getParameter("def");
            let aDeletedVariants = oEvent.getParameter("deleted");
            if (aDeletedVariants.length > 0) {
                this.deleteVariants(aDeletedVariants, function(bDeleted) {
                    // delete success if bDeleted is true
                });
            }
            if (aRenamedVariants.length > 0) {
                // get the variants from variant set and rename them in the personalization variant set and then save it.
                this.renameVariants(aRenamedVariants, function(bRenamed) {
                    // rename success if bRenamed is true
                });
            }
            // default variant change
            if (sNewDefaultVariantKey !== oEvent.getSource().getInitialSelectionKey()) {
                this.changeDefaultVariant(sNewDefaultVariantKey);
            }

            this._oMappedVariants = oEvent.getSource().oVariantList.getItems().reduce(function(oVariantMap, oVariantItem) {
                oVariantMap[oVariantItem.getProperty("key")] = oVariantItem.getProperty("text");
                return oVariantMap;
            }, {});

        },

        /**
         * Deletes variants specified by the aVariantKeys parameter.
         * 
         * @param {*} aVariantKeys Variant Keys to delete
         * @param {*} fnCallback Callback function
         */
        deleteVariants: function(aVariantKeys, fnCallback) {
            let oPersonalizationVariantSet = {};
            let sVariantName;
            let sVariantSetKey = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                //handle failure case
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);

                for (let aVariantKey of aVariantKeys) {
                    if (aVariantKey) {
                        //returns the variant name by using the SV key mapped in _oMappedVariants
                        sVariantName = this._oMappedVariants[aVariantKey];
                        //get if the variant exists or add new variant
                        let sVariantKey = oPersonalizationVariantSet.getVariantKeyByName(sVariantName);
                        oPersonalizationVariantSet.delVariant(sVariantKey);
                    }
                }

                oPersonalizationContainer.save().fail(function() {
                    //handle failure case
                    fnCallback(false);
                }).done(function() {
                    fnCallback(true);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Updates the Variant
         * @param {*} sVariantName Name of the variant to update
         * @param {*} oPersonalizationVariantSet Variant Set
         */
        _updateNewVariantItemKey: function(sVariantName, oPersonalizationVariantSet) {
            let oMatchingVariantItem = jQuery.grep(this._oVariantMgmtControl.getVariantItems(), function(oItem) {
                return oItem.getProperty("text") === sVariantName;
            })[0];
            if (oMatchingVariantItem) {
                oMatchingVariantItem.setProperty("key", oPersonalizationVariantSet.getVariantKeyByName(sVariantName));
            }
        },

        /**
         * Renames the Variant
         * 
         * @param {*} aVariantKeys Keys to be renamed
         * @param {*} fnCallback Callback function to invoke
         */
        renameVariants: function(aVariantKeys, fnCallback) {
            let oPersonalizationVariantSet = {};
            let sVariantSetKey = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                //handle failure case
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);

                for (let aVariantKey of aVariantKeys) {
                    if (aVariantKey) {
                        let oVariant = oPersonalizationVariantSet.getVariant(aVariantKey.key);
                        let oFilterData = oVariant.getItemValue("Filter");
                        oPersonalizationVariantSet.delVariant(aVariantKey.key);
                        let oNewVariant = oPersonalizationVariantSet.addVariant(aVariantKey.name);
                        this._updateNewVariantItemKey(aVariantKey.name, oPersonalizationVariantSet);
                        oNewVariant.setItemValue("Filter", oFilterData);
                    }
                }

                oPersonalizationContainer.save().fail(function() {
                    //handle failure case
                    fnCallback(false);
                }).done(function() {
                    fnCallback(true);
                }.bind(this));
            }.bind(this));
        },

        changeDefaultVariant: function(sDefaultKey, fnCallback) {
            let oPersonalizationVariantSet = {};
            let sVariantSetKey = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                //handle failure case
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);
                oPersonalizationVariantSet.setCurrentVariantKey(sDefaultKey);

                oPersonalizationContainer.save().fail(function() {
                    //handle failure case
                    fnCallback && fnCallback(false);
                }).done(function() {
                    this._oVariantModel.setProperty("/defaultVariant", sDefaultKey);
                    fnCallback && fnCallback(true);
                }.bind(this));
            }.bind(this));
        },

        /***
         * Called when select is invoked from the view.
         */
        onSelectVariant: function(oEvent) {
            let sSelectedVariantName = oEvent.getSource().getModel("save_enablement").getProperty("/selectedVariant");
            if (sSelectedVariantName) {
                this.setSelectVariantValue(sSelectedVariantName);
            }
        },

        setSelectVariantValue: function(sSelectedVariantName) {
            this.getVariantFromKey(sSelectedVariantName, function(oSelectedVariant) {
                if (!oSelectedVariant) {
                    this._lastSelectedVariant = DEFAULT_VARIANT;
                    this._clearOtherFilters();
                    let iDefaultFilterCount = this._assignDefaultFilterValues();
                    let oPodSelectionModel = this._oPluginController.getPodSelectionModel();
                    if (iDefaultFilterCount > 0) {
                        // Invoke the Go Button
                        this.invokeFilterGoButton();
                        this._oPluginController.firePodSelectionChangeEvent(oPodSelectionModel);
                    } else {
                        // Clear the POD Selection Model
                        this._clearPodSelectionModel();
                        // No default values, clear filters
                        this.invokeFilterClearButton();
                        this._oPluginController.firePodSelectionChangeEvent(oPodSelectionModel);
                    }
                } else {
                    //logic with the data in variant oSelectedVariant
                    let oVariantFilterObj = JSON.parse(oSelectedVariant._oItemMap.entries.Filter);
                    // Set values to variant
                    let aControlUpdates = this.setSelectVariantFilterValue(oVariantFilterObj);
                    let bAllowPodSelectionRefresh = this.allowPodSelectionRefresh(aControlUpdates);
                    let that = this;
                    // Populate the POD Selection model
                    that.populatePodSelectionModel(aControlUpdates, !bAllowPodSelectionRefresh);
                    this._lastSelectedVariant = oSelectedVariant.getVariantKey();
                }
            }.bind(this));
        },

        _clearOtherFilters: function() {
            this.setCurrentVariantModified(this._lastSelectedVariant && this._lastSelectedVariant !== DEFAULT_VARIANT);
            this._clearControlFilter("userFilter");
            this._clearControlFilter("operationFilter");
            this._clearControlFilter("resourceFilter");
            this._clearControlFilter("quantityFilter");
            this._clearControlFilter("workCenterFilter");
            this._clearControlFilter("inputFilter");
        },

        _clearControlFilter: function(sFilterId) {
            let oControl = this._oPluginController.byId(sFilterId);
            // Make sure the control is available
            if (oControl) {
                if (oControl.removeAllTokens) {
                    oControl.removeAllTokens();
                } else if (oControl.setSelectedKey) {
                    oControl.setSelectedKey("");
                } else if (oControl.setValue) {
                    oControl.setValue("");
                }
            }
        },

        /***
         *
         * Filters Supported:
         * userFilter (Input)
         * workCenterFilter (Input)
         * resourceFilter (Input)
         * quantityFilter (Input)
         * operationFilter (Input)
         */
        setSelectVariantFilterValue: function(oVariantFilterObj) {
            let aControlUpdates = [];
            for (let sFilterName in oVariantFilterObj) {
                let oFilter = oVariantFilterObj[sFilterName];
                let sFilterCtrlId = oVariantFilterObj[sFilterName].controlId;
                let bFilterCtrlEnabled = oVariantFilterObj[sFilterName].controlEnabled;
                let oControl = this._oPluginController.byId(sFilterCtrlId);
                let bIsVisible = this._isFieldVisible(sFilterCtrlId);
                if (!bIsVisible) {
                    continue;
                }
                if (bFilterCtrlEnabled) {
                    // Only set filter values for those controls that are enabled
                    if (oControl.setSelectedKeys) {
                        oControl.setSelectedKeys(oFilter.value && oFilter.value.split(","));
                        aControlUpdates.push(this.createControlObject(sFilterCtrlId, oFilter.value && oFilter.value.split(",")));
                    } else if (oControl.setValue) {
                        oControl.setValue(oFilter.value);
                        aControlUpdates.push(this.createControlObject(sFilterCtrlId, oFilter.value));
                    } else if (oControl.setSelectedKey) {
                        oControl.setSelectedKey(oFilter.value);
                        aControlUpdates.push(this.createControlObject(sFilterCtrlId, oFilter.value));
                    }
                }
            }
            return aControlUpdates;
        },

        _clearPodSelectionModel: function() {
            let oModel = this._oPluginController.getPodSelectionModel();
            oModel.clear();
        },

        _isFieldVisible: function(sFilterCtrlId) {
            let oViewData = this._oPluginController._getViewData();
            // Handle Filters that may be visible (or not) based on POD Designer configuration
            if (sFilterCtrlId === "quantityFilter") {
                return oViewData.quantityFilterVisible;
            } else if (sFilterCtrlId === "userFilter") {
                return oViewData.userFilterVisible;
            }

            return true;
        },

        createControlObject: function(sFilterCtrlId, sValue) {
            return {
                controlId: sFilterCtrlId,
                value: sValue
            };
        },

        /**
         * getFilterValueCount - This method will count the number of values assigned that are not empty.
         * This is necessary to determine if a POD Selection refresh event should be invoked.
         * @param {*} aControlUpdates - Filter values to count
         */
        getFilterValueCount: function(aControlUpdates) {
            let iCount = 0;
            aControlUpdates.forEach(function(oControl) {
                if (oControl.controlId !== "inputTypeFilter" && oControl.controlId !== "inputFilter") {
                    let sValue = oControl.value;
                    if (sValue && sValue.trim().length > 0) {
                        iCount++;
                    }
                }
            });

            return iCount;
        },

        /**
         * Check to see if any values have been assigned.  If not, no POD Selection Refresh event should occur.
         * @param {*} aControlUpdates Filter values to count
         * @returns 
         */
        allowPodSelectionRefresh: function(aControlUpdates) {
            let iFilterValueCount = this.getFilterValueCount(aControlUpdates);
            if (iFilterValueCount > 0) {
                return true;
            }
            return false;
        },

        _assignDefaultFilterValues: function() {
            // Load defaults from POD Designer settings
            this._setFilterControlValues(this.aPluginDefaultValues);
            this.populatePodSelectionModel(this.aPluginDefaultValues, true);
            // Load Defaults from Url            
            this._setFilterControlValues(this.aUrlDefaultValues);
            this.populatePodSelectionModel(this.aUrlDefaultValues, true);

            return this.aPluginDefaultValues.length + this.aUrlDefaultValues.length;
        },

        _setFilterControlValues: function(aControls) {
            for (let sFilterName in aControls) {
                let oControl = this._oPluginController.byId(aControls[sFilterName].controlId);
                let sValue = aControls[sFilterName].value;
                if (oControl.setSelectedKeys) {
                    oControl.setSelectedKeys(sValue && sValue.split(","));
                } else if (oControl.setValue) {
                    oControl.setValue(sValue);
                } else if (oControl.setSelectedKey) {
                    oControl.setSelectedKey(sValue);
                }
            }
        },

        _getSeededValuesFromPlugin: function() {
            let aResult = [];
            let oViewData = this._oPluginController._getViewData();
            let sOperation = oViewData.operation;
            let sWorkCenter = oViewData.workCenter;
            let sUser = oViewData.user;
            let sResource = oViewData.resource;
            let sQuantity = oViewData.quantity;
            // Add controlId and Values to Array
            aResult = this._addFilterToArray(aResult, "workCenterFilter", sWorkCenter);
            aResult = this._addFilterToArray(aResult, "operationFilter", sOperation);
            aResult = this._addFilterToArray(aResult, "userFilter", sUser);
            aResult = this._addFilterToArray(aResult, "resourceFilter", sResource);
            aResult = this._addFilterToArray(aResult, "quantityFilter", sQuantity);

            return aResult;
        },

        _getSeededValuesFromUrlParameters: function() {
            let aResult = [];
            let oPluginController = this._oPluginController;
            let sWorkCenter = oPluginController._toUpperCase(oPluginController.getQueryParameter("WORKCENTER"));
            let sOperation = oPluginController._toUpperCase(oPluginController.getQueryParameter("OPERATION"));
            let sUser = oPluginController._toUpperCase(oPluginController.getQueryParameter("USER"));
            let sResource = oPluginController._toUpperCase(oPluginController.getQueryParameter("RESOURCE"));
            let sQuantity = oPluginController._toUpperCase(oPluginController.getQueryParameter("QUANTITY"));
            // Add controlId and Values to Array
            aResult = this._addFilterToArray(aResult, "workCenterFilter", sWorkCenter);
            aResult = this._addFilterToArray(aResult, "operationFilter", sOperation);
            aResult = this._addFilterToArray(aResult, "userFilter", sUser);
            aResult = this._addFilterToArray(aResult, "resourceFilter", sResource);
            aResult = this._addFilterToArray(aResult, "quantityFilter", sQuantity);

            return aResult;
        },

        _addFilterToArray: function(aArray, sControlId, sValue) {
            if (sValue) {
                let sValueUpper = this._oPluginController._toUpperCase(sValue);
                aArray.push({
                    controlId: sControlId,
                    value: sValueUpper
                });
            }
            return aArray;
        },

        populatePodSelectionModel: function(aControlUpdates, bIgnoreRefresh) {
            let oPodSelectionModel = this._oPluginController.getPodSelectionModel();
            let bChanged = false;
            let that = this;
            aControlUpdates.forEach(function(oControl) {
                let bFieldVisible = that._isFieldVisible(oControl.controlId)
                if (!bFieldVisible) {
                    return;
                }

                if (oControl.controlId === "resourceFilter") {
                    oPodSelectionModel.setResource(new ResourceKeyData(oControl.value));
                    bChanged = true;
                } else if (oControl.controlId === "operationFilter") {
                    that.processOperationActivityChange(oControl.value)
                        .then(function(bFound) {
                            if (!bFound) {
                                oPodSelectionModel.clearOperations();
                            }
                        }.bind(that));
                } else if (oControl.controlId === "userFilter") {
                    oPodSelectionModel.setUser(oControl.value);
                    bChanged = true;
                } else if (oControl.controlId === "quantityFilter") {
                    oPodSelectionModel.setQuantity(oControl.value);
                    bChanged = true;
                } else if (oControl.controlId === "workCenterFilter") {
                    oPodSelectionModel.setWorkCenter(oControl.value);
                    bChanged = true;
                }
            });

            if (bChanged && !bIgnoreRefresh) {
                let that = this;
                setTimeout(function() {
                    // Invoke the Go Button
                    that.invokeFilterGoButton();
                    that._oPluginController.firePodSelectionChangeEvent(oPodSelectionModel);
                }, 100);
            }
        },

        invokeFilterGoButton: function() {
            let oGoButton = this._oPluginController.getView().byId("filterBar-btnGo");
            oGoButton.firePress();
        },

        invokeFilterClearButton: function() {
            let oClearButton = this._oPluginController.getView().byId("filterBar-btnClear");
            oClearButton.firePress();
        },

        getVariantFromKey: function(sVariantName, fnCallback) {
            let sVariantSetKey = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                fnCallback && fnCallback(false);
            });
            this._oPersonalizationContainer.done(function(oPersonalizationContainer) {
                let oPersonalizationVariantSet = {};
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetKey))) {
                    oPersonalizationContainer.addVariantSet(sVariantSetKey);
                }
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetKey);
                let sVariantKey = oPersonalizationVariantSet.getVariantKeyByName(sVariantName);
                fnCallback(oPersonalizationVariantSet.getVariant(sVariantKey));
            }.bind(this));
        },

        processOperationActivityChange: function(sNewValue) {
            let oPluginController = this._oPluginController;
            let that = this;
            return new Promise(function(resolve) {
                let sUrl = oPluginController.getProductDataSourceUri() + "Operations?$select=ref,operation,version,currentVersion&$filter=operation eq '" + sNewValue + "'" + " and operation ne '_SYSTEM'";
                if (sNewValue) {
                    oPluginController.ajaxGetRequest(sUrl, null,
                        function(oResponseData) {
                            let bFound = that.validateAndSaveOperationActivityInPodSelectionModel(sNewValue, oResponseData);
                            resolve(bFound);
                            return;
                        }
                    );
                } else {
                    that.changeOperationActivityInPodSelectionModel(sNewValue);
                }
                resolve(true);
            });
        },

        changeOperationActivityInPodSelectionModel: function(sNewValue, sNewRef) {
            let oPodSelectionModel = this._oPluginController.getPodSelectionModel();
            let oOldValue;
            if (oPodSelectionModel) {
                oOldValue = oPodSelectionModel.getOperation();
            }

            oPodSelectionModel.clearOperations();
            let oOperation;
            if (sNewValue) {
                oOperation = new OperationKeyData(sNewValue);
                if (sNewRef) {
                    let sOperationVersion = sNewRef.substr(sNewRef.lastIndexOf(",") + 1);
                    oOperation.setRef(sNewRef);
                    oOperation.setVersion(sOperationVersion);
                }
                oPodSelectionModel.addOperation(oOperation);
            }
        },

        validateAndSaveOperationActivityInPodSelectionModel: function(sNewValue, oOperationActivityData) {
            let sOperationValue = sNewValue.toUpperCase();
            let bFound = false;
            let that = this;
            oOperationActivityData.value.forEach(function(oOperation) {
                if (oOperation.currentVersion && oOperation.operation === sOperationValue) {
                    that.changeOperationActivityInPodSelectionModel(oOperation.operation, oOperation.ref);
                    bFound = true;
                }
            });

            return bFound;
        }

    });
});