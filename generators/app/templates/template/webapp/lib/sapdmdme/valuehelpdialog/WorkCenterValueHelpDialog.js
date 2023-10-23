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
        aLiveSearchProperties: ["workcenter", "description"],
        sListBindingPath: "/Workcenters",
        aVariantFilterInfo: [{
                sFilterItemName: "workcenter"
            },
            {
                sFilterItemName: "description"
            },
            {
                sFilterItemName: "status"
            },
            {
                sFilterItemName: "workcenterCategory"
            },
            {
                sFilterItemName: "creationTimeRange",
                sSearchProperty: "createdDateTime"
            }
        ]
    };

    let aDefaultColumns = [{
            label: new Label({
                text: "{i18n-workCenter>common.workCenter.lbl}"
            }),
            template: new Text({
                text: "{workcenter}"
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
        },
        {
            label: new Label({
                text: "{i18n-workCenter>common.workCenterCategory.lbl}"
            }),
            template: new Text({
                text: {
                    path: 'workcenterCategory',
                    type: 'sap.ui.model.odata.type.String',
                    formatter: EnumFormatter.getWorkCenterCategoryText
                }
            })
        }
    ];

    let WorkCenterValueHelpDialogType = ValueHelpDialogBase.extend("sap.dm.dme.valuehelpdialog.WorkCenterValueHelpDialog", {
        statusFormatter: StatusFormatter,
        enumFormatter: EnumFormatter,

        /**
         * @override
         * Initialize selection items in filter bar
         */
        populateSelectItems: function() {
            this._oValueHelpDialog.setModel(new JSONModel(StatusFormatter.getWorkCenterStatusList()), "workCenterStatusItems");
            this._oValueHelpDialog.setModel(new JSONModel(EnumFormatter.getWorkCenterCategoryListForFilter()), "workCenterCategoryItems");
        },

    });

    return {
        /**
         * Creates and Opens a new WorkCenterValueHelpDialog instance.
         * @param {sap.ui.core.Element} oParentControl parent control, browse dialog is set as dependent to it;
         * @param {Array} aTokenList an Array to save the selected items' key and text; structure example: [{key: "RS001",text:"RS001"},{key:"RS002",text:"RS002"}]
         * @param {function} fnSelectionCallback callback function called when user selects item(s) in a list;
         * @param {sap.ui.model.Model} oPlantModel  use OData Model from dataSource "plant-oDataSource";
         * @param {object} oDialogSettings other custom dialog options
         * @param {boolean} bSupportMultiSelect if the value help dialog supports multi input.
         * @param {object[]} aColumns optional array of columns to be displayed in value help dialog result table to override the default one
         * @param {object} oFilterSettings optional filter settings to override the defult one
         * 
         * @returns {sap.dm.dme.valuehelpdialog.WorkCenterValueHelpDialog} WorkCenterValueHelpDialog object
         */
        open: function(oParentControl, aTokenList, fnSelectionCallback, oPlantModel, oDialogSettings, bSupportMultiSelect, aColumns, oFilterSettings) {
            let oBundle = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.workCenter"
            }).getResourceBundle();
            if (!oDialogSettings) {
                oDialogSettings = {};
            }
            let oSettings = {
                title: oDialogSettings.title ? oDialogSettings.title : oBundle.getText("common.workCenter.lbl"),
                resizable: typeof(oDialogSettings.resizable) === "boolean" ? !!oDialogSettings.resizable : true,
                draggable: typeof(oDialogSettings.draggable) === "boolean" ? !!oDialogSettings.draggable : true,
                height: oDialogSettings.height ? oDialogSettings.height : "",
                width: oDialogSettings.width ? oDialogSettings.width : "",
                supportMultiSelect: !!bSupportMultiSelect
            };

            return new WorkCenterValueHelpDialogType("resourceValueHelpDialog", {
                sFragmentName: "sap.dm.dme.valuehelpdialog.fragment.WorkCenterValueHelpDialog",
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