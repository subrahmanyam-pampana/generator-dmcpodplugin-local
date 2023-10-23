sap.ui.define([
    "sap/dm/dme/controller/ListFilter",
    "sap/dm/dme/podfoundation/browse/SfcBrowseFilterFactory"
], function(ListFilter, SfcBrowseFilterFactory) {
    "use strict";
    return ListFilter.extend("sap.dm.dme.podfoundation.browse.SfcBrowseListFilter", {
        /**
         * @override
         */
        _getFilterFactory: function(oMetaModel, sBinding) {
            return new SfcBrowseFilterFactory(oMetaModel, sBinding);
        }
    });
}, true);