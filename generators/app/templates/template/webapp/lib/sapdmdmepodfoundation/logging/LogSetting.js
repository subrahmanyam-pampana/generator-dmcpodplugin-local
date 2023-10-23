sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log"
], function(BaseObject, Log) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.LogSetting", {

        constructor: function(sComponent, sLevel) {
            this._component = sComponent;
            this._level = this._getUi5LogLevel(sLevel);
        },

        getComponent: function() {
            return this._component;
        },

        getLevel: function() {
            return this._level;
        },

        _getUi5LogLevel: function(sLevel) {
            let oLevel = null;
            switch (sLevel) {
                case "NONE":
                    oLevel = Log.Level.NONE;
                    break;
                case "ERROR":
                    oLevel = Log.Level.ERROR;
                    break;
                case "WARNING":
                    oLevel = Log.Level.WARNING;
                    break;
                case "INFO":
                    oLevel = Log.Level.INFO;
                    break;
                case "DEBUG":
                    oLevel = Log.Level.DEBUG;
                    break;
                case "TRACE":
                    oLevel = Log.Level.TRACE;
                    break;
                default:
                    oLevel = Log.Level.NONE;
            }
            return oLevel;
        }
    });
});