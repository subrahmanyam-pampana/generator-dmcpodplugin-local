/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2016 SAP SE. All rights reserved
    
 */

/**
 * Initialization Code and shared classes of library sap.dm.dme.podfoundation
 */
sap.ui.define([
    "sap/ui/core/library"
], function(library1) {
    "use strict";

    // library dependencies
    // delegate further initialization of this library to the Core
    sap.ui.getCore().initLibrary({
        name: "sap.dm.dme.podfoundation",
        dependencies: ["sap.ui.core"],
        types: [],
        interfaces: [],
        controls: [
            "sap.dm.dme.podfoundation.control.ActionButton",
            "sap.dm.dme.podfoundation.control.ConfigurableButton",
            "sap.dm.dme.podfoundation.control.DraggableListItem",
            "sap.dm.dme.podfoundation.control.GroupButton",
            "sap.dm.dme.podfoundation.control.ListPluginViewController",
            "sap.dm.dme.podfoundation.control.NavigationButton",
            "sap.dm.dme.podfoundation.control.PluginViewController",
            "sap.dm.dme.podfoundation.control.IconTabBar",
            "sap.dm.dme.podfoundation.control.IconTabFilter",
            "sap.dm.dme.podfoundation.control.ProductionComponent",
            "sap.dm.dme.podfoundation.control.ProductionUIComponent",
            "sap.dm.dme.podfoundation.control.PropertyEditor",
            "sap.dm.dme.podfoundation.control.StatusIconControl",
            "sap.dm.dme.podfoundation.control.TableFactory",
            "sap.dm.dme.podfoundation.control.TablePersoService",
            "sap.dm.dme.podfoundation.extension.PluginExtension",
            "sap.dm.dme.podfoundation.extension.PluginExtensionManager",
            "sap.dm.dme.podfoundation.extension.PluginExtensionProvider",
            "sap.dm.dme.podfoundation.extension.PluginExtensionType",
            "sap.dm.dme.podfoundation.handler.ViewerHandler",
            "sap.dm.dme.podfoundation.model.InputType",
            "sap.dm.dme.podfoundation.model.ItemKeyData",
            "sap.dm.dme.podfoundation.model.OperationKeyData",
            "sap.dm.dme.podfoundation.model.PodSelectionModel",
            "sap.dm.dme.podfoundation.model.ProcessLotKeyData",
            "sap.dm.dme.podfoundation.model.ResourceKeyData",
            "sap.dm.dme.podfoundation.model.Selection",
            "sap.dm.dme.podfoundation.model.SfcKeyData",
            "sap.dm.dme.podfoundation.model.ShopOrderKeyData",
            "sap.dm.dme.podfoundation.model.UserPreferences",
            "sap.dm.dme.podfoundation.popup.PopupHandler"
        ],
        elements: [],
        noLibraryCSS: false,
        version: '19.1.0'
    });

    return sap.dm.dme.podfoundation;

});