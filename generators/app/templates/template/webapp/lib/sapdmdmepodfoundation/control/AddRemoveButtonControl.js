sap.ui.define([
    "sap/m/HBox",
    "sap/ui/core/Fragment",
    "sap/dm/dme/podfoundation/controller/AddRemoveButtonController",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(HBox, Fragment, AddRemoveButtonController, PodUtility) {
    "use strict";

    var oAddRemoveButtonControl = HBox.extend("sap.dm.dme.podfoundation.controller.AddRemoveButtonControl", {

        metadata: {
            properties: {
                propertyEditor: {
                    type: "object",
                    group: "Misc"
                },
                dataName: {
                    type: "string",
                    group: "Misc"
                },
                defaultData: {
                    type: "object",
                    group: "Misc"
                }
            }
        },

        constructor: function(sId, mSettings) {
            if (mSettings) {
                this._internalProps = mSettings;
            }
            HBox.apply(this, arguments);
        },

        renderer: {},

        init: function() {
            if (HBox.prototype.init) {
                HBox.prototype.init.apply(this, arguments);
            }
            this.setWidth("100%");
            this._oPropertyEditor = null;
            this._sDataName = null;
            this._oDefaultData = null;
            if (this._internalProps) {
                if (this._internalProps.propertyEditor) {
                    this._oPropertyEditor = this._internalProps.propertyEditor;
                }
                if (this._internalProps.dataName) {
                    this._sDataName = this._internalProps.dataName;
                }
                if (this._internalProps.defaultData) {
                    this._oDefaultData = this._internalProps.defaultData;
                }
            }
        },

        onBeforeRendering: function() {
            if (HBox.prototype.onBeforeRendering) {
                HBox.prototype.onBeforeRendering.apply(this, arguments);
            }

            if (!this._oSmartListControl) {
                // only create one time
                this._oController = this._createController(this._oPropertyEditor, this._sDataName, this._oDefaultData);
                this._createSmartList(this._oController, this._sDataName);
            }
        },

        _createController: function(oPropertyEditor, sDataName, oDefaultData) {
            var oActionController = new AddRemoveButtonController();
            oActionController.setPropertyEditor(oPropertyEditor);
            oActionController.setDataName(sDataName);
            oActionController.setDefaultData(oDefaultData);
            return oActionController;
        },

        _createSmartList: function(oController, sDataName) {
            var that = this;
            return Fragment.load({
                name: "sap.dm.dme.podfoundation.fragment.AddRemoveButtonControl",
                controller: oController
            }).then(function(oControl) {
                that._oSmartListControl = oControl;
                var sHeaderTitle = that._oPropertyEditor.getAddRemoveButtonControlTitle(sDataName);
                if (PodUtility.isNotEmpty(sHeaderTitle)) {
                    oControl.setHeader(sHeaderTitle);
                }
                that._setListBindingPath(oControl, sDataName);
                that.addItem(oControl);
                that._oAddRemoveButtonControl = oControl;
                oController.beforeOpen(oControl);
            });
        },

        _setListBindingPath: function(oSmartList, sDataName) {
            oSmartList.setListBindingPath("ButtonsControl>/" + sDataName);
        },

        refreshTableModel: function(oData) {
            this._oDefaultData = oData;
            this._oController.setDefaultData(this._oDefaultData);
            this._oController.updateTableModel(false);
            this._oController._updateToolbarButtonStates();
        }
    });

    return oAddRemoveButtonControl;
});