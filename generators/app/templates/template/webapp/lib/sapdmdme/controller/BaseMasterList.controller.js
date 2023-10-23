sap.ui.define([
    "sap/dm/dme/controller/Base.controller",
    "sap/dm/dme/controller/UnsavedChangesCheck",
    "sap/dm/dme/controller/ListFilter",
    "sap/dm/dme/formatter/GeneralFormatter",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/logging/Logging"
], function(BaseController, UnsavedChangesCheck, ListFilter, GeneralFormatter, StatusFormatter, ObjectTypeFormatter, Logging) {
    "use strict";

    let _oPreviousSelectedItem = null;
    let _sMasterListId = null;
    let _sFilterBarId = null;
    /** @deprecated remove after all deprecated filtering methods will be removed */
    let _aBasicFilterNames = [];

    let logger = Logging.getLogger("sap.dm.dme.controller.BaseMasterList");

    return BaseController.extend("sap.dm.dme.controller.BaseMasterList", {

        generalFormatter: GeneralFormatter,
        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,

        onInit: function() {
            // Set to default if subclasses do not set their own master list id
            if (!_sMasterListId) {
                this.setMasterListId("masterList");
            }

            // initialize list filter and selector a bit later to have all list bindings initialized before
            this.getView().attachEventOnce("beforeRendering", function() {
                this.getListSelector().setBoundMasterList(this.byId(this.getMasterListId()));
                if (this._getFilterSettings) {
                    this.initListFiltering("filterBar", this._getFilterSettings());
                }
                this._attachListEvents();
            }.bind(this));

            this.getEventBus().subscribe("MasterListChannel", "RefreshAndSelect", this._handleRefreshAndSelect, this);
            this.getRouter().getRoute("masterList").attachPatternMatched(this.onMasterListRouteMatched, this);
        },

        onExit: function() {
            this._oMasterListFilter && this._oMasterListFilter.destroy();
            this.getEventBus().unsubscribe("MasterListChannel", "RefreshAndSelect", this._handleRefreshAndSelect, this);
        },

        _attachListEvents: function() {
            const oBinding = this.getListSelector().getMasterListBinding();
            if (oBinding) {
                oBinding.attachDataReceived(this.onMasterListDataReceived.bind(this));
            }
        },

        onMasterListRouteMatched: function() {
            this.getListSelector().removeSelection();
        },

        onAfterRendering: function() {
            // This fixes the issue of sap.m.semantic.SemanticPage (Fiori 1.0) update inside the launchpad (BCP 1880470938)
            // todo: remove when master list will be moved to Fiori 2.0 pages
            try {
                let oSemanticPage = this.getView().getContent()[0];
                oSemanticPage.addStyleClass("dmeMasterListPage");
                oSemanticPage._getPage().getCustomHeader().invalidate();
            } catch (oError) {
                logger.warning("Unable to invalidate page header", "View, or Page, or Header is unavailable.");
            }
        },

        /***
         * Initialize search field and filter bar properties
         * @deprecated use initListFiltering
         */
        initFiltering: function(mSettings) {
            _sFilterBarId = mSettings.sFilterBarId;
            _aBasicFilterNames = mSettings.aBasicSearchFields.slice();
        },

        /**
         * Default implementation of the filter bar field change handler.  Subclasses
         * override, calling this method and then providing object specific
         * filter handling.
         * @deprecated use onFilterBarValueChange
         */
        onFilterBarChange: function(oEvent) {
            this.byId(this.getFilterBar().getBasicSearch()).setValue("");
        },

        /***
         * Handler for the search field live search.
         * Searches for a match in the material OR the material description.
         * @deprecated use onSearchLiveChange
         */
        onFilterLive: function(oEvent) {
            let sSearchValue = oEvent.getParameter("newValue");
            let oListBinding = this.getMasterListBinding();

            if (sSearchValue) {
                // Filter based on material and description
                let aFilters = [];
                for (let i = 0; i < _aBasicFilterNames.length; i++) {
                    aFilters[i] = new sap.ui.model.Filter(_aBasicFilterNames[i], sap.ui.model.FilterOperator.Contains, sSearchValue);
                }
                oListBinding.filter([new sap.ui.model.Filter(aFilters, false)]);
            } else {
                oListBinding.filter([]);
            }
        },

        /***
         * Clears all filter values when the user presses the Clear button in the filter configuration.
         * @deprecated use onFilterBarClear
         */
        onFilterClear: function(oEvent) {
            let oItems = this.getFilterBar().getAllFilterItems(true);
            for (let i = 0; i < oItems.length; i++) {
                let oControl = this.getFilterBar().determineControlByFilterItem(oItems[i]);
                if (oControl) {
                    if (oControl.setValue) {
                        oControl.setValue("");
                    } else if (oControl.setState) {
                        oControl.setState(false);
                    }
                }
            }
        },

        /**
         * Initialize master list filtering with search field and filter bar properties.
         */
        initListFiltering: function(sFilterBarId, mFilterSettings) {
            _sFilterBarId = sFilterBarId;
            const oFilterBar = this.getFilterBar();
            mFilterSettings.oListBinding = this.getMasterListBinding();
            mFilterSettings.oFilterBar = oFilterBar;
            this._oMasterListFilter = this.getListFilter(mFilterSettings);
            // workaround to fix basic search control's layout in the filter bar
            if (oFilterBar) {
                const oSearch = oFilterBar.getBasicSearch();
                const oAggregation = oFilterBar.removeContent(oSearch);
                if (oAggregation) {
                    oFilterBar.setBasicSearch(oAggregation);
                }
            }
        },

        /**
         * returns a listFilter using base class
         */
        getListFilter: function(mFilterSettings) {
            return new ListFilter(mFilterSettings);
        },

        /**
         * The filter bar field value change handler. Triggers master list filtering.
         */
        onFilterBarValueChange: function() {
            let vExternalFilter = this.getExternalFilter();
            this._oMasterListFilter.filterByFilterBar(vExternalFilter);
        },

        /**
         * Creates non standard filters. Return value can be a single instance or an array of sap.m.Filter.
         * Override method if this functionality is needed.
         * @abstract
         */
        getExternalFilter: function() {
            return null;
        },

        /**
         * The search field live search handler. Triggers master list search (usually by entity name and description)
         */
        onSearchLiveChange: function(oEvent) {
            let sSearchValue = oEvent.getParameter("newValue");
            this._oMasterListFilter.filterBySearchValue(sSearchValue);
        },

        /**
         * Use this event when you need to combine live and filter bar filters.
         */
        onFilterBySearchAndBar: function() {
            this._oMasterListFilter.filterBySearchAndBar();
        },

        /**
         * The filter bar Clear button handler. Clears all filter bar's values and the search field.
         */
        onFilterBarClear: function() {
            this._oMasterListFilter.clearFilters();
        },

        /**
         * List selection change handler.  Navigates to the object view.
         */
        onSelectionChange: function(oEvent) {
            let oSelectedItem = this._getSelectedItem(oEvent);
            if (oEvent.getParameter("firstItem")) {
                _oPreviousSelectedItem = oSelectedItem;
                return;
            }
            UnsavedChangesCheck.confirmPageLeave(this.getModel(),
                function() {
                    _oPreviousSelectedItem = oSelectedItem;
                    this._handleSelectionChange(oSelectedItem);
                }.bind(this),
                function() {
                    if (_oPreviousSelectedItem) {
                        this.byId(this.getMasterListId()).setSelectedItem(_oPreviousSelectedItem);
                    } else {
                        this.byId(this.getMasterListId()).removeSelections(true);
                    }
                }.bind(this)
            );
        },

        /**
         * Create new object handler.  Navigates to the create object view.
         */
        onAddPressed: function() {
            UnsavedChangesCheck.confirmPageLeave(this.getModel(),
                function() {
                    this.getOwnerComponent().getRouter().navTo("create", {}, false);
                }.bind(this)
            );
        },

        setMasterListId: function(sId) {
            _sMasterListId = sId;
        },

        getMasterListId: function() {
            return _sMasterListId;
        },

        getMasterListBinding: function() {
            return this.getListSelector().getMasterListBinding();
        },


        /**
         * Get the master list FilterBar control;
         */
        getFilterBar: function() {
            return this.byId(_sFilterBarId);
        },

        onMasterListDataReceived: function(oEvent) {
            let oError = oEvent.getParameter("error");

            this.setGlobalProperty("/serviceErrorOccured", Boolean(oError));
            if (oError) {
                this.showErrorMessageBox(oError);
            }
        },

        /**
         * Accessor for automated tests.
         */
        _getBasicFilterNames: function() {
            return _aBasicFilterNames.concat([]); // Use concat so that we're compatible with ie11
        },

        _getSelectedItem: function(oEvent) {
            return oEvent.getSource().getSelectedItem();
        },

        _handleSelectionChange: function(oSelectedItem) {
            let oBindingContext = oSelectedItem.getBindingContext();
            if (oBindingContext.iIndex >= 0) {
                let sRefId = oBindingContext.getProperty("ref");
                this.getOwnerComponent().getRouter().navTo("object", {
                    objectId: sRefId
                }, false);
            } else {
                this.setGlobalProperty("creationInProgress", false);
                this.getOwnerComponent().getRouter().navTo("masterList", {}, true);
            }
        },

        _handleRefreshAndSelect: function(sChannelId, sEventId, oData) {
            let oList = this.byId(this.getMasterListId());
            let oBinding = oList.getBinding("items");

            if (!oBinding.hasPendingChanges()) {
                oList.setBusy(true);
                oList.attachEventOnce("updateFinished", oData, this._getOnUpdateCallback);
                oBinding.refresh();
            }
        },

        _getOnUpdateCallback: function(oEvent, oData) {
            if (oData.objectId) {
                this.getItems().some(function(oItem) {
                    if (oItem.getBindingContext().getProperty("ref") === oData.objectId) {
                        this.setSelectedItem(oItem);
                        oItem.focus();
                    }
                }.bind(this));
            } else {
                this.removeSelections(true);
            }
            this.setBusy(false);
        }
    });
}, true);