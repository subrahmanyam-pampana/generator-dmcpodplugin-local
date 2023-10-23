sap.ui.define([
    "sap/dm/dme/controller/ListFilter",
    "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseFilterFactory"
], function(ListFilter, SfcShopOrderBrowseFilterFactory) {
    "use strict";
    return ListFilter.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowseListFilter", {
        /**
         * @override
         */
        _getFilterFactory: function(oMetaModel, sBinding) {
            return new SfcShopOrderBrowseFilterFactory(oMetaModel, sBinding);
        }
    });
}, true);