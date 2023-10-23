sap.ui.define([
    "sap/dm/dme/library",
    "sap/dm/dme/control/ClockBase",
    "sap/ui/core/format/DateFormat"
], function(library, ClockBase, DateFormat) {
    "use strict";

    let TimerMode = library.TimerMode;

    let Timer = ClockBase.extend("sap.dm.dme.control.Timer", {
        metadata: {
            properties: {
                mode: {
                    type: "sap.dm.dme.TimerMode",
                    defaultValue: TimerMode.Stopwatch
                },
                running: {
                    type: "boolean",
                    defaultValue: false
                },
                cycleTimeMillis: {
                    type: "int",
                    defaultValue: 0
                }
            }
        },

        renderer: function(oRM, oControl) {
            sap.dm.dme.control.ClockBaseRenderer.render(oRM, oControl);
        }
    });

    /**
     * @override
     */
    Timer.prototype.init = function() {
        this._initInternalState();
    };

    /**
     * Cycle timer is running by default
     * @override
     */
    Timer.prototype.onAfterRendering = function() {
        ClockBase.prototype.onAfterRendering.apply(this, arguments);
        if (this.getMode() === TimerMode.CycleTimer) {
            this.setRunning(true);
        }
    };

    /**
     * Updates internal state when running parameter is changed.
     * @param {Boolean} running timer is started or stopped
     * @return {Object} this for method chaining
     * @override
     */
    Timer.prototype.setRunning = function(running) {
        if (running !== this.getProperty("running")) {
            this._updateInternalState(running);
        }
        return this.setProperty("running", running);
    };

    /**
     * Internal variables initialized.
     * @private
     */
    Timer.prototype._initInternalState = function() {
        this._iElapsedTimeMillis = 0;
        this._iStartTimeMillis = 0;
    };

    /**
     * When timer is started then start date is stored in the internal variable.
     * When timer is stopped then elapsed time - time between start and stop date is stored in the internal variable.
     * @param {Boolean} running - timer is started or stopped
     * @private
     */
    Timer.prototype._updateInternalState = function(running) {
        if (running) {
            this._iStartTimeMillis = Date.now();
        } else if (this._iStartTimeMillis > 0) {
            this._iElapsedTimeMillis += (Date.now() - this._iStartTimeMillis);
        }
    };

    /**
     * Toggles running property for Stopwatch mode. Not relevant for CycleTimer mode.
     *
     * @return {boolean} the new running property value
     * @public
     */
    Timer.prototype.toggle = function() {
        if (this.getMode() === TimerMode.CycleTimer) {
            return;
        }
        this.setRunning(!this.getRunning());
        this._updateClockDisplayText();
        return this.getRunning();
    };

    /**
     * Stops timer and resets internal variables for Stopwatch mode. Not relevant for CycleTimer mode.
     * @public
     */
    Timer.prototype.reset = function() {
        if (this.getMode() === TimerMode.CycleTimer) {
            return;
        }
        this.setRunning(false);
        this._initInternalState();
        this._updateClockDisplayText();
    };

    /**
     * Calculates and formats time that will be displayed on the clock.
     * @override
     */
    Timer.prototype._getTimeToDisplay = function() {
        let iTimeToDisplay;
        let iCurrentElapsedTime = this._iElapsedTimeMillis; // elapsed time of a previous start-stop timer cycles

        if (this.getRunning()) {
            iCurrentElapsedTime += (Date.now() - this._iStartTimeMillis); // if timer is running then adjust elapsed time with the current time
        }

        if (this.getMode() === TimerMode.CycleTimer) {
            let iCycleTime = this.getCycleTimeMillis();

            if (iCurrentElapsedTime < iCycleTime) {
                iTimeToDisplay = iCycleTime - iCurrentElapsedTime; // calculate time to display for cycle timer
            } else {
                iTimeToDisplay = iCycleTime; // if cycle timer reached zero then start it over
                this._iElapsedTimeMillis -= iCurrentElapsedTime;
            }
        } else {
            iTimeToDisplay = iCurrentElapsedTime; // elapsed time is a time to display for stopwatch
        }

        return this._formatTimeToDisplay(iTimeToDisplay);
    };

    /**
     * Formats time that will be displayed on the clock.
     * @param {Number} timeToDisplayMillis time to format in milliseconds
     * @return {String} formatted time
     * @private
     */
    Timer.prototype._formatTimeToDisplay = function(timeToDisplayMillis) {
        return DateFormat.getTimeInstance({
            pattern: "HH:mm:ss"
        }).format(new Date(timeToDisplayMillis), true);
    };

    return Timer;
});