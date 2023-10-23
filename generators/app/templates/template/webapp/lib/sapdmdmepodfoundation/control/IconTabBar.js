sap.ui.define([
    "sap/m/HBox",
    "sap/m/IconTabBar",
    "sap/m/IconTabSeparator",
    "sap/ui/core/IconColor",
    "sap/uxap/ObjectPageLayout",
    "sap/uxap/ObjectPageSection",
    "sap/uxap/ObjectPageSubSection",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(HBox, BaseIconTabBar, IconTabSeparator, IconColor, ObjectPageLayout, ObjectPageSection,
    ObjectPageSubSection, PodUtility) {
    "use strict";
    /**
     * TODO: Add buttons per configuration from property editor
     */
    var IconTabBar = BaseIconTabBar.extend("sap.dm.dme.podfoundation.control.IconTabBar", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                /**
                 * Specifies whether to use a single scrollable container for content
                 */
                scrollableContent: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },

                /**
                 * Specifies the icon to be displayed for the tab filter.
                 */
                separatorIcon: {
                    type: "sap.ui.core.URI",
                    group: "Misc",
                    defaultValue: ""
                }
            }
        },
        constructor: function(sId, mSettings) {
            BaseIconTabBar.apply(this, arguments);
            this._bFirstSelectionChanged = false;
            this._oControlContainerId = {};
        },
        renderer: {}
    });

    IconTabBar.prototype.addItem = function(oIconTabFilter) {
        if (PodUtility.isNotEmpty(this.getSeparatorIcon())) {
            if (this.getItems().length > 0) {
                this._addIconTabSeparator(oIconTabFilter.getVisible());
            }
        }

        if (this.getScrollableContent()) {
            this._addSectionControl(oIconTabFilter);
        }

        BaseIconTabBar.prototype.addItem.call(this, oIconTabFilter);
    };

    IconTabBar.prototype._addIconTabSeparator = function(bVisible) {
        var oIconTabSeparator = new IconTabSeparator({
            icon: this.getSeparatorIcon(),
            visible: bVisible
        });
        // addItem
        BaseIconTabBar.prototype.addItem.call(this, oIconTabSeparator);
    };

    IconTabBar.prototype.addFilterContent = function(oIconTabFilter, oControl) {

        // this will add filter content to the proper section
        this._addControlToSection(oControl, oIconTabFilter);
    };

    IconTabBar.prototype._addSectionControl = function(oIconTabFilter) {
        if (!this._oObjectPageLayout) {
            // create object page layout
            this._createObjectPageLayout();
        }
        var sTitle = oIconTabFilter.getText();
        var sKey = oIconTabFilter.getKey();

        var iCount = this._oObjectPageLayout.getSections().length + 1;
        var sId = this._sObjectPageLayoutId + "-section" + iCount;

        var oObjectPageSection = new ObjectPageSection(sId, {
            titleUppercase: false
        });
        oObjectPageSection.data("TAB_FILTER_KEY", sKey);
        oObjectPageSection.addStyleClass("sapUiNoMargin");
        oObjectPageSection.addStyleClass("sapUiNoContentPadding");
        oObjectPageSection.addStyleClass("sapMesIconTabBarSection");
        var oObjectPageSubSection = new ObjectPageSubSection(sId + "-ss", {
            title: sTitle,
            titleUppercase: false,
            showTitle: false
        });
        this._oControlContainerId[sKey] = sId + "-ss-control";
        var oControlContainer = this._createControlContainer(this._oControlContainerId[sKey], "0px");
        oObjectPageSubSection.addBlock(oControlContainer);
        oObjectPageSection.addSubSection(oObjectPageSubSection);

        this._oObjectPageLayout.addSection(oObjectPageSection);
    };

    IconTabBar.prototype._addControlToSection = function(oControl, oIconTabFilter) {
        var sKey = oIconTabFilter.getKey();
        var sId = this._oControlContainerId[sKey];
        var oControlContainer = sap.ui.getCore().byId(sId);
        if (oControlContainer) {
            var sHeight = oIconTabFilter.getContentHeight();
            oControlContainer.setHeight(sHeight);
            oControlContainer.addItem(oControl);
        }
    };

    IconTabBar.prototype._createControlContainer = function(sId, sHeight) {
        var oContainer = new HBox(sId, {
            height: sHeight,
            width: "100%",
            renderType: "Bare"
        });
        oContainer.addStyleClass("sapUiNoMargin");
        oContainer.addStyleClass("sapUiNoContentPadding");
        return oContainer;
    };

    IconTabBar.prototype._createObjectPageLayout = function() {
        this._sObjectPageLayoutId = this.getId() + "-layout";
        this._oObjectPageLayout = new ObjectPageLayout(this._sObjectPageLayoutId, {
            showAnchorBar: false,
            showAnchorBarPopover: false,
            showHeaderContent: false,
            subSectionLayout: "TitleOnLeft",
            upperCaseAnchorBar: false,
            showTitleInHeaderContent: false,
            height: "95%"
        });
        this._oObjectPageLayout.attachSectionChange(this.onSectionChange, this);

        BaseIconTabBar.prototype.addContent.call(this, this._oObjectPageLayout);
    };

    IconTabBar.prototype.fireSelect = function(oEvent) {
        BaseIconTabBar.prototype.fireSelect.apply(this, arguments);
        var oSection = this._findSectionToScrollTo(oEvent);
        if (!oSection) {
            return;
        }
        var iDelay = 0;
        if (!this._isSectionLoaded(oSection)) {
            iDelay = 500;
        }
        var that = this;
        setTimeout(function() {
            that._oObjectPageLayout.scrollToSection(oSection.getId());
        }, iDelay);
    };

    IconTabBar.prototype._findSectionToScrollTo = function(oEvent) {
        if (oEvent.key != oEvent.previousKey) {
            return this._findSectionByKey(oEvent.key);
        }
        return null;
    };

    IconTabBar.prototype._findSectionByKey = function(sKey) {
        if (this._oObjectPageLayout) {
            var aSections = this._oObjectPageLayout.getSections();
            for (let oSection of aSections) {
                if (oSection.data("TAB_FILTER_KEY") === sKey) {
                    return oSection;
                }
            }
        }
        return null;
    };

    IconTabBar.prototype._isSectionLoaded = function(oSection) {
        var aSubSections = oSection.getSubSections();
        if (!aSubSections || aSubSections.length === 0) {
            return false;
        }
        var aBlocks = aSubSections[0].getBlocks();
        if (!aBlocks || aBlocks.length === 0) {
            return false;
        }
        var aItems = aBlocks[0].getItems();
        if (!aItems || aItems.length === 0) {
            return false;
        }
        var oControlElement = this._getJQueryElement(aItems[0].getId());
        if (!oControlElement) {
            return false;
        }
        return true;
    };

    IconTabBar.prototype.onSectionChange = function(oEvent) {
        if (!this._bFirstSelectionChanged) {
            this._bFirstSelectionChanged = true;
            return;
        }
        var sTabFilterKey = this._findTabFilterKeyToSelect(oEvent);
        if (!sTabFilterKey) {
            this._sInitializeTimerId = undefined;
            return;
        }
        if (!this._isLoadingControlRequired(sTabFilterKey)) {
            this.setSelectedKey(sTabFilterKey);
            this._sInitializeTimerId = undefined;
            return;
        }
        if (this._sInitializeTimerId) {
            return;
        }
        var that = this;
        this._sInitializeTimerId = setTimeout(function() {
            that._lazyLoadControl(sTabFilterKey);
            that.setSelectedKey(sTabFilterKey);
            that._sInitializeTimerId = undefined;
        }, 500);
    };

    IconTabBar.prototype._lazyLoadControl = function(sTabFilterKey) {
        var oItem = this._findItemHavingKey(sTabFilterKey);
        if (oItem) {
            var mParameters = {
                item: oItem,
                key: sTabFilterKey
            };
            BaseIconTabBar.prototype.fireSelect.call(this, mParameters);
        }
    };

    IconTabBar.prototype._isLoadingControlRequired = function(sTabFilterKey) {
        var oSection = this._findSectionByKey(sTabFilterKey);
        if (!oSection) {
            return false;
        }
        if (this._isSectionLoaded(oSection)) {
            return false;
        }
        return true;
    };

    IconTabBar.prototype._findItemHavingKey = function(sKey) {
        var aItems = this.getItems();
        for (let oItem of aItems) {
            if (oItem.getKey && (oItem.getKey() === sKey)) {
                return oItem;
            }
        }
        return null;
    };

    IconTabBar.prototype._findTabFilterKeyToSelect = function(oEvent) {
        var oSection = oEvent.getParameter("section");
        if (oSection) {
            return oSection.data("TAB_FILTER_KEY");
        }
        return null;
    };

    IconTabBar.prototype._getJQueryElement = function(sId) {
        return jQuery("#" + sId);
    };

    return IconTabBar;
});