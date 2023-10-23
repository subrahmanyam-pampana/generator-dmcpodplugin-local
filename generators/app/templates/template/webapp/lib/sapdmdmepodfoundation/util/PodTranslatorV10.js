sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "10.0", "11.0", this.getNamespaces());
        },

        getNamespaces: function() {
            var aNamespaces = [];
            aNamespaces[aNamespaces.length] = {
                from: "sap.dm.dme.plugins.oeePod",
                to: "sap.dm.dme.oeeplugins.oeePod"
            };
            return aNamespaces;
        }
    };
});