sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "6.0", "7.0", this.getV7Namespaces());
        },

        getV7Namespaces: function() {
            var aV7Namespaces = [];
            aV7Namespaces[aV7Namespaces.length] = {
                from: "sap.dm.dme.plugins.logNcPlugin",
                to: "sap.dm.dme.ncplugins.logNcPlugin"
            };
            aV7Namespaces[aV7Namespaces.length] = {
                from: "sap.dm.dme.plugins.ncSelectionPlugin",
                to: "sap.dm.dme.ncplugins.ncSelectionPlugin"
            };
            aV7Namespaces[aV7Namespaces.length] = {
                from: "sap.dm.dme.plugins.ncTreePlugin",
                to: "sap.dm.dme.ncplugins.ncTreePlugin"
            };
            return aV7Namespaces;
        }
    };
});