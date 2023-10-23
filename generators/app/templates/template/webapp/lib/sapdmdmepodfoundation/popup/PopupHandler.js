sap.ui.define([
    "sap/base/security/URLWhitelist",
    "sap/ui/util/Storage"
], function(URLWhitelist, Storage) {
    "use strict";

    var _aSapDmePopupWindowList = [];

    /**
     * <code>sap.dm.dme.podfoundation.popup.PopupHandler</code> provides functions for displaying a Popup and working
     * with a Popup window.
     * @readonly
     * @namespace sap.dm.dme.podfoundation.popup.PopupHandler
     */
    return {

        /**
         * Opens a popup window to view text or 3D model
         *
         * @param {string} sPopupName String id to assign to the popup window
         * @param {int} iWidth integer width (in pixels) for window
         * @param {int} iHeight integer height (in pixels) for window
         * @param {int} iTop integer top position for the popup window
         * @param {int} iLeft integer left position for the popup window
         * @param {boolean} bResizable boolean true to make window resizable, else false
         * @param {object} oViewData object containing information to view:
         * <pre>
         *        oViewData = {
         *            "headerToolbarVisible": true to show viewer title,
         *            "title": "Title for the viewer",
         *            "description": "Optional description to display",
         *            "text": "Optional text to display",
         *            "vdsModelUrl": "Optional URL to 3D VDS model to display"
         *        };
         * </pre>
         * @returns {object} popup window object
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        openPodPopupViewerWindow: function(iWidth, iHeight, iTop, iLeft, bResizable, oViewData) {
            var oPluginData = {
                "sPluginId": "popupViewPlugin",
                "pluginName": "sap.dm.dme.plugins.popupViewerPlugin",
                "pluginData": {
                    "configuration": oViewData
                }
            };

            var sPluginData = JSON.stringify(oPluginData);
            this.setData("POPUP_WINDOW_PLUGIN_DATA", sPluginData);

            var sPopupUrl = this.getApplicationPopupWindowUrl("pod");

            return this.openModelessWindow(sPopupUrl, oPluginData.sPluginId, iWidth, iHeight, iTop, iLeft, bResizable);
        },

        /**
         * Opens the URL in a modeless window
         *
         * @param {string} sUrl String URL of page to open
         * @param {string} sPopupName String id to assign to the popup window
         * @param {int} iWidth integer width (in pixels) for window
         * @param {int} iHeight integer height (in pixels) for window
         * @param {int} iTop integer top position for the popup window
         * @param {int} iLeft integer left position for the popup window
         * @param {boolean} bResizable boolean true to make window resizable, else false
         * 
         * @returns {object} popup window object
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        openModelessWindow: function(sUrl, sPopupName, iWidth, iHeight, iTop, iLeft, bResizable) {
            var sPopupUrl = sUrl;
            if (!jQuery.trim(sPopupUrl)) {
                throw new Error("URL is undefined");
            }
            if (!URLWhitelist.validate(sPopupUrl)) {
                throw new Error("Invalid URL: " + sPopupUrl);
            }

            var screenAvailableHeight = this._getScreenAvailableHeight();
            var screenAvailableWidth = this._getScreenAvailableWidth();

            var width = screenAvailableWidth;
            var height = screenAvailableHeight;
            if (iWidth && iWidth > 0 && iWidth < screenAvailableWidth) {
                width = iWidth;
            }
            if (iHeight && iHeight > 0 && iHeight < screenAvailableHeight) {
                height = iHeight;
            }

            var top = iTop;
            if (!top || top < 0) {
                if (screenAvailableHeight > height) {
                    top = (screenAvailableHeight - height) / 2 - 30 - 15; // height of popup window header (30) and bottom border (15)
                } else {
                    top = 0;
                    height = screenAvailableHeight - 30 - 15; // height of popup window header (30) and bottom border (15)
                }
            }
            var left = iLeft;
            if (!left || left < 0) {
                if (screenAvailableWidth > width) {
                    left = (screenAvailableWidth - width) / 2;
                } else {
                    left = 0;
                }
            }
            var resizable = true;
            if (typeof bResizable !== "undefined") {
                resizable = bResizable;
            }

            var newattrs = "top=" + top + ",left=" + left + ",width=" + width + ",height=" + height + ",resizable=" + resizable + ",toolbar=0,location=0,directories=0,status=0,menubar=0,copyhistory=0";

            // open window
            var oPopup = window.open("", sPopupName, newattrs);

            // if not opened, warn user about popup blocker
            if (!oPopup) {
                throw new Error("Window not created");
            }

            // add name of popup to list
            this._addPopupName(sPopupName);

            // if this popup is new (never opened before), assign location to load
            if (this.isPopupClosed(oPopup)) {
                oPopup.location = sPopupUrl;

                // existing window, reload it
            } else {
                oPopup.location.reload();
            }

            // bring to top
            oPopup.focus();

            return oPopup;
        },

        /**
         * Returns the base URL for the application
         *
         * @param {string} sApplicationName String application name (i.e.; "pod", etc.)
         * @returns {string} URL
         * 
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        getApplicationPopupWindowUrl: function(sApplicationName) {
            var sApplicationUrl = this._getWindowLocationUrl();
            var sPopupUrl = sApplicationUrl;
            var urlObj = new URL(sApplicationUrl);
            if (urlObj.pathname.indexOf("/cp.portal") >= 0) {
                sPopupUrl = urlObj.origin.concat("/sapdmdmepod/popup.html");
            } else if (urlObj.hostname === "localhost" && urlObj.pathname.indexOf("/portal") >= 0) {
                // this supports running ui locally against cloud flp
                sPopupUrl = urlObj.origin.concat("/dme/podfoundation-ui/pod/webapp/test/flppopup.html");
            } else {
                // we are still using the  old FLP with no html5 repo. (for the edge)
                var index = sApplicationUrl.indexOf("/" + sApplicationName);
                if (index < 0) {
                    // this is when running from edge
                    index = sApplicationUrl.lastIndexOf("/index.html");
                }
                if (index < 0) {
                    throw new Error("Cannot resolve url from " + sApplicationUrl);
                }
                sPopupUrl = sApplicationUrl.substring(0, index);
                if (sPopupUrl.indexOf("/dme") < 0) {
                    sPopupUrl = sPopupUrl + "/dme";
                }
                if (sApplicationUrl.indexOf("/test") >= 0) {
                    sPopupUrl = sPopupUrl + "/" + sApplicationName + "/test/popup.html";
                } else if (sApplicationUrl.indexOf("/index.html#") >= 0) {
                    sPopupUrl = sPopupUrl + "/" + sApplicationName + "/edgepopup.html";
                } else {
                    sPopupUrl = sPopupUrl + "/" + sApplicationName + "/popup.html";
                }
            }

            return sPopupUrl;
        },

        _addPopupName: function(sPopupName) {
            var bFound = false;
            if (_aSapDmePopupWindowList && _aSapDmePopupWindowList.length > 0) {
                for (var i = 0; i < _aSapDmePopupWindowList.length; i++) {
                    if (_aSapDmePopupWindowList[i].popupName === sPopupName) {
                        bFound = true;
                        break;
                    }
                }
            }
            if (!bFound) {
                _aSapDmePopupWindowList[_aSapDmePopupWindowList.length] = {
                    popupName: sPopupName,
                    component: null
                };
            }
        },

        setPopupComponent: function(sPopupName, oPopupComponent) {
            if (_aSapDmePopupWindowList && _aSapDmePopupWindowList.length > 0) {
                for (var i = 0; i < _aSapDmePopupWindowList.length; i++) {
                    if (_aSapDmePopupWindowList[i].popupName === sPopupName) {
                        _aSapDmePopupWindowList[i].component = oPopupComponent;
                        break;
                    }
                }
            }
        },

        onPopupClosed: function(sPopupName, oPopupComponent) {
            if (_aSapDmePopupWindowList && _aSapDmePopupWindowList.length > 0) {
                var index = -1;
                for (var i = 0; i < _aSapDmePopupWindowList.length; i++) {
                    if (_aSapDmePopupWindowList[i].popupName === sPopupName) {
                        try {
                            this.destroyPopupComponent(_aSapDmePopupWindowList[i].component);
                        } catch (err) {
                            jQuery.sap.log.error("PopupHandler.destroyPopupComponent: Could not destroy " + _aSapDmePopupWindowList[i].popupName + ". Error = " + err.message);
                        }
                        index = i;
                        break;
                    }
                }
                if (index > -1) {
                    _aSapDmePopupWindowList.splice(index, 1);
                }
            }
        },

        destroyPopupComponent: function(oPopupComponent) {
            if (oPopupComponent) {
                var oView = oPopupComponent.getRootControl();
                if (oView && oView.getController) {
                    var oViewController = oView.getController();
                    if (oViewController) {
                        oViewController.onExit();
                    }
                    oView.destroy();
                }
            }
        },

        /**
         * Checks if the input Popup is closed
         *
         * @param {object} oPopup popup object to close
         * @returns {boolean} true if closed, else false
         * 
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        isPopupClosed: function(oPopup) {
            if (!oPopup || oPopup.closed) {
                return true;
            }
            if (!oPopup.document.URL || oPopup.document.URL.indexOf("about") === 0) {
                return true;
            }
            return false;
        },

        /**
         * Closes a Popup window
         *
         * @param {string} sPopupName name given to popup window
         * 
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        closePopupWindow: function(sPopupName) {
            var oPopup = window.open("", sPopupName);
            if (!oPopup || oPopup.closed) {
                return;
            }
            oPopup.close();
        },

        /**
         * Returns whether or not a Popup is currently displayed
         * @returns {boolean} true if a popup window is displayed, else false
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        isPopupDisplayed: function() {
            if (_aSapDmePopupWindowList && _aSapDmePopupWindowList.length > 0) {
                return true;
            }
            return false;
        },

        _getScreenAvailableHeight: function() {
            // added for QUnit tests
            return screen.availHeight;
        },

        _getScreenAvailableWidth: function() {
            // added for QUnit tests
            return screen.availWidth;
        },

        _getWindowLocationUrl: function() {
            // added for QUnit tests
            return window.location.href;
        },

        _getPopupWindowList: function() {
            // added for QUnit tests
            return _aSapDmePopupWindowList;
        },

        /**
         * Will get JSON data from local storage using input key.
         *
         * @param {string} key unique key to use to store data to
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        getData: function(key) {
            var oStorage = this._getStorage();
            return oStorage.get(key);
        },

        /**
         * Stores data into local storage using input key.
         *
         * @param {string} key unique key to use to store data to
         * @param {object} data JSON formatted data to store
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        setData: function(key, data) {
            var oStorage = this._getStorage();
            oStorage.put(key, data);
        },

        /**
         * Removes data in local storage using input key.
         *
         * @param {string} key unique key to use to remove data
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        removeData: function(key) {
            var oStorage = this._getStorage();
            oStorage.remove(key);
        },

        /**
         * Removes all local storage data.
         * @memberOf sap.dm.dme.podfoundation.popup.PopupHandler
         */
        clearAllData: function() {
            var oStorage = this._getStorage();
            oStorage.removeAll();
        },

        _getStorage: function() {
            if (!this._oLocalStorage) {
                this._oLocalStorage = new Storage(Storage.Type.local, "popup_storage");
            }
            return this._oLocalStorage;
        }
    };
});