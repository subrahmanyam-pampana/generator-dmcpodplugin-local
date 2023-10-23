sap.ui.define([
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/dm/dme/podfoundation/model/SfcKeyData",
    "sap/dm/dme/podfoundation/model/ResourceKeyData",
    "sap/dm/dme/podfoundation/model/ItemKeyData",
    "sap/dm/dme/podfoundation/model/ProcessLotKeyData",
    "sap/dm/dme/podfoundation/model/ShopOrderKeyData",
    "sap/dm/dme/podfoundation/model/Selection",
    "sap/dm/dme/podfoundation/model/InputType",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/MessageType",
    "sap/dm/dme/serverevent/Topic",
    "sap/dm/dme/util/PlantSettings",
    "sap/m/MultiInput",
    "sap/m/Token",
    "sap/ui/model/odata/type/Decimal",
    "sap/ui/core/format/NumberFormat",
    "sap/base/util/deepClone",
    "sap/base/security/encodeURL",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/podfoundation/controller/PodVariantConfigurationDelegate",
    "sap/dm/dme/podfoundation/browse/SfcBrowseValueHelp",
    "sap/dm/dme/podfoundation/browse/SfcOperationBrowseValueHelp",
    "sap/dm/dme/podfoundation/browse/OperationActivityBrowseValueHelp",
    "sap/dm/dme/podfoundation/browse/ResourceBrowseValueHelp",
    "sap/dm/dme/podfoundation/browse/WorkCenterBrowseValueHelp",
    "sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowseValueHelp",
    "sap/dm/dme/podfoundation/handler/SfcPodHelper"
], function(PluginViewController, SfcKeyData, ResourceKeyData, ItemKeyData, ProcessLotKeyData, ShopOrderKeyData,
    Selection, InputType, PodType, JSONModel, MessageType, Topic, PlantSettings, MultiInput, Token, Decimal,
    NumberFormat, deepClone, encodeURL, PodUtility, Logging, PodVariantConfigurationDelegate, SfcBrowseValueHelp,
    SfcOperationBrowseValueHelp, OperationActivityBrowseValueHelp, ResourceBrowseValueHelp, WorkCenterBrowseValueHelp,
    WorkCenterResourceBrowseValueHelp, SfcPodHelper) {
    "use strict";

    var PUBLIC_FINAL = {
        "public": true,
        "final": true
    };

    return PluginViewController.extend("sap.dm.dme.podfoundation.controller.BasePodSelectionController", {

        metadata: {
            methods: {
                "getFilterBar": PUBLIC_FINAL,
            }
        },

        constructor: function() {
            PluginViewController.call(this);

            this._oLogger = Logging.getLogger("sap.dm.dme.podfoundation.controller.BasePodSelectionController");
        },
        onInit: function() {
            PluginViewController.prototype.onInit.apply(this, arguments);

            this._bOnAfterRenderingComplete = false;
            this._bWaitToProcessOnSearch = false;

            // Add Variant Configuration Support
            this.podVariantConfigurationDelegate = new PodVariantConfigurationDelegate(this);
        },

        /*
         * Function returns filter bar to be available to extensions
         */
        getFilterBar: function() {
            if (!this.oFilterBar && this.getView()) {
                let sViewId = this.getView().getId();
                this.oFilterBar = sap.ui.getCore().byId(sViewId + "--filterBar");
            }
            return this.oFilterBar;
        },

        /*
         * @override
         */
        handleOnBeforeRendering: function() {
            this.initializePodEventHandler();

            // get settings from plugin configuration settings
            this.oViewData = this._getViewData();

            this._loadInputTypeValues(this.oViewData);

            // initialize the view model
            let viewModel = new JSONModel();
            viewModel.setData(this.oViewData);
            this.getView().setModel(viewModel);

            let oFilterBar = this.getFilterBar();
            if (oFilterBar) {
                oFilterBar.fireInitialise();
            }
        },

        isSfcPodSelectionType: function() {
            this._oConfiguration = this.getConfiguration();
            let sPodSelectionType = null;
            if (this._oConfiguration && PodUtility.isNotEmpty(this._oConfiguration.selectionType)) {
                sPodSelectionType = this._oConfiguration.selectionType;
            }
            return (sPodSelectionType && sPodSelectionType === "SFC");
        },

        initializePodEventHandler: function() {
            // sub-classes to implement this
        },

        _checkResourceOperationUpdatedInModel: function() {
            let oPodSelectionModel = this._getPodSelectionModel();
            let sResource = oPodSelectionModel.getResource();
            let oOperation = oPodSelectionModel.getOperations();
            if (sResource && (oOperation && oOperation.length > 0)) {
                return true;
            }
            return false;
        },

        /***
         * @param iWaitTime - Time to wait in between condition checks (in ms.).
         * @param iMaxIterations - Maximum number of iterations of the iWaitTime until timeout.
         * @param fAwaitCondition - Condition to be evaluated as true/false.
         */
        awaitConditionOrTimeout: function(iWaitTime, iMaxIterations, fAwaitCondition) {
            let iCount = 0;
            return new Promise(function(resolve) {
                setTimeout(function awaitTrueCondition() {
                    iCount++;
                    // Invoke the function to check
                    let fCondition = fAwaitCondition.call();
                    if (fCondition) {
                        resolve(true);
                        return;
                    } else if (iCount > iMaxIterations) {
                        resolve(false);
                        return;
                    }
                    setTimeout(awaitTrueCondition, iWaitTime);
                }, iWaitTime);
            });
        },

        _loadInputTypeValues: function(oViewData) {
            oViewData.inputFilterTypes = [{
                    inputType: "SFC",
                    inputTypeLabel: this.getI18nText("sfc")
                },
                {
                    inputType: "PROCESS_LOT",
                    inputTypeLabel: this.getI18nText("processLot")
                }
            ];
        },

        /*
         * @override
         */
        handleOnAfterRendering: function() {
            if (this.isSfcPodSelectionType()) {
                this.configureSfcPodSelectionFilters();
            }
            let aDefaultList = this.getDefaultFilterList();
            this.processOnAfterRendering(aDefaultList);
        },

        configureSfcPodSelectionFilters: function() {
            let oControl = this.getView().byId("inputFilter");
            if (oControl) {
                oControl.setShowValueHelp(true);
                oControl.setShowSuggestion(false);
                oControl.setShowTableSuggestionValueHelp(false);
                oControl.attachValueHelpRequest(this.onSfcValueHelp, this);
            }
        },

        getDefaultFilterList: function() {
            // this to be implemented bu sub-classes
            return null;
        },

        _toUpperCase: function(vValue, oInputControl) {
            let oValue = vValue;
            if (PodUtility.isNotEmpty(vValue) && !Array.isArray(vValue) && typeof vValue === "string") {
                oValue = PodUtility.trim(vValue).toUpperCase();
            }
            if (oInputControl && oInputControl.setValue && oValue !== vValue) {
                // update upper case value back into input field
                oInputControl.setValue(oValue);
            }
            return oValue;
        },

        /*
         * Variant Configuration Support
         */
        enableVariantConfiguration: function() {
            let bPodVariantEnabled = this.isPodVariantConfigurationEnabled();
            if (bPodVariantEnabled && this.podVariantConfigurationDelegate.isVariantManagementAvailable()) {
                // Get the POD Type
                let sPodType = this._getPodSelectionModel().getPodType();
                // Assign the Variant Key for this POD Type
                this.podVariantConfigurationDelegate.setVariantKey(sPodType);
                // Show Variant in the POD
                this.initPodVarant(true);
                // Initialize Variant
                this.podVariantConfigurationDelegate.enableVariantConfiguration();
                // Set the variant configuration within the Pod Controller
                this.setPodControllerVariantConfiguration();
                // Retrieve all Variants
                this.podVariantConfigurationDelegate.getAllVariants(this.variantCallback.bind(this));
                return;
            }

            // Show Variant
            this.initPodVarant(false);
        },

        setPodControllerVariantConfiguration: function() {
            this.getPodController().setVariantConfigurationDelegate(this.podVariantConfigurationDelegate);
        },

        // Check if Pod Variant (View) is Enabled
        isPodVariantConfigurationEnabled: function() {
            let oPodConfiguration = this.getPodConfiguration();
            if (oPodConfiguration) {
                // Check if a Variant Capable Plugin exists
                for (let i = 0; i < oPodConfiguration.plugins.length; i++) {
                    let oPlugin = oPodConfiguration.plugins[i];
                    if (this.isPluginVariantCapable(oPlugin)) {
                        return true;
                    }
                }
            }
            return false;
        },

        // Determine if the Plugin supports Variant (View) Configuration
        isPluginVariantCapable: function(oPlugin) {
            if (oPlugin.id === "wcPodSelectionPlugin") {
                if (oPlugin.configuration && (typeof oPlugin.configuration.enableViews !== "undefined")) {
                    return oPlugin.configuration.enableViews;
                }
            } else if (oPlugin.id === "operationPodSelectionPlugin") {
                if (oPlugin.configuration && (typeof oPlugin.configuration.enableViews !== "undefined")) {
                    return oPlugin.configuration.enableViews;
                }
            }
            return false;
        },

        initPodVarant: function(bVisible) {
            let oController = this.getPodController();
            let oControl = oController.getView().byId("pageHeaderVariant");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
        },

        variantCallback: function(aVariants, sInitialSelectedKey) {
            this.podVariantConfigurationDelegate.variantCallback(aVariants, sInitialSelectedKey);
        },

        getAllVariants: function() {
            this.podVariantConfigurationDelegate.getAllVariants(this.podVariantConfigurationDelegate.variantCallback.bind(this));
        },

        /***
         * End Variant Configuration Support
         */

        processOnAfterRendering: function(aDefaultList) {
            if (this._bOnAfterRenderingComplete) {
                // this function only needs to be called once at start
                return;
            }
            this._bOnAfterRenderingComplete = true;

            // fire POD selection event
            let oModel = this._getPodSelectionModel();
            oModel.setRequiredValuesLoaded(false);

            // if required values defined and all required values set?  if so fire
            if (!this.isSfcPodSelectionType() && this._isRequiredValuesLoaded(this.oViewData, aDefaultList)) {
                // load model and fire events for updated values
                for (let sDefault of aDefaultList) {
                    let sMandatory = sDefault + "FilterMandatory";
                    let sVisible = sDefault + "FilterVisible";
                    let sFilter = sDefault + "Filter";
                    if (this.oViewData[sVisible] || this.oViewData[sMandatory]) {
                        if (this.oViewData[sDefault] || this.oViewData[sDefault] !== "") {
                            this._processChange(sFilter, this.oViewData[sDefault]);
                        }
                    }
                }
                oModel.setRequiredValuesLoaded(true);
                this._delayedFirePodSelectionChangeEvent(oModel, false);
            }

            this._initializeQuantityFilterFormat();

            // Set Focus to Input Filter
            let oControl = this.getView().byId("inputFilter");
            if (oControl) {
                this._addMultiInputValidator(oControl);
                this._setFocus(oControl, 125);
            }

            // Enable Variant Configuration, if available.
            this.enableVariantConfiguration();
        },

        _initializeQuantityFilterFormat: function() {
            const oConstraints = {
                precision: 38,
                scale: 6
            };
            const oFormatOptions = {
                strictGroupingValidation: true,
                minIntegerDigits: 1,
                minFractionDigits: 0
            };
            let oQuantityFilter = this.getView().byId("quantityFilter");
            if (oQuantityFilter && oQuantityFilter.getBinding("value")) {
                oQuantityFilter.getBinding("value").setType(new Decimal(oFormatOptions, oConstraints), "string");
            }
        },

        _addMultiInputValidator: function(oControl) {
            let that = this;
            oControl.addValidator(function(args) {
                that.onValidateMultiInputField(args);
            });
        },

        _getPodSelectionModel: function() {
            if (!this._podSelectionModel) {
                this._podSelectionModel = this.getPodSelectionModel();
            }
            return this._podSelectionModel;
        },

        /***
         * Sets focus to a button based on an expired number of milliseconds
         *
         * @param oControl the control from the view
         * @param iMilliseconds the number of milliseconds to wait until focus is set (default 500ms)
         *
         * Example Usage:
         *
         *  this._setFocus(oControl, 500);
         */
        _setFocus: function(oControl, iMilliseconds) {
            let iTimeout = 500;
            if (iMilliseconds) {
                iTimeout = iMilliseconds;
            }
            if (oControl) {
                setTimeout(function() {
                    oControl.focus();
                }, iTimeout);
            }
        },

        getConfiguration: function() {
            let oConfiguration = PluginViewController.prototype.getConfiguration.call(this);
            if (oConfiguration) {
                return deepClone(oConfiguration);
            }
            return null;
        },

        _getConfiguration: function() {
            if (!this._oViewData) {
                let oConfiguration = this.getConfiguration();
                if (oConfiguration) {
                    this._oViewData = oConfiguration;
                    this._updateViewData(this._oViewData);
                }
                this._oViewData.updateInputFilterLabel = true;
                this._oViewData.updateInputFilterPlaceholder = true;
                this._oViewData.updateInputFilterTooltip = true;
                if (PodUtility.isNotEmpty(this._oViewData.inputFilterLabel)) {
                    this._oViewData.updateInputFilterLabel = false;
                }
                if (PodUtility.isNotEmpty(this._oViewData.inputFilterPlaceholder)) {
                    this._oViewData.updateInputFilterPlaceholder = false;
                }
                if (PodUtility.isNotEmpty(this._oViewData.inputFilterTooltip)) {
                    this._oViewData.updateInputFilterTooltip = false;
                }
                let oPodSelectionModel = this._getPodSelectionModel();
                oPodSelectionModel.setInputType(this._oViewData.inputType);
            }
            return this._oViewData;
        },

        _updateViewData: function(oViewData) {
            if (oViewData) {
                if (typeof oViewData.inputType === "undefined") {
                    oViewData.inputType = "SFC";
                }
                if (typeof oViewData.inputTypeFilterVisible === "undefined") {
                    oViewData.inputTypeFilterVisible = false;
                }
                if (typeof oViewData.inputTypeFilterLabel === "undefined") {
                    oViewData.inputTypeFilterLabel = "";
                }
                if (typeof oViewData.inputTypeFilterTooltip === "undefined") {
                    oViewData.inputTypeFilterTooltip = "";
                }
            }
        },

        _getViewData: function() {
            let oViewData = this._getConfiguration();

            // set POD Type
            let oPodSelectionModel = this._getPodSelectionModel();
            oPodSelectionModel.setPodType(PodType.WorkCenter);
            if (PodUtility.isNotEmpty(oViewData.inputType)) {
                oPodSelectionModel.setInputType(oViewData.inputType);
            }

            this._initializeWorklistType(oPodSelectionModel);

            // load defaults
            this._loadDefaultData(oViewData);

            // load default quantity
            this._loadDefaultQuantity(oViewData, oPodSelectionModel);

            // set up filter group item bindings based on input view data
            let sInputType = oPodSelectionModel.getInputType();
            this._updateControlsForInputType(sInputType, oViewData);

            this._loadControlDefaults(oViewData);

            return oViewData;
        },

        _updateControlsForInputType: function(sInputType, oViewData) {
            if (sInputType === InputType.ProcessLot) {
                this._setControlDefaults(oViewData, "input", "processLot");
            } else if (sInputType === InputType.ShopOrder) {
                this._setControlDefaults(oViewData, "input", "shopOrder");
            } else if (sInputType === InputType.Item ||
                sInputType === InputType.ItemVersion) {
                this._setControlDefaults(oViewData, "input", "item");
            } else {
                this._setControlDefaults(oViewData, "input", "sfc");
            }
        },

        _updateInputControl: function(sInputType) {
            const oConfigData = this._getConfiguration();
            const oInputFilter = this.getView().byId("inputFilter");
            if (oInputFilter) {
                const oFilterBar = this.getView().byId("filterBar");
                const aFilterGroupItems = oFilterBar.getFilterGroupItems();
                this._setInputControlText(oConfigData, sInputType, oInputFilter, aFilterGroupItems[1]);
            }
        },

        _setInputControlText: function(oConfigData, sInputType, oInputFilter, oFilterGroupItem) {
            if (sInputType === InputType.ProcessLot) {
                if (oConfigData.updateInputFilterPlaceholder) {
                    oInputFilter.setPlaceholder(this.getI18nText("processLotPlaceholder"));
                }
                if (oConfigData.updateInputFilterLabel) {
                    oFilterGroupItem.setLabel(this.getI18nText("processLot"));
                }
                if (oConfigData.updateInputFilterTooltip) {
                    oFilterGroupItem.setLabelTooltip(this.getI18nText("processLotTooltip"));
                }
            } else {
                if (oConfigData.updateInputFilterPlaceholder) {
                    oInputFilter.setPlaceholder(this.getI18nText("sfcPlaceholder"));
                }
                if (oConfigData.updateInputFilterLabel) {
                    oFilterGroupItem.setLabel(this.getI18nText("sfc"));
                }
                if (oConfigData.updateInputFilterTooltip) {
                    oFilterGroupItem.setLabelTooltip(this.getI18nText("sfcTooltip"));
                }
            }
            this._setFocus(oInputFilter, 0);
        },

        _loadDefaultData: function(oViewData) {
            // implemented by sub-class
        },

        _loadDefaultQuantity: function(oViewData, oPodSelectionModel) {
            let vValue = this.getQueryParameter("QUANTITY");
            if (PodUtility.isEmpty(vValue) && PodUtility.isNotEmpty(oViewData.quantity)) {
                vValue = oViewData.quantity;
                if (typeof oViewData.quantity !== "string") {
                    // decimal, convert to string in current language
                    vValue = PodUtility.floatToString(oViewData.quantity);
                }
            }
            let fValue = -1;
            if (typeof vValue === "string" && PodUtility.isNotEmpty(vValue)) {
                fValue = PodUtility.stringToFloat(vValue);
            }
            if (typeof fValue !== "string" && fValue > 0) {
                oViewData.quantity = vValue;
                oPodSelectionModel.setQuantity(fValue);
            }
        },

        _loadControlDefaults: function(oViewData) {
            // implemented by sub-class
        },

        onInputTypeChangeEvent: function(oEvent) {
            let oItem = oEvent.getParameters().selectedItem;
            this._processChange("inputTypeFilter", oItem.getKey());
        },

        onChange: function(oEvent) {
            let oFilterBar = this.getFilterBar();
            if (oFilterBar) {
                oFilterBar.fireFilterChange(oEvent);
            }
            let oSource = oEvent.getSource();
            let sId = oSource.getId();
            let sNewValue = this._toUpperCase(oSource.getValue(), oSource);
            this._processChange(sId, sNewValue);
        },

        _processChange: function(sId, vValue) {
            let vNewValue = vValue;
            if (typeof vNewValue === "string") {
                vNewValue = this._toUpperCase(vValue);
            }
            // update POD Selection Model
            let oOldValue;
            let oNewValue;
            let oPodSelectionModel = this._getPodSelectionModel();

            this.setWaitToProcessOnSearch(true);

            // fire change event
            if (this._endsWith(sId, "inputFilter")) {

                this._oMainInputValue = null;

                let aOldValues = oPodSelectionModel.getSelections();
                if (aOldValues) {
                    if (aOldValues.length === 1) {
                        oOldValue = aOldValues[0];
                    } else if (aOldValues.length > 1) {
                        oOldValue = aOldValues;
                    }
                }
                oPodSelectionModel.clearSelections();

                oNewValue = this._addInputValueToModel(oPodSelectionModel, vNewValue);

                oPodSelectionModel.setRequiredValuesLoaded(false);
                if (this._validateRequiredValues(this.oViewData, false)) {
                    oPodSelectionModel.setRequiredValuesLoaded(true);
                    // save for later checking
                    this._oMainInputValue = oNewValue;
                    // only fire event if required values are also set
                    this.fireInputChangeEvent(oNewValue, oOldValue);
                }
                this.setWaitToProcessOnSearch(false);

            } else if (this._endsWith(sId, "inputTypeFilter")) {
                let sOldValue = oPodSelectionModel.getInputType();
                oPodSelectionModel.setInputType(vValue);
                oPodSelectionModel.setInputValue("");
                oPodSelectionModel.clearSelections();
                this._updateInputControl(vValue);
                this.fireInputTypeChangeEvent(vValue, sOldValue);

                this.setWaitToProcessOnSearch(false);

            } else if (this._endsWith(sId, "resourceFilter")) {
                this.changeResourceInPodSelectionModel(vNewValue);

            } else if (this._endsWith(sId, "quantityFilter")) {
                let fOldQuantity = 0;
                let fNewQuantity = vNewValue;
                if (typeof vNewValue === "string") {
                    if (PodUtility.isEmpty(vNewValue)) {
                        fNewQuantity = null;
                    } else {
                        let floatFormatter = NumberFormat.getFloatInstance({});
                        fNewQuantity = floatFormatter.parse(vNewValue);
                    }
                }
                fOldQuantity = oPodSelectionModel.getQuantity();
                oPodSelectionModel.setQuantity(fNewQuantity);
                this.fireQuantityChangeEvent(fNewQuantity, fOldQuantity);

                this.setWaitToProcessOnSearch(false);

            } else {
                this._processSubclassFilters(sId, vNewValue);
            }

            this._addErrorMessage();
        },

        _processSubclassFilters: function(sId, vNewValue) {
            // called by sub-classes to process specific filters
        },

        onValidateMultiInputField: function(args) {
            // if a token already loaded, clear it before adding new one
            // this is only called when manually entering a token
            this._clearMultiInputTokens()
                .then(function() {
                    let sText = args.text.toUpperCase();
                    let oToken = new Token({
                        key: sText,
                        text: sText
                    });
                    args.asyncCallback(oToken);
                }.bind(this));
            return MultiInput.WaitForAsyncValidation;
        },

        _clearMultiInputTokens: function() {
            let that = this;
            let oPromise = new Promise(function(resolve) {
                let oControl = that.getView().byId("inputFilter");
                if (oControl) {
                    oControl.removeAllTokens();
                }
                setTimeout(function() {
                    resolve();
                }, 125);
            });
            return oPromise;
        },

        onTokenUpdate: function(oEvent) {
            let oFilterBar = this.getFilterBar();
            if (oFilterBar) {
                oFilterBar.fireFilterChange(oEvent);
            }

            this.setExecuteActionDelay(300);

            let oSource = oEvent.getSource();
            let sId = oSource.getId();
            let vNewValue = null;
            let sType = oEvent.getParameter("type"); // "added" or "removed"

            if (sType === "added") {
                // this is called when a token is manually entered
                // and not when a sfc is selected in worklist
                let aAddedTokens = oEvent.getParameter("addedTokens");
                vNewValue = aAddedTokens[0].getKey();
                this._processChange(sId, vNewValue);

            } else if (sType === "removed") {
                // this is called when token is deleted or
                // removed by pressing backspace on selected token
                let aRemovedTokens = oEvent.getParameter("removedTokens");

                let aTokens = this._getRemainingTokens(oSource.getTokens(), aRemovedTokens);
                if (!aTokens || aTokens.length === 0) {
                    // nothing remaining, need to fire main input change event so worklist is refreshed
                    this._processChange(sId, "");
                    this._clearSelectionForNcPod();
                    return;
                }
                if (aTokens.length === 1) {
                    vNewValue = aTokens[0].getKey();
                } else if (aTokens.length > 1) {
                    vNewValue = [];
                    for (let oToken of aTokens) {
                        vNewValue[vNewValue.length] = oToken.getKey();
                    }
                }
                this._updateModelAndRefreshWorklist(vNewValue);
            }
        },

        _clearSelectionForNcPod: function() {
            if (this.getPodSelectionModel().getPodType() === PodType.NC) {
                this._updateModelAndRefreshWorklist("");
            }
        },

        _getRemainingTokens: function(aTokens, aRemovedTokens) {
            let aRemaining = [];
            for (let oToken of aTokens) {
                let bFound = false
                for (let oRemoveToken of aRemovedTokens) {
                    if (oToken.getId() === oRemoveToken.getId()) {
                        bFound = true;
                        break;
                    }
                }
                if (!bFound) {
                    aRemaining[aRemaining.length] = oToken;
                }
            }
            return aRemaining;
        },

        _addInputValueToModel: function(oPodSelectionModel, vNewValue) {
            let sInputValue = null;
            let aSelections = vNewValue;
            if (vNewValue) {
                if (!Array.isArray(vNewValue)) {
                    sInputValue = PodUtility.trim(vNewValue).toUpperCase();
                    aSelections = [];
                    aSelections[aSelections.length] = sInputValue;
                } else if (vNewValue.length === 1) {
                    sInputValue = PodUtility.trim(vNewValue[0]).toUpperCase();
                }
            }
            oPodSelectionModel.setInputValue(sInputValue);
            oPodSelectionModel.clearSelections();
            oPodSelectionModel.clearDistinctSelections();
            oPodSelectionModel.clearSelectedRoutingSteps();

            if (!sInputValue && !Array.isArray(vNewValue)) {
                if (this.isSfcPodSelectionType()) {
                    this.clearWorkCenterField();
                    this.clearOperationField()
                }
                return null;
            }

            for (let oSelection of aSelections) {
                let oNewValue = new Selection();
                oNewValue.setInput(oSelection);

                switch (oPodSelectionModel.getInputType()) {
                    case InputType.ProcessLot:
                        oNewValue.setProcessLot(new ProcessLotKeyData(oSelection));
                        break;
                    case InputType.ShopOrder:
                        oNewValue.setShopOrder(new ShopOrderKeyData(oSelection));
                        break;
                    case InputType.Item:
                    case InputType.ItemVersion:
                        oNewValue.setItem(new ItemKeyData(oSelection));
                        break;
                    default:
                        oNewValue.setSfc(new SfcKeyData(oSelection));
                }

                oPodSelectionModel.addSelection(oNewValue);
            }
            return aSelections;
        },

        _addErrorMessage: function() {
            this.clearMessages();
            let aMessages = this._getCurrentMessages();
            let that = this;
            aMessages.forEach(function(oMessage) {
                let aParsedId = oMessage.getTarget().split("--");
                let id = aParsedId[aParsedId.length - 1];
                let filedLabel;
                if (id === "quantityFilter/value") {
                    filedLabel = that.getI18nText("quantity");
                }
                that.addMessage(MessageType.Error, oMessage.getMessage(), "", filedLabel);
            });
        },

        _getCurrentMessages: function() {
            // added to support QUnit tests
            return sap.ui.getCore().getMessageManager().getMessageModel().getData();
        },

        _delayedOnSearch() {
            let oModel = this._getPodSelectionModel();
            if (!this._validateRequiredValues(this.oViewData)) {
                oModel.setRequiredValuesLoaded(false);
                return;
            }
            oModel.setRequiredValuesLoaded(true);

            // clear messages
            this.clearMessages();

            // add input value to selection (if one token) for filtering
            let oInputField = this.getView().byId("inputFilter");
            if (oInputField) {
                let aTokens = oInputField.getTokens();
                if (aTokens && aTokens.length === 1) {
                    this._addInputValueToModel(oModel, aTokens[0].getKey());
                }
            }

            //TODO: This will need to move after the Resource validation issue is fixed.  Subscriptions
            // should only be updated if the work center and resource are valid
            this.updateNotificationSubscriptions();
            this._doFirePodSelectionChangeEvent(oModel);
        },

        setWaitToProcessOnSearch: function(bWait) {
            this._bWaitToProcessOnSearch = bWait;
        },

        onSearch: function() {
            let that = this;
            setTimeout(function() {
                if (that._bFiringChangeEvent) {
                    return;
                }
                if (!that._bWaitToProcessOnSearch) {
                    that._delayedOnSearch();
                } else {
                    // retry on search
                    that._retryOnSearch();
                }
            }, 100);
        },

        _retryOnSearch: function() {
            this.onSearch();
        },

        _doFirePodSelectionChangeEvent: function(oModel) {
            this.firePodSelectionChangeEvent(oModel, false);
        },

        _endsWith: function(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        onClear: function() {
            let oItems = [];
            let oFilterBar = this.getFilterBar();
            if (oFilterBar) {
                oItems = oFilterBar.getAllFilterItems(true);
            }
            for (let oItem of oItems) {
                let oControl = oFilterBar.determineControlByFilterItem(oItem);
                if (oControl) {
                    // Set the Focus to the Input Filter on Clear
                    if (oItem._sControlId.indexOf("--inputFilter") > -1) {
                        oControl.removeAllTokens();
                        this._setFocus(oControl);
                    } else if (oItem._sControlId.indexOf("--inputTypeFilter") < 0) {
                        oControl.setValue("");
                    }
                }
            }

            // clear messages
            this.clearMessages();

            // notify listeners
            let oModel = this._getPodSelectionModel();
            oModel.clear();

            this._oLogger.debug("onClear: POD Selection model cleared");

            this.firePodSelectionChangeEvent(oModel, true);
        },

        _setControlDefaultsFromArray: function(oViewData, aNameList) {
            if (aNameList && aNameList.length > 0) {
                for (let oName of aNameList) {
                    this._setControlDefaults(oViewData, oName, oName);
                }
            }
        },

        _getJQueryLabelByPartialId: function(sPartialId) {
            return jQuery("label[id$='" + sPartialId + "']");
        },

        _setOptionalRequiredLabelStyle: function(sControlName) {
            let sOptionalRequiredColor = sap.ui.core.theming.Parameters.get("sapUiPositive");
            let sPartialId = "-INTERNAL_GROUP-" + sControlName.toUpperCase();
            let sClassDefinition = "<style>label[id$='" + sPartialId + "'].sapMesPodSelectionOptionalRequired > .sapMLabelColonAndRequired::after {color: " + sOptionalRequiredColor + ";}</style>";
            jQuery(sClassDefinition).appendTo("body");
            let that = this;
            setTimeout(function() {
                let oElement = that._getJQueryLabelByPartialId(sPartialId);
                if (oElement) {
                    oElement.addClass("sapMesPodSelectionOptionalRequired");
                }
            }, 0);
        },

        _setEnforcementOverrides(oViewData, sControlName, sEnforcement, sI18nName) {
            // Set resource enforcement to REQUIRED (Operation POD Only)
            if (oViewData.type === "OPERATION" && sControlName === "resource") {
                oViewData[sEnforcement] = "REQUIRED";
            }
        },

        _setControlDefaults: function(oViewData, sControlName, sI18nName) {
            let sVisible = sControlName + "FilterVisible";
            let sLabel = sControlName + "FilterLabel";
            let sTooltip = sControlName + "FilterTooltip";
            let sPlaceholder = sControlName + "FilterPlaceholder";
            let sEnforcement = sControlName + "FilterEnforcement";
            let sMandatory = sControlName + "FilterMandatory";

            this._setEnforcementOverrides(oViewData, sControlName, sEnforcement, sI18nName);
            if (oViewData[sVisible]) {
                if (!oViewData[sLabel] || oViewData[sLabel] === "") {
                    oViewData[sLabel] = this.getI18nText(sI18nName);
                }
                if (!oViewData[sTooltip] || oViewData[sTooltip] === "") {
                    oViewData[sTooltip] = this.getI18nText(sI18nName + "Tooltip");
                }
                if (!oViewData[sPlaceholder] || oViewData[sPlaceholder] === "") {
                    oViewData[sPlaceholder] = this.getI18nText(sI18nName + "Placeholder");
                }

                oViewData[sMandatory] = false;
                if (oViewData[sEnforcement] && oViewData[sEnforcement] !== "") {
                    if (oViewData[sEnforcement] === "REQUIRED" || oViewData[sEnforcement] === "OPTIONAL_REQUIRED") {
                        oViewData[sMandatory] = true;
                        if (oViewData[sEnforcement] === "OPTIONAL_REQUIRED") {
                            this._setOptionalRequiredLabelStyle(sControlName);
                        }
                    }
                }
            } else {
                oViewData[sLabel] = "";
                oViewData[sTooltip] = "";
                oViewData[sPlaceholder] = "";
                oViewData[sMandatory] = false;
            }
        },

        _isRequiredValuesLoaded: function(oViewData, aDefaultList) {
            let sDefault, sMandatory, sVisible, sEnforcement;

            // check for required values
            let countOfRequired = 0;
            for (sDefault of aDefaultList) {
                sMandatory = sDefault + "FilterMandatory";
                sVisible = sDefault + "FilterVisible";
                sEnforcement = sDefault + "FilterEnforcement";
                if (oViewData[sVisible] && oViewData[sMandatory] && oViewData[sEnforcement] === "REQUIRED") {
                    if (!oViewData[sDefault] || oViewData[sDefault] === "") {
                        return false;
                    }
                    countOfRequired++;
                }
            }

            // check all optional required values
            let countOfOptionalRequired = 0;
            let count = 0;
            for (sDefault of aDefaultList) {
                sMandatory = sDefault + "FilterMandatory";
                sVisible = sDefault + "FilterVisible";
                sEnforcement = sDefault + "FilterEnforcement";
                if (oViewData[sVisible] && oViewData[sMandatory] && oViewData[sEnforcement] === "OPTIONAL_REQUIRED") {
                    countOfOptionalRequired++;
                    if (!oViewData[sDefault] || oViewData[sDefault] === "") {
                        continue;
                    }
                    count++;
                }
            }

            if (countOfRequired === 0 && countOfOptionalRequired === 0) {
                // no required or optional required defined - return true
                return true;
            }

            if (countOfOptionalRequired > 0 && count === 0) {
                return false;
            }

            return true;
        },

        _validateRequiredValues: function(oViewData, bIgnoreErrors) {
            // implemented by sub-class
            return false;
        },

        _doValidateRequiredValues: function(oViewData, aCheckList, bIgnoreErrors) {
            if (!this._checkRequiredValues(oViewData, aCheckList, bIgnoreErrors)) {
                return false;
            }
            return this._checkOptionalRequiredValues(oViewData, aCheckList, bIgnoreErrors);
        },

        _checkRequiredValues: function(oViewData, aCheckList, bIgnoreErrors) {
            let sMandatory, sVisible, sEnforcement, sFieldName;

            for (let sCheck of aCheckList) {
                sMandatory = sCheck + "FilterMandatory";
                sVisible = sCheck + "FilterVisible";
                sEnforcement = sCheck + "FilterEnforcement";
                if (oViewData[sVisible] && oViewData[sMandatory] && oViewData[sEnforcement] === "REQUIRED") {
                    if (!this._isValidRequiredValue(sCheck)) {
                        sFieldName = this.getI18nText(sCheck);
                        if (sCheck === "input") {
                            sFieldName = this._getInputTypeLabel();
                        }
                        if (typeof bIgnoreErrors === "undefined" || !bIgnoreErrors) {
                            this.showErrorMessage(this.getI18nText("missingRequiredValue", [sFieldName]), false, false);
                        }
                        return false;
                    }
                }
            }

            return true;
        },

        _checkOptionalRequiredValues: function(oViewData, aCheckList, bIgnoreErrors) {

            let sMandatory, sVisible, sEnforcement;

            // check all optional required values
            let countOfOptionalRequired = 0;
            let count = 0;
            for (let sCheck of aCheckList) {
                sMandatory = sCheck + "FilterMandatory";
                sVisible = sCheck + "FilterVisible";
                sEnforcement = sCheck + "FilterEnforcement";
                if (oViewData[sVisible] && oViewData[sMandatory] && oViewData[sEnforcement] === "OPTIONAL_REQUIRED") {
                    countOfOptionalRequired++;
                    if (!this._isValidRequiredValue(sCheck)) {
                        continue;
                    }
                    count++;
                }
            }
            if (countOfOptionalRequired > 0 && count === 0) {
                if (typeof bIgnoreErrors === "undefined" || !bIgnoreErrors) {
                    this.showErrorMessage(this.getI18nText("missingRequiredOptionalValue"), false, false);
                }
                return false;
            }

            return true;
        },

        _isValidRequiredValue: function(sFieldName) {
            let oControl = this.getView().byId(sFieldName + "Filter");
            if (oControl) {
                if (oControl.getTokens) {
                    if (oControl.getTokens().length > 0) {
                        return true;
                    }
                }
                if (PodUtility.isEmpty(oControl.getValue())) {
                    return false;
                }
                return true;
            }
            return false;
        },

        _getInputTypeLabel: function() {
            let oPodSelectionModel = this._getPodSelectionModel();
            let sInputType = oPodSelectionModel.getInputType();
            if (sInputType === InputType.ProcessLot) {
                return this.getI18nText("processLot");

            } else if (sInputType === InputType.ShopOrder) {
                return this.getI18nText("shopOrder");

            } else if (sInputType === InputType.Item ||
                sInputType === InputType.ItemVersion) {
                return this.getI18nText("item");

            } else if (sInputType === InputType.Sfc) {
                return this.getI18nText("sfc");
            }
            return null;
        },

        fireInputChangeEvent: function(oNewValue, oOldValue) {
            if (typeof this._bProcessingMainInputAction !== "undefined" &&
                this._bProcessingMainInputAction) {
                // processing main input action - do nothing
                this._bProcessingMainInputAction = false;
                return;
            }
            let sServerNotificationEvent = null;
            if (PodUtility.isNotEmpty(this._sServerNotificationEventType)) {
                sServerNotificationEvent = this._sServerNotificationEventType;
                this._sServerNotificationEventType = null;
            }
            this._bFiringChangeEvent = true;
            this.publish("InputChangeEvent", {
                "source": this,
                "newValue": oNewValue,
                "oldValue": oOldValue,
                "serverNotificationEvent": sServerNotificationEvent
            });
            let that = this;
            setTimeout(function() {
                that._bFiringChangeEvent = null;
            }, 300);
        },

        fireInputTypeChangeEvent: function(oNewValue, oOldValue) {
            this.publish("InputTypeChangeEvent", {
                "source": this,
                "newValue": oNewValue,
                "oldValue": oOldValue
            });
            let that = this;
            setTimeout(function() {
                that._clearMultiInputTokens();
                that._processChange("inputFilter", "");
            }, 0);
        },

        fireOperationChangeEvent: function(oNewValue, oOldValue) {
            this.publish("OperationChangeEvent", {
                "source": this,
                "newValue": oNewValue,
                "oldValue": oOldValue
            });
        },

        fireResourceChangeEvent: function(oNewValue, oOldValue) {
            this.publish("ResourceChangeEvent", {
                "source": this,
                "newValue": oNewValue,
                "oldValue": oOldValue
            });
        },

        fireQuantityChangeEvent: function(oNewValue, oOldValue) {
            this.publish("QuantityChangeEvent", {
                "source": this,
                "newValue": oNewValue,
                "oldValue": oOldValue
            });
        },

        firePodSelectionChangeEvent: function(oModel, bClear) {
            if (!this._bFiringChangeEvent) {
                this.publish("PodSelectionChangeEvent", {
                    "source": this,
                    "model": oModel,
                    "clear": bClear
                });
            }
        },

        _delayedFirePodSelectionChangeEvent: function(oModel, bClear) {
            let that = this;
            setTimeout(function() {
                that.firePodSelectionChangeEvent(oModel, bClear);
            }, 1000);
        },

        _onSfcModeWorklistSelectEvent: function(sChannelId, sEventId, oData) {
            this._onWorklistSelectEvent(sChannelId, sEventId, oData);
            let that = this;
            setTimeout(function() {
                that.publish("WorklistSelectEvent", oData);
            }, 0);
        },

        _onWorklistSelectEvent: function(sChannelId, sEventId, oData) {
            if (this.isEventFiredByThisPlugin(oData)) {
                // don't process if same object firing event
                return;
            }
            let oInputField = this.getView().byId("inputFilter");
            if (oInputField) {
                let oPodSelectionModel = this._getPodSelectionModel();

                let aSelections = null;
                if (oData && oData.selections) {
                    aSelections = oData.selections;
                }

                if (!aSelections || aSelections.length === 0) {
                    let bClearInputField = false;
                    if ((oData && oData.clearInput) || this.isSfcPodSelectionType()) {
                        bClearInputField = true;
                    }
                    if (typeof this._bDoNotClearInputOnWorklistSelectEvent !== "undefined" &&
                        this._bDoNotClearInputOnWorklistSelectEvent) {
                        bClearInputField = false;
                        this._bDoNotClearInputOnWorklistSelectEvent = false;
                    }
                    if (bClearInputField) {
                        oInputField.removeAllTokens();
                        oPodSelectionModel.setInputValue("");
                        this._setFocus(oInputField);
                        this.clearWorkCenterField();
                        this.clearOperationField();
                        this._showSfcNotFoundMessage(oPodSelectionModel);
                    }
                    return;
                }
                this._oMainInputValue = null;
                let sInputType = oPodSelectionModel.getInputType();

                let sText, aText = [],
                    sValue = "";
                if (aSelections.length > 0) {
                    for (let oSelection of aSelections) {
                        if (sInputType === InputType.ProcessLot) {
                            sText = oSelection.processLot;
                        } else if (sInputType === InputType.ShopOrder) {
                            sText = oSelection.shopOrder;
                        } else if (sInputType === InputType.Item ||
                            sInputType === InputType.ItemVersion) {
                            sText = oSelection.item;
                        } else {
                            sText = oSelection.sfc;
                        }
                        if (!this._isTextInArray(aText, sText)) {
                            aText[aText.length] = sText;
                        }
                    }
                    sValue = aText[0];
                    if (aText.length > 1) {
                        sValue = this.getI18nText("multipleSelections");
                    }
                }
                this._loadInputField(oInputField, aText);

                oPodSelectionModel.setInputValue(sValue);

                this.loadWorkCenterField(oData);

                this.loadOperationField(oData);
            }
        },

        _isTextInArray: function(aText, sText) {
            if (aText && aText.length > 0) {
                for (let oText of aText) {
                    if (oText === sText) {
                        return true;
                    }
                }
            }
            return false;
        },

        _showSfcNotFoundMessage: function(oPodSelectionModel) {
            let sPodType = oPodSelectionModel.getPodType();
            if (sPodType === PodType.WorkCenter &&
                this.isSfcPodSelectionType() &&
                PodUtility.isNotEmpty(this._oMainInputValue)) {
                let oPodController = this.getPodController();
                let sMessage = oPodController.getI18nText("sfcDoesNotExist", [this._oMainInputValue]);
                this.showErrorMessage(sMessage, true, true);
            }
            this._oMainInputValue = null;
        },

        _loadInputField: function(oInputField, aText) {
            let aTokens = [];
            if (aText && aText.length > 0) {
                for (let sText of aText) {
                    aTokens[aTokens.length] = new Token({
                        text: sText,
                        key: sText
                    });
                }
            }
            if (aTokens.length > 0) {
                oInputField.setTokens(aTokens);
            } else if (oInputField.getTokens().length > 0) {
                oInputField.removeAllTokens();
            }
        },

        clearWorkCenterField: function() {
            // to be implemented by subclass
        },

        loadWorkCenterField: function(sSfc) {
            // to be implemented by subclass
        },

        clearOperationField: function() {
            // to be implemented by subclass
        },

        loadOperationField: function(sSfc) {
            // to be implemented by subclass
        },

        onResourceChangeEvent: function(sChannelId, sEventId, oData) {
            if (this.isEventFiredByThisPlugin(oData)) {
                // don't process if same object firing event
                return;
            }
            let oView = this.getView();
            if (!oView) {
                return;
            }
            let oInputField = oView.byId("resourceFilter");
            if (oInputField) {
                oInputField.setValue(oData.newValue.getResource());
            }
        },

        changeResourceInPodSelectionModel: function(sNewValue) {

            let oPodSelectionModel = this._getPodSelectionModel();
            let oOldValue;
            if (oPodSelectionModel) {
                oOldValue = oPodSelectionModel.getResource();
            }
            if (PodUtility.isEmpty(sNewValue)) {
                // empty value, clear model and fire change
                oPodSelectionModel.setResource(null);
                this.fireResourceChangeEvent(null, oOldValue);
                this.setWaitToProcessOnSearch(false);
                return;
            }

            // validate resource against current plant
            return this._validateResource(sNewValue)
                .then(function() {
                    let oResource = new ResourceKeyData(sNewValue);
                    oPodSelectionModel.setResource(oResource);
                    this.fireResourceChangeEvent(oResource, oOldValue);
                    this.setWaitToProcessOnSearch(false);
                }.bind(this))
                .catch(function(oError) {
                    let oInputField = this.getView().byId("resourceFilter");
                    if (oInputField) {
                        this._setFocus(oInputField);
                    }
                    let sMessage = this.getI18nText("invalidResourceValue", [sNewValue]);
                    this.showErrorMessage(sMessage, true, true);

                    // clear model and fire change
                    oPodSelectionModel.setResource(null);
                    this.fireResourceChangeEvent(null, oOldValue);
                    this.setWaitToProcessOnSearch(false);
                }.bind(this));
        },

        _validateResource: function(sResource) {
            let that = this;
            let oPromise = new Promise(function(resolve, reject) {
                let sCurrentPlant = PlantSettings.getCurrentPlant();
                let sUrl = that.getPlantRestDataSourceUri() + "api/resource/v1/resources";
                sUrl = sUrl + "?plant=" + sCurrentPlant + "&resource=" + encodeURL(sResource);
                that.ajaxGetRequest(sUrl, null,
                    function(aResources) {
                        if (aResources && aResources.length === 1) {
                            // single resource found
                            resolve();
                        }
                        reject();
                    },
                    function(oError, sHttpErrorMessage) {
                        let err = oError || sHttpErrorMessage;
                        reject(err);
                    }
                );
            });
            return oPromise;
        },

        /*
         * This enables receiving Notification messages in the selection plugins
         * @override
         */
        isSubscribingToNotifications: function() {
            return true;
        },

        /*
         * Return the function to be called when a SFC_SELECT or SFC_START
         * notification message is received
         * @override
         */
        getNotificationMessageHandler: function(sTopic) {
            switch (sTopic) {
                case Topic.SFC_SELECT:
                    return this._handleSfcSelectedServerEvent;
                case Topic.SFC_START:
                    return this._handleSfcStartServerEvent;
            }
            return PluginViewController.prototype.getNotificationMessageHandler.call(this, sTopic);
        },

        /**
         * Set the SFC value sent in the message into the main selection field.  Value is set
         * only if the main selection field is type SFC.
         * @param oMsg The SFC_SELECT server notification
         * @private
         */
        _handleSfcSelectedServerEvent: function(oMsg) {
            this._sServerNotificationEventType = Topic.SFC_SELECT;
            let sUserMsg = this.getI18nText("sfcselectnotificationtoast", [oMsg.sfc, oMsg.resource]);
            this._updateSfcSelectionField([oMsg.sfc], sUserMsg);
        },

        /**
         * Set one or more SFC values sent in the message into the main selection field.  Values are set
         * only if the main selection field is type SFC.
         * @param oMsg The SFC_START server notification
         * @private
         */
        _handleSfcStartServerEvent: function(oMsg) {
            this._sServerNotificationEventType = Topic.SFC_START;
            let sSfc, sUserMsg;
            if (this._isMultipleSfcsNotification(oMsg)) {
                sUserMsg = this.getI18nText("sfcstartnotificationtoastmulti", [oMsg.sfcs[0], oMsg.sfcs[oMsg.sfcs.length - 1], oMsg.operation]);
            } else {
                sSfc = this._getSfcFromNotificationMsg(oMsg);
                sUserMsg = this.getI18nText("sfcstartnotificationtoast", [sSfc, oMsg.operation]);
            }
            this._updateSfcSelectionField(oMsg.sfcs, sUserMsg);
        },

        _updateSfcSelectionField: function(aSfcs, sUserMsg) {
            if (this._mainSelectionFieldIsType(InputType.Sfc)) {
                let oInputField = this.byId("inputFilter");
                this._loadInputField(oInputField, aSfcs);

                this._updateModelAndRefreshWorklist(aSfcs, this._sServerNotificationEventType);

                let that = this;
                setTimeout(function() {
                    that.clearMessages();
                    that.showSuccessMessage(sUserMsg, true, true);
                }, 0);
            }
        },

        _updateModelAndRefreshWorklist: function(vSfc, sServerTopic) {
            // update model
            let oPodSelectionModel = this._getPodSelectionModel();
            let aSelections = this._addInputValueToModel(oPodSelectionModel, vSfc);

            // refresh worklist
            this._fireWorklistRefreshEvent(aSelections, sServerTopic);
        },

        _fireWorklistRefreshEvent: function(aSelections, sServerTopic, bForceSelection) {
            let oData = {};
            oData.source = this;
            oData.sendToAllPages = true;
            oData.sfcs = aSelections;
            if (sServerTopic) {
                oData.serverNotificationEvent = sServerTopic;
            }
            if (typeof bForceSelection !== "undefined" && bForceSelection === true) {
                oData.forceSelection = true;
            }

            // use debounce technique in case tokens are removed very fast
            if (this._vTimerId) {
                clearTimeout(this._vTimerId);
            }
            let that = this;
            this._vTimerId = setTimeout(function() {
                // this will be called only when no refresh event
                // requests have been made for 1 second
                that.publish("WorklistRefreshEvent", oData);
            }, 1000);
        },

        _isMultipleSfcsNotification: function(oMsg) {

            if (!oMsg.sfcs) {
                return false;
            }

            return oMsg.sfcs.length > 1;
        },

        _getSfcFromNotificationMsg: function(oMsg) {

            if (oMsg.sfcs) {
                return oMsg.sfcs[0];
            } else {
                return oMsg.sfc;
            }
        },

        _mainSelectionFieldIsType: function(oType) {

            let sInputType = this._getPodSelectionModel().getInputType();
            return sInputType === oType;
        },

        assignTaboutOrEnterEvents: function(sInputField, oConfiguration) {
            if (oConfiguration && oConfiguration.mainInputActionButtonId) {
                let oInputField = this.getView().byId(sInputField);

                // Assign Action on Tabout or Enter key being pressed on Main Input field
                oInputField.onsapenter = ((oEvent) => {
                    this._handleTaboutOrEnterAction(oEvent, oConfiguration, oInputField);
                });
                oInputField.onsaptabnext = ((oEvent) => {
                    this._handleTaboutOrEnterAction(oEvent, oConfiguration, oInputField);
                });
            }
        },

        _focusNextInputField: function(oDocument, aInputs) {
            for (let i = 0; i < aInputs.length; i++) {
                if (oDocument.activeElement.id === aInputs[i].id && i + 1 < aInputs.length) {
                    aInputs[i + 1].focus();
                    break;
                }
            }
        },

        _updatePodSelectionModel: function(vNewValue) {
            let oPodSelectionModel = this._getPodSelectionModel();
            let aSelections = this._addInputValueToModel(oPodSelectionModel, vNewValue);
            return aSelections;
        },

        _updateManualSfcEntry: function(oInputField) {
            // this is called when a token is manually entered and tab or enter is pressed.
            // Not when a sfc is selected in worklist.
            let vNewValue = oInputField.getValue();
            let aTokens = oInputField.getTokens();
            if (vNewValue) {
                this._updatePodSelectionModel(vNewValue);
            } else if (aTokens && aTokens.length === 1) {
                vNewValue = [];
                for (let oToken of aTokens) {
                    vNewValue[vNewValue.length] = oToken.getKey();
                }
                this._updatePodSelectionModel(vNewValue);
            }
            return vNewValue;
        },

        _handleMainInputAction: function(aSelections, oConfiguration) {
            let that = this;
            this.executeActionButton(oConfiguration.mainInputActionButtonId, function() {
                setTimeout(function() {
                    that._bDoNotClearInputOnWorklistSelectEvent = true;
                    that._fireWorklistRefreshEvent(aSelections, that._sServerNotificationEventType, true);
                }, 600);
            });
        },

        _handleTaboutOrEnterAction: function(oEvent, oConfiguration, oInputField) {
            this.excuteActionButton = false;
            // No Action on Enter or Tabout Assigned.
            if (!oConfiguration || PodUtility.isEmpty(oConfiguration.mainInputActionButtonId)) {
                return;
            }
            // Check if keycode is Tab(9) or Enter(13)
            // If so, perform the assigned input action.
            let iKeyCode = oEvent.keyCode || oEvent.which;
            if (iKeyCode !== 13 && iKeyCode !== 9) {
                return;
            }

            // If no value and no tokenization, return (nothing entered)
            if ((oInputField.getValue && oInputField.getValue().length === 0) &&
                (oInputField.getTokens && oInputField.getTokens().length === 0)) {
                return;
            }

            let sSfc = this._updateManualSfcEntry(oInputField);
            let aSelections = this._updatePodSelectionModel(sSfc);

            // Tab key or Enter was pressed
            if (iKeyCode === 9 || iKeyCode === 13) {
                if (iKeyCode === 13) {
                    // on Enter, change the focus to the next input field
                    let aInputs = $(':input');
                    this._focusNextInputField(document, aInputs);
                }
                this._bProcessingMainInputAction = true;
                this.setExecuteActionDelay(-1);
                let bIsSfcPod = this.isSfcPodSelectionType();
                this._sfcPodHandleMainInputAction(bIsSfcPod, aSelections, oConfiguration);
            }
        },

        _invokeMainInputActionSfcPod: function(bIsSfcPod) {
            let that = this;
            return that.awaitConditionOrTimeout(10, 500, function() {
                    return that._checkResourceOperationUpdatedInModel();
                })
                .then(function(bResult) {
                    if (bResult) {
                        that._executeMainInputActionSfcPod(bIsSfcPod);
                        that._oLogger.debug("_invokeMainInputActionSfcPod - resource LOADED");
                        return true;
                    } else {
                        that._oLogger.debug("_invokeMainInputActionSfcPod - resource NOT LOADED");
                        return false;
                    }
                });
        },

        _executeMainInputActionSfcPod: function(bIsSfcPod) {
            if (bIsSfcPod) {
                this._oLogger.debug("_executeMainInputActionSfcPod - isSfcPodSelectionType='" + bIsSfcPod + "'");
                if (!PodUtility.isEmpty(this._oConfiguration.mainInputActionButtonId) && !this._processedActionButton) {
                    let that = this;
                    let fnSetValues = function() {
                        that._processedActionButton = true;
                    };
                    let oPodSelectionModel = this.getPodSelectionModel();
                    let sResource = oPodSelectionModel.getResource();
                    this._oLogger.debug("_executeMainInputActionSfcPod executeActionButton was called.  Resource was '" + sResource + "'");
                    this.executeActionButton(that._oConfiguration.mainInputActionButtonId, fnSetValues);
                }
            }
        },

        _sfcPodHandleMainInputAction(bIsSfcPod, aSelections, oConfiguration) {
            this._processedActionButton = false;
            if (bIsSfcPod) {
                let that = this;
                that._fireWorklistRefreshEvent(aSelections, that._sServerNotificationEventType, true);
                return;
            }
            // If not SFC POD Selection Type, perform the following
            let that = this;
            setTimeout(function() {
                // Fire action and the WorklistRefreshEvent from the callback
                that._handleMainInputAction(aSelections, oConfiguration);
            }, 0);
        },

        setExecuteActionDelay: function(iExecutionDelay) {
            this.getPodController().setExecuteActionDelay(iExecutionDelay);
        },

        _initializeWorklistType: function(oPodSelectionModel) {
            const oConfiguration = this.getPodConfiguration();
            if (!oConfiguration || !oConfiguration.plugins || oConfiguration.plugins.length === 0) {
                return;
            }
            let bWorklistExists = false;
            for (let oPlugin of oConfiguration.plugins) {
                if (oPlugin.id.startsWith("worklistPlugin")) {
                    bWorklistExists = true;
                    break;
                }
            }
            if (!bWorklistExists) {
                let sInputType = oPodSelectionModel.getInputType();
                oPodSelectionModel.setWorklistType(sInputType);
            }
        },

        onSfcValueHelp: function(oEvent) {
            let oValueHelp = this.getSfcBrowseValueHelp();
            oValueHelp.open(oEvent);
        },

        processSfcBrowseSelection: function(oMainInputField, aText) {
            this._loadInputField(oMainInputField, aText);
            this._processChange(oMainInputField.getId(), aText);
        },

        onResourceValueHelp: function(oEvent) {
            let oValueHelp = this.getResourceBrowseValueHelp();
            oValueHelp.open(oEvent);
        },

        processResourceBrowseSelection: function(oResourceField, oSelectedObject) {
            let sNameValue = this._toUpperCase(oSelectedObject.name);
            oResourceField.setValue(sNameValue);
            this.changeResourceInPodSelectionModel(sNameValue);
        },

        onOperationActivityValueHelp: function(oEvent) {
            if (!this.isSfcPodSelectionType()) {
                this.onOpenOperationActivityBrowse(oEvent);
            } else {
                this.onOpenSfcOperationBrowse(oEvent);
            }
        },

        onOpenOperationActivityBrowse: function(oEvent) {
            let oValueHelp = this.getOperationActivityBrowseValueHelp();
            oValueHelp.open(oEvent);
        },

        onOpenSfcOperationBrowse: function(oEvent) {
            let oValueHelp = this.getSfcOperationBrowseValueHelp();
            let oInputField = oEvent.getSource();

            let aOperations = this._oPodModelEventHandler.getOperations();
            oValueHelp.onSfcOperationValueHelp(oInputField, aOperations);
        },

        processOperationBrowseSelection: function(oInputField, oSelectedObject) {
            let sOperationActivityName = this._toUpperCase(oSelectedObject.name);
            let sOperationActivityRef = oSelectedObject.ref;
            oInputField.setValue(sOperationActivityName);
            this.changeOperationActivityInPodSelectionModel(sOperationActivityName, sOperationActivityRef);
        },

        changeOperationActivityInPodSelectionModel: function(sNewValue, sNewRef) {
            // to be implemented by sub-class
        },

        onWorkCenterValueHelp: function(oEvent) {
            let oValueHelp = this.getWorkCenterBrowseValueHelp();
            oValueHelp.open(oEvent);
        },

        processWorkCenterBrowseSelection: function(oWorkCenterField, oSelectedObject) {
            let sNameValue = this._toUpperCase(oSelectedObject.name);
            oWorkCenterField.setSelectedKey(oSelectedObject.ref);
            oWorkCenterField.setValue(sNameValue);
            this._processChange(oWorkCenterField.getId(), sNameValue);
        },

        onWorkCenterResourceValueHelp: function(oEvent, aWorkCenterResourceItems) {
            let oValueHelp = this.getWorkCenterResourceBrowseValueHelp();
            oValueHelp.open(oEvent, aWorkCenterResourceItems);
        },

        processWorkCenterResourceBrowseSelection: function(oResourceField, oSelectedObject) {
            let sNameValue = this._toUpperCase(oSelectedObject.name);
            oResourceField.setValue(sNameValue);
            this.changeResourceInPodSelectionModel(sNameValue);
        },

        getSfcBrowseValueHelp: function() {
            if (!this._oSfcBrowseValueHelp) {
                this._oSfcBrowseValueHelp = this.createSfcBrowseValueHelp();
            }
            return this._oSfcBrowseValueHelp;
        },

        createSfcBrowseValueHelp: function() {
            return new SfcBrowseValueHelp(this, {
                tableSelectMode: "SingleSelectMaster",
                statusExcludes: ["DONE"]
            });
        },

        getResourceBrowseValueHelp: function() {
            if (!this._oResourceBrowseValueHelp) {
                this._oResourceBrowseValueHelp = this.createResourceBrowseValueHelp();
            }
            return this._oResourceBrowseValueHelp;
        },

        createResourceBrowseValueHelp: function() {
            return new ResourceBrowseValueHelp(this, {});
        },

        getOperationActivityBrowseValueHelp: function() {
            if (!this._oOperationActivityBrowseValueHelp) {
                this._oOperationActivityBrowseValueHelp = this.createOperationActivityBrowseValueHelp();
            }
            return this._oOperationActivityBrowseValueHelp;
        },

        createOperationActivityBrowseValueHelp: function() {
            return new OperationActivityBrowseValueHelp(this, {});
        },

        getSfcOperationBrowseValueHelp: function() {
            if (!this._oSfcOperationBrowseValueHelp) {
                this._oSfcOperationBrowseValueHelp = this.createSfcOperationBrowseValueHelp();
            }
            return this._oSfcOperationBrowseValueHelp;
        },

        createSfcOperationBrowseValueHelp: function() {
            return new SfcOperationBrowseValueHelp(this, {});
        },

        getWorkCenterBrowseValueHelp: function() {
            if (!this._oWorkCenterBrowseValueHelp) {
                this._oWorkCenterBrowseValueHelp = this.createWorkCenterBrowseValueHelp();
            }
            return this._oWorkCenterBrowseValueHelp;
        },

        createWorkCenterBrowseValueHelp: function() {
            return new WorkCenterBrowseValueHelp(this, {});
        },

        getWorkCenterResourceBrowseValueHelp: function() {
            if (!this._oWorkCenterResourceBrowseValueHelp) {
                this._oWorkCenterResourceBrowseValueHelp = this.createWorkCenterResourceBrowseValueHelp();
            }
            return this._oWorkCenterResourceBrowseValueHelp;
        },

        createWorkCenterResourceBrowseValueHelp: function() {
            return new WorkCenterResourceBrowseValueHelp(this, {});
        },

        getSfcPodHelper: function() {
            if (!this._oSfcPodHelper) {
                this._oSfcPodHelper = new SfcPodHelper(this);
            }
            return this._oSfcPodHelper;
        }
    });
});