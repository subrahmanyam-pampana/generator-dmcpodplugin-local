sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/vk/ContentResource",
    "sap/dm/dme/podfoundation/extension/tools/ExtendedRedlineTool",
    "sap/ui/vk/tools/RedlineToolGizmo",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/base/util/uid"
], function(BaseObject, ContentResource, RedlineTool, RedlineToolGizmo, PodUtility, uid) {
    "use strict";

    var aImageMimeTypes = ["png", "gif", "jpg", "jpeg", "jpe", "jif", "jfif", "jfi", "bmp", "dib"];

    var ViewerHandler = BaseObject.extend("sap.dm.dme.podfoundation.handler.ViewerHandler", {
        constructor: function(oController) {
            BaseObject.apply(this, arguments);
            this._oController = oController;
            this._removedElements = [];
        }
    });

    ViewerHandler.prototype.getViewer = function() {
        return this._oController.getViewer();
    };

    ViewerHandler.prototype.addSubscriptions = function() {
        if (this._oController.addSubscriptions) {
            this._oController.addSubscriptions();
        }
    };

    ViewerHandler.prototype.addRedlineToolToViewer = function() {
        if (!this.oRedlineTool) {
            this.oRedlineTool = this.createRedlineTool();
            this.oRedlineToolGizmo = this.createRedlineToolGizmo();
            this.oRedlineTool.setGizmo(this.oRedlineToolGizmo);

            this.oRedlineTool.attachElementClicked(this._onClick, this);

            var oViewer = this.getViewer();
            var oViewport = oViewer.getNativeViewport();
            this.oRedlineTool.setViewport(oViewport);
            oViewport.addTool(this.oRedlineTool);

            this.oRedlineTool.setActive(true, oViewport, oViewport);

            // console.log("addRedlineToolToViewer: adding tool for plugin ID = ", sPluginId);

            this.addSubscriptions();
        }
    };

    ViewerHandler.prototype.createRedlineTool = function() {
        return new RedlineTool();
    };

    ViewerHandler.prototype.createRedlineToolGizmo = function() {
        var sPluginId = this._oController.getPluginId();
        var sId = "redlineTool-" + sPluginId.substring(sPluginId.lastIndexOf(".") + 1);
        var sUid = uid();
        return new RedlineToolGizmo(sId + "-gizmo-" + sUid);
    };

    /**
     * Destroys resources associated with viewer
     * @public
     */
    ViewerHandler.prototype.destroy = function() {
        var oRedlineTool = this.getRedlineTool();
        if (oRedlineTool) {
            oRedlineTool.detachElementClicked(this._onClick, this);
        }
    };

    ViewerHandler.prototype.rerenderViewer = function() {
        var oRedlineTool = this.getRedlineTool();
        if (oRedlineTool) {
            // The RedlineTool is a singleton and is used used by all
            // viewport's.  This means we need to restore whatever
            // viewport is currently associated with the plugin

            // set the tool to inactive for whatever viewport is currently
            // associated with the tool
            oRedlineTool.setActive(false);

            // Associate the current viewport with the tool
            var oViewer = this.getViewer();
            var oViewport = oViewer.getNativeViewport();
            oRedlineTool.setViewport(oViewport);
            oRedlineTool.setGizmo(this.oRedlineToolGizmo);
            oRedlineTool.setActive(true, oViewport, oViewport);
        }
    };

    /**
     * Load image into viewer
     *
     * @param {string} sSourceUrl URL to image to load
     * @param {string} sSourceType Type of image to load
     * @public
     */
    ViewerHandler.prototype.loadModel = function(sSourceUrl, sSourceType) {

        var oViewer = this.getViewer();
        oViewer.attachContentResourceChangesProcessed(this._onContentResourceChangesProcessed, this);

        // what is currently loaded in the view is destroyed
        oViewer.destroyContentResources();

        if (PodUtility.isNotEmpty(sSourceUrl)) {
            var sType = sSourceType;
            if (PodUtility.isEmpty(sType)) {
                sType = this.getSourceType(sSourceUrl);
            }
            // content of viewer is replaced with new data
            var contentResource = new ContentResource({
                source: sSourceUrl,
                sourceType: sType,
                sourceId: "abc"
            });

            // content: chosen path. content added to the view
            oViewer.addContentResource(contentResource);
        }
    };

    ViewerHandler.prototype._onContentResourceChangesProcessed = function(oEvent) {
        this.getViewer().detachContentResourceChangesProcessed(this._onContentResourceChangesProcessed, this);
        if (this._oController && this._oController.onModelUpdated) {
            this._oController.onModelUpdated(oEvent);
        }
    };

    /**
     * Get image type
     *
     * @param {string} sSourceUrl URL to image to load
     * @return {string} image type to load based on url
     * @public
     */
    ViewerHandler.prototype.getSourceType = function(sSourceUrl) {
        var sSourceType = null;
        var index = sSourceUrl.lastIndexOf(".");
        if (index >= 0 && index < sSourceUrl.length - 1) {
            sSourceType = sSourceUrl.substr(index + 1);
        }
        if (PodUtility.isNotEmpty(sSourceType)) {
            index = aImageMimeTypes.indexOf(sSourceType.toLowerCase());
            if (index >= 0) {
                return aImageMimeTypes[index];
            }
        }
        return null;
    };

    /**
     * Imports the redline elements
     *
     * @param {object} oData Redline to import
     * @param {string} sDataType data type ("svg" or "json")
     * @public
     */
    ViewerHandler.prototype.importRedline = function(oData, sDataType) {
        var oRedlineTool = this.getRedlineTool();
        oData.forEach(oRedlineElement => {
            if (oRedlineElement.metadata.colorStrategy === "Semantic") {
                oRedlineElement.strokeWidth = 0;
                oRedlineElement.fillColor = null;
                oRedlineElement.opacity = 0;
            }
        });
        if (sDataType.toLowerCase() === "svg") {
            oRedlineTool.importSVG(oData);
        } else {
            this.scaleRedline(oData);
            oRedlineTool.importJSON(oData);
        }
        this.rerenderViewer();

        this.updateImportedElements(oData);
    };

    /**
     * Scales the input redlines to the current view scale
     *
     * @param {object} oData Redline to import
     * @public
     */
    ViewerHandler.prototype.scaleRedline = function(oData) {
        for (var i = 0; i < oData.length; i++) {
            this._scaleRedlineElement(oData[i]);
        }
    };

    /**
     * Scales the input redlines to the current view scale
     *
     * @param {object} oJSonElement Redline JSon
     */
    ViewerHandler.prototype._scaleRedlineElement = function(oJSonElement) {
        var offsetInfo = this._getZoomAndPanOffset();
        var fZoomBy = offsetInfo.fZoomBy;

        // adjust originX & originY to fit zoom and pan offset
        oJSonElement.originX *= fZoomBy;
        oJSonElement.originY *= fZoomBy;
        oJSonElement.originX += offsetInfo.iDeltaX;
        oJSonElement.originY += offsetInfo.iDeltaY;

        if (oJSonElement.type === "rectangle") {
            oJSonElement.width = oJSonElement.width * fZoomBy;
            oJSonElement.height = oJSonElement.height * fZoomBy;

        } else if (oJSonElement.type === "ellipse" || oJSonElement.type === "circle") {
            // adjust radius
            oJSonElement.radiusX *= fZoomBy;
            oJSonElement.radiusY *= fZoomBy;

        } else if (oJSonElement.type.indexOf("freehand") === 0) {
            // fix path
            oJSonElement.path = oJSonElement.path.map(function(x) {
                return x * fZoomBy;
            });
        } else if (oJSonElement.type === "text") {
            oJSonElement.fontSize *= fZoomBy;
            oJSonElement.width *= fZoomBy;
            oJSonElement.height *= fZoomBy;
        }
    };

    /**
     * Restore original coordinates and dimensions of the redline element (undo scaling done above)
     *
     * @param {object} oJSonElement Redline JSon
     */
    ViewerHandler.prototype._resetRedlineElementScale = function(oJSonElement) {
        var offsetInfo = this._getZoomAndPanOffset();
        var fZoomBy = offsetInfo.fZoomBy;

        // reset originX & originY to original values
        oJSonElement.originX -= offsetInfo.iDeltaX;
        oJSonElement.originY -= offsetInfo.iDeltaY;
        oJSonElement.originX /= fZoomBy;
        oJSonElement.originY /= fZoomBy;

        // reset dimensions to original values
        if (oJSonElement.type === "rectangle") {
            oJSonElement.width /= fZoomBy;
            oJSonElement.height /= fZoomBy;

        } else if (oJSonElement.type === "ellipse" || oJSonElement.type === "circle") {
            oJSonElement.radiusX /= fZoomBy;
            oJSonElement.radiusY /= fZoomBy;

        } else if (oJSonElement.type.indexOf("freehand") === 0) {
            oJSonElement.path = oJSonElement.path.map(function(x) {
                return x / fZoomBy;
            });

        } else if (oJSonElement.type === "text") {
            oJSonElement.fontSize /= fZoomBy;
            oJSonElement.width /= fZoomBy;
            oJSonElement.height /= fZoomBy;
        }
    };

    /**
     * Returns the zoom and pan offsets for the current view scale
     */
    ViewerHandler.prototype._getZoomAndPanOffset = function() {
        var oViewer = this.getViewer();
        var oViewport = oViewer.getNativeViewport();
        var viewInfo = oViewport.getViewInfo();

        var fNewZoom = viewInfo["camera"][0];
        var fZoomBy = fNewZoom / 1.0;

        var iMoveX = oViewport.getViewInfo().camera[4];
        var iMoveY = oViewport.getViewInfo().camera[5];
        var iVirtualSideLength = this.getRedlineTool().getGizmo()._virtualSideLength;
        var iDeltaX = iMoveX / iVirtualSideLength;
        var iDeltaY = iMoveY / iVirtualSideLength;

        return {
            "fZoomBy": fZoomBy,
            "iDeltaX": iDeltaX,
            "iDeltaY": iDeltaY
        };
    };

    /**
     * Add plugin id to custom data for new elements
     *
     * @public
     */
    ViewerHandler.prototype.updateImportedElements = function(oData) {
        if (!oData || oData.length === 0) {
            return;
        }
        var sPluginId = this._oController.getPluginId();

        for (var i = 0; i < oData.length; i++) {
            var oRedlineElement = oData[i];
            if (PodUtility.isNotEmpty(oRedlineElement.elementId)) {
                var oElement = this.findRedlineElement(oRedlineElement.elementId);
                if (oElement) {
                    oElement.data("PLUGIN_ID", sPluginId);
                    oElement.data("OVERLAY_TYPE", oRedlineElement.metadata.overlayType);
                    oElement.data("COLOR_STRATEGY", oRedlineElement.metadata.colorStrategy);
                    oElement.data("OVERLAY_REDLINE_TYPE", oRedlineElement.type);
                }
            }
        }
    };

    /**
     * Restores a previously removed elements to display
     *
     * @param {RedlineElement} elements to restore
     * @public
     */
    ViewerHandler.prototype.restoreRedlineElement = function(oElement) {
        var oRedlineTool = this.getRedlineTool();
        this._deleteRemovedElement(oElement);

        // when the UI5 element is created from the redline element, the type attribute is omitted
        // for some reason. therefore we add it back since it is required to scale the element properly.
        oElement.mProperties.type = oElement.data("OVERLAY_REDLINE_TYPE")
        this._scaleRedlineElement(oElement.mProperties);

        oRedlineTool.addRedlineElement(oElement);
        this.rerenderRedlineElements();
    };

    /**
     * Removes input element from display
     *
     * @param {RedlineElement} element to remove
     * @public
     */
    ViewerHandler.prototype.removeRedlineElement = function(oElement) {
        // when the UI5 element is created from the redline element, the type attribute is omitted
        // for some reason. therefore we add it back since it is required to scale the element properly.
        oElement.mProperties.type = oElement.data("OVERLAY_REDLINE_TYPE");

        // we need to undo the scaling done earlier since the zoom factor and pan offset
        // are based on the original coordinates and dimensions.
        this._resetRedlineElementScale(oElement.mProperties);

        this._removedElements.push(oElement);
        this.getRedlineTool().removeRedlineElement(oElement);
        this.rerenderRedlineElements();
    };

    /**
     * Rerenders the current redline elements
     *
     * @param {array} Array of elements to remove
     * @public
     */
    ViewerHandler.prototype.rerenderRedlineElements = function() {
        var oRedlineTool = this.getRedlineTool();
        oRedlineTool.getGizmo().rerender();
    };

    /**
     * Finds and returns a redline element by input ID
     *
     * @param {string} sElementId ID of element to return
     * @return element if found, else null
     * @public
     */
    ViewerHandler.prototype.findRedlineElement = function(sElementId) {
        var oRedlineTool = this.getRedlineTool();
        var aElements = oRedlineTool.getRedlineElements();
        if (aElements && aElements.length > 0) {
            for (var i = 0; i < aElements.length; i++) {
                if (aElements[i].getElementId() === sElementId) {
                    return aElements[i];
                }
            }
        }
        return null;
    };

    /**
     * Finds and returns a previously removed element
     *
     * @param {string} Element id
     * @public
     */
    ViewerHandler.prototype.findRemovedElement = function(sElementId) {
        if (this._removedElements && this._removedElements.length > 0) {
            for (var i = 0; i < this._removedElements.length; i++) {
                if (this._removedElements[i].getElementId() === sElementId) {
                    return this._removedElements[i];
                }
            }
        }
        return null;
    };

    /*
     * Removes a element from the removed list
     *
     * @param {object} RedlineElement ID or RedlineElement
     * @public
     */
    ViewerHandler.prototype._deleteRemovedElement = function(vElement) {
        var sElementId = vElement;
        if (typeof vElement !== "string" && vElement.getElementId) {
            sElementId = vElement.getElementId();
        }
        if (this._removedElements && this._removedElements.length > 0) {
            for (var i = 0; i < this._removedElements.length; i++) {
                if (this._removedElements[i].getElementId() === sElementId) {
                    this._removedElements.splice(i, 1);
                    return;
                }
            }
        }
    };

    /**
     * Sets the view for the image
     *
     * @param {object} oViewInfo Information describing the view to display
     * @public
     */
    ViewerHandler.prototype.setViewInfo = function(oViewInfo) {
        this.getViewer().getNativeViewport().setViewInfo(oViewInfo);
    };

    /*
     * listener for clicking on an element
     *
     * @param {object} oEvent
     * @private
     */
    ViewerHandler.prototype._onClick = function(oEvent) {
        var sElementId = oEvent.getParameter("elementId");
        var oElement = this.findRedlineElement(sElementId);
        if (oElement) {
            // set text labels as read only
            if (oElement.getText) {
                $('#' + oElement.getId() + ">textarea").attr('readonly', true);
            }
            var sElementPluginId = oElement.data("PLUGIN_ID");
            var sPluginId = this._oController.getPluginId();
            if (sElementPluginId === sPluginId) {
                this._oController.onClick(oEvent, oElement);
            }
        }
    };

    ViewerHandler.prototype.getRedlineTool = function() {
        return this.oRedlineTool;
    };

    return ViewerHandler;
});