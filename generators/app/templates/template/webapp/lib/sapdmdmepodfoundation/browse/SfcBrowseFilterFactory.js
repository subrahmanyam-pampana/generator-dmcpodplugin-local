sap.ui.define([
    "sap/dm/dme/podfoundation/browse/StatusFilterFactory"
], function(FilterFactory) {
    "use strict";

    return FilterFactory.extend("sap.dm.dme.podfoundation.browse.SfcBrowseFilterFactory", {
        /**
         * @override
         */
        getStatusesToIgnore: function() {
            return ["DONE", "SCRAPPED", "INVALID", "DELETED", "DONE_HOLD", "RETURNED", "GOLDEN_UNIT"];
        }
    });
}, true);