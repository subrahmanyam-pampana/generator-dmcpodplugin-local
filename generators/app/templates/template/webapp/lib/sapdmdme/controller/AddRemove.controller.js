/**
 * Controller for the AddRemove view. Provides methods for moving objects between
 * the available table and the assigned table. Both drag and drop and manual object
 * move is supported.
 *
 * This control only supports desktop and tablet.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/Base.controller",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/Sorter"
], function(JSONModel, BaseController, AjaxUtil, Sorter) {
    "use strict";

    let AVAILABLE_NAME = "availableObjects";
    let ASSIGNED_NAME = "assignedObjects";
    let SOURCE_TABLE = "sourceTable";
    let TARGET_TABLE = "targetTable";
    let DRAG_SESSION = "dragSession";
    let DRAG_ROW = "draggedRow";

    return BaseController.extend("sap.dm.dme.controller.AddRemove", {
        onInit: function() {
            this._modelNames = {};
        },

        /**
         * Configure the AddRemove with application specific settings.
         * @param oSettings Object containing the following settings
         *
         * sAvailableColumnName Localized name for the available table column
         * sAssignedColumnName Localized name for the assigned table column
         * sDescriptionColumnName Localized name for the description column of both tables
         * sObjectPropertyName The OData entity property name of the objects displayed in the tables
         * sObjectPropertyName The OData entity property name of the objects displayed in the tables
         * fnDescriptionFormatter the formatter function for the description column of both tables
         */
        setConfiguration: function(oSettings) {
            this._configureTable(this._getAvailableTable(), {
                sObjectColumnName: oSettings.sAvailableColumnName,
                sDescriptionColumnName: oSettings.sDescriptionColumnName,
                sNoDataMessage: oSettings.sNoDataMessage
            }, {
                sObjectPropertyName: oSettings.sObjectPropertyName,
                sDescriptionPropertyName: oSettings.sDescriptionPropertyName,
                fnDescriptionFormatter: oSettings.fnDescriptionFormatter,
                sModelName: AVAILABLE_NAME
            });
            this._configureTable(this._getAssignedTable(), {
                sObjectColumnName: oSettings.sAssignedColumnName,
                sDescriptionColumnName: oSettings.sDescriptionColumnName,
                sNoDataMessage: oSettings.sNoDataMessage
            }, {
                sObjectPropertyName: oSettings.sObjectPropertyName,
                sDescriptionPropertyName: oSettings.sDescriptionPropertyName,
                fnDescriptionFormatter: oSettings.fnDescriptionFormatter,
                sModelName: ASSIGNED_NAME
            });
        },

        _configureTable: function(oTable, oLabels, oBindingInfo) {
            this._configureTableRowsAggregation(oTable, oBindingInfo.sObjectPropertyName, oBindingInfo.sModelName);
            let oColumns = oTable.getColumns();
            this._configureColumn(oColumns[0],
                oLabels.sObjectColumnName,
                oBindingInfo.sObjectPropertyName,
                oBindingInfo.sModelName);
            this._configureColumn(oColumns[1],
                oLabels.sDescriptionColumnName,
                oBindingInfo.sDescriptionPropertyName,
                oBindingInfo.sModelName,
                oBindingInfo.fnDescriptionFormatter);
            oTable.setNoData(oLabels.sNoDataMessage);
        },

        _configureTableRowsAggregation: function(oTable, sPropertyName, sModelName) {
            let oInitialSort = new Sorter({
                path: sPropertyName,
                bDescending: false
            });
            oTable.bindAggregation("rows", {
                path: sModelName + ">/Objects/",
                sorter: oInitialSort
            });
        },

        _configureColumn: function(oColumn, sLabel, sPropertyName, sModelName, fnFormatter) {
            oColumn.getLabel().setText(sLabel);

            oColumn.setFilterProperty(sPropertyName);
            oColumn.setSortProperty(sPropertyName);

            let oTemplate = oColumn.getTemplate();
            oTemplate.bindProperty("text", {
                path: sModelName + ">" + sPropertyName,
                formatter: fnFormatter
            });
        },

        /**
         * Ajax load of available objects requested with the specified URL.
         *
         * @param sUrl The OData service URL for the object collection.
         * ex. /plant.svc/ResourceTypes
         * @param sParameters OData parameters, such as to filter objects to include only those objects
         * that are not assigned. This parameter is optional.
         */
        loadAvailableObjects: function(sUrl, sParameters) {
            this.byId("addRemoveLayout").setBusy(true);
            AjaxUtil.get(sUrl, sParameters, this._bindFunctionToController(this._availableObjectsReceived), this._handleLoadError);
        },

        /**
         * Copy assigned objects into the assigned table model.
         *
         * @param aAssociationObjects An array of assigned objects returned as part of the
         * top level entity read. For example, assigned resource types for the resource R1
         * are read with the OData request
         *
         * plant.svc/Resources('ResourceBO:SAP,R1')?$expand=resourceTypeResources($expand=resourceType)
         *
         * Assuming R1 has resource types RT1 and RT4 assigned, the request results in the navigation property
         *
         *     "resourceTypeResources": [
         *     {
         *          "ref": "ResourceTypeResourceBO:ResourceTypeBO:SAP,RT1,ResourceBO:SAP,R1",
         *          "resourceType": {
         *          "resourceType": "RT1",
         *          "plant": "SAP",
         *          "description": "Resource type 1",
         *          "modifiedDateTime": "2018-01-08T05:00:00Z",
         *          "createdDateTime": "2018-01-08T05:00:00Z",
         *          "ref": "ResourceTypeBO:SAP,RT1"
         *      },
         *      {
         *          "ref": "ResourceTypeResourceBO:ResourceTypeBO:SAP,RT4,ResourceBO:SAP,R1",
         *          "resourceType": {
         *          "resourceType": "RT4",
         *          "plant": "SAP",
         *          "description": "Resource type 4",
         *          "modifiedDateTime": "2018-01-08T05:00:00Z",
         *          "createdDateTime": "2018-01-08T05:00:00Z",
         *          "ref": "ResourceTypeBO:SAP,RT4"
         *      }
         *    ]
         *
         *    In this example resourceTypeResources is aAssociationObjects.
         *
         *    @param sObjectPropertyName The property name of the assigned object. Taking the above example, this
         *    would be resourceType.
         */
        loadAssignedObjects: function(aAssociationObjects, sObjectPropertyName) {
            let oAssignedTable = this._getAssignedTable();
            let aAssignedData = [];

            for (let i = 0; i < aAssociationObjects.length; i++) {
                aAssignedData.push(aAssociationObjects[i][sObjectPropertyName]);
            }

            let oData = {
                Objects: aAssignedData
            };

            this._initAddRemoveTableModel(oAssignedTable, ASSIGNED_NAME, oData);
        },

        /**
         * Create an empty assigned table model.
         */
        createAssignedTableModel: function() {
            this._initAddRemoveTableModel(this._getAssignedTable(), ASSIGNED_NAME, {
                Objects: []
            });
        },

        /**
         * Create the OData payload for the given collection and property.
         *
         * @param sCollectionName The name of the OData collection, such as ResourceTypes
         * @param sBindPropertyName the name of the bound entity property, such as resourceType. This
         * is used to create the OData bind property name, such as resourceType@odata.bind.
         */
        getAssignedObjectsPayload: function(sCollectionName, sBindPropertyName) {
            let oAssignedTable = this._getAssignedTable();
            let aAssignedItems = oAssignedTable.getModel(ASSIGNED_NAME).getData().Objects;
            let sODataBindPropertyName = sBindPropertyName + "@odata.bind";
            return aAssignedItems.map(function(oItem) {
                let oPayloadItem = {};
                oPayloadItem[sODataBindPropertyName] = "/" + sCollectionName + "('" + oItem.ref + "')";
                return oPayloadItem;
            });
        },

        /**
         * Create the OData payload when the referenced entity is a part of another microservice.
         * In this case @odata.bind can't be used.
         *
         * @param sCollectionProperty The name of the entity that forms the collection
         * @param sBindProperty the name of the property of the complex type that will be passed to another microservice.
         */
        getAssignedObjectsPayloadForExternalService: function(sCollectionProperty, sBindProperty) {
            let aAssignedItems = this._getAssignedTable().getModel(ASSIGNED_NAME).getData().Objects;
            return aAssignedItems.map(function(oItem) {
                let oPayloadItem = {};
                let oPayloadSubItem = {};
                oPayloadSubItem[sBindProperty] = oItem[sBindProperty];
                oPayloadItem[sCollectionProperty] = oPayloadSubItem;
                return oPayloadItem;
            });
        },

        /**
         * Handler called when the user starts to drag table items from either table.
         */
        onDrag: function(oEvent) {
            let sTargetName = "target";
            let oDragSession = oEvent.getParameter(DRAG_SESSION);
            let oDraggedRow = oEvent.getParameter(sTargetName);
            let oSourceTable = oEvent.getParameter(sTargetName).getParent();
            let oTargetTable = this.byId(oSourceTable.getDragDropConfig()[0].getTargetElement());

            oDragSession.setComplexData(DRAG_ROW, oDraggedRow);
            oDragSession.setComplexData(SOURCE_TABLE, oSourceTable);
            oDragSession.setComplexData(TARGET_TABLE, oTargetTable);
        },

        /**
         * Drop handler when table items are dragged/dropped on the assigned table.
         */
        onDropAssigned: function(oEvent) {
            this.onDrop(oEvent, AVAILABLE_NAME, ASSIGNED_NAME);
        },

        /**
         * Drop handler when table items are dragged/dropped on the available table.
         */
        onDropAvailable: function(oEvent) {
            this.onDrop(oEvent, ASSIGNED_NAME, AVAILABLE_NAME);
        },

        onDrop: function(oEvent, sSourceModelName, sTargetModelName) {
            let oDragSession = oEvent.getParameter(DRAG_SESSION);
            let oSourceTable = oDragSession.getComplexData(SOURCE_TABLE);
            let oTargetTable = oDragSession.getComplexData(TARGET_TABLE);
            let oDraggedRow = oDragSession.getComplexData(DRAG_ROW);

            // Determine the index of record in the Model. For example /Objects/10
            let sPathObjects = oDraggedRow.oBindingContexts[sSourceModelName].sPath;
            let iIndexOfObject = Number(sPathObjects.slice(sPathObjects.lastIndexOf("/") + 1, sPathObjects.length));
            let oBinding = oSourceTable.getBinding("rows");
            let iIndexOfRow = oBinding.aIndices.indexOf(iIndexOfObject, 0);

            this._moveSelectedItems(oSourceTable, oTargetTable, iIndexOfRow);
        },

        /**
         * Move an object from the available table to the assigned table.
         */
        onMoveToAssigned: function() {
            let oSourceTable = this._getAvailableTable();
            let oTargetTable = this._getAssignedTable();

            this._moveSelectedItems(oSourceTable, oTargetTable);
        },

        /**
         * Move an object from the assigned table to the available table.
         */
        onMoveToAvailable: function() {
            let oSourceTable = this._getAssignedTable();
            let oTargetTable = this._getAvailableTable();

            this._moveSelectedItems(oSourceTable, oTargetTable);
        },

        _availableObjectsReceived: function(oReadData) {
            let oAvailableTable = this._getAvailableTable();
            let oModel = this._initAddRemoveTableModel(oAvailableTable, AVAILABLE_NAME);

            let oData = {
                Objects: oReadData.value
            };

            oModel.setData(oData);
            oAvailableTable.getBinding("rows").attachChange(this._handleAvailableBindingChange, this);
            this.byId("addRemoveLayout").setBusy(false);
        },

        _handleLoadError: function(oError, sHttpErrorMessage) {
            sap.m.MessageBox.error(oError.error.message || sHttpErrorMessage);
            this.byId("addRemoveLayout").setBusy(false);
        },

        /**
         * Move selected items from the source table to the target table.
         * This method handles both drag/drop and manual move with arrow buttons.
         * iIndexOfRow is defined the Index of Draged Row.
         */
        _moveSelectedItems: function(oSourceTable, oTargetTable, iIndexOfRow) {
            let oSourceTableModelName = this._getModelNameForTable(oSourceTable);
            let oTargetTableModelName = this._getModelNameForTable(oTargetTable);
            let oSourceData = oSourceTable.getModel(oSourceTableModelName).getData();
            let aSelectedIndices = oSourceTable.getSelectedIndices();

            // Handle case where user drags a row without selecting it (just a mouse down to drag)
            if (iIndexOfRow >= 0 && aSelectedIndices.indexOf(iIndexOfRow, 0) === -1) {
                aSelectedIndices.push(iIndexOfRow);
            }

            let oTargetData = oTargetTable.getModel(oTargetTableModelName).getData();

            let aRemovedIndexes = [];
            for (let i = 0; i < aSelectedIndices.length; i++) {
                let oRowContext = oSourceTable.getContextByIndex(aSelectedIndices[i]);
                let oRowData = oRowContext.getObject();

                let iRowDataIndex = oSourceData.Objects.indexOf(oRowData);
                aRemovedIndexes.push(iRowDataIndex);
                oTargetData.Objects.push(oRowData);
            }

            // Must sort indexes in ascending so that indexing of removed data works below
            // Have to provide custom sort function because default compares based on unicode
            // value.  This results in the wrong result. For example, it considers 18 less than 2.
            // See Array.sort documentation
            aRemovedIndexes.sort(function(a, b) {
                if (a < b) {
                    return -1;
                } else if (a === b) {
                    return 0;
                }
                return 1;
            });

            for (let i = 0; i < aRemovedIndexes.length; i++) {
                oSourceData.Objects.splice(aRemovedIndexes[i] - i, 1);
            }

            oSourceTable.getModel(oSourceTableModelName).setData(oSourceData);
            oTargetTable.getModel(oTargetTableModelName).setData(oTargetData);
            oSourceTable.setSelectedIndex(-1);
        },

        _initAddRemoveTableModel: function(oTable, sModelName, oData) {
            let oModel = new JSONModel(oData);
            oTable.setModel(oModel, sModelName);
            this._modelNames[oTable.getId()] = sModelName;
            return oModel;
        },

        _handleAvailableBindingChange: function() {
            this.getEventBus().publish("sap.dm.dme.UnsavedChangesChannel", "ChangeDetected");
        },

        _getModelNameForTable: function(oTable) {
            return this._modelNames[oTable.getId()];
        },

        _bindFunctionToController: function(oFunc) {
            return oFunc.bind(this);
        },

        _getAvailableTable: function() {
            return this.byId(AVAILABLE_NAME);
        },

        _getAssignedTable: function() {
            return this.byId(ASSIGNED_NAME);
        }
    });
}, true);