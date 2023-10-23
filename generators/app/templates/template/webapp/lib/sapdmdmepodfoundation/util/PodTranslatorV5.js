sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "5.0", "6.0", this.getV6Namespaces());
        },

        getV6Namespaces: function() {
            var aV6Namespaces = [];
            aV6Namespaces[aV6Namespaces.length] = {
                from: "sap.dm.dme.plugins.dataCollectionListPlugin",
                to: "sap.dm.dme.dcplugins.dataCollectionListPlugin"
            };
            aV6Namespaces[aV6Namespaces.length] = {
                from: "sap.dm.dme.plugins.dataCollectionEntryPlugin",
                to: "sap.dm.dme.dcplugins.dataCollectionEntryPlugin"
            };
            return aV6Namespaces;
        }
    };
});