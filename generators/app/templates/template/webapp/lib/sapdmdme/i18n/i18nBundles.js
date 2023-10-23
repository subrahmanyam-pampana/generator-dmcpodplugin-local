sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/model/ResourceModelEnhancer",
    "sap/dm/dme/logging/Logging"
], function(ResourceModel, ResourceModelEnhancer, Logging) {
    "use strict";

    let logger = Logging.getLogger("sap.dm.dme.i18n");

    // Master data (object) bundles
    let _oUnitTestAppBundle;
    let _bundles = {};
    let NOT_FOUND = "' not found";

    function _getSharedBundleName(sObjectName) {
        return "sap.dm.dme.i18n." + sObjectName;
    }

    function _getAppBundleName(sObjectName) {
        return "sap.dm.dme." + sObjectName + ".i18n.i18n";
    }

    function _getPluginBundleName(sPluginName) {
        return "sap.dm.dme.plugins." + sPluginName + ".i18n.i18n";
    }

    function _getPluginPropertiesBundleName(sPluginName) {

        return "sap.dm.dme.plugins." + sPluginName + ".i18n.builder";
    }

    function _getBundle(sBundleName, bEnhanceBundle) {
        let bDoEnhanceBundle = true;
        if (typeof bEnhanceBundle !== "undefined") {
            bDoEnhanceBundle = bEnhanceBundle;
        }
        let sBundleNameReference = sBundleName;
        if (!bDoEnhanceBundle) {
            // use different key for non-enhanced version
            sBundleNameReference = sBundleName + "_nonEnhanced";
            bDoEnhanceBundle = false;
        }
        let oBundle = _bundles[sBundleNameReference];
        if (!oBundle) {
            let oResourceModel = new ResourceModel({
                bundleName: sBundleName
            });
            oBundle = oResourceModel.getResourceBundle();
            _bundles[sBundleNameReference] = oBundle; // Will blow if oBundle undefined
            if (bDoEnhanceBundle) {
                // Enhance for Process Industry by default or if passed flag is true
                ResourceModelEnhancer.enhanceIndustryTypes(sBundleName, oResourceModel);
            }
        }
        return oBundle;
    }

    return {

        getBaseBundle: function(sName, bEnhanceBundle) {
            return _getBundle(sName, bEnhanceBundle);
        },

        getSharedBundle: function(sName) {
            let sKey = _getSharedBundleName(sName);
            let oBundle = _bundles[sKey];
            if (!oBundle) {
                let oResourceModel = new ResourceModel({
                    bundleName: sKey
                });
                oBundle = oResourceModel.getResourceBundle();
                if (oBundle.aPropertyFiles.length === 0) {
                    logger.error("Bundle '" + sKey + NOT_FOUND);
                } else {
                    _bundles[sKey] = oBundle; // Will blow if oBundle undefined
                }
                // Enhance for Process Industry
                ResourceModelEnhancer.enhanceIndustryTypes(sKey, oResourceModel);
            }
            return oBundle;
        },

        /**
         * Get the application specific bundle.
         * @param sObjectName the name of your object as defined in the resource root of the application, like 'material'
         * If not passed then the bundle is assumed to be located at the relative url ../../i18n.properties. This is used
         * for bundle access in automated tests.
         */
        getAppBundle: function(sObjectName) {
            let oBundle;
            if (sObjectName) {
                // In production bundles
                let sKey = _getAppBundleName(sObjectName);
                oBundle = _getBundle(sKey);
            } else {
                if (!_oUnitTestAppBundle) {
                    _oUnitTestAppBundle = new ResourceModel({
                        bundleUrl: "../../i18n/i18n.properties"
                    }).getResourceBundle();
                }
                oBundle = _oUnitTestAppBundle;
            }
            return oBundle;
        },

        getPodPluginBundle: function(sPluginName) {
            let sKey = _getPluginBundleName(sPluginName);
            this._getEnhancedBundle(sKey);
            let oBundle = _bundles[sKey];
            if (!oBundle) {
                oBundle = new ResourceModel({
                    bundleName: sKey
                }).getResourceBundle();
                if (oBundle.aPropertyFiles.length === 0) {
                    logger.error("Bundle '" + sKey + NOT_FOUND);
                } else {
                    _bundles[sKey] = oBundle; // Will blow if oBundle undefined
                }
            }
            return oBundle;
        },

        _getEnhancedBundle: function(sKey) {
            return _getBundle(sKey);
        },

        getPodPluginPropertiesBundle: function(sPluginName) {
            let sKey = _getPluginPropertiesBundleName(sPluginName);
            this._getEnhancedBundle(sKey);
            let oBundle = _bundles[sKey];
            if (!oBundle) {
                oBundle = new ResourceModel({
                    bundleName: sKey
                }).getResourceBundle();
                if (oBundle.aPropertyFiles.length === 0) {
                    logger.error("Bundle '" + sKey + NOT_FOUND);
                } else {
                    _bundles[sKey] = oBundle; // Will blow if oBundle undefined
                }
            }
            return oBundle;
        },

        getGlobalBundle: function() {
            return this.getSharedBundle("global");
        },

        getStatusBundle: function() {
            return this.getSharedBundle("status");
        },

        getObjectTypeBundle: function() {
            return this.getSharedBundle("objectType");
        },

        getEnumBundle: function() {
            return this.getSharedBundle("enum");
        },

        getBomBundle: function() {
            return this.getSharedBundle("bom");
        },

        getUomBundle: function() {
            return this.getSharedBundle("uom");
        },

        getMaterialBundle: function() {
            return this.getSharedBundle("material");
        },

        getOperationBundle: function() {
            return this.getSharedBundle("operation");
        },

        getRoutingBundle: function() {
            return this.getSharedBundle("routing");
        },

        getRecipeBundle: function() {
            return this.getSharedBundle("recipe");
        },

        getReasonCodeBundle: function() {
            return this.getSharedBundle("reasonCode");
        },

        getAttachmentBundle: function() {
            return this.getSharedBundle("attachment");
        },

        getDataCollectionBundle: function() {
            return this.getSharedBundle("dataCollection");
        },

        getResourceBundle: function() {
            return this.getSharedBundle("resource");
        },

        getFormulaBundle: function() {
            return this.getSharedBundle("formula");
        },

        getDataFieldBundle: function() {
            return this.getSharedBundle("dataField");
        },

        getShopOrderBundle: function() {
            return this.getSharedBundle("shopOrder");
        },

        getNcGroupBundle: function() {
            return this.getSharedBundle("ncGroup");
        },

        getWorkCenterBundle: function() {
            return this.getSharedBundle("workCenter");
        },

        getWorkInstructionBundle: function() {
            return this.getSharedBundle("workInstruction");
        },

        getNCCodeBundle: function() {
            return this.getSharedBundle("ncCode");
        },

        getSfcBundle: function() {
            return this.getSharedBundle("sfc");
        },

        getChargeBundle: function() {
            return this.getSharedBundle("charge");
        },

        getPropertyEditorBundle: function() {
            return this.getSharedBundle("propertyEditor");
        },

        getListMaintenanceBundle: function() {
            return this.getSharedBundle("listMaintenance");
        },

        getGoodreceiptBundle: function() {
            return this.getSharedBundle("goodreceipt");
        },

        /**
         * Get the localized text for the given object and key
         * @param sObjectName Optional, See getAppBundle for description
         * @param sKey the property key
         */
        getAppText: function(sObjectName, sKey) {
            if (arguments.length === 1) {
                return this.getAppBundle().getText(arguments[0]);
            } else if (arguments.length === 2) {
                return this.getAppBundle(sObjectName).getText(sKey);
            }
        },

        /**
         * Get the localized text for the given object and key
         * @param sObjectName Required, full path to properties file
         * @param sKey the property key
         * @param aArgs optional plugs
         */
        getPropertiesText: function(sObjectName, sKey, aArgs) {
            return this.getBaseBundle(sObjectName, true).getText(sKey, aArgs);
        },

        /**
         * Get the localized text for the given object and key but will
         * not enhance it for Process Industries
         * @param sObjectName Required, full path to properties file
         * @param sKey the property key
         * @param aArgs optional plugs
         */
        getNonEnhancedPropertiesText: function(sObjectName, sKey, aArgs) {
            return this.getBaseBundle(sObjectName, false).getText(sKey, aArgs);
        },

        getGlobalText: function(sKey, aArgs) {
            return this.getGlobalBundle().getText(sKey, aArgs);
        },

        getStatusText: function(sKey) {
            return this.getStatusBundle().getText(sKey);
        },

        getObjectTypeText: function(sKey) {
            return this.getObjectTypeBundle().getText(sKey);
        },

        getEnumText: function(sKey) {
            return this.getEnumBundle().getText(sKey);
        },

        getListMaintenanceText: function(sKey, aArgs) {
            return this.getListMaintenanceBundle().getText(sKey, aArgs);
        },

        // Master object property access ---------------------------------------------

        getBomText: function(sKey) {
            return this.getBomBundle().getText(sKey);
        },

        getUomText: function(sKey) {
            return this.getUomBundle().getText(sKey);
        },

        getMaterialText: function(sKey) {
            return this.getMaterialBundle().getText(sKey);
        },

        getOperationText: function(sKey) {
            return this.getOperationBundle().getText(sKey);
        },

        getRoutingText: function(sKey) {
            return this.getRoutingBundle().getText(sKey);
        },

        getRecipeText: function(sKey) {
            return this.getRecipeBundle().getText(sKey);
        },

        getReasonCodeText: function(sKey) {
            return this.getReasonCodeBundle().getText(sKey);
        },

        getAttachmentText: function(sKey) {
            return this.getAttachmentBundle().getText(sKey);
        },

        getDataCollectionText: function(sKey) {
            return this.getDataCollectionBundle().getText(sKey);
        },

        getWorkCenterText: function(sKey) {
            return this.getWorkCenterBundle().getText(sKey);
        },

        getResourceText: function(sKey) {
            return this.getResourceBundle().getText(sKey);
        },

        getFormulaText: function(sKey) {
            return this.getFormulaBundle().getText(sKey);
        },

        getDataFieldText: function(sKey) {
            return this.getDataFieldBundle().getText(sKey);
        },


        getShopOrderText: function(sKey) {
            return this.getShopOrderBundle().getText(sKey);
        },

        getNcGroupText: function(sKey) {
            return this.getNcGroupBundle().getText(sKey);
        },

        getWorkInstructionText: function(sKey) {
            return this.getWorkInstructionBundle().getText(sKey);
        },

        getNCCodeText: function(sKey) {
            return this.getNCCodeBundle().getText(sKey);
        },

        getSfcText: function(sKey) {
            return this.getSfcBundle().getText(sKey);
        },

        getPropertyEditorText: function(sKey, aArgs) {
            return this.getPropertyEditorBundle().getText(sKey, aArgs);
        },

        getGoodreceiptText: function(sKey, aArgs) {
            return this.getGoodreceiptBundle().getText(sKey, aArgs);
        },

        // POD Plugin property access ---------------------------------------------

        getPluginBundle: function(sPluginName) {
            return this.getPodPluginBundle(sPluginName);
        },

        getPluginText: function(sPluginName, sKey) {
            return this.getPluginBundle(sPluginName).getText(sKey);
        },

        getDataCollectionEntryBundle: function() {
            return this.getPodPluginBundle("dataCollectionEntryPlugin");
        },

        getDataCollectionEntryText: function(sKey) {
            return this.getDataCollectionEntryBundle().getText(sKey);
        },

        getWorklistBundle: function() {
            return this.getPodPluginBundle("worklistPlugin");
        },

        getWorklistText: function(sKey) {
            return this.getWorklistBundle().getText(sKey);
        },

        // POD Plugin properties property access ---------------------------------------------

        getPluginPropertiesText: function(sPluginName, sKey) {
            return this.getPodPluginPropertiesBundle(sPluginName).getText(sKey);
        }


    };
});