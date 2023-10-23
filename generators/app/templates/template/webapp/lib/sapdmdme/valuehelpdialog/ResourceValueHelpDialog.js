sap.ui.define([
    "sap/dm/dme/valuehelpdialog/ValueHelpDialogBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Text",
    "sap/m/Label",
    "sap/dm/dme/formatter/StatusFormatter",
], function(ValueHelpDialogBase, JSONModel, ResourceModel, Text, Label, StatusFormatter) {
    "use strict";

    let oDefaultFilterSettings = {
        aLiveSearchProperties: ["resource", "description"],
        aVariantFilterInfo: [{
            sFilterItemName: "resource"
        }, {
            sFilterItemName: "description"
        }, {
            sFilterItemName: "status"
        }, {
            sFilterItemName: "creationTimeRange",
            sSearchProperty: "createdDateTime"
        }],
        sListBindingPath: "/Resources"
    }

    let aDefaultColumns = [{
            label: new Label({
                text: "{i18n-resource>common.resource.lbl}"
            }),
            template: new Text({
                text: "{resource}"
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
        },
        {
            label: new Label({
                text: "{i18n-status>common.status.lbl}"
            }),
            template: new Text({
                text: {
                    path: "status",
                    type: "sap.ui.model.odata.type.String",
                    formatter: StatusFormatter.getStatusText
                }
            })
        }
    ];

    let ResourceValueHelpDialogType = ValueHelpDialogBase.extend("sap.dm.dme.valuehelpdialog.ResourceValueHelpDialog", {
        statusFormatter: StatusFormatter,

        /**
         * @override
         * Initialize selection items in filter bar
         */
        populateSelectItems: function() {
            this._oValueHelpDialog.setModel(new JSONModel(StatusFormatter.getResourceStatusList()), "statusItems");
        },

    });

    return {
        /**
         * Creates and Opens a new ResourceValueHelpDialog instance.
         * @param {sap.ui.core.Element} oParentControl parent control; browse dialog is set as dependent to it;
         * @param {Array} aTokenList an Array to save the selected items' key and text; structure example: [{key: "RS001",text:"RS001"},{key:"RS002",text:"RS002"}]
         * @param {function} fnSelectionCallback callback function called when user selects item(s) in a list;
         * @param {sap.ui.model.Model} oPlantModel  use OData Model from dataSource "plant-oDataSource";
         * @param {object} oDialogSettings other custom dialog settings
         * @param {boolean} bSupportMultiSelect if the value help dialog supports multi input.
         * @param {object[]} aColumns optional array of columns to be displayed in value help dialog result table to override the default one
         * @param {object} oFilterSettings optional filter settings to override the defult one
         * 
         * @returns {sap.dm.dme.valuehelpdialog.ResourceValueHelpDialog} ResourceValueHelpDialog object
         */
        open: function(oParentControl, aTokenList, fnSelectionCallback, oPlantModel, oDialogSettings, bSupportMultiSelect, aColumns, oFilterSettings) {
            let oBundle = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.resource"
            }).getResourceBundle();
            if (!oDialogSettings) {
                oDialogSettings = {};
            }
            let oSettings = {
                title: oDialogSettings.title ? oDialogSettings.title : oBundle.getText("common.resource.lbl"),
                resizable: typeof(oDialogSettings.resizable) === "boolean" ? oDialogSettings.resizable : true,
                draggable: typeof(oDialogSettings.draggable) === "boolean" ? oDialogSettings.draggable : true,
                height: oDialogSettings.height ? oDialogSettings.height : "",
                width: oDialogSettings.width ? oDialogSettings.width : "",
                supportMultiSelect: !!bSupportMultiSelect
            };

            return new ResourceValueHelpDialogType("resourceValueHelpDialog", {
                sFragmentName: "sap.dm.dme.valuehelpdialog.fragment.ResourceValueHelpDialog",
                oParentControl: oParentControl,
                oModel: oPlantModel,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: oFilterSettings ? oFilterSettings : oDefaultFilterSettings,
                aColumns: aColumns ? aColumns : aDefaultColumns,
                oDialogSettings: oSettings
            }, aTokenList);
        },
    };
});