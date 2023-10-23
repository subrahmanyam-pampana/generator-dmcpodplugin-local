sap.ui.define([
    "sap/dm/dme/component/base/BaseComponent",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/ListSelector",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/formatter/EnumFormatter",
    "sap/dm/dme/model/ResourceModelEnhancer"
], function(BaseComponent, JSONModel, ListSelector, StatusFormatter, ObjectTypeFormatter, EnumFormatter, ResourceModelEnhancer) {
    "use strict";

    return BaseComponent.extend("sap.dm.dme.component.maintenance.MaintenanceComponent", {
        metadata: {
            manifest: "json"
        },

        init: function() {

            // Call the init function of the parent
            BaseComponent.prototype.init.apply(this, arguments);

            // init the enum formatter with a resource bundle
            EnumFormatter.init(this.getModel("i18n-enum").getResourceBundle());

            // init the status formatter with a resource bundle
            StatusFormatter.init(this.getModel("i18n-status").getResourceBundle());

            // init the status formatter with a resource bundle
            ObjectTypeFormatter.init(this.getModel("i18n-objectType").getResourceBundle());

        },

        onBeforeRendering: function() {
            // applies any Process Industry type bundles that may be defined (i.e. pi_i18n.properties or others with a pi_ prefix)
            ResourceModelEnhancer.enhanceModelsfromManifest(this);
        },

        getMasterEntitySetName: function() {
            return this._getDmeAppManifestConfig().masterEntitySetName;
        },

        getKeyFieldsConfig: function() {
            return this._getDmeAppManifestConfig().keyFields;
        },

        getCustomDataConfig: function() {
            return this._getDmeAppManifestConfig().customData;
        },

        _getDmeAppManifestConfig: function() {
            return this.getManifestEntry("dme.app") || {};
        },

        /**
         * The component is destroyed by UI5 automatically.
         * Destroy objects added to Component in init
         */
        destroy: function() {
            // Call the base component's destroy function
            BaseComponent.prototype.destroy.apply(this, arguments);
        }
    });
});