sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/Filter",
    "sap/dm/dme/controller/FilterFactory"
], function(BaseObject, Filter, FilterFactory) {
    "use strict";

    let FilterBarExecutor = BaseObject.extend("sap.dm.dme.controller.FilterBarExecutor", {
        constructor: function(oFilterBar, oFilterFactory) {
            BaseObject.call(this);
            this._oFilterBar = oFilterBar;
            this._aFilterItems = this._oFilterBar.getAllFilterItems(true) || [];
            this._aFilters = [];
            this._aEnumPredicates = [];
            this._oFilterFactory = oFilterFactory;
        },

        addFilter: function(oControl, sPropertyPath, oOperator) {
            return this._createFilter(oControl, sPropertyPath, oOperator);
        },

        addVariantFilter: function(sName, sPropertyPath, oOperator, oCondition) {
            let oFilter = null;
            let oFilterItem = this._oFilterBar.determineFilterItemByName(sName);

            if (this._isActiveVariant(oFilterItem)) {
                let oControl = this._oFilterBar.determineControlByFilterItem(oFilterItem);

                oFilter = this._createFilter(oControl, sPropertyPath, oOperator, oCondition);

                if (oFilter && oFilter.oCondition) {
                    oFilter.sVariable = oFilterItem.getName();
                }

            }
            return oFilter;
        },

        addExternalFilter: function(vFilter) {
            this._addFilter(vFilter);
        },

        applyFilters: function(oListBinding) {
            oListBinding.filter([]);
            this._filterEnumerations(oListBinding);
            this._filter(oListBinding);
        },

        _createFilter: function(oControl, sPropertyPath, oOperator, oCondition) {
            let oConditionFilter = null;
            let vFilter = this._oFilterFactory.createFilter(oControl, sPropertyPath, oOperator);
            if (vFilter && oCondition) {
                oConditionFilter = this._oFilterFactory.createFilter(oControl, oCondition.sSearchProperty, oCondition.oFilterOperator);
                vFilter.oCondition = oConditionFilter;
            }
            this._addFilter(vFilter);
            return vFilter;
        },

        _addFilter: function(vFilter) {
            if (typeof vFilter === "string") {
                this._aEnumPredicates.push(vFilter);
            } else if (vFilter) {
                this._aFilters.push(vFilter);
            }
        },

        _isActiveVariant: function(oFilterItem) {
            for (let i = 0; i < this._aFilterItems.length; i++) {
                if (oFilterItem === this._aFilterItems[i]) {
                    return true;
                }
            }
            return false;
        },

        _filterEnumerations: function(oListBinding) {
            // The following 4 lines of code were added to support JSON Model filtering that does not originate from an oData model
            if (!oListBinding.changeParameters) {
                oListBinding.refresh();
                return;
            }

            if (this._aEnumPredicates.length > 0) {
                oListBinding.changeParameters({
                    $filter: this._aEnumPredicates.join(" and ")
                });
            } else {
                oListBinding.changeParameters({
                    $filter: undefined
                });
            }
        },

        _filter: function(oListBinding) {
            if (this._aFilters.length > 0) {
                oListBinding.filter(new sap.ui.model.Filter(this._aFilters, true));
            } else {
                oListBinding.filter([]);
            }
        }
    });

    FilterBarExecutor.prototype.destroy = function() {
        this._oFilterBar = null;
        this._aFilters = null;
        this._aEnumPredicates = null;
        this._oFilterFactory.destroy();

        BaseObject.prototype.destroy.apply(this, arguments);
    };

    return FilterBarExecutor;
}, true);