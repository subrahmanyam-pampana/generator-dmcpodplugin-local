sap.ui.define(
    [
        "sap/base/Log",
        "sap/ui/vk/RedlineElementRectangle",
        "sap/ui/vk/RedlineElementEllipse",
        "sap/dm/dme/podfoundation/extension/RedlineElementFreehandClosed", //Extension
        "sap/ui/vk/RedlineElementLine",
        "sap/ui/vk/RedlineElementText",
        "sap/ui/vk/tools/RedlineTool",
        "sap/ui/vk/tools/RedlineToolHandler",
        "sap/ui/vk/tools/Tool"
    ],
    function(
        Log,
        RedlineElementRectangle,
        RedlineElementEllipse,
        RedlineElementFreehandClosed, //Extension
        RedlineElementLine,
        RedlineElementText,
        RedlineTool, //Extension
        RedlineToolHandler,
        Tool
    ) {
        "use strict";

        var JsonElementClasses = {
            rectangle: RedlineElementRectangle,
            ellipse: RedlineElementEllipse,
            freehand: RedlineElementFreehandClosed, //Extension
            line: RedlineElementLine,
            text: RedlineElementText,
            freehandClosed: RedlineElementFreehandClosed
        };

        var ExtendedRedlineTool = RedlineTool.extend("sap.dm.dme.podfoundation.extension.tools.ExtendedRedlineTool", {
            constructor: function(sId, mSettings) {
                Tool.apply(this, arguments);

                // Configure dependencies
                this._viewport = null;
                this._handler = new RedlineToolHandler(this);
            }
        });

        ExtendedRedlineTool.prototype.importJSON = function(jsonElements) {
            var gizmo = this.getGizmo();

            jsonElements = Array.isArray(jsonElements) ? jsonElements : [jsonElements];
            jsonElements.forEach(function(json) {
                var ElementClass = JsonElementClasses[json.type];
                if (ElementClass) {
                    gizmo.addRedlineElement(new ElementClass().importJSON(json));
                } else {
                    Log.warning("Unsupported JSON element type " + json.type);
                }
            });

            gizmo.rerender();

            return this;
        };

        return ExtendedRedlineTool;
    }
);