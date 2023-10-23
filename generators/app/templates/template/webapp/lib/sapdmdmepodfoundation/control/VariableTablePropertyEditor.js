sap.ui.define([
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/Select",
    "sap/m/ListMode",
    "sap/m/ListType",
    "sap/ui/core/Item",
    "sap/dm/dme/podfoundation/control/PropertyEditor",
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/i18n/i18nBundles"
], function(Input, Label, Select, ListMode, ListType, Item, PropertyEditor, CrossPlatformUtilities, Bundles) {
    "use strict";

    const _aVariableKeys = ["EMPTY", "MATERIAL", "OPERATION", "ORDER", "PLANT", "PROCESS_LOT", "RESOURCE", "ROUTING", "SFC", "WORK_CENTER", "USER_ID"];

    const COLUMN_STYLE_CLASS = "sapUiSizeCompact sapMesFormTableColumnHeader";

    return PropertyEditor.extend("sap.dm.dme.podfoundation.control.VariableTablePropertyEditor", {
        constructor: function(sId, mSettings) {
            PropertyEditor.apply(this, arguments);
        },

        addInputParametersTable: function(oPropertyFormContainer, oData, sId, sBindingPath) {
            var oListConfiguration = this.getListConfiguration();
            var aListColumnData = this.getColumnListData();
            var oColumnListItemMetadata = this.getColumnListItemMetadata();
            var oTableMetadata = this.getTableMetadata();
            var bShowControlLabel = this.isControlLabelShown();
            var oMetadata = {
                id: sId,
                bindingPath: sBindingPath,
                listConfiguration: oListConfiguration,
                listColumnData: aListColumnData,
                tableMetadata: oTableMetadata,
                columnListItemMetadata: oColumnListItemMetadata,
                resourceBundleName: null,
                showControlLabel: bShowControlLabel
            };
            return this.addTable(oPropertyFormContainer, oMetadata);
        },

        isControlLabelShown: function() {
            return true;
        },

        getListConfiguration: function() {
            var oListConfiguration = {
                columns: [{
                        columnId: "PARAMETER",
                        fieldName: "parameter",
                        sequence: 10,
                        sortOrder: null,
                        sortDescending: false
                    },
                    {
                        columnId: "VARIABLE",
                        fieldName: "variable",
                        sequence: 20,
                        sortOrder: null,
                        sortDescending: false
                    },
                    {
                        columnId: "CONSTANT",
                        fieldName: "constant",
                        sequence: 30,
                        sortOrder: null,
                        sortDescending: false
                    }
                ]
            };
            return oListConfiguration;
        },

        getColumnListData: function() {
            var aListColumnData = {};
            aListColumnData["PARAMETER"] = {
                label: Bundles.getPropertyEditorText("variableTable.PARAMETER"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: COLUMN_STYLE_CLASS,
                columnListItem: this.getParameterControl()
            };
            aListColumnData["VARIABLE"] = {
                label: Bundles.getPropertyEditorText("variableTable.VARIABLE"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: COLUMN_STYLE_CLASS,
                columnListItem: this.getVariableSelectControl()
            };
            aListColumnData["CONSTANT"] = {
                label: Bundles.getPropertyEditorText("variableTable.CONSTANT"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: COLUMN_STYLE_CLASS,
                columnListItem: this.getConstantControl()
            };
            return aListColumnData;
        },

        getColumnListItemMetadata: function() {
            return {
                type: ListType.Inactive,
                vAlign: "Middle"
            };
        },

        getTableMetadata: function() {
            return {
                alternateRowColors: false,
                fixedLayout: true,
                mode: ListMode.None,
                growing: false,
                width: "100%"
            };
        },

        getParameterControl: function() {
            var oLabel = new Label({
                text: Bundles.getPropertyEditorText("variableTable.PARAMETER.BINDING"),
                tooltip: Bundles.getPropertyEditorText("variableTable.PARAMETER.TOOLTIP"),
                width: "100%",
                required: "{required}"
            });
            return oLabel;
        },

        getVariableSelectControl: function() {
            return new Select({
                width: "100%",
                selectedKey: Bundles.getPropertyEditorText("variableTable.VARIABLE.BINDING"),
                items: {
                    path: "variableList",
                    templateShareable: true,
                    template: new Item({
                        key: "{keyName}",
                        text: "{textValue}"
                    })
                },
                tooltip: Bundles.getPropertyEditorText("variableTable.VARIABLE.TOOLTIP"),
                change: [this.onVariableChange, this]
            });
        },

        getConstantControl: function() {
            var oInput = new Input({
                value: Bundles.getPropertyEditorText("variableTable.CONSTANT.BINDING"),
                tooltip: "{tooltip}",
                width: Bundles.getPropertyEditorText("variableTable.CONSTANT.WIDTH"),
                maxLength: Number(Bundles.getPropertyEditorText("variableTable.CONSTANT.MAX_LENGTH")),
                enabled: "{constantEnabled}",
                change: [this.onConstantChange, this]
            });
            return oInput;
        },

        getVariableListOptions: function() {
            var aVariableList = [];
            for (var i = 0; i < _aVariableKeys.length; i++) {
                aVariableList[aVariableList.length] = {
                    keyName: _aVariableKeys[i],
                    textValue: Bundles.getPropertyEditorText("variableTable." + _aVariableKeys[i])
                }
            }
            return aVariableList;
        },

        onVariableChange: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oItemData = oSelectedItem.getBindingContext().getObject();
            var oParentSelect = oSelectedItem.getParent();
            var oRowData = oParentSelect.getBindingContext().getObject();

            this.handleVariableSelectChange(oItemData, oRowData);
        },

        handleVariableSelectChange: function(oItemData, oRowData) {
            // to be implemented by sub-class
        },
        onConstantChange: function(oEvent) {
            var oControl = oEvent.getSource();
            var oRowData = oControl.getBindingContext().getObject();

            // clone it to allow updating
            var oClonedData = CrossPlatformUtilities.cloneObject(oRowData);

            this.handleConstantChange(oEvent, oControl, oClonedData);
        },

        handleConstantChange: function(oEvent, oControl, oRowData) {
            // to be implemented by sub-class
        }
    });
});