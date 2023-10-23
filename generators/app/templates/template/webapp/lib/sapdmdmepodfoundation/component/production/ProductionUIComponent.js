sap.ui.define([
    "sap/dm/dme/logging/Logging",
    "sap/ui/core/UIComponent",
    "sap/dm/dme/model/ResourceModelEnhancer",
    "sap/dm/dme/util/PlantSettings"
], function(Logging, UIComponent, ResourceModelEnhancer, PlantSettings) {
    "use strict";

    var logger = Logging.getLogger("sap.dm.dme.podfoundation.component.production.ProductionUIComponent");

    /**
     * Constructor for a new UI Component
     *
     * @param {string} [sId] Id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * <code>sap.dm.dme.podfoundation.component.production.ProductionUIComponent</code> control provides a set of functions
     * for use by View type POD plugins.
     *
     * @extends sap.ui.core.UIComponent
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.component.production.ProductionUIComponent
     */
    var ProductionUIComponent = UIComponent.extend("sap.dm.dme.podfoundation.component.production.ProductionUIComponent", {
        metadata: {
            metadata: {
                manifest: "json"
            },
            properties: {
                /**
                 * Defines the Main POD Controller
                 */
                podController: {
                    type: "object",
                    group: "Misc"
                },
                /**
                 * Defines the Tab item plugin is assigned to
                 */
                tabItem: {
                    type: "object",
                    group: "Misc"
                },
                /**
                 * Defines the name of the page the plugin is assigned to
                 */
                pageName: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the execution plugin class name
                 */
                pluginId: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines type of plugin (i.e.; "view")
                 */
                displayType: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines if the plugin is a default one
                 */
                defaultPlugin: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                /**
                 * Defines the plugins configuration settings
                 */
                configuration: {
                    type: "object",
                    group: "Misc"
                }
            }
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);

            this._processODataHttpHeaders();

            // applies any Process Industry type bundles that may be defined (i.e. pi_i18n.properties or others with a pi_ prefix)
            ResourceModelEnhancer.enhanceModelsfromManifest(this);
        },

        destroy: function() {
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * Add standard HTTP headers to all OData models declared in the manifest.  This must be done at
         * the Component level to ensure that the model is available before view bindings are applied.
         * Headers need only be added once per Component (app) initialization.
         * @private
         */
        _processODataHttpHeaders: function() {

            var oAppModels = this.getManifestEntry("/sap.ui5/models");
            if (oAppModels) {
                var aModelNames = Object.getOwnPropertyNames(oAppModels);

                for (var i = 0; i < aModelNames.length; i++) {
                    var sModelName = aModelNames[i];

                    // getModel() does not accept an empty string so we need to get the default model with getModel()
                    var oModel = sModelName.length > 0 ? this.getModel(sModelName) : this.getModel();
                    if (oModel instanceof sap.ui.model.odata.v4.ODataModel) {

                        var sPlant = PlantSettings.getCurrentPlant();
                        oModel.changeHttpHeaders({
                            "x-dme-plant": sPlant
                        });
                        logger.info("Plant HTTP header set for model '" + sModelName + "'");
                    } else {
                        logger.info("Plant HTTP header not set for model '" + sModelName + "'");
                    }
                }
            }
        }
    });

    /*
     * Used internally to set the POD Controller.
     *
     * @param {sap/ui/core/mvc/Controller} oPodController main POD controller object
     * @private
     */
    ProductionUIComponent.prototype.setPodController = function(oPodController) {
        if (oPodController) {
            this.setProperty("podController", oPodController);
        }
        return this;
    };

    /**
     * returns the POD Selection Model
     *
     * @returns sap.dm.dme.podfoundation.model.PodSelectionModel object
     * @public
     */
    ProductionUIComponent.prototype.getPodSelectionModel = function() {
        var oParentView = this._getPodControllerViewParent();
        if (oParentView && oParentView.getModel) {
            var oModel = oParentView.getModel("podSelectionModel");
            return oModel.getData();
        }
        return null;
    };

    /*
     * function defined for unit tests returns Main POD views parent
     * @private
     */
    ProductionUIComponent.prototype._getPodControllerViewParent = function() {
        var oView = this._getPodControllerView();
        if (oView && oView.getParent) {
            return oView.getParent();
        }
        return undefined;
    };

    /*
     * function defined for unit tests returns Main POD view
     * @private
     */
    ProductionUIComponent.prototype._getPodControllerView = function() {
        var oPodController = this.getPodController();
        if (oPodController && oPodController.getView) {
            return oPodController.getView();
        }
        return undefined;
    };

    /**
     * Retrieve the POD Controllers owner component
     * @returns POD's UIComponent
     * @public
     */
    ProductionUIComponent.prototype.getPodOwnerComponent = function() {
        var oPodController = this.getPodController();
        if (oPodController) {
            return oPodController.getOwnerComponent();
        }
        return null;
    };

    /**
     * Retrieve a value from a global POD model
     * @param {string} sPropertyName property name for retrieving a value
     * @returns Property object
     * @public
     */
    ProductionUIComponent.prototype.getGlobalProperty = function(sPropertyName) {
        var oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalProperty(sPropertyName);
        }
        return null;
    };

    /**
     * Store a value in a global POD model
     * @param {string} sPropertyName property name for storing a value
     * @param {object} oValue stored value
     * @public
     */
    ProductionUIComponent.prototype.setGlobalProperty = function(sPropertyName, oValue) {
        var oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            oOwnerComponent.setGlobalProperty(sPropertyName, oValue);
        }
    };

    /**
     * Retrieve and remove a value from a global POD model
     * @param {string} sPropertyName property name for retrieving a value
     * @public
     */
    ProductionUIComponent.prototype.removeGlobalProperty = function(sPropertyName) {
        var oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.removeGlobalProperty(sPropertyName);
        }

        return null;
    };

    /**
     * Returns the POD application JSONModel
     *
     * @returns The global JSONModel
     * @public
     */
    ProductionUIComponent.prototype.getGlobalModel = function() {
        var oOwnerComponent = this.getPodOwnerComponent();
        if (oOwnerComponent) {
            return oOwnerComponent.getGlobalModel();
        }
        return null;
    };

    /**
     * Returns the user preferences configuration information
     *
     * @returns The user preferences configuration information
     * @public
     */
    ProductionUIComponent.prototype.getUserPreferencesConfig = function() {
        return this._getDmeAppManifestConfig().userPreferences;
    };

    /*
     * Returns the applications manifest configuration
     *
     * @returns The applications manifest configuration
     * @private
     */
    ProductionUIComponent.prototype._getDmeAppManifestConfig = function() {
        return this.getManifestEntry("dme.app") || {};
    };

    return ProductionUIComponent;
});