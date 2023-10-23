sap.ui.define([
    "sap/m/TablePersoController",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/HBox",
    "sap/m/ListMode",
    "sap/m/ListType",
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/dm/dme/podfoundation/controller/MetadataMethodConstants",
    "sap/dm/dme/podfoundation/control/TableFactory",
    "sap/dm/dme/podfoundation/control/TablePersoService",
    "sap/dm/dme/podfoundation/control/ViewSettingsDialogFactory",
    "sap/dm/dme/podfoundation/formatter/InfoIconFormatter",
    "sap/dm/dme/podfoundation/handler/TableResizeHandler",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(TablePersoController, syncStyleClass, JSONModel, Button, HBox, ListMode, ListType,
    PluginViewController, MetadataMethodConstants, TableFactory, TablePersoService,
    ViewSettingsDialogFactory, InfoIconFormatter, TableResizeHandler, PodUtility) {
    "use strict";

    const SORT_A_BEFORE_B = -1;
    const SORT_B_BEFORE_A = 1;
    const SORT_KEEP_EXISTING_ORDER = 0;

    /**
     * Constructor for a new List Plugin View Controller
     *
     * @param {string} [sId] Id for the new ManagedObject, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new ManagedObject
     *
     * @class
     * <code>sap.dm.dme.podfoundation.controller.ListPluginViewController</code> provides a set of functions
     * for use by List view plugins for executing in the Production Operator Dashboard (POD).
     *
     * @extends sap.dm.dme.podfoundation.controller.PluginViewController
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.controller.ListPluginViewController
     */
    let ListPluginViewController = PluginViewController.extend("sap.dm.dme.podfoundation.controller.ListPluginViewController", {
        metadata: {
            methods: MetadataMethodConstants.LIST_PLUGIN_VIEW_CONTROLLER_METHODS
        }
    });

    /**
     * Initializes the controller
     * @protected
     */
    ListPluginViewController.prototype.onInit = function() {
        if (PluginViewController.prototype.onInit) {
            PluginViewController.prototype.onInit.apply(this, arguments);
        }
        this._oViewSettingsDialog = null;
        this._oViewSettingsDialogFactory = null;
        this._oTablePersonalizationControl = null;
        this._sTableType = "mobile";
    };

    /**
     * Called when exiting controller
     * @protected
     */
    ListPluginViewController.prototype.onExit = function() {
        if (PluginViewController.prototype.onExit) {
            PluginViewController.prototype.onExit.apply(this, arguments);
        }

        this.saveUserPreferences();

        this._destroyTablePersonalizationControl(this._oTablePersonalizationControl);
        this._oTablePersonalizationControl = null;
    };

    ListPluginViewController.prototype._destroyTablePersonalizationControl = function(oPersoControl) {
        if (oPersoControl) {
            let oPersoDialog = oPersoControl.getTablePersoDialog();
            if (oPersoDialog) {
                oPersoDialog.destroy();
            }
            oPersoControl.destroy();
        }
    };

    /**
     * Returns the Column List type based on plugin configurations
     *
     * @param {object} Plugins configuration
     * @param {object} List configuration
     * @returns {sap.m.ListType} List type for table columns
     * @public
     */
    ListPluginViewController.prototype.getColumnListType = function(oConfiguration, oListConfiguration) {
        let sColumnListType = ListType.Navigation;
        if (PodUtility.isEmpty(oConfiguration.selectActionButtonId) &&
            PodUtility.isEmpty(oConfiguration.selectActionPageName)) {
            sColumnListType = ListType.Active;
        }
        if (oListConfiguration.allowMultipleSelection) {
            sColumnListType = ListType.Inactive;
        }
        return sColumnListType;
    };

    /**
     * Creates a Table based on plugin configurations
     *
     * @param {string} sTableId ID for <code>sap.m.Table</code> or <code>sap.ui.table.Table</code>
     * @param {string | object} vBindingPath binding path in model (i.e; "/Worklist" or {path: "/Worklist", ...} )
     * @param {object} oColumnListItemMetadata metadata for <code>sap.m.ColumnListItem</code> or <code>sap.ui.table.Column</code>
     * @param {object} oListConfiguration List configuration
     * <pre>
     *       oListConfiguration.tableType = "mobile" (default) or "grid"
     * </pre>
     * @param {object} oTableConfiguration metadata for Table
     * @param {object} aColumnConfiguration array of column configuration
     * <pre>
     *      aListColumnData[columnId].binding = "{ShopOrder}" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].label = "override label" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].width = "10em" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].metadata = {minScreenWidth="Tablet",demandPopin="true",hAlign="End", ..} (optional)
     *      aListColumnData[columnId].header = sap.ui.core.Control (optional, default is sap.m.Text)
     *      aListColumnData[columnId].columnListItem = sap.ui.core.Control (optional, default is sap.m.Text)
     * </pre>
     * @returns {sap.m.Table | sap.ui.table.Table} Table to render
     * @public
     */
    ListPluginViewController.prototype.createTable = function(sTableId, vBindingPath, oColumnListItemMetadata, oListConfiguration, oTableConfiguration, aColumnConfiguration) {
        let sImageSize = "medium";
        let oImageStyle = this.getImageIconStyleInformation();
        if (oImageStyle.imageStyle === "sapMesTableCellImageIconCompactButton") {
            sImageSize = "small";
        }

        InfoIconFormatter.init(this.getI18nResourceBundle(), sImageSize);

        // Remove columns from sorting
        let oListSortConfiguration = this._hideColumnFromSort(oListConfiguration);

        // initialize columns using sortOrder for later sorting
        this._initializeSortColumns(oListSortConfiguration);

        let sSelectionMode = ListMode.SingleSelectMaster;
        if (oListConfiguration.allowMultipleSelection) {
            sSelectionMode = ListMode.MultiSelect;
        }

        this._sTableType = oListConfiguration.tableType;

        let aListColumnData = this._getColumnListData(aColumnConfiguration);

        this._setColumnFieldnames(aColumnConfiguration);

        let oStatusIconControl = this.createStatusIconControl();
        if (oStatusIconControl) {
            if (!aListColumnData["STATUS_ICON"]) {
                aListColumnData["STATUS_ICON"] = {};
            }
            aListColumnData["STATUS_ICON"].columnListItem = oStatusIconControl;
        }

        let oInfoIconControl = this.createInfoIconControl();
        if (oInfoIconControl) {
            if (!aListColumnData["INFO"]) {
                aListColumnData["INFO"] = {};
            }
            aListColumnData["INFO"] = {
                columnListItem: oInfoIconControl
            };
        }

        let oOperationQtyControl = this.createOperationQtyControl();
        if (oOperationQtyControl) {
            aListColumnData["OPERATION_QTY"] = {
                columnListItem: oOperationQtyControl
            };
        }

        let bAlternateRowColors = true;
        if (oTableConfiguration && oTableConfiguration.alternateRowColors) {
            bAlternateRowColors = oTableConfiguration.alternateRowColors;
        }

        let bFixedLayout = false;
        if (oTableConfiguration && oTableConfiguration.fixedLayout) {
            bFixedLayout = oTableConfiguration.fixedLayout;
        }
        let aStickyHeaders = this.getStickyHeaders();
        if (!aStickyHeaders || aStickyHeaders.length === 0) {
            aStickyHeaders = [sap.m.Sticky.ColumnHeaders];
        }

        let oResourceBundle = this.getI18nResourceBundle();
        let oTableFactory = new TableFactory(oListConfiguration, aListColumnData, oResourceBundle);

        let oTableMetadata = {
            alternateRowColors: bAlternateRowColors,
            fixedLayout: bFixedLayout,
            mode: sSelectionMode,
            sticky: oTableConfiguration.stickyHeader ? aStickyHeaders : null,
            selectionChange: [this.onSelectionChangeEvent, this],
            itemPress: [this.onItemPressEvent, this]
        };
        if (typeof oTableConfiguration.growing !== "undefined") {
            oTableMetadata.growing = oTableConfiguration.growing;
        }
        if (typeof oTableConfiguration.growingThreshold !== "undefined") {
            oTableMetadata.growingThreshold = oTableConfiguration.growingThreshold;
        }
        if (typeof oTableConfiguration.growingScrollToLoad !== "undefined") {
            oTableMetadata.growingScrollToLoad = oTableConfiguration.growingScrollToLoad;
        }

        let oListItemMetadata = oColumnListItemMetadata;
        if (!oColumnListItemMetadata) {
            oListItemMetadata = {};
        }

        if (PodUtility.isEmpty(oListItemMetadata.vAlign)) {
            oListItemMetadata.vAlign = "Middle";
        }

        let sGlobalTableId = this.createId(sTableId);

        let oCheckTable = this.byId(sGlobalTableId);
        if (oCheckTable) {
            // destroy table if it exists to eliminate duplicate id issue
            oCheckTable.destroy();
        }

        // create table
        return oTableFactory.createTable(sGlobalTableId, vBindingPath, oTableMetadata, oListItemMetadata);
    };

    /*
     * Creates Array of column data to build Table with
     *
     * @param {object} aColumnConfiguration array of column configuration from plugin configuration:
     * @returns {Array} List containing column Configuration data
     * @deprecated use getColumnListData() instead
     * @private
     */
    ListPluginViewController.prototype._getColumnListData = function(aColumnConfiguration) {
        return this.getColumnListData(aColumnConfiguration);
    };

    /**
     * Creates Array of column data to build Table with
     *
     * @param {object} aColumnConfiguration array of column configuration from plugin configuration:
     * <pre>
     *      columnConfiguration: [
     *          {
     *              columnId: "SHOP_ORDER",
     *              mergeDuplicates: true,
     *              wrapping: false,
     *              hAlign: "Begin",
     *              vAlign: "Middle"
     *          }
     *      ]
     * </pre>
     * @returns {Array} List containing column Configuration data
     * <pre>
     *      aListColumnData[columnId].binding = "{ShopOrder}" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].label = "override label" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].width = "10em" (optional, default is in ResourceBundle)
     *      aListColumnData[columnId].metadata = {minScreenWidth="Tablet",demandPopin="true",hAlign="End", ..} (optional)
     *      aListColumnData[columnId].header = sap.ui.core.Control (optional, default is sap.m.Text)
     *      aListColumnData[columnId].columnListItem = sap.ui.core.Control (optional, default is sap.m.Text)
     * </pre>
     * @protected
     */
    ListPluginViewController.prototype.getColumnListData = function(aColumnConfiguration) {
        let aListColumnData = [];
        if (aColumnConfiguration && aColumnConfiguration.length > 0) {
            for (let i = 0; i < aColumnConfiguration.length; i++) {
                let sColumnId = aColumnConfiguration[i].columnId;
                aListColumnData[sColumnId] = {};
                if (aColumnConfiguration[i].label && aColumnConfiguration[i].label !== "") {
                    aListColumnData[sColumnId].label = aColumnConfiguration[i].label;
                }
                if (aColumnConfiguration[i].binding && aColumnConfiguration[i].binding !== "") {
                    aListColumnData[sColumnId].binding = aColumnConfiguration[i].binding;
                }
                if (aColumnConfiguration[i].width && aColumnConfiguration[i].width !== "") {
                    aListColumnData[sColumnId].width = aColumnConfiguration[i].width;
                }
                // Handle Custom Data Field Columns
                if (this._isCustomDataField(sColumnId)) {
                    aListColumnData[sColumnId] = this._assignCustomDataColumn(aColumnConfiguration[i]);
                }
                if (aColumnConfiguration[i].minScreenWidth && aColumnConfiguration[i].minScreenWidth !== "") {
                    aListColumnData[sColumnId].minScreenWidth = aColumnConfiguration[i].minScreenWidth;
                }
                if (aColumnConfiguration[i].popinHAlign && aColumnConfiguration[i].popinHAlign !== "") {
                    aListColumnData[sColumnId].popinHAlign = aColumnConfiguration[i].popinHAlign;
                }
                if (aColumnConfiguration[i].popinDisplay && aColumnConfiguration[i].popinDisplay !== "") {
                    aListColumnData[sColumnId].popinDisplay = aColumnConfiguration[i].popinDisplay;
                }
                if (aColumnConfiguration[i].vAlign && aColumnConfiguration[i].vAlign !== "") {
                    aListColumnData[sColumnId].vAlign = aColumnConfiguration[i].vAlign;
                }
                if (aColumnConfiguration[i].hAlign && aColumnConfiguration[i].hAlign !== "") {
                    aListColumnData[sColumnId].hAlign = aColumnConfiguration[i].hAlign;
                }
                if (typeof aColumnConfiguration[i].mergeDuplicates !== "undefined") {
                    aListColumnData[sColumnId].mergeDuplicates = aColumnConfiguration[i].mergeDuplicates;
                }
                if (typeof aColumnConfiguration[i].demandPopin !== "undefined") {
                    aListColumnData[sColumnId].demandPopin = aColumnConfiguration[i].demandPopin;
                }
                if (typeof aColumnConfiguration[i].wrapping !== "undefined") {
                    aListColumnData[sColumnId].wrapping = aColumnConfiguration[i].wrapping;
                }
                if (aColumnConfiguration[i].columnListItem) {
                    aListColumnData[sColumnId].columnListItem = aColumnConfiguration[i].columnListItem;
                }
                aListColumnData[sColumnId].hideLabel = aColumnConfiguration[i].hideLabel;
            }
        }
        return aListColumnData;
    };

    /*
     * Assigns the custom data field label/description and default width
     *
     * @param {object} aColumnConfiguration array of column configuration from plugin configuration:
     * @returns {object} containing column Configuration data
     * @private
     */
    ListPluginViewController.prototype._assignCustomDataColumn = function(aColumnConfiguration) {
        let oReturnColumnConfiguration = aColumnConfiguration;

        // Check if an override of the label exists, otherwise use description
        if (aColumnConfiguration.label && aColumnConfiguration.label !== "") {
            oReturnColumnConfiguration.label = aColumnConfiguration.label;
        } else {
            oReturnColumnConfiguration.label = aColumnConfiguration.description;
        }
        // Check if a width override exists, otherwise use default
        if (aColumnConfiguration.width && aColumnConfiguration.width !== "") {
            oReturnColumnConfiguration.width = aColumnConfiguration.width;
        } else {
            // Assign default custom data width
            oReturnColumnConfiguration.width = this._getCustomDataWidth();
        }

        return oReturnColumnConfiguration;
    };

    ListPluginViewController.prototype._getCustomDataWidth = function() {
        // Assign a default width if not found in the i18n
        let sCustomDataDefaultWidth = "11em";

        let oResourceBundle = this.getI18nResourceBundle();
        if (!oResourceBundle) {
            return sCustomDataDefaultWidth;
        }
        let sValue = oResourceBundle.getText("CUSTOM_DATA_COLUMN.WIDTH");
        if (PodUtility.isEmpty(sValue)) {
            return sCustomDataDefaultWidth;
        }
        return sValue;
    };

    /*
     * Determine if the field is a Custom Data Field
     * @param {string} the custom data column id to check
     * @returns {object} containing column Configuration data
     * @private
     */
    ListPluginViewController.prototype._isCustomDataField = function(sCustomDataField) {
        return this.isCustomDataField(sCustomDataField);
    };

    /**
     * Returns whether the input column is a custom data field
     *
     * @param {string} sCustomDataField Custom Data Field name
     * @returns {boolean} true if a custom data field, else false
     * @public
     */
    ListPluginViewController.prototype.isCustomDataField = function(sCustomDataField) {
        if (PodUtility.isNotEmpty(sCustomDataField)) {
            if (sCustomDataField.indexOf("ITEM.") > -1) {
                return true;
            } else if (sCustomDataField.indexOf("SHOP_ORDER.") > -1) {
                return true;
            }
        }
        return false;
    };

    /**
     * Returns the type of Table to create. To create a <code>sap.m.Table</code> return "mobile".
     * To create a <code>sap.ui.table.Table</code> return "grid".
     *
     * @returns {string} <code>sap.m.Table</code> or <code>sap.ui.table.Table</code>
     * @protected
     */
    ListPluginViewController.prototype.getTableType = function() {
        return this._sTableType;
    };

    /**
     * Returns the Sticky property for <code>sap.m.Table</code>.
     *
     * @returns {sap.m.Sticky[]} Sticky property or null (default)
     * @protected
     */
    ListPluginViewController.prototype.getStickyHeaders = function() {
        return null;
    };

    /**
     * Handles Selection action for Action / Page Select control
     *
     * @param {object} oConfiguration object containing "selectActionButtonId" or "selectActionPageName" property
     * @public
     */
    ListPluginViewController.prototype.handleSelectAction = function(oConfiguration) {
        if (PodUtility.isEmpty(oConfiguration.selectActionButtonId) &&
            PodUtility.isEmpty(oConfiguration.selectActionPageName)) {
            return;
        }
        // use debounce technique in case same call made very quickly
        if (this._vSelectTimerId) {
            clearTimeout(this._vSelectTimerId);
        }
        let that = this;
        this._vSelectTimerId = setTimeout(function() {
            if (PodUtility.isNotEmpty(oConfiguration.selectActionButtonId)) {
                that.executeActionButton(oConfiguration.selectActionButtonId);

            } else if (PodUtility.isNotEmpty(oConfiguration.selectActionPageName)) {
                that.navigateToPage(oConfiguration.selectActionPageName);
            }
        }, 125);
    };

    /**
     * Returns the selected row data
     *
     * @param {sap.m.Table | sap.ui.table.Table} oTable Table to get row data for
     * @returns {Array} Row data
     * @public
     */
    ListPluginViewController.prototype.getSelectedRowData = function(oTable) {
        let oSelectionData = [];
        if (!oTable) {
            return oSelectionData;
        }
        let i;
        let oSelectionModel;
        if (oTable.getSelectedIndices) {
            let aSelectedIndices = oTable.getSelectedIndices();
            for (i = 0; i < aSelectedIndices.length; i++) {
                let oContext = oTable.getContextByIndex(aSelectedIndices[i]);
                if (oContext) {
                    if (oContext.getObject) {
                        oSelectionModel = oContext.getObject();
                        if (oSelectionModel) {
                            oSelectionData[oSelectionData.length] = oSelectionModel;
                        }
                    } else {
                        oSelectionData[oSelectionData.length] = oContext;
                    }
                }
            }
        } else if (oTable.getSelectedItems) {
            let oSelections = oTable.getSelectedItems();
            if (oSelections && oSelections.length > 0) {
                for (i = 0; i < oSelections.length; i++) {
                    oSelectionModel = oSelections[i].getBindingContext().getObject();
                    if (oSelectionModel) {
                        oSelectionData[oSelectionData.length] = oSelectionModel;
                    }
                }
            }
        }
        return oSelectionData;
    };

    /**
     * Creates a Control to represent the status.
     * This is used primarily for the Worklist and operation list plugins
     * @returns {sap.ui.core.Control} A control for displaying the status
     * @protected
     */
    ListPluginViewController.prototype.createStatusIconControl = function() {
        return null;
    };

    /**
     * Creates a Control to represent the operation Quantity
     * This is used primarily by the operation list plugins
     * @returns {sap.ui.core.Control} A control for displaying the quantity
     * @protected
     */
    ListPluginViewController.prototype.createOperationQtyControl = function() {
        return null;
    };

    /**
     * Creates an Info Icon Control holding Info Icon buttons
     * @returns {sap.m.HBox} HBox containing info icon buttons
     * @public
     */
    ListPluginViewController.prototype.createInfoIconControl = function() {
        let oInfoIconControl = new HBox();

        oInfoIconControl.addItem(this._createBuyoffIconButton());

        oInfoIconControl.addItem(this._createDcIconButton());

        oInfoIconControl.addItem(this._createClIconButton());

        oInfoIconControl.addItem(this._createPsnIconButton());

        oInfoIconControl.addItem(this._createTlIconButton());

        oInfoIconControl.addItem(this._createWiIconButton());

        oInfoIconControl.addItem(this._createCaIconButton());

        return oInfoIconControl;
    };

    /*
     * Creates an Buyoff Info Icon Button
     * @returns {sap.m.Button} Buyoff button
     * @private
     */
    ListPluginViewController.prototype._createBuyoffIconButton = function() {
        return this.createIconButton("BUYOFF", this.onBuyoffIconPressed, this);
    };

    /*
     * Creates an Data Collection Info Icon Button
     * @returns {sap.m.Button} Data Collection button
     * @private
     */
    ListPluginViewController.prototype._createDcIconButton = function() {
        return this.createIconButton("DATA_COLLECTION", this.onDcIconPressed, this);
    };

    /*
     * Creates an Component List Info Icon Button
     * @returns {sap.m.Button} Component List button
     * @private
     */
    ListPluginViewController.prototype._createClIconButton = function() {
        return this.createIconButton("COMPONENT_LIST", this.onAssembleIconPressed, this);
    };

    /*
     * Creates an Collect Part Serial Number Info Icon Button
     * @returns {sap.m.Button} Part Serial Number button
     * @private
     */
    ListPluginViewController.prototype._createPsnIconButton = function() {
        return this.createIconButton("PARENT_SERIAL_NUMBER", this.onCollectPsnIconPressed, this);
    };

    /*
     * Creates an Tool list Info Icon Button
     * @returns {sap.m.Button} Tool list button
     * @private
     */
    ListPluginViewController.prototype._createTlIconButton = function() {
        return this.createIconButton("TOOL_LIST", this.onToolListIconPressed, this);
    };

    /*
     * Creates an Work Instruction Info Icon Button
     * @returns {sap.m.Button} Work Instruction button
     * @private
     */
    ListPluginViewController.prototype._createWiIconButton = function() {
        return this.createIconButton("WORK_INSTRUCTION", this.onWorkInstructionIconPressed, this);
    };

    /*
     * Creates an Change Alert Info Icon Button
     * @returns {sap.m.Button} Change Alert button
     * @private
     */
    ListPluginViewController.prototype._createCaIconButton = function() {
        return this.createIconButton("CHANGE_ALERT", this.onChangeAlertIconPressed, this);
    };

    /**
     * Creates an Info Icon Button
     *
     * @param {string} Information Icon Type
     * @param {function} fnOnPress function to call on press event
     * @param {object} fnContext object containing function fnOnPress
     * @protected
     */
    ListPluginViewController.prototype.createIconButton = function(sInfoIconType, fnOnPress, fnContext) {

        let oImageStyle = this.getImageIconStyleInformation();

        let oButton = new Button({
            tooltip: {
                path: "iconInfoRendererInfo",
                formatter: function(oInfo) {
                    return InfoIconFormatter.getIconTooltip(sInfoIconType, oInfo);
                }
            },
            visible: {
                path: "iconInfoRendererInfo",
                formatter: function(oInfo) {
                    return InfoIconFormatter.isIconVisible(sInfoIconType, oInfo);
                }
            },
            icon: {
                path: "iconInfoRendererInfo",
                formatter: function(oInfo) {
                    return InfoIconFormatter.getIcon(sInfoIconType, oInfo);
                }
            },
            press: [fnOnPress, fnContext]
        });
        oButton.addStyleClass(oImageStyle.imageStyle);
        oButton.addStyleClass("sapUiTinyMarginEnd");

        return oButton;
    };

    /**
     * Gets image icon style information for info icon buttons
     * @returns {object} with following information
     * <pre>
     *     {
     *         imageSize: sSize,
     *         imageStyle: sImageStyle
     *     }
     * </pre
     * @protected
     */
    ListPluginViewController.prototype.getImageIconStyleInformation = function() {
        if (!this._oImageIconStyleInfo) {
            let sImageStyle = "sapMesTableCellImageIconButton";
            let sSize = "2rem";
            let sContentDensityStyle = this.getContentDensityStyle();
            if (PodUtility.isNotEmpty(sContentDensityStyle) && sContentDensityStyle === "sapUiSizeCompact") {
                sSize = "1rem";
                sImageStyle = "sapMesTableCellImageIconCompactButton";
            }
            this._oImageIconStyleInfo = {
                "imageSize": sSize,
                "imageStyle": sImageStyle
            };
        }
        return this._oImageIconStyleInfo;
    };

    /**
     * Called when Buyoff Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onBuyoffIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Data Collection Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onDcIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Component List Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onAssembleIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Collect PSN Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onCollectPsnIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Tool List Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onToolListIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Work Instruction Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onWorkInstructionIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when Change Alert Info Icon pressed
     * @protected
     */
    ListPluginViewController.prototype.onChangeAlertIconPressed = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when select change occurs
     * @protected
     */
    ListPluginViewController.prototype.onSelectionChangeEvent = function(oEvent) {
        // to be implemented by sub-class
    };

    /**
     * Called when a item is pressed
     * @protected
     */
    ListPluginViewController.prototype.onItemPressEvent = function(oEvent) {
        // to be implemented by sub-class
    };

    ListPluginViewController.prototype._hideColumnFromSort = function(oListConfiguration) {
        let aNonVisibleSortColumns = ["ITEM_GROUP"];

        if (oListConfiguration && oListConfiguration.columns && oListConfiguration.columns.length > 0) {
            for (let i = 0; i < oListConfiguration.columns.length; i++) {
                for (let j = 0; j < aNonVisibleSortColumns.length; j++) {
                    if (aNonVisibleSortColumns[j] === oListConfiguration.columns[i].columnId) {
                        oListConfiguration.columns[i].showSort = false;
                    }
                }
            }
        }

        return oListConfiguration;
    };

    /*
     * Internal function to initialize the sort columns
     * @private
     */
    ListPluginViewController.prototype._initializeSortColumns = function(oListConfiguration) {
        let aSortOrder = [];
        if (oListConfiguration && oListConfiguration.columns && oListConfiguration.columns.length > 0) {
            for (let i = 0; i < oListConfiguration.columns.length; i++) {
                if (oListConfiguration.columns[i].sortOrder && oListConfiguration.columns[i].sortOrder > 0) {
                    let oColumnData = oListConfiguration.columns[i];
                    oColumnData.fieldName = this._getColumnFieldName(oListConfiguration.columns[i].columnId);
                    oColumnData.sortDescending = false;
                    aSortOrder[aSortOrder.length] = oColumnData;
                }
            }
            if (aSortOrder.length > 1) {
                aSortOrder.sort(function(a, b) {
                    return a.sortOrder - b.sortOrder;
                });
            }
        }
        this._aListColumnsSortOrder = aSortOrder;
    };

    /**
     * Function called to sort the input list data
     *
     * @param {Array} List data
     * @param {boolean} bDescending true to sort in descending order, else false
     * @protected
     */
    ListPluginViewController.prototype.sortListByColumnSortOrder = function(aListData, bDescending) {
        //TODO pass a comparator function from the actual plugin controller to this to replace this default comparator below  if it is not null.
        if (aListData && aListData.length > 0) {
            let that = this;
            aListData.sort(function(a, b) {

                if (bDescending) {
                    let tmp = b;
                    b = a;
                    a = tmp;
                }
                return that.sortComparator(a, b);
            });
        }
    };

    /**
     * Comparator to sort two javascript objects with preloaded column sort order
     * @param {object} a first object
     * @param {object} b second object
     * @protected
     */
    ListPluginViewController.prototype.sortComparator = function(a, b) {

        let oListColumnSortOrder = this.getListColumnSortOrder();
        if (!oListColumnSortOrder || oListColumnSortOrder.length === 0) {
            return SORT_KEEP_EXISTING_ORDER;
        }

        let oProperty1, oProperty2, sFieldName;
        let comparison = SORT_KEEP_EXISTING_ORDER;

        let sPluginName = this.getPluginName();
        for (let i = 0; i < oListColumnSortOrder.length; i++) {
            sFieldName = oListColumnSortOrder[i].fieldName;

            if (!sFieldName) {
                continue;
            }
            // remove this if block when the plugin specific comparator is passed in.
            if (sPluginName === "sap.dm.dme.plugins.operationListPlugin") {
                if (sFieldName === "operationStepId") {
                    sFieldName = "stepId";
                }
            }
            oProperty1 = a[sFieldName];
            oProperty2 = b[sFieldName];

            if (!oProperty1 && oProperty2) {
                comparison = SORT_A_BEFORE_B;
            } else if (!oProperty2 && oProperty1) {
                comparison = SORT_B_BEFORE_A;
            } else if (typeof oProperty1 === "string" && typeof oProperty2 === "string") {
                comparison = oProperty1.localeCompare(oProperty2);
            } else if (typeof oProperty1 === "number" && typeof oProperty2 === "number") {
                if (oProperty1 > oProperty2) {
                    comparison = SORT_B_BEFORE_A;
                } else if (oProperty2 > oProperty1) {
                    comparison = SORT_A_BEFORE_B;
                }
            }

            if (comparison !== 0) {
                return comparison;
            }
        }

        return SORT_KEEP_EXISTING_ORDER;
    };

    /*
     * Returns the data field name for the input columns binding
     * definition inside the i18n property file.
     * @param {string} Name of column (i.e.; OPERATION or ITEM_REV)
     * @returns {string} data field name for column
     * @deprecated use getColumnFieldName() instead
     * @private
     */
    ListPluginViewController.prototype._getColumnFieldName = function(sColumn) {
        return this.getColumnFieldName(sColumn)
    };

    /**
     * Returns the data field name for the input columns binding
     * definition inside the i18n property file.  It looks
     * in the bundle for a key of the form sColumn.BINDING
     * (i.e.; OPERATION.BINDING) and returns the value inside the {}
     * characters (i.e.; for {operation} returns operation).
     * @param {string} Name of column (i.e.; OPERATION or ITEM_REV)
     * @returns {string} data field name for column
     * @protected
     */
    ListPluginViewController.prototype.getColumnFieldName = function(sColumn) {
        // If this is a custom data field, return
        if (this._isCustomDataField(sColumn)) {
            return null;
        }
        let oResourceBundle = this.getI18nResourceBundle();
        if (!oResourceBundle) {
            return null;
        }
        let sValue = oResourceBundle.getText(sColumn + ".BINDING");
        if (PodUtility.isEmpty(sValue)) {
            return null;
        }
        sValue = sValue.substring(1, sValue.indexOf("}"));
        return sValue;
    };

    /*
     * Internal function to return the user preference configuration.
     * @private
     */
    ListPluginViewController.prototype._getUserPreferencesConfig = function() {
        let ownerComponent = this.getOwnerComponent();
        if (ownerComponent) {
            return ownerComponent.getUserPreferencesConfig();
        }
        return null;
    };

    /*
     * Internal function to return the user preference sort order data.
     * @private
     */
    ListPluginViewController.prototype._getSortOrderId = function() {
        let oUserPreferencesConfig = this._getUserPreferencesConfig();
        if (oUserPreferencesConfig) {
            return oUserPreferencesConfig.sortOrderId;
        }
        return undefined;
    };

    /*
     * Internal function to return the user preference column order data.
     * @private
     */
    ListPluginViewController.prototype._getColumnOrderId = function() {
        let oUserPreferencesConfig = this._getUserPreferencesConfig();
        if (oUserPreferencesConfig) {
            return oUserPreferencesConfig.columnOrderId;
        }
        return undefined;
    };

    /*
     * Internal function to update table sort order.
     * @private
     */
    ListPluginViewController.prototype.updateTableSortOrder = function() {
        if (this._oViewSettingsDialogFactory) {
            let that = this;
            setTimeout(function() {
                that._oViewSettingsDialogFactory.updateTable();
            }, 125);
        }
    };

    /**
     * Function will add column order settings dialog
     *
     * @param {object} oListConfiguration List configuration data
     * @param {object} oListTable List Table
     * @param {string} sSettingsButtonId Id of button that is pressed to launch dialog
     * @public
     */
    ListPluginViewController.prototype.addColumnOrderSettings = function(oListConfiguration, oListTable, sSettingsButtonId) {
        if (oListConfiguration.tableType === "mobile" && oListConfiguration.allowOperatorToChangeColumnSequence) {
            let sColumnOrderId = this._getColumnOrderId();
            let oColumnOrderData = {};
            if (PodUtility.isNotEmpty(sColumnOrderId)) {
                oColumnOrderData = this.getUserPreference(sColumnOrderId);
            }

            let oButton = this.getView().byId(sSettingsButtonId);
            if (oButton) {
                oButton.setVisible(true);
                oButton.attachPress(this.onColumOrderSettingsButtonPressed, this);
            }

            let sPluginName = this.getPluginName();

            // init and activate controller
            let oGroupingModel = new JSONModel({
                hasGrouping: false
            });
            this.getView().setModel(oGroupingModel, "Grouping");

            let oTablePersoService = new TablePersoService(sPluginName, oListTable);
            if (oColumnOrderData) {
                oTablePersoService.setColumnOrderData(oColumnOrderData);
            }
            this._oTablePersonalizationControl = new TablePersoController({
                table: oListTable,
                componentName: sPluginName,
                persoService: oTablePersoService
            });

            this._oTablePersonalizationControl.activate();

            // This triggers a re-rendering which will create personalization dialog
            oListTable.invalidate();
        }
    };

    /**
     * Function will add sort order settings dialog
     *
     * @param {object} oListConfiguration List configuration data
     * @param {object} oListTable List Table
     * @param {string} sSettingsButtonId Id of button that is pressed to launch dialog
     * @param {object} oGroupSorter Optional Sorter defined with grouping
     * @public
     */
    ListPluginViewController.prototype.addSortOrderSettings = function(oListConfiguration, oListTable, sSettingsButtonId, oGroupSorter) {
        if (oListConfiguration.tableType === "mobile" && oListConfiguration.allowOperatorToSortRows) {
            let sSortOrderId = this._getSortOrderId();
            let oSortOrderData = {};
            if (PodUtility.isNotEmpty(sSortOrderId)) {
                oSortOrderData = this.getUserPreference(sSortOrderId);
            }

            let oButton = this.getView().byId(sSettingsButtonId);
            if (oButton) {
                oButton.setVisible(true);
                oButton.attachPress(this.onSortOrderSettingsButtonPressed, this);
            }
            let oResourceBundle = this.getI18nResourceBundle();
            this._oViewSettingsDialogFactory = new ViewSettingsDialogFactory(oListTable, oListConfiguration, oResourceBundle, oGroupSorter);
            if (oSortOrderData) {
                this._oViewSettingsDialogFactory.setViewSettings(oSortOrderData);
            }

            this._oViewSettingsDialog = this._oViewSettingsDialogFactory.createDialog();
            this._oViewSettingsDialog.attachConfirm(this.onViewSettingsDialogConfirm, this);
        }
    };

    /*
     * Internal function to update table with column order settings.
     * @private
     */
    ListPluginViewController.prototype.onViewSettingsDialogConfirm = function(oEvent) {
        let oSortItem = oEvent.getParameter("sortItem");
        if (!oSortItem) {
            return;
        }
        let bDescending = oEvent.getParameter("sortDescending");
        if (typeof bDescending === "undefined" || bDescending === null) {
            bDescending = false;
        }
        this.updateListColumnSortOrder(oSortItem.getKey(), bDescending);
    };

    /*
     * Internal function to display sort order dialog.
     * @private
     */
    ListPluginViewController.prototype.onSortOrderSettingsButtonPressed = function(oEvent) {
        if (this._oViewSettingsDialog) {
            syncStyleClass("sapUiSizeCompact", this.getView(), this._oViewSettingsDialog);
            this._oViewSettingsDialog.open();
        }
    };

    /*
     * Internal function to display column order dialog.
     * @private
     */
    ListPluginViewController.prototype.onColumOrderSettingsButtonPressed = function(oEvent) {
        if (this._oTablePersonalizationControl) {
            this._oTablePersonalizationControl.openDialog();
        }
    };

    /*
     * Internal function to get list column sort order.
     * @private
     */
    ListPluginViewController.prototype.getListColumnSortOrder = function() {
        return this._aListColumnsSortOrder;
    };

    /*
     * Internal function to set list column sort order.
     * @private
     */
    ListPluginViewController.prototype.setListColumnSortOrder = function(aListColumnsSortOrder) {
        this._aListColumnsSortOrder = aListColumnsSortOrder;
    };

    /*
     * Internal function to set column field names from i18n bundle
     * @private
     */
    ListPluginViewController.prototype._setColumnFieldnames = function(aColumnConfiguration) {
        this._aColumnFieldNames = [];
        for (let i = 0; i < aColumnConfiguration.length; i++) {
            this._aColumnFieldNames[this._aColumnFieldNames.length] = {
                "columnId": aColumnConfiguration[i].columnId,
                "fieldName": this._getColumnFieldName(aColumnConfiguration[i].columnId)
            };
        }
    };

    /*
     * Internal function to get column field names
     * @private
     */
    ListPluginViewController.prototype._getColumnFieldnames = function() {
        return this._aColumnFieldNames;
    };

    /*
     * Internal function to find column id based on field names
     * @private
     */
    ListPluginViewController.prototype._findColumnIdForFieldname = function(sFieldName) {
        let aColumnFieldNames = this._getColumnFieldnames();
        for (let i = 0; i < aColumnFieldNames.length; i++) {
            if (aColumnFieldNames[i].fieldName === sFieldName) {
                return aColumnFieldNames[i].columnId;
            }
        }
        return null;
    };

    /*
     * Internal function to find sort order based on field name
     * @private
     */
    ListPluginViewController.prototype._findSortOrderForFieldname = function(sFieldName) {
        let aList = this.getListColumnSortOrder();
        if (!aList || aList.length === 0) {
            return -1;
        }
        for (let i = 0; i < aList.length; i++) {
            if (aList[i].fieldName === sFieldName) {
                return aList[i].sortOrder;
            }
        }
        return -1;
    };

    /*
     * Internal function to update sort order based on field name, and order
     * @private
     */
    ListPluginViewController.prototype._updateSortOrderForFieldname = function(sFieldName, bDescending, iOldSort) {
        let aList = this.getListColumnSortOrder();
        if (!aList || aList.length === 0) {
            return;
        }
        for (let i = 0; i < aList.length; i++) {
            if (aList[i].fieldName === sFieldName) {
                aList[i].sortOrder = 1;
            } else if (aList[i].sortOrder === 1) {
                aList[i].sortOrder = iOldSort;
            }
            aList[i].sortDescending = bDescending;
        }
    };

    /*
     * Internal function to reset sort order based on field name, and order
     * @private
     */
    ListPluginViewController.prototype._resetSortOrderByFieldname = function(sFieldName, bDescending) {
        let sColumnId = this._findColumnIdForFieldname(sFieldName);
        let aList = [];
        if (PodUtility.isNotEmpty(sColumnId)) {
            aList[0] = {
                "columnId": sColumnId,
                "fieldName": sFieldName,
                "sequence": 10,
                "sortDescending": bDescending,
                "sortOrder": 1
            };
        }
        this.setListColumnSortOrder(aList);
    };

    /*
     * Internal function to update column order based on field name, and order
     * @private
     */
    ListPluginViewController.prototype.updateListColumnSortOrder = function(sFieldName, bDescending) {

        let iOldSort = this._findSortOrderForFieldname(sFieldName);
        if (iOldSort > 0) {
            this._updateSortOrderForFieldname(sFieldName, bDescending, iOldSort);
        } else {
            this._resetSortOrderByFieldname(sFieldName, bDescending);
        }

        let aList = this.getListColumnSortOrder();
        if (aList.length > 1) {
            aList.sort(function(a, b) {
                if (a.sortOrder > b.sortOrder) {
                    return 1;
                } else if (a.sortOrder < b.sortOrder) {
                    return -1;
                }
                return 0;
            });
        }
    };

    /*
     * Internal function to save user preferences
     * @private
     */
    ListPluginViewController.prototype.saveUserPreferences = function() {
        let sSortOrderId = this._getSortOrderId();
        if (PodUtility.isNotEmpty(sSortOrderId)) {
            if (this._oViewSettingsDialogFactory) {
                let oSortOrderData = this._oViewSettingsDialogFactory.getViewSettings();
                if (oSortOrderData) {
                    this.setUserPreference(sSortOrderId, oSortOrderData);
                }
            }
        }

        let sColumnOrderId = this._getColumnOrderId();
        if (PodUtility.isNotEmpty(sColumnOrderId)) {
            if (this._oTablePersonalizationControl) {
                let oTablePersoService = this._oTablePersonalizationControl.getPersoService();
                if (oTablePersoService) {
                    let oColumnOrderData = oTablePersoService.getColumnOrderData();
                    if (oColumnOrderData) {
                        this.setUserPreference(sColumnOrderId, oColumnOrderData);
                    }
                }
            }
        }
    };

    /**
     * Return the TableResizeHandler
     *
     * @return sap.dm.dme.podfoundation.handler.TableResizeHandler
     * @public
     */
    ListPluginViewController.prototype.getTableResizeHandler = function() {
        if (!this._oTableResizeHandler) {
            this._oTableResizeHandler = new TableResizeHandler(this.getPodController(), this);
        }
        return this._oTableResizeHandler;
    };

    /**
     * This sets up listeners for Table resize events when a horizontal scrollbar
     * will be used for the table.  It is required to resize the header to match
     * the width of the table and columns when the scroll changes or in the
     * case where a splitter is resized and the plugin is in a split pane.
     *
     * @param {sap.m.Table} oScrollContainer containing Table
     * @param {string} id of ScrollContainer containing Table, else null
     * @param {int} Optional throttle delay before function called to set table header width (default is 1000 milliseconds)
     * @public
     */
    ListPluginViewController.prototype.initializeTableResizeHandler = function(oTable, sScrollContainerId, iThrottleDelay) {
        this.getTableResizeHandler().initializeTableResizeHandler(oTable, sScrollContainerId, iThrottleDelay);
    };

    return ListPluginViewController;
});