/**
 * Provides class sap.dm.dme.controller.FilterFactory.
 * This class is responsible for creating control specific filters.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/dm/dme/formatter/DateTimeUtils"
], function(BaseObject, Filter, FilterOperator, DateFormat, DateTimeUtils) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.controller.FilterFactory", {

        /**
         * @param oListMetaModel The meta model for the list being filtered.  Used to create filter
         * parameters for custom enumeration types.
         * @param sBindingPath The root binding path for the list, such as "/Materials". Used to create filter
         * parameters for custom enumeration types.
         */
        constructor: function(oListMetaModel, sBindingPath) {
            BaseObject.call(this);
            this._oListMetaModel = oListMetaModel;
            this._sBindingPath = sBindingPath;
        },

        /**
         * Factory function to create a filter.
         * @param {sap.ui.core.Control} oControl The control for which the filter is being created
         * @param {string} sPropertyPath The binding path to the filtered property
         * @param {sap.ui.model.FilterOperator} oOperator Optional filter operator. A default operator
         * will be used depending on the control type.
         *
         * @return {sap.ui.model.Filter} or {string} if the control is a sap.m.Select
         */
        createFilter: function(oControl, sPropertyPath, oOperator) {
            let sControlType = oControl.getMetadata().getName();

            switch (sControlType) {
                case "sap.m.Input":
                    return this._getInputFilter(oControl, sPropertyPath, oOperator);
                case "sap.m.Switch":
                    return this._getSwitchFilter(oControl, sPropertyPath, oOperator);
                case "sap.m.Select":
                    return this._getSelectFilter(oControl, sPropertyPath, oOperator);
                case "sap.m.DateRangeSelection":
                    return this._getDateRangeSelectionFilter(oControl, sPropertyPath);
                case "sap.m.DateTimePicker":
                    return this._getDateTimePickerFilter(oControl, sPropertyPath, oOperator);
                case "sap.m.ComboBox":
                    return this._getComboBoxFilter(oControl, sPropertyPath, oOperator);
                case "sap.m.MultiComboBox":
                    return this._getMultiComboBoxFilter(oControl, sPropertyPath, oOperator);
                default:
                    throw Error("The control type " + sControlType + " is not supported");
            }
        },

        _getInputFilter: function(oControl, sPropertyPath, oOperator) {
            if (!oControl.getValue()) {
                return null;
            }
            return new Filter({
                path: sPropertyPath,
                operator: oOperator || FilterOperator.Contains,
                value1: oControl.getValue()
            });
        },

        _getSwitchFilter: function(oControl, sPropertyPath, oOperator) {
            if (oOperator === FilterOperator.Any && !oControl.getState()) {
                return null; // special feature; if filter operator specified as Any then false Switch state treated as no filter applied
            }
            return new Filter({
                path: sPropertyPath,
                operator: FilterOperator.EQ,
                value1: oControl.getState()
            });
        },

        _getSelectFilter: function(oControl, sPropertyPath, oOperator) {
            let sSelectedKey = oControl.getSelectedKey();
            if (sSelectedKey !== "ALL") {
                // The following code allows the Select control to be used for:
                // ALL, TRUE or FALSE as keys but this check only is performed if the property path is currentVersion.
                if (sPropertyPath === "currentVersion" && (sSelectedKey === "TRUE" || sSelectedKey === "FALSE")) {
                    sSelectedKey = (sSelectedKey === "TRUE");
                    return new Filter({
                        path: sPropertyPath,
                        operator: FilterOperator.EQ,
                        value1: sSelectedKey
                    });
                }
                return this._createEnumFilterPredicate(sSelectedKey, sPropertyPath);
            }
            return null;
        },

        _getDateRangeSelectionFilter: function(oControl, sPropertyPath) {
            if (oControl.getDateValue() && oControl.getSecondDateValue()) {
                let sFromDate = DateTimeUtils.dmcDateToUTCFormat(DateTimeUtils.dmcDateTimeStartOf(oControl.getDateValue()));
                let sToDate = DateTimeUtils.dmcDateToUTCFormat(DateTimeUtils.dmcDateTimeEndOf(oControl.getSecondDateValue()));
                return new Filter({
                    path: sPropertyPath,
                    operator: FilterOperator.BT,
                    value1: sFromDate,
                    value2: sToDate
                });
            }
            return null;
        },

        _getDateTimePickerFilter: function(oControl, sPropertyPath, oOperator) {
            if (oControl.getDateValue()) {
                let oDateFormat = oOperator && oOperator === FilterOperator.LE ?
                    DateFormat.getDateInstance({
                        pattern: "yyyy-MM-ddTHH:mm:ss.999",
                        UTC: true
                    }) :
                    DateFormat.getDateInstance({
                        pattern: "yyyy-MM-ddTHH:mm:ss.000",
                        UTC: true
                    });
                let sDate = oDateFormat.format(new Date(oControl.getDateValue())) + "Z";
                return new Filter({
                    path: sPropertyPath,
                    operator: oOperator || FilterOperator.GE,
                    value1: sDate
                });
            }
            return null;
        },

        _getComboBoxFilter: function(oControl, sPropertyPath, oOperator) {
            if (!oControl.getValue()) {
                return null;
            }
            return new Filter({
                path: sPropertyPath,
                operator: oOperator || FilterOperator.StartsWith,
                value1: oControl.getValue()
            });
        },

        _getMultiComboBoxFilter: function(oControl, sPropertyPath, oOperator) {
            let aItems = oControl.getSelectedItems();
            // for multiple selected items we have to create 'or' filter with statuses
            if (aItems.length > 1) {
                let aFilters = aItems.map(function(oItem) {
                    return this._createEnumFilterPredicate(oItem.getKey(), sPropertyPath);
                }.bind(this));
                return "(" + aFilters.join(" or ") + ")";
            } else if (aItems.length === 1) {
                let sKey = aItems[0].getKey();
                return this._createEnumFilterPredicate(sKey, sPropertyPath);
            } else {
                return null;
            }
        },

        _createEnumFilterPredicate: function(sSelectedKey, sPropertyPath) {
            return sPropertyPath + " eq " + this._getEnumType(this._sBindingPath + "/" + sPropertyPath) + "'" + sSelectedKey + "'";
        },

        _getEnumType: function(sPropertyPath) {
            // The following 3 lines of code were added to support JSON Model filtering that does not originate from an oData model
            if (!this._oListMetaModel) {
                return "";
            }

            return this._oListMetaModel.getMetaContext(sPropertyPath).getObject().$Type;
        }
    });
}, true);