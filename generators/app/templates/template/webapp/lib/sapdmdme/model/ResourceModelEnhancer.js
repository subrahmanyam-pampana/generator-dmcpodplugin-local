sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/util/PlantSettings"
], function(ResourceModel, PlantSettings) {
    "use strict";

    let PROCESS_INDUSTRY_PREFIX = "pi_";
    let PROCESS_INDUSTRY_NAME = "PROCESS";

    return {

        /**
         * Enhances models defined to Components manifest with PI bundle if Plant is Process Industry
         *
         * @param {object} Component to get models from manifest
         * @public
         */
        enhanceModelsfromManifest: function(oComponent) {
            let sIndustryType = PlantSettings.getIndustryType();
            if (!oComponent || sIndustryType !== PROCESS_INDUSTRY_NAME) {
                return;
            }
            let oAppModels = oComponent.getManifestEntry("/sap.ui5/models");

            let aModelNames = Object.getOwnPropertyNames(oAppModels);
            let sModelName, oData, oModel;
            for (let i = 0; i < aModelNames.length; i++) {
                sModelName = aModelNames[i];
                oData = {};
                if (this._checkIsAppModel(oAppModels, sModelName)) {
                    oData.bundleName = oAppModels[sModelName].settings.bundleName;
                    if (!jQuery.trim(oData.bundleName)) {
                        oData.bundleUrl = oAppModels[sModelName].settings.bundleUrl;
                    }
                    // getModel() does not accept an empty string so we need to get the default model with getModel()
                    oModel = this._getModelFromComponent(sModelName, oComponent);
                    if (this._isResourceModel(oModel) || oModel.enhance) {
                        this.enhanceResourceModel(oData, oModel);
                    }
                }
            }
        },

        _getModelFromComponent: function(sModelName, oComponent) {
            return sModelName.length > 0 ? oComponent.getModel(sModelName) : oComponent.getModel();
        },

        _checkIsAppModel: function(oAppModels, sModelName) {
            return !!(oAppModels[sModelName] && oAppModels[sModelName].settings);
        },

        /**
         * Enhances the input ResourceModel with a process industry bundle
         * denoted with a pi_ prefix if the current Plant is defined
         * as a Process Industry type
         *
         * @param {string} sBundle name of bundle to enhance
         * @param {object} oResourceModel the resource model
         * @public
         */
        enhanceIndustryTypes: function(sBundle, oResourceModel) {
            let sIndustryType = PlantSettings.getIndustryType();

            // Enhance for IndustryType
            if (sIndustryType === PROCESS_INDUSTRY_NAME) {
                let oData = {};
                if (sBundle.indexOf("/") >= 0) {
                    oData.bundleUrl = sBundle;
                } else {
                    oData.bundleName = sBundle;
                }
                if (this._isResourceModel(oResourceModel)) {
                    this.enhanceResourceModel(oData, oResourceModel);
                }
            }
        },

        /**
         * Enhances a ResourceModel with the input bundle 
         *
         * @param {object} oData bundle object (i.e.; {bundleUrl: "/abc/xyz"} or {bundleName: "sap.com.abc.xyz"}
         * @param {object} oResourceModel the resource model
         * @public
         */
        enhanceResourceModel: function(oData, oResourceModel) {
            if (oData && (oData.bundleUrl || oData.bundleName)) {
                let sPropertyFile;
                if (oData.bundleUrl) {
                    sPropertyFile = this._translateBundleName(oData.bundleUrl, "/");
                    oResourceModel.enhance({
                        bundleUrl: sPropertyFile
                    });
                } else if (oData.bundleName) {
                    sPropertyFile = this._translateBundleName(oData.bundleName, ".");
                    oResourceModel.enhance({
                        bundleName: sPropertyFile
                    });
                }
            }
        },

        /*
         * returns the bundle name for the Process Industry bundle
         *
         * @param {string} sFile Path + Name to the bundle
         * @param {string} sSeperator Separator character for the bundle Url
         * @returns path and file name with the appropriate separator character
         * @private
         */
        _translateBundleName: function(sFile, sSeparator) {
            let index = sFile.lastIndexOf(sSeparator);
            let sPath = sFile.substring(0, index);
            let sPropertyFile = sFile.substring(index + 1);
            return sPath + sSeparator + PROCESS_INDUSTRY_PREFIX + sPropertyFile;
        },

        /*
         * returns whether or not the input is a ResourceModel
         * @private
         */
        _isResourceModel: function(oResourceModel) {
            if (oResourceModel instanceof sap.ui.model.resource.ResourceModel) {
                return true;
            }
            return false;
        }

    };
});