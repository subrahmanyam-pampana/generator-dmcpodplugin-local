sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/EnumFormatter",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BrowseBase, JSONModel, EnumFormatter, StatusFormatter, Filter, FilterOperator) {
    "use strict";

    let bIsPrimaryNcCodeBrowse;
    let NcCodeBrowseType = BrowseBase.extend("sap.dm.dme.browse.NcCodeBrowse", {

        enumFormatter: EnumFormatter,
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        constructor: function(sId, mSettings) {
            mSettings.oFilterSettings.oDefaultFilter = this._constructDefaultBrowseFilter();

            BrowseBase.prototype.constructor.apply(this, arguments);

            this.getListBinding().filter(this._constructDefaultBrowseFilter());
            if (jQuery.trim(mSettings.sDefaultSearchValue)) {
                this.performDefaultFiltering(mSettings.sDefaultSearchValue);
            }
        },

        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getNcCodeStatusList()), "ncCodeStatusItems");
            this.getDialog().setModel(new JSONModel(this.enumFormatter.getNcCodeCategoryListForFilter()), "ncCodeCategoryItems");
            this.getDialog().setModel(new JSONModel(this.enumFormatter.getNcCodeSeverityListForFilter()), "ncCodeSeverityItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("ncCode")
            };
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            let sNcGroup = this.byId("ncGroupMembersFilter").getValue();
            return this._createFilterByNcGroup(sNcGroup);
        },

        _createFilterByNcGroup: function(sName) {
            if (sName) {
                return new Filter({
                    path: "ncGroupMembers",
                    operator: FilterOperator.Any,
                    variable: "item",
                    condition: new Filter({
                        path: "item/ncGroup/ncGroup",
                        operator: FilterOperator.Contains,
                        value1: sName
                    })
                });
            }
            return null;
        },

        _constructDefaultBrowseFilter: function() {
            return bIsPrimaryNcCodeBrowse ? this._createFilterByPrimaryNcCode() : null;
        },

        _createFilterByPrimaryNcCode: function() {
            return new sap.ui.model.Filter("ncCodeDef/canBePrimaryCode", sap.ui.model.FilterOperator.EQ, true);
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oProductModel - should be passed if default model is not product model.
         * @param {Boolean} isPrimaryNcCodesBrowse - if value help dialog should be displayed for primary Nc Codes only
         * @return {Object} new instance of the NC Code Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductModel, isPrimaryNcCodesBrowse) {
            bIsPrimaryNcCodeBrowse = isPrimaryNcCodesBrowse;
            return new NcCodeBrowseType("ncCodeBrowse", {
                oModel: oProductModel,
                sFragmentName: "sap.dm.dme.browse.view.NcCodeBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["ncCode", "description"],
                    sListBindingPath: "/NonConformanceCodes",
                    aVariantFilterInfo: [{
                            sFilterItemName: "ncCode"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "ncCategory"
                        },
                        {
                            sFilterItemName: "ncSeverity",
                            sSearchProperty: "ncCodeDef/ncSeverity"
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        }
                    ]
                }
            });
        }
    };
});