/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2016 SAP SE. All rights reserved
    
 */

/**
 * Initialization Code and shared classes of library sap.mes.
 */
sap.ui.define([
    "sap/ui/core/library"
], function(library1) {
    "use strict";

    // library dependencies
    // delegate further initialization of this library to the Core
    sap.ui.getCore().initLibrary({
        name: "sap.dm.dme",
        dependencies: ["sap.ui.core"],
        types: [
            "sap.dm.dme.TimerMode",
            "sap.dm.dme.ClockFormat"
        ],
        interfaces: [],
        controls: [
            "sap.dm.dme.control.Clock",
            "sap.dm.dme.control.DraggableListItem",
            "sap.dm.dme.control.Timer",
            "sap.dm.dme.control.SystemRules",
            "sap.dm.dme.model.AjaxUtil",
            "sap.dm.dme.model.CustomData"
        ],
        elements: [],
        noLibraryCSS: false,
        version: "19.0.0"
    });

    // third party libraries configuration
    sap.ui.loader.config({
        shim: {
            "sap/dm/dme/thirdparty/moment-min": {
                amd: true,
                exports: "moment"
            },
            "sap/dm/dme/thirdparty/moment-with-locales-min": {
                amd: true,
                exports: "moment-with-locales"
            },
            "sap/dm/dme/thirdparty/moment-timezone-with-data-min": {
                amd: true,
                exports: "moment-timezone-with-data"
            }
        }
    });

    /**
     * UI5 library: core DME library
     *
     * @namespace
     * @name sap.dm.dme
     * @alias sap.dm.dme
     * @public
     */
    let thisLib = sap.dm.dme;

    /**
     * Timer mode.
     *
     * @enum {string}
     * @public
     */
    thisLib.TimerMode = {
        /**
         * Stopwatch mode. Counts up time from zero value.
         * @public
         */
        Stopwatch: "Stopwatch",
        /**
         * Cycle timer mode. Counts down time from initial value to zero.
         * @public
         */
        CycleTimer: "CycleTimer"
    };

    /**
     * Clock format.
     *
     * @enum {string}
     * @public
     */
    thisLib.ClockFormat = {
        /**
         * Twelve hours time format of a clock. Example 10:15:15 PM.
         * @public
         */
        H12: "H12",
        /**
         * Twenty four hours time format of a clock. Example 22:15:15.
         * @public
         */
        H24: "H24"
    };

    return thisLib;
});