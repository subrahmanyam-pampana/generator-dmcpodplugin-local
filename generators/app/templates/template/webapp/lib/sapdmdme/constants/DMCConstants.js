sap.ui.define([],
    function() {
        "use strict";
        return {
            roundingMode: 'HALF_AWAY_FROM_ZERO',
            style: 'standard',
            maxIntegerDigits: 11,
            maxFractionDigits: 3,
            minFractionDigits: 3,
            precision: 14,
            uomEach: ["EA", "PC", "C/U", "ST"],
            dateValueFormat: "yyyy-MM-ddTHH:mm:ssZ",
            customStyleOptions: {
                noSeconds: "medium/short",
                long: "long",
                medium: "medium",
                short: "short",
                full: "full"
            }
        };
    });