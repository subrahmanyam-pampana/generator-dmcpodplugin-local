sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/controller/ListFilter",
    "sap/ui/model/json/JSONModel",
    "sap/base/strings/formatMessage"
], function(BaseObject, ListFilter, JSONModel, FormatMessage) {
    "use strict";

    let VIEW_MODEL_NAME = "viewModel";
    return BaseObject.extend("sap.dm.dme.controller.BrowseBase", {

        formatMessage: FormatMessage,

        /**
         * Creates and initializes a dialog and a list filter.
         * @param {string} sId browse ID used to construct base ID of a fragment;
         * @param {object} mSettings browse settings;
         * @param {sap.ui.model.Model} mSettings.oModel Model used to retrieve browse data from backend. This
         * need only be provided if the parent view model uses a backend data source that does not provide the browsed object.
         * @param {string} mSettings.sFragmentName name of a fragment that contains dialog UI structure;
         * @param {sap.ui.core.Element} mSettings.oParentControl parent control; browse dialog is set as dependent to it;
         * @param {string} mSettings.sDefaultSearchValue value placed in a live search field and a list is filtered by it initially;
         * @param {function} mSettings.fnSelectionCallback callback function called when user selects item in a list;
         * @param {object} mSettings.oFilterSettings init settings for the list filter;
         * @param {string} mSettings.oFilterSettings.sResultTableId result table ID; default: resultTable;
         * @param {string} mSettings.oFilterSettings.sFilterBarId filter bar ID; default: filterBar;
         * @param {string} mSettings.oFilterSettings.sSearchFieldId search field ID; default: searchField; value ignored if filter bar control exists;
         * @param {sap.ui.model.Filter} mSettings.oFilterSettings.oDefaultFilter default filter
         * All other filter settings as defined in @sap.dm.dme.controller.ListFilter
         */
        constructor: function(sId, mSettings) {
            this._oParentControl = mSettings.oParentControl;
            this._fnSelectionCallback = mSettings.fnSelectionCallback;
            this._sBaseId = mSettings.oParentControl.getId() + "--" + sId;
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, mSettings.sFragmentName, this);
            if (mSettings.oModel) {
                this._oDialog.setModel(mSettings.oModel);
            }
            this._oParentControl.addDependent(this._oDialog);
            this._oListFilter = this.getListFilter(this.extendFilterSettings(mSettings.oFilterSettings));
            this.populateSelectItems();
            this.performDefaultFiltering(mSettings.sDefaultSearchValue);
            this.hideFilterBar(mSettings.bHideFilterBar);
            this._oDialog.open();
            this.createViewModel();
        },

        /**
         * Create a new JSON view model for storing view modification flags and properties,
         * like button's enablement
         */
        createViewModel: function() {
            this.getDialog().setModel(new JSONModel({
                listLength: 0
            }), VIEW_MODEL_NAME);
        },

        /**
         * @returns The JSON view model - model that stores view modification flags and properties,
         * like button's enablement
         */
        getViewModel: function() {
            return this.getDialog().getModel(VIEW_MODEL_NAME);
        },

        hideFilterBar: function(bHide) {
            if (bHide) {
                this.byId("filterBar").setVisible(false);
            }
        },
        /**
         * returns a listFilter using base class
         */
        getListFilter: function(mFilterSettings) {
            return new ListFilter(mFilterSettings);
        },

        /**
         * Creates models with items of corresponding Select controls.
         * This method is not necessary to override. Only if this functionality is needed.
         * @abstract
         */
        populateSelectItems: function() {
            return null;
        },

        /**
         * Creates selection result object with data from selected list item binding.
         * @abstract
         */
        createResultData: function(oBindingContext, oClickedListItem) {
            return null;
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
         * Extends filter settings with the common data needed for ListFilter instantiation
         */
        extendFilterSettings: function(oFilterSettings) {
            oFilterSettings.oListBinding = this.getListBinding(oFilterSettings.sResultTableId);
            oFilterSettings.oFilterBar = this.getFilterBar(oFilterSettings.sFilterBarId);

            if (!oFilterSettings.oFilterBar) {
                oFilterSettings.sLiveSearchFieldId = this.getLiveSearchFieldFullId(oFilterSettings.sSearchFieldId)
            }

            return oFilterSettings;
        },

        /**
         * Returns filter bar control by ID if it exists.
         */
        getFilterBar: function(sFilterBarId) {
            return this.byId(sFilterBarId || "filterBar");
        },

        /**
         * Returns result table items binding. Result table should always exist.
         */
        getListBinding: function(sResultTableId) {
            return this.byId(sResultTableId || "resultTable").getBinding("items");
        },

        /**
         * Returns live search field full ID.
         */
        getLiveSearchFieldFullId: function(sSearchFieldId) {
            return this._getFullId(sSearchFieldId || "searchField");
        },

        /**
         * Returns internal dialog control instance.
         */
        getDialog: function() {
            return this._oDialog;
        },

        /**
         * Handles the list item selection event. Triggers selection callback.
         */
        onSelect: function(oEvent) {
            let oClickedListItem = oEvent.getParameter("listItem");
            let oBindingContext = oClickedListItem.getBindingContext();
            let oSelectedEntity = this.createResultData(oBindingContext, oClickedListItem);
            this._oDialog.close();
            if (this._fnSelectionCallback) {
                this._fnSelectionCallback(oSelectedEntity);
                this._fnSelectionCallback = null; // prevent multiple selection on multiple rows click during dialog close process
            }
        },

        /**
         * Handles the selection cancel event on pressing Cancel button
         */
        onCancel: function() {
            this._oDialog.close();
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onClose: function() {
            this._oParentControl.removeDependent(this._oDialog);
            this._oDialog.destroy();
            this._oListFilter.destroy();
            this.destroy();
        },

        /**
         * Triggers a list filtering on filter bar control's value change.
         */
        onFilterBarChange: function() {
            let vExternalFilter = this.getExternalFilter();
            this._oListFilter.filterByFilterBar(vExternalFilter);
        },

        /**
         * Triggers a list filtering on filter bar's search live value change.
         */
        onSearchLiveChange: function(oEvent) {
            let sSearchValue = oEvent.getParameter("newValue");
            this._oListFilter.filterBySearchValue(sSearchValue);
        },

        /**
         * Clears all filter values when the user presses the Clear button.
         */
        onFilterBarClear: function() {
            this._oListFilter.clearFilters();
        },

        /**
         * Performs a filtering by default search value if it's specified.
         */
        performDefaultFiltering: function(sDefaultSearchValue) {
            if (sDefaultSearchValue) {
                this._oListFilter.setSearchValue(sDefaultSearchValue);
                this._oListFilter.filterBySearchValue(sDefaultSearchValue);
            } else if ((this._oListFilter._oListBinding) && (typeof this._oListFilter._oDefaultFilter === "object")) {
                this._oListFilter._oListBinding.filter(this._oListFilter._oDefaultFilter);
            }
        },

        /**
         * Returns dialog's control by ID.
         */
        byId: function(sId) {
            return sap.ui.getCore().byId(this._getFullId(sId));
        },

        /**
         * Constructs full ID for getting control by ID using sap.ui.core.Core.byId method.
         */
        _getFullId: function(sId) {
            return this._sBaseId + "--" + sId;
        },

        onListUpdate: function() {
            let iLength = this.getListBinding().getLength();
            this.getViewModel().setProperty("/listLength", iLength);
        }
    });
});