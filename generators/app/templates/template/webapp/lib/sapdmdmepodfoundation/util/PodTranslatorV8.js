sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "8.0", "9.0", this.getV9Namespaces());
        },

        getV9Namespaces: function() {
            var aV9Namespaces = [];
            aV9Namespaces[aV9Namespaces.length] = {
                from: "sap.dm.dme.plugins.workInstructionListPlugin",
                to: "sap.dm.dme.wiplugins.workInstructionListPlugin"
            };
            aV9Namespaces[aV9Namespaces.length] = {
                from: "sap.dm.dme.plugins.workInstructionViewPlugin",
                to: "sap.dm.dme.wiplugins.workInstructionViewPlugin"
            };
            return aV9Namespaces;
        }
    };
});