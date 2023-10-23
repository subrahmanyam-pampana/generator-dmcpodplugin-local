sap.ui.define([
    "sap/ui/Device"
], function(Device) {
    "use strict";

    return {
        cloneObject: function(oObjectToClone) {
            // creates deep clone of object
            let sObject = JSON.stringify(oObjectToClone);
            return JSON.parse(sObject);
        }
    };
});