sap.ui.define([
    "sap/ui/vk/RedlineElementFreehand",
    "sap/ui/vk/RedlineElement",
    "sap/dm/dme/podfoundation/extension/ExtendedRedline" //Extension
], function(
    RedlineElementFreehand,
    RedlineElement,
    Redline
) {
    "use strict";

    var RedlineElementFreehandClosed = RedlineElementFreehand.extend("sap.dm.dme.podfoundation.extension.RedlineElementFreehandClosed", {
        metadata: {
            properties: {
                fillColor: {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "rgba(0, 0, 0, 0)"
                }
            }
        }
    });

    RedlineElementFreehandClosed.prototype.renderElement = function(renderManager, halo) {
        renderManager.openStart("path", this);
        renderManager.attr("d", this._getProcessedPath());
        renderManager.attr("stroke", this.getStrokeColor());
        renderManager.attr("stroke-width", this.getStrokeWidth());
        if (this.getStrokeDashArray().length > 0) {
            renderManager.attr("stroke-dasharray", this.getStrokeDashArray().toString());
        }
        renderManager.attr("opacity", this.getOpacity());
        //EXTENSION (Although we currently have a transparent fill, we keep this extension to make the shape clickable)
        renderManager.attr("fill", this.getFillColor());
        if (halo) {
            renderManager.attr("filter", this._getHaloFilter());
        }
        renderManager.openEnd();
        renderManager.close("path");
    };

    RedlineElementFreehandClosed.prototype.exportJSON = function() {
        return jQuery.extend(true, RedlineElement.prototype.exportJSON.call(this), {
            type: Redline.ElementType.FreehandClosed,
            version: 1,
            path: (this.getPath() || []).slice(),
            fillColor: this.getFillColor() //Extension
        });
    };

    RedlineElementFreehandClosed.prototype.importJSON = function(json) {
        if (json.type === Redline.ElementType.FreehandClosed) {
            if (json.version === 1) {

                RedlineElement.prototype.importJSON.call(this, json);

                if (json.hasOwnProperty("path")) {
                    this.setPath(json.path.slice());
                }

                //Extension
                if (json.hasOwnProperty("fillColor")) {
                    this.setFillColor(json.fillColor);
                }

            } else {
                // TO DO error version number
                Log.error("wrong version number");
            }
        } else {
            Log.error("Redlining JSON import: Wrong element type");
        }

        return this;
    };

    return RedlineElementFreehandClosed;
});