sap.ui.define([
    "sap/dm/dme/podfoundation/browse/StatusFilterFactory"
], function(FilterFactory) {
    "use strict";

    return FilterFactory.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowseFilterFactory", {
        /**
         * @override
         */
        getStatusesToIgnore: function() {
            return ["DONE", "CLOSED", "DISCARDED"];
        }
    });
}, true);