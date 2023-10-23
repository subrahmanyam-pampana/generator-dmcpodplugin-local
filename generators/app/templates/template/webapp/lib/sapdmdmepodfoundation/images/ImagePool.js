/**
 * Provides class sap.dm.dme.images.ImagePool
 * This class is responsible for getting the URI to a ME image from the image library
 */
sap.ui.define([
    "sap/ui/Device"
], function(Device) {
    "use strict";

    return {

        /**
         * Returns the URI to an image in the ME image library.
         *
         * @param sImageName name of image to get URI for (i.e.; "buyoff", "buyoff.png" or "mes-image://buyoff")
         * @param sSize Size of image to get ("small", "medium", "large" or "auto"). "auto" is default
         * @return resource path to image
         */
        getImageURI: function(sImageName, sSize) {
            if (!sImageName || sImageName === "") {
                return undefined;
            }
            var sSizeValue;
            if (sSize && sSize !== "") {
                sSizeValue = sSize.toLowerCase();
                if (sSizeValue !== "auto" && sSizeValue !== "large" && sSizeValue !== "medium" && sSizeValue !== "small") {
                    sSizeValue = "auto";
                }
            }
            if (!sSizeValue || sSizeValue === "auto") {
                if (sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop) {
                    sSizeValue = "medium";
                } else if (sap.ui.Device.system.tablet && sap.ui.Device.system.desktop) {
                    sSizeValue = "large";
                } else {
                    sSizeValue = "small";
                }
            }
            var sPath;
            if (sSizeValue === "small") {
                sPath = "sap/dm/dme/podfoundation/images/small/";
            } else if (sSizeValue === "medium") {
                sPath = "sap/dm/dme/podfoundation/images/medium/";
            } else if (sSizeValue === "large") {
                sPath = "sap/dm/dme/podfoundation/images/large/";
            }
            var sFullName = sImageName;
            if (sImageName.indexOf(".") < 0) {
                sFullName = sImageName + ".png";
            }
            var index = sFullName.indexOf("//");
            if (index > 0) {
                sFullName = sFullName.substring(index + 2);
            }
            return jQuery.sap.getResourcePath(sPath + sFullName);
        }
    };
});