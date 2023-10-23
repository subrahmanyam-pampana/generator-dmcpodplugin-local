sap.ui.define([
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(CrossPlatformUtilities, PodUtility) {
    "use strict";

    var SPLITTER_CLASS_NAME = "sap.ui.layout.Splitter";
    var COMPONENT_CLASS_NAME = "sap.ui.core.ComponentContainer";
    var ICONTABBAR_CLASS_NAME = "sap.m.IconTabBar";

    return {

        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "11.0")) {
                // invalid Pod Data or version
                return oPodData;
            }

            // update to version 12 now
            oPodData.version = "12.0";

            // this translator only translates Splitters defined in pages
            if (!oPodData.pages || oPodData.pages.length === 0) {
                return oPodData;
            }

            var aNewLayout;
            for (var i = 0; i < oPodData.pages.length; i++) {
                aNewLayout = this.convertSplitters(oPodData.pages[i].layout);
                oPodData.pages[i].layout = aNewLayout;
            }

            return oPodData;
        },

        convertSplitters: function(aLayout) {

            var sOrientation, sId, iCount;
            var oControl, oParent, oPContainer, aSplitterChildren;

            var aLayoutCounters = [];
            var aNewLayout = [];
            for (var j = 0; j < aLayout.length; j++) {

                if (PodUtility.isNotEmpty(aLayout[j].translated)) {
                    continue;
                }

                if (aLayout[j].control !== SPLITTER_CLASS_NAME) {
                    aNewLayout[aNewLayout.length] = CrossPlatformUtilities.cloneObject(aLayout[j]);
                    aLayout[j].translated = aLayout[j].id;
                    continue;
                }

                // get orientation of Splitter
                sOrientation = aLayout[j].orientation;
                sId = aLayout[j].id;

                // get splitter children (if any)
                aSplitterChildren = this.findSplitterChildren(sId, aLayout);

                // get parent object (need to know if splitter is nested)
                oParent = this.findParent(aLayout[j].parentId, aLayout);

                if (oParent.control !== SPLITTER_CLASS_NAME) {

                    // copy control
                    oControl = CrossPlatformUtilities.cloneObject(aLayout[j]);

                    // parent is not another splitter, start a new Responsive Splitter
                    oControl.control = "sap.ui.layout.ResponsiveSplitter";
                    iCount = this.getLayoutCount("rsplitter", aLayoutCounters);
                    oControl.id = "rsplitter" + iCount;
                    delete oControl.orientation;
                    aNewLayout[aNewLayout.length] = oControl;
                    aLayout[j].translated = oControl.id;

                    // add pane container
                    oPContainer = this.createPaneContainer(oControl.id, sOrientation, aLayoutCounters);
                    aNewLayout[aNewLayout.length] = oPContainer;
                }

                this.convertSplitterChildren(aSplitterChildren, aLayout, aNewLayout, aLayoutCounters);
            }

            return aNewLayout;
        },

        convertSplitterChildren: function(aSplitterChildren, aLayout, aNewLayout, aLayoutCounters) {

            // this is the responsive splitter or a parent pane container
            var iParentIndex = aNewLayout.length - 1;

            // ResponsiveSplitter's or Pane container's Pane container id
            var sPaneContainerId = aNewLayout[iParentIndex].id;

            var i, iCount, index, iPaneCount, oControl, aChildren, oSpContent, oEmptyContent;

            iPaneCount = 0;
            if (aSplitterChildren && aSplitterChildren.length > 0) {

                iPaneCount = aSplitterChildren.length;

                // create loaded children
                for (i = 0; i < aSplitterChildren.length; i++) {

                    // get index of child in layout
                    index = this.findLayoutIndex(aSplitterChildren[i].id, aLayout);

                    if (aSplitterChildren[i].control === SPLITTER_CLASS_NAME) {

                        // get splitters children (if any)
                        aChildren = this.findSplitterChildren(aSplitterChildren[i].id, aLayout);

                        // copy control
                        oControl = CrossPlatformUtilities.cloneObject(aLayout[index]);

                        // convert nested splitter to pane container
                        oControl.control = "sap.ui.layout.PaneContainer";
                        iCount = this.getLayoutCount("pcontainer", aLayoutCounters);
                        oControl.id = "pcontainer" + iCount;
                        oControl.parentId = sPaneContainerId;

                        delete oControl.width;
                        delete oControl.height;

                        aNewLayout[aNewLayout.length] = oControl;
                        aLayout[index].translated = oControl.id;

                        // update children of this nested splitter
                        this.convertSplitterChildren(aChildren, aLayout, aNewLayout, aLayoutCounters);

                        continue;
                    }

                    // get index of child in layout
                    index = this.findLayoutIndex(aSplitterChildren[i].id, aLayout);

                    // not a splitter, create split pane to hold child
                    var sLayoutSizeData = null;
                    if (PodUtility.isNotEmpty(aSplitterChildren[i].layoutDataSize)) {
                        sLayoutSizeData = aSplitterChildren[i].layoutDataSize;
                    }
                    oSpContent = this.createSplitPaneContent(sPaneContainerId, aLayoutCounters, sLayoutSizeData);
                    aNewLayout[aNewLayout.length] = oSpContent;

                    // add child
                    oControl = CrossPlatformUtilities.cloneObject(aLayout[index]);
                    oControl.parentId = oSpContent.id;
                    aNewLayout[aNewLayout.length] = oControl;
                    aLayout[index].translated = oControl.id;
                }
            }

            // Pane Container must have at least 2 panes with content
            if (iPaneCount < 2) {
                for (i = 0; i < (2 - iPaneCount); i++) {
                    oSpContent = this.createSplitPaneContent(sPaneContainerId, aLayoutCounters);
                    aNewLayout[aNewLayout.length] = oSpContent;
                    // split pane must have content or error occurs
                    oEmptyContent = this.createEmptyContent(oSpContent.id, aLayoutCounters);
                    aNewLayout[aNewLayout.length] = oEmptyContent;
                }
            }
        },

        createPaneContainer: function(sParentId, sOrientation, aLayoutCounters) {
            var iCount = this.getLayoutCount("pcontainer", aLayoutCounters);
            var oPaneContainer = {
                "id": "pcontainer" + iCount,
                "orientation": sOrientation,
                "control": "sap.ui.layout.PaneContainer",
                "parentId": sParentId
            };
            return oPaneContainer;
        },

        createSplitPaneContent: function(sParentId, aLayoutCounters, sLayoutDataSize) {
            var iSize = 50;
            if (PodUtility.isNotEmpty(sLayoutDataSize) && sLayoutDataSize.indexOf("%") >= 0) {
                iSize = parseInt(sLayoutDataSize);
            }
            var iCount = this.getLayoutCount("splitpanecontent", aLayoutCounters);
            var oSplitPaneContent = {
                "id": "splitpanecontent" + iCount,
                "requiredParentWidth": 800,
                "size": iSize,
                "control": "sap.ui.layout.SplitPane",
                "parentId": sParentId
            };
            return oSplitPaneContent;
        },

        createEmptyContent: function(sParentId, aLayoutCounters) {
            var iCount = this.getLayoutCount("emptyplugincontainer", aLayoutCounters);
            var oEmptyContent = {
                "id": "emptyplugincontainer" + iCount,
                "width": "100%",
                "height": "100%",
                "control": COMPONENT_CLASS_NAME,
                "layoutDataSize": "auto",
                "parentId": sParentId
            };
            return oEmptyContent;
        },

        findLayoutIndex: function(sId, aLayout) {
            for (var j = 0; j < aLayout.length; j++) {
                if (aLayout[j].id === sId) {
                    return j;
                }
            }
            return -1;
        },

        findParent: function(sId, aLayout) {
            for (var j = 0; j < aLayout.length; j++) {
                if (aLayout[j].id === sId) {
                    return aLayout[j];
                }
            }
            return null;
        },

        findSplitterChildren: function(sId, aLayout) {
            var aChildren = [];
            for (var j = 0; j < aLayout.length; j++) {
                if (aLayout[j].parentId === sId) {
                    if (aLayout[j].control === SPLITTER_CLASS_NAME ||
                        aLayout[j].control === COMPONENT_CLASS_NAME ||
                        aLayout[j].control === ICONTABBAR_CLASS_NAME ||
                        aLayout[j].control === "sap.m.IconTabFilter") {
                        aChildren[aChildren.length] = aLayout[j];
                    } else {
                        var aNestedChildren = [];
                        this.loadValidNestedChildren(aLayout[j], aLayout, aNestedChildren);
                        if (aNestedChildren.length > 0) {
                            for (var i = 0; i < aNestedChildren.length; i++) {
                                if (aNestedChildren[i]) {
                                    aNestedChildren[i].parentId = sId;
                                    aChildren[aChildren.length] = aNestedChildren[i];
                                    aLayout[j].translated = aLayout[j].id;
                                }

                            }
                        }
                    }
                }
            }
            return aChildren;
        },

        loadValidNestedChildren: function(oContainer, aLayout, aNestedChildren) {
            for (var j = 0; j < aLayout.length; j++) {
                if (aLayout[j].parentId === oContainer.id) {
                    if (aLayout[j].control === SPLITTER_CLASS_NAME ||
                        aLayout[j].control === COMPONENT_CLASS_NAME ||
                        aLayout[j].control === ICONTABBAR_CLASS_NAME) {
                        aNestedChildren[aNestedChildren.length] = CrossPlatformUtilities.cloneObject(aLayout[j]);
                    } else {
                        this.loadValidNestedChildren(aLayout[j], aLayout, aNestedChildren);
                        aLayout[j].translated = aLayout[j].id;
                    }
                }
            }
        },

        updateParentIds: function(sNewParentId, sOldParentId, aLayout) {
            for (var j = 0; j < aLayout.length; j++) {
                if (aLayout[j].parentId === sOldParentId) {
                    aLayout[j].parentId = sNewParentId;
                }
            }
        },

        getLayoutCount: function(sType, aLayoutCounters) {
            var iCount = 0;
            if (aLayoutCounters[sType] && aLayoutCounters[sType].count > 0) {
                iCount = aLayoutCounters[sType].count;
            } else {
                aLayoutCounters[sType] = {};
            }
            iCount++;
            aLayoutCounters[sType].count = iCount;
            return iCount;
        }
    };
});