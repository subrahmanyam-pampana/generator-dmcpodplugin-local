sap.ui.define([
    "sap/dm/dme/valuehelpdialog/ValueHelpDialogBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Text",
    "sap/m/Label",
    "sap/dm/dme/formatter/StatusFormatter"
], function(ValueHelpDialogBase, JSONModel, ResourceModel, Text, Label, StatusFormatter) {
    "use strict";

    const oDefaultFilterSettings = {
        aLiveSearchProperties: ["resourceType", "description"],
        aVariantFilterInfo: [{
            sFilterItemName: "resourceType"
        }, {
            sFilterItemName: "description"
        }],
        sListBindingPath: "/ResourceTypes"
    };

    const aDefaultColumns = [{
            label: new Label({
                text: "{i18n-resource>common.resourceType.lbl}"
            }),
            template: new Text({
                text: "{resourceType}"
            })
        },
        {
            label: new Label({
                text: "{i18n-global>common.description.lbl}"
            }),
            template: new Text({
                text: "{description}"
            }),
            width: "50%"
        }
    ];

    const ResourceTypeValueHelpDialogType = ValueHelpDialogBase.extend("sap.dm.dme.valuehelpdialog.ResourceTypeValueHelpDialog", {
        statusFormatter: StatusFormatter,

        /**
         * @override
         * Initialize selection items in filter bar
         */
        populateSelectItems: function() {
            this._oValueHelpDialog.setModel(new JSONModel(StatusFormatter.getResourceStatusList()), "statusItems");
        }
    });

    return {
        /**
         * Creates and Opens a new ResourceTypeValueHelpDialog instance.
         * @param {sap.ui.core.Element} oParentControl parent control; browse dialog is set as dependent to it;
         * @param {Array} aTokenList an Array to save the selected items' key and text; structure example: [{key: "RS001",text:"RS001"},{key:"RS002",text:"RS002"}]
         * @param {function} fnSelectionCallback callback function called when user selects item(s) in a list;
         * @param {sap.ui.model.Model} oPlantModel  use OData Model from dataSource "plant-oDataSource";
         * @param {object} oDialogSettings other custom dialog settings
         * @param {boolean} bSupportMultiSelect if the value help dialog supports multi input.
         * @param {object[]} aColumns optional array of columns to be displayed in value help dialog result table to override the default one
         * @param {object} oFilterSettings optional filter settings to override the defult one
         *
         * @returns {sap.dm.dme.valuehelpdialog.ResourceTypeValueHelpDialog} ResourceTypeValueHelpDialog object
         */
        open: function(oParentControl, aTokenList, fnSelectionCallback, oPlantModel, oDialogSettings, bSupportMultiSelect, aColumns, oFilterSettings) {
            const oBundle = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.resource"
            }).getResourceBundle();
            if (!oDialogSettings) {
                oDialogSettings = {};
            }
            const oSettings = {
                title: oDialogSettings.title ? oDialogSettings.title : oBundle.getText("common.resourceType.lbl"),
                resizable: typeof(oDialogSettings.resizable) === "boolean" ? oDialogSettings.resizable : true,
                draggable: typeof(oDialogSettings.draggable) === "boolean" ? oDialogSettings.draggable : true,
                height: oDialogSettings.height ? oDialogSettings.height : "",
                width: oDialogSettings.width ? oDialogSettings.width : "",
                supportMultiSelect: !!bSupportMultiSelect
            };

            return new ResourceTypeValueHelpDialogType("ResourceTypeValueHelpDialog", {
                sFragmentName: "sap.dm.dme.valuehelpdialog.fragment.ResourceTypeValueHelpDialog",
                oParentControl: oParentControl,
                oModel: oPlantModel,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: oFilterSettings || oDefaultFilterSettings,
                aColumns: aColumns || aDefaultColumns,
                oDialogSettings: oSettings
            }, aTokenList);
        }
    };
});