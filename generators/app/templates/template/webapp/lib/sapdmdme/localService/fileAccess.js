sap.ui.define([], function() {
    "use strict";

    return {
        parseAsModulePath: function(sPath) {
            let iSuffixIndex = sPath.lastIndexOf(".");
            let sModuleName = sPath.substring(0, iSuffixIndex);
            let sSuffix = sPath.substring(iSuffixIndex);
            return [sModuleName, sSuffix];
        },

        getJson: function(sPath) {
            let sFullPath = jQuery.sap.getModulePath.apply(this, this.parseAsModulePath(sPath));
            return jQuery.sap.syncGetJSON(sFullPath).data;
        },

        getText: function(sPath) {
            let sFullPath = jQuery.sap.getModulePath.apply(this, this.parseAsModulePath(sPath));
            return jQuery.sap.syncGetText(sFullPath).data;
        }
    };
});