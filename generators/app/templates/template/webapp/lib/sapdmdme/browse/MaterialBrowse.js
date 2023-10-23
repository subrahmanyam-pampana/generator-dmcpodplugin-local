sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/browse/BomBrowse",
    "sap/dm/dme/browse/RoutingBrowse"
], function(BrowseBase, JSONModel, StatusFormatter, ObjectTypeFormatter, BomBrowse, RoutingBrowse) {
    "use strict";

    let MaterialBrowseType = BrowseBase.extend("sap.dm.dme.browse.MaterialBrowse", {

        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getStatusList()), "materialStatusItems");
            this.getDialog().setModel(new JSONModel(this.objectTypeFormatter.getProcurementTypeList()), "procurementTypeItems");
            this.getDialog().setModel(new JSONModel(this.objectTypeFormatter.getMaterialTypeList()), "materialTypeItems");
            this.getDialog().setModel(new JSONModel(this.objectTypeFormatter.getMaterialTypeList()), "mrpControllerItems");
        },

        _createFilterByMaterialGroup: function(sName) {
            let oFilterByName;

            oFilterByName = new sap.ui.model.Filter({
                path: "item/materialGroup/materialGroup",
                operator: sap.ui.model.FilterOperator.StartsWith,
                value1: sName
            });

            return new sap.ui.model.Filter({
                path: "materialGroups",
                operator: sap.ui.model.FilterOperator.Any,
                variable: "item",
                condition: oFilterByName
            });
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            let sName = this.byId("materialGroupFilter").getValue();
            return sName ? this._createFilterByMaterialGroup(sName) : null;
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("material"),
                version: oBindingContext.getProperty("version"),
                incrementBatchNumber: oBindingContext.getProperty("incrementBatchNumber")
            };
        },

        onBomBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            BomBrowse.open(this.getDialog(), sValue, function(oSelectedObject) {
                this.byId("bomFilter").setValue(oSelectedObject.name);
                this.onFilterBarChange();
            }.bind(this));
        },

        onRoutingBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            RoutingBrowse.open(this.getDialog(), sValue, function(oSelectedObject) {
                this.byId("routingFilter").setValue(oSelectedObject.name);
                this.onFilterBarChange();
            }.bind(this));
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new MaterialBrowseType("materialBrowse", {
                oModel: oModel,
                sFragmentName: "sap.dm.dme.browse.view.MaterialBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["material"],
                    sListBindingPath: "/Materials",
                    aVariantFilterInfo: [{
                            sFilterItemName: "material"
                        },
                        {
                            sFilterItemName: "description",
                            sSearchProperty: "descriptions",
                            oFilterOperator: sap.ui.model.FilterOperator.Any,
                            oCondition: {
                                sSearchProperty: "description/description"
                            }
                        },
                        {
                            sFilterItemName: "bom",
                            sSearchProperty: "bom/bom"
                        },
                        {
                            sFilterItemName: "routing",
                            sSearchProperty: "routing/routing"
                        },
                        {
                            sFilterItemName: "dataToCollectAtAssembly",
                            sSearchProperty: "assemblyDataType/dataType"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "materialType"
                        },
                        {
                            sFilterItemName: "procurementType"
                        },
                        {
                            sFilterItemName: "lotSize",
                            oFilterOperator: sap.ui.model.FilterOperator.EQ
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        },
                        {
                            sFilterItemName: "currentVersion",
                            oFilterOperator: sap.ui.model.FilterOperator.Any
                        },
                        {
                            sFilterItemName: "mrpController"
                        }
                    ]
                }
            });
        }
    };
});