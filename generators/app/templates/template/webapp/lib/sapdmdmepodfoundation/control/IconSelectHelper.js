sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/core/IconPool",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function(BaseObject, Fragment, syncStyleClass, IconPool, Filter, FilterOperator, JSONModel) {
    "use strict";

    var IconSelectHelper = BaseObject.extend("sap.dm.dme.podfoundation.control.IconSelectHelper", {

        /**
         * Loads icon names into the input views model.
         * 
         * @param {sap.ui.core.mvc.View} oView that contains model data
         * @param {string} sNoneTitle Text for "None" title
         * @public
         */
        loadIconNames: function(oView, sNoneTitle) {
            if (!oView.getModel("ButtonIconData")) {
                var aIconNames = IconPool.getIconNames().map(function(iconName) {
                    return {
                        name: "sap-icon://" + iconName,
                        icon: "sap-icon://" + iconName
                    };
                });

                aIconNames.sort(function(a, b) {
                    var sNameA = a.name.toLowerCase();
                    var sNameB = b.name.toLowerCase();
                    if (sNameA < sNameB) {
                        return -1;
                    } else if (sNameA > sNameB) {
                        return 1;
                    }
                    return 0;
                });

                aIconNames.splice(0, 0, {
                    name: sNoneTitle,
                    icon: "sap-icon://empty"
                });
                var oIconModel = new JSONModel();
                oIconModel.setData({
                    allIcons: aIconNames
                });
                oView.setModel(oIconModel, "ButtonIconData");
            }
        },

        /**
         * Opens a dialog for selecting an SAP icon.
         * @param {sap.m.Input} oIconSelectField to get icon for.
         * @param {sap.ui.core.mvc.View} oView that contains 'ButtonIconData'
         * @param {string} sNoneTitle title for 'None' or empty list item
         * @public
         */
        openIconSelectValueHelp: function(oIconSelectField, oView, sNoneTitle) {
            this._iconSelectField = oIconSelectField;
            var sInputValue = this._iconSelectField.getValue();
            var oModel = oView.getModel("ButtonIconData");
            if (!oModel) {
                this.loadIconNames(oView, sNoneTitle);
                oModel = oView.getModel("ButtonIconData");
            }
            var oIcons = oModel.getData();

            if (this._oIconSelectValueHelpDialog) {
                this._oIconSelectValueHelpDialog.destroy();
                this._oIconSelectValueHelpDialog = null;
            }

            this._createDialog(oView, oIcons, sInputValue);
        },

        _createDialog: function(oView, oIcons, sInputValue) {
            var that = this;
            return Fragment.load({
                name: "sap.dm.dme.podfoundation.fragment.IconSelectDialog",
                controller: that
            }).then(function(oControl) {
                oView.addDependent(oControl);
                syncStyleClass("sapUiSizeCompact", oView, oControl);
                that._oIconSelectValueHelpDialog = oControl;

                oIcons.allIcons.forEach(function(oIcon) {
                    oIcon.selected = (oIcon.name === sInputValue);
                });
                that._openDialog(that._oIconSelectValueHelpDialog);
            });
        },

        _openDialog: function(oDialog) {
            // added to support QUnit tests
            oDialog.open();
        },

        handleIconSelectSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("name", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        handleIconSelectConfirm: function(oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
                var oData = aContexts[0].getObject();
                var sName = oData.name;
                if (oData.icon === "sap-icon://empty") {
                    sName = "";
                }
                this._iconSelectField.setValue(sName);
                this._iconSelectField.fireChange({
                    value: sName
                });
            }
        }
    });

    return IconSelectHelper;
});