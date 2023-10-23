/**
 * Provides class sap.dm.dme.control.TableFactory.
 * This class is responsible for creating a Table based on List Information
 */
sap.ui.define(["sap/ui/base/Object",
    "./MobileTableImpl",
    "./GridTableImpl",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(BaseObject, MobileTableImpl, GridTableImpl, PodUtility) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.control.TableFactory", {

        /**
         * @param oListConfiguration object containing list configuration.
         * <pre>
         *        oListConfiguration.tableType = "mobile" (default) or "grid"
         * </pre>
         * @param aListColumnData optional Array of column data overrides (see MobileTableImpl or GridTableImpl)
         * @param oResourceBundle jQuery.sap.util.ResourceBundle to get internationalized text
         */
        constructor: function(oListConfiguration, aListColumnData, oResourceBundle) {
            BaseObject.call(this);
            var sType = oListConfiguration.tableType;
            if (PodUtility.isEmpty(sType)) {
                sType = "mobile";
            }
            if (sType.toLowerCase() === "mobile") {
                this.oTableImpl = new MobileTableImpl(oListConfiguration, aListColumnData, oResourceBundle);
            } else {
                this.oTableImpl = new GridTableImpl(oListConfiguration, aListColumnData, oResourceBundle);
            }
        },

        /**
         * Factory function to create the Table based on list configuration data.
         *
         * @param sId id for table
         * @param vBindingPath binding path in model (i.e; "/Worklist" or {path: "/Worklist", ...} )
         * @param oTableMetadata metadata for Table
         * @param oColumnListItemMetadata metadata for ColumnListItem
         * @return {sap.m.Table}
         */
        createTable: function(sId, vBindingPath, oTableMetadata, oColumnListItemMetadata) {
            return this.oTableImpl.createTable(sId, vBindingPath, oTableMetadata, oColumnListItemMetadata);
        },

        _getTableImpl: function() {
            // added for unit tests
            return this.oTableImpl;
        }
    });
}, true);