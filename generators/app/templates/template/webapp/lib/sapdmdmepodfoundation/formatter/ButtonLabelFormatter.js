sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/model/ResourceModelEnhancer"
], function(ResourceModel, ResourceModelEnhancer) {
    "use strict";

    let oResourceBundle;
    let oResourceModel;

    const aActionButtonLabelKeys = [
        "activities",
        "activityConfirmation",
        "assembly",
        "availabilityStrip",
        "changeEquipmentStatus",
        "clock",
        "complete",
        "componentList",
        "cycleTimer",
        "dataCollection",
        "dataCollectionList",
        "dataCollectionDataEntry",
        "dmiKpi",
        "downtime",
        "electronicSignature",
        "goodsReceipt",
        "guidedSteps",
        "headerInformation",
        "home",
        "kpi",
        "lmAsset",
        "lmAssetDetails",
        "lmAssetDetailsTooltip",
        "lmAssetOverview",
        "lmAssetOverviewTooltip",
        "lmDashboard",
        "lmOEE",
        "lmOEEDetails",
        "lmOEEDetailsTooltip",
        "lmOEEOverview",
        "lmOEEOverviewTooltip",
        "lmProduction",
        "lmProductionDetails",
        "lmProductionDetailsTooltip",
        "lmProductionOverview",
        "lmProductionOverviewTooltip",
        "lmQuality",
        "lmQualityDetails",
        "lmQualityDetailsTooltip",
        "lmQualityOverview",
        "lmQualityOverviewTooltip",
        "lmWorkCenters",
        "logBuyoff",
        "logNc",
        "main",
        "materialConsumption",
        "ncDataTree",
        "ncSelection",
        "nonConformance",
        "operationList",
        "orderCard",
        "orderScheduleInformation",
        "orderSelectionList",
        "packing",
        "pageViewer",
        "phaseDetails",
        "phaseList",
        "phases",
        "postProductionReporting",
        "productionProcess",
        "quantityConfirmation",
        "qualityInspectionCharacteristicList",
        "qualityInspectionResults",
        "raiseAlert",
        "resourceStatus",
        "sfcCard",
        "sfcMerge",
        "sfcRelabel",
        "sfcSerialize",
        "sfcSplit",
        "signoff",
        "speedLossDetails",
        "speedLossOrderList",
        "start",
        "stopwatch",
        "transaction",
        "toolLoading",
        "toolValidation",
        "sfcDestinationAssign",
        "untaggedEvents",
        "visualInspector",
        "workInstruction",
        "workInstructionList",
        "workInstructionViewer",
        "workList",
        "logTool",
        "details"
    ];

    const aGroupButtonLabelKeys = [
        "activities",
        "actions",
        "button",
        "create",
        "menu",
        "more",
        "productionProcesses",
        "transactions"
    ];

    function getResourceText(sBundleKey, sDefaultText) {
        return sBundleKey ? oResourceBundle.getText(sBundleKey) : sDefaultText;
    }

    function createButtonLabelList(aKeys) {
        return aKeys.map(function(sKey) {
            return {
                i18nLabel: getResourceText(sKey),
                i18nName: `I18n[${sKey}]`
            };
        });
    }

    function createButtonTooltipList(aKeys) {
        return aKeys.map(function(sKey) {
            return {
                i18nLabel: getResourceText(`${sKey}Tooltip`),
                i18nName: `I18n[${sKey}Tooltip]`
            };
        });
    }

    function _getResourceModel(sBundleName) {
        return new ResourceModel({
            bundleName: sBundleName
        });
    }

    return {
        init: function() {
            oResourceModel = _getResourceModel("sap.dm.dme.podfoundation.i18n.buttonLabels");
            const oBundle = oResourceModel.getResourceBundle();
            const sBundleUrl = oBundle.oUrlInfo.url;
            ResourceModelEnhancer.enhanceIndustryTypes(sBundleUrl, oResourceModel);
            oResourceBundle = oResourceModel.getResourceBundle();
        },

        getButtonText: function(sKey) {
            return getResourceText(sKey, "");
        },

        getPageDescriptionText: function(sKey) {
            return getResourceText(sKey, "");
        },

        getActionButtonLabelList: function() {
            return createButtonLabelList(aActionButtonLabelKeys);
        },

        getActionButtonTooltipList: function() {
            return createButtonTooltipList(aActionButtonLabelKeys);
        },

        getNavigationButtonLabelList: function() {
            return createButtonLabelList(aActionButtonLabelKeys);
        },

        getNavigationButtonTooltipList: function() {
            return createButtonTooltipList(aActionButtonLabelKeys);
        },

        getGroupButtonLabelList: function() {
            return createButtonLabelList(aGroupButtonLabelKeys);
        },

        getGroupButtonTooltipList: function() {
            return createButtonTooltipList(aGroupButtonLabelKeys);
        },

        getPageDescriptionList: function() {
            return createButtonLabelList(aActionButtonLabelKeys);
        }
    };
});