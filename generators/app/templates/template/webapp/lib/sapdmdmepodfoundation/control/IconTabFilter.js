sap.ui.define([
    "sap/m/IconTabFilter",
], function(IconTabFilter) {
    "use strict";
    return IconTabFilter.extend("sap.dm.dme.podfoundation.control.IconTabFilter", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                displayInBar: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                contentHeight: {
                    type: "sap.ui.core.CSSSize",
                    group: "Dimension",
                    defaultValue: ""
                }
            }
        },
        constructor: function(sId, mSettings) {
            IconTabFilter.apply(this, arguments);
        },
        addContent: function(oControl) {
            if (this.getDisplayInBar()) {
                var oTabBarHeader = this.getParent();
                var oTabBar = oTabBarHeader.getParent();
                oTabBar.addFilterContent(this, oControl);
                this._oControl = oControl;
            } else {
                IconTabFilter.prototype.addContent.call(this, oControl);
            }
        },
        getTabBarContent: function() {
            var aContent = [];
            if (this.getDisplayInBar() && this._oControl) {
                aContent[0] = this._oControl;
            }
            return aContent;
        }
    });
});