sap.ui.define([], function() {
    "use strict";

    var ExtendedRedline = {
        ElementType: {
            Line: "line",
            Rectangle: "rectangle",
            Ellipse: "ellipse",
            Freehand: "freehand",
            Text: "text",
            Comment: "comment",
            FreehandClosed: "freehandClosed" //Extension
        },
        svgNamespace: "http://www.w3.org/2000/svg"
    };

    return ExtendedRedline;

}, /* bExport= */ true);