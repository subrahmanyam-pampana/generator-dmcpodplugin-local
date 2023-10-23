sap.ui.define([
    "sap/dm/dme/valuehelpdialog/ValueHelpDialogBase",
    'sap/ui/model/json/JSONModel',
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Text",
    "sap/m/Label",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/EnumFormatter"
], function(ValueHelpDialogBase, JSONModel, ResourceModel, Text, Label, StatusFormatter, EnumFormatter) {
    "use strict";

    let oDefaultFilterSettings = {
        aLiveSearchProperties: ["storageLocation", "description"],
        sListBindingPath: "/StorageLocations",
        aVariantFilterInfo: [{
                sFilterItemName: "storageLocation"
            },
            {
                sFilterItemName: "description"
            }
        ]
    };

    let aDefaultColumns = [{
            label: new Label({
                text: "{i18n-inventory>common.storageLocation.lbl}"
            }),
            template: new Text({
                text: "{storageLocation}"
            })
        },
        {
            label: new Label({
                text: "{i18n-global>common.description.lbl}"
            }),
            template: new Text({
                text: "{description}",
            }),
            width: "50%"
        }
    ];

    let StorageLocationValueHelpDialogType = ValueHelpDialogBase.extend("sap.dm.dme.valuehelpdialog.StorageLocationValueHelpDialog", {

    });

    return {
        /**
         * Creates and Opens a new StorageLocationValueHelpDialogType instance.
         * @param {sap.ui.core.Element} oParentControl parent control, browse dialog is set as dependent to it;
         * @param {Array} aTokenList an Array to save the selected items' key and text; structure example: [{key: "RS001",text:"RS001"},{key:"RS002",text:"RS002"}]
         * @param {function} fnSelectionCallback callback function called when user selects item(s) in a list;
         * @param {sap.ui.model.Model} oInventoryModel  use OData Model from dataSource "inventory-oDataSource";
         * @param {object} oDialogSettings other custom dialog options
         * @param {boolean} bSupportMultiSelect if the value help dialog supports multi input.
         * @param {object[]} aColumns optional array of columns to be displayed in value help dialog result table to override the default one
         * @param {object} oFilterSettings optional filter settings to override the defult one
         * 
         * @returns {sap.dm.dme.valuehelpdialog.WorkCenterValueHelpDialog} WorkCenterValueHelpDialog object
         */
        open: function(oParentControl, aTokenList, fnSelectionCallback, oInventoryModel, oDialogSettings, bSupportMultiSelect, aColumns, oFilterSettings) {
            let oBundle = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.inventory"
            }).getResourceBundle();
            if (!oDialogSettings) {
                oDialogSettings = {};
            }
            let oSettings = {
                title: oDialogSettings.title ? oDialogSettings.title : oBundle.getText("common.storageLocation.lbl"),
                resizable: typeof(oDialogSettings.resizable) === "boolean" ? !!oDialogSettings.resizable : true,
                draggable: typeof(oDialogSettings.draggable) === "boolean" ? !!oDialogSettings.draggable : true,
                height: oDialogSettings.height ? oDialogSettings.height : "",
                width: oDialogSettings.width ? oDialogSettings.width : "",
                supportMultiSelect: !!bSupportMultiSelect
            };

            return new StorageLocationValueHelpDialogType("storageLocationValueHelpDialog", {
                sFragmentName: "sap.dm.dme.valuehelpdialog.fragment.StorageLocationValueHelpDialog",
                oParentControl: oParentControl,
                oModel: oInventoryModel,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: oFilterSettings ? oFilterSettings : oDefaultFilterSettings,
                aColumns: aColumns ? aColumns : aDefaultColumns,
                oDialogSettings: oSettings
            }, aTokenList);
        },
    };
});