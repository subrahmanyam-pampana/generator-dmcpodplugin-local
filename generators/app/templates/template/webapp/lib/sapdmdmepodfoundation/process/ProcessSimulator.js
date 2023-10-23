sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/util/Storage",
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/message/ErrorHandler"
], function(BaseObject, Storage, Logging, ErrorHandler) {
    "use strict";

    var ProcessSimulator = BaseObject.extend("sap.dm.dme.podfoundation.process.ProcessSimulator", {
        constructor: function() {
            this._subscribeToStorageEvent();
            this._oLogger = Logging.getLogger("sap.dm.dme.podfoundation.process.ProcessSimulator");
        }
    });

    ProcessSimulator.prototype.destroy = function() {
        this._unsubscribeToStorageEvent();
        var oStorage = this._getLocalStorage();
        if (oStorage) {
            oStorage.remove("PROCESS_EVENT");
        }
    };

    ProcessSimulator.prototype.attachProcessEventListener = function(sEvent, fnCallback, fnContext) {
        if (!this._oEventListeners) {
            this._oEventListeners = {};
        }
        if (!this._oEventListeners[sEvent]) {
            this._oEventListeners[sEvent] = [];
        }
        this._oEventListeners[sEvent][this._oEventListeners[sEvent].length] = {
            callback: fnCallback,
            context: fnContext
        };
    };

    ProcessSimulator.prototype.sendProcessEventMessage = function(sEvent, oMessage) {
        // Puts the time stamp of the latest user interaction into the local storage
        var oLocalStorage = this._getLocalStorage();
        if (oLocalStorage) {
            var oProcessEvent = {
                event: sEvent,
                message: oMessage
            };
            oLocalStorage.put("PROCESS_EVENT", JSON.stringify(oProcessEvent));
        }
    };

    ProcessSimulator.prototype._handleStorageChangeEvent = function(e) {
        var oLocalStorage = this._getLocalStorage();
        var sProcessEvent = oLocalStorage.get("PROCESS_EVENT");
        if (!sProcessEvent || sProcessEvent === "") {
            return;
        }

        if (!this._oEventListeners) {
            // no listeners attached
            return
        }

        var oProcessEvent = null;
        try {
            oProcessEvent = JSON.parse(sProcessEvent);
        } catch (err) {
            this._oLogger.error("_handleStorageChangeEvent: error parsing event = " + sProcessEvent);
            return;

        }

        var aListeners = this._oEventListeners[oProcessEvent.event];
        if (!aListeners || aListeners.length === 0) {
            return;
        }

        for (var i = 0; i < aListeners.length; i++) {
            this._callFunctionCallback(aListeners[i].callback, aListeners[i].context, oProcessEvent);
        }
    };

    ProcessSimulator.prototype._callFunctionCallback = function(fnCallback, fnContext, oData) {
        var that = this;
        setTimeout(function() {
            try {
                fnCallback.call(fnContext, oData);
            } catch (oError) {
                var sErrorMessage = ErrorHandler.getErrorMessage(oError);
                that._oLogger.error("_handleStorageChangeEvent: error calling '" + fnCallback + "'", sErrorMessage);
            }
        }, 0);
    };

    ProcessSimulator.prototype._subscribeToStorageEvent = function() {
        var oLocalStorage = this._getLocalStorage();
        if (oLocalStorage) {
            var that = this;
            this._getJQueryWindowObject().on("storage", function(e) {
                that._handleStorageChangeEvent(e);
            });
        }
    };

    ProcessSimulator.prototype._unsubscribeToStorageEvent = function() {
        var oLocalStorage = this._getLocalStorage();
        if (oLocalStorage) {
            this._getJQueryWindowObject().off("storage");
        }
    };

    ProcessSimulator.prototype._getLocalStorage = function() {
        // Instantiates and validates the support of the local storage, then returns an interface for it.
        // A reference to the storage is kept after a successful instantiation for later use.
        if (typeof this._oLocalStorage === "undefined") {
            var oStorage = this._createLocalStorage();
            if (this._isLocalStorageSupported(oStorage)) {
                this._oLocalStorage = oStorage;
            } else {
                // If it is failing once it is expected to fail every time this session
                this._oLocalStorage = false;
            }
        }

        return this._oLocalStorage;
    };

    ProcessSimulator.prototype._createLocalStorage = function() {
        return new Storage(Storage.Type.local, "PROCESS_SIMULATOR");
    };

    ProcessSimulator.prototype._isLocalStorageSupported = function(oStorage) {
        // Checks if the local storage is supported by the browser
        var bIsSupported;
        try {
            bIsSupported = oStorage.isSupported();
        } catch (error) {
            bIsSupported = false;
        }
        return bIsSupported;
    };

    ProcessSimulator.prototype._getJQueryWindowObject = function() {
        return jQuery(window);
    };

    return ProcessSimulator;
});