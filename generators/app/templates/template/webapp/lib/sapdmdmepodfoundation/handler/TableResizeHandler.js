sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(BaseObject, PodUtility) {
    "use strict";

    /**
     * Constructor for the Table Resize Handler
     *
     * @param {sap.ui.core.mvc.Controller} POD controller
     * @param {sap.ui.core.mvc.Controller} Plugin controller
     *
     * @class
     * <code>sap.dm.dme.podfoundation.controller.TableResizeHandler</code> provides for
     * resizing the Table Header when it is embedded in a ScrollContainer and/or
     * a ResponsiveSplitter.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.handler.TableResizeHandler
     */
    var TableResizeHandler = BaseObject.extend("sap.dm.dme.podfoundation.handler.TableResizeHandler", {
        constructor: function(oPodController, oPluginController) {
            BaseObject.apply(this, arguments);
            this._oPodController = oPodController;
            this._oPluginController = oPluginController;
            this._iLastScrollLeft = 0;
        }
    });

    /**
     * Returns the POD Execution Utility.
     *
     * @return {sap.dm.dme.pod.util.ExecutionUtility} POD Execution Utility
     * @public
     */
    TableResizeHandler.prototype.getExecutionUtility = function() {
        return this._oPodController.getExecutionUtility();
    };

    /**
     * Returns the Plugin ID.
     *
     * @return {string} Plugin ID
     * @public
     */
    TableResizeHandler.prototype.getPluginId = function() {
        return this._oPluginController.getPluginId();
    };

    /**
     * Returns the POD View.
     *
     * @return {object} POD View
     * @public
     */
    TableResizeHandler.prototype.getPodView = function() {
        return this._oPodController.getView();
    };

    /**
     * Returns the Plugin View.
     *
     * @return {object} Plugin View
     * @public
     */
    TableResizeHandler.prototype.getView = function() {
        return this._oPluginController.getView();
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
    TableResizeHandler.prototype.initializeTableResizeHandler = function(oTable, sScrollContainerId, iThrottleDelay) {
        if (!oTable) {
            return;
        }
        if (this._sInitializeTimerId) {
            return;
        }
        var that = this;
        this._sInitializeTimerId = setTimeout(function() {
            that._doInitialize(oTable, sScrollContainerId, iThrottleDelay);
            that._sInitializeTimerId = undefined;
        }, 2000);
    };

    TableResizeHandler.prototype._doInitialize = function(oTable, sScrollContainerId, iThrottleDelay) {
        var oHeaderToolbar = oTable.getHeaderToolbar();
        if (!oHeaderToolbar) {
            return;
        }
        var oScrollerElement = null;
        if (PodUtility.isNotEmpty(sScrollContainerId)) {
            var oScrollContainer = this.getView().byId(sScrollContainerId);
            if (oScrollContainer) {
                oScrollerElement = this._getJQueryElementById(oScrollContainer.getId());
            }
        }
        this._attachSplitterResizeHandler(oTable, oHeaderToolbar, oScrollerElement);
        this._attachTableScrollHandler(oTable, oHeaderToolbar, oScrollerElement, iThrottleDelay);

        this._setTableHeaderWidth(oTable, oHeaderToolbar, this._iLastScrollLeft);
    };

    TableResizeHandler.prototype._attachSplitterResizeHandler = function(oTable, oHeaderToolbar, oScrollerElement) {
        var oPaneContainer = this._getSplitterPaneContainer();
        if (oPaneContainer) {
            oPaneContainer._oSplitter.attachResize(function(oEvent) {
                this._handleSplitterResizeEventEvent(oTable, oHeaderToolbar, oScrollerElement);
            }, this);
        }
    };

    TableResizeHandler.prototype._handleSplitterResizeEventEvent = function(oTable, oHeaderToolbar, oScrollerElement) {
        if (this._sSplitterResizeTimerId) {
            return;
        }
        var that = this;
        this._sSplitterResizeTimerId = setTimeout(function() {
            that._setTableHeaderWidth(oTable, oHeaderToolbar, that._iLastScrollLeft);
            that._sSplitterResizeTimerId = undefined;
        }, 125);
    };

    TableResizeHandler.prototype._attachTableScrollHandler = function(oTable, oHeaderToolbar, oScrollerElement, iThrottleDelay) {
        if (oScrollerElement) {
            var that = this;
            oScrollerElement.scroll(function() {
                that._handleHorizontalScrollEvent(oTable, oHeaderToolbar, oScrollerElement, iThrottleDelay);
            });
        }
    };

    TableResizeHandler.prototype._handleHorizontalScrollEvent = function(oTable, oHeaderToolbar, oScrollerElement, iThrottleDelay) {
        if (this._sScrollerTimerId) {
            return;
        }
        var iDelay = 500;
        if (typeof iThrottleDelay !== "undefined") {
            iDelay = iThrottleDelay;
        }
        var that = this;
        this._sScrollerTimerId = setTimeout(function() {
            var iScrollLeft = oScrollerElement.scrollLeft();
            if (that._iLastScrollLeft != iScrollLeft) {
                that._iLastScrollLeft = iScrollLeft;
                that._setTableHeaderWidth(oTable, oHeaderToolbar, iScrollLeft);
            }
            that._sScrollerTimerId = undefined;
        }, iDelay);
    };

    TableResizeHandler.prototype._setTableHeaderWidth = function(oTable, oHeaderToolbar, iScrollLeft) {
        if (oTable && oHeaderToolbar) {
            var oTableElement = this._getJQueryElementById(oTable.getId());
            if (!oTableElement) {
                return;
            }
            var iTableWidth = oTableElement.width();
            if (!iTableWidth) {
                return;
            }
            var oToolbarElement = this._getJQueryElementById(oHeaderToolbar.getId());
            var iNewWidth = (iTableWidth + iScrollLeft) - 16;

            oToolbarElement.width(iNewWidth);
        }
    };

    TableResizeHandler.prototype._getSplitterPaneContainer = function() {
        if (!this._oPaneContainer) {
            var oExecutionUtility = this.getExecutionUtility();
            if (!oExecutionUtility) {
                return null;
            }
            var oSplitterData = oExecutionUtility.findParentResponsiveSplitterData(this.getPluginId());
            if (!oSplitterData) {
                return null;
            }
            var oSplitPane = this.getPodView().byId(oSplitterData.paneId);
            if (!oSplitPane) {
                return null;
            }
            this._oPaneContainer = oSplitPane.getParent();
        }
        return this._oPaneContainer;
    };

    TableResizeHandler.prototype._getJQueryElementById = function(sId) {
        return jQuery("#" + sId);
    };

    return TableResizeHandler;
});