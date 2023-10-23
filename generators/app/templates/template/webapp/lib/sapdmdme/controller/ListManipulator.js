sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    let bReverseListItems = false;

    /**
     * Updates JSON model that is bound to a list or table with the reordering functionality.
     * In order to use this functionality reordering buttons should call corresponding methods of this class and
     * their enabled properties should be bound to correspondent model properties (see _updateState method).
     * List item selected property should be bound to selectedRow model property.
     * selectionChange table event handler should call corresponding method of this class.
     */
    let ListManipulator = BaseObject.extend("sap.dm.dme.controller.ListManipulator", {

        /**
         * @param {sap.ui.model.json.JSONModel} oModel model that will be updated
         * @param {string} sListProperty property name of a list that is bind to a list or table
         * @param {function} fnNewItemCallback callback function that returns the new item data
         * @param {boolean} bForceRefreshOnAdd additionally refresh a model on create after timeout when a table has controls with suggestions
         */
        constructor: function(oModel, sListProperty, fnNewItemCallback, bForceRefreshOnAdd) {
            this._oModel = oModel;
            this._sListProperty = sListProperty;
            this._fnNewItemCallback = fnNewItemCallback;
            this._bForceRefreshOnAdd = bForceRefreshOnAdd;
            this.updateState();
        },

        /**
         * Delegated initialization of ordering buttons.
         * Method expects standard html ids of the buttons like:
         * moveToTop, moveUp, moveDown, moveToBottom
         * and the tooltip keys as list.actions.***.tooltip
         *
         * Calling this method is optional. You may initialize buttons manually in the view.
         *
         * @param oView page view to lookup buttons in.
         * @param {string} sIdPrefix Optional prefix for the buttons' identifiers to guarantee uniqueness in multi-list cases.
         * @param sModelNameId name of the model to initialize buttons for.
         */
        initOrderingButtons: function(oView, sIdPrefix, sModelNameId) {
            let oButton;
            let sPrefix = sIdPrefix || "";
            let sModelName = sModelNameId || "auxData";

            oButton = oView.byId(sPrefix + "orderedListAddItem");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.bindProperty("text", {
                    path: "i18n-global>common.addItem.btn"
                });
                oButton.attachPress(this.onAddItemPress.bind(this));
            }

            oButton = oView.byId(sPrefix + "moveToBottom");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.setIcon("sap-icon://expand-group");
                oButton.bindProperty("tooltip", {
                    path: "i18n-global>common.moveToBottom.tooltip"
                });
                oButton.bindProperty("enabled", {
                    path: sModelName + ">" + this._sListProperty + "MoveToBottomButtonEnabled"
                });
                oButton.attachPress(this.onMoveItemToBottomPress.bind(this));
            }

            oButton = oView.byId(sPrefix + "moveDown");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.setIcon("sap-icon://navigation-down-arrow");
                oButton.bindProperty("tooltip", {
                    path: "i18n-global>common.moveDown.tooltip"
                });
                oButton.bindProperty("enabled", {
                    path: sModelName + ">" + this._sListProperty + "MoveDownButtonEnabled"
                });
                oButton.attachPress(this.onMoveItemDownPress.bind(this));
            }

            oButton = oView.byId(sPrefix + "moveUp");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.setIcon("sap-icon://navigation-up-arrow");
                oButton.bindProperty("tooltip", {
                    path: "i18n-global>common.moveUp.tooltip"
                });
                oButton.bindProperty("enabled", {
                    path: sModelName + ">" + this._sListProperty + "MoveUpButtonEnabled"
                });
                oButton.attachPress(this.onMoveItemUpPress.bind(this));
            }

            oButton = oView.byId(sPrefix + "moveToTop");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.setIcon("sap-icon://collapse-group");
                oButton.bindProperty("tooltip", {
                    path: "i18n-global>common.moveToTop.tooltip"
                });
                oButton.bindProperty("enabled", {
                    path: sModelName + ">" + this._sListProperty + "MoveToTopButtonEnabled"
                });
                oButton.attachPress(this.onMoveItemToTopPress.bind(this));
            }

            oButton = oView.byId(sPrefix + "orderedListDeleteItem");
            if (oButton) {
                oButton.setType("Transparent");
                oButton.bindProperty("text", {
                    path: "i18n-global>common.deleteItem.btn"
                });
                oButton.bindProperty("enabled", {
                    path: sModelName + ">" + this._sListProperty + "DeleteButtonEnabled"
                });
                oButton.attachPress(this.onDeleteItemPress.bind(this));
            }
        }

    });

    /**
     * Add button press handler. Uses callback function to get the new item data.
     * Inserts this data at the end of a list and sets it as selected.
     * @returns {number} New quantity of objects in the list
     */
    ListManipulator.prototype.onAddItemPress = function() {
        let aListData = this._getListData();
        this.removeItemsSelection();
        aListData.unshift(this._fnNewItemCallback());
        this._oModel.setProperty(this._sListProperty, aListData);
        aListData[0].selectedRow = true;
        this._updateState([0], aListData);
        this._oModel.firePropertyChange({
            reason: "Change",
            path: this._sListProperty
        });

        // workaround to rebind suggestion items in child controls
        if (this._bForceRefreshOnAdd) {
            setTimeout(function() {
                this._oModel.updateBindings(true);
            }.bind(this), 10);
        }
    };

    /**
     * Delete button press handler. Deletes selected row from a model. Removes selection.
     * @returns {number} New quantity of objects in the list
     */
    ListManipulator.prototype.onDeleteItemPress = function() {
        bReverseListItems = true;
        this._changeList(function(aListData, iIndex) {
            aListData.splice(iIndex, 1);
            return -1;
        });
        bReverseListItems = false;
    };

    /**
     * Move to the Bottom button press handler. Deletes selected row and inserts it at the ends of a list. Sets it as selected.
     */
    ListManipulator.prototype.onMoveItemToBottomPress = function() {
        bReverseListItems = true;
        let iPositionShift = 0;
        this._changeList(function(aListData, iIndex) {
            if (iPositionShift === 0) {
                iPositionShift = aListData.length - 1 - iIndex;
            }
            let oItem = aListData[iIndex];
            aListData.splice(iIndex, 1);
            aListData.splice(iIndex + iPositionShift, 0, oItem);
            return iIndex + iPositionShift;
        });
        bReverseListItems = false;
    };

    /**
     * Move Down button press handler. Deletes selected row and inserts it after the next row in the list. Sets it as selected.
     */
    ListManipulator.prototype.onMoveItemDownPress = function() {
        bReverseListItems = true;
        this._changeList(function(aListData, iIndex) {
            aListData.splice(iIndex + 1, 0, aListData.splice(iIndex, 1)[0]);
            return iIndex + 1;
        });
        bReverseListItems = false;
    };

    /**
     * Move Up button press handler. Deletes selected row and inserts it before the previous row in the list. Sets it as selected.
     */
    ListManipulator.prototype.onMoveItemUpPress = function() {
        this._changeList(function(aListData, iIndex) {
            aListData.splice(iIndex - 1, 0, aListData.splice(iIndex, 1)[0]);
            return iIndex - 1;
        });
    };

    /**
     * Move to the Top button press handler. Deletes selected row and inserts it at the beginning of a list. Sets it as selected.
     */
    ListManipulator.prototype.onMoveItemToTopPress = function() {
        let iPositionShift = 0;
        this._changeList(function(aListData, iIndex) {
            if (iPositionShift === 0) {
                iPositionShift = iIndex;
            }
            let oItem = aListData[iIndex];
            aListData.splice(iIndex, 1);
            aListData.splice(iIndex - iPositionShift, 0, oItem);
            return iIndex - iPositionShift;
        });
    };

    /**
     * Updates internal state (model properties) with current values.
     */
    ListManipulator.prototype.updateState = function() {
        this._updateState(this.getSelectedItemIndexes(), this._getListData());
    };

    /**
     * Returns a list of selected items indexes from a model.
     */
    ListManipulator.prototype.getSelectedItemIndexes = function() {
        let aIndexes = [];
        let aListData = this._getListData();

        aListData.forEach(function(oItem, iIndex) {
            if (oItem && oItem.selectedRow) {
                aIndexes.push(iIndex);
            }
        });

        return aIndexes.length > 0 ? aIndexes : null;
    };

    /**
     * Sets items in a model as selected.
     */
    ListManipulator.prototype.removeItemsSelection = function() {
        let aListData = this._getListData();

        aListData.forEach(function(oItem, index) {
            return oItem.selectedRow = false;
        });
    };

    /**
     * Common code on a list change. Gets selected items indexes. Gets list data.
     * Calls a function that changes a list and returns new selected item indexes.
     * Sets corresponding items as selected. Updates buttons enable states.
     */
    ListManipulator.prototype._changeList = function(fnChangeCallback) {
        let aListData = this._getListData();
        let aIndexes = this.getSelectedItemIndexes();
        if (aIndexes && aIndexes.length > 0) {
            if (bReverseListItems) {
                aIndexes.reverse();
            }
            let aInternalIndexes = [];
            aIndexes.forEach(function(iIndex) {
                let iInternalIndex = fnChangeCallback(aListData, iIndex);
                if (iInternalIndex !== -1) {
                    aInternalIndexes.push(iInternalIndex);
                }
            }, this);
            if (bReverseListItems) {
                aInternalIndexes.reverse();
            }
            this._updateState(aInternalIndexes, aListData);
            this._oModel.setProperty(this._sListProperty, aListData);
            this._oModel.firePropertyChange({
                reason: "Change",
                path: this._sListProperty
            });
        }
    };

    /**
     * Updates model with properties that reflects reordering buttons enabled/disabled state and entries count.
     */
    ListManipulator.prototype._updateState = function(aIndexes, aListData) {
        if (aIndexes && aIndexes.length > 0) {
            let bLastRowSelected = aIndexes[aIndexes.length - 1] === aListData.length - 1;
            let bFirstRowSelected = aIndexes[0] === 0;
            this._updateModelListProperty(aListData.length, !bLastRowSelected, !bFirstRowSelected, true);
        } else {
            this._updateModelListProperty(aListData.length, false, false, false);
        }
    };

    ListManipulator.prototype._updateModelListProperty = function(iCount, bLastRowState, bFirstRowState, bDeleteState) {
        this._oModel.setProperty(this._sListProperty + "Count", iCount);
        this._oModel.setProperty(this._sListProperty + "MoveToBottomButtonEnabled", bLastRowState);
        this._oModel.setProperty(this._sListProperty + "MoveDownButtonEnabled", bLastRowState);
        this._oModel.setProperty(this._sListProperty + "MoveUpButtonEnabled", bFirstRowState);
        this._oModel.setProperty(this._sListProperty + "MoveToTopButtonEnabled", bFirstRowState);
        this._oModel.setProperty(this._sListProperty + "DeleteButtonEnabled", bDeleteState);
    };

    /**
     * @returns an array of list data or an empty array if list data is not available.
     */
    ListManipulator.prototype._getListData = function() {
        return this._oModel.getProperty(this._sListProperty) || [];
    };

    return ListManipulator;
}, true);