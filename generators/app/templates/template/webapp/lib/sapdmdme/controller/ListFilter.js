sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/controller/FilterFactory",
    "sap/dm/dme/controller/FilterBarExecutor"
], function(BaseObject, FilterFactory, FilterBarExecutor) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.controller.ListFilter", {

        /**
         * Initialize a list filter.
         * Settings are:
         * * oDefaultFilter - default filter
         * * oListBinding - a list or table binding; used to apply filters;
         * * oFilterBar - a filter bar control; used to get/set filtering values;
         * * aLiveSearchProperties - an array of a model property names that will be filtered with a live search field value;
         * * sLiveSearchFieldId - live search field ID if it's not specified in a filter bar; defaults to "searchField"
         * * sListBindingPath - an entity set name which is bind to a list; used to get a model's metadata;
         * * aVariantFilterInfo - an array of filter configuration objects; used to create filters from filter bar values;
         * * * sFilterItemName - a filter bar's filter group item name; used to get filter value;
         * * * sSearchProperty - a property name that will be filtered; if omitted then sFilterItemName is used as property name;
         * * * oFilterOperator - a filter operator; FilterOperator.Contains is used by default;
         * * aBasicFilterInfo - an array of filter configuration objects; used to create filters from values of additional controls on a filter bar;
         * * * oFilterControl - an additional control on a filter bar; used to get filter value;
         * * * sSearchProperty - a property name that will be filtered;
         * * * oFilterOperator - a filter operator; FilterOperator.Contains is used by default;
         */
        constructor: function(mSettings) {
            this._oDefaultFilter = mSettings.oDefaultFilter;
            this._oListBinding = mSettings.oListBinding;
            this._oFilterBar = mSettings.oFilterBar;
            this._aLiveSearchProperties = mSettings.aLiveSearchProperties || [];
            this._sLiveSearchFieldId = mSettings.sLiveSearchFieldId || "searchField";
            this._sListBindingPath = mSettings.sListBindingPath;
            this._aVariantFilterInfo = mSettings.aVariantFilterInfo || [];
            this._aBasicFilterInfo = mSettings.aBasicFilterInfo || [];
        },

        destroy: function() {
            this._oDefaultFilter = null;
            this._oListBinding = null;
            this._oFilterBar = null;
            this._aLiveSearchProperties = null;
            this._sLiveSearchFieldId = null;
            this._sListBindingPath = null;
            this._aVariantFilterInfo = null;
            this._aBasicFilterInfo = null;
            BaseObject.prototype.destroy.apply(this, arguments);
        },

        /**
         * Clears all filter values and executes filtering.
         */
        clearFilters: function() {
            let aFilterItems = this._oFilterBar.getAllFilterItems(true);
            aFilterItems.forEach(function(oFilterItem) {
                let oControl = this._oFilterBar.determineControlByFilterItem(oFilterItem);
                this._clearControl(oControl);
            }.bind(this));

            this._aBasicFilterInfo.forEach(function(oBasicFilterItem) {
                this._clearControl(oBasicFilterItem.oFilterControl);
            }.bind(this));

            if (this._oListBinding) {
                // this._oListBinding must be defined or this causes OPA tests to fail
                this.filterByFilterBar();
            }
        },

        /***
         * Handler for the basic search field live search event.
         */
        onFilterLive: function(oEvent) {
            let sSearchValue = oEvent.getParameter("newValue");
            this.filterBySearchValue(sSearchValue);
        },

        /***
         * Searches for a match in properties specified in settings using OR.
         */
        filterBySearchValue: function(sSearchValue) {
            let aFilter = this._createBasicSearchFilter(sSearchValue);

            // if default filter is not a sap.ui.model.Filter then ignore it
            if (this._oDefaultFilter && typeof this._oDefaultFilter === "object") {
                aFilter.push(this._oDefaultFilter);
            }

            this._oListBinding.filter(aFilter);
        },

        filterBySearchAndBar: function(vExternalFilter) {
            let oFilterBarExecutor = this._createFilterBarExecutor(this._sListBindingPath);
            if (this._isSearchControl()) {
                const sSearchValue = this._getSearchValue();
                if (sSearchValue) {
                    oFilterBarExecutor.addExternalFilter(this._createBasicSearchFilter(sSearchValue)[0]);
                }
            }

            this._fillAndApplyFilterBarExecutor(oFilterBarExecutor, vExternalFilter);
        },

        /**
         *
         * @param {FilterBarExecutor} oFilterBarExecutor instance of FilterBarExecutor that is used to apply all base filters.
         * @param {object | [objects]} vExternalFilter single instance or an array of sap.ui.model.Filter applied to a list additionally
         * @private
         */
        _fillAndApplyFilterBarExecutor: function(oFilterBarExecutor, vExternalFilter) {
            this._aVariantFilterInfo.forEach(function(oItemInfo) {
                oFilterBarExecutor.addVariantFilter(
                    oItemInfo.sFilterItemName,
                    oItemInfo.sSearchProperty || oItemInfo.sFilterItemName,
                    oItemInfo.oFilterOperator,
                    oItemInfo.oCondition
                );
            });

            this._aBasicFilterInfo.forEach(function(oItemInfo) {
                oFilterBarExecutor.addFilter(
                    oItemInfo.oFilterControl,
                    oItemInfo.sSearchProperty,
                    oItemInfo.oFilterOperator
                );
            });

            if (Array.isArray(vExternalFilter)) {
                vExternalFilter.forEach(function(oFilter) {
                    oFilterBarExecutor.addExternalFilter(oFilter);
                });
            } else if (vExternalFilter) {
                oFilterBarExecutor.addExternalFilter(vExternalFilter);
            }

            if (this._oDefaultFilter) {
                oFilterBarExecutor.addExternalFilter(this._oDefaultFilter);
            }

            oFilterBarExecutor.applyFilters(this._oListBinding);
            oFilterBarExecutor.destroy();
        },

        /**
         * Handle list filtering by filter bar fields' values. Clears basic search before filtering.
         * @param {object | [objects]} vExternalFilter single instance or an array of sap.ui.model.Filter applied to a list additionally
         */
        filterByFilterBar: function(vExternalFilter) {
            if (this._isSearchControl()) {
                this.setSearchValue(""); // clear the filter bar's search field if it's available
            }

            let oFilterBarExecutor = this._createFilterBarExecutor(this._sListBindingPath);

            this._fillAndApplyFilterBarExecutor(oFilterBarExecutor, vExternalFilter);
        },

        /**
         * Sets a value to a search control. No filtering triggered.
         */
        setSearchValue: function(sValue) {
            this._getSearchControl().setValue(sValue);
        },

        /**
         * Sets a value to a control that will clear a corresponding filter.
         */
        _clearControl: function(oControl) {
            let sControlType = oControl ? oControl.getMetadata().getName() : null;

            switch (sControlType) {
                case "sap.m.Input":
                case "sap.m.ComboBox":
                case "sap.m.DateRangeSelection":
                    oControl.setValue("");
                    break;
                case "sap.m.Switch":
                    oControl.setState(false);
                    break;
                case "sap.m.MultiComboBox":
                    oControl.removeAllSelectedItems();
                    break;
                case "sap.m.Select":
                    oControl.setSelectedKey("ALL");
                    break;
            }
        },

        /**
         * Creates the sap.ui.model.Filter for properties specified in the aLiveSearchProperties setting with the specified value.
         */
        _createBasicSearchFilter: function(sSearchValue) {
            if (!sSearchValue) {
                return [];
            }

            let aFilters = this._aLiveSearchProperties.map(function(sFilterName) {
                return new sap.ui.model.Filter(sFilterName, sap.ui.model.FilterOperator.Contains, sSearchValue);
            });

            return [new sap.ui.model.Filter(aFilters, false)];
        },

        /**
         * Get search control specified in filter bar's association.
         */
        _getSearchControl: function() {
            if (this._oFilterBar && this._oFilterBar.getBasicSearch()) {
                return sap.ui.getCore().byId(this._oFilterBar.getBasicSearch());
            } else if (this._sLiveSearchFieldId) {
                return sap.ui.getCore().byId(this._sLiveSearchFieldId);
            } else {
                throw Error("The search control is not specified.");
            }
        },

        /**
         * Checks whether live search control initialized
         */
        _isSearchControl: function() {
            return this._aLiveSearchProperties.length > 0;
        },

        _getSearchValue: function() {
            const oControl = this._getSearchControl();
            return oControl && oControl.getValue();
        },

        _createFilterBarExecutor: function(sBinding) {
            let oFilterFactory = this._getFilterFactory(this._oListBinding.getModel().getMetaModel(), sBinding);
            return new FilterBarExecutor(this._oFilterBar, oFilterFactory);
        },

        _getFilterFactory: function(oMetaModel, sBinding) {
            return new FilterFactory(oMetaModel, sBinding);
        }

    });
}, true);