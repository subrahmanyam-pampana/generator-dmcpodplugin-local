sap.ui.define([
    "sap/dm/dme/logging/Logging",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Component",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/controller/ListSelector",
    "sap/dm/dme/util/PlantSettings"
], function(Logging, UIComponent, Component, JSONModel, ResourceModel, ListSelector, PlantSettings) {
    "use strict";

    let GLOBAL_MODEL_NAME = "global";
    let logger = Logging.getLogger("sap.dm.dme.component.base.BaseComponent");

    return UIComponent.extend("sap.dm.dme.component.base.BaseComponent", {
        metadata: {
            manifest: "json",
            includes: ["style/common.css"],
            config: {
                fullWidth: true
            }
        },

        init: function() {
            // Call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // Work around: Programmatically turn on form field validation. Using
            // the handleValidation manifest entry does not seem to get inherited by
            // sub components.
            sap.ui.getCore().getMessageManager().registerObject(this, true);

            // Must use sap.f.routing.Router when routing with FlexibleColumnLayout
            // Not all subclasses have a router, so don't initialize if it's not there.
            this.getRouter() && this.getRouter().initialize();

            // Global list selector for the master object list
            this.oListSelector = new ListSelector();

            // init model for storing global cross controller data
            this.setModel(new JSONModel(), GLOBAL_MODEL_NAME);

            // get the plant, time zone and industry type and set PlantSettings
            return this._loadPlantSettings()
                .then(function() {
                    // Add required headers to the application's OData models, like the x-dme-plant header
                    this._processODataHttpHeaders();
                }.bind(this))
                .catch(function(sErrorMessage) {
                    logger.error(sErrorMessage);
                });
        },

        /**
         * Get the appropriate CSS class according to the device the application is running in.
         * All touch enabled devices will get 'cozy' content density styling while desktop will
         * get compact styling.
         */
        getContentDensityClass: function() {
            // Don't set density mode if we are launched from the launchpad
            if (!this._isRunFromLaunchpad() && !this._sContentDensityClass) {
                if (!sap.ui.Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        /**
         * Retrieve a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        getGlobalProperty: function(sPropertyName) {
            return this.getModel(GLOBAL_MODEL_NAME).getProperty("/" + sPropertyName);
        },

        /**
         * Store a value in a global model
         * @param sPropertyName property name for storing a value
         * @param oValue stored value
         */
        setGlobalProperty: function(sPropertyName, oValue) {
            this.getModel(GLOBAL_MODEL_NAME).setProperty("/" + sPropertyName, oValue);
        },

        /**
         * Retrieve and remove a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        removeGlobalProperty: function(sPropertyName) {
            let oValue = this.getGlobalProperty(sPropertyName);
            this.setGlobalProperty(sPropertyName);
            return oValue;
        },

        /**
         * @return The global application JSONModel
         */
        getGlobalModel: function() {
            return this.getModel(GLOBAL_MODEL_NAME);
        },

        /**
         * Create/set the shared i18n model for the given bundle
         *
         * @param sBundleName The name of the bundle. Must match the file name of the properties file without the file extension.
         * Passing "material" attempts to load the properties file material.properties and creates a model named i18n-material.
         */
        createi18nModel: function(sBundleName) {
            let oModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n." + sBundleName
            });
            this.setModel(oModel, "i18n-" + sBundleName);
        },

        /**
         * @return The manifest of the base component to be used in maintenance apps to access different manifest properties such as dataSources.
         */
        getBaseManifestEntry: function(sEntry) {
            return sap.dm.dme.component.base.BaseComponent.prototype.getManifestEntry(sEntry);
        },

        getDataSourceUriByName: function(sDataSourceName) {
            let oManifest = this.getManifestObject();
            if (oManifest) {
                let sUri = oManifest.getEntry("/sap.app/dataSources/" + sDataSourceName + "/uri");
                if (jQuery.trim(sUri)) {
                    return oManifest.resolveUri(sUri);
                }
            }
            return null;
        },

        /**
         * The component is destroyed by UI5 automatically.
         * Destroy objects added to Component in init
         */
        destroy: function() {
            // Destroy objects added to the Component
            this.oListSelector.destroy();

            // Call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        // TODO This is a temporary way of checking.  Should come up with a more robust way
        // instead of relying on the path
        _isRunFromLaunchpad: function() {
            if (window.location && window.location.pathname) {
                let sPath = window.location.pathname;
                return sPath.indexOf("launchpad") !== -1 || sPath.indexOf("Launchpad") !== -1;
            }
            return false;
        },

        _changeHttpHeadersForModels: function(aModelNames, sPlant) {
            for (let i = 0; i < aModelNames.length; i++) {
                let sModelName = aModelNames[i];
                // getModel() does not accept an empty string so we need to get the default model with getModel()
                let oModel = sModelName.length > 0 ? this.getModel(sModelName) : this.getModel();
                if (oModel instanceof sap.ui.model.odata.v4.ODataModel) {
                    oModel.changeHttpHeaders({
                        "x-dme-plant": sPlant
                    });
                    logger.info("Plant HTTP header set for model '" + sModelName + "'");
                } else {
                    logger.info("Plant HTTP header not set for model '" + sModelName + "'");
                }
            }
        },

        /**
         * Add standard HTTP headers to all OData models declared in the manifest.  This must be done at
         * the Component level to ensure that the model is available before view bindings are applied.
         * Headers need only be added once per Component (app) initialization.
         * @private
         */
        _processODataHttpHeaders: function() {
            let sPlant = PlantSettings.getCurrentPlant();
            if (!jQuery.trim(sPlant)) {
                return;
            }
            let oAppModels = this.getManifestEntry("/sap.ui5/models");
            if (oAppModels) {
                let aModelNames = Object.getOwnPropertyNames(oAppModels);
                this._changeHttpHeadersForModels(aModelNames, sPlant);
            }
        },

        /*
         * This promise will retrieve the current user plant.
         * @private
         */
        _loadPlantSettings: function() {
            return new Promise(function(resolve, reject) {
                if (PlantSettings.getCurrentPlant() && PlantSettings.getIndustryType() &&
                    !PlantSettings.getPlantChanged()) {
                    resolve(); // plant already resolved
                    return;
                }

                let sUrl = this.getDataSourceUriByName("plant-RestSource") ||
                    jQuery.sap.getModulePath("sap.dm.dme", "/plant-ms");
                sUrl = this._forceEndingForwardSlash(sUrl);
                sUrl += "users/plants/current/data";

                this._ajaxGet(sUrl).done(function(oPlantData) {
                    PlantSettings.setCurrentPlant(oPlantData.plant);
                    PlantSettings.setTimeZone(oPlantData.timeZone);
                    PlantSettings.setIndustryType(oPlantData.industryType);
                    PlantSettings.setFsmScenarioZero(oPlantData.fsmScenarioZero);
                    PlantSettings.setPlantChanged(false);
                    resolve();
                }).fail(function() {
                    reject("No current plant set for user or it could not be fetched from the API");
                });
            }.bind(this));
        },

        /*
         * Make sure path ends with "/"
         * @private
         */
        _forceEndingForwardSlash: function(sUri) {
            return (sUri.lastIndexOf("/") === (sUri.length - 1)) ? sUri : sUri + "/";
        },

        /*
         * This deferred object will make ajax GET request
         * @private
         */
        _ajaxGet: function(sUrl) {
            return jQuery.ajax({
                url: sUrl,
                async: false,
                method: "GET"
            });
        }
    });
});