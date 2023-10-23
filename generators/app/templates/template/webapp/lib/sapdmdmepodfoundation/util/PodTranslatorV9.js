sap.ui.define([
    "sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"
], function(NamespaceChangeTranslator) {

    return {

        translate: function(oPodData) {
            return NamespaceChangeTranslator.translate(oPodData, "9.0", "10.0", this.getV10Namespaces());
        },

        getV10Namespaces: function() {
            var aV10Namespaces = [];
            aV10Namespaces[aV10Namespaces.length] = {
                from: "sap.dm.dme.plugins.goodsReceiptPlugin",
                to: "sap.dm.dme.inventoryplugins.goodsReceiptPlugin"
            };
            aV10Namespaces[aV10Namespaces.length] = {
                from: "sap.dm.dme.plugins.kpiPlugin",
                to: "sap.dm.dme.oeeplugins.kpiPlugin"
            };
            aV10Namespaces[aV10Namespaces.length] = {
                from: "sap.dm.dme.plugins.availabilityStrip",
                to: "sap.dm.dme.oeeplugins.availabilityStrip"
            };
            return aV10Namespaces;
        }
    };
});