/**
 * Provides service class for the sap.m.TablePersoController
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/device/CrossPlatformUtilities"
], function(BaseObject, CrossPlatformUtilities) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.control.TablePersoService", {

        /**
         * @param sComponentName name of Component, table is a member of (i.e.; "sap.dm.dme.plugins.worklistPlugin")
         * @param oTable sap.m.Table to perform column ordering on
         */
        constructor: function(sComponentName, oTable) {
            BaseObject.call(this);
            var aColumns = oTable.getColumns(false);
            this._setColumns(sComponentName, aColumns);
        },

        _setColumns: function(sComponentName, aColumns) {
            if (!aColumns || aColumns.length === 0) {
                return;
            }
            var aColumnData = [];
            for (var i = 0; i < aColumns.length; i++) {
                var oHeader = aColumns[i].getHeader();
                var sId = sComponentName + "-" + aColumns[i].getId();
                aColumnData[aColumnData.length] = {
                    text: oHeader.getText(),
                    order: i,
                    visible: true,
                    id: sId
                };
            }
            var oBundle = {
                _persoSchemaVersion: "1.0",
                aColumns: aColumnData
            };
            this.setPersData(oBundle);
        },

        /**
         * Returns current column order data
         */
        getColumnOrderData: function() {
            return this._oBundle;
        },

        /**
         * Sets current column order data
         */
        setColumnOrderData: function(oColumnOrderData) {
            this._oBundle = oColumnOrderData;
        },

        /**
         * Returns a jQuery.Deferred promise to return data
         */
        getPersData: function() {
            if (!this._oBundle) {
                return undefined;
            }
            var oDeferred = new jQuery.Deferred();
            var oBundle = this._oBundle;
            oDeferred.resolve(oBundle);
            return oDeferred.promise();
        },

        /**
         * Sets the column order
         */
        setPersData: function(oBundle) {
            if (!this._oInitialBundle) {
                this._oInitialBundle = CrossPlatformUtilities.cloneObject(oBundle);
            }
            var oDeferred = new jQuery.Deferred();
            this._oBundle = oBundle;
            oDeferred.resolve();
            return oDeferred.promise();
        },

        /**
         * Resets column order back to original
         */
        resetPersData: function() {
            var oDeferred = new jQuery.Deferred();
            this._oBundle = this._oInitialBundle;
            oDeferred.resolve();
            return oDeferred.promise();
        }
    });
}, true);