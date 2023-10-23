sap.ui.define([
    "sap/dm/dme/controller/FilterFactory"
], function(FilterFactory) {
    "use strict";

    return FilterFactory.extend("sap.dm.dme.podfoundation.browse.StatusFilterFactory", {
        /**
         * @override
         */
        _getSelectFilter: function(oControl, sPropertyPath) {
            let sSelectedKey = oControl.getSelectedKey();
            if (sSelectedKey !== "ALL") {
                return FilterFactory.prototype._getSelectFilter.apply(this, arguments);
            } else if (sPropertyPath === "status") {
                let sBindingPath = `${this._sBindingPath}/${sPropertyPath}`;
                let sEnumPath = this._getEnumType(sBindingPath);
                let aIgnoreStatuses = this.getStatusesToIgnore();
                if (aIgnoreStatuses && aIgnoreStatuses.length > 0) {
                    let sFilterString = null;
                    for (let sStatus of aIgnoreStatuses) {
                        let sFilter = this._createStatusEnumFilterPredicate(sStatus, sEnumPath, sPropertyPath);
                        if (!sFilterString) {
                            sFilterString = sFilter;
                        } else {
                            sFilterString = `${sFilterString} and ${sFilter}`;
                        }
                    }
                    return sFilterString;
                }
            }
            return null;
        },

        _createStatusEnumFilterPredicate: function(sSelectedKey, sEnumPath, sPropertyPath) {
            return `${sPropertyPath} ne ${sEnumPath}'${sSelectedKey}'`;
        },

        getStatusesToIgnore: function() {
            // to be implemented by sub class
            return null;
        }
    });
}, true);