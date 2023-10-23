sap.ui.define([
    'sap/ui/base/Object',
    'sap/ui/core/Fragment',
    "sap/ui/core/Control",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/SearchField',
    "sap/m/Text",
    "sap/m/Label",
    "sap/ui/table/Column",
    "sap/dm/dme/controller/ListFilter",
], function(BaseObject, Fragment, Control, JSONModel, Token, SearchField, Text, Label, Column, ListFilter) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.valuehelpdialog.ValueHelpDialogBase", {

        /**
         * Creates and initializes a value help dialog with a list filter.
         * @param {string}                          sId browse ID used to construct base ID of a fragment;
         * 
         * @param {object}                          mSettings browse settings;
         * @param {sap.ui.model.Model}              mSettings.oModel Model used to retrieve browse data from backend. This
         * need only be provided if the parent view model uses a backend data source that does not provide the browsed object.
         * @param {string}                          mSettings.sFragmentName name of a fragment that contains dialog UI structure;
         * @param {sap.ui.core.Element}             mSettings.oParentControl parent control; browse dialog is set as dependent to it;
         * @param {function}                        mSettings.fnSelectionCallback callback function called when user selects item in a list;
         * @param {object}                          mSettings.aColumns array of column settings including label, template and width
         * @param {string || sap.ui.core.Control}   mSettings.aColumn[].column column label text string or column header control
         * @param {string || sap.ui.core.Control}   mSettings.aColumn[].template column item text binding path or column item control
         * @param {string}                          mSettings.aColumn[].width column width
         * @param {sap.ui.core.HorizontalAlign}     mSettings.aColumn[].hAlign horizontal alignment of the column
         * @param {object}                          mSettings.oFilterSettings init settings for the list filter;
         * @param {sap.ui.model.Filter}             mSettings.oFilterSettings.oDefaultFilter default filter
         * All other filter settings as defined in @sap.dm.dme.controller.ListFilter
         * @param {object}                          mSettings.oDialogSettings setting model data for dialog properties
         * 
         * @param {sap.m.Token[]}                   aSelectedTokens a list of selected tokens when open dialog
         */
        constructor: function(sId, mSettings, aSelectedTokens) {
            this._sBaseId = mSettings.oParentControl.getId() + "--" + sId;
            this._oParentControl = mSettings.oParentControl;
            this._fnSelectionCallback = mSettings.fnSelectionCallback;

            this._oBasicSearchField = new SearchField({
                showSearchButton: false,
                liveChange: this.onFilterBarSearch.bind(this)
            });

            this._aColumns = mSettings.aColumns;
            this._oFilterSettings = mSettings.oFilterSettings;

            Fragment.load({
                name: mSettings.sFragmentName,
                controller: this
            }).then(function(oValueHelpDialog) {
                this._oValueHelpDialog = oValueHelpDialog;
                this._oValueHelpDialog.getFilterBar().setBasicSearch(this.getBasicSearchField());
                this._oParentControl.addDependent(this._oValueHelpDialog);
                this.populateSelectItems();
                this.initDialogSettingsModel(mSettings.oDialogSettings);

                if (mSettings.oModel) {
                    this._oValueHelpDialog.setModel(mSettings.oModel);
                }

                this._initTableColumns(this._aColumns);
                this._initSelection(aSelectedTokens);

                this._oValueHelpDialog.open();
            }.bind(this));
        },

        /**
         * Initialize result table columns according to the settings
         * @param {object[]} aColumns column settings
         * @param {string || sap.ui.core.Control} aColumn[].column column label text string or column header control
         * @param {string || sap.ui.core.Control} aColumn[].template column item text binding path or column item control
         * @param {string} aColumn[].width column width
         * @param {sap.ui.core.HorizontalAlign} aColumn[].hAlign horizontal alignment of the column
         */
        _initTableColumns: function(aColumns) {
            this.getValueHelpDialog().getTableAsync().then(function(oTable) {
                aColumns.forEach(oCol => {
                    let oNewColumn;
                    if (oCol instanceof Column) {
                        oNewColumn = oCol;
                    } else {
                        oNewColumn = this._createNewColumn(oCol);
                    }

                    oTable.addColumn(oNewColumn);
                });
                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", this._oFilterSettings.sListBindingPath);
                    oTable.getBinding("rows").attachDataReceived(this._updateTableSelectedItemsRendering.bind(this, this._oValueHelpDialog, true));
                    oTable.attachRowsUpdated(this._updateTableSelectedItemsRendering.bind(this, this._oValueHelpDialog, true));
                }
                this._oValueHelpDialog.update();
            }.bind(this));
        },

        _createNewColumn: function(oCol) {
            let oLabel, oTemplate;
            if (typeof(oCol.label) === "string") {
                oLabel = new Label({
                    text: oCol.label
                });
            } else if (oCol.label instanceof Control) {
                oLabel = oCol.label.clone();
            }

            if (typeof(oCol.template) === "string") {
                oTemplate = new Text({
                    text: `{${oCol.template}}`
                })
            } else if (oCol.template instanceof Control) {
                oTemplate = oCol.template.clone();
            }

            return new Column({
                label: oLabel,
                template: oTemplate,
                width: oCol.width ? oCol.width : "",
                hAlign: oCol.hAlign ? oCol.hAlign : "Begin"
            });
        },

        /**
         * Initialize selection of result table and multiInput tokens of the dialog at open
         * @param {sap.m.Tokens[]} aSelectedTokens  selected token controls
         */
        _initSelection: function(aSelectedTokens) {
            let aTokenListToAdd = [];
            if (aSelectedTokens && aSelectedTokens.length > 0) {
                aSelectedTokens.forEach(function(aToken) {
                    let oToken = new Token({
                        key: aToken.key,
                        text: aToken.text
                    });
                    aTokenListToAdd.push(oToken);
                })
                this._oValueHelpDialog.setTokens(aTokenListToAdd);
            }
            this._oValueHelpDialog._getTokenizer().attachTokenDelete(this._updateTableSelectedItemsRendering.bind(this, this._oValueHelpDialog, false));
        },

        /**
         * Update Table's Rendering of selected items
         * @param {sap.ui.comp.valuehelpdialog.ValueHelpDialog} oValueHelpDialog 
         * @param {boolean} bSelected flag shows if the row should be selected or deselected
         * @param {sap.ui.base.Event} oEvent 
         */
        _updateTableSelectedItemsRendering: function(oValueHelpDialog, bSelected, oEvent) {
            let _aTokens;
            if (oEvent.getId() === "tokenDelete") {
                _aTokens = oEvent.getParameter("tokens");
            } else {
                oValueHelpDialog.update();
                _aTokens = oValueHelpDialog._getTokenizer().getTokens();
            }
            let oRows = oValueHelpDialog._oTable.getBinding("rows");
            if (oRows && oRows.getContexts() && _aTokens.length > 0) {
                if (bSelected) {
                    oValueHelpDialog._oTable.clearSelection();
                }
                let oTableContexts = oRows.getContexts();
                this._updateTableSelectionInterval(_aTokens, oTableContexts, oValueHelpDialog, bSelected);
            }
        },

        /**
         * Update selection of items in table
         * @param {sap.m.Token[]} aTokens updated tokens
         * @param {object[]} aTableContexts contexts of table
         * @param {sap.ui.comp.ValueHelpDialog} oValueHelpDialog value help dialog control
         * @param {boolean} bSelected indicates selection or deselection
         */
        _updateTableSelectionInterval: function(aTokens, aTableContexts, oValueHelpDialog, bSelected) {
            aTokens.forEach(function(aItem) {
                aTableContexts.some(function(oTableContext) {
                    let oRow = oTableContext.getObject();
                    if (oRow[oValueHelpDialog.getKey()] === aItem.getKey()) {
                        if (bSelected) {
                            oValueHelpDialog._oSelectedItems.add(oRow[oValueHelpDialog.getKey()], oRow);
                            oValueHelpDialog._oTable.addSelectionInterval(oTableContext.iIndex, oTableContext.iIndex);
                        } else {
                            oValueHelpDialog._oTable.removeSelectionInterval(oTableContext.iIndex, oTableContext.iIndex);
                        }
                        return true;
                    }
                })
            })
        },

        /**
         * Get the value help dialog control
         * @returns {sap.ui.comp.ValueHelpDialog}
         */
        getValueHelpDialog: function() {
            return this._oValueHelpDialog;
        },

        /**
         * Get the basic searchfield control
         * @returns {sap.m.SearchField}
         */
        getBasicSearchField: function() {
            return this._oBasicSearchField;
        },

        /**
         * Triggers a list filtering on filter bar's search live value change.
         */
        onFilterBarSearch: function() {
            if (!this._oListFilter) {
                this._oListFilter = this.getListFilter(this.extendFilterSettings(this._oFilterSettings));
            }
            let sSearchQuery = this.getBasicSearchField().getValue().toUpperCase();
            this._oListFilter.filterBySearchValue(sSearchQuery);
        },

        /**
         * Triggers a list filtering on filter bar control's value change.
         */
        onFilterBarChange: function() {
            if (!this._oListFilter) {
                this._oListFilter = this.getListFilter(this.extendFilterSettings(this._oFilterSettings));
            }
            let vExternalFilter = this.getExternalFilter();
            this._oListFilter.filterByFilterBar(vExternalFilter);
        },

        /**
         * Clears all filter values when the user presses the Clear button.
         */
        onFilterBarClear: function() {
            if (!this._oListFilter) {
                this._oListFilter = this.getListFilter(this.extendFilterSettings(this._oFilterSettings));
            }
            this._oListFilter.clearFilters();
        },

        /**
         * Call the callback function when valuehelp ok button is pressed (multi selection) or item is pressed (single selection)
         */
        onValueHelpOkPress: function() {
            let aSelectedItems = this.getValueHelpDialog()._oSelectedItems.getModelData();

            this.getValueHelpDialog().close();
            if (typeof(this._fnSelectionCallback) === "function") {
                this._fnSelectionCallback(aSelectedItems);
                this._fnSelectionCallback = null;
            }
        },

        /**
         * handler of value help cancel button pressed
         */
        onValueHelpCancelPress: function() {
            this.getValueHelpDialog().close();
        },

        onValueHelpAfterClose: function() {
            this.getValueHelpDialog().destroy();
        },

        /**
         * returns a listFilter using base class
         */
        getListFilter: function(mFilterSettings) {
            return new ListFilter(mFilterSettings);
        },

        /**
         * Extends filter settings with the common data needed for ListFilter instantiation
         */
        extendFilterSettings: function(oFilterSettings) {
            oFilterSettings.oListBinding = this.getListBinding();
            oFilterSettings.oFilterBar = this.getFilterBar();

            if (!oFilterSettings.oFilterBar) {
                oFilterSettings.sLiveSearchFieldId = this.getBasicSearchField().getId();
            }

            return oFilterSettings;
        },

        /**
         * Returns result table items binding. Result table should always exist.
         */
        getListBinding: function() {
            return this.getValueHelpDialog().getTable().getBinding("rows");
        },

        /**
         * Returns filter bar control by ID if it exists.
         */
        getFilterBar: function() {
            return this.getValueHelpDialog().getFilterBar()
        },

        /**
         * Initialize and set a dialog settings model after dialog constructed
         */
        initDialogSettingsModel: function(oDialogSettingsModel) {
            this.getValueHelpDialog().setModel(new JSONModel(oDialogSettingsModel), "dialogSettingsModel");
        },

        /**
         * Creates non standard filters. Return value is a single instance or an array of sap.m.Filter.
         * This method is not necessary to override. Only if this functionality is needed.
         * @abstract
         */
        getExternalFilter: function() {
            return null;
        },

        /**
         * Creates models with items of corresponding Select controls.
         * This method is not necessary to override. Only if this functionality is needed.
         * @abstract
         */
        populateSelectItems: function() {
            return null;
        },

    });
});