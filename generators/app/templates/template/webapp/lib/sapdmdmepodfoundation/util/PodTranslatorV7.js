sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "7.0", "8.0", this.getV8Namespaces());
        },

        getV8Namespaces: function() {
            var aV8Namespaces = [];
            aV8Namespaces[aV8Namespaces.length] = {
                from: "sap.dm.dme.plugins.assemblyPointPlugin",
                to: "sap.dm.dme.assyplugins.assemblyPointPlugin"
            };
            aV8Namespaces[aV8Namespaces.length] = {
                from: "sap.dm.dme.plugins.componentListPlugin",
                to: "sap.dm.dme.assyplugins.componentListPlugin"
            };
            aV8Namespaces[aV8Namespaces.length] = {
                from: "sap.dm.dme.plugins.materialConsumptionPlugin",
                to: "sap.dm.dme.assyplugins.materialConsumptionPlugin"
            };
            return aV8Namespaces;
        }
    };
});