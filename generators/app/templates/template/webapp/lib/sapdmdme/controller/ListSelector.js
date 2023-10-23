/* global Promise */
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.controller.ListSelector", {

        /**
         * Provides a convenience API for selecting list items. All the functions will wait until the initial load of the a List passed to the instance by the setBoundMasterList
         * function.
         * @class
         * @public
         * @alias sap.ui.rta.test.Demo.md.model.ListSelector
         */
        constructor: function() {
            this._oWhenListHasBeenSet = new Promise(function(fnResolve, fnReject) {
                this._fnResolveListHasBeenSet = fnResolve;
                this._fnRejectListHasBeenSet = fnReject;
            }.bind(this));
            // This promise needs to be created in the constructor, since it is allowed to
            // invoke selectItem functions before calling setBoundMasterList
            this._handleListLoadingIsDone(false);

            // Catch possible errors in any case, even it's not needed to handle it.
            // Otherwise the error "Uncought in promise" might be occurred
            this.oWhenListLoadingIsDone.catch(function(oEvent) {
                jQuery.sap.log.warning("Promise rejected");
            });
        },

        _handleListLoadingIsDone: function(reloadList) {
            if (!this.oWhenListLoadingIsDone || reloadList) {
                this.oWhenListLoadingIsDone = new Promise(function(fnResolve, fnReject) {
                    // Used to wait until the setBound masterList function is invoked and model is instantiated
                    this._oWhenListHasBeenSet.then(function(oList) {
                        oList.attachEventOnce("updateFinished", function(oEvent) {
                            fnResolve();
                        });
                    }, function() {
                        fnReject();
                    });
                }.bind(this));
            }
        },

        updateListLoading: function() {
            this._handleListLoadingIsDone(true);
        },

        getMasterListBinding: function() {
            return this._oList.getBinding("items");
        },

        /**
         * A bound list should be passed in here. Should be done, before the list has received its initial data from the server.
         * May only be invoked once per ListSelector instance.
         * @param {sap.m.List} oList The list all the select functions will be invoked on.
         * @public
         */
        setBoundMasterList: function(oList) {
            this._oList = oList;
            this._fnResolveListHasBeenSet(oList);
        },

        setNoMasterList: function() {
            this._fnRejectListHasBeenSet();
        },

        /* =========================================================== */
        /* Convenience Functions for List Selection Change Event       */
        /* =========================================================== */

        /**
         * Attaches a listener and listener function to the ListSelector's bound master list. By using
         * a promise, the listener is added, even if the list is not available when 'attachListSelectionChange'
         * is called.
         * @param {function} fnFunction the function to be executed when the list fires a selection change event
         * @param {function} oListener the listener object
         * @return {sap.ui.rta.test.Demo.md.model.ListSelector} the list selector object for method chaining
         * @public
         */
        attachListSelectionChange: function(fnFunction, oListener) {
            this._oWhenListHasBeenSet.then(function() {
                this._oList.attachSelectionChange(fnFunction, oListener);
            }.bind(this));

            return this;
        },

        /**
         * Detaches a listener and listener function from the ListSelector's bound master list. By using
         * a promise, the listener is removed, even if the list is not available when 'detachListSelectionChange'
         * is called.
         * @param {function} fnFunction the function to be executed when the list fires a selection change event
         * @param {function} oListener the listener object
         * @return {sap.ui.rta.test.Demo.md.model.ListSelector} the list selector object for method chaining
         * @public
         */
        detachListSelectionChange: function(fnFunction, oListener) {
            this._oWhenListHasBeenSet.then(function() {
                this._oList.detachSelectionChange(fnFunction, oListener);
            }.bind(this));
            return this;
        },

        selectDefaultListItem: function() {
            return this.oWhenListLoadingIsDone.then(function() {
                let oList = this._oList;
                let oItem;

                // if (oList.getMode() === "None") {
                //     return false;
                // }

                // skip selection if list item already selected
                oItem = oList.getSelectedItem();

                if (oItem) {
                    return true;
                }

                // select the first list item otherwise
                oItem = oList.getItems()[0];

                if (oItem) {
                    oList.setSelectedItem(oItem);
                    oList.fireItemPress({
                        listItem: oItem
                    });
                    return true;
                }

                return false;
            }.bind(this), function() {
                jQuery.sap.log.warning("Could not select the first list item because the list encountered an error or had no items");
            });
        },

        selectFirstListItem: function() {
            return this.oWhenListLoadingIsDone.then(function() {
                let oList = this._oList;
                let oItem = oList.getItems()[0];

                // skip selection if the first list item already selected
                if (oItem && oItem === oList.getSelectedItem()) {
                    return true;
                }

                if (oItem) {
                    oList.setSelectedItem(oItem);
                    oList.fireSelectionChange({
                        listItem: oItem,
                        selected: true,
                        firstItem: true
                    });
                    return true;
                }

                return false;
            }.bind(this), function() {
                jQuery.sap.log.warning("Could not select the first list item because the list encountered an error or had no items");
            });
        },

        selectNewListItem: function(sRef) {
            let oList = this._oList;

            let oItem = oList.getItems()[oList.getItems().length - 1];

            if (oItem) {
                oList.setSelectedItem(oItem);
                oList.fireItemPress({
                    listItem: oItem
                });
                return true;
            }

            // remove existing selection if no item to select
            oList.removeSelections(true);
            return false;
        },

        selectListItem: function(sPropertyName, sPropertyValue, sModelName) {
            return this.oWhenListLoadingIsDone.then(function() {
                let oList = this._oList;
                let oItemToSelect;

                if (oList.getMode() === "None") {
                    return false;
                }

                for (let i = 0; i < oList.getItems().length; i++) {
                    let oItem = oList.getItems()[i];

                    if (oItem.getBindingContext(sModelName).getProperty(sPropertyName) === sPropertyValue) {
                        oItemToSelect = oItem;
                        break;
                    }
                }

                // skip selection if list item already selected
                if (oItemToSelect === oList.getSelectedItem()) {
                    return false;
                }

                if (oItemToSelect) {
                    oList.setSelectedItem(oItemToSelect);
                    oList.fireSelectionChange({
                        listItem: oItemToSelect
                    });
                    return true;
                }

                // remove existing selection if no item to select
                oList.removeSelections(true);
                return false;
            }.bind(this), function() {
                jQuery.sap.log.warning("Could not select specified list item because the list encountered an error or had no items");
            });
        },

        selectItemAfterDelete: function() {
            let oList = this._oList;
            let oSelectedItem = oList.getSelectedItem();
            let oItemToSelect;
            let bSelectedItemFound = false;

            if (oList.getMode() === "None") {
                return false;
            }

            for (let i = 0; i < oList.getItems().length; i++) {
                let oItem = oList.getItems()[i];

                if (oItem === oSelectedItem) {
                    bSelectedItemFound = true;
                    continue;
                }

                if (oItemToSelect && bSelectedItemFound) {
                    break;
                }

                oItemToSelect = oItem;
            }

            if (oItemToSelect) {
                oList.setSelectedItem(oItemToSelect);
                oList.fireItemPress({
                    listItem: oItemToSelect
                });
                return true;
            }

            // remove existing selection if no item to select
            oList.removeSelections(true);
            return false;
        },

        // selectAdjacentListItem: function() {
        //     return this.oWhenListLoadingIsDone.then(function() {
        //         var oList = this._oList;
        //         var oSelectedItem = oList.getSelectedItem();
        //         var oItemToSelect;
        //         var bSelectedItemFound = false;
        //
        //         if (oList.getMode() === "None") {
        //             return false;
        //         }
        //
        //         for (var i = 0; i < oList.getItems().length; i++) {
        //             var oItem = oList.getItems()[i];
        //
        //             if (oItem === oSelectedItem) {
        //                 bSelectedItemFound = true;
        //                 continue;
        //             }
        //
        //             if (oItemToSelect && bSelectedItemFound) {
        //                 break;
        //             }
        //
        //             oItemToSelect = oItem;
        //         }
        //
        //         if (oItemToSelect) {
        //             oList.setSelectedItem(oItemToSelect);
        //             oList.fireSelectionChange({ listItem: oItemToSelect });
        //             return true;
        //         }
        //
        //         // remove existing selection if no item to select
        //         oList.removeSelections(true);
        //         return false;
        //     }.bind(this), function() {
        //         jQuery.sap.log.warning("Could not select specified list item because the list encountered an error or had no items");
        //     });
        // },

        selectAdjacentListItem: function() {
            let oList = this._oList;
            let oSelectedItem = oList.getSelectedItem();
            let oItemToSelect;
            let bSelectedItemFound = false;

            if (oList.getMode() === "None") {
                return false;
            }

            for (let i = 0; i < oList.getItems().length; i++) {
                let oItem = oList.getItems()[i];

                if (oItem === oSelectedItem) {
                    bSelectedItemFound = true;
                    continue;
                }

                if (oItemToSelect && bSelectedItemFound) {
                    break;
                }

                oItemToSelect = oItem;
            }

            if (oItemToSelect) {
                oList.setSelectedItem(oItemToSelect);
                oList.fireItemPress({
                    listItem: oItemToSelect
                });
                return true;
            }

            // remove existing selection if no item to select
            oList.removeSelections(true);
            return false;
        },

        removeSelection: function() {
            return this.oWhenListLoadingIsDone.then(function() {
                this._oList.removeSelections(true);
            }.bind(this), function() {
                jQuery.sap.log.warning("Could not remove selection because the list encountered an error");
            });
        },

        setContext: function(oContext) {
            this._oContext = oContext;
        },

        getContext: function() {
            return this._oContext;
        },

        setListModel: function(oModel) {
            this._oModel = oModel;
        },

        getListModel: function() {
            return this._oModel;
        },

        refreshListModel: function() {
            this._oList && this._oList.getBinding("items").refresh();
        },

        getCreateContext: function() {
            return this._oList.getBinding("items").create({
                Ref: "NewResource",
                Resource: "Enter resource here... ",
                Description: "Enter description here... "

            });
        },

        getEditContext: function() {
            return this._oList.getSelectedItem().getBindingContext();
        },

        getCopyContext: function() {
            let oContext = this._oList.getSelectedItem().getBindingContext();

            let oItem = oContext.getObject();

            oItem.Ref = "NewResource";
            oItem.Resource = "Copy_" + oItem.Resource;

            return this._oList.getBinding("items").create(oItem);
        }
    });
});