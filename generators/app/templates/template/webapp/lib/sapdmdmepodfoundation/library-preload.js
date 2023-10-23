//@ui5-bundle sap/dm/dme/podfoundation/library-preload.js
sap.ui.predefine("sap/dm/dme/podfoundation/browse/OperationActivityBrowse", ["sap/dm/dme/controller/BrowseBase", "sap/ui/model/json/JSONModel", "sap/dm/dme/formatter/StatusFormatter", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, t, r, o, i) {
    "use strict";
    let a = e.extend("sap.dm.dme.plugins.operationPodSelectionPlugin.controller.OperationActivityBrowse", {
        statusFormatter: r,
        populateSelectItems: function() {
            this.getDialog().setModel(new t(this.statusFormatter.getStatusList()), "productStatusItems")
        },
        createResultData: function(e) {
            return {
                ref: e.getProperty("ref"),
                name: e.getProperty("operation")
            }
        },
        getExternalFilter: function() {
            let e = this.byId("resourceTypeFilter").getSelectedKey();
            return this._createFilterByResourceType(e)
        },
        _createFilterByResourceType: function(e) {
            if (e) {
                return new o({
                    path: "resourceTypeRef",
                    operator: i.EQ,
                    value1: e
                })
            }
            return null
        }
    });
    return {
        open: function(e, t, r, o, i) {
            return new a("operationActivityBrowse", {
                oModel: o,
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.OperationActivityBrowse",
                oParentControl: e,
                sDefaultSearchValue: t,
                fnSelectionCallback: r,
                oFilterSettings: {
                    oDefaultFilter: i,
                    aLiveSearchProperties: ["operation", "description"],
                    sListBindingPath: "/Operations",
                    aVariantFilterInfo: [{
                        sFilterItemName: "operation"
                    }, {
                        sFilterItemName: "description"
                    }, {
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/OperationActivityBrowseValueHelp", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/browse/OperationActivityBrowse", "sap/dm/dme/formatter/StatusFormatter", "sap/dm/dme/formatter/ObjectTypeFormatter", "sap/dm/dme/model/ResourceModelEnhancer", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, t, o, i, n, r, s) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.OperationBrowseValueHelp", {
        statusFormatter: o,
        constructor: function(e, t) {
            this._oController = e;
            this._mSettings = t;
            this.initialize(e)
        },
        initialize: function(e) {
            let t = e.getView();
            this.oOperationActivityModel = t.getModel("product");
            let r = e.getOwnerComponent();
            let s = r.getModel("i18n-operation");
            n.enhanceIndustryTypes("sap.dm.dme.i18n.operation", s);
            let l = r.getModel("i18n-status");
            let a = r.getModel("i18n-objectType");
            let p = r.getModel("i18n-global");
            t.setModel(l, "i18n-status");
            t.setModel(s, "i18n-operation");
            t.setModel(p, "i18n-global");
            t.setModel(a, "i18n-objectType");
            o.init(l.getResourceBundle());
            i.init(a.getResourceBundle())
        },
        open: function(e) {
            let o = e;
            if (e.getSource) {
                o = e.getSource()
            }
            let i = this.getView();
            let n = this.getOperationBrowseDefaultFilter();
            let r = this;
            t.open(i, o.getValue(), function(e) {
                r._handleOperationBrowse(o, e)
            }, this.oOperationActivityModel, n)
        },
        getOperationBrowseDefaultFilter: function() {
            let e = new r({
                path: "currentVersion",
                operator: s.EQ,
                value1: true
            });
            let t = new r({
                path: "operation",
                operator: s.NE,
                value1: "_SYSTEM"
            });
            return new r({
                filters: [e, t],
                and: true
            })
        },
        _handleOperationBrowse: function(e, t) {
            this.processOperationBrowseSelection(e, t)
        },
        getView: function() {
            return this._oController.getView()
        },
        processOperationBrowseSelection: function(e, t) {
            return this._oController.processOperationBrowseSelection(e, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/ResourceBrowse", ["sap/dm/dme/controller/BrowseBase", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/dm/dme/podfoundation/formatter/BrowseFormatter"], function(e, t, r, o, n) {
    "use strict";
    let s = e.extend("sap.dm.dme.podfoundation.browse.ResourceBrowse", {
        formatter: n,
        populateSelectItems: function() {
            this.getDialog().setModel(new t(n.getResourceStatusList()), "statusItems")
        },
        createResultData: function(e, t) {
            let r = t.getBindingContext("plant");
            return {
                ref: r.getProperty("ref"),
                name: r.getProperty("resource")
            }
        },
        getExternalFilter: function() {
            let e = this.byId("resourceTypeFilter").getValue();
            return this._createFilterByResourceType(e)
        },
        _createFilterByResourceType: function(e) {
            if (!e) {
                return null
            }
            return new r({
                path: "resourceTypeResources",
                operator: o.Any,
                variable: "item",
                condition: new r({
                    path: "item/resourceType/resourceType",
                    operator: o.StartsWith,
                    value1: e
                })
            })
        },
        getResourceTypesAsText: function(e) {
            let t = this.byId("resultTable").getItems();
            let r = null;
            let o;
            t.some(function(t) {
                if (t.getBindingContext("plant").getProperty("ref") === e) {
                    r = t.getBindingContext("plant").getObject("resourceTypeResources")
                }
                return r !== null
            });
            r = r || [];
            o = r.map(function(e) {
                return e.resourceType.resourceType
            });
            return o.join(", ")
        }
    });
    return {
        open: function(e, t, r) {
            return new s("resourceBrowse", {
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.ResourceBrowse",
                oParentControl: e,
                sDefaultSearchValue: t,
                fnSelectionCallback: r,
                oFilterSettings: {
                    aLiveSearchProperties: ["resource", "description"],
                    sListBindingPath: "/Resources",
                    aVariantFilterInfo: [{
                        sFilterItemName: "resource"
                    }, {
                        sFilterItemName: "description"
                    }, {
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/ResourceBrowseValueHelp", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/browse/ResourceBrowse"], function(e, o) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.ResourceBrowseValueHelp", {
        constructor: function(e, o) {
            this._oController = e;
            this._mSettings = o
        },
        open: function(e) {
            let t = e;
            if (e.getSource) {
                t = e.getSource()
            }
            let s = this.getView();
            let r = this;
            o.open(s, t.getValue(), function(e) {
                r._handleResourceBrowse(t, e)
            })
        },
        _handleResourceBrowse: function(e, o) {
            this.processResourceBrowseSelection(e, o)
        },
        getView: function() {
            return this._oController.getView()
        },
        processResourceBrowseSelection: function(e, o) {
            return this._oController.processResourceBrowseSelection(e, o)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcBrowse", ["sap/dm/dme/controller/SfcChargeBrowseBase", "sap/dm/dme/podfoundation/browse/SfcBrowseListFilter", "sap/dm/dme/browse/MaterialBrowse", "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowse"], function(e, t, s, a) {
    "use strict";
    const o = ["SCRAPPED", "INVALID", "DELETED", "DONE_HOLD", "RETURNED", "GOLDEN_UNIT", "DONE"];
    const i = ["ALL", "NEW", "IN_QUEUE", "ACTIVE", "HOLD"];
    let l;
    let r;
    let n = e.extend("sap.dm.dme.podfoundation.browse.SfcBrowse", {
        constructor: function(t, s) {
            this.loadStatusExlusions(s.validStatuses);
            e.apply(this, arguments);
            this.initializeDialog(s)
        },
        loadStatusExlusions: function(e) {
            this.aStatusExcludes = [];
            if (!e || e.length === 0) {
                this.aStatusExcludes = o;
                this.aValidStatuses = i;
                return
            }
            this.aValidStatuses = this.loadValidStatuses(e);
            for (let e of o) {
                let t = false;
                for (let s of this.aValidStatuses) {
                    if (e === s) {
                        t = true;
                        break
                    }
                }
                if (!t) {
                    this.aStatusExcludes[this.aStatusExcludes.length] = e
                }
            }
        },
        loadValidStatuses: function(e) {
            let t = i;
            if (!e || e.length === 0) {
                return t
            }
            for (let s of e) {
                let e = false;
                for (let t of i) {
                    if (t === s) {
                        e = true;
                        break
                    }
                }
                if (!e) {
                    t[t.length] = s
                }
            }
            return t
        },
        initializeDialog: function(e) {
            let t = this.byId("resultTable");
            t.setMode(e.tableSelectMode);
            if (e.tableSelectMode === "SingleSelectMaster") {
                t.attachSelectionChange(this.onSelect, this);
                let e = this.byId("okButton");
                e.setVisible(false)
            }
            this.sShopOrderBrowseFragment = "sap.dm.dme.browse.view.ShopOrderBrowse";
            if (e.sFragmentName === "sap.dm.dme.podfoundation.browse.view.SfcBrowse") {
                this.sShopOrderBrowseFragment = "sap.dm.dme.podfoundation.browse.view.ShopOrderBrowse"
            }
        },
        getListFilter: function(e) {
            return new t(e)
        },
        populateSelectItems: function() {
            e.prototype.populateSelectItems.apply(this, arguments);
            let t = this.getDialog().getModel("sfcStatusItems");
            let s = t.getData();
            let a = [];
            for (let e of s) {
                let t = false;
                for (let s of this.aStatusExcludes) {
                    if (e.key === s) {
                        t = true;
                        break
                    }
                }
                if (t) {
                    continue
                }
                for (let t of this.aValidStatuses) {
                    if (e.key === t) {
                        a[a.length] = e;
                        break
                    }
                }
            }
            t.setData(a)
        },
        onShopOrderBrowse: function(e) {
            let t = e.getSource().getValue();
            let s = {
                sFragmentName: this.sShopOrderBrowseFragment
            };
            a.open(this.getDialog(), t, s, this._processSelectedShopOrder.bind(this), r, l)
        },
        onMaterialBrowse: function(e) {
            let t = e.getSource().getValue();
            s.open(this.getDialog(), t, this._processSelectedMaterial.bind(this), l)
        },
        onSelect: function() {
            let e = this.byId("resultTable");
            let t = e.getSelectedItems();
            let s = [];
            for (let e of t) {
                let t = e.getBindingContext();
                s[s.length] = this.createResultData(t)
            }
            this.getDialog().close();
            if (this._fnSelectionCallback) {
                this._fnSelectionCallback(s);
                this._fnSelectionCallback = null
            }
        }
    });
    return {
        open: function(e, t, s, a, o, i, d, f) {
            l = d;
            r = f;
            let c = "SingleSelectMaster";
            let u = "sap.dm.dme.podfoundation.browse.view.SfcBrowse";
            if (s) {
                if (typeof s.tableSelectMode !== "undefined") {
                    c = s.tableSelectMode
                }
                if (typeof s.sfcBrowseFragment !== "undefined") {
                    u = s.sfcBrowseFragment
                }
            }
            return new n("sfcBrowse", {
                oModel: o,
                sFragmentName: u,
                oParentControl: e,
                sDefaultSearchValue: t,
                tableSelectMode: c,
                validStatuses: s.validStatuses,
                fnSelectionCallback: a,
                bHideFilterBar: i,
                oFilterSettings: {
                    aLiveSearchProperties: ["sfc", "shopOrderRef", "materialRef"],
                    sListBindingPath: "/Sfcs",
                    aVariantFilterInfo: [{
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcBrowseFilterFactory", ["sap/dm/dme/podfoundation/browse/StatusFilterFactory"], function(t) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.browse.SfcBrowseFilterFactory", {
        getStatusesToIgnore: function() {
            return ["DONE", "SCRAPPED", "INVALID", "DELETED", "DONE_HOLD", "RETURNED", "GOLDEN_UNIT"]
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcBrowseListFilter", ["sap/dm/dme/controller/ListFilter", "sap/dm/dme/podfoundation/browse/SfcBrowseFilterFactory"], function(e, t) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.SfcBrowseListFilter", {
        _getFilterFactory: function(e, r) {
            return new t(e, r)
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcBrowseValueHelp", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/browse/SfcBrowse", "sap/ui/model/json/JSONModel", "sap/dm/dme/util/PlantSettings", "sap/dm/dme/formatter/StatusFormatter", "sap/dm/dme/formatter/EnumFormatter", "sap/dm/dme/formatter/ObjectTypeFormatter", "sap/dm/dme/formatter/DateTimeUtils"], function(e, t, o, n, i, s, r, l) {
    "use strict";
    const d = "viewModel";
    const u = "RESOURCE";
    return e.extend("sap.dm.dme.podfoundation.browse.SfcBrowseValueHelp", {
        statusFormatter: i,
        constructor: function(e, t) {
            this._oController = e;
            this._mSettings = t;
            this.initialize(e)
        },
        initialize: function(e) {
            e.getView().setModel(new o({
                sfc: null,
                sourceType: u,
                source: null,
                destinationType: u,
                destination: null,
                dueTime: null,
                dmcDateTimePickerValueFormat: l.dmcDateValueFormat(),
                industryType: n.getIndustryType()
            }), d);
            let t = e.getOwnerComponent();
            i.init(t.getModel("i18n-status").getResourceBundle());
            s.init(t.getModel("i18n-enum").getResourceBundle());
            r.init(t.getModel("i18n-objectType").getResourceBundle())
        },
        open: function(e) {
            let o = e.getSource();
            let n = this.getView();
            t.open(n, o.getValue(), this._mSettings, function(e) {
                this._handleSfcBrowse(o, e)
            }.bind(this), n.getModel("production"), false, n.getModel("product"), n.getModel("demand"))
        },
        _handleSfcBrowse: function(e, t) {
            let o = [];
            for (let e of t) {
                o[o.length] = e.name.toUpperCase()
            }
            this.processSfcBrowseSelection(e, o)
        },
        getView: function() {
            return this._oController.getView()
        },
        processSfcBrowseSelection: function(e, t) {
            return this._oController.processSfcBrowseSelection(e, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcOperationBrowseValueHelp", ["sap/ui/base/Object", "sap/ui/core/Fragment", "sap/dm/dme/formatter/StatusFormatter", "sap/dm/dme/formatter/ObjectTypeFormatter", "sap/dm/dme/model/ResourceModelEnhancer", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, t, o, n, i, r) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.SfcOperationBrowseValueHelp", {
        statusFormatter: o,
        constructor: function(e, t) {
            this._oController = e;
            this._mSettings = t;
            this.initialize(e)
        },
        initialize: function(e) {
            let t = e.getView();
            let r = e.getOwnerComponent();
            let s = r.getModel("i18n-operation");
            i.enhanceIndustryTypes("sap.dm.dme.i18n.operation", s);
            let a = r.getModel("i18n-status");
            let l = r.getModel("i18n-global");
            let u = r.getModel("i18n-sfc");
            let p = r.getModel("i18n-routing");
            let c = r.getModel("i18n-objectType");
            t.setModel(a, "i18n-status");
            t.setModel(s, "i18n-operation");
            t.setModel(l, "i18n-global");
            t.setModel(u, "i18n-sfc");
            t.setModel(p, "i18n-routing");
            t.setModel(c, "i18n-objectType");
            o.init(a.getResourceBundle());
            n.init(c.getResourceBundle())
        },
        onSfcOperationValueHelp: function(e, t) {
            this._oOperationInputField = e;
            return this.loadOperations(t).then(function(e) {
                this.showSfcOperationValueHelpDialog(e)
            }.bind(this)).catch(function(e) {
                this.showErrorMessage(e, true, true)
            }.bind(this))
        },
        showSfcOperationValueHelpDialog: function(e) {
            this.loadViewModel(e);
            return this.getSfcOperationValueHelpDialogPromise().then(function(e) {
                e.open();
                this._oValueHelpDialog = e
            }.bind(this))
        },
        loadViewModel: function(e) {
            let t = this.getView();
            let o = t.getModel();
            o.setProperty("/Operations", e)
        },
        getSfcOperationValueHelpDialogPromise: function() {
            let e = this.getView();
            return t.load({
                id: e.getId(),
                name: "sap.dm.dme.podfoundation.browse.view.SfcOperationBrowse",
                controller: this
            }).then(function(t) {
                e.addDependent(t);
                return t
            })
        },
        loadOperations: function(e) {
            if (!e || e.length === 0) {
                return Promise.resolve([])
            }
            const t = e.map(e => `operation eq '${e.operation}'`).join(" or ");
            const o = this.getProductDataSourceUri() + `Operations?$select=ref,operation,description,status&$filter=currentVersion eq true and (${t})`;
            return new Promise((t, n) => {
                this.ajaxGetRequest(o, null, o => {
                    t(this.combineSfcOperationData(o.value, e))
                }, (e, t) => {
                    n(e || t)
                })
            })
        },
        combineSfcOperationData: function(e, t) {
            e.forEach(e => {
                const o = t.find(t => t.operation === e.operation) || {};
                e.stepId = o.stepId;
                e.sfc = o.sfc;
                e.routingAndRevision = o.routingAndRevision
            });
            return e
        },
        onSelectOperation: function(e) {
            let t = e.getParameter("listItem");
            let o = t.getBindingContext();
            let n = this.toUpperCase(o.getProperty("operation"));
            let i = o.getProperty("ref");
            t.setSelected(false);
            this._oValueHelpDialog.close();
            let r = {
                name: n,
                ref: i
            };
            this.processOperationBrowseSelection(this._oOperationInputField, r)
        },
        onCancel: function() {
            this._oValueHelpDialog.close()
        },
        onClose: function() {
            let e = this.getView();
            e.removeDependent(this._oValueHelpDialog);
            this._oValueHelpDialog.destroy();
            this._oValueHelpDialog = null
        },
        getView: function() {
            return this._oController.getView()
        },
        showErrorMessage: function(e, t, o) {
            this._oController.showErrorMessage(e, t, o)
        },
        getProductDataSourceUri: function() {
            return this._oController.getProductDataSourceUri()
        },
        processOperationBrowseSelection: function(e, t) {
            return this._oController.processOperationBrowseSelection(e, t)
        },
        ajaxGetRequest: function(e, t, o, n) {
            this._oController.ajaxGetRequest(e, t, o, n)
        },
        toUpperCase: function(e) {
            if (r.isNotEmpty(e)) {
                return e.toUpperCase()
            }
            return e
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcShopOrderBrowse", ["sap/dm/dme/controller/BrowseBase", "sap/ui/model/json/JSONModel", "sap/dm/dme/formatter/StatusFormatter", "sap/dm/dme/formatter/ObjectTypeFormatter", "sap/dm/dme/browse/MaterialBrowse", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseListFilter"], function(e, t, r, a, i, o, s, n) {
    "use strict";
    const l = ["DONE", "CLOSED", "DISCARDED"];
    let p;
    let u = e.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowse", {
        statusFormatter: r,
        objectTypeFormatter: a,
        sMaterialRef: null,
        populateSelectItems: function() {
            let e = this.statusFormatter.getShopOrderStatusList();
            if (!this.isInactiveSfsSupported()) {
                e = this.removeInactiveStatuses(e)
            }
            this.getDialog().setModel(new t(e), "shopOrderStatusItems");
            this.getDialog().setModel(new t(this.objectTypeFormatter.getShopOrderTypeList()), "shopOrderTypeItems")
        },
        isInactiveSfsSupported: function() {
            let e = this._oParentControl.getModel("sfcStatusItems");
            let t = e.getData();
            for (let e of t) {
                if (e.key === "DONE") {
                    return true
                }
            }
            return false
        },
        removeInactiveStatuses: function(e) {
            let t = [];
            for (let r of e) {
                let e = false;
                for (let t of l) {
                    if (r.key === t) {
                        e = true;
                        break
                    }
                }
                if (!e) {
                    t[t.length] = r
                }
            }
            return t
        },
        createResultData: function(e) {
            return {
                ref: e.getProperty("ref"),
                name: e.getProperty("shopOrder"),
                buildQuantity: e.getProperty("buildQuantity"),
                releasedQuantity: e.getProperty("releasedQuantity")
            }
        },
        onMaterialBrowse: function(e) {
            let t = e.getSource().getValue();
            i.open(this.getDialog(), t, function(e) {
                this.byId("materialFilter").setValue(e.name);
                this.sMaterialRef = e.ref;
                this.onFilterBarChange()
            }.bind(this), p)
        },
        onFilterBarClear: function() {
            e.prototype.onFilterBarClear.apply(this, arguments);
            this._clearMaterialRef()
        },
        onMaterialFilterBarChange: function() {
            this._clearMaterialRef();
            this.onFilterBarChange()
        },
        getExternalFilter: function() {
            return this._createFilterByMaterial(this.sMaterialRef)
        },
        _createFilterByMaterial: function(e) {
            if (e) {
                return new o({
                    path: "materialRef",
                    operator: s.EQ,
                    value1: e
                })
            }
            return null
        },
        _clearMaterialRef: function() {
            this.sMaterialRef = null
        },
        getListFilter: function(t) {
            if (!this.isInactiveSfsSupported()) {
                return new n(t)
            }
            return e.prototype.getListFilter.apply(this, arguments)
        }
    });
    return {
        open: function(e, t, r, a, i, o) {
            p = o;
            let s = r.sFragmentName;
            return new u("shopOrderBrowse", {
                oModel: i,
                sFragmentName: s,
                oParentControl: e,
                sDefaultSearchValue: t,
                fnSelectionCallback: a,
                oFilterSettings: {
                    aLiveSearchProperties: ["shopOrder"],
                    sListBindingPath: "/ShopOrders",
                    aVariantFilterInfo: [{
                        sFilterItemName: "shopOrder"
                    }, {
                        sFilterItemName: "shopOrderType",
                        sSearchProperty: "shopOrderType/orderType"
                    }, {
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }, {
                        sFilterItemName: "plannedCompletionDate"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseFilterFactory", ["sap/dm/dme/podfoundation/browse/StatusFilterFactory"], function(e) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowseFilterFactory", {
        getStatusesToIgnore: function() {
            return ["DONE", "CLOSED", "DISCARDED"]
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseListFilter", ["sap/dm/dme/controller/ListFilter", "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseFilterFactory"], function(e, r) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowseListFilter", {
        _getFilterFactory: function(e, t) {
            return new r(e, t)
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/browse/StatusFilterFactory", ["sap/dm/dme/controller/FilterFactory"], function(t) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.browse.StatusFilterFactory", {
        _getSelectFilter: function(e, r) {
            let n = e.getSelectedKey();
            if (n !== "ALL") {
                return t.prototype._getSelectFilter.apply(this, arguments)
            } else if (r === "status") {
                let t = `${this._sBindingPath}/${r}`;
                let e = this._getEnumType(t);
                let n = this.getStatusesToIgnore();
                if (n && n.length > 0) {
                    let t = null;
                    for (let l of n) {
                        let n = this._createStatusEnumFilterPredicate(l, e, r);
                        if (!t) {
                            t = n
                        } else {
                            t = `${t} and ${n}`
                        }
                    }
                    return t
                }
            }
            return null
        },
        _createStatusEnumFilterPredicate: function(t, e, r) {
            return `${r} ne ${e}'${t}'`
        },
        getStatusesToIgnore: function() {
            return null
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/browse/WorkCenterBrowse", ["sap/dm/dme/controller/BrowseBase", "sap/ui/model/json/JSONModel", "sap/dm/dme/formatter/EnumFormatter", "sap/dm/dme/formatter/StatusFormatter", "sap/dm/dme/podfoundation/formatter/BrowseFormatter"], function(e, t, r, o, a) {
    "use strict";
    let n = e.extend("sap.dm.dme.podfoundation.browse.WorkCenterBrowse", {
        enumFormatter: r,
        statusFormatter: o,
        formatter: a,
        populateSelectItems: function() {
            this.getDialog().setModel(new t(this.statusFormatter.getWorkCenterStatusList()), "workCenterStatusItems")
        },
        createResultData: function(e, t) {
            let r = t.getBindingContext("plant");
            return {
                ref: r.getProperty("ref"),
                name: r.getProperty("workcenter")
            }
        }
    });
    return {
        open: function(e, t, r) {
            return new n("workCenterBrowse", {
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.WorkCenterBrowse",
                oParentControl: e,
                sDefaultSearchValue: t,
                fnSelectionCallback: r,
                oFilterSettings: {
                    aLiveSearchProperties: ["workcenter", "description"],
                    sListBindingPath: "/Workcenters",
                    aVariantFilterInfo: [{
                        sFilterItemName: "workcenter"
                    }, {
                        sFilterItemName: "description"
                    }, {
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "workcenterCategory"
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/WorkCenterBrowseValueHelp", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/browse/WorkCenterBrowse"], function(e, t) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.WorkCenterBrowseValueHelp", {
        constructor: function(e, t) {
            this._oController = e;
            this._mSettings = t
        },
        open: function(e) {
            let o = e;
            if (e.getSource) {
                o = e.getSource()
            }
            let n = this.getView();
            let r = this;
            t.open(n, o.getValue(), function(e) {
                this._handleWorkCenterBrowse(o, e)
            }.bind(this))
        },
        _handleWorkCenterBrowse: function(e, t) {
            this.processWorkCenterBrowseSelection(e, t)
        },
        getView: function() {
            return this._oController.getView()
        },
        processWorkCenterBrowseSelection: function(e, t) {
            return this._oController.processWorkCenterBrowseSelection(e, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowse", ["sap/dm/dme/controller/BrowseBase", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/dm/dme/podfoundation/formatter/BrowseFormatter", "sap/ui/core/format/DateFormat"], function(e, t, r, a, n, o) {
    "use strict";
    let i = e.extend("sap.dm.dme.podfoundation.browse.WorkCenterResourceBrowse", {
        formatter: n,
        populateSelectItems: function() {
            this.getDialog().setModel(new t(n.getResourceStatusList()), "statusItems")
        },
        createResultData: function(e, t) {
            return {
                ref: e.getProperty("ref"),
                name: e.getProperty("resource")
            }
        },
        getExternalFilter: function() {
            let e = this.byId("statusFilter");
            let t = this.byId("resourceTypeFilter");
            let r = this.byId("creationTimeRangeFilter");
            return [this._createStatusFilter(e), this._createFilterByResourceType(t), this._createDateTimeCreationFilter(r)]
        },
        _createStatusFilter: function(e) {
            if (!e.getSelectedItem()) {
                return null
            }
            let t = e.getSelectedItem().getKey();
            if (!t) {
                return null
            }
            if (t !== "ALL") {
                return new r({
                    path: "status",
                    operator: a.EQ,
                    variable: "item",
                    value1: t
                })
            } else {
                return null
            }
        },
        _createFilterByResourceType: function(e) {
            if (!e.getSelectedItem()) {
                return null
            }
            let t = e.getSelectedItem().getText();
            let a = new r("resourceTypeAsText", sap.ui.model.FilterOperator.Contains, t);
            return a
        },
        _createDateTimeCreationFilter: function(e) {
            if (e.getDateValue() && e.getSecondDateValue()) {
                let t = o.getDateInstance({
                    pattern: "yyyy-MM-ddT00:00:00.000"
                });
                let n = o.getDateInstance({
                    pattern: "yyyy-MM-ddT23:59:59.999"
                });
                let i = t.format(new Date(e.getDateValue())) + "Z";
                let s = n.format(new Date(e.getSecondDateValue())) + "Z";
                return new r({
                    path: "resourceTypecreatedDateTime",
                    operator: a.BT,
                    value1: i,
                    value2: s
                })
            }
            return null
        },
        getResourceTypesAsText: function(e) {
            let t = this.byId("resultTable").getItems();
            let r = null;
            let a;
            t.some(function(t) {
                if (t.getBindingContext().getProperty("ref") === e) {
                    r = t.getBindingContext().getObject("resourceTypeResources")
                }
                return r !== null
            });
            r = r || [];
            a = r.map(function(e) {
                return e.resourceType.resourceType
            });
            return a.join(", ")
        }
    });
    return {
        open: function(e, r, a, n) {
            return new i("resourceFilter", {
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.WorkCenterResourceBrowse",
                oParentControl: e,
                oModel: new t(a),
                sDefaultSearchValue: r,
                fnSelectionCallback: n,
                oFilterSettings: {
                    aLiveSearchProperties: ["resource", "description"],
                    sListBindingPath: "/items",
                    aVariantFilterInfo: [{
                        sFilterItemName: "resource"
                    }, {
                        sFilterItemName: "description"
                    }, {
                        sFilterItemName: "status"
                    }, {
                        sFilterItemName: "resourceTypeResourceType: "
                    }, {
                        sFilterItemName: "creationTimeRange",
                        sSearchProperty: "createdDateTime"
                    }]
                }
            })
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowseValueHelp", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowse"], function(e, o) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.browse.WorkCenterResourceBrowseValueHelp", {
        constructor: function(e, o) {
            this._oController = e;
            this._mSettings = o
        },
        open: function(e, r) {
            let t = e;
            if (e.getSource) {
                t = e.getSource()
            }
            let n = this.getView();
            let s = this;
            o.open(n, t.getValue(), r, function(e) {
                s._handleWorkCenterResourceBrowse(t, e)
            })
        },
        _handleWorkCenterResourceBrowse: function(e, o) {
            this.processWorkCenterResourceBrowseSelection(e, o)
        },
        getView: function() {
            return this._oController.getView()
        },
        processWorkCenterResourceBrowseSelection: function(e, o) {
            return this._oController.processWorkCenterResourceBrowseSelection(e, o)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/component/production/ProductionComponent", ["sap/ui/core/Component", "sap/dm/dme/podfoundation/popup/PopupHandler", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/controller/Constants", "sap/dm/dme/model/ResourceModelEnhancer", "sap/dm/dme/podfoundation/model/Selection", "sap/dm/dme/podfoundation/model/SfcKeyData"], function(t, e, o, r, n, i, s) {
    "use strict";
    const u = "checkForOpenNonConformanceExtension.openNc.found";
    let l = t.extend("sap.dm.dme.podfoundation.component.production.ProductionComponent", {
        metadata: {
            metadata: {
                manifest: "json"
            },
            properties: {
                id: {
                    type: "string",
                    group: "Misc"
                },
                pluginId: {
                    type: "string",
                    group: "Misc"
                },
                pageName: {
                    type: "string",
                    group: "Misc"
                },
                podController: {
                    type: "object",
                    group: "Misc"
                },
                configuration: {
                    type: "object",
                    group: "Misc"
                },
                lastButtonAction: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                }
            },
            publicMethods: ["execute", "complete", "isBlockingEnabled", "subscribe", "unsubscribe", "publish"]
        },
        init: function() {
            n.enhanceModelsfromManifest(this)
        }
    });
    l.prototype.subscriptions = {};
    l.prototype._subscribeEvents = function() {
        for (let t in this.subscriptions) {
            let e = this.subscriptions[t];
            if (e === true) {
                e = "on" + t
            }
            this.subscribe(t, this[e], this)
        }
    };
    l.prototype._unsubscribeEvents = function() {
        for (let t in this.subscriptions) {
            let e = this.subscriptions[t];
            if (e === true) {
                e = "on" + t
            }
            this.unsubscribe(t, this[e], this)
        }
    };
    l.prototype.subscribe = function(t, e, o) {
        if (this.isUsingEventBus()) {
            let n = this._getEventBus();
            n.subscribe(r.POD_EVENT_CHANNEL, t, e, o);
            return
        }
        let n = this._getEventHandler();
        n.subscribe(this, t, e, o)
    };
    l.prototype.unsubscribe = function(t, e, o) {
        if (this.isUsingEventBus()) {
            let n = this._getEventBus();
            if (n) {
                n.unsubscribe(r.POD_EVENT_CHANNEL, t, e, o)
            }
            return
        }
        let n = this._getEventHandler();
        n.unsubscribe(this, t, e, o)
    };
    l.prototype.setPodController = function(t) {
        this.setProperty("podController", t);
        return this
    };
    l.prototype.setId = function(t) {
        this.setProperty("id", t);
        return this
    };
    l.prototype.setPluginId = function(t) {
        this.setProperty("pluginId", t);
        return this
    };
    l.prototype.setConfiguration = function(t) {
        this.setProperty("configuration", t);
        return this
    };
    l.prototype.getPodSelectionModel = function() {
        let t = this.getPodController();
        if (t && t.getPodSelectionModel) {
            let e = t.getPodSelectionModel();
            if (e) {
                return e
            }
        }
        let e = this._getPodControllerViewParent();
        if (e && e.getModel) {
            let t = e.getModel("podSelectionModel");
            return t.getData()
        }
        return null
    };
    l.prototype._getPodControllerViewParent = function() {
        let t = this._getPodControllerView();
        if (t && t.getParent) {
            return t.getParent()
        }
        return null
    };
    l.prototype._getPodControllerView = function() {
        return this.getPodController().getView()
    };
    l.prototype.execute = function() {
        return true
    };
    l.prototype.isSynchronousExecution = function() {
        return false
    };
    l.prototype.isExecuteReturningPromise = function() {
        return false
    };
    l.prototype.complete = function(t) {
        let e = t;
        if (typeof t === "undefined") {
            e = false
        }
        let o = this.getPodController();
        this._delayedCall(o, e)
    };
    l.prototype.destroyPlugin = function() {
        let t = this.getPodController();
        t.destroyExecutionPlugin(this)
    };
    l.prototype._delayedCall = function(t, e) {
        let o = this.getCompleteTimeoutTimerValue();
        setTimeout(function() {
            t.completeExecution(e)
        }, o)
    };
    l.prototype.executeNavigationButton = function(t, e, r) {
        if (o.isNotEmpty(t)) {
            this.getPodController().executeNavigationButton(t, e, r)
        }
    };
    l.prototype.executeActionButton = function(t, e, r) {
        if (o.isNotEmpty(t)) {
            this.getPodController().executeActionButton(t, e, r)
        }
    };
    l.prototype.executePlugin = function(t, e, r) {
        if (o.isNotEmpty(t)) {
            this.getPodController().executePlugin(t, e, r)
        }
    };
    l.prototype.removeMessageFromPopover = function(t, e) {
        this.getPodController().removeMessageFromPopover(t, e)
    };
    l.prototype.addMessageToPopover = function(t, e, o) {
        return this.getPodController().addMessageToPopover(t, e, o)
    };
    l.prototype.closeMessagePopover = function() {
        this.getPodController().closeMessagePopover()
    };
    l.prototype.addMessage = function(t, e, o, r) {
        return this.getPodController().addMessage(t, e, o, r)
    };
    l.prototype.clearMessages = function() {
        let t = this.getPodController();
        if (t && t.clearMessages) {
            this.getPodController().clearMessages()
        }
    };
    l.prototype.isUsingEventBus = function() {
        let t = this.getPodController();
        if (t.isUsingEventBus) {
            return t.isUsingEventBus()
        }
        return true
    };
    l.prototype._getEventHandler = function() {
        let t = this.getPodController();
        if (t.getEventHandler) {
            return t.getEventHandler()
        }
        return null
    };
    l.prototype.publish = function(t, e) {
        if (this.isUsingEventBus()) {
            let o = e;
            o.pluginId = this.getPluginId();
            let n = this._getEventBus();
            n.publish(r.POD_EVENT_CHANNEL, t, o);
            return
        }
        let o = this._getEventHandler();
        o.publish(this, t, e)
    };
    l.prototype.setBusy = function(t) {
        this.getPodController().getView().setBusy(t)
    };
    l.prototype.ajaxGetRequest = function(t, e, o, r) {
        this.getPodController().ajaxGetRequest(t, e, o, r)
    };
    l.prototype.ajaxPostRequest = function(t, e, o, r) {
        this.getPodController().ajaxPostRequest(t, e, o, r)
    };
    l.prototype.ajaxPatchRequest = function(t, e, o, r) {
        this.getPodController().ajaxPatchRequest(t, e, o, r)
    };
    l.prototype.ajaxPutRequest = function(t, e, o, r) {
        this.getPodController().ajaxPutRequest(t, e, o, r)
    };
    l.prototype.ajaxDeleteRequest = function(t, e, o, r) {
        this.getPodController().ajaxDeleteRequest(t, e, o, r)
    };
    l.prototype.getQueryParameter = function(t) {
        return this.getPodController().getQueryParameter(t)
    };
    l.prototype.showErrorMessage = function(t, e, o) {
        t = this._enrichOpenNcError(t);
        this.getPodController().showErrorMessage(t, e, o)
    };
    l.prototype.showSuccessMessage = function(t, e, o) {
        let r = this.getPodController();
        if (r) {
            r.showSuccessMessage(t, e, o)
        }
    };
    l.prototype.showMessage = function(t, e, o, r) {
        let n = this.getPodController();
        if (n) {
            n.showMessage(t, e, o, r)
        }
    };
    l.prototype._enrichOpenNcError = function(t) {
        if (this._isOpenNcError(t)) {
            let e = t.error.message;
            for (let o in t.error.openNcs) {
                e += "\n";
                e += o + ": " + t.error.openNcs[o].join(", ")
            }
            return e
        } else {
            return t
        }
    };
    l.prototype._isOpenNcError = function(t) {
        return typeof t === "object" && t.error && t.error.code === u
    };
    l.prototype.getI18nText = function(t, e) {
        if (!this.i18nResourceBundle) {
            let t = this.getModel("i18n");
            if (t) {
                this.i18nResourceBundle = t.getResourceBundle()
            }
        }
        if (!this.i18nResourceBundle) {
            return t
        }
        return this.i18nResourceBundle.getText(t, e)
    };
    l.prototype.getUserId = function() {
        let t = this.getPodController();
        if (t && t.getUserId) {
            return t.getUserId()
        }
        return null
    };
    l.prototype.getPlantDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPlantDataSourceUri) {
            return t.getPlantDataSourceUri()
        }
        return null
    };
    l.prototype.getProductDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductDataSourceUri) {
            return t.getProductDataSourceUri()
        }
        return null
    };
    l.prototype.getProductionDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductionDataSourceUri) {
            return t.getProductionDataSourceUri()
        }
        return null
    };
    l.prototype.getPodFoundationDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPodFoundationDataSourceUri) {
            return t.getPodFoundationDataSourceUri()
        }
        return null
    };
    l.prototype.getNonConformanceDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getNonConformanceDataSourceUri) {
            return t.getNonConformanceDataSourceUri()
        }
        return null
    };
    l.prototype.getAssemblyDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAssemblyDataSourceUri) {
            return t.getAssemblyDataSourceUri()
        }
        return null
    };
    l.prototype.getInventoryDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getInventoryDataSourceUri) {
            return t.getInventoryDataSourceUri()
        }
        return null
    };
    l.prototype.getPublicApiRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPublicApiRestDataSourceUri) {
            return t.getPublicApiRestDataSourceUri()
        }
        return null
    };
    l.prototype.getPeRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPeRestDataSourceUri) {
            return t.getPeRestDataSourceUri()
        }
        return null
    };
    l.prototype.getTimeTrackingRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getTimeTrackingRestDataSourceUri) {
            return t.getTimeTrackingRestDataSourceUri()
        }
        return null
    };
    l.prototype.getActivityConfirmationRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getActivityConfirmationRestDataSourceUri) {
            return t.getActivityConfirmationRestDataSourceUri()
        }
        return null
    };
    l.prototype._getEventBus = function() {
        let t = this.getPodController();
        if (t && t.getEventBus) {
            return t.getEventBus()
        }
        return null
    };
    l.prototype._refreshDataAndEndExecution = function(t, e, o) {
        let r = this.getLastButtonAction();
        if (r) {
            this.fireFinishedExecution(t)
        }
        if (!e || t.processLot || t.sfcs.length > 1) {
            t.source = this;
            t.sendToAllPages = true;
            this.publish("WorklistRefreshEvent", t)
        }
        if (o) {
            this.publish("AutoAssembledSfcStateChangedEvent", t)
        }
        let n = 0;
        if (!r) {
            this.fireFinishedExecution(t);
            n = 1e3
        }
        let i = this;
        setTimeout(function() {
            i.complete()
        }, n)
    };
    l.prototype.fireStartExecution = function(t) {
        t.source = this;
        t.sendToAllPages = true;
        this.publish("StartExecutionEvent", t)
    };
    l.prototype.fireFinishedExecution = function(t) {
        t.source = this;
        t.sendToAllPages = true;
        this.publish("FinishedExecutionEvent", t)
    };
    l.prototype.getCompleteTimeoutTimerValue = function() {
        return 125
    };
    l.prototype.getPodOwnerComponent = function() {
        let t = this.getPodController();
        if (t) {
            return t.getOwnerComponent()
        }
        return null
    };
    l.prototype.getGlobalProperty = function(t) {
        let e = this.getPodOwnerComponent();
        if (e) {
            return e.getGlobalProperty(t)
        }
        return null
    };
    l.prototype.setGlobalProperty = function(t, e) {
        let o = this.getPodOwnerComponent();
        if (o) {
            o.setGlobalProperty(t, e)
        }
    };
    l.prototype.removeGlobalProperty = function(t) {
        let e = this.getPodOwnerComponent();
        if (e) {
            return e.removeGlobalProperty(t)
        }
        return null
    };
    l.prototype.getGlobalModel = function() {
        let t = this.getPodOwnerComponent();
        if (t) {
            return t.getGlobalModel()
        }
        return null
    };
    return l
});
sap.ui.predefine("sap/dm/dme/podfoundation/component/production/ProductionProcessComponent", ["sap/dm/dme/podfoundation/component/production/ProductionComponent", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/util/PlantSettings", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/podfoundation/model/InputType"], function(e, t, r, s, i) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.component.production.ProductionProcessComponent", {
        constructor: function(t, r) {
            e.apply(this, arguments)
        },
        _getPodSelectionData: function() {
            let e = this.getPodSelectionModel();
            if (!e) {
                return {}
            }
            let i = this._getSelectionDataFromModel(e);
            i.operations = this._getOperationsFromModel(e);
            let a;
            if (e.podType === s.Order) {
                a = this.getGlobalProperty("selectedPhaseResource");
                if (t.isNotEmpty(a)) {
                    i.resource = a
                }
                i.workCenter = e.getSelectedPhaseWorkCenter()
            } else {
                a = e.getResource();
                if (a && t.isNotEmpty(a.resource)) {
                    i.resource = a.resource
                }
                i.workCenter = e.getWorkCenter()
            }
            i.quantity = e.getQuantity();
            i.plant = r.getCurrentPlant();
            return i
        },
        _getSelectionDataFromModel: function(e) {
            const r = e.getInputType();
            let s = {};
            let a = [],
                o = [],
                n = [],
                u = [],
                l, g, c;
            let d = e.getSelections();
            if (d && d.length > 0) {
                d.forEach(function(e) {
                    let s = e.getInput();
                    if (t.isEmpty(s)) {
                        if (e.getSfc()) {
                            s = e.getSfc().getSfc();
                            c = i.Sfc
                        } else if (e.getProcessLot()) {
                            s = e.getProcessLot().getProcessLot();
                            c = i.ProcessLot
                        }
                    } else {
                        c = r
                    }
                    if (t.isNotEmpty(s)) {
                        a.push(s);
                        g = e.getShopOrder();
                        if (g && g.getShopOrder()) {
                            o.push(g.getShopOrder())
                        }
                        l = e.getSfcData();
                        if (l) {
                            n.push({
                                material: l.getMaterial(),
                                version: l.getMaterialVersion()
                            });
                            u.push({
                                routing: l.getRouting(),
                                version: l.getRoutingVersion()
                            })
                        }
                    }
                })
            }
            if (c === i.Sfc) {
                s.processLots = null;
                s.sfcs = a
            } else if (c === i.ProcessLot) {
                s.sfcs = null;
                s.processLots = a
            }
            s.orders = o;
            s.materials = n;
            s.routings = u;
            return s
        },
        _getOperationsFromModel: function(e) {
            let t = e.getOperations();
            let r = [];
            if (t && t.length > 0) {
                t.forEach(function(e) {
                    if (e.operation) {
                        r.push(e.operation)
                    }
                })
            }
            return r
        },
        _getStringParameterData: function(e, r) {
            let s = null;
            if (e.variable !== "EMPTY") {
                s = this._getPodDataValue(e, r)
            } else if (e.type === "string") {
                s = e.constant
            } else if (t.isNotEmpty(e.constant)) {
                let r = e.constant.split(",");
                s = [];
                for (let e = 0; e < r.length; e++) {
                    if (t.isNotEmpty(r[e])) {
                        s[s.length] = r[e]
                    }
                }
            }
            if (!s) {
                return null
            }
            return {
                key: e.parameter,
                value: s
            }
        },
        _getPodDataValue: function(e, t) {
            let r;
            switch (e.variable) {
                case "WORK_CENTER":
                    r = this._getResultData(t.workCenter, e, "required.workcenter.missing");
                    break;
                case "RESOURCE":
                    r = this._getResultData(t.resource, e, "required.resource.missing");
                    break;
                case "SFC":
                    r = this._getResultData(t.sfcs, e, "required.sfc.missing");
                    break;
                case "OPERATION":
                    r = this._getResultData(t.operations, e, "required.operation.missing");
                    break;
                case "ORDER":
                    r = this._getResultData(t.orders, e, "required.order.missing");
                    break;
                case "PLANT":
                    r = this._getResultData(t.plant, e, "required.plant.missing");
                    break;
                case "MATERIAL":
                    r = this._getMaterialResultData(t.materials, e);
                    break;
                case "ROUTING":
                    r = this._getRoutingResultData(t.routings, e);
                    break;
                case "QUANTITY":
                    r = this._getResultData(t.quantity, e, "required.quantity.missing");
                    break;
                case "USER_ID":
                    r = this._getResultData(this.getUserId(), e, "required.userId.missing");
                    break;
                case "PROCESS_LOT":
                    r = this._getResultData(t.processLots, e, "required.processLot.missing");
                    break;
                default:
                    throw {
                        message: "Invalid variable name encountered (" + e.variable + ""
                    }
            }
            return r
        },
        _getResultData: function(e, r, s) {
            if (t.isEmpty(e) && r.required) {
                throw {
                    message: this.getI18nText(s)
                }
            }
            return this._formatPodDataReturnValue(e, r)
        },
        _getRoutingResultData: function(e, r) {
            if (t.isEmpty(e) && r.required) {
                throw {
                    message: this.getI18nText("required.routing.missing")
                }
            }
            let s = [];
            for (let t = 0; t < e.length; t++) {
                s[s.length] = e[t].routing
            }
            return this._formatPodDataReturnValue(s, r)
        },
        _getMaterialResultData: function(e, r) {
            if (t.isEmpty(e) && r.required) {
                throw {
                    message: this.getI18nText("required.material.missing")
                }
            }
            let s = [];
            for (let t = 0; t < e.length; t++) {
                s[s.length] = e[t].material
            }
            return this._formatPodDataReturnValue(s, r)
        },
        _formatPodDataReturnValue: function(e, r) {
            if (!e) {
                return null
            }
            let s = null;
            if (!Array.isArray(e) && t.isNotEmpty(e)) {
                s = e;
                if (r.type === "array") {
                    s = [e]
                }
            } else if (Array.isArray(e) && e.length > 0) {
                s = e;
                if (r.type !== "array") {
                    s = e[0]
                }
            }
            return s
        },
        _addParameter: function(e, t, r, s) {
            return e + t + r + "=" + s
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/component/production/ProductionUIComponent", ["sap/dm/dme/logging/Logging", "sap/ui/core/UIComponent", "sap/dm/dme/model/ResourceModelEnhancer", "sap/dm/dme/util/PlantSettings"], function(e, t, o, r) {
    "use strict";
    var n = e.getLogger("sap.dm.dme.podfoundation.component.production.ProductionUIComponent");
    var i = t.extend("sap.dm.dme.podfoundation.component.production.ProductionUIComponent", {
        metadata: {
            metadata: {
                manifest: "json"
            },
            properties: {
                podController: {
                    type: "object",
                    group: "Misc"
                },
                tabItem: {
                    type: "object",
                    group: "Misc"
                },
                pageName: {
                    type: "string",
                    group: "Misc"
                },
                pluginId: {
                    type: "string",
                    group: "Misc"
                },
                displayType: {
                    type: "string",
                    group: "Misc"
                },
                defaultPlugin: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                configuration: {
                    type: "object",
                    group: "Misc"
                }
            }
        },
        init: function() {
            t.prototype.init.apply(this, arguments);
            this._processODataHttpHeaders();
            o.enhanceModelsfromManifest(this)
        },
        destroy: function() {
            t.prototype.destroy.apply(this, arguments)
        },
        _processODataHttpHeaders: function() {
            var e = this.getManifestEntry("/sap.ui5/models");
            if (e) {
                var t = Object.getOwnPropertyNames(e);
                for (var o = 0; o < t.length; o++) {
                    var i = t[o];
                    var p = i.length > 0 ? this.getModel(i) : this.getModel();
                    if (p instanceof sap.ui.model.odata.v4.ODataModel) {
                        var a = r.getCurrentPlant();
                        p.changeHttpHeaders({
                            "x-dme-plant": a
                        });
                        n.info("Plant HTTP header set for model '" + i + "'")
                    } else {
                        n.info("Plant HTTP header not set for model '" + i + "'")
                    }
                }
            }
        }
    });
    i.prototype.setPodController = function(e) {
        if (e) {
            this.setProperty("podController", e)
        }
        return this
    };
    i.prototype.getPodSelectionModel = function() {
        var e = this._getPodControllerViewParent();
        if (e && e.getModel) {
            var t = e.getModel("podSelectionModel");
            return t.getData()
        }
        return null
    };
    i.prototype._getPodControllerViewParent = function() {
        var e = this._getPodControllerView();
        if (e && e.getParent) {
            return e.getParent()
        }
        return undefined
    };
    i.prototype._getPodControllerView = function() {
        var e = this.getPodController();
        if (e && e.getView) {
            return e.getView()
        }
        return undefined
    };
    i.prototype.getPodOwnerComponent = function() {
        var e = this.getPodController();
        if (e) {
            return e.getOwnerComponent()
        }
        return null
    };
    i.prototype.getGlobalProperty = function(e) {
        var t = this.getPodOwnerComponent();
        if (t) {
            return t.getGlobalProperty(e)
        }
        return null
    };
    i.prototype.setGlobalProperty = function(e, t) {
        var o = this.getPodOwnerComponent();
        if (o) {
            o.setGlobalProperty(e, t)
        }
    };
    i.prototype.removeGlobalProperty = function(e) {
        var t = this.getPodOwnerComponent();
        if (t) {
            return t.removeGlobalProperty(e)
        }
        return null
    };
    i.prototype.getGlobalModel = function() {
        var e = this.getPodOwnerComponent();
        if (e) {
            return e.getGlobalModel()
        }
        return null
    };
    i.prototype.getUserPreferencesConfig = function() {
        return this._getDmeAppManifestConfig().userPreferences
    };
    i.prototype._getDmeAppManifestConfig = function() {
        return this.getManifestEntry("dme.app") || {}
    };
    return i
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/ActionAssignmentHelper", ["sap/ui/base/Object", "sap/ui/core/syncStyleClass", "sap/ui/model/json/JSONModel", "sap/dm/dme/podfoundation/controller/ActionAssignmentViewController", "sap/dm/dme/podfoundation/controller/PluginAssignmentViewController"], function(t, o, i, e, r) {
    "use strict";
    var n = t.extend("sap.dm.dme.podfoundation.control.ActionAssignmentHelper", {
        constructor: function(o, i, e) {
            t.apply(this, arguments);
            this._oPropertyEditor = o;
            this._sButtonType = i;
            this._sAssignmentIId = e
        }
    });
    n.prototype._getAddRemoveActionAssignmentDialog = function(t, i) {
        var e = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.AddRemoveActionAssignmentDialog", t);
        i.addDependent(e);
        o("sapUiSizeCompact", i, e);
        return e
    };
    n.prototype._getActionAssignmentDialog = function(t, i) {
        var e = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ActionAssignmentDialog", t);
        i.addDependent(e);
        o("sapUiSizeCompact", i, e);
        return e
    };
    n.prototype._getPluginAssignmentDialog = function(t, i) {
        var e = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.PluginAssignmentDialog", t);
        i.addDependent(e);
        o("sapUiSizeCompact", i, e);
        return e
    };
    n.prototype.onDialogClose = function(t) {
        this._actionsDialog.close();
        var o = this._actionDialogController.getAssignedActions();
        this._updateAssignedActions(o);
        if (!this._isPodDesignerPropertyEditor()) {
            this._registerActions()
        }
        this._actionsDialog.detachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
        this._actionsDialog.detachAfterOpen(this._actionDialogController.afterOpen, this._actionDialogController);
        this._actionsDialog.destroy();
        this._actionsDialog = null;
        this._popActionAssignmentController();
        var i = this._peekActionAssignmentController();
        if (i) {
            i.refreshFormContainer()
        }
    };
    n.prototype.onPluginAssignmentDialogClose = function(t) {
        this._actionsDialog.close();
        var o = this._actionDialogController.getAssignedPlugin();
        this._updateAssignedPlugin(o);
        if (!this._isPodDesignerPropertyEditor()) {
            this._registerActions()
        }
        this._actionsDialog.detachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
        this._actionsDialog.destroy();
        this._actionsDialog = null
    };
    n.prototype._getMainController = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getMainController) {
            return this._oPropertyEditor.getMainController()
        }
        return null
    };
    n.prototype._isPodDesignerPropertyEditor = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.isPodDesignerPropertyEditor) {
            return this._oPropertyEditor.isPodDesignerPropertyEditor()
        }
        return false
    };
    n.prototype._getPropertyData = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getPropertyData) {
            return this._oPropertyEditor.getPropertyData()
        }
        return null
    };
    n.prototype._updateAssignedActions = function(t) {
        if (this._oPropertyEditor && this._oPropertyEditor.updateAssignedActions) {
            this._oPropertyEditor.updateAssignedActions(t, this._sAssignmentIId)
        }
    };
    n.prototype._updateAssignedPlugin = function(t) {
        if (this._oPropertyEditor && this._oPropertyEditor.updateAssignedPlugin) {
            this._oPropertyEditor.updateAssignedPlugin(t, this._sAssignmentIId)
        }
    };
    n.prototype._registerActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.registerActions) {
            this._oPropertyEditor.registerActions(this._sAssignmentIId)
        }
    };
    n.prototype._getActionSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getActionSelections) {
            return this._oPropertyEditor.getActionSelections()
        }
        return null
    };
    n.prototype._getNavigationPageSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getNavigationPageSelections) {
            return this._oPropertyEditor.getNavigationPageSelections()
        }
        return null
    };
    n.prototype._getTabPageSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getTabPageSelections) {
            return this._oPropertyEditor.getTabPageSelections()
        }
        return null
    };
    n.prototype._getAssignedActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAssignedActions) {
            return this._oPropertyEditor.getAssignedActions()
        }
        return null
    };
    n.prototype._getAssignedPlugin = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAssignedPlugin) {
            return this._oPropertyEditor.getAssignedPlugin()
        }
        return null
    };
    n.prototype._getAvailableActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAvailableActions) {
            return this._oPropertyEditor.getAvailableActions()
        }
        return null
    };
    n.prototype._getExecutionPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getExecutionPropertyEditors) {
            return this._oPropertyEditor.getExecutionPropertyEditors()
        }
        return null
    };
    n.prototype._getProductionProcessPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getProductionProcessPropertyEditors) {
            return this._oPropertyEditor.getProductionProcessPropertyEditors()
        }
        return null
    };
    n.prototype._getEventPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getEventPropertyEditors) {
            return this._oPropertyEditor.getEventPropertyEditors()
        }
        return null
    };
    n.prototype._getTransactionPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getTransactionPropertyEditors) {
            return this._oPropertyEditor.getTransactionPropertyEditors()
        }
        return null
    };
    n.prototype._getMenuItemLabelList = function(t) {
        if (this._oPropertyEditor && this._oPropertyEditor.getMenuItemLabelList) {
            return this._oPropertyEditor.getMenuItemLabelList(t)
        }
        return null
    };
    n.prototype._getActionAssignmentDialogTitle = function(t) {
        if (this._oPropertyEditor && this._oPropertyEditor.getActionAssignmentDialogTitle) {
            return this._oPropertyEditor.getActionAssignmentDialogTitle(t)
        }
        return null
    };
    n.prototype._getPluginAssignmentDialogTitle = function(t) {
        if (this._oPropertyEditor && this._oPropertyEditor.getPluginAssignmentDialogTitle) {
            return this._oPropertyEditor.getPluginAssignmentDialogTitle(t)
        }
        return null
    };
    n.prototype._isActionButton = function() {
        if (this._sButtonType === "ACTION_BUTTON") {
            return true
        }
        return false
    };
    n.prototype._getActionAssignmentButtonType = function() {
        if (this._isActionButton()) {
            return "ACTION_BUTTON"
        }
        return "MENU_BUTTON"
    };
    n.prototype.showActionAssignmentDialog = function() {
        this._createAndOpenActionAssignmentDialog("ACTION_ASSIGNMENT")
    };
    n.prototype.showAddRemoveActionAssignmentDialog = function() {
        this._createAndOpenActionAssignmentDialog("ADD_REMOVE_ACTION_ASSIGNMENT")
    };
    n.prototype._createAndOpenActionAssignmentDialog = function(t) {
        var o = this._getMainController();
        if (!o) {
            throw {
                message: "POD Designer controller is not defined to property editor"
            }
        }
        var r = o.getMainControllerHelper();
        if (!r) {
            throw {
                message: "POD Designer helper is not defined to POD Designer controller"
            }
        }
        if (!this._actionsDialog) {
            this._actionDialogController = new e;
            this._actionDialogController.setMainControllerHelper(r);
            this._actionDialogController.setMainController(o);
            this._actionDialogController.setAssignedKeyId("pluginId");
            this._actionDialogController.setAvailableKeyId("plugin");
            this._actionDialogController.setShowPopupProperties(true);
            this._actionsDialog = this._getActionAssignmentDialog(this._actionDialogController, o.getView());
            this._actionsDialog.attachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
            this._actionsDialog.attachAfterOpen(this._actionDialogController.afterOpen, this._actionDialogController);
            var n = this;
            this._actionsDialog.setEscapeHandler(function(t) {
                n.onDialogClose();
                t.resolve()
            })
        }
        var s = this._getAssignedActions();
        this._actionDialogController.setAssignedActions(s);
        this._actionDialogController.setActionSelections(this._getActionSelections());
        this._actionDialogController.setTabPageSelections(this._getTabPageSelections());
        this._actionDialogController.setNavigationPageSelections(this._getNavigationPageSelections());
        this._actionDialogController.setPropertyEditors(this._getExecutionPropertyEditors());
        this._actionDialogController.setEventPropertyEditors(this._getEventPropertyEditors());
        this._actionDialogController.setTransactionPropertyEditors(this._getTransactionPropertyEditors());
        this._actionDialogController.setProductionProcessPropertyEditors(this._getProductionProcessPropertyEditors());
        this._actionDialogController.setCloseHandler(this);
        this._actionDialogController.setActionAssignmentDialog(this._actionsDialog);
        var l = this._getAvailableActions();
        this.filterOutParentPlugin(l);
        var a = this._getMenuItemLabelList(this._sAssignmentIId);
        var g = {
            dialogType: t,
            buttonType: this._getActionAssignmentButtonType(),
            buttonTypeLabel: this._getActionAssignmentDialogTitle(this._sAssignmentIId),
            I18nButtonLabels: a.I18nButtonLabels,
            Actions: [],
            AvailableActions: l,
            AssignedComponents: s
        };
        var p = new i;
        p.setData(g);
        this._actionsDialog.setModel(p, "DialogModel");
        this._pushActionAssignmentController(this._actionDialogController);
        this._actionsDialog.open()
    };
    n.prototype._pushActionAssignmentController = function(t) {
        var o = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!o) {
            o = []
        }
        o.push(t);
        this._getMainController().setGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS", o)
    };
    n.prototype._popActionAssignmentController = function() {
        var t = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!t || t.length === 0) {
            return null
        }
        var o = t.pop();
        this._getMainController().setGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS", t);
        return o
    };
    n.prototype._peekActionAssignmentController = function() {
        var t = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!t || t.length === 0) {
            return null
        }
        return t[t.length - 1]
    };
    n.prototype.showPluginAssignmentDialog = function() {
        var t = this._getMainController();
        if (!t) {
            throw {
                message: "POD Designer controller is not defined to property editor"
            }
        }
        var o = t.getMainControllerHelper();
        if (!o) {
            throw {
                message: "POD Designer helper is not defined to POD Designer controller"
            }
        }
        if (!this._actionsDialog) {
            this._actionDialogController = new r;
            this._actionDialogController.setMainControllerHelper(o);
            this._actionDialogController.setMainController(t);
            this._actionDialogController.setNavigationPageSelections(this._getNavigationPageSelections());
            this._actionDialogController.setTabPageSelections(this._getTabPageSelections());
            this._actionDialogController.setAvailableKeyId("plugin");
            this._actionDialogController.setShowPopupProperties(true);
            this._actionsDialog = this._getPluginAssignmentDialog(this._actionDialogController, t.getView());
            this._actionsDialog.attachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
            var e = this;
            this._actionsDialog.setEscapeHandler(function(t) {
                e.onPluginAssignmentDialogClose();
                t.resolve()
            })
        }
        var n = this._getAssignedPlugin();
        this._actionDialogController.setAssignedPlugin(n);
        this._actionDialogController.setPropertyEditors(this._getExecutionPropertyEditors());
        this._actionDialogController.setCloseHandler(this);
        this._actionDialogController.setActionAssignmentDialog(this._actionsDialog);
        var s = this._getAvailableActions();
        this.filterOutParentPlugin(s);
        var l = {
            buttonType: null,
            buttonTypeLabel: this._getPluginAssignmentDialogTitle(),
            I18nButtonLabels: null,
            Actions: [],
            AvailableActions: s,
            Assigned: false
        };
        var a = new i;
        a.setData(l);
        this._actionsDialog.setModel(a, "DialogModel");
        this._actionsDialog.open()
    };
    n.prototype.filterOutParentPlugin = function(t) {
        var o = this._oPropertyEditor.getId();
        if (o.indexOf(".") > 0) {
            o = o.substring(0, o.indexOf("."))
        }
        var i = -1;
        for (var e = 0; e < t.length; e++) {
            if (t[e].id === o && !t[e].multiInstance) {
                i = e;
                break
            }
        }
        if (i >= 0) {
            t.splice(i, 1)
        }
    };
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/ActionButton", ["sap/dm/dme/podfoundation/control/ConfigurableButton"], function(t) {
    "use strict";
    var n = t.extend("sap.dm.dme.podfoundation.control.ActionButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "array",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },
        constructor: function(n, o) {
            t.apply(this, arguments)
        },
        renderer: {},
        init: function() {
            if (t.prototype.init) {
                t.prototype.init.apply(this, arguments)
            }
            this.attachPress(this.onButtonPress, this)
        },
        setPodController: function(t) {
            this._oPodController = t
        },
        getPodController: function(t) {
            return this._oPodController
        },
        onButtonPress: function(t) {
            var n = this.getPodController();
            if (n) {
                var o = this.getPlugins();
                if (!o) {
                    n.executeActionButton(this.getId())
                } else if (o && o.length > 0) {
                    n.executePlugins(o)
                }
            }
        },
        _getEventBus: function() {
            var t = this.getPodController();
            if (t && t.getEventBus) {
                return t.getEventBus()
            }
            return null
        }
    });
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/AddRemoveButtonControl", ["sap/m/HBox", "sap/ui/core/Fragment", "sap/dm/dme/podfoundation/controller/AddRemoveButtonController", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, o, e, r) {
    "use strict";
    var i = t.extend("sap.dm.dme.podfoundation.controller.AddRemoveButtonControl", {
        metadata: {
            properties: {
                propertyEditor: {
                    type: "object",
                    group: "Misc"
                },
                dataName: {
                    type: "string",
                    group: "Misc"
                },
                defaultData: {
                    type: "object",
                    group: "Misc"
                }
            }
        },
        constructor: function(o, e) {
            if (e) {
                this._internalProps = e
            }
            t.apply(this, arguments)
        },
        renderer: {},
        init: function() {
            if (t.prototype.init) {
                t.prototype.init.apply(this, arguments)
            }
            this.setWidth("100%");
            this._oPropertyEditor = null;
            this._sDataName = null;
            this._oDefaultData = null;
            if (this._internalProps) {
                if (this._internalProps.propertyEditor) {
                    this._oPropertyEditor = this._internalProps.propertyEditor
                }
                if (this._internalProps.dataName) {
                    this._sDataName = this._internalProps.dataName
                }
                if (this._internalProps.defaultData) {
                    this._oDefaultData = this._internalProps.defaultData
                }
            }
        },
        onBeforeRendering: function() {
            if (t.prototype.onBeforeRendering) {
                t.prototype.onBeforeRendering.apply(this, arguments)
            }
            if (!this._oSmartListControl) {
                this._oController = this._createController(this._oPropertyEditor, this._sDataName, this._oDefaultData);
                this._createSmartList(this._oController, this._sDataName)
            }
        },
        _createController: function(t, o, r) {
            var i = new e;
            i.setPropertyEditor(t);
            i.setDataName(o);
            i.setDefaultData(r);
            return i
        },
        _createSmartList: function(t, e) {
            var i = this;
            return o.load({
                name: "sap.dm.dme.podfoundation.fragment.AddRemoveButtonControl",
                controller: t
            }).then(function(o) {
                i._oSmartListControl = o;
                var a = i._oPropertyEditor.getAddRemoveButtonControlTitle(e);
                if (r.isNotEmpty(a)) {
                    o.setHeader(a)
                }
                i._setListBindingPath(o, e);
                i.addItem(o);
                i._oAddRemoveButtonControl = o;
                t.beforeOpen(o)
            })
        },
        _setListBindingPath: function(t, o) {
            t.setListBindingPath("ButtonsControl>/" + o)
        },
        refreshTableModel: function(t) {
            this._oDefaultData = t;
            this._oController.setDefaultData(this._oDefaultData);
            this._oController.updateTableModel(false);
            this._oController._updateToolbarButtonStates()
        }
    });
    return i
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/BasePodSelectionPropertyEditor", ["sap/dm/dme/podfoundation/control/PropertyEditor", "sap/dm/dme/logging/Logging", "sap/ui/core/ValueState", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, i, o) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.control.BasePodSelectionPropertyEditor", {
        constructor: function(i, o) {
            t.apply(this, arguments);
            this._oLogger = e.getLogger("sap.dm.dme.podfoundation.control.BasePodSelectionPropertyEditor")
        },
        addPropertyEditorContent: function(t) {
            const e = this.getPropertyData();
            this.addStartPropertyEditorContent(t, e);
            this.addDefaultPropertyEditorContent(t, e);
            this.addImplementationPropertyEditorContent(t, e);
            this.completePropertyEditorContent(t, e)
        },
        addStartPropertyEditorContent: function(t, e) {},
        addDefaultPropertyEditorContent: function(t, e) {},
        addImplementationPropertyEditorContent: function(t, e) {
            this.addFilter(t, e, "inputTypeFilter", false);
            this.addFilter(t, e, "inputFilter");
            this.initializedActionButtons(t, "mainInputActionButtonId", e)
        },
        completePropertyEditorContent: function(t, e) {
            this.addFilter(t, e, "resourceFilter");
            this.addFilter(t, e, "quantityFilter")
        },
        addFilter: function(t, e, i, o) {
            this.addSwitch(t, i.concat("Visible"), e);
            this.addInputField(t, i.concat("Label"), e);
            this.addInputField(t, i.concat("Tooltip"), e);
            if (typeof o === "undefined" || o) {
                this.addInputField(t, i.concat("Placeholder"), e);
                this.addSelect(t, i.concat("Enforcement"), e, ["EMPTY", "OPTIONAL_REQUIRED", "REQUIRED"]);
                this.addInputField(t, i.concat("MaxLength"), e);
                this.addInputField(t, i.concat("Width"), e)
            }
        },
        addInputTypeSelect: function(t, e) {
            return this.addSelect(t, "inputType", e, ["PROCESS_LOT", "SFC"])
        },
        addQuantityInputField: function(t, e) {
            let i = {
                value: {
                    path: "/quantity"
                }
            };
            let o = this.addInputField(t, "quantity", e, i);
            this.setInitialQuantity(o, e, "quantity");
            return o
        },
        setInitialQuantity: function(t, e, i) {
            let r = null;
            if (o.isNotEmpty(e[i])) {
                let t = e[i];
                if (typeof t === "string") {
                    let r = {
                        fromFormatLocale: "en",
                        toFormatLocale: null
                    };
                    t = o.stringToFloat(e[i], r)
                }
                r = o.floatToString(t)
            }
            t.setValue(r)
        },
        handleInputChange: function(t, e, r) {
            let n = this.getPropertyData();
            if (t === "quantity") {
                r.setValueState(i.None);
                if (o.isNotEmpty(e)) {
                    if (!this.isValidDecimalQuantity(e)) {
                        r.setValueState(i.Error);
                        r.setValueStateText(this.getI18nText("invalidQuantityValue"));
                        return
                    }
                }
                if (typeof e === "string") {
                    e = o.stringToFloat(e, {
                        toFormatLocale: "en"
                    })
                }
            }
            n[t] = e
        },
        isValidDecimalQuantity: function(t) {
            if (o.isEmpty(t)) {
                return true
            }
            let e = -1;
            if (o.isNumeric(t)) {
                e = o.stringToFloat(t, {
                    toFormatLocale: "en"
                });
                if (isNaN(e)) {
                    return false
                }
            }
            if (e <= 0) {
                return false
            }
            return true
        },
        getWidthOrHeightProperty: function(t) {
            for (const e of this.aWidthProperties) {
                if (t === e) {
                    return "width"
                }
            }
            return null
        },
        isMaxLengthProperty: function(t) {
            for (const e of this.aMaxLengthProperties) {
                if (t === e) {
                    return true
                }
            }
            return false
        },
        getPropertyControl: function(t, e) {
            if (t && t._aElements) {
                for (const i of t._aElements) {
                    if (i.sId.indexOf(e) > -1) {
                        return i
                    }
                }
            }
            return undefined
        },
        setPropertyData: function(e) {
            if (e) {
                if (typeof e.inputType === "undefined") {
                    e.inputType = "SFC"
                }
                if (typeof e.inputTypeFilterVisible === "undefined") {
                    e.inputTypeFilterVisible = false
                }
                if (typeof e.inputTypeFilterLabel === "undefined") {
                    e.inputTypeFilterLabel = ""
                }
                if (typeof e.inputTypeFilterTooltip === "undefined") {
                    e.inputTypeFilterTooltip = ""
                }
                if (typeof e.enableViews === "undefined") {
                    e.enableViews = false
                }
            }
            t.prototype.setPropertyData.apply(this, [e])
        },
        setPropertyEnablement: function(t, e) {
            if (t) {
                t.setEnabled(e);
                if (!e) {
                    t.setState = true
                }
            }
        },
        setFilterEnforcment: function(t, e, i) {
            let o = this.getPropertyData();
            let r = t + "Enforcement";
            let n = t + "EnforcementSelect";
            if (e) {
                o[r] = "REQUIRED"
            } else {
                o[r] = ""
            }
            let l = this.getPropertyControl(this._oPropertyFormContainer, n);
            if (l) {
                l.setEnabled(i);
                if (!i) {
                    l.setState = true
                }
                l.setSelectedKey(o[r])
            }
        },
        setSwitchControlVisible: function(t, e) {
            const i = this.getPropertyControl(this._oPropertyFormContainer, t + "Label");
            if (i) {
                i.setVisible(e)
            }
            const o = this.getPropertyControl(this._oPropertyFormContainer, t + "Switch");
            if (o) {
                o.setVisible(e)
            }
            if (!e) {
                if (o) {
                    o.setState(false)
                }
                let e = this.getPropertyData();
                e[t] = false
            }
        },
        setInputTypeControlsVisible: function(t) {
            const e = "inputType";
            let i = this.getPropertyControl(this._oPropertyFormContainer, e + "Label");
            if (i) {
                i.setVisible(t)
            }
            let o = this.getPropertyControl(this._oPropertyFormContainer, e + "Select");
            if (o) {
                o.setVisible(t)
            }
            const r = "inputTypeFilter";
            i = this.getPropertyControl(this._oPropertyFormContainer, r + "VisibleLabel");
            if (i) {
                i.setVisible(t)
            }
            o = this.getPropertyControl(this._oPropertyFormContainer, r + "VisibleSwitch");
            if (o) {
                o.setState(false);
                o.setVisible(t)
            }
            i = this.getPropertyControl(this._oPropertyFormContainer, r + "LabelLabel");
            if (i) {
                i.setVisible(t)
            }
            o = this.getPropertyControl(this._oPropertyFormContainer, r + "LabelInput");
            if (o) {
                o.setVisible(t)
            }
            i = this.getPropertyControl(this._oPropertyFormContainer, r + "TooltipLabel");
            if (i) {
                i.setVisible(t)
            }
            o = this.getPropertyControl(this._oPropertyFormContainer, r + "TooltipInput");
            if (o) {
                o.setVisible(t)
            }
            if (!t) {
                const t = this.getPropertyData();
                t[e] = "SFC";
                t[r + "Visible"] = false;
                t[r + "Label"] = "";
                t[r + "Tooltip"] = ""
            }
        },
        getDefaultPropertyData: function() {
            return {
                resource: "",
                quantity: null,
                inputType: "SFC",
                enableViews: false,
                inputFilterVisible: true,
                inputFilterLabel: "",
                inputFilterTooltip: "",
                inputFilterPlaceholder: "",
                inputFilterEnforcement: "",
                inputFilterMaxLength: 128,
                inputFilterWidth: "",
                inputTypeFilterVisible: false,
                inputTypeFilterLabel: "",
                inputTypeFilterTooltip: "",
                resourceFilterVisible: true,
                resourceFilterLabel: "",
                resourceFilterTooltip: "",
                resourceFilterPlaceholder: "",
                resourceFilterEnforcement: "",
                resourceFilterMaxLength: 128,
                resourceFilterWidth: "",
                quantityFilterVisible: false,
                quantityFilterLabel: "",
                quantityFilterTooltip: "",
                quantityFilterPlaceholder: "",
                quantityFilterEnforcement: "",
                quantityFilterMaxLength: 0,
                quantityFilterWidth: "100px"
            }
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/BaseTableImpl", ["sap/ui/base/Object", "../util/PodUtility"], function(t, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.control.BaseTableImpl", {
        constructor: function(i, a, e) {
            t.call(this);
            this._oListConfiguration = i;
            this._aListColumnData = a;
            this._oResourceBundle = e
        },
        _getColumnLabel: function(t) {
            let a = "";
            if (this._aListColumnData && this._aListColumnData[t]) {
                if (i.isNotEmpty(this._aListColumnData[t].label)) {
                    a = this._aListColumnData[t].label
                } else {
                    if (!this._oResourceBundle) {
                        a = t
                    } else {
                        let i = t + ".LABEL";
                        let e = this._oResourceBundle.getText(i);
                        if (e !== i) {
                            a = e
                        }
                    }
                }
            }
            return a
        },
        _getColumnWidth: function(t) {
            if (this._aListColumnData && this._aListColumnData[t] && i.isNotEmpty(this._aListColumnData[t].width) && this._aListColumnData[t].width !== "NONE" && this._aListColumnData[t].width !== "auto") {
                return this._aListColumnData[t].width
            }
            if (this._aListColumnData[t] && this._aListColumnData[t].width === "auto") {
                return "auto"
            }
            if (!this._oResourceBundle) {
                return ""
            }
            let a = t + ".WIDTH";
            let e = this._oResourceBundle.getText(a);
            if (e === a) {
                return ""
            }
            return e
        },
        _getColumnBinding: function(t) {
            if (this._aListColumnData && this._aListColumnData[t] && i.isNotEmpty(this._aListColumnData[t].binding)) {
                return this._aListColumnData[t].binding
            }
            if (!this._oResourceBundle) {
                return ""
            }
            let a = t + ".BINDING";
            let e = this._oResourceBundle.getText(a);
            if (e === a) {
                return ""
            }
            return e
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/control/ConfigurableButton", ["sap/m/Button", "sap/m/ButtonRenderer", "sap/ui/Device", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, o, n) {
    "use strict";
    var s = "background-color";
    var i = "border-color";
    var r = "mouseleave mouseup touchend";
    var u = t.extend("sap.dm.dme.podfoundation.control.ConfigurableButton", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                configurable: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                },
                height: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                iconFontSize: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                iconColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                iconHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                iconPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                iconContainerWidth: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                borderWidth: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                borderColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                borderHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                borderPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                backgroundColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                backgroundHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                backgroundPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                fontColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                fontHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                fontPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                fontSize: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                fontWeight: {
                    type: "string",
                    group: "Misc",
                    defaultValue: "normal"
                },
                fontFamily: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },
        constructor: function(e, o) {
            t.apply(this, arguments)
        },
        renderer: {}
    });
    u.prototype.onBeforeRendering = function() {
        if (t.prototype.onBeforeRendering) {
            t.prototype.onBeforeRendering.apply(this, arguments)
        }
        var e = this.getConfigurable();
        if (!e) {
            return
        }
        this.addStyleClass("sapDmeConfigurableButton")
    };
    u.prototype.onAfterRendering = function() {
        if (t.prototype.onAfterRendering) {
            t.prototype.onAfterRendering.apply(this, arguments)
        }
        var e = this.getConfigurable();
        if (!e) {
            return
        }
        this._updateConfigurableButton();
        if (this.isEventHandlingEnabled()) {
            this._removeMouseEventHandlers();
            this._addMouseEventHandlers()
        }
    };
    u.prototype.onExit = function() {
        var t = this.getConfigurable();
        if (!t) {
            return
        }
        if (this.isEventHandlingEnabled()) {
            this._removeMouseEventHandlers()
        }
    };
    u.prototype.isEventHandlingEnabled = function() {
        return true
    };
    u.prototype._updateConfigurableButton = function() {
        var t = this._getButton();
        var e = this._getButtonInner();
        var o = this.getHeight();
        if (n.isNotEmpty(o) && o.toLowerCase() === "auto") {
            o = null
        }
        this._setBaseProperties(t, e, o);
        this._setIconButton(e, o);
        if (n.isNotEmpty(o)) {
            this._getButtonContent().css("line-height", o)
        }
    };
    u.prototype._setBaseProperties = function(t, e, o) {
        if (n.isNotEmpty(o)) {
            t.css("height", o);
            e.css("height", o)
        }
        var r = this.getBackgroundColor();
        if (n.isNotEmpty(r)) {
            e.css(s, r)
        }
        var u = this.getBorderWidth();
        if (n.isNotEmpty(u)) {
            e.css("border-width", u)
        }
        var a = this.getBorderColor();
        if (n.isNotEmpty(a)) {
            e.css(i, a)
        }
        var l = this.getFontColor();
        if (n.isNotEmpty(l)) {
            e.css("color", l)
        }
        var p = this.getFontSize();
        if (n.isNotEmpty(p)) {
            e.css("font-size", p)
        }
        var c = this.getFontWeight();
        if (n.isNotEmpty(c)) {
            e.css("font-weight", c)
        }
        var g = this.getFontFamily();
        if (n.isNotEmpty(g)) {
            e.css("font-family", g)
        }
    };
    u.prototype._setIconButton = function(t, e) {
        if (!this.getIcon()) {
            return
        }
        var o = this.getIconFontSize();
        var s = this._getButtonIcon();
        if (n.isNotEmpty(e)) {
            s.css("line-height", e);
            s.css("max-height", e)
        }
        if (this._isImageType()) {
            var i = s.css("height");
            if (n.isNotEmpty(o)) {
                i = o
            }
            s.css("top", "calc(" + e + " / 2 - " + i + " / 2)");
            s.css("position", "absolute")
        }
        var r = this.getText();
        if (n.isNotEmpty(o)) {
            this._setFontSizedIconButton(s, t, o, r)
        } else if (this._isImageType() && n.isEmpty(r)) {
            var u = s.css("width");
            var a = this.getWidth();
            s.css("left", "calc(" + a + " / 2 - " + u + " / 2)")
        } else if (this._isImageType() && n.isNotEmpty(r)) {
            t.css("justify-content", "left");
            this._getButtonContent().css("padding-left", "calc(" + this._getImageWidth() + " + 6px)")
        }
        var l = this.getIconColor();
        if (n.isNotEmpty(l)) {
            s.css("color", l)
        }
    };
    u.prototype._setFontSizedIconButton = function(t, e, o, s) {
        t.css("font-size", o);
        if (this._isImageType()) {
            t.css("height", o);
            t.css("max-width", "none");
            if (n.isEmpty(s)) {
                var i = this.getWidth();
                if (n.isEmpty(i)) {
                    i = o
                }
                e.css("width", i);
                t.css("left", "calc(" + i + " / 2 - " + o + " / 2)")
            } else {
                e.css("justify-content", "left");
                this._getButtonContent().css("padding-left", "calc(" + o + " + 6px)")
            }
        }
        if (n.isNotEmpty(s)) {
            t.css("padding-right", "calc(" + o + " * .8)")
        }
    };
    u.prototype._removeMouseEventHandlers = function() {
        this._getButton().off("mouseenter mouseleave mousedown mouseup touchstart touchend");
        this._getButtonIcon().off(r)
    };
    u.prototype._addMouseEventHandlers = function() {
        var t = this;
        this._getButton().on("mousedown touchstart", function() {
            t._handleMouseDownEvent()
        });
        this._getButton().on(r, function(e) {
            t._handleButtonMouseLeaveEvent(e)
        });
        this._getButtonIcon().on(r, function() {
            t._handleButtonIconMouseLeaveEvent()
        });
        this._bMouseEnter = false;
        this._getButton().on("mouseenter", function() {
            t._handleMouseEnterHandler()
        })
    };
    u.prototype._handleMouseDownEvent = function() {
        var t = this.getBackgroundPressColor();
        if (n.isNotEmpty(t)) {
            this._getButtonInner().css(s, t)
        }
        var e = this.getBorderPressColor();
        if (n.isNotEmpty(e)) {
            this._getButtonInner().css(i, e)
        }
        var o = this.getFontPressColor();
        if (n.isNotEmpty(o)) {
            this._getButtonInner().css("color", o)
        }
        var r = this.getIconPressColor();
        if (n.isNotEmpty(r)) {
            this._setIconColor(r)
        }
    };
    u.prototype._handleButtonMouseLeaveEvent = function(t) {
        var e = this.getBackgroundColor();
        var o = this.getBorderColor();
        var r = this.getFontColor();
        var u = this.getIconColor();
        if (t.type === "mouseup" && this._bMouseEnter) {
            e = this.getBackgroundHoverColor();
            o = this.getBorderHoverColor();
            r = this.getFontHoverColor();
            u = this.getIconHoverColor()
        }
        if (n.isNotEmpty(e)) {
            this._getButtonInner().css(s, e)
        }
        if (n.isNotEmpty(o)) {
            this._getButtonInner().css(i, o)
        }
        if (n.isNotEmpty(r)) {
            this._getButtonInner().css("color", r)
        }
        if (n.isNotEmpty(u)) {
            this._setIconColor(u)
        }
        if (t.type === "mouseleave") {
            this._bMouseEnter = false
        }
    };
    u.prototype._handleButtonIconMouseLeaveEvent = function() {
        var t = this.getIconHoverColor();
        if (n.isNotEmpty(t)) {
            this._setIconColor(t)
        }
    };
    u.prototype._handleMouseEnterHandler = function() {
        var t = this.getBackgroundHoverColor();
        if (n.isNotEmpty(t)) {
            this._getButtonInner().css(s, t)
        }
        var e = this.getBorderHoverColor();
        if (n.isNotEmpty(e)) {
            this._getButtonInner().css(i, e)
        }
        var o = this.getFontHoverColor();
        if (n.isNotEmpty(o)) {
            this._getButtonInner().css("color", o)
        }
        var r = this.getIconHoverColor();
        if (n.isNotEmpty(r)) {
            this._setIconColor(r)
        }
        this._bMouseEnter = true
    };
    u.prototype._setIconColor = function(t) {
        var e = this;
        setTimeout(function() {
            e._getButtonIcon().css("color", t)
        }, 10)
    };
    u.prototype._getButton = function() {
        return this._getJQueryObject("#" + this.getId())
    };
    u.prototype._getButtonInner = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner")
    };
    u.prototype._getButtonIcon = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMBtnIcon")
    };
    u.prototype._isImageType = function() {
        var t = this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMImg");
        if (t.length > 0) {
            return true
        }
        return false
    };
    u.prototype._getImageWidth = function() {
        if (o.system.tablet && !o.system.desktop) {
            return "24px"
        } else if (o.system.tablet && o.system.desktop) {
            return "40px"
        }
        return "14px"
    };
    u.prototype._getButtonContent = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMBtnContent")
    };
    u.prototype._getJQueryObject = function(t) {
        return jQuery(t)
    };
    return u
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/GridTableImpl", ["sap/ui/table/Table", "sap/ui/table/Column", "sap/m/Text", "sap/ui/core/TextAlign", "./BaseTableImpl"], function(t, e, i, n, o) {
    "use strict";
    return o.extend("sap.dm.dme.podfoundation.control.GridTableImpl", {
        createTable: function(e, o, a, l) {
            if (!this._oListConfiguration || !this._oListConfiguration.columns || this._oListConfiguration.columns.length === 0) {
                return undefined
            }
            var r = this._oListConfiguration.columns;
            r.sort(function(t, e) {
                if (t.sequence < e.sequence) {
                    return -1
                } else if (t.sequence > e.sequence) {
                    return 1
                }
                return 0
            });
            var s = "Single";
            if (this._oListConfiguration.allowMultipleSelection) {
                s = "MultiToggle"
            }
            var u = {
                alternateRowColors: a.alternateRowColors,
                selectionMod: s,
                visibleRowCountMode: "Auto"
            };
            var f = new t(e, u);
            if (this._oListConfiguration.allowOperatorToChangeColumnSequence) {
                f.setEnableColumnReordering(true)
            }
            if (o) {
                var g = o;
                if (typeof o !== "string" && jQuery.trim(o.path)) {
                    g = o.path
                }
                f.bindRows(g)
            }
            var m, h, p, d, C, c, _;
            var w, L, b;
            var v;
            for (var T = 0; T < r.length; T++) {
                h = r[T].columnId;
                p = this._getColumnBinding(h);
                C = this._getColumnWidth(h);
                c = this._getColumnLabel(h);
                _ = n.Begin;
                v = true;
                b = undefined;
                if (this._aListColumnData && this._aListColumnData[h]) {
                    if (this._aListColumnData && this._aListColumnData[h]) {
                        L = this._aListColumnData[h];
                        if (L) {
                            b = L.columnListItem;
                            if (L.hAlign && L.hAlign !== "") {
                                _ = L.hAlign
                            }
                            if (typeof L.wrapping !== "undefined" && !L.wrapping) {
                                v = false
                            }
                        }
                    }
                }
                if (!b) {
                    b = new i({
                        text: this._getColumnBinding(h),
                        textAlign: _,
                        wrapping: false
                    })
                }
                m = e + "_" + h + "_column";
                d = m + "_header";
                w = new sap.ui.table.Column(m, {
                    label: new i(d, {
                        text: c,
                        textAlign: _,
                        wrapping: v
                    }),
                    template: b,
                    resizable: true
                });
                if (this._oListConfiguration.allowOperatorToSortRows) {
                    w.setSortProperty(p)
                }
                if (jQuery.trim(C)) {
                    w.setWidth(C)
                }
                f.addColumn(w)
            }
            return f
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/control/GroupButton", ["sap/dm/dme/podfoundation/control/ConfigurableButton", "sap/ui/unified/Menu", "sap/ui/unified/MenuItem", "sap/ui/core/Popup", "sap/m/OverflowToolbarLayoutData", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, r, n, o, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.control.GroupButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "object",
                    group: "Misc"
                }
            }
        },
        constructor: function(e, r) {
            t.apply(this, arguments)
        },
        renderer: {},
        init: function() {
            if (t.prototype.init) {
                t.prototype.init.apply(this, arguments)
            }
            this.attachBrowserEvent("tab keyup", function(t) {
                this._bKeyboard = t.type === "keyup"
            }, this);
            this.attachPress(this.onPressOpenMenu, this)
        },
        setPodController: function(t) {
            this._oPodController = t
        },
        getPodController: function(t) {
            return this._oPodController
        },
        _byId: function(t) {
            return sap.ui.getCore().byId(t)
        },
        onPressOpenMenu: function(t) {
            var e = t.getSource();
            if (!this._menu) {
                var r = this.getPlugins();
                if (!r || r.length === 0) {
                    return
                }
                var i = e.getId() + "_menu";
                var u = this._byId(i);
                if (u) {
                    u.destroy()
                }
                this._menu = this._createMenu(i, r)
            }
            var a = n.Dock;
            var s = this.isPopoverOpen();
            var l = this.getPopoverContent();
            var f = e;
            if (s && l && l.length > 0) {
                f = this._getOverflowButton();
                var p = new o;
                e.setLayoutData(p)
            }
            this._menu.open(this._bKeyboard, e, a.BeginTop, a.BeginBottom, f)
        },
        _createMenu: function(t, n) {
            var o = new e(t);
            o.attachItemSelect(this.onMenuItemPress, this);
            var u, a = 0;
            for (const e of n) {
                u = e.title;
                if (i.isNotEmpty(e.menuLabel)) {
                    u = e.menuLabel
                }
                var s = new r(t + "_" + a, {
                    text: u
                });
                s.data("PLUGIN_ID", e.id);
                o.addItem(s);
                a++
            }
            return o
        },
        onMenuItemPress: function(t) {
            if (t.getParameter("item").getSubmenu()) {
                return
            }
            var e = t.getParameter("item");
            if (!e || !e.data) {
                return
            }
            var r = e.data("PLUGIN_ID");
            if (i.isEmpty(r)) {
                return
            }
            var n = this.getPodController();
            if (n) {
                n.executeGroupButton(this.getId(), r)
            }
        },
        isPopoverOpen: function() {
            var t = this._getOverflowToolbar();
            if (!t) {
                return false
            }
            var e = t._getPopover();
            if (!e) {
                return false
            }
            return e.isOpen()
        },
        getPopoverContent: function() {
            var t = this._getOverflowToolbar();
            if (!t) {
                return null
            }
            var e = t._getPopover();
            if (!e) {
                return null
            }
            return e._getAllContent()
        },
        _getOverflowToolbar: function() {
            var t = this.getParent();
            if (t && t._getPopover) {
                return t
            }
            return null
        },
        _getOverflowButton: function() {
            var t = this._getOverflowToolbar();
            if (!t) {
                return null
            }
            return t._getOverflowButton()
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/IconSelectHelper", ["sap/ui/base/Object", "sap/ui/core/Fragment", "sap/ui/core/syncStyleClass", "sap/ui/core/IconPool", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel"], function(e, o, t, n, a, l, i) {
    "use strict";
    var c = e.extend("sap.dm.dme.podfoundation.control.IconSelectHelper", {
        loadIconNames: function(e, o) {
            if (!e.getModel("ButtonIconData")) {
                var t = n.getIconNames().map(function(e) {
                    return {
                        name: "sap-icon://" + e,
                        icon: "sap-icon://" + e
                    }
                });
                t.sort(function(e, o) {
                    var t = e.name.toLowerCase();
                    var n = o.name.toLowerCase();
                    if (t < n) {
                        return -1
                    } else if (t > n) {
                        return 1
                    }
                    return 0
                });
                t.splice(0, 0, {
                    name: o,
                    icon: "sap-icon://empty"
                });
                var a = new i;
                a.setData({
                    allIcons: t
                });
                e.setModel(a, "ButtonIconData")
            }
        },
        openIconSelectValueHelp: function(e, o, t) {
            this._iconSelectField = e;
            var n = this._iconSelectField.getValue();
            var a = o.getModel("ButtonIconData");
            if (!a) {
                this.loadIconNames(o, t);
                a = o.getModel("ButtonIconData")
            }
            var l = a.getData();
            if (this._oIconSelectValueHelpDialog) {
                this._oIconSelectValueHelpDialog.destroy();
                this._oIconSelectValueHelpDialog = null
            }
            this._createDialog(o, l, n)
        },
        _createDialog: function(e, n, a) {
            var l = this;
            return o.load({
                name: "sap.dm.dme.podfoundation.fragment.IconSelectDialog",
                controller: l
            }).then(function(o) {
                e.addDependent(o);
                t("sapUiSizeCompact", e, o);
                l._oIconSelectValueHelpDialog = o;
                n.allIcons.forEach(function(e) {
                    e.selected = e.name === a
                });
                l._openDialog(l._oIconSelectValueHelpDialog)
            })
        },
        _openDialog: function(e) {
            e.open()
        },
        handleIconSelectSearch: function(e) {
            var o = e.getParameter("value");
            var t = new a("name", l.Contains, o);
            var n = e.getSource().getBinding("items");
            n.filter([t])
        },
        handleIconSelectConfirm: function(e) {
            var o = e.getParameter("selectedContexts");
            if (o && o.length) {
                var t = o[0].getObject();
                var n = t.name;
                if (t.icon === "sap-icon://empty") {
                    n = ""
                }
                this._iconSelectField.setValue(n);
                this._iconSelectField.fireChange({
                    value: n
                })
            }
        }
    });
    return c
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/IconTabBar", ["sap/m/HBox", "sap/m/IconTabBar", "sap/m/IconTabSeparator", "sap/ui/core/IconColor", "sap/uxap/ObjectPageLayout", "sap/uxap/ObjectPageSection", "sap/uxap/ObjectPageSubSection", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, o, i, a, n, r, s) {
    "use strict";
    var l = e.extend("sap.dm.dme.podfoundation.control.IconTabBar", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                scrollableContent: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                separatorIcon: {
                    type: "sap.ui.core.URI",
                    group: "Misc",
                    defaultValue: ""
                }
            }
        },
        constructor: function(t, o) {
            e.apply(this, arguments);
            this._bFirstSelectionChanged = false;
            this._oControlContainerId = {}
        },
        renderer: {}
    });
    l.prototype.addItem = function(t) {
        if (s.isNotEmpty(this.getSeparatorIcon())) {
            if (this.getItems().length > 0) {
                this._addIconTabSeparator(t.getVisible())
            }
        }
        if (this.getScrollableContent()) {
            this._addSectionControl(t)
        }
        e.prototype.addItem.call(this, t)
    };
    l.prototype._addIconTabSeparator = function(t) {
        var i = new o({
            icon: this.getSeparatorIcon(),
            visible: t
        });
        e.prototype.addItem.call(this, i)
    };
    l.prototype.addFilterContent = function(t, e) {
        this._addControlToSection(e, t)
    };
    l.prototype._addSectionControl = function(t) {
        if (!this._oObjectPageLayout) {
            this._createObjectPageLayout()
        }
        var e = t.getText();
        var o = t.getKey();
        var i = this._oObjectPageLayout.getSections().length + 1;
        var a = this._sObjectPageLayoutId + "-section" + i;
        var s = new n(a, {
            titleUppercase: false
        });
        s.data("TAB_FILTER_KEY", o);
        s.addStyleClass("sapUiNoMargin");
        s.addStyleClass("sapUiNoContentPadding");
        s.addStyleClass("sapMesIconTabBarSection");
        var l = new r(a + "-ss", {
            title: e,
            titleUppercase: false,
            showTitle: false
        });
        this._oControlContainerId[o] = a + "-ss-control";
        var d = this._createControlContainer(this._oControlContainerId[o], "0px");
        l.addBlock(d);
        s.addSubSection(l);
        this._oObjectPageLayout.addSection(s)
    };
    l.prototype._addControlToSection = function(t, e) {
        var o = e.getKey();
        var i = this._oControlContainerId[o];
        var a = sap.ui.getCore().byId(i);
        if (a) {
            var n = e.getContentHeight();
            a.setHeight(n);
            a.addItem(t)
        }
    };
    l.prototype._createControlContainer = function(e, o) {
        var i = new t(e, {
            height: o,
            width: "100%",
            renderType: "Bare"
        });
        i.addStyleClass("sapUiNoMargin");
        i.addStyleClass("sapUiNoContentPadding");
        return i
    };
    l.prototype._createObjectPageLayout = function() {
        this._sObjectPageLayoutId = this.getId() + "-layout";
        this._oObjectPageLayout = new a(this._sObjectPageLayoutId, {
            showAnchorBar: false,
            showAnchorBarPopover: false,
            showHeaderContent: false,
            subSectionLayout: "TitleOnLeft",
            upperCaseAnchorBar: false,
            showTitleInHeaderContent: false,
            height: "95%"
        });
        this._oObjectPageLayout.attachSectionChange(this.onSectionChange, this);
        e.prototype.addContent.call(this, this._oObjectPageLayout)
    };
    l.prototype.fireSelect = function(t) {
        e.prototype.fireSelect.apply(this, arguments);
        var o = this._findSectionToScrollTo(t);
        if (!o) {
            return
        }
        var i = 0;
        if (!this._isSectionLoaded(o)) {
            i = 500
        }
        var a = this;
        setTimeout(function() {
            a._oObjectPageLayout.scrollToSection(o.getId())
        }, i)
    };
    l.prototype._findSectionToScrollTo = function(t) {
        if (t.key != t.previousKey) {
            return this._findSectionByKey(t.key)
        }
        return null
    };
    l.prototype._findSectionByKey = function(t) {
        if (this._oObjectPageLayout) {
            var e = this._oObjectPageLayout.getSections();
            for (let o of e) {
                if (o.data("TAB_FILTER_KEY") === t) {
                    return o
                }
            }
        }
        return null
    };
    l.prototype._isSectionLoaded = function(t) {
        var e = t.getSubSections();
        if (!e || e.length === 0) {
            return false
        }
        var o = e[0].getBlocks();
        if (!o || o.length === 0) {
            return false
        }
        var i = o[0].getItems();
        if (!i || i.length === 0) {
            return false
        }
        var a = this._getJQueryElement(i[0].getId());
        if (!a) {
            return false
        }
        return true
    };
    l.prototype.onSectionChange = function(t) {
        if (!this._bFirstSelectionChanged) {
            this._bFirstSelectionChanged = true;
            return
        }
        var e = this._findTabFilterKeyToSelect(t);
        if (!e) {
            this._sInitializeTimerId = undefined;
            return
        }
        if (!this._isLoadingControlRequired(e)) {
            this.setSelectedKey(e);
            this._sInitializeTimerId = undefined;
            return
        }
        if (this._sInitializeTimerId) {
            return
        }
        var o = this;
        this._sInitializeTimerId = setTimeout(function() {
            o._lazyLoadControl(e);
            o.setSelectedKey(e);
            o._sInitializeTimerId = undefined
        }, 500)
    };
    l.prototype._lazyLoadControl = function(t) {
        var o = this._findItemHavingKey(t);
        if (o) {
            var i = {
                item: o,
                key: t
            };
            e.prototype.fireSelect.call(this, i)
        }
    };
    l.prototype._isLoadingControlRequired = function(t) {
        var e = this._findSectionByKey(t);
        if (!e) {
            return false
        }
        if (this._isSectionLoaded(e)) {
            return false
        }
        return true
    };
    l.prototype._findItemHavingKey = function(t) {
        var e = this.getItems();
        for (let o of e) {
            if (o.getKey && o.getKey() === t) {
                return o
            }
        }
        return null
    };
    l.prototype._findTabFilterKeyToSelect = function(t) {
        var e = t.getParameter("section");
        if (e) {
            return e.data("TAB_FILTER_KEY")
        }
        return null
    };
    l.prototype._getJQueryElement = function(t) {
        return jQuery("#" + t)
    };
    return l
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/IconTabFilter", ["sap/m/IconTabFilter"], function(t) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.control.IconTabFilter", {
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
        constructor: function(e, n) {
            t.apply(this, arguments)
        },
        addContent: function(e) {
            if (this.getDisplayInBar()) {
                var n = this.getParent();
                var o = n.getParent();
                o.addFilterContent(this, e);
                this._oControl = e
            } else {
                t.prototype.addContent.call(this, e)
            }
        },
        getTabBarContent: function() {
            var t = [];
            if (this.getDisplayInBar() && this._oControl) {
                t[0] = this._oControl
            }
            return t
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/LaborOperatorsControl", ["sap/m/HBox", "sap/m/VBox", "sap/m/Text", "sap/m/FlexJustifyContent", "sap/ui/core/Icon", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, r, o, n, s) {
    "use strict";
    let i = t.extend("sap.dm.dme.podfoundation.control.LaborOperatorsControl", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                laborData: {
                    type: "any",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },
        constructor: function(e, r) {
            t.apply(this, arguments)
        },
        renderer: {}
    });
    i.prototype.onBeforeRendering = function() {
        if (t.prototype.onBeforeRendering) {
            t.prototype.onBeforeRendering.apply(this, arguments)
        }
        this.setJustifyContent(o.Center)
    };
    i.prototype.setLaborData = function(t) {
        this.setProperty("laborData", t, true);
        let e = this.getItems();
        if (e && e.length > 0) {
            this._updateControl(t, e)
        } else {
            this._createControl(t)
        }
    };
    i.prototype._createControl = function(t) {
        let i = this._getLaboredOperatorsAsString(t);
        if (s.isEmpty(i) || i === "[]") {
            return
        }
        let a = this._getFormattedOperators(t);
        let p = new e({
            justifyContent: o.Center
        });
        let l = new n({
            src: "sap-icon://employee",
            visible: this._isCurrentUser(t)
        });
        l.addStyleClass("sapUiSmallMarginEnd");
        p.addItem(l);
        let d = new r({
            text: a
        });
        this.addItem(p);
        this.addItem(d)
    };
    i.prototype._updateControl = function(t, e) {
        let r = this._getFormattedOperators(t);
        let o = e[0];
        let n = o.getItems()[0];
        n.setVisible(this._isCurrentUser(t));
        let s = e[1];
        s.setText(r)
    };
    i.prototype._isCurrentUser = function(t) {
        let e = t.userId;
        let r = this._getLaboredOperatorsAsString(t);
        if (s.isNotEmpty(r) && r.includes(e)) {
            return true
        }
        return false
    };
    i.prototype._getFormattedOperators = function(t) {
        let e = this._getLaboredOperatorsAsString(t);
        if (s.isNotEmpty(e) && e !== "[]") {
            let t = e.substring(1, e.length - 1).split(", ");
            let r = t.join("\r\n");
            return r
        }
        return ""
    };
    i.prototype._getLaboredOperatorsAsString = function(t) {
        let e = t.laboredOperators;
        if (Array.isArray(t.laboredOperators)) {
            e = JSON.stringify(t.laboredOperators)
        }
        return e
    };
    return i
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/MenuButton", ["sap/m/MenuButton", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, o) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.control.MenuButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "object",
                    group: "Misc"
                }
            }
        },
        constructor: function(o, e) {
            t.apply(this, arguments)
        },
        renderer: {},
        init: function() {
            if (t.prototype.init) {
                t.prototype.init.apply(this, arguments)
            }
        },
        setPodController: function(t) {
            this._oPodController = t
        },
        getPodController: function(t) {
            return this._oPodController
        },
        onMenuItemPress: function(t) {
            var e = t.getParameter("item");
            var n = e.data("PLUGIN_ID");
            if (o.isEmpty(n)) {
                return
            }
            var r = this.getPodController();
            if (r) {
                r.executeGroupButton(this.getId(), n)
            }
        }
    });
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/MobileTableImpl", ["sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/PopinDisplay", "sap/m/Text", "sap/ui/core/TextAlign", "./BaseTableImpl", "../util/PodUtility", "sap/dm/dme/formatter/DateTimeUtils"], function(t, i, e, n, a, s, o, l, r) {
    "use strict";
    return o.extend("sap.dm.dme.podfoundation.control.MobileTableImpl", {
        createTable: function(o, p, f, u) {
            if (!this._oListConfiguration || !this._oListConfiguration.columns || this._oListConfiguration.columns.length === 0) {
                return undefined
            }
            var m = this._oListConfiguration.columns;
            m.sort(function(t, i) {
                if (t.sequence < i.sequence) {
                    return -1
                } else if (t.sequence > i.sequence) {
                    return 1
                }
                return 0
            });
            var d = new t(o, f);
            var g = o + "-cli";
            var h = sap.ui.getCore().byId(g);
            if (h) {
                h.destroy()
            }
            var y = new e(g, u);
            var c, C, D, _, L;
            var E;
            for (E = 0; E < m.length; E++) {
                c = m[E].columnId;
                C = undefined;
                if (this._aListColumnData && this._aListColumnData[c]) {
                    D = this._aListColumnData[c];
                    if (D) {
                        C = D.columnListItem
                    }
                }
                if (!C) {
                    if (c.indexOf("DATE") >= 0) {
                        C = (new a).bindProperty("text", {
                            path: this._getColumnBinding(c).replace(/[{()}]/g, ""),
                            formatter: function(t) {
                                if (!t) {
                                    return ""
                                }
                                return r.dmcDateTimeFormatterFromUTC(t, null, "medium")
                            },
                            wrapping: false
                        })
                    } else {
                        _ = s.Begin;
                        L = false;
                        if (this._aListColumnData && this._aListColumnData[c]) {
                            D = this._aListColumnData[c];
                            if (D) {
                                if (l.isNotEmpty(D.hAlign)) {
                                    _ = D.hAlign
                                }
                                if (typeof D.wrapping !== "undefined") {
                                    L = D.wrapping
                                }
                            }
                        }
                        C = new a({
                            text: this._getColumnBinding(c),
                            textAlign: _,
                            wrapping: L
                        })
                    }
                }
                y.addCell(C)
            }
            if (p) {
                if (typeof p === "string" || p instanceof String) {
                    d.bindItems(p, y, null, null)
                } else if (l.isNotEmpty(p.path)) {
                    d.bindItems({
                        path: p.path,
                        template: y,
                        sorter: p.sorter,
                        filters: p.filters,
                        groupHeaderFactory: p.groupHeaderFactory
                    })
                }
            }
            var N, A, v, b, w;
            var T, x, I, H;
            var P, W, B;
            var S, q;
            for (E = 0; E < m.length; E++) {
                c = m[E].columnId;
                v = this._getColumnWidth(c);
                b = this._getColumnLabel(c);
                w = undefined;
                T = undefined;
                x = n.WithoutHeader;
                _ = s.Begin;
                I = undefined;
                H = undefined;
                q = false;
                S = false;
                L = true;
                B = undefined;
                W = undefined;
                if (this._aListColumnData && this._aListColumnData[c]) {
                    D = this._aListColumnData[c];
                    if (D) {
                        B = D.metadata;
                        W = D.header;
                        if (l.isNotEmpty(D.minScreenWidth)) {
                            w = D.minScreenWidth
                        }
                        if (l.isNotEmpty(D.popinHAlign)) {
                            T = D.popinHAlign
                        }
                        if (l.isNotEmpty(D.popinDisplay)) {
                            x = D.popinDisplay
                        }
                        if (l.isNotEmpty(D.vAlign)) {
                            I = D.vAlign
                        }
                        if (l.isNotEmpty(D.hAlign)) {
                            _ = D.hAlign
                        }
                        if (l.isNotEmpty(D.styleClass)) {
                            H = D.styleClass
                        }
                        if (typeof D.mergeDuplicates !== "undefined") {
                            q = D.mergeDuplicates
                        }
                        if (typeof D.demandPopin !== "undefined" && D.demandPopin) {
                            S = true
                        }
                        if (typeof D.wrapping !== "undefined" && !D.wrapping) {
                            L = false
                        }
                    }
                }
                N = o + "_" + c + "_column";
                P = new i(N, B);
                if (l.isNotEmpty(v)) {
                    P.setWidth(v)
                }
                if (l.isNotEmpty(w)) {
                    P.setMinScreenWidth(w)
                }
                if (l.isNotEmpty(_)) {
                    P.setHAlign(_)
                }
                if (l.isNotEmpty(I)) {
                    P.setVAlign(I)
                }
                if (l.isNotEmpty(T)) {
                    P.setPopinHAlign(T)
                }
                if (l.isNotEmpty(x)) {
                    P.setPopinDisplay(x)
                }
                P.setDemandPopin(S);
                P.setMergeDuplicates(q);
                if (!W) {
                    A = N + "_header";
                    W = new a(A, {
                        text: b,
                        textAlign: _,
                        wrapping: L
                    });
                    W.setWidth(v)
                }
                if (W.getMetadata().getName() === "sap.m.Text" && D) {
                    W.setVisible(!D.hideLabel)
                }
                var F = P.setHeader(W);
                if (l.isNotEmpty(H)) {
                    F.setStyleClass(H)
                }
                d.addColumn(P)
            }
            if (!p) {
                return {
                    table: d,
                    columnListItem: y
                }
            }
            return d
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/control/NavigationButton", ["sap/dm/dme/podfoundation/control/ConfigurableButton"], function(t) {
    "use strict";
    var o = t.extend("sap.dm.dme.podfoundation.control.NavigationButton", {
        metadata: {
            properties: {
                selectActionPageName: {
                    type: "string",
                    group: "Misc"
                }
            }
        },
        constructor: function(o, n) {
            t.apply(this, arguments)
        },
        renderer: {},
        init: function() {
            if (t.prototype.init) {
                t.prototype.init.apply(this, arguments)
            }
            this.attachPress(this.onButtonPress, this)
        },
        setPodController: function(t) {
            this._oPodController = t
        },
        getPodController: function(t) {
            return this._oPodController
        },
        onButtonPress: function(t) {
            var o = this.getSelectActionPageName();
            var n = this.getPodController();
            if (n) {
                n.navigateToPage(o)
            }
        },
        _getEventBus: function() {
            var t = this.getPodController();
            if (t && t.getEventBus) {
                return t.getEventBus()
            }
            return null
        }
    });
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/PropertyEditor", ["sap/ui/base/ManagedObject", "sap/ui/core/Item", "sap/ui/core/library", "sap/ui/core/syncStyleClass", "sap/ui/model/resource/ResourceModel", "sap/ui/model/json/JSONModel", "sap/m/Button", "sap/m/Label", "sap/m/Input", "sap/m/PlacementType", "sap/m/Switch", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageBox", "sap/m/TimePicker", "sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/logging/Logging", "sap/ui/core/format/NumberFormat", "sap/ui/core/ValueState", "sap/ui/core/TextAlign", "sap/ui/core/VerticalAlign", "sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/message/ErrorHandler", "sap/dm/dme/podfoundation/control/TableFactory", "sap/dm/dme/podfoundation/controller/ColumnPropertyEditorController", "sap/dm/dme/podfoundation/controller/PrintLabelPropertyEditorController", "sap/dm/dme/podfoundation/controller/ListNameSearchController", "sap/dm/dme/podfoundation/controller/InputParameterTableController", "sap/dm/dme/podfoundation/control/ActionAssignmentHelper", "sap/dm/dme/podfoundation/control/AddRemoveButtonControl", "sap/dm/dme/podfoundation/control/PropertyEditorExtensionLoader", "sap/dm/dme/podfoundation/service/ListMaintenanceService", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter"], function(t, e, o, i, n, r, s, l, a, p, u, d, h, g, c, f, P, m, y, _, C, D, T, L, b, A, I, E, S, B, x, M, F, v) {
    "use strict";
    let N = P.getLogger("sap.dm.dme.podfoundation.control.PropertyEditor");
    let w = ["popup", "popupWidth", "popupHeight", "popupTop", "popupLeft", "popupResizable", "popupDraggable", "popupStretch", "popupTitle", "popoverTitle", "popupModal", "popupPlacement", "popupShowClose", "dialogShowClose", "dialogFooterButtons", "popoverFooterButtons"];
    let O = "sap.dm.dme.podbuilder.i18n.i18n";
    let V = "sap.dm.dme.i18n.propertyEditor";
    let R = "sap.dm.dme.i18n.global";
    let H = "i18n-global";
    let z = t.extend("sap.dm.dme.podfoundation.control.PropertyEditor", {
        metadata: {
            properties: {
                name: {
                    type: "string",
                    group: "Misc"
                },
                controlType: {
                    type: "string",
                    group: "Misc"
                },
                popupsOnly: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                showPopupProperties: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                resourceBundleName: {
                    type: "string",
                    group: "Misc"
                },
                pluginResourceBundleName: {
                    type: "string",
                    group: "Misc"
                },
                i18nKeyPrefix: {
                    type: "string",
                    group: "Misc",
                    defaultValue: ""
                },
                headerPluginId: {
                    type: "string",
                    group: "Misc",
                    defaultValue: ""
                }
            },
            publicMethods: ["addPropertyEditorContent", "setPropertyData", "getPropertyData", "getTitle"]
        },
        constructor: function(e, o) {
            t.apply(this, arguments)
        },
        POPUP_MODAL: "popup_modal",
        POPUP_MODELESS: "popup_modeless",
        POPOVER: "popover",
        NEW_TAB: "new_tab"
    });
    z.prototype.isWorkCenterPod = function() {
        return this.getHeaderPluginId() && this.getHeaderPluginId() === "wcPodSelectionPlugin"
    };
    z.prototype.isOperationActivityPod = function() {
        return this.getHeaderPluginId() && this.getHeaderPluginId() === "operationPodSelectionPlugin"
    };
    z.prototype.getTitle = function() {
        if (!this._sTitle) {
            let t = this.getResourceBundleName();
            if (F.isEmpty(t)) {
                this._sTitle = "resourceBundleName not defined";
                return this._sTitle
            }
            if (this.hasProcessIndustryTitle()) {
                this._sTitle = D.getPropertiesText(t, "title")
            } else {
                this._sTitle = D.getNonEnhancedPropertiesText(t, "title")
            }
        }
        return this._sTitle
    };
    z.prototype.hasProcessIndustryTitle = function() {
        return false
    };
    z.prototype.hasConfigurationProperties = function() {
        return true
    };
    z.prototype.addPropertyEditorContent = function(t) {};
    z.prototype.setPopupPropertyEditorController = function(t) {
        this._oPopupPropertyEditorController = t
    };
    z.prototype.getPopupPropertyEditorController = function() {
        return this._oPopupPropertyEditorController
    };
    z.prototype.addFormContent = function(t, e) {
        if (e.setFieldGroupIds) {
            e.setFieldGroupIds(["PROPERTY_EDITOR_GROUP"])
        }
        t.addContent(e)
    };
    z.prototype.addPopupPropertyEditorContent = function(t) {
        if (!this.getShowPopupProperties()) {
            return
        }
        this._oPopupPropertyFormContainer = t;
        let e = this.getPopupPropertyData();
        this.addPopupTypeSelectionControl(t, e);
        this.addPopupPropertyControls(t, e)
    };
    z.prototype.addPopupTypeSelectionControl = function(t, e) {
        let o = this.getPopupSelectValidData();
        this.addSelect(t, "popup", e, o.validValues, o.validTexts, false)
    };
    z.prototype.addPopupPropertyControls = function(t, e) {
        let o = {
            type: "Number"
        };
        this._aPopupControls = [];
        this._aModelessControls = [];
        this._aModalControls = [];
        this._aPopoverControls = [];
        this._aModalControls[this._aModalControls.length] = this.addInputField(t, "popupTitle", e);
        this._aPopoverControls[this._aPopoverControls.length] = this.addInputField(t, "popoverTitle", e);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(t, "dialogShowClose", e);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(t, "popupStretch", e);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(t, "popupDraggable", e);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(t, "popupResizable", e);
        this._aModelessControls[this._aModelessControls.length] = this.addInputField(t, "popupTop", e, o);
        this._aModelessControls[this._aModelessControls.length] = this.addInputField(t, "popupLeft", e, o);
        this._aPopupControls[this._aPopupControls.length] = this.addInputField(t, "popupWidth", e, o);
        this._aPopupControls[this._aPopupControls.length] = this.addInputField(t, "popupHeight", e, o);
        let i = this.getPlacementValidData();
        this._aPopoverControls[this._aPopoverControls.length] = this.addSelect(t, "popupPlacement", e, i.validValues, i.validTexts, true);
        this._aPopoverControls[this._aPopoverControls.length] = this.addSwitch(t, "popupShowClose", e);
        this._aPopoverControls[this._aPopoverControls.length] = this.addSwitch(t, "popupModal", e);
        this._oAddRemoveFooterButtonControl = this.addAddRemoveButtonControl(t, "dialogFooterButtons", e);
        this._aModalControls[this._aModalControls.length] = this._oAddRemoveFooterButtonControl;
        this._oAddRemovePopoverFooterButtonControl = this.addAddRemoveButtonControl(t, "popoverFooterButtons", e);
        this._aPopoverControls[this._aPopoverControls.length] = this._oAddRemovePopoverFooterButtonControl;
        this._setPopupControlsVisibility(e["popup"])
    };
    z.prototype.isMultiInstance = function() {
        let t = this.getId();
        let e = this.getMainControllerHelper();
        if (e) {
            return e.isMultipleInstancesAllowed(t)
        } else if (t.indexOf(".") > 0) {
            return true
        }
        return false
    };
    z.prototype.getPopupSelectValidData = function() {
        let t = [];
        let e = [];
        t[t.length] = this.POPUP_MODAL;
        t[t.length] = this.POPUP_MODELESS;
        t[t.length] = this.POPOVER;
        return {
            validValues: t,
            validTexts: e
        }
    };
    z.prototype.getPlacementValidData = function() {
        let t = [];
        t[t.length] = p.Auto;
        t[t.length] = p.HorizontalPreferredLeft;
        t[t.length] = p.HorizontalPreferredRight;
        t[t.length] = p.VerticalPreferredBottom;
        t[t.length] = p.VerticalPreferredTop;
        let e = [];
        e[e.length] = "placement.type.auto";
        e[e.length] = "placement.type.horizontalPreferredLeft";
        e[e.length] = "placement.type.horizontalPreferredRight";
        e[e.length] = "placement.type.verticalPreferredBottom";
        e[e.length] = "placement.type.verticalPreferredTop";
        return {
            validValues: t,
            validTexts: e
        }
    };
    z.prototype._setPopupControlsVisibility = function(t) {
        let e;
        for (e of this._aModelessControls) {
            this._setPopupControlVisible(e, false)
        }
        for (e of this._aModalControls) {
            this._setPopupControlVisible(e, false)
        }
        for (e of this._aPopupControls) {
            this._setPopupControlVisible(e, false)
        }
        for (e of this._aPopoverControls) {
            this._setPopupControlVisible(e, false)
        }
        if (F.isNotEmpty(t)) {
            this._setDelayedPopupControlVisible(t)
        }
    };
    z.prototype._setDelayedPopupControlVisible = function(t) {
        let e = this;
        setTimeout(function() {
            let o;
            if (t === e.POPUP_MODELESS) {
                for (o of e._aModelessControls) {
                    e._setPopupControlVisible(o, true)
                }
            } else if (t === e.POPOVER) {
                for (o of e._aPopoverControls) {
                    e._setPopupControlVisible(o, true)
                }
            } else if (t === e.POPUP_MODAL) {
                for (o of e._aModalControls) {
                    e._setPopupControlVisible(o, true)
                }
            }
            if (t !== e.NEW_TAB) {
                for (o of e._aPopupControls) {
                    e._setPopupControlVisible(o, true)
                }
            }
        }, 50)
    };
    z.prototype._setPopupControlVisible = function(t, e) {
        let o = this._oPopupPropertyFormContainer.getContent();
        let i = this._oPopupPropertyFormContainer.indexOfContent(t);
        let n = o[i - 1];
        t.setVisible(e);
        n.setVisible(e)
    };
    z.prototype.addTimePickerField = function(t, e, o, i) {
        let n = t.getId() + "-" + e + "Label";
        let r = t.getId() + "-" + e + "Input";
        let s = new l(n, {
            text: this.getLocalizedText(e),
            labelFor: r
        });
        this.addFormContent(t, s);
        let a = i || {};
        a.value = o[e];
        a.valueFormat = a.valueFormat || "HH:mm:ss";
        a.displayFormat = a.displayFormat || "HH:mm:ss";
        a.change = function(t) {
            let o = t.getSource().getValue();
            if (this.isPopupProperty(e)) {
                this.handlePopupInputChange(t.getSource(), e, o)
            } else {
                this.handleInputChange(e, o)
            }
        }.bind(this);
        let p = new c(r, a);
        this.addFormContent(t, p);
        return p
    };
    z.prototype.addInputField = function(t, e, o, i) {
        let n = t.getId();
        let r = o[e];
        let s = n + "-" + e + "Label";
        let p = n + "-" + e + "Input";
        let u = this.getLocalizedText(e);
        let d = new l(s, {
            text: u,
            labelFor: p
        });
        this.addFormContent(t, d);
        let h = this;
        let g;
        if (typeof i === "undefined") {
            g = {
                value: r,
                change: function(t) {
                    let o = t.getSource().getValue();
                    if (h.isPopupProperty(e)) {
                        h.handlePopupInputChange(t.getSource(), e, o)
                    } else if (h.isMaxLengthProperty(e)) {
                        h.handleIntegerInputChange(t.getSource(), e, o)
                    } else {
                        if (!h.validateWidthOrHeightValues(t.getSource(), o, e)) {
                            return
                        }
                        h.handleInputChange(e, o, t.getSource())
                    }
                }
            }
        } else {
            g = f.cloneObject(i);
            if (!g.value) {
                g.value = r
            }
            g.change = function(t) {
                let o = t.getSource().getValue();
                if (h.isPopupProperty(e)) {
                    h.handlePopupInputChange(t.getSource(), e, o)
                } else if (h.isMaxLengthProperty(e)) {
                    h.handleIntegerInputChange(t.getSource(), e, o)
                } else {
                    if (!h.validateWidthOrHeightValues(t.getSource(), o, e)) {
                        return
                    }
                    h.handleInputChange(e, o, t.getSource())
                }
            }
        }
        let c = new a(p, g);
        this.addFormContent(t, c);
        return c
    };
    z.prototype.handleIntegerInputChange = function(t, e, o) {
        let i = this.getPropertyData();
        let n = m.getIntegerInstance({
            strictGroupingValidation: true
        });
        let r = n.parse(o);
        if (Number.isNaN(r)) {
            t.setValueState(y.Error);
            let e = this._getBaseI18nText("message.invalidMaxLengthValueInput");
            t.setValueStateText(e)
        } else {
            t.setValueState(y.None);
            i[e] = r
        }
    };
    z.prototype.handleInputChange = function(t, e, o) {
        let i = this.getPropertyData();
        i[t] = e
    };
    z.prototype.handlePopupInputChange = function(t, e, o) {
        let i = ["popupWidth", "popupHeight", "popupTop", "popupLeft"];
        let n = this.getPopupPropertyData();
        let r = i.indexOf(e);
        if (r > -1 && isNaN(o)) {
            t.setValueState(y.Error);
            let e;
            if (r == 0) {
                e = this._getBaseI18nText("message.invalidWidthValueInput")
            } else if (r == 1) {
                e = this._getBaseI18nText("message.invalidHeightValueInput")
            } else if (r == 2) {
                e = this._getBaseI18nText("message.invalidTopValueInput")
            } else {
                e = this._getBaseI18nText("message.invalidLeftValueInput")
            }
            t.setValueStateText(e)
        } else {
            n[e] = o
        }
    };
    z.prototype.addSwitch = function(t, e, o, i, n) {
        let r = t.getId();
        let s = o[e];
        let a = r + "-" + e + "Label";
        let p = r + "-" + e + "Switch";
        let d = this.getLocalizedText(e);
        let h = new l(a, {
            text: d,
            labelFor: p
        });
        this.addFormContent(t, h);
        let g = this;
        let c = new u(p, {
            state: s,
            change: function(t) {
                let o = t.getSource().getState();
                if (g.isPopupProperty(e)) {
                    g.handlePopupSwitchChange(e, o)
                } else {
                    g.handleSwitchChange(e, o)
                }
            }
        });
        if (i) {
            c.setCustomTextOn(i)
        }
        if (n) {
            c.setCustomTextOff(n)
        }
        this.addFormContent(t, c);
        return c
    };
    z.prototype.handleSwitchChange = function(t, e) {
        let o = this.getPropertyData();
        o[t] = e
    };
    z.prototype.handlePopupSwitchChange = function(t, e) {
        let o = this.getPopupPropertyData();
        o[t] = e
    };
    z.prototype.addSelect = function(t, o, i, n, r, s) {
        let a = t.getId();
        let p = i[o];
        let u = a + "-" + o + "Label";
        let h = a + "-" + o + "Select";
        let g = this.getLocalizedText(o);
        let c = new l(u, {
            text: g,
            labelFor: h
        });
        this.addFormContent(t, c);
        let f = this;
        let P = new d(h, {
            change: function(t) {
                let e = t.getSource().getSelectedKey();
                if (e && e === "EMPTY") {
                    e = ""
                }
                if (f.isPopupProperty(o)) {
                    f.handlePopupSelectChange(o, e)
                } else {
                    f.handleSelectChange(o, e)
                }
            }
        });
        let m = true;
        if (arguments.length === 6 && typeof s != "undefined") {
            if (!s) {
                m = false
            }
        }
        if (n && n.length > 0) {
            let t, i;
            for (let s = 0; s < n.length; s++) {
                t = h + "-item" + s;
                if (this.isPopupProperty(o)) {
                    if (!m) {
                        g = this.getLocalizedText(n[s])
                    } else if (r && r[s]) {
                        g = this.getLocalizedText(r[s])
                    }
                } else if (r && r[s]) {
                    if (m) {
                        g = this.getLocalizedText(r[s])
                    } else {
                        g = r[s]
                    }
                } else {
                    g = this.getLocalizedText(n[s])
                }
                i = new e(t, {
                    key: n[s],
                    text: g
                });
                P.addItem(i)
            }
        }
        P.setSelectedKey(p);
        this.addFormContent(t, P);
        return P
    };
    z.prototype.handleSelectChange = function(t, e) {
        let o = this.getPropertyData();
        o[t] = e;
        if (t === "selectActionPageName" && this._oActionButtonSelect) {
            o["selectActionButtonId"] = "";
            this._oActionButtonSelect.setSelectedKey("EMPTY")
        } else if (t === "selectActionButtonId" && this._oActionPageSelect) {
            o["selectActionPageName"] = "";
            this._oActionPageSelect.setSelectedKey("EMPTY")
        }
    };
    z.prototype.addMultiComboBox = function(t, o, i, n, r, s) {
        s = !!s;
        let a = t.getId();
        let p = i[o];
        let u = a + "-" + o + "Label";
        let d = a + "-" + o + "Select";
        let g = this.getLocalizedText(o);
        let c = new l(u, {
            text: g,
            labelFor: d
        });
        this.addFormContent(t, c);
        let f = this;
        let P = new h(d, {
            selectionFinish: function(t) {
                let e = t.getSource().getSelectedKeys();
                f.handleMultiComboBoxChange(o, e)
            }
        });
        const m = n.map(t => t.key);
        if (m) {
            for (let t = 0; t < m.length; t++) {
                let o = d + "-item" + t;
                if (r && r[t]) {
                    if (s) {
                        g = this.getLocalizedText(r[t])
                    } else {
                        g = r[t]
                    }
                } else {
                    g = this.getLocalizedText(n[t].key)
                }
                let i = new e(o, {
                    key: m[t],
                    text: g
                });
                P.addItem(i)
            }
        }
        const y = p.filter(t => t.value).map(t => t.key);
        P.setSelectedKeys(y);
        this.addFormContent(t, P);
        return P
    };
    z.prototype.handleMultiComboBoxChange = function(t, e) {
        e = e || [];
        let o = this.getPropertyData();
        const i = o[t] || this.getDefaultPropertyData()[t];
        const n = i.map(t => {
            t.value = e.includes(t.key);
            return t
        });
        o[t] = n
    };
    z.prototype.handlePopupSelectChange = function(t, e) {
        let o = this.getPopupPropertyData();
        let i = o[t];
        o[t] = e;
        if (t === "popup") {
            if (i === this.POPUP_MODAL && o["popup"] !== this.POPUP_MODAL || i === this.POPOVER && o["popup"] !== this.POPOVER) {
                if (i === this.POPUP_MODAL) {
                    o["dialogFooterButtons"] = [];
                    this.setRegisteredFooterActions(null);
                    if (this._oAddRemoveFooterButtonControl) {
                        this._oAddRemoveFooterButtonControl.refreshTableModel(o)
                    }
                } else if (i === this.POPOVER) {
                    o["popoverFooterButtons"] = [];
                    this.setRegisteredFooterActions(null);
                    if (this._oAddRemovePopoverFooterButtonControl) {
                        this._oAddRemovePopoverFooterButtonControl.refreshTableModel(o)
                    }
                }
            }
            this._setPopupControlsVisibility(o["popup"]);
            if (this._oPopupPropertyEditorController) {
                if (o["popup"] === this.POPUP_MODELESS || o["popup"] === this.POPUP_MODAL || o["popup"] === this.POPOVER) {
                    this._oPopupPropertyEditorController.setPopupEnabled(this, true)
                } else {
                    this._oPopupPropertyEditorController.setPopupEnabled(this, false)
                }
            }
        }
    };
    z.prototype.addButton = function(t, e, o, i, n) {
        let r = t.getId();
        let l = r + "-" + e + "Button";
        let a = this.getLocalizedText(e);
        let p = e + "Tooltip";
        let u = this.getLocalizedText(p);
        if (u === p) {
            u = a
        }
        let d = new s(l, {
            text: this.getLocalizedText(e),
            tooltip: u,
            press: function(r) {
                i.call(n, t, e, o)
            }
        });
        this.addFormContent(t, d)
    };
    z.prototype.addTable = function(t, e) {
        let o = e.listConfiguration;
        if (F.isEmpty(o.tableType)) {
            o.tableType = "mobile"
        }
        let i = e.listColumnData;
        let n = this.getResourceBundle(e.resourceBundleName);
        let r = this._getTableFactory(o, i, n);
        let s = e.tableMetadata;
        let a = e.columnListItemMetadata;
        let p = t.getId();
        let u = p + "-" + e.id + "Label";
        let d = p + "-" + e.id + "Select";
        let h = this._getTableLabel(e);
        let g = new l(u, {
            text: h,
            labelFor: d
        });
        this.addFormContent(t, g);
        let c = r.createTable(d, e.bindingPath, s, a);
        this.addFormContent(t, c);
        return c
    };
    z.prototype._getTableLabel = function(t) {
        let e = "";
        let o = true;
        if (typeof t.showControlLabel !== "undefined") {
            o = t.showControlLabel
        }
        if (o) {
            e = this.getLocalizedText(t.id)
        }
        return e
    };
    z.prototype._getTableFactory = function(t, e, o) {
        return new L(t, e, o)
    };
    z.prototype.addColumnPropertyEditor = function(t, e, o) {
        this._sortColumnConfigurationData(o);
        this.addButton(t, e, o, this._columnConfigurationPressHandler, this);
        let i = null;
        if (F.isNotEmpty(o.listCategory) && o.listCategory === "POD_WORKLIST") {
            i = ["ITEM", "SHOP_ORDER"]
        }
        if (!i) {
            return
        }
        let n = this;
        setTimeout(function() {
            n._updateDefaultColumnPropertyData(t, o, i)
        }, 0)
    };
    z.prototype._updateDefaultColumnPropertyData = function(t, e, o) {
        let i = this._getMainView(t);
        let n = this._getListMaintenanceService(i);
        return n.getCustomColumns(o).then(function(t) {
            this._addCustomDataColumns(e, t);
            this._removeObsoleteCustomColumn(e, t);
            this._sortColumnConfigurationData(e)
        }.bind(this))
    };
    z.prototype._addCustomDataColumns = function(t, e) {
        if (!e || e.length === 0) {
            return
        }
        if (!t.columnConfiguration) {
            t.columnConfiguration = []
        }
        for (let o of e) {
            let e = -1;
            for (let i = 0; i < t.columnConfiguration.length; i++) {
                if (t.columnConfiguration[i].columnId === o.columnId) {
                    e = i;
                    break
                }
            }
            let i = this._getBaseI18nText("customDataFieldLabelPrefix_" + o.tableName);
            if (e >= 0) {
                t.columnConfiguration[e].description = i + o.columnLabel;
                continue
            }
            t.columnConfiguration[t.columnConfiguration.length] = {
                columnId: o.columnId,
                description: i + o.columnLabel,
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle"
            }
        }
    };
    z.prototype._removeObsoleteCustomColumn = function(t, e) {
        let o = [];
        for (let i of t.columnConfiguration) {
            let t = i.columnId;
            if (t.indexOf(".") > 0) {
                if (!this._findCustomColumn(t, e)) {
                    continue
                }
            }
            o[o.length] = i
        }
        t.columnConfiguration = o
    };
    z.prototype._findCustomColumn = function(t, e) {
        if (e && e.length > 0) {
            for (let o of e) {
                if (t === o.columnId) {
                    return true
                }
            }
        }
        return false
    };
    z.prototype._sortColumnConfigurationData = function(t) {
        let e = t.columnConfiguration;
        if (e && e.length > 1) {
            e.sort(function(t, e) {
                if (t.description > e.description) {
                    return 1
                } else if (e.description > t.description) {
                    return -1
                }
                return 0
            })
        }
    };
    z.prototype._columnConfigurationPressHandler = function(t, e, o) {
        let i = this._getMainView(t);
        if (!i) {
            this._logMessage("Cannot open column property editor.  Cannot find main view");
            return
        }
        let s = [{
            Name: this._getBaseI18nText("valign_top"),
            Key: C.Top
        }, {
            Name: this._getBaseI18nText("valign_middle"),
            Key: C.Middle
        }, {
            Name: this._getBaseI18nText("valign_inherit"),
            Key: C.Inherit
        }, {
            Name: this._getBaseI18nText("valign_bottom"),
            Key: C.Bottom
        }];
        let l = [{
            Name: this._getBaseI18nText("halign_right"),
            Key: _.Right
        }, {
            Name: this._getBaseI18nText("halign_left"),
            Key: _.Left
        }, {
            Name: this._getBaseI18nText("halign_initial"),
            Key: _.Initial
        }, {
            Name: this._getBaseI18nText("halign_end"),
            Key: _.End
        }, {
            Name: this._getBaseI18nText("halign_center"),
            Key: _.Center
        }, {
            Name: this._getBaseI18nText("halign_begin"),
            Key: _.Begin
        }];
        let a = f.cloneObject(o[e]);
        let p = {
            ColumnConfiguration: a,
            HAlign: l,
            VAlign: s
        };
        this._sColumnPropertyDataName = e;
        this._oColumnPropertyData = o;
        this._oCpeDialogController = new b;
        this._oCpeModel = new r;
        this._oCpeModel.setData(p);
        this._oCpeDialogController.setTableModel(this._oCpeModel);
        this._oCpeDialogController.setCloseHandler(this._handleColumnPropertyEditorClose, this);
        this._oCpeDialog = this._getColumnPropertyEditorDialogFragment(this._oCpeDialogController);
        let u = new n({
            bundleName: V
        });
        this._oCpeDialog.setModel(u, "cpeI18n");
        let d = new n({
            bundleName: R
        });
        this._oCpeDialog.setModel(d, H);
        this._oCpeDialog.attachBeforeOpen(this._oCpeDialogController.beforeOpen, this._oCpeDialogController);
        let h = this;
        this._oCpeDialog.setEscapeHandler(function(t) {
            h._oCpeDialogController._handleColumnPropertyEditorDialogClose({
                escPressed: true
            });
            t.resolve()
        });
        i.addDependent(this._oCpeDialog);
        this._openColumnPropertyEditorDialog(this._oCpeDialog, i)
    };
    z.prototype._getColumnPropertyEditorDialogFragment = function(t) {
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ColumnPropertyEditorDialog", t)
    };
    z.prototype._openColumnPropertyEditorDialog = function(t, e) {
        i("sapUiSizeCompact", e, t);
        t.open()
    };
    z.prototype._handleColumnPropertyEditorClose = function(t, e) {
        this._oCpeDialog.close();
        if (e) {
            this._oColumnPropertyData[this._sColumnPropertyDataName] = t["ColumnConfiguration"]
        }
        this._oCpeModel.destroy();
        this._oCpeDialog.detachBeforeOpen(this._oCpeDialogController.beforeOpen, this._oCpeDialogController);
        this._oCpeDialog.destroy();
        this._oCpeDialog = null
    };
    z.prototype.addPrintLabelPropertyEditor = function(t, e, o) {
        this._sortCustomFieldConfigurationData(o);
        this.addButton(t, e, o, this._printLabelConfigurationPressHandler, this)
    };
    z.prototype._sortCustomFieldConfigurationData = function(t) {
        if (!t.printLabelConfiguration) {
            t["printLabelConfiguration"] = this.getPrintLabelConfigurationList()
        } else if (t.printLabelConfiguration.isGR === undefined) {
            let e = this.getPrintLabelConfigurationList();
            t["printLabelConfiguration"].isGR = e.isGR
        }
        let e = t.printLabelConfiguration.customFields;
        if (e && e.length > 1) {
            e.sort(function(t, e) {
                if (t.columnId > e.columnId) {
                    return 1
                } else if (e.columnId > t.columnId) {
                    return -1
                }
                return 0
            })
        }
    };
    z.prototype._printLabelConfigurationPressHandler = function(t, e, o) {
        let i = this._getMainView(t);
        if (!i) {
            this._logMessage("Cannot open print label property editor.  Cannot find main view");
            return
        }
        let s = f.cloneObject(o[e]);
        this._sPrintLabelPropertyDataName = e;
        this._oPrintLabelPropertyData = o;
        this._oLprDialogController = new A;
        this._oLprModel = new r;
        this._oLprModel.setData(s);
        this._oLprDialogController.setTableModel(this._oLprModel);
        this._oLprDialogController.setCloseHandler(this._handlePrintLabelPropertyEditorClose, this);
        this._oLprDialog = this._getPrintLabelPropertyEditorDialogFragment(this._oLprDialogController);
        let l = new n({
            bundleName: V
        });
        this._oLprDialog.setModel(l, "lprI18n");
        let a = new n({
            bundleName: R
        });
        this._oLprDialog.setModel(a, H);
        this._oLprDialog.attachBeforeOpen(this._oLprDialogController.beforeOpen, this._oLprDialogController);
        let p = this;
        this._oLprDialog.setEscapeHandler(function(t) {
            p._oLprDialogController._handlePrintLabelPropertyEditorDialogClose({
                escPressed: true
            });
            t.resolve()
        });
        i.addDependent(this._oLprDialog);
        this._openPrintLabelEditorDialog(this._oLprDialog, i)
    };
    z.prototype._getPrintLabelPropertyEditorDialogFragment = function(t) {
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.PrintLabelPropertyEditorDialog", t)
    };
    z.prototype._openPrintLabelEditorDialog = function(t, e) {
        i("sapUiSizeCompact", e, t);
        t.open()
    };
    z.prototype._handlePrintLabelPropertyEditorClose = function(t) {
        this._oLprDialog.close();
        this._oPrintLabelPropertyData[this._sPrintLabelPropertyDataName] = t;
        this._oLprModel.destroy();
        this._oLprDialog.detachBeforeOpen(this._oLprDialogController.beforeOpen, this._oLprDialogController);
        this._oLprDialog.destroy();
        this._oLprDialog = null
    };
    z.prototype.addInputParameterTable = function(t, e, o) {
        let i = t.getId();
        let s = i + "-" + e + "Label";
        this._sInputParameterTablePropertyDataName = e;
        this._oInputParameterTablePropertyData = o;
        let a = f.cloneObject(o[e]);
        this._oIptTableController = new E;
        this._oIptTableModel = new r;
        this._oIptTableModel.setData({
            parameters: a
        });
        this._oIptTable = this._getInputParameterTableFragment(this._oIptTableController);
        this._oIptTable.setModel(this._oIptTableModel, "oTableModel");
        let p = new n({
            bundleName: V
        });
        this._oIptTable.setModel(p, "iptI18n");
        let u = new n({
            bundleName: R
        });
        this._oIptTable.setModel(u, H);
        this._oIptTableController.setModels(this._oIptTableModel, p);
        let d = new l(s, {
            labelFor: this._oIptTable
        });
        this.addFormContent(t, d);
        this.addFormContent(t, this._oIptTable)
    };
    z.prototype._getInputParameterTableFragment = function(t) {
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.InputParameterTable", t)
    };
    z.prototype.addListNameBrowse = function(t, e, o, i, n) {
        let r = this._getMainView(t);
        if (!r) {
            this._logMessage("Cannot open list name browse.  Cannot find main view");
            return
        }
        let s = this.addInputField(t, o, i, {
            showValueHelp: true
        });
        let l = i[e];
        let a = {
            mainView: r,
            inputFieldId: s.getId(),
            listType: l,
            columnEditorDetails: n
        };
        s.attachValueHelpRequest(a, this.handleListNameSearchPress, this);
        return s
    };
    z.prototype.handleListNameSearchPress = function(t, e) {
        let o = e.mainView;
        if (!o) {
            this._logMessage("Cannot open list name browse.  Cannot find main view");
            return
        }
        let i = e.listType;
        if (F.isEmpty(i)) {
            this.showErrorMessage(this.getI18nText("message.listTypeRequiredMessage"));
            return
        }
        let n = e.inputFieldId;
        if (F.isEmpty(n)) {
            this._logMessage("list name browse control 'sInputFieldId' is not defined.");
            return
        }
        let r = e.columnEditorDetails;
        if (!r || r.length === 0) {
            this._logMessage("list name browse control 'tableColumns' is not defined.");
            return
        }
        let s = this._getListMaintenanceService(o);
        return s.getListNamesByType(i).then(function(t) {
            this.showListNameSearchDialog(t, o, i, n, r)
        }.bind(this)).catch(function(t) {
            let e = this.getI18nText("message.listSearchUnknownError");
            this._showAjaxErrorMessage(e, t)
        }.bind(this))
    };
    z.prototype._getListMaintenanceService = function(t) {
        if (!this._oListMaintenanceService) {
            let e = t.getController();
            let o = this.getPodFoundationDataSourceUri(e);
            let i = this.getPlantODataSourceUri(e);
            this._oListMaintenanceService = new M(o, i)
        }
        return this._oListMaintenanceService
    };
    z.prototype.showListNameSearchDialog = function(t, e, o, i, s) {
        let l = this._getSortedListNamesFromResponse(t);
        this._sInputFieldId = i;
        let a = this._byId(this._sInputFieldId);
        let p = null;
        if (a) {
            p = a.getValue()
        }
        this._oLnsDialogController = new I;
        this._oLnsModel = new r;
        this._oLnsModel.setData(l);
        this._oLnsDialogController.setMainView(e);
        this._oLnsDialogController.setListType(o);
        this._oLnsDialogController.setCurrentListName(p);
        this._oLnsDialogController.setColumnEditorDetails(s);
        this._oLnsDialogController.setTableModel(this._oLnsModel);
        this._oLnsDialogController.setConfirmHandler(this.handleListNameSearchConfirm, this);
        this._oLnsDialogController.setCancelHandler(this.handleListNameSearchCancel, this);
        this._oLnsDialog = this._getListNameSearchDialogFragment(this._oLnsDialogController);
        let u = new n({
            bundleName: V
        });
        this._oLnsDialog.setModel(u, "lnsI18n");
        let d = new n({
            bundleName: R
        });
        this._oLnsDialog.setModel(d, H);
        let h = this;
        this._oLnsDialog.setEscapeHandler(function(t) {
            h.handleListNameSearchCancel();
            t.resolve()
        });
        this._oLnsDialog.attachBeforeOpen(this._oLnsDialogController.beforeOpen, this._oLnsDialogController);
        e.addDependent(this._oLnsDialog);
        this._openListNameSearchDialog(this._oLnsDialog, e)
    };
    z.prototype._getListNameSearchDialogFragment = function(t) {
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ListNameSearchDialog", t)
    };
    z.prototype._openListNameSearchDialog = function(t, e) {
        i("sapUiSizeCompact", e, t);
        t.open()
    };
    z.prototype._getSortedListNamesFromResponse = function(t) {
        let e = [];
        if (t && t.length > 0) {
            for (let o of t) {
                if (o.listName.indexOf("SAP$INVISIBLE") === 0) {
                    continue
                }
                let t = o.description;
                if (t && t.indexOf("I18N[") === 0) {
                    let e = t.substring(t.indexOf("[") + 1, t.indexOf("]"));
                    o.description = this._getListMaintenanceI18nText(e)
                }
                e[e.length] = o
            }
        }
        let o = {
            ListNames: e
        };
        o.ListNames.sort(function(t, e) {
            if (t.listName > e.listName) {
                return 1
            } else if (e.listName > t.listName) {
                return -1
            }
            return 0
        });
        return o
    };
    z.prototype.handleListNameSearchConfirm = function(t) {
        let e = this._byId(this._sInputFieldId);
        if (e) {
            e.setValue(t);
            e.fireChangeEvent(t)
        }
        this.handleListNameSearchCancel()
    };
    z.prototype.handleListNameSearchCancel = function() {
        this._oLnsDialog.close();
        this._oLnsModel.destroy();
        this._oLnsDialog.detachBeforeOpen(this._oLnsDialogController.beforeOpen, this._oLnsDialogController);
        this._oLnsDialog.destroy();
        this._oLnsDialog = null
    };
    z.prototype.addAddRemoveButtonControl = function(t, e, o) {
        let i = t.getId();
        let n = i + "-" + e + "Label";
        let r = i + "-" + e + "AddRemoveControl";
        let s = new l(n, {
            text: "",
            labelFor: r
        });
        this.addFormContent(t, s);
        let a = new B(r, {
            propertyEditor: this,
            dataName: e,
            defaultData: o
        });
        this.addFormContent(t, a);
        return a
    };
    z.prototype.getAddRemoveButtonControlTitle = function(t) {
        if (t === "dialogFooterButtons" || t === "popoverFooterButtons") {
            return this.getPodDesignerI18nText("footerButtonAssignmentTitle")
        }
        return this.getPodDesignerI18nText("buttonAssignmentTitle")
    };
    z.prototype._getMainView = function(t) {
        let e = null;
        let o = t;
        while (o && o.getParent) {
            o = o.getParent();
            if (o instanceof sap.ui.core.mvc.View) {
                e = o;
                break
            }
        }
        return e
    };
    z.prototype.setPropertyData = function(t) {
        this._oPropertyData = t;
        if (this._oPropertyData && this._oPropertyData.printLabelConfiguration) {
            let t = this.getPrintLabelConfigurationList();
            this._oPropertyData.printLabelConfiguration.labelDocName.description = t.labelDocName.description;
            this._oPropertyData.printLabelConfiguration.labelDocVersion.description = t.labelDocVersion.description
        }
        if (this._oPropertyData && this._oPropertyData.columnConfiguration) {
            this._updateColumnConfiguration(this._oPropertyData.columnConfiguration)
        }
        if (this._oPropertyData && this._oPropertyData.registeredActions) {
            this.setRegisteredActions(this._oPropertyData.registeredActions)
        }
        if (this._oPropertyData && this._oPropertyData.registeredFooterActions) {
            this.setRegisteredFooterActions(this._oPropertyData.registeredFooterActions)
        }
        let e = this.getCustomExtension();
        if (e) {
            this._oPropertyData = e.setPropertyData(this._oPropertyData)
        }
    };
    z.prototype._updateColumnConfiguration = function(t) {
        if (!t || t.length === 0) {
            return
        }
        let e = this.getColumnConfigurationList();
        if (!e) {
            return
        }
        for (let o of t) {
            if (o.columnId.indexOf(".") > 0) {
                this._updateColumnToConfiguration(e, o, -1)
            } else if (e && e.length > 0) {
                for (let t = 0; t < e.length; t++) {
                    if (o.columnId === e[t].columnId) {
                        this._updateColumnToConfiguration(e, o, t);
                        break
                    }
                }
            }
        }
        this._oPropertyData.columnConfiguration = e
    };
    z.prototype._updateColumnToConfiguration = function(t, e, o) {
        if (o < 0) {
            t[t.length] = {
                columnId: e.columnId,
                description: e.description,
                wrapping: e.wrapping,
                hAlign: e.hAlign,
                vAlign: e.vAlign,
                minScreenWidth: e.minScreenWidth,
                demandPopin: e.demandPopin,
                label: e.label,
                width: e.width
            }
        } else {
            t[o].wrapping = e.wrapping;
            t[o].hAlign = e.hAlign;
            t[o].vAlign = e.vAlign;
            t[o].minScreenWidth = e.minScreenWidth;
            t[o].demandPopin = e.demandPopin;
            t[o].label = e.label;
            t[o].width = e.width
        }
    };
    z.prototype.getColumnConfigurationList = function() {
        return null
    };
    z.prototype.getPropertyData = function() {
        if (!this._oPropertyData) {
            this._oPropertyData = this.getDefaultPropertyData()
        }
        if (this.getShowPopupProperties()) {
            if (!this._oPopupPropertyData) {
                this._oPopupPropertyData = this.getDefaultPopupPropertyData()
            }
        }
        let t = this.getCustomExtension();
        if (t) {
            this._oPropertyData = t.getPropertyData(this._oPropertyData)
        }
        return this._oPropertyData
    };
    z.prototype.setPopupPropertyData = function(t) {
        this._oPopupPropertyData = t;
        if (F.isEmpty(this._oPopupPropertyData.popup) && this.getShowPopupProperties()) {
            this._oPopupPropertyData.popup = this.POPUP_MODAL
        }
    };
    z.prototype.getPopupPropertyData = function() {
        if (!this._oPopupPropertyData) {
            this._oPopupPropertyData = this.getDefaultPopupPropertyData()
        }
        if (F.isEmpty(this._oPopupPropertyData.popup) && this.getShowPopupProperties()) {
            this._oPopupPropertyData.popup = this.POPUP_MODAL
        }
        if (!this._oPopupPropertyData.dialogFooterButtons) {
            this._oPopupPropertyData.dialogFooterButtons = []
        }
        if (!this._oPopupPropertyData.popoverFooterButtons) {
            this._oPopupPropertyData.popoverFooterButtons = []
        }
        return this._oPopupPropertyData
    };
    z.prototype.setRegisteredActions = function(t) {
        this._aRegisteredActions = t;
        let e = this.getPropertyData();
        if (!e) {
            e = {}
        }
        if (t && t.length > 0) {
            e["registeredActions"] = t
        } else if (e.registeredActions) {
            delete e.registeredActions
        }
    };
    z.prototype.getRegisteredActions = function() {
        return this._aRegisteredActions
    };
    z.prototype.setRegisteredFooterActions = function(t) {
        this._aRegisteredFooterActions = t;
        let e = this.getPropertyData();
        if (!e) {
            e = {}
        }
        if (t && t.length > 0) {
            e["registeredFooterActions"] = t
        } else if (e.registeredFooterActions) {
            delete e.registeredFooterActions
        }
    };
    z.prototype.getRegisteredFooterActions = function() {
        return this._aRegisteredFooterActions
    };
    z.prototype.setActionSelections = function(t) {
        this._aActionSelections = t
    };
    z.prototype.getActionSelections = function() {
        return this._aActionSelections
    };
    z.prototype.getNavigationPageSelections = function() {
        return this._aNavigationPageSelections
    };
    z.prototype.setNavigationPageSelections = function(t) {
        this._aNavigationPageSelections = t
    };
    z.prototype.getTabPageSelections = function() {
        return this._aTabPageSelections
    };
    z.prototype.setTabPageSelections = function(t) {
        this._aTabPageSelections = t
    };
    z.prototype.getDefaultPropertyData = function() {
        return null
    };
    z.prototype.getDefaultPopupPropertyData = function() {
        let t = "";
        if (this.getShowPopupProperties()) {
            t = this.POPUP_MODAL
        }
        return {
            popup: t,
            popupWidth: 500,
            popupHeight: 600,
            popupTop: 30,
            popupLeft: 30,
            popupResizable: true,
            popupDraggable: true,
            popupStretch: false,
            popupTitle: "",
            popoverTitle: "",
            popupShowClose: false,
            dialogShowClose: false,
            popupModal: false,
            popupPlacement: p.HorizontalPreferredRight,
            dialogFooterButtons: [],
            popoverFooterButtons: []
        }
    };
    z.prototype.validateWidthOrHeightValues = function(t, e, o) {
        let i = this.getWidthOrHeightProperty(o);
        if (F.isEmpty(i)) {
            return true
        }
        if (F.isNotEmpty(e) && !this.isValidCSS(i, e)) {
            t.setValueState(y.Error);
            let e;
            if (i === "width") {
                e = this._getBaseI18nText("message.invalidWidthValueInput")
            } else {
                e = this._getBaseI18nText("message.invalidHeightValueInput")
            }
            t.setValueStateText(e);
            t.focus();
            return false
        }
        t.setValueState(y.None);
        t.setValueStateText(null);
        return true
    };
    z.prototype.getWidthOrHeightProperty = function(t) {
        if (F.isNotEmpty(t) && (t === "width" || t === "height")) {
            return t
        }
        return null
    };
    z.prototype.isValidCSS = function(t, e) {
        if (this.isNumber(e)) {
            return false
        }
        return o.CSSSize.isValid(e)
    };
    z.prototype.isNumber = function(t) {
        if (F.isEmpty(t)) {
            return false
        }
        if (typeof t === "number" || !isNaN(t)) {
            return true
        }
        return false
    };
    z.prototype.isPopupProperty = function(t) {
        return w.indexOf(t) > -1
    };
    z.prototype.isMaxLengthProperty = function(t) {
        return false
    };
    z.prototype.getProductionDataSourceUri = function(t) {
        return t.getOwnerComponent().getDataSourceUriByName("production-RestSource")
    };
    z.prototype.getPodFoundationDataSourceUri = function(t) {
        return t.getOwnerComponent().getDataSourceUriByName("podFoundation-RestSource")
    };
    z.prototype.getPlantODataSourceUri = function(t) {
        return t.getOwnerComponent().getDataSourceUriByName("plant-oDataSource")
    };
    z.prototype.getResourceBundle = function(t) {
        let e = t;
        if (F.isEmpty(e)) {
            e = this.getResourceBundleName()
        }
        let o = new n({
            bundleName: e
        }).getResourceBundle();
        if (o.aPropertyFiles.length === 0) {
            N.error("Bundle '" + e + "' not found")
        }
        return o
    };
    z.prototype.getI18nText = function(t, e) {
        let o = this.getResourceBundleName();
        if (F.isEmpty(o)) {
            return t
        }
        return D.getPropertiesText(o, t, e)
    };
    z.prototype.getPodDesignerI18nText = function(t, e) {
        return D.getPropertiesText(O, t, e)
    };
    z.prototype.getPluginI18nText = function(t, e) {
        let o = this.getPluginResourceBundleName();
        if (F.isEmpty(o)) {
            return t
        }
        return D.getPropertiesText(o, t, e)
    };
    z.prototype._getBaseI18nText = function(t, e) {
        return D.getPropertyEditorText(t, e)
    };
    z.prototype._getListMaintenanceI18nText = function(t, e) {
        return D.getPropertiesText("sap.dm.dme.i18n.listMaintenance", t, e)
    };
    z.prototype._getGlobalI18nText = function(t, e) {
        return D.getGlobalBundle().getText(t, e)
    };
    z.prototype.getLocalizedText = function(t, e) {
        let o = this.getI18nKeyPrefix();
        let i = o + t;
        let n = this.getI18nText(i, e);
        if (n === i) {
            n = this._getBaseI18nText(t, e);
            if (n === t) {
                n = this._getGlobalI18nText(t, e)
            }
        }
        return n
    };
    z.prototype.addActionAssignmentButton = function(t, e) {
        this._addAssignmentButton(t, e, this._handleActionAssignmentButtonPress, this)
    };
    z.prototype._handleActionAssignmentButtonPress = function(t, e) {
        let o = this.getPropertyData();
        this.setAssignedActions(o[e]);
        let i = this._getActionAssignmentHelper(e);
        i.showActionAssignmentDialog()
    };
    z.prototype.addPluginAssignmentButton = function(t, e) {
        this._addAssignmentButton(t, e, this._handlePluginAssignmentButtonPress, this)
    };
    z.prototype._handlePluginAssignmentButtonPress = function(t, e) {
        let o = this.getPropertyData();
        this.setAssignedPlugin(o[e]);
        let i = this._getActionAssignmentHelper(e);
        i.showPluginAssignmentDialog()
    };
    z.prototype._addAssignmentButton = function(t, e, o, i) {
        let n = t.getId();
        let r = n + "-" + e + "Label";
        let a = n + "-" + e + "Button";
        let p = new l(r, {
            text: this.getLocalizedText(e),
            labelFor: a
        });
        this.addFormContent(t, p);
        let u = new s(a, {
            text: this.getLocalizedText(e),
            tooltip: this.getLocalizedText(e),
            press: function(t) {
                o.call(i, t, e)
            }
        });
        this.addFormContent(t, u)
    };
    z.prototype._getActionAssignmentHelper = function(t) {
        let e = this.getActionAssignmentButtonType(t);
        return new S(this, e, t)
    };
    z.prototype.getMenuItemLabelList = function(t) {
        let e = this.getActionAssignmentButtonType(t);
        let o = [];
        if (e === "ACTION_BUTTON") {
            o = v.getActionButtonLabelList()
        } else {
            o = v.getGroupButtonLabelList()
        }
        return {
            I18nButtonLabels: o
        }
    };
    z.prototype.getButtonLabelList = function(t) {
        let e = this.getActionAssignmentButtonType(t);
        let o = [];
        if (e === "ACTION_BUTTON") {
            o = v.getActionButtonLabelList()
        } else if (e === "MENU_BUTTON") {
            o = v.getGroupButtonLabelList()
        } else if (e === "NAVIGATION_BUTTON") {
            o = v.getNavigationButtonLabelList()
        }
        return {
            I18nButtonLabels: o
        }
    };
    z.prototype.getButtonTooltipList = function(t) {
        let e = this.getActionAssignmentButtonType(t);
        let o = [];
        if (e === "ACTION_BUTTON") {
            o = v.getActionButtonTooltipList()
        } else if (e === "MENU_BUTTON") {
            o = v.getGroupButtonTooltipList()
        } else if (e === "NAVIGATION_BUTTON") {
            o = v.getNavigationButtonTooltipList()
        }
        return {
            I18nTooltipLabels: o
        }
    };
    z.prototype.getActionAssignmentDialogTitle = function(t) {
        let e = this.getActionAssignmentButtonType(t);
        let o = "";
        if (e === "ACTION_BUTTON") {
            o = this.getLocalizedText("actionButtonTitle")
        } else if (e === "MENU_BUTTON") {
            o = this.getLocalizedText("menuButtonTitle")
        }
        return this.getLocalizedText("actionAssignmentDialogTitle", [o])
    };
    z.prototype.isPodDesignerPropertyEditor = function() {
        return false
    };
    z.prototype.setActionAssignmentButtonType = function(t, e) {
        if (e === "dialogFooterButtons" || e === "popoverFooterButtons") {
            this._sFooterButtonType = t
        }
    };
    z.prototype.getActionAssignmentButtonType = function(t) {
        if (t === "dialogFooterButtons" || t === "popoverFooterButtons") {
            return this._sFooterButtonType
        }
        return null
    };
    z.prototype.setActiveButtonIndex = function(t, e) {
        this._iButtonIndex = t
    };
    z.prototype.getActiveButtonIndex = function(t) {
        return this._iButtonIndex
    };
    z.prototype.updateAssignedActions = function(t, e) {
        this.setAssignedActions(t);
        let o;
        if (e === "dialogFooterButtons" || e === "popoverFooterButtons") {
            o = this.getPopupPropertyData();
            let i;
            if (e === "dialogFooterButtons") {
                i = o.dialogFooterButtons
            } else {
                i = o.popoverFooterButtons
            }
            i[this.getActiveButtonIndex(e)].actions = t;
            return
        }
        o = this.getPropertyData();
        o[e] = t
    };
    z.prototype.updateAssignedPlugin = function(t, e) {
        let o = this.getPropertyData();
        o[e] = t
    };
    z.prototype.registerActions = function(t) {
        if (t === "dialogFooterButtons" || t === "popoverFooterButtons") {
            this._registerFooterActions(t)
        }
    };
    z.prototype._registerFooterActions = function(t) {
        let e = this.getPopupPropertyData();
        let o = e[t];
        if (!o || o.length === 0) {
            return
        }
        let i = [];
        for (let t of o) {
            if (t.actions && t.actions.length > 0) {
                for (let e of t.actions) {
                    i[i.length] = e.pluginId
                }
            }
        }
        if (i.length > 0) {
            this.setRegisteredFooterActions(i)
        }
    };
    z.prototype.initializeProperties = function() {};
    z.prototype.setMainController = function(t) {
        this._oMainController = t
    };
    z.prototype.getMainController = function() {
        return this._oMainController
    };
    z.prototype.getMainControllerHelper = function() {
        let t = this.getMainController();
        if (t) {
            return t.getMainControllerHelper()
        }
        return null
    };
    z.prototype.setAvailableActions = function(t) {
        this._aAvailableActions = t
    };
    z.prototype.getAvailableActions = function() {
        return this._aAvailableActions
    };
    z.prototype.setAssignedActions = function(t) {
        this._aAssignedActions = t
    };
    z.prototype.getAssignedActions = function() {
        return this._aAssignedActions
    };
    z.prototype.setAssignedPlugin = function(t) {
        this._sAssignedPlugin = t
    };
    z.prototype.getAssignedPlugin = function() {
        return this._sAssignedPlugin
    };
    z.prototype.getAssignedTabPages = function() {
        let t = this.getMainControllerHelper();
        if (t) {
            return t.getAssignedTabPages()
        }
        return null
    };
    z.prototype.setExecutionPropertyEditors = function(t) {
        this._aExecutionPropertyEditors = t
    };
    z.prototype.getExecutionPropertyEditors = function() {
        return this._aExecutionPropertyEditors
    };
    z.prototype.setEventPropertyEditors = function(t) {
        this._aEventPropertyEditors = t
    };
    z.prototype.getEventPropertyEditors = function() {
        return this._aEventPropertyEditors
    };
    z.prototype.setTransactionPropertyEditors = function(t) {
        this._aTransactionPropertyEditors = t
    };
    z.prototype.getTransactionPropertyEditors = function() {
        return this._aTransactionPropertyEditors
    };
    z.prototype.setProductionProcessPropertyEditors = function(t) {
        this._aProductionProcessPropertyEditors = t
    };
    z.prototype.getProductionProcessPropertyEditors = function() {
        return this._aProductionProcessPropertyEditors
    };
    z.prototype.initializedActionButtons = function(t, e, o) {
        let i = [];
        i[i.length] = "EMPTY";
        let n = [];
        n[n.length] = "";
        let r = this.getActionSelections();
        if (r && r.length > 0) {
            for (let t of r) {
                i[i.length] = t.id;
                n[n.length] = t.text
            }
        }
        return this.addSelect(t, e, o, i, n, false)
    };
    z.prototype.initializedActionPages = function(t, e) {
        let o = e;
        if (F.isEmpty(e)) {
            o = "selectActionPageName"
        }
        let i = this.getNavigationPageSelections();
        return this._initializePageSelection(t, o, i)
    };
    z.prototype.initializeTabPages = function(t, e) {
        let o = e;
        if (F.isEmpty(e)) {
            o = "selectTabPageName"
        }
        let i = this.getTabPageSelections();
        this._sortByDescription(i);
        return this._initializePageSelection(t, o, i)
    };
    z.prototype.initializeAssignedTabPages = function(t, e) {
        let o = e;
        if (F.isEmpty(e)) {
            o = "selectTabPageName"
        }
        let i = this.getAssignedTabPages();
        return this._initializePageSelection(t, o, i)
    };
    z.prototype._initializePageSelection = function(t, e, o) {
        let i = [];
        let n = [];
        this._loadValidPageLists(o, i, n);
        return this.addSelect(t, e, this.getPropertyData(), i, n, false)
    };
    z.prototype._loadValidPageLists = function(t, e, o) {
        e[e.length] = "EMPTY";
        o[o.length] = "";
        if (t && t.length > 0) {
            for (let i of t) {
                e[e.length] = i.page;
                o[o.length] = i.description
            }
        }
    };
    z.prototype._sortByDescription = function(t) {
        if (t && t.length > 1) {
            t.sort(function(t, e) {
                let o = t.description.toLowerCase();
                let i = e.description.toLowerCase();
                if (o < i) {
                    return -1
                } else if (o > i) {
                    return 1
                }
                return 0
            })
        }
    };
    z.prototype.showErrorMessage = function(t) {
        g.error(t)
    };
    z.prototype._showAjaxErrorMessage = function(t, e) {
        let o = T.getErrorMessage(e);
        if (F.isEmpty(o)) {
            o = t
        }
        this.showErrorMessage(o)
    };
    z.prototype._logMessage = function(t) {
        N.error(t)
    };
    z.prototype._byId = function(t) {
        return sap.ui.getCore().byId(t)
    };
    z.prototype.registerCustomExtensions = function() {
        let t = this.getName();
        if (F.isEmpty(t)) {
            return null
        }
        let e = this._getPropertyEditorExtensionLoader();
        return e.registerCustomExtensions(t)
    };
    z.prototype.getCustomExtension = function() {
        let t = this.getName();
        if (F.isEmpty(t)) {
            return null
        }
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.findCustomPropertyEditorExtension();
            if (this._oCustomExtension) {
                this._oCustomExtension.setController(this);
                this._oCustomExtension.setCoreExtension(this)
            }
        }
        return this._oCustomExtension
    };
    z.prototype.findCustomPropertyEditorExtension = function() {
        let t = this._getPropertyEditorExtensionLoader();
        return t.findCustomPropertyEditorExtension("propertyEditor")
    };
    z.prototype._getPropertyEditorExtensionLoader = function() {
        if (!this._oPropertyEditorExtensionLoader) {
            this._oPropertyEditorExtensionLoader = new x(this)
        }
        return this._oPropertyEditorExtensionLoader
    };
    z.prototype.setColumnProperties = function(t, e, o, i, n) {
        for (let r of n) {
            if (r.columnId === t) {
                r.wrapping = e;
                r.hAlign = o;
                r.vAlign = i;
                break
            }
        }
    };
    z.prototype.addListColumnEditorDetail = function(t, e, o, i, n, r, s) {
        const l = this.getPluginI18nText(i);
        t[t.length] = {
            columnId: o,
            description: l,
            wrapping: n,
            hAlign: r,
            vAlign: s
        };
        e[e.length] = {
            name: o,
            description: l
        }
    };
    return z
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/PropertyEditorExtensionLoader", ["sap/dm/dme/podfoundation/extension/BaseExtensionsLoader", "sap/dm/dme/util/PlantSettings"], function(n, t) {
    "use strict";
    return n.extend("sap.dm.dme.podfoundation.control.PropertyEditorExtensionLoader", {
        constructor: function(t) {
            this._oController = t;
            n.apply(this, arguments)
        },
        findCustomPropertyEditorExtension: function(n) {
            var t = this.getPropertyEditorExtensionsMap();
            var o = this._oController.getName();
            var r = t[o];
            if (!r) {
                return null
            }
            return r[n]
        },
        registerCustomExtensions: function(n) {
            var t = this;
            return new Promise(function(o) {
                var r = t._findControllerExtensions(n);
                if (!r || r.length === 0) {
                    o()
                }
                for (var e = 0; e < r.length; e++) {
                    var i = e;
                    t._getExtensionProvider(r[e].provider).then(function(t) {
                        if (t) {
                            this.loadPluginExtensions(n, t)
                        }
                        if (i === r.length - 1) {
                            o()
                        }
                    }.bind(t))
                }
            })
        },
        _findControllerExtensions: function(n) {
            var o = [];
            var r = this._getPodController();
            if (r) {
                var e = t.getCurrentPlant();
                var i = r.getPodId();
                var l = r.getPluginExtensions();
                if (l && l.length > 0) {
                    for (const t of l) {
                        if (t.controller === n && this._isExtensionToBeIncluded(t, i, e)) {
                            o[o.length] = t
                        }
                    }
                }
            }
            return o
        },
        _getController: function() {
            return this._oController
        },
        _getPodController: function() {
            var n = this._getController();
            var t = null;
            if (n && n.getMainControllerHelper) {
                var o = n.getMainControllerHelper();
                if (o) {
                    t = o.getPodConfigurationHelper()
                }
            }
            return t
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/StatusIconControl", ["sap/m/HBox", "sap/m/FlexJustifyContent", "sap/ui/core/Icon"], function(t, e, o) {
    "use strict";
    var n = t.extend("sap.dm.dme.podfoundation.control.StatusIconControl", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                iconData: {
                    type: "any",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },
        constructor: function(e, o) {
            t.apply(this, arguments)
        },
        renderer: {}
    });
    n.prototype.onBeforeRendering = function() {
        if (t.prototype.onBeforeRendering) {
            t.prototype.onBeforeRendering.apply(this, arguments)
        }
        this.setJustifyContent(e.Center)
    };
    n.prototype.setIconData = function(t) {
        this.setProperty("iconData", t, true);
        var e = this.getItems();
        if (t.iconSources.length === e.length) {
            this._updateIcons(t)
        } else {
            this.removeAllItems();
            this._createIcons()
        }
    };
    n.prototype._createIcons = function() {
        var t = this.getIconData();
        var e = t.imageStyle;
        var o = t.iconSources;
        var n = t.iconTooltips;
        var r = t.iconColors;
        var a = false;
        var i;
        for (var s = 0; s < o.length; s++) {
            if (s > 0) {
                a = true
            }
            i = this._createIcon(e, o[s], n[s], r[s], a);
            this.addItem(i)
        }
    };
    n.prototype._createIcon = function(t, e, n, r, a) {
        var i = new o({
            size: t.imageSize,
            tooltip: n,
            src: e,
            color: r
        });
        i.addStyleClass(t.imageStyle);
        if (a) {
            i.addStyleClass("sapMesTableCellMultipleIconPadding")
        }
        return i
    };
    n.prototype._updateIcons = function(t) {
        var e = t.iconSources;
        var o = t.iconTooltips;
        var n = t.iconColors;
        var r = this.getItems();
        for (var a = 0; a < r.length; a++) {
            r[a].setSrc(e[a]);
            r[a].setTooltip(o[a]);
            r[a].setColor(n[a])
        }
    };
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/TableFactory", ["sap/ui/base/Object", "./MobileTableImpl", "./GridTableImpl", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, t, l, i) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.control.TableFactory", {
        constructor: function(o, a, n) {
            e.call(this);
            var r = o.tableType;
            if (i.isEmpty(r)) {
                r = "mobile"
            }
            if (r.toLowerCase() === "mobile") {
                this.oTableImpl = new t(o, a, n)
            } else {
                this.oTableImpl = new l(o, a, n)
            }
        },
        createTable: function(e, t, l, i) {
            return this.oTableImpl.createTable(e, t, l, i)
        },
        _getTableImpl: function() {
            return this.oTableImpl
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/control/TablePersoService", ["sap/ui/base/Object", "sap/dm/dme/device/CrossPlatformUtilities"], function(e, t) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.control.TablePersoService", {
        constructor: function(t, r) {
            e.call(this);
            var n = r.getColumns(false);
            this._setColumns(t, n)
        },
        _setColumns: function(e, t) {
            if (!t || t.length === 0) {
                return
            }
            var r = [];
            for (var n = 0; n < t.length; n++) {
                var s = t[n].getHeader();
                var i = e + "-" + t[n].getId();
                r[r.length] = {
                    text: s.getText(),
                    order: n,
                    visible: true,
                    id: i
                }
            }
            var o = {
                _persoSchemaVersion: "1.0",
                aColumns: r
            };
            this.setPersData(o)
        },
        getColumnOrderData: function() {
            return this._oBundle
        },
        setColumnOrderData: function(e) {
            this._oBundle = e
        },
        getPersData: function() {
            if (!this._oBundle) {
                return undefined
            }
            var e = new jQuery.Deferred;
            var t = this._oBundle;
            e.resolve(t);
            return e.promise()
        },
        setPersData: function(e) {
            if (!this._oInitialBundle) {
                this._oInitialBundle = t.cloneObject(e)
            }
            var r = new jQuery.Deferred;
            this._oBundle = e;
            r.resolve();
            return r.promise()
        },
        resetPersData: function() {
            var e = new jQuery.Deferred;
            this._oBundle = this._oInitialBundle;
            e.resolve();
            return e.promise()
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/control/VariableTablePropertyEditor", ["sap/m/Input", "sap/m/Label", "sap/m/Select", "sap/m/ListMode", "sap/m/ListType", "sap/ui/core/Item", "sap/dm/dme/podfoundation/control/PropertyEditor", "sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/i18n/i18nBundles"], function(e, t, a, n, r, i, l, o, s) {
    "use strict";
    const d = ["EMPTY", "MATERIAL", "OPERATION", "ORDER", "PLANT", "PROCESS_LOT", "RESOURCE", "ROUTING", "SFC", "WORK_CENTER", "USER_ID"];
    const g = "sapUiSizeCompact sapMesFormTableColumnHeader";
    return l.extend("sap.dm.dme.podfoundation.control.VariableTablePropertyEditor", {
        constructor: function(e, t) {
            l.apply(this, arguments)
        },
        addInputParametersTable: function(e, t, a, n) {
            var r = this.getListConfiguration();
            var i = this.getColumnListData();
            var l = this.getColumnListItemMetadata();
            var o = this.getTableMetadata();
            var s = this.isControlLabelShown();
            var d = {
                id: a,
                bindingPath: n,
                listConfiguration: r,
                listColumnData: i,
                tableMetadata: o,
                columnListItemMetadata: l,
                resourceBundleName: null,
                showControlLabel: s
            };
            return this.addTable(e, d)
        },
        isControlLabelShown: function() {
            return true
        },
        getListConfiguration: function() {
            var e = {
                columns: [{
                    columnId: "PARAMETER",
                    fieldName: "parameter",
                    sequence: 10,
                    sortOrder: null,
                    sortDescending: false
                }, {
                    columnId: "VARIABLE",
                    fieldName: "variable",
                    sequence: 20,
                    sortOrder: null,
                    sortDescending: false
                }, {
                    columnId: "CONSTANT",
                    fieldName: "constant",
                    sequence: 30,
                    sortOrder: null,
                    sortDescending: false
                }]
            };
            return e
        },
        getColumnListData: function() {
            var e = {};
            e["PARAMETER"] = {
                label: s.getPropertyEditorText("variableTable.PARAMETER"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: g,
                columnListItem: this.getParameterControl()
            };
            e["VARIABLE"] = {
                label: s.getPropertyEditorText("variableTable.VARIABLE"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: g,
                columnListItem: this.getVariableSelectControl()
            };
            e["CONSTANT"] = {
                label: s.getPropertyEditorText("variableTable.CONSTANT"),
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle",
                styleClass: g,
                columnListItem: this.getConstantControl()
            };
            return e
        },
        getColumnListItemMetadata: function() {
            return {
                type: r.Inactive,
                vAlign: "Middle"
            }
        },
        getTableMetadata: function() {
            return {
                alternateRowColors: false,
                fixedLayout: true,
                mode: n.None,
                growing: false,
                width: "100%"
            }
        },
        getParameterControl: function() {
            var e = new t({
                text: s.getPropertyEditorText("variableTable.PARAMETER.BINDING"),
                tooltip: s.getPropertyEditorText("variableTable.PARAMETER.TOOLTIP"),
                width: "100%",
                required: "{required}"
            });
            return e
        },
        getVariableSelectControl: function() {
            return new a({
                width: "100%",
                selectedKey: s.getPropertyEditorText("variableTable.VARIABLE.BINDING"),
                items: {
                    path: "variableList",
                    templateShareable: true,
                    template: new i({
                        key: "{keyName}",
                        text: "{textValue}"
                    })
                },
                tooltip: s.getPropertyEditorText("variableTable.VARIABLE.TOOLTIP"),
                change: [this.onVariableChange, this]
            })
        },
        getConstantControl: function() {
            var t = new e({
                value: s.getPropertyEditorText("variableTable.CONSTANT.BINDING"),
                tooltip: "{tooltip}",
                width: s.getPropertyEditorText("variableTable.CONSTANT.WIDTH"),
                maxLength: Number(s.getPropertyEditorText("variableTable.CONSTANT.MAX_LENGTH")),
                enabled: "{constantEnabled}",
                change: [this.onConstantChange, this]
            });
            return t
        },
        getVariableListOptions: function() {
            var e = [];
            for (var t = 0; t < d.length; t++) {
                e[e.length] = {
                    keyName: d[t],
                    textValue: s.getPropertyEditorText("variableTable." + d[t])
                }
            }
            return e
        },
        onVariableChange: function(e) {
            var t = e.getParameter("selectedItem");
            var a = t.getBindingContext().getObject();
            var n = t.getParent();
            var r = n.getBindingContext().getObject();
            this.handleVariableSelectChange(a, r)
        },
        handleVariableSelectChange: function(e, t) {},
        onConstantChange: function(e) {
            var t = e.getSource();
            var a = t.getBindingContext().getObject();
            var n = o.cloneObject(a);
            this.handleConstantChange(e, t, n)
        },
        handleConstantChange: function(e, t, a) {}
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/control/ViewSettingsDialogFactory", ["sap/ui/base/Object", "sap/m/ViewSettingsDialog", "sap/m/ViewSettingsItem", "sap/ui/model/Sorter", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, i, n, s) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.control.ViewSettingsDialogFactory", {
        constructor: function(e, i, n, s) {
            t.call(this);
            this._oTable = e;
            this._oListConfiguration = i;
            this._oResourceBundle = n;
            this._oGroupSorter = s;
            this._iLastSelectedIndex = -1;
            this._sSortPath = "";
            this._bDescending = false
        },
        getViewSettings: function() {
            let t = {
                lastSelectedIndex: this._iLastSelectedIndex,
                lastSortPath: this._sSortPath,
                lastSortDescending: this._bDescending
            };
            return t
        },
        setViewSettings: function(t) {
            this._iLastSelectedIndex = -1;
            this._sSortPath = "";
            this._bDescending = false;
            if (t) {
                this._iLastSelectedIndex = t.lastSelectedIndex;
                if (t.lastSortPath) {
                    this._sSortPath = t.lastSortPath
                }
                if (t.lastSortDescending) {
                    this._bDescending = t.lastSortDescending
                }
            }
        },
        updateTable: function() {
            if (this._sSortPath && this._sSortPath !== "") {
                this._updateTable(this._sSortPath, this._bDescending)
            }
        },
        createDialog: function() {
            if (!this._oListConfiguration || !this._oListConfiguration.columns || this._oListConfiguration.columns.length === 0) {
                return undefined
            }
            let t = this._oListConfiguration.columns;
            this._oViewSettingsDialog = new e({
                sortDescending: this._bDescending,
                confirm: [this._handleConfirm, this]
            });
            if (this._iLastSelectedIndex < 0) {
                this._iLastSelectedIndex = this._getLastSelectedIndex(t)
            }
            this._addSortItems(this._oViewSettingsDialog, t);
            return this._oViewSettingsDialog
        },
        _getLastSelectedIndex: function(t) {
            let e = -1;
            let i = 9999999;
            for (let n = 0; n < t.length; n++) {
                if (t[n].sortOrder && t[n].sortOrder > 0) {
                    if (t[n].sortOrder < i) {
                        e = n;
                        i = t[n].sortOrder
                    }
                }
            }
            return e
        },
        _addSortItems: function(t, e) {
            let n, s, o;
            for (let r = 0; r < e.length; r++) {
                let l = e[r];
                n = l.columnId;
                if (l.showSort === false) {
                    continue
                }
                if (n.indexOf(".") > 0) {
                    continue
                }
                s = false;
                if (r === this._iLastSelectedIndex) {
                    s = true
                }
                o = new i({
                    text: this._getColumnLabel(l),
                    key: this._getColumnBindingKey(l),
                    selected: s
                });
                t.addSortItem(o)
            }
        },
        _handleConfirm: function(t) {
            if (!this._oTable) {
                return
            }
            let e = t.getParameters();
            this._sSortPath = e.sortItem.getKey();
            this._bDescending = e.sortDescending;
            this._updateTable(this._sSortPath, this._bDescending);
            this._updateLastSelectedIndex(this._sSortPath)
        },
        _updateTable: function(t, e) {
            if (!this._oTable) {
                return
            }
            let i = this._oTable.getBinding("items");
            if (!i) {
                return
            }
            if (this._oTable.getId().indexOf("operationListPlugin") >= 0) {
                if (t === "operationStepId") {
                    t = "stepId"
                }
            }
            let s = [];
            if (this._oGroupSorter) {
                let t = this._oGroupSorter.fnGroup;
                let e = this._oGroupSorter.sPath;
                let i = new n(e, false, t);
                s.push(i)
            }
            let o = new n(t, e);
            s.push(o);
            i.sort(s)
        },
        _updateLastSelectedIndex: function(t) {
            let e = this._oListConfiguration.columns;
            for (let i = 0; i < e.length; i++) {
                let n = this._getColumnBindingKey(e[i]);
                if (t === n) {
                    this._iLastSelectedIndex = i;
                    break
                }
            }
        },
        _getColumnLabel: function(t) {
            if (s.isNotEmpty(t.label)) {
                return t.label
            }
            let e = t.columnId;
            if (!this._oResourceBundle) {
                return e
            }
            let i = this._oResourceBundle.getText(e + ".LABEL");
            if (!i || i === "") {
                return e
            }
            return i
        },
        _getColumnBindingKey: function(t) {
            if (s.isNotEmpty(t.binding)) {
                return t.binding
            }
            let e = t.columnId;
            if (!this._oResourceBundle) {
                return e
            }
            let i = this._oResourceBundle.getText(e + ".BINDING");
            if (!i || i === "") {
                return e
            }
            return i.substring(1, i.length - 1)
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ActionAssignmentViewController", ["sap/m/MessageBox", "sap/ui/core/syncStyleClass", "sap/ui/core/ValueState", "sap/ui/model/json/JSONModel", "sap/dm/dme/podfoundation/controller/BaseActionAssignmentController", "sap/dm/dme/podfoundation/controller/SinglePluginSelectionViewController", "sap/dm/dme/podfoundation/controller/ProductionProcessSelectionViewController", "sap/dm/dme/podfoundation/service/ServiceRegistry", "sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, t, i, n, o, l, s, r, a, c) {
    "use strict";
    const d = "EXECUTION_PLUGIN";
    const u = "VIEW_PLUGIN";
    const g = "EVENT_PLUGIN";
    const p = "TRANSACTION_PLUGIN";
    const f = "PRODUCTION_PROCESS_PLUGIN";
    const h = "PLUGIN";
    const y = "EVENT";
    const P = "TRANSACTION";
    const D = "PRODUCTION_PROCESS";
    const m = ".sapUiSizeCompact";
    let C = o.extend("sap.dm.dme.podfoundation.controller.ActionAssignmentViewController", {
        beforeOpen: function(e) {
            this._initializeDialogControlIds();
            this._initializeEventTypes();
            this._initializeAvailableActions();
            let t = this.getAssignedTable();
            let i = t.getColumns();
            i[i.length - 2].setVisible(this.getShowPopupPropertiesColumn())
        },
        afterOpen: function(e) {
            this.loadActionsTable()
        },
        _initializeDialogControlIds: function() {
            let e = this.getActionAssignmentDialog();
            let t = this._findDynamicSideContent(e);
            if (t) {
                this.setSideContentControlId(t.getId());
                let e = this._findAssignedTable(t);
                if (e) {
                    this.setAssignedTableId(e.getId())
                }
                let i = this._findSidePanelForm(t);
                if (i) {
                    this.setSidePanelFormId(i.getId())
                }
            }
        },
        _findDynamicSideContent: function(e) {
            return e.getContent()[0]
        },
        _findSidePanelForm: function(e) {
            let t = e.getSideContent()[0];
            let i = t.getItems()[0];
            return i.getContent()[0]
        },
        _findAssignedTable: function(e) {
            let t = e.getMainContent()[0];
            let i = t.getItems()[0];
            let n = i.getContent();
            if (n[0].getVisible()) {
                return n[0].getItems()[0]
            }
            return n[1].getItems()[0]
        },
        _initializeEventTypes: function() {
            let e = this._oMainControllerHelper.getPluginSubscribedEvents();
            e.sort((e, t) => e.title.localeCompare(t.title));
            let t = this.getDialogModel();
            let i = t.getData();
            i.EventTypes = e
        },
        _initializeAvailableActions: function() {
            let e = this.getDialogModel();
            let t = e.getData();
            let i = t.AvailableActions;
            this._aAvailableActions = a.cloneObject(i);
            i.forEach(function(e) {
                e.Rank = this.config.initialRank;
                e.sequence = 0;
                e.clearsInput = false;
                e.action = e.plugin;
                e.typeDefinition = e.action;
                if (e.type === d || e.type === u) {
                    e.actionType = this.getI18nText("actionType.enum.plugin");
                    e.actionTypeKey = h;
                    e.typeDefinitionTitle = e.title
                }
                if (e.type === g) {
                    e.actionType = this.getI18nText("actionType.enum.event");
                    e.actionTypeKey = y;
                    e.typeDefinitionTitle = e.typeDefinitionValue
                }
                if (e.type === p) {
                    e.actionType = this.getI18nText("actionType.enum.transaction");
                    e.actionTypeKey = P;
                    e.typeDefinitionTitle = e.typeDefinitionValue
                }
                if (e.type === f) {
                    e.actionType = this.getI18nText("actionType.enum.productionprocess");
                    e.actionTypeKey = D;
                    e.typeDefinitionTitle = e.typeDefinitionValue
                }
            }, this)
        },
        setSideContentControlId: function(e) {
            this._sSideContentControlId = e
        },
        getSideContentControlId: function() {
            return this._sSideContentControlId
        },
        setSidePanelFormId: function(e) {
            this._sSidePanelFormId = e
        },
        getSidePanelFormId: function() {
            return this._sSidePanelFormId
        },
        setAddActionDialog: function(e) {
            this._oAddActionDialog = e
        },
        getAddActionDialog: function() {
            return this._oAddActionDialog
        },
        onAddAction: function(e) {
            if (!this._addActionDialog) {
                let e = this._oMainController.getView();
                this._addActionDialog = this._getAddActionDialog(this, e);
                let t = this;
                this._addActionDialog.setEscapeHandler(function(e) {
                    t.onAddActionCancel();
                    e.resolve()
                })
            }
            let t = this.getDialogModel();
            let i = t.getData();
            let o = false;
            if (i.buttonType === "MENU_BUTTON") {
                o = true
            }
            let l = {
                multiInstanceConfigurable: true,
                showMultiInstanceSwitch: false,
                showMenuLabel: o,
                menuLabel: "",
                actionType: h,
                typeDefinition: "",
                typeDefinitionTitle: ""
            };
            let s = new n(l);
            this._addActionDialog.setModel(s, "AddActionData");
            let r = new n(i.EventTypes);
            this._addActionDialog.setModel(r, "EventTypes");
            let a = new n(i.I18nButtonLabels);
            this._addActionDialog.setModel(a, "I18nButtonLabels");
            let c = [{
                name: this.getI18nText("actionType.enum.plugin"),
                actionType: h
            }, {
                name: this.getI18nText("actionType.enum.productionprocess"),
                actionType: D
            }, {
                name: this.getI18nText("actionType.enum.transaction"),
                actionType: P
            }];
            if (i.EventTypes && i.EventTypes.length > 0) {
                c[c.length] = {
                    name: this.getI18nText("actionType.enum.event"),
                    actionType: y
                }
            }
            let d = new n(c);
            this._addActionDialog.setModel(d, "ActionTypes");
            this.setAddActionDialog(this._addActionDialog);
            this._addActionDialog.open()
        },
        _getAddActionDialog: function(e, i) {
            let n = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.AddActionDialog", e);
            i.addDependent(n);
            t("sapUiSizeCompact", i, n);
            return n
        },
        onMenuLabelChange: function(e) {
            let t = this._getInputDataFromEvent(e);
            if (t.actionObject) {
                t.actionObject.menuLabel = t.value
            }
        },
        onTypeDefinitionTitleChange: function(e) {
            let t = this._getInputDataFromEvent(e);
            if (t.propertyEditor) {
                t.propertyEditor.setTypeDefinition(t.value);
                this._refreshFormContainer(t.propertyEditor)
            }
        },
        _getInputDataFromEvent: function(e) {
            let t = e.getSource();
            let i = null;
            if (t.getValue) {
                i = t.getValue()
            }
            let n = t.data("actionId");
            let o = n;
            if (n.indexOf(".") > 0) {
                o = n.substring(0, n.indexOf("."))
            }
            let l = this.findAction(o);
            let s = false;
            if (l && !l.showConfiguration && !l.multiInstance && l.type === u) {
                s = true
            }
            let r = this._findPropertyEditor(n, s);
            return {
                value: i,
                propertyEditor: r,
                actionObject: l
            }
        },
        onActionTypeChange: function(e) {
            let t = e.getSource();
            let i = t.getSelectedKey();
            let n = this.getAddActionDialog().getModel("AddActionData");
            let o = n.getData();
            o.actionType = i;
            o.typeDefinition = "";
            o.typeDefinitionTitle = "";
            o.typeDefinitionEventKey = "";
            if (i === "EVENT") {
                let e = this.getAddActionDialog().getModel("EventTypes");
                let t = e.getData();
                if (t && t.length > 0) {
                    o.typeDefinitionEventKey = t[0].event;
                    o.typeDefinitionTitle = t[0].title;
                    o.menuLabel = t[0].title
                }
            }
            n.refresh();
            this.getAddActionDialog().invalidate()
        },
        onPluginTypeDefinitionBrowse: function(e) {
            if (!this._oValueHelpSingleSelectPluginDialog) {
                let e = this._oMainController.getView();
                this._singlePluginSelectionDialogController = new l;
                this._oValueHelpSingleSelectPluginDialog = this._getPluginTypeDefinitionBrowseDialog(this._singlePluginSelectionDialogController, e);
                this._oValueHelpSingleSelectPluginDialog.attachConfirm(this.onPluginItemSelected, this);
                this._oValueHelpSingleSelectPluginDialog.attachCancel(this.handleSinglePluginSelectionDialogClose, this)
            }
            let t = this.getDialogModel();
            let i = t.getData();
            let o = this._getAvailablePlugins(i.AvailableActions);
            let s = new n;
            s.setData(o);
            this._oValueHelpSingleSelectPluginDialog.setModel(s);
            this._oValueHelpSingleSelectPluginDialog.open()
        },
        _getPluginTypeDefinitionBrowseDialog: function(e, i) {
            let n = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.SinglePluginSelectionDialog", e);
            i.addDependent(n);
            t("sapUiSizeCompact", i, n);
            return n
        },
        onPluginItemSelected: function(e) {
            let t = e.getParameter("selectedItem");
            let i = t.data("pluginId");
            let n = t.data("title");
            let o = this.findAction(i);
            let l = this.getAddActionDialog().getModel("AddActionData");
            let s = l.getData();
            s.showMultiInstanceSwitch = o.multiInstance;
            s.multiInstanceConfigurable = false;
            if (o.popupsOnly && o.multiInstance) {
                s.showMultiInstanceSwitch = false;
                s.multiInstanceConfigurable = true
            }
            s.typeDefinition = i;
            s.typeDefinitionTitle = n;
            s.menuLabel = n;
            l.refresh();
            this.handleSinglePluginSelectionDialogClose()
        },
        onProductionProcessItemSelected: function(e) {
            let t = e.getParameter("selectedItem");
            let i = t.getBindingContext().getObject();
            let n = this.getAddActionDialog().getModel("AddActionData");
            let o = n.getData();
            o.typeDefinition = i.name;
            o.typeDefinitionTitle = i.name;
            o.typeData = i;
            o.menuLabel = i.displayName;
            n.refresh();
            this.handleProductionProcessDialogClose()
        },
        handleSinglePluginSelectionDialogClose: function() {
            this._oValueHelpSingleSelectPluginDialog.destroy();
            this._oValueHelpSingleSelectPluginDialog = null
        },
        handleProductionProcessDialogClose: function() {
            this._oValueHelpProductionProcessDialog.destroy();
            this._oValueHelpProductionProcessDialog = null
        },
        getServiceRegistryDataSourceUri: function() {
            return this._oMainController.getOwnerComponent().getDataSourceUriByName("serviceregistry-RestSource")
        },
        _getServiceRegistry: function(e) {
            if (!this._oServiceRegistry) {
                this._oServiceRegistry = new r(e)
            }
            return this._oServiceRegistry
        },
        _getServiceRegistryGroupData: function() {
            let e = this;
            return new Promise(function(t) {
                let i = e._getServiceRegistry(e.getServiceRegistryDataSourceUri());
                return i.getProductionProcesses().then(function(i) {
                    let o = new n;
                    o.setData(i);
                    e._oValueHelpProductionProcessDialog.setModel(o);
                    e._oValueHelpProductionProcessDialog.open();
                    e._oAddActionDialog.setBusy(false);
                    t()
                }.bind(e)).catch(function() {
                    let i = new n;
                    i.setData({});
                    e._oValueHelpProductionProcessDialog.setModel(i);
                    e._oValueHelpProductionProcessDialog.open();
                    e._oAddActionDialog.setBusy(false);
                    t()
                }.bind(e))
            })
        },
        onProductionProcessTypeDefinitionBrowse: function(e) {
            if (!this._oValueHelpProductionProcessDialog) {
                let e = this._oMainController.getView();
                this._productionProcessDialogController = new s;
                this._oValueHelpProductionProcessDialog = this._getTypeDefinitionProductionProcessBrowseDialog(this._productionProcessDialogController, e);
                this._oValueHelpProductionProcessDialog.attachConfirm(this.onProductionProcessItemSelected, this);
                this._oValueHelpProductionProcessDialog.attachCancel(this.handleProductionProcessDialogClose, this)
            }
            this._oAddActionDialog.setBusy(true);
            let t = this;
            setTimeout(function() {
                t._getServiceRegistryGroupData()
            }, 125)
        },
        _getTypeDefinitionProductionProcessBrowseDialog: function(e, i) {
            let n = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ProductionProcessSelectionDialog", e);
            i.addDependent(n);
            t("sapUiSizeCompact", i, n);
            return n
        },
        onEventTypeDefinitionChange: function(e) {
            let t = e.getSource();
            let i = t.getSelectedKey();
            let n = this.getAddActionDialog().getModel("AddActionData");
            let o = n.getData();
            let l = this.getAddActionDialog().getModel("EventTypes");
            let s = l.getData();
            if (s && s.length > 0) {
                for (let e of s) {
                    if (e.event === i) {
                        o.typeDefinitionEventKey = i;
                        o.typeDefinitionTitle = e.title;
                        o.menuLabel = e.title;
                        n.refresh();
                        break
                    }
                }
            }
        },
        onTransactionTypeDefinitionChange: function(e) {},
        _getAvailablePlugins: function(e) {
            let t = {
                Plugins: []
            };
            let i = a.cloneObject(e);
            i.forEach(function(e) {
                if (e.type === d || e.type === u) {
                    if (e.type === u && e.multiInstance) {
                        e.Rank = 0
                    }
                    t.Plugins[t.Plugins.length] = e
                }
            }, this);
            return t
        },
        onAddActionCreate: function(e) {
            let t = this.getAddActionDialog().getModel("AddActionData");
            let n = t.getData();
            let o;
            if (c.isEmpty(n.typeDefinitionTitle)) {
                if (n.actionType === h) {
                    o = this._byId("pluginTypeDefinitionInput")
                } else if (n.actionType === D) {
                    o = this._byId("productionProcessTypeDefinitionInput")
                } else if (n.actionType === P) {
                    o = this._byId("transactionTypeDefinitionInput")
                } else if (n.actionType === y) {
                    o = this._byId("eventTypeDefinitionInput")
                }
                if (o) {
                    o.setValueState(i.Error);
                    o.setValueStateText(this.getI18nText("addActionTypeDefinitionRequired"))
                }
                return
            }
            if (n.actionType === P) {
                n.typeDefinition = this._aTransactionPropertyEditors[0].getId();
                n.multiInstanceConfigurable = true
            } else if (n.actionType === y) {
                n.typeDefinition = this._aEventPropertyEditors[0].getId();
                n.multiInstanceConfigurable = true
            } else if (n.actionType === D) {
                n.typeDefinition = this._aProductionProcessPropertyEditors[0].getId();
                n.multiInstanceConfigurable = true
            }
            this.onAddActionCancel(e);
            let l = this;
            setTimeout(function() {
                l.addAction(n)
            }, 0)
        },
        onAddActionCancel: function(e) {
            this.getAddActionDialog().close();
            this._addActionDialog.destroy();
            this._addActionDialog = null
        },
        onRemoveAction: function(e) {
            let t = e.getSource();
            let i = "";
            if (t) {
                i = t.data("actionId")
            }
            this.promptToRemovePlugin(i)
        },
        promptToRemovePlugin: function(t) {
            let i = this.getSelectedRowInformation(t);
            if (!i) {
                return
            }
            let n = true;
            if (typeof i.data.showConfiguration === "undefined" || !i.data.showConfiguration) {
                this.removeFromAssigned(t, i);
                return
            }
            let o = this._oMainControllerHelper.getWherePluginReferenced(t);
            let l = "confirmRemovePluginPrompt";
            if (o && o.length > 1) {
                l = "confirmRemovePluginAndReferencesPrompt"
            }
            let s = this;
            let r = this._isViewCompactSize();
            e.confirm(this.getI18nText(l), {
                title: this.getI18nText("confirmRemovePluginTitle"),
                actions: [e.Action.OK, e.Action.CANCEL],
                styleClass: r ? "sapUiSizeCompact" : "",
                onClose: function(n) {
                    if (n === e.Action.OK) {
                        s.removeFromAssigned(t, i)
                    }
                }
            })
        },
        _isViewCompactSize: function() {
            let e = this._oMainController.getView();
            return !!e.$().closest(m).length
        },
        onRemoveFromAssigned: function(e) {
            if (!e) {
                return
            }
            if (typeof e.showConfiguration === "undefined" || !e.showConfiguration) {
                return
            }
            let t = e.action;
            let i = [];
            this._oMainControllerHelper.loadNestedRegisteredActions(t, i, null);
            let n = this._findPropertyEditor(t, false);
            if (n) {
                let e = this._getPluginData(t);
                this.setPopupEnabled(e, false)
            }
            let o = this._oMainControllerHelper.getWherePluginReferenced(t);
            if (o && o.length === 1) {
                this._oMainControllerHelper.removeAssignedPluginPropertyEditor(t)
            }
            this._oMainControllerHelper.removeAndUnregisterNestedPlugins(i)
        },
        onMoveToAssigned: function(e) {
            if (!e) {
                return
            }
            let t = e.action;
            let i = e.type;
            let n = this._createUniqueInstanceId(e);
            let o = e.showConfiguration;
            if (e.multiInstance && e.type === "VIEW_PLUGIN") {
                if (!e.multiInstanceConfigurable) {
                    o = false;
                    e.showConfiguration = false
                } else {
                    e.viewPluginNotAssigned = false
                }
            }
            let l = this._findOrCreatePropertyEditor(t, n, i);
            if (l) {
                e.id = n;
                e.action = n;
                e.plugin = n;
                if (l.setTypeDefinition) {
                    if (e.type === "EVENT_PLUGIN") {
                        l.setTypeDefinition(e.typeDefinitionEventKey);
                        if (l.setTypeDefinitionTitle) {
                            l.setTypeDefinitionTitle(e.typeDefinitionTitle)
                        }
                    } else {
                        l.setTypeDefinition(e.typeDefinitionTitle)
                    }
                }
                if (l.setServiceRegistryName) {
                    l.setServiceRegistryName(e.typeDefinitionTitle)
                }
                if (l.setServiceRegistryData) {
                    l.setServiceRegistryData(e.typeData)
                }
                if (l.initializeProperties) {
                    l.initializeProperties()
                }
                let t = false;
                if (l.hasConfigurationProperties && o) {
                    e.showConfiguration = l.hasConfigurationProperties();
                    if (e.showConfiguration && i === u) {
                        l.setShowPopupProperties(this.bShowPopupProperties);
                        let e = l.getPropertyData();
                        let i = l.getPopupPropertyData();
                        if (c.isNotEmpty(i.popup)) {
                            t = true
                        }
                    }
                }
                this.setPopupEnabled(l, t)
            }
        },
        updateActionData: function(e) {
            if (!e) {
                return
            }
            let t = this._oMainControllerHelper.findAssignedPluginPropertyEditor(e.action);
            if (t) {
                if (t.getTypeDefinition) {
                    if (e.type === "EVENT_PLUGIN") {
                        let i = t.getTypeDefinition();
                        e.typeDefinitionEventKey = i;
                        e.typeDefinitionTitle = this._getEventTypeDefinitionTitle(i)
                    } else {
                        e.typeDefinitionTitle = t.getTypeDefinition()
                    }
                }
                if (t.getServiceRegistryName) {
                    e.typeDefinitionTitle = t.getServiceRegistryName()
                }
                if (t.getServiceRegistryData) {
                    e.typeData = t.getServiceRegistryData()
                }
                if (t.hasConfigurationProperties && e.showConfiguration) {
                    e.showConfiguration = t.hasConfigurationProperties()
                }
            }
        },
        _getEventTypeDefinitionTitle: function(e) {
            let t = this.getDialogModel();
            let i = t.getData();
            for (let t of i.EventTypes) {
                if (t.event === e) {
                    return t.title
                }
            }
            return e
        },
        _saveTransactionParameters: function() {
            let e = sap.ui.getCore().byId("inputParameterTable");
            if (e && this.oLastTransactionPropetyEditor && this.oLastTransactionPropetyEditor.setInputParams) {
                let t = e.getModel("oTableModel");
                this.oLastTransactionPropetyEditor.setInputParams(e, t, t.getData().parameters)
            }
        },
        _createUniqueInstanceId: function(e) {
            let t = e.action;
            let i = t;
            let n = true;
            if (typeof e.multiInstanceConfigurable !== "undefined") {
                n = e.multiInstanceConfigurable
            }
            if (e.multiInstance && n) {
                let e = this._oMainControllerHelper.getPluginInstanceCount(t);
                e++;
                i = t + "." + this._createUniqueId(e)
            }
            return i
        },
        _createUniqueId: function(e) {
            if (this._oMainControllerHelper.isRunningOpa5Test()) {
                return e
            }
            let t = Math.random().toString(36).toUpperCase();
            return t.substr(2, 8)
        },
        setCloseHandler: function(e) {
            this._oCloseHandler = e
        },
        onDialogOk: function(e) {
            this._saveTransactionParameters();
            this._oCloseHandler.onDialogClose(e)
        },
        setShowPopupProperties: function(e) {
            this.bShowPopupProperties = e
        },
        getShowPopupPropertiesColumn: function() {
            if (typeof this.bShowPopupProperties === "undefined") {
                this.bShowPopupProperties = true
            }
            return this.bShowPopupProperties
        },
        _setPluginShowPopupPropertiesOff: function(e, t, i) {
            let n = this._getContextByIndex(i, t);
            let o = n.getObject();
            let l = o.plugin;
            let s;
            if (c.isNotEmpty(l)) {
                s = this._oMainControllerHelper.findAssignedPluginPropertyEditor(l);
                if (s) {
                    s.setShowPopupProperties(this.bShowPopupProperties)
                }
            }
        },
        onShowConfiguration: function(e) {
            let t = this._byId(this.getSideContentControlId());
            if (t.getShowSideContent()) {
                this._saveTransactionParameters();
                this._clearFormContainer()
            }
            this._selectRow(e);
            let i = this._getInputDataFromEvent(e);
            let n = i.propertyEditor;
            if (!n && i.actionObject && i.actionObject.action) {
                n = this._findOrCreatePropertyEditor(i.actionObject.action, i.actionObject.action)
            }
            if (n) {
                if (n.getEqualSplit) {
                    t.setEqualSplit(n.getEqualSplit())
                } else if (t.getEqualSplit()) {
                    t.setEqualSplit(false)
                }
                let e = this._byId(this.getSidePanelFormId());
                let o = this.bShowPopupProperties;
                if (i.actionObject && i.actionObject.type !== "VIEW_PLUGIN") {
                    o = false
                }
                n.setShowPopupProperties(o);
                n.setMainController(this._oMainController);
                n.setActionSelections(this._aActionSelections);
                n.setAvailableActions(this._aAvailableActions);
                n.setExecutionPropertyEditors(this._aPropertyEditors);
                n.setEventPropertyEditors(this._aEventPropertyEditors);
                n.setTransactionPropertyEditors(this._aTransactionPropertyEditors);
                n.setProductionProcessPropertyEditors(this._aProductionProcessPropertyEditors);
                n.setTabPageSelections(this._aTabPageSelections);
                n.setNavigationPageSelections(this._aNavigationPageSelections);
                n.addPropertyEditorContent(e);
                let l = n.getControlType();
                if (l === u) {
                    n.setPopupPropertyEditorController(this);
                    n.addPopupPropertyEditorContent(e)
                }
            }
            this.oLastTransactionPropetyEditor = i.propertyEditor;
            this.oCurrentPropertyEditor = n;
            t.setShowSideContent(true)
        },
        _selectRow: function(e) {
            let t = e.getSource();
            if (t) {
                let e = t.data("actionId");
                this.selectRowForAssigned(e)
            }
        },
        _findPropertyEditor: function(e, t) {
            return this._oMainControllerHelper.findAssignedPluginPropertyEditor(e, t)
        },
        _findOrCreatePropertyEditor: function(e, t, i) {
            let n = false;
            if (c.isNotEmpty(t) && t.indexOf(".") > 0) {
                n = true
            }
            let o = this._oMainControllerHelper.findAssignedPluginPropertyEditor(t, false);
            if (!o && n) {
                o = this._oMainControllerHelper.findAssignedPluginPropertyEditor(t, true)
            }
            if (!o) {
                o = this._oMainControllerHelper.createPluginPropertyEditor(e, t);
                if (o && c.isNotEmpty(i) && (i === p || i === g || i === f)) {
                    this._oMainControllerHelper.incrementPluginInstanceCount(i)
                }
            }
            return o
        },
        _getPluginData: function(e) {
            let t = this.getAssignedTable();
            let i = t.getBinding("items");
            for (let t = 0; t < i.aIndices.length; t++) {
                let n = i.oList[i.aIndices[t]];
                if (n.plugin === e) {
                    return {
                        pluginId: n.plugin,
                        sequence: n.sequence,
                        clearsInput: n.clearsInput,
                        menuLabel: n.menuLabel
                    }
                }
            }
            return null
        },
        setPopupEnabled: function(e, t) {
            if (!e) {
                return
            }
            let i = {
                pluginId: e.pluginId
            };
            if (c.isEmpty(e.pluginId) && e.getId()) {
                i.pluginId = e.getId()
            }
            if (t) {
                this._oMainControllerHelper.addPopupPluginAssignment(i)
            } else {
                this._oMainControllerHelper.removePopupPluginAssignment(i)
            }
        },
        onCloseConfiguration: function(e) {
            this._saveTransactionParameters();
            this._clearFormContainer();
            let t = this._byId(this.getSideContentControlId());
            t.setShowSideContent(false)
        },
        refreshFormContainer: function() {
            let e = this._byId(this.getSideContentControlId());
            if (e.getShowSideContent() && this.oCurrentPropertyEditor) {
                let e = this._byId(this.getSidePanelFormId());
                e.invalidate()
            }
        },
        _refreshFormContainer: function(e) {
            let t = this._byId(this.getSideContentControlId());
            if (t.getShowSideContent()) {
                this._clearFormContainer()
            }
            let i = this._byId(this.getSidePanelFormId());
            e.setShowPopupProperties(this.bShowPopupProperties);
            e.addPropertyEditorContent(i);
            let n = e.getControlType();
            if (n === u) {
                e.setPopupPropertyEditorController(this);
                e.addPopupPropertyEditorContent(i)
            }
            t.setShowSideContent(true)
        },
        _clearFormContainer: function() {
            let e = this._byId(this.getSidePanelFormId());
            if (e) {
                e.destroyContent()
            }
        }
    });
    return C
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/AddRemoveButtonController", ["sap/ui/core/mvc/Controller", "sap/ui/core/ValueState", "sap/base/util/uid", "sap/ui/model/json/JSONModel", "sap/dm/dme/podfoundation/control/ActionAssignmentHelper", "sap/dm/dme/podfoundation/control/IconSelectHelper", "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, o, n, i, a, r, s) {
    "use strict";
    var u = t.extend("sap.dm.dme.podfoundation.controller.AddRemoveButtonController", {
        beforeOpen: function(t) {
            this._oSmartListControl = t;
            if (this._oPropertyEditor) {
                this.updateTableModel(true);
                var e = this._oPropertyEditor.getMainController();
                var o = e.getView();
                this._loadPagesIntoViewModel(o);
                this._updateToolbarButtonStates()
            }
        },
        updateTableModel: function(t) {
            var e = null;
            if (t) {
                e = new n
            } else {
                e = this._oSmartListControl.getModel("ButtonsControl")
            }
            if (!this._oDefaultData) {
                this._oDefaultData = {}
            }
            if (!this._oDefaultData[this._sDataName]) {
                this._oDefaultData[this._sDataName] = []
            }
            e.setData(this._oDefaultData);
            if (t) {
                this._oSmartListControl.setModel(e, "ButtonsControl")
            } else {
                e.refresh()
            }
        },
        _loadPagesIntoViewModel: function(t) {
            var e = this._oPropertyEditor.getMainController();
            var o = e.getMainControllerHelper();
            var i = o.getPages();
            if (!i) {
                i = []
            } else if (i.length > 0) {
                for (var a = 0; a < i.length; a++) {
                    i[a].pageName = this._getPageDescriptionText(i[a].description)
                }
            }
            i.unshift({
                page: "",
                pageName: ""
            });
            var r = new n;
            r.setData(i);
            t.setModel(r, "Pages")
        },
        setPropertyEditor: function(t) {
            this._oPropertyEditor = t
        },
        setDataName: function(t) {
            this._sDataName = t
        },
        setDefaultData: function(t) {
            this._oDefaultData = t
        },
        _updateToolbarButtonStates: function() {
            var t = this._getAddButton();
            t.setEnabled(false);
            var e = this._getDeleteButton();
            e.setEnabled(false);
            var o = this._oSmartListControl.getModel("ButtonsControl");
            var n = o.getData();
            var i = n[this._sDataName].length;
            if (i <= 3) {
                if (i < 3) {
                    t.setEnabled(true)
                }
                if (i > 0) {
                    e.setEnabled(true)
                }
            }
        },
        onAddButtonPress: function(t) {
            var e = this._oSmartListControl.getModel("ButtonsControl");
            var n = e.getData();
            var i = this._getLocalizedText("defaultButtonName");
            var a = n[this._sDataName].length;
            n[this._sDataName][a] = {
                buttonName: i,
                buttonType: "ACTION_BUTTON",
                buttonIcon: "",
                buttonTooltip: "",
                buttonUid: o()
            };
            e.refresh();
            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(a, this._sDataName)
            }
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType("ACTION_BUTTON", this._sDataName)
            }
            this._updateToolbarButtonStates()
        },
        onDeleteButtonPress: function(t) {
            var e = this._oSmartListControl.getModel("ButtonsControl");
            var o = e.getData();
            if (o[this._sDataName].length > 0) {
                var n = [];
                var i = [];
                for (var a = 0; a < o[this._sDataName].length; a++) {
                    if (!o[this._sDataName][a].selected) {
                        n[n.length] = o[this._sDataName][a]
                    } else if (o[this._sDataName][a].actions) {
                        i[i.length] = o[this._sDataName][a]
                    }
                }
                var r = s.getPluginsFromButtons(n);
                var u = s.getPluginsFromButtons(i);
                o[this._sDataName] = n;
                e.setData(o);
                e.refresh();
                var l = s.getStringsToRemove(r, u);
                if (l && l.length > 0) {
                    this._removePlugins(l)
                }
            }
            this._updateToolbarButtonStates()
        },
        _removePlugins: function(t) {
            if (!t || t.length === 0) {
                return
            }
            var e = this._oPropertyEditor.getMainController();
            var o = e.getMainControllerHelper();
            var n = [];
            var i = {
                pluginId: null
            };
            for (let e of t) {
                o.loadNestedRegisteredActions(e, n, null);
                var a = o.getWherePluginReferenced(e);
                if (a && a.length === 1) {
                    i.pluginId = e;
                    o.removePopupPluginAssignment(i);
                    o.removeAssignedPluginPropertyEditor(e)
                }
            }
            var r = this._oPropertyEditor.getId();
            var s = this._sDataName;
            if (s === "dialogFooterButtons") {
                s = "footerButtons"
            }
            o.removeAndUnregisterNestedPlugins(n, t, r, s)
        },
        onButtonNameSuggest: function(t) {
            var e = t.getParameter("suggestValue");
            var o = t.getSource();
            this._onButtonSuggest(o, e, "NAME_FIELD")
        },
        onButtonTooltipSuggest: function(t) {
            var e = t.getParameter("suggestValue");
            var o = t.getSource();
            this._onButtonSuggest(o, e, "TOOLTIP_FIELD")
        },
        _onButtonSuggest: function(t, e, o) {
            var n = t.data("buttonUid");
            var i = this._getButtonDefinition(n);
            if (!i) {
                return
            }
            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(i.index, this._sDataName)
            }
            var a = i.data.buttonType;
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType(a, this._sDataName)
            }
            this._loadSuggestionsModel(t, o, a);
            t.setFilterFunction(function(t, e) {
                return e.getText().match(new RegExp(t, "i"))
            })
        },
        _loadSuggestionsModel: function(t, e, o) {
            var i = t.getModel();
            var a = null;
            if (i) {
                a = i.getData()
            }
            var r = false;
            if (!this._sLastButtonType || this._sLastButtonType !== o) {
                r = true
            }
            this._sLastButtonType = o;
            var s = null;
            if (e === "NAME_FIELD" && (r || !a || !a.I18nButtonLabels)) {
                s = this._oPropertyEditor.getButtonLabelList(this._sDataName)
            } else if (e === "TOOLTIP_FIELD" && (r || !a || !a.I18nTooltipLabels)) {
                s = this._oPropertyEditor.getButtonTooltipList(this._sDataName)
            }
            if (s) {
                i = new n;
                i.setData(s);
                t.setModel(i)
            }
        },
        onAssignActionsPress: function(t) {
            var e = t.getSource();
            var o = e.data("buttonUid");
            var n = this._getButtonDefinition(o);
            if (!n) {
                return
            }
            var i = n.data.actions;
            this._oPropertyEditor.setAssignedActions(i);
            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(n.index, this._sDataName)
            }
            var a = n.data.buttonType;
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType(a, this._sDataName)
            }
            if (this._oPropertyEditor.getMainController) {
                var r = this._oPropertyEditor.getMainController()
            }
            var s = this._getActionAssignmentHelper(a, this._sDataName);
            s.showAddRemoveActionAssignmentDialog()
        },
        _getActionAssignmentHelper: function(t, e) {
            return new i(this._oPropertyEditor, t, e)
        },
        _getButtonDefinition: function(t) {
            var e = this._oSmartListControl.getModel("ButtonsControl");
            var o = e.getData();
            var n = this._findModelDataIndex(t, o[this._sDataName]);
            if (n >= 0) {
                return {
                    index: n,
                    data: o[this._sDataName][n]
                }
            }
            return null
        },
        _findModelDataIndex: function(t, e) {
            for (var o = 0; o < e.length; o++) {
                if (e[o].buttonUid === t) {
                    return o
                }
            }
            return -1
        },
        onButtonTypeChange: function(t) {
            var e = t.getParameter("selectedItem");
            if (e && e.getKey() === "NAVIGATION_BUTTON") {
                var o = t.getSource();
                var n = o.data("buttonUid");
                var i = this._getButtonDefinition(n);
                if (i) {
                    i.data.actions = []
                }
            }
        },
        onIconBrowsePress: function(t) {
            if (this._oPropertyEditor) {
                var e = this._oPropertyEditor.getMainController();
                var o = e.getView();
                var n = t.getSource();
                var i = this._getIconSelectHelper();
                var a = this._getLocalizedText("NONE");
                i.openIconSelectValueHelp(n, o, a)
            }
        },
        _getAddButton: function() {
            if (!this._oAddButton) {
                this._oAddButton = this._findButtonByIconName("sap-icon://add")
            }
            return this._oAddButton
        },
        _getDeleteButton: function() {
            if (!this._oDeleteButton) {
                this._oDeleteButton = this._findButtonByIconName("sap-icon://delete")
            }
            return this._oDeleteButton
        },
        _findButtonByIconName: function(t) {
            var e = this._findOverflowToolbar();
            if (e) {
                var o = e.getContent();
                for (var n = 0; n < o.length; n++) {
                    var i = o[n].getMetadata().getName();
                    if (i === "sap.m.Button" && o[n].getIcon() === t) {
                        return o[n]
                    }
                }
            }
            return null
        },
        _findOverflowToolbar: function() {
            var t = this._oSmartListControl.getItems();
            for (var e = 0; e < t.length; e++) {
                var o = t[e].getMetadata().getName();
                if (o === "sap.m.OverflowToolbar") {
                    return t[e]
                }
            }
            return null
        },
        _getIconSelectHelper: function() {
            if (!this._oIconHelper) {
                this._oIconHelper = new a
            }
            return this._oIconHelper
        },
        _getLocalizedText: function(t, e) {
            return this._oPropertyEditor.getLocalizedText(t, e)
        },
        _getPageDescriptionText: function(t) {
            if (jQuery.trim(t) && t.toLowerCase().indexOf("i18n[") === 0) {
                var e = t.substring(t.indexOf("[") + 1, t.indexOf("]"));
                var o = r.getPageDescriptionText(e);
                if (!jQuery.trim(o)) {
                    return e
                }
                return o
            }
            return t
        }
    });
    return u
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/BaseActionAssignmentController", ["sap/dm/dme/podfoundation/controller/BaseAssignmentListController", "sap/ui/model/json/JSONModel", "sap/dm/dme/device/CrossPlatformUtilities"], function(t, e, i) {
    "use strict";
    var n = t.extend("sap.dm.dme.podfoundation.controller.BaseActionAssignmentController", {
        setActionSelections: function(t) {
            this._aActionSelections = t
        },
        setTabPageSelections: function(t) {
            this._aTabPageSelections = t
        },
        setNavigationPageSelections: function(t) {
            this._aNavigationPageSelections = t
        },
        setAssignedActions: function(t) {
            this._aAssignedActions = t
        },
        setActionAssignmentDialog: function(t) {
            this._oActionAssignmentDialog = t
        },
        getActionAssignmentDialog: function(t) {
            return this._oActionAssignmentDialog
        },
        getI18nText: function(t, e) {
            return this._oMainControllerHelper._getI18nText(t, e)
        },
        setMainControllerHelper: function(t) {
            this._oMainControllerHelper = t
        },
        setMainController: function(t) {
            this._oMainController = t
        },
        setPropertyEditors: function(t) {
            this._aPropertyEditors = t
        },
        setEventPropertyEditors: function(t) {
            this._aEventPropertyEditors = t
        },
        setTransactionPropertyEditors: function(t) {
            this._aTransactionPropertyEditors = t
        },
        setProductionProcessPropertyEditors: function(t) {
            this._aProductionProcessPropertyEditors = t
        },
        getAssignedActions: function() {
            return this.getAssignedPlugins()
        },
        getAssignedPlugins: function() {
            var t = this.getAssignedTable();
            var e = t.getBinding("items");
            var i = [];
            var n = 0;
            for (var o = 0; o < e.aIndices.length; o++) {
                var s = e.oList[e.aIndices[o]];
                n = n + 10;
                i[i.length] = {
                    pluginId: s.plugin,
                    sequence: n,
                    clearsInput: s.clearsInput,
                    menuLabel: s.menuLabel
                }
            }
            return i
        },
        getDialogModel: function() {
            if (!this._oDialogModel) {
                this._oDialogModel = this._oActionAssignmentDialog.getModel("DialogModel")
            }
            return this._oDialogModel
        },
        loadActionsTable: function() {
            var t = this.getDialogModel();
            var n = t.getData();
            var o = {
                Actions: n.Actions
            };
            var s = this.getAssignedTable();
            var a = new e;
            a.setData(o);
            s.setModel(a);
            if (this._aAssignedActions && this._aAssignedActions.length > 0) {
                for (var r = 0; r < this._aAssignedActions.length; r++) {
                    var l = this._aAssignedActions[r][this._sAssignedKeyId];
                    var d = l;
                    if (d.indexOf(".") > 0) {
                        d = l.substring(0, d.indexOf("."))
                    }
                    var c = this._findAction(d, n);
                    if (c) {
                        c.menuLabel = this._aAssignedActions[r].menuLabel;
                        var g = i.cloneObject(c);
                        g.id = l;
                        g.action = l;
                        g.plugin = l;
                        if (g.multiInstance && g.type === "VIEW_PLUGIN" && l.indexOf(".") < 0) {
                            g.showConfiguration = false
                        }
                        this.addToAssigned(g, true)
                    }
                }
            }
        },
        updateAvailableActionRank: function(t, e) {
            var i = this.findAction(t);
            if (i) {
                i.Rank = e
            }
        },
        addAction: function(t) {
            var e = t.typeDefinition;
            var i = this.findAction(e);
            if (i) {
                i.menuLabel = t.menuLabel;
                i.typeDefinitionTitle = t.typeDefinitionTitle;
                i.typeDefinitionEventKey = t.typeDefinitionEventKey;
                i.typeData = t.typeData;
                i.multiInstanceConfigurable = t.multiInstanceConfigurable;
                this.addToAssigned(i, false)
            }
        },
        findAction: function(t) {
            var e = this.getDialogModel();
            var i = e.getData();
            if (i) {
                return this._findAction(t, i)
            }
            return null
        },
        _findAction: function(t, e) {
            if (!e) {
                return null
            }
            var i = e.AvailableActions;
            if (!i || i.length === 0) {
                return null
            }
            for (var n = 0; n < i.length; n++) {
                if (t === i[n][this._sAvailableKeyId]) {
                    return i[n]
                }
            }
            return null
        },
        getSelectedRowInformation: function(t) {
            var e = this.getAssignedTable();
            var i = e.getModel();
            var n = i.getData();
            if (n.Actions && n.Actions.length > 0) {
                for (var o = 0; o < n.Actions.length; o++) {
                    if (n.Actions[o].action === t) {
                        return {
                            rowIndex: o,
                            data: n.Actions[o]
                        }
                    }
                }
            }
            return null
        },
        removeFromAssigned: function(t, e) {
            var i = e;
            if (arguments.length === 1 && typeof i === "undefined") {
                i = this.getSelectedRowInformation(t);
                if (!i) {
                    return
                }
            }
            var n = i.rowIndex;
            var o = i.data;
            this.onRemoveFromAssigned(o);
            var s = this.getAssignedTable();
            var a = s.getModel();
            var r = a.getData();
            r.Actions.splice(n, 1);
            this.updateAvailableActionRank(t, this.config.initialRank);
            a.refresh(true);
            var l = this._getContextByIndex(s, n + 1);
            if (!l) {
                this._setSelectedIndex(s, n - 1)
            }
        },
        onRemoveFromAssigned: function(t) {},
        addToAssigned: function(t, e) {
            var n = this.getAssignedTable();
            var o = this._getNumberOfRows(n);
            var s, a;
            if (o > 0) {
                s = this._getContextByIndex(n, o - 1);
                a = this.config.defaultRank;
                if (s) {
                    a = this.config.rankAlgorithm.After(s.getProperty("Rank"))
                }
            } else {
                s = this._getContextByIndex(n, 0);
                a = this.config.defaultRank;
                if (s) {
                    a = this.config.rankAlgorithm.Before(s.getProperty("Rank"))
                }
            }
            var r = n.getModel();
            if (r) {
                t.Rank = a;
                this.updateAvailableActionRank(t.action, a);
                var l = r.getData();
                if (!l.Actions) {
                    l.Actions = []
                }
                var d = i.cloneObject(t);
                l.Actions[l.Actions.length] = d;
                if (!e) {
                    this.onMoveToAssigned(d)
                } else {
                    this.updateActionData(d)
                }
                r.refresh(true)
            }
            if (!e) {
                this._setSelectedIndex(n, o)
            }
        },
        updateActionData: function(t) {},
        selectRowForAssigned: function(t) {
            var e = this.getAssignedTable();
            var i = this._findItemByColumnId(e, t);
            var n = e.indexOfItem(i);
            this._setSelectedIndex(e, n)
        }
    });
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/BaseAssignmentListController", ["sap/dm/dme/podfoundation/controller/BaseListMaintenanceController"], function(e) {
    "use strict";
    var t = e.extend("sap.dm.dme.podfoundation.controller.BaseAssignmentListController", {
        setAvailableTableId: function(e) {
            this._sAvailableTableId = e
        },
        setAssignedTableId: function(e) {
            this._sAssignedTableId = e
        },
        setAssignedKeyId: function(e) {
            this._sAssignedKeyId = e
        },
        setAvailableKeyId: function(e) {
            this._sAvailableKeyId = e
        },
        setAssignedColumns: function(e) {
            this._aAssignedColumns = e
        },
        getAssignmentModel: function() {
            if (!this._oAssignmentModel) {
                var e = this.getAssignedTable();
                if (e) {
                    this._oAssignmentModel = e.getModel()
                }
            }
            return this._oAssignmentModel
        },
        getAvailableTable: function() {
            if (!this._oAvailableTable) {
                this._oAvailableTable = this._byId(this._sAvailableTableId)
            }
            return this._oAvailableTable
        },
        getAssignedTable: function() {
            if (!this._oAssignedTable) {
                this._oAssignedTable = this._byId(this._sAssignedTableId)
            }
            return this._oAssignedTable
        },
        _getTableById: function(e) {
            if (!this._oAssignedTable) {
                this._oAssignedTable = this._byId(this._sAssignedTableId)
            }
            return this._oAssignedTable
        },
        _byId: function(e) {
            return sap.ui.getCore().byId(e)
        },
        config: {
            initialRank: 0,
            defaultRank: 10240,
            rankAlgorithm: {
                Before: function(e) {
                    return e + 10240
                },
                Between: function(e, t) {
                    return (e + t) / 2
                },
                After: function(e) {
                    return e / 2
                }
            }
        },
        _getNumberOfRows: function(e) {
            var t = e.getItems();
            if (!t) {
                return 0
            }
            return t.length
        },
        _getContextByIndex: function(e, t) {
            var n = e.getItems();
            if (n && n.length > 0 && t >= 0 && t < n.length) {
                return n[t].getBindingContext()
            }
            return undefined
        },
        _setSelectedIndex: function(e, t) {
            var n = e.getItems();
            if (n && n.length > 0 && t >= 0 && t < n.length) {
                e.setSelectedItem(n[t], true);
                n[t].setSelected(true);
                e.fireSelectionChange({
                    listItem: n[t],
                    selected: true
                })
            }
        },
        getSelectedRowContext: function(e, t) {
            var n = e.getSelectedItems();
            var i = [];
            var s;
            for (s = 0; s < n.length; s++) {
                var o = n[s].getBindingContext();
                var r = o.getProperty(this._sAvailableKeyId);
                i[i.length] = r
            }
            e.removeSelections(true);
            for (s = 0; s < i.length; s++) {
                var a = this._findItemByColumnId(e, i[s]);
                if (a) {
                    var l = a.getBindingContext();
                    var g = e.indexOfItem(a);
                    if (l && t) {
                        t.call(this, l, g, e)
                    }
                }
            }
            return o
        },
        _findItemByColumnId: function(e, t) {
            var n = e.getItems();
            if (n && n.length > 0) {
                for (var i = 0; i < n.length; i++) {
                    var s = n[i].getBindingContext();
                    if (t === s.getProperty(this._sAvailableKeyId)) {
                        return n[i]
                    }
                }
            }
            return undefined
        },
        moveAvailableToAssigned: function() {
            if (this._aAssignedColumns && this._aAssignedColumns.length > 0) {
                var e = this.getAvailableTable();
                var t = this.getAssignedTable();
                for (var n = 0; n < this._aAssignedColumns.length; n++) {
                    var i = this._aAssignedColumns[n][this._sAssignedKeyId];
                    var s = this._aAssignedColumns[n].sortOrder;
                    var o = 0;
                    var r = this._getContextByIndex(e, o);
                    while (r) {
                        var a = r.getObject();
                        if (a && i === a[this._sAvailableKeyId]) {
                            var l = this._getNumberOfRows(t);
                            var g, d;
                            if (l > 0) {
                                g = this._getContextByIndex(t, l - 1);
                                d = this.config.defaultRank;
                                if (g) {
                                    d = this.config.rankAlgorithm.After(g.getProperty("Rank"))
                                }
                            } else {
                                g = this._getContextByIndex(t, 0);
                                d = this.config.defaultRank;
                                if (g) {
                                    d = this.config.rankAlgorithm.Before(g.getProperty("Rank"))
                                }
                            }
                            var f = this.getAssignmentModel();
                            if (f) {
                                f.setProperty("Rank", d, r);
                                f.setProperty("sortOrder", s, r);
                                f.refresh(true)
                            }
                            break
                        }
                        o++;
                        r = this._getContextByIndex(e, o)
                    }
                }
            }
        },
        moveToAvailable: function() {
            this.getSelectedRowContext(this.getAssignedTable(), function(e, t, n) {
                var i = this.getAssignmentModel();
                if (i) {
                    var s = e.getObject();
                    this.onMoveToAvailable(s);
                    i.setProperty("Rank", this.config.initialRank, e);
                    i.refresh(true)
                }
                var o = this._getContextByIndex(n, t + 1);
                if (!o) {
                    this._setSelectedIndex(n, t - 1)
                }
            })
        },
        onMoveToAvailable: function(e) {},
        moveToAssigned: function() {
            this.getSelectedRowContext(this.getAvailableTable(), function(e) {
                var t = this.getAssignedTable();
                var n = this._getNumberOfRows(t);
                var i, s;
                if (n > 0) {
                    i = this._getContextByIndex(t, n - 1);
                    s = this.config.defaultRank;
                    if (i) {
                        s = this.config.rankAlgorithm.After(i.getProperty("Rank"))
                    }
                } else {
                    i = this._getContextByIndex(t, 0);
                    s = this.config.defaultRank;
                    if (i) {
                        s = this.config.rankAlgorithm.Before(i.getProperty("Rank"))
                    }
                }
                var o = this.getAssignmentModel();
                if (o) {
                    o.setProperty("Rank", s, e);
                    o.refresh(true);
                    var r = e.getObject();
                    this.onMoveToAssigned(r)
                }
                this._setSelectedIndex(t, n)
            })
        },
        onMoveToAssigned: function(e) {},
        moveSelectedRow: function(e) {
            this.getSelectedRowContext(this.getAssignedTable(), function(t, n, i) {
                var s = n + (e === "Up" ? -1 : 1);
                var o = this._getContextByIndex(i, s);
                if (!o) {
                    return
                }
                var r = o.getProperty("Rank");
                var a = t.getProperty("Rank");
                var l = this.getAssignmentModel();
                if (l) {
                    l.setProperty("Rank", r, t);
                    l.setProperty("Rank", a, o);
                    l.refresh(true)
                }
                this._setSelectedIndex(i, s)
            })
        },
        moveUp: function() {
            this.moveSelectedRow("Up")
        },
        moveDown: function() {
            this.moveSelectedRow("Down")
        }
    });
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/BaseListMaintenanceController", ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/message/ErrorHandler", "sap/dm/dme/podfoundation/service/ListMaintenanceService"], function(e, t, n, r, i) {
    "use strict";
    var o = e.extend("sap.dm.dme.podfoundation.controller.BaseListMaintenanceController", {
        setMainView: function(e) {
            this._oMainView = e
        },
        getMainView: function(e) {
            return this._oMainView
        },
        setListType: function(e) {
            this._sListType = e
        },
        getListType: function() {
            return this._sListType
        },
        getI18nText: function(e, t) {
            return n.getPropertyEditorText(e, t)
        },
        getListMaintenanceI18nText: function(e, t) {
            return n.getListMaintenanceText(e, t)
        },
        getGlobalI18nText: function(e, t) {
            return n.getGlobalText(e, t)
        },
        showErrorMessage: function(e) {
            t.error(e)
        },
        showAjaxErrorMessage: function(e, t) {
            var n = r.getErrorMessage(t);
            if (!jQuery.trim(n)) {
                n = e
            }
            this.showErrorMessage(n)
        },
        getListMaintenanceService: function() {
            if (!this._oListMaintenanceService) {
                var e = this.getMainView().getController();
                var t = this.getPodFoundationDataSourceUri(e);
                var n = this.getPlantODataSourceUri(e);
                this._oListMaintenanceService = new i(t, n)
            }
            return this._oListMaintenanceService
        },
        getPodFoundationDataSourceUri: function() {
            var e = this.getMainView().getController();
            return e.getOwnerComponent().getDataSourceUriByName("podFoundation-RestSource")
        },
        getProductionDataSourceUri: function() {
            var e = this.getMainView().getController();
            return e.getOwnerComponent().getDataSourceUriByName("production-RestSource")
        },
        getPlantODataSourceUri: function() {
            var e = this.getMainView().getController();
            return e.getOwnerComponent().getDataSourceUriByName("plant-oDataSource")
        }
    });
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/BasePodSelectionController", ["sap/dm/dme/podfoundation/controller/PluginViewController", "sap/dm/dme/podfoundation/model/SfcKeyData", "sap/dm/dme/podfoundation/model/ResourceKeyData", "sap/dm/dme/podfoundation/model/ItemKeyData", "sap/dm/dme/podfoundation/model/ProcessLotKeyData", "sap/dm/dme/podfoundation/model/ShopOrderKeyData", "sap/dm/dme/podfoundation/model/Selection", "sap/dm/dme/podfoundation/model/InputType", "sap/dm/dme/podfoundation/model/PodType", "sap/ui/model/json/JSONModel", "sap/ui/core/MessageType", "sap/dm/dme/serverevent/Topic", "sap/dm/dme/util/PlantSettings", "sap/m/MultiInput", "sap/m/Token", "sap/ui/model/odata/type/Decimal", "sap/ui/core/format/NumberFormat", "sap/base/util/deepClone", "sap/base/security/encodeURL", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/logging/Logging", "sap/dm/dme/podfoundation/controller/PodVariantConfigurationDelegate", "sap/dm/dme/podfoundation/browse/SfcBrowseValueHelp", "sap/dm/dme/podfoundation/browse/SfcOperationBrowseValueHelp", "sap/dm/dme/podfoundation/browse/OperationActivityBrowseValueHelp", "sap/dm/dme/podfoundation/browse/ResourceBrowseValueHelp", "sap/dm/dme/podfoundation/browse/WorkCenterBrowseValueHelp", "sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowseValueHelp", "sap/dm/dme/podfoundation/handler/SfcPodHelper"], function(e, t, i, n, o, s, l, r, a, u, c, f, d, p, h, g, _, S, V, y, T, I, C, m, w, P, F, E, b) {
    "use strict";
    var v = {
        public: true,
        final: true
    };
    return e.extend("sap.dm.dme.podfoundation.controller.BasePodSelectionController", {
        metadata: {
            methods: {
                getFilterBar: v
            }
        },
        constructor: function() {
            e.call(this);
            this._oLogger = T.getLogger("sap.dm.dme.podfoundation.controller.BasePodSelectionController")
        },
        onInit: function() {
            e.prototype.onInit.apply(this, arguments);
            this._bOnAfterRenderingComplete = false;
            this._bWaitToProcessOnSearch = false;
            this.podVariantConfigurationDelegate = new I(this)
        },
        getFilterBar: function() {
            if (!this.oFilterBar && this.getView()) {
                let e = this.getView().getId();
                this.oFilterBar = sap.ui.getCore().byId(e + "--filterBar")
            }
            return this.oFilterBar
        },
        handleOnBeforeRendering: function() {
            this.initializePodEventHandler();
            this.oViewData = this._getViewData();
            this._loadInputTypeValues(this.oViewData);
            let e = new u;
            e.setData(this.oViewData);
            this.getView().setModel(e);
            let t = this.getFilterBar();
            if (t) {
                t.fireInitialise()
            }
        },
        isSfcPodSelectionType: function() {
            this._oConfiguration = this.getConfiguration();
            let e = null;
            if (this._oConfiguration && y.isNotEmpty(this._oConfiguration.selectionType)) {
                e = this._oConfiguration.selectionType
            }
            return e && e === "SFC"
        },
        initializePodEventHandler: function() {},
        _checkResourceOperationUpdatedInModel: function() {
            let e = this._getPodSelectionModel();
            let t = e.getResource();
            let i = e.getOperations();
            if (t && (i && i.length > 0)) {
                return true
            }
            return false
        },
        awaitConditionOrTimeout: function(e, t, i) {
            let n = 0;
            return new Promise(function(o) {
                setTimeout(function s() {
                    n++;
                    let l = i.call();
                    if (l) {
                        o(true);
                        return
                    } else if (n > t) {
                        o(false);
                        return
                    }
                    setTimeout(s, e)
                }, e)
            })
        },
        _loadInputTypeValues: function(e) {
            e.inputFilterTypes = [{
                inputType: "SFC",
                inputTypeLabel: this.getI18nText("sfc")
            }, {
                inputType: "PROCESS_LOT",
                inputTypeLabel: this.getI18nText("processLot")
            }]
        },
        handleOnAfterRendering: function() {
            if (this.isSfcPodSelectionType()) {
                this.configureSfcPodSelectionFilters()
            }
            let e = this.getDefaultFilterList();
            this.processOnAfterRendering(e)
        },
        configureSfcPodSelectionFilters: function() {
            let e = this.getView().byId("inputFilter");
            if (e) {
                e.setShowValueHelp(true);
                e.setShowSuggestion(false);
                e.setShowTableSuggestionValueHelp(false);
                e.attachValueHelpRequest(this.onSfcValueHelp, this)
            }
        },
        getDefaultFilterList: function() {
            return null
        },
        _toUpperCase: function(e, t) {
            let i = e;
            if (y.isNotEmpty(e) && !Array.isArray(e) && typeof e === "string") {
                i = y.trim(e).toUpperCase()
            }
            if (t && t.setValue && i !== e) {
                t.setValue(i)
            }
            return i
        },
        enableVariantConfiguration: function() {
            let e = this.isPodVariantConfigurationEnabled();
            if (e && this.podVariantConfigurationDelegate.isVariantManagementAvailable()) {
                let e = this._getPodSelectionModel().getPodType();
                this.podVariantConfigurationDelegate.setVariantKey(e);
                this.initPodVarant(true);
                this.podVariantConfigurationDelegate.enableVariantConfiguration();
                this.setPodControllerVariantConfiguration();
                this.podVariantConfigurationDelegate.getAllVariants(this.variantCallback.bind(this));
                return
            }
            this.initPodVarant(false)
        },
        setPodControllerVariantConfiguration: function() {
            this.getPodController().setVariantConfigurationDelegate(this.podVariantConfigurationDelegate)
        },
        isPodVariantConfigurationEnabled: function() {
            let e = this.getPodConfiguration();
            if (e) {
                for (let t = 0; t < e.plugins.length; t++) {
                    let i = e.plugins[t];
                    if (this.isPluginVariantCapable(i)) {
                        return true
                    }
                }
            }
            return false
        },
        isPluginVariantCapable: function(e) {
            if (e.id === "wcPodSelectionPlugin") {
                if (e.configuration && typeof e.configuration.enableViews !== "undefined") {
                    return e.configuration.enableViews
                }
            } else if (e.id === "operationPodSelectionPlugin") {
                if (e.configuration && typeof e.configuration.enableViews !== "undefined") {
                    return e.configuration.enableViews
                }
            }
            return false
        },
        initPodVarant: function(e) {
            let t = this.getPodController();
            let i = t.getView().byId("pageHeaderVariant");
            if (i) {
                i.setVisible(e)
            }
        },
        variantCallback: function(e, t) {
            this.podVariantConfigurationDelegate.variantCallback(e, t)
        },
        getAllVariants: function() {
            this.podVariantConfigurationDelegate.getAllVariants(this.podVariantConfigurationDelegate.variantCallback.bind(this))
        },
        processOnAfterRendering: function(e) {
            if (this._bOnAfterRenderingComplete) {
                return
            }
            this._bOnAfterRenderingComplete = true;
            let t = this._getPodSelectionModel();
            t.setRequiredValuesLoaded(false);
            if (!this.isSfcPodSelectionType() && this._isRequiredValuesLoaded(this.oViewData, e)) {
                for (let t of e) {
                    let e = t + "FilterMandatory";
                    let i = t + "FilterVisible";
                    let n = t + "Filter";
                    if (this.oViewData[i] || this.oViewData[e]) {
                        if (this.oViewData[t] || this.oViewData[t] !== "") {
                            this._processChange(n, this.oViewData[t])
                        }
                    }
                }
                t.setRequiredValuesLoaded(true);
                this._delayedFirePodSelectionChangeEvent(t, false)
            }
            this._initializeQuantityFilterFormat();
            let i = this.getView().byId("inputFilter");
            if (i) {
                this._addMultiInputValidator(i);
                this._setFocus(i, 125)
            }
            this.enableVariantConfiguration()
        },
        _initializeQuantityFilterFormat: function() {
            const e = {
                precision: 38,
                scale: 6
            };
            const t = {
                strictGroupingValidation: true,
                minIntegerDigits: 1,
                minFractionDigits: 0
            };
            let i = this.getView().byId("quantityFilter");
            if (i && i.getBinding("value")) {
                i.getBinding("value").setType(new g(t, e), "string")
            }
        },
        _addMultiInputValidator: function(e) {
            let t = this;
            e.addValidator(function(e) {
                t.onValidateMultiInputField(e)
            })
        },
        _getPodSelectionModel: function() {
            if (!this._podSelectionModel) {
                this._podSelectionModel = this.getPodSelectionModel()
            }
            return this._podSelectionModel
        },
        _setFocus: function(e, t) {
            let i = 500;
            if (t) {
                i = t
            }
            if (e) {
                setTimeout(function() {
                    e.focus()
                }, i)
            }
        },
        getConfiguration: function() {
            let t = e.prototype.getConfiguration.call(this);
            if (t) {
                return S(t)
            }
            return null
        },
        _getConfiguration: function() {
            if (!this._oViewData) {
                let e = this.getConfiguration();
                if (e) {
                    this._oViewData = e;
                    this._updateViewData(this._oViewData)
                }
                this._oViewData.updateInputFilterLabel = true;
                this._oViewData.updateInputFilterPlaceholder = true;
                this._oViewData.updateInputFilterTooltip = true;
                if (y.isNotEmpty(this._oViewData.inputFilterLabel)) {
                    this._oViewData.updateInputFilterLabel = false
                }
                if (y.isNotEmpty(this._oViewData.inputFilterPlaceholder)) {
                    this._oViewData.updateInputFilterPlaceholder = false
                }
                if (y.isNotEmpty(this._oViewData.inputFilterTooltip)) {
                    this._oViewData.updateInputFilterTooltip = false
                }
                let t = this._getPodSelectionModel();
                t.setInputType(this._oViewData.inputType)
            }
            return this._oViewData
        },
        _updateViewData: function(e) {
            if (e) {
                if (typeof e.inputType === "undefined") {
                    e.inputType = "SFC"
                }
                if (typeof e.inputTypeFilterVisible === "undefined") {
                    e.inputTypeFilterVisible = false
                }
                if (typeof e.inputTypeFilterLabel === "undefined") {
                    e.inputTypeFilterLabel = ""
                }
                if (typeof e.inputTypeFilterTooltip === "undefined") {
                    e.inputTypeFilterTooltip = ""
                }
            }
        },
        _getViewData: function() {
            let e = this._getConfiguration();
            let t = this._getPodSelectionModel();
            t.setPodType(a.WorkCenter);
            if (y.isNotEmpty(e.inputType)) {
                t.setInputType(e.inputType)
            }
            this._initializeWorklistType(t);
            this._loadDefaultData(e);
            this._loadDefaultQuantity(e, t);
            let i = t.getInputType();
            this._updateControlsForInputType(i, e);
            this._loadControlDefaults(e);
            return e
        },
        _updateControlsForInputType: function(e, t) {
            if (e === r.ProcessLot) {
                this._setControlDefaults(t, "input", "processLot")
            } else if (e === r.ShopOrder) {
                this._setControlDefaults(t, "input", "shopOrder")
            } else if (e === r.Item || e === r.ItemVersion) {
                this._setControlDefaults(t, "input", "item")
            } else {
                this._setControlDefaults(t, "input", "sfc")
            }
        },
        _updateInputControl: function(e) {
            const t = this._getConfiguration();
            const i = this.getView().byId("inputFilter");
            if (i) {
                const n = this.getView().byId("filterBar");
                const o = n.getFilterGroupItems();
                this._setInputControlText(t, e, i, o[1])
            }
        },
        _setInputControlText: function(e, t, i, n) {
            if (t === r.ProcessLot) {
                if (e.updateInputFilterPlaceholder) {
                    i.setPlaceholder(this.getI18nText("processLotPlaceholder"))
                }
                if (e.updateInputFilterLabel) {
                    n.setLabel(this.getI18nText("processLot"))
                }
                if (e.updateInputFilterTooltip) {
                    n.setLabelTooltip(this.getI18nText("processLotTooltip"))
                }
            } else {
                if (e.updateInputFilterPlaceholder) {
                    i.setPlaceholder(this.getI18nText("sfcPlaceholder"))
                }
                if (e.updateInputFilterLabel) {
                    n.setLabel(this.getI18nText("sfc"))
                }
                if (e.updateInputFilterTooltip) {
                    n.setLabelTooltip(this.getI18nText("sfcTooltip"))
                }
            }
            this._setFocus(i, 0)
        },
        _loadDefaultData: function(e) {},
        _loadDefaultQuantity: function(e, t) {
            let i = this.getQueryParameter("QUANTITY");
            if (y.isEmpty(i) && y.isNotEmpty(e.quantity)) {
                i = e.quantity;
                if (typeof e.quantity !== "string") {
                    i = y.floatToString(e.quantity)
                }
            }
            let n = -1;
            if (typeof i === "string" && y.isNotEmpty(i)) {
                n = y.stringToFloat(i)
            }
            if (typeof n !== "string" && n > 0) {
                e.quantity = i;
                t.setQuantity(n)
            }
        },
        _loadControlDefaults: function(e) {},
        onInputTypeChangeEvent: function(e) {
            let t = e.getParameters().selectedItem;
            this._processChange("inputTypeFilter", t.getKey())
        },
        onChange: function(e) {
            let t = this.getFilterBar();
            if (t) {
                t.fireFilterChange(e)
            }
            let i = e.getSource();
            let n = i.getId();
            let o = this._toUpperCase(i.getValue(), i);
            this._processChange(n, o)
        },
        _processChange: function(e, t) {
            let i = t;
            if (typeof i === "string") {
                i = this._toUpperCase(t)
            }
            let n;
            let o;
            let s = this._getPodSelectionModel();
            this.setWaitToProcessOnSearch(true);
            if (this._endsWith(e, "inputFilter")) {
                this._oMainInputValue = null;
                let e = s.getSelections();
                if (e) {
                    if (e.length === 1) {
                        n = e[0]
                    } else if (e.length > 1) {
                        n = e
                    }
                }
                s.clearSelections();
                o = this._addInputValueToModel(s, i);
                s.setRequiredValuesLoaded(false);
                if (this._validateRequiredValues(this.oViewData, false)) {
                    s.setRequiredValuesLoaded(true);
                    this._oMainInputValue = o;
                    this.fireInputChangeEvent(o, n)
                }
                this.setWaitToProcessOnSearch(false)
            } else if (this._endsWith(e, "inputTypeFilter")) {
                let e = s.getInputType();
                s.setInputType(t);
                s.setInputValue("");
                s.clearSelections();
                this._updateInputControl(t);
                this.fireInputTypeChangeEvent(t, e);
                this.setWaitToProcessOnSearch(false)
            } else if (this._endsWith(e, "resourceFilter")) {
                this.changeResourceInPodSelectionModel(i)
            } else if (this._endsWith(e, "quantityFilter")) {
                let e = 0;
                let t = i;
                if (typeof i === "string") {
                    if (y.isEmpty(i)) {
                        t = null
                    } else {
                        let e = _.getFloatInstance({});
                        t = e.parse(i)
                    }
                }
                e = s.getQuantity();
                s.setQuantity(t);
                this.fireQuantityChangeEvent(t, e);
                this.setWaitToProcessOnSearch(false)
            } else {
                this._processSubclassFilters(e, i)
            }
            this._addErrorMessage()
        },
        _processSubclassFilters: function(e, t) {},
        onValidateMultiInputField: function(e) {
            this._clearMultiInputTokens().then(function() {
                let t = e.text.toUpperCase();
                let i = new h({
                    key: t,
                    text: t
                });
                e.asyncCallback(i)
            }.bind(this));
            return p.WaitForAsyncValidation
        },
        _clearMultiInputTokens: function() {
            let e = this;
            let t = new Promise(function(t) {
                let i = e.getView().byId("inputFilter");
                if (i) {
                    i.removeAllTokens()
                }
                setTimeout(function() {
                    t()
                }, 125)
            });
            return t
        },
        onTokenUpdate: function(e) {
            let t = this.getFilterBar();
            if (t) {
                t.fireFilterChange(e)
            }
            this.setExecuteActionDelay(300);
            let i = e.getSource();
            let n = i.getId();
            let o = null;
            let s = e.getParameter("type");
            if (s === "added") {
                let t = e.getParameter("addedTokens");
                o = t[0].getKey();
                this._processChange(n, o)
            } else if (s === "removed") {
                let t = e.getParameter("removedTokens");
                let s = this._getRemainingTokens(i.getTokens(), t);
                if (!s || s.length === 0) {
                    this._processChange(n, "");
                    this._clearSelectionForNcPod();
                    return
                }
                if (s.length === 1) {
                    o = s[0].getKey()
                } else if (s.length > 1) {
                    o = [];
                    for (let e of s) {
                        o[o.length] = e.getKey()
                    }
                }
                this._updateModelAndRefreshWorklist(o)
            }
        },
        _clearSelectionForNcPod: function() {
            if (this.getPodSelectionModel().getPodType() === a.NC) {
                this._updateModelAndRefreshWorklist("")
            }
        },
        _getRemainingTokens: function(e, t) {
            let i = [];
            for (let n of e) {
                let e = false;
                for (let i of t) {
                    if (n.getId() === i.getId()) {
                        e = true;
                        break
                    }
                }
                if (!e) {
                    i[i.length] = n
                }
            }
            return i
        },
        _addInputValueToModel: function(e, i) {
            let a = null;
            let u = i;
            if (i) {
                if (!Array.isArray(i)) {
                    a = y.trim(i).toUpperCase();
                    u = [];
                    u[u.length] = a
                } else if (i.length === 1) {
                    a = y.trim(i[0]).toUpperCase()
                }
            }
            e.setInputValue(a);
            e.clearSelections();
            e.clearDistinctSelections();
            e.clearSelectedRoutingSteps();
            if (!a && !Array.isArray(i)) {
                if (this.isSfcPodSelectionType()) {
                    this.clearWorkCenterField();
                    this.clearOperationField()
                }
                return null
            }
            for (let i of u) {
                let a = new l;
                a.setInput(i);
                switch (e.getInputType()) {
                    case r.ProcessLot:
                        a.setProcessLot(new o(i));
                        break;
                    case r.ShopOrder:
                        a.setShopOrder(new s(i));
                        break;
                    case r.Item:
                    case r.ItemVersion:
                        a.setItem(new n(i));
                        break;
                    default:
                        a.setSfc(new t(i))
                }
                e.addSelection(a)
            }
            return u
        },
        _addErrorMessage: function() {
            this.clearMessages();
            let e = this._getCurrentMessages();
            let t = this;
            e.forEach(function(e) {
                let i = e.getTarget().split("--");
                let n = i[i.length - 1];
                let o;
                if (n === "quantityFilter/value") {
                    o = t.getI18nText("quantity")
                }
                t.addMessage(c.Error, e.getMessage(), "", o)
            })
        },
        _getCurrentMessages: function() {
            return sap.ui.getCore().getMessageManager().getMessageModel().getData()
        },
        _delayedOnSearch() {
            let e = this._getPodSelectionModel();
            if (!this._validateRequiredValues(this.oViewData)) {
                e.setRequiredValuesLoaded(false);
                return
            }
            e.setRequiredValuesLoaded(true);
            this.clearMessages();
            let t = this.getView().byId("inputFilter");
            if (t) {
                let i = t.getTokens();
                if (i && i.length === 1) {
                    this._addInputValueToModel(e, i[0].getKey())
                }
            }
            this.updateNotificationSubscriptions();
            this._doFirePodSelectionChangeEvent(e)
        },
        setWaitToProcessOnSearch: function(e) {
            this._bWaitToProcessOnSearch = e
        },
        onSearch: function() {
            let e = this;
            setTimeout(function() {
                if (e._bFiringChangeEvent) {
                    return
                }
                if (!e._bWaitToProcessOnSearch) {
                    e._delayedOnSearch()
                } else {
                    e._retryOnSearch()
                }
            }, 100)
        },
        _retryOnSearch: function() {
            this.onSearch()
        },
        _doFirePodSelectionChangeEvent: function(e) {
            this.firePodSelectionChangeEvent(e, false)
        },
        _endsWith: function(e, t) {
            return e.indexOf(t, e.length - t.length) !== -1
        },
        onClear: function() {
            let e = [];
            let t = this.getFilterBar();
            if (t) {
                e = t.getAllFilterItems(true)
            }
            for (let i of e) {
                let e = t.determineControlByFilterItem(i);
                if (e) {
                    if (i._sControlId.indexOf("--inputFilter") > -1) {
                        e.removeAllTokens();
                        this._setFocus(e)
                    } else if (i._sControlId.indexOf("--inputTypeFilter") < 0) {
                        e.setValue("")
                    }
                }
            }
            this.clearMessages();
            let i = this._getPodSelectionModel();
            i.clear();
            this._oLogger.debug("onClear: POD Selection model cleared");
            this.firePodSelectionChangeEvent(i, true)
        },
        _setControlDefaultsFromArray: function(e, t) {
            if (t && t.length > 0) {
                for (let i of t) {
                    this._setControlDefaults(e, i, i)
                }
            }
        },
        _getJQueryLabelByPartialId: function(e) {
            return jQuery("label[id$='" + e + "']")
        },
        _setOptionalRequiredLabelStyle: function(e) {
            let t = sap.ui.core.theming.Parameters.get("sapUiPositive");
            let i = "-INTERNAL_GROUP-" + e.toUpperCase();
            let n = "<style>label[id$='" + i + "'].sapMesPodSelectionOptionalRequired > .sapMLabelColonAndRequired::after {color: " + t + ";}</style>";
            jQuery(n).appendTo("body");
            let o = this;
            setTimeout(function() {
                let e = o._getJQueryLabelByPartialId(i);
                if (e) {
                    e.addClass("sapMesPodSelectionOptionalRequired")
                }
            }, 0)
        },
        _setEnforcementOverrides(e, t, i, n) {
            if (e.type === "OPERATION" && t === "resource") {
                e[i] = "REQUIRED"
            }
        },
        _setControlDefaults: function(e, t, i) {
            let n = t + "FilterVisible";
            let o = t + "FilterLabel";
            let s = t + "FilterTooltip";
            let l = t + "FilterPlaceholder";
            let r = t + "FilterEnforcement";
            let a = t + "FilterMandatory";
            this._setEnforcementOverrides(e, t, r, i);
            if (e[n]) {
                if (!e[o] || e[o] === "") {
                    e[o] = this.getI18nText(i)
                }
                if (!e[s] || e[s] === "") {
                    e[s] = this.getI18nText(i + "Tooltip")
                }
                if (!e[l] || e[l] === "") {
                    e[l] = this.getI18nText(i + "Placeholder")
                }
                e[a] = false;
                if (e[r] && e[r] !== "") {
                    if (e[r] === "REQUIRED" || e[r] === "OPTIONAL_REQUIRED") {
                        e[a] = true;
                        if (e[r] === "OPTIONAL_REQUIRED") {
                            this._setOptionalRequiredLabelStyle(t)
                        }
                    }
                }
            } else {
                e[o] = "";
                e[s] = "";
                e[l] = "";
                e[a] = false
            }
        },
        _isRequiredValuesLoaded: function(e, t) {
            let i, n, o, s;
            let l = 0;
            for (i of t) {
                n = i + "FilterMandatory";
                o = i + "FilterVisible";
                s = i + "FilterEnforcement";
                if (e[o] && e[n] && e[s] === "REQUIRED") {
                    if (!e[i] || e[i] === "") {
                        return false
                    }
                    l++
                }
            }
            let r = 0;
            let a = 0;
            for (i of t) {
                n = i + "FilterMandatory";
                o = i + "FilterVisible";
                s = i + "FilterEnforcement";
                if (e[o] && e[n] && e[s] === "OPTIONAL_REQUIRED") {
                    r++;
                    if (!e[i] || e[i] === "") {
                        continue
                    }
                    a++
                }
            }
            if (l === 0 && r === 0) {
                return true
            }
            if (r > 0 && a === 0) {
                return false
            }
            return true
        },
        _validateRequiredValues: function(e, t) {
            return false
        },
        _doValidateRequiredValues: function(e, t, i) {
            if (!this._checkRequiredValues(e, t, i)) {
                return false
            }
            return this._checkOptionalRequiredValues(e, t, i)
        },
        _checkRequiredValues: function(e, t, i) {
            let n, o, s, l;
            for (let r of t) {
                n = r + "FilterMandatory";
                o = r + "FilterVisible";
                s = r + "FilterEnforcement";
                if (e[o] && e[n] && e[s] === "REQUIRED") {
                    if (!this._isValidRequiredValue(r)) {
                        l = this.getI18nText(r);
                        if (r === "input") {
                            l = this._getInputTypeLabel()
                        }
                        if (typeof i === "undefined" || !i) {
                            this.showErrorMessage(this.getI18nText("missingRequiredValue", [l]), false, false)
                        }
                        return false
                    }
                }
            }
            return true
        },
        _checkOptionalRequiredValues: function(e, t, i) {
            let n, o, s;
            let l = 0;
            let r = 0;
            for (let i of t) {
                n = i + "FilterMandatory";
                o = i + "FilterVisible";
                s = i + "FilterEnforcement";
                if (e[o] && e[n] && e[s] === "OPTIONAL_REQUIRED") {
                    l++;
                    if (!this._isValidRequiredValue(i)) {
                        continue
                    }
                    r++
                }
            }
            if (l > 0 && r === 0) {
                if (typeof i === "undefined" || !i) {
                    this.showErrorMessage(this.getI18nText("missingRequiredOptionalValue"), false, false)
                }
                return false
            }
            return true
        },
        _isValidRequiredValue: function(e) {
            let t = this.getView().byId(e + "Filter");
            if (t) {
                if (t.getTokens) {
                    if (t.getTokens().length > 0) {
                        return true
                    }
                }
                if (y.isEmpty(t.getValue())) {
                    return false
                }
                return true
            }
            return false
        },
        _getInputTypeLabel: function() {
            let e = this._getPodSelectionModel();
            let t = e.getInputType();
            if (t === r.ProcessLot) {
                return this.getI18nText("processLot")
            } else if (t === r.ShopOrder) {
                return this.getI18nText("shopOrder")
            } else if (t === r.Item || t === r.ItemVersion) {
                return this.getI18nText("item")
            } else if (t === r.Sfc) {
                return this.getI18nText("sfc")
            }
            return null
        },
        fireInputChangeEvent: function(e, t) {
            if (typeof this._bProcessingMainInputAction !== "undefined" && this._bProcessingMainInputAction) {
                this._bProcessingMainInputAction = false;
                return
            }
            let i = null;
            if (y.isNotEmpty(this._sServerNotificationEventType)) {
                i = this._sServerNotificationEventType;
                this._sServerNotificationEventType = null
            }
            this._bFiringChangeEvent = true;
            this.publish("InputChangeEvent", {
                source: this,
                newValue: e,
                oldValue: t,
                serverNotificationEvent: i
            });
            let n = this;
            setTimeout(function() {
                n._bFiringChangeEvent = null
            }, 300)
        },
        fireInputTypeChangeEvent: function(e, t) {
            this.publish("InputTypeChangeEvent", {
                source: this,
                newValue: e,
                oldValue: t
            });
            let i = this;
            setTimeout(function() {
                i._clearMultiInputTokens();
                i._processChange("inputFilter", "")
            }, 0)
        },
        fireOperationChangeEvent: function(e, t) {
            this.publish("OperationChangeEvent", {
                source: this,
                newValue: e,
                oldValue: t
            })
        },
        fireResourceChangeEvent: function(e, t) {
            this.publish("ResourceChangeEvent", {
                source: this,
                newValue: e,
                oldValue: t
            })
        },
        fireQuantityChangeEvent: function(e, t) {
            this.publish("QuantityChangeEvent", {
                source: this,
                newValue: e,
                oldValue: t
            })
        },
        firePodSelectionChangeEvent: function(e, t) {
            if (!this._bFiringChangeEvent) {
                this.publish("PodSelectionChangeEvent", {
                    source: this,
                    model: e,
                    clear: t
                })
            }
        },
        _delayedFirePodSelectionChangeEvent: function(e, t) {
            let i = this;
            setTimeout(function() {
                i.firePodSelectionChangeEvent(e, t)
            }, 1e3)
        },
        _onSfcModeWorklistSelectEvent: function(e, t, i) {
            this._onWorklistSelectEvent(e, t, i);
            let n = this;
            setTimeout(function() {
                n.publish("WorklistSelectEvent", i)
            }, 0)
        },
        _onWorklistSelectEvent: function(e, t, i) {
            if (this.isEventFiredByThisPlugin(i)) {
                return
            }
            let n = this.getView().byId("inputFilter");
            if (n) {
                let e = this._getPodSelectionModel();
                let t = null;
                if (i && i.selections) {
                    t = i.selections
                }
                if (!t || t.length === 0) {
                    let t = false;
                    if (i && i.clearInput || this.isSfcPodSelectionType()) {
                        t = true
                    }
                    if (typeof this._bDoNotClearInputOnWorklistSelectEvent !== "undefined" && this._bDoNotClearInputOnWorklistSelectEvent) {
                        t = false;
                        this._bDoNotClearInputOnWorklistSelectEvent = false
                    }
                    if (t) {
                        n.removeAllTokens();
                        e.setInputValue("");
                        this._setFocus(n);
                        this.clearWorkCenterField();
                        this.clearOperationField();
                        this._showSfcNotFoundMessage(e)
                    }
                    return
                }
                this._oMainInputValue = null;
                let o = e.getInputType();
                let s, l = [],
                    a = "";
                if (t.length > 0) {
                    for (let e of t) {
                        if (o === r.ProcessLot) {
                            s = e.processLot
                        } else if (o === r.ShopOrder) {
                            s = e.shopOrder
                        } else if (o === r.Item || o === r.ItemVersion) {
                            s = e.item
                        } else {
                            s = e.sfc
                        }
                        if (!this._isTextInArray(l, s)) {
                            l[l.length] = s
                        }
                    }
                    a = l[0];
                    if (l.length > 1) {
                        a = this.getI18nText("multipleSelections")
                    }
                }
                this._loadInputField(n, l);
                e.setInputValue(a);
                this.loadWorkCenterField(i);
                this.loadOperationField(i)
            }
        },
        _isTextInArray: function(e, t) {
            if (e && e.length > 0) {
                for (let i of e) {
                    if (i === t) {
                        return true
                    }
                }
            }
            return false
        },
        _showSfcNotFoundMessage: function(e) {
            let t = e.getPodType();
            if (t === a.WorkCenter && this.isSfcPodSelectionType() && y.isNotEmpty(this._oMainInputValue)) {
                let e = this.getPodController();
                let t = e.getI18nText("sfcDoesNotExist", [this._oMainInputValue]);
                this.showErrorMessage(t, true, true)
            }
            this._oMainInputValue = null
        },
        _loadInputField: function(e, t) {
            let i = [];
            if (t && t.length > 0) {
                for (let e of t) {
                    i[i.length] = new h({
                        text: e,
                        key: e
                    })
                }
            }
            if (i.length > 0) {
                e.setTokens(i)
            } else if (e.getTokens().length > 0) {
                e.removeAllTokens()
            }
        },
        clearWorkCenterField: function() {},
        loadWorkCenterField: function(e) {},
        clearOperationField: function() {},
        loadOperationField: function(e) {},
        onResourceChangeEvent: function(e, t, i) {
            if (this.isEventFiredByThisPlugin(i)) {
                return
            }
            let n = this.getView();
            if (!n) {
                return
            }
            let o = n.byId("resourceFilter");
            if (o) {
                o.setValue(i.newValue.getResource())
            }
        },
        changeResourceInPodSelectionModel: function(e) {
            let t = this._getPodSelectionModel();
            let n;
            if (t) {
                n = t.getResource()
            }
            if (y.isEmpty(e)) {
                t.setResource(null);
                this.fireResourceChangeEvent(null, n);
                this.setWaitToProcessOnSearch(false);
                return
            }
            return this._validateResource(e).then(function() {
                let o = new i(e);
                t.setResource(o);
                this.fireResourceChangeEvent(o, n);
                this.setWaitToProcessOnSearch(false)
            }.bind(this)).catch(function(i) {
                let o = this.getView().byId("resourceFilter");
                if (o) {
                    this._setFocus(o)
                }
                let s = this.getI18nText("invalidResourceValue", [e]);
                this.showErrorMessage(s, true, true);
                t.setResource(null);
                this.fireResourceChangeEvent(null, n);
                this.setWaitToProcessOnSearch(false)
            }.bind(this))
        },
        _validateResource: function(e) {
            let t = this;
            let i = new Promise(function(i, n) {
                let o = d.getCurrentPlant();
                let s = t.getPlantRestDataSourceUri() + "api/resource/v1/resources";
                s = s + "?plant=" + o + "&resource=" + V(e);
                t.ajaxGetRequest(s, null, function(e) {
                    if (e && e.length === 1) {
                        i()
                    }
                    n()
                }, function(e, t) {
                    let i = e || t;
                    n(i)
                })
            });
            return i
        },
        isSubscribingToNotifications: function() {
            return true
        },
        getNotificationMessageHandler: function(t) {
            switch (t) {
                case f.SFC_SELECT:
                    return this._handleSfcSelectedServerEvent;
                case f.SFC_START:
                    return this._handleSfcStartServerEvent
            }
            return e.prototype.getNotificationMessageHandler.call(this, t)
        },
        _handleSfcSelectedServerEvent: function(e) {
            this._sServerNotificationEventType = f.SFC_SELECT;
            let t = this.getI18nText("sfcselectnotificationtoast", [e.sfc, e.resource]);
            this._updateSfcSelectionField([e.sfc], t)
        },
        _handleSfcStartServerEvent: function(e) {
            this._sServerNotificationEventType = f.SFC_START;
            let t, i;
            if (this._isMultipleSfcsNotification(e)) {
                i = this.getI18nText("sfcstartnotificationtoastmulti", [e.sfcs[0], e.sfcs[e.sfcs.length - 1], e.operation])
            } else {
                t = this._getSfcFromNotificationMsg(e);
                i = this.getI18nText("sfcstartnotificationtoast", [t, e.operation])
            }
            this._updateSfcSelectionField(e.sfcs, i)
        },
        _updateSfcSelectionField: function(e, t) {
            if (this._mainSelectionFieldIsType(r.Sfc)) {
                let i = this.byId("inputFilter");
                this._loadInputField(i, e);
                this._updateModelAndRefreshWorklist(e, this._sServerNotificationEventType);
                let n = this;
                setTimeout(function() {
                    n.clearMessages();
                    n.showSuccessMessage(t, true, true)
                }, 0)
            }
        },
        _updateModelAndRefreshWorklist: function(e, t) {
            let i = this._getPodSelectionModel();
            let n = this._addInputValueToModel(i, e);
            this._fireWorklistRefreshEvent(n, t)
        },
        _fireWorklistRefreshEvent: function(e, t, i) {
            let n = {};
            n.source = this;
            n.sendToAllPages = true;
            n.sfcs = e;
            if (t) {
                n.serverNotificationEvent = t
            }
            if (typeof i !== "undefined" && i === true) {
                n.forceSelection = true
            }
            if (this._vTimerId) {
                clearTimeout(this._vTimerId)
            }
            let o = this;
            this._vTimerId = setTimeout(function() {
                o.publish("WorklistRefreshEvent", n)
            }, 1e3)
        },
        _isMultipleSfcsNotification: function(e) {
            if (!e.sfcs) {
                return false
            }
            return e.sfcs.length > 1
        },
        _getSfcFromNotificationMsg: function(e) {
            if (e.sfcs) {
                return e.sfcs[0]
            } else {
                return e.sfc
            }
        },
        _mainSelectionFieldIsType: function(e) {
            let t = this._getPodSelectionModel().getInputType();
            return t === e
        },
        assignTaboutOrEnterEvents: function(e, t) {
            if (t && t.mainInputActionButtonId) {
                let i = this.getView().byId(e);
                i.onsapenter = e => {
                    this._handleTaboutOrEnterAction(e, t, i)
                };
                i.onsaptabnext = e => {
                    this._handleTaboutOrEnterAction(e, t, i)
                }
            }
        },
        _focusNextInputField: function(e, t) {
            for (let i = 0; i < t.length; i++) {
                if (e.activeElement.id === t[i].id && i + 1 < t.length) {
                    t[i + 1].focus();
                    break
                }
            }
        },
        _updatePodSelectionModel: function(e) {
            let t = this._getPodSelectionModel();
            let i = this._addInputValueToModel(t, e);
            return i
        },
        _updateManualSfcEntry: function(e) {
            let t = e.getValue();
            let i = e.getTokens();
            if (t) {
                this._updatePodSelectionModel(t)
            } else if (i && i.length === 1) {
                t = [];
                for (let e of i) {
                    t[t.length] = e.getKey()
                }
                this._updatePodSelectionModel(t)
            }
            return t
        },
        _handleMainInputAction: function(e, t) {
            let i = this;
            this.executeActionButton(t.mainInputActionButtonId, function() {
                setTimeout(function() {
                    i._bDoNotClearInputOnWorklistSelectEvent = true;
                    i._fireWorklistRefreshEvent(e, i._sServerNotificationEventType, true)
                }, 600)
            })
        },
        _handleTaboutOrEnterAction: function(e, t, i) {
            this.excuteActionButton = false;
            if (!t || y.isEmpty(t.mainInputActionButtonId)) {
                return
            }
            let n = e.keyCode || e.which;
            if (n !== 13 && n !== 9) {
                return
            }
            if (i.getValue && i.getValue().length === 0 && (i.getTokens && i.getTokens().length === 0)) {
                return
            }
            let o = this._updateManualSfcEntry(i);
            let s = this._updatePodSelectionModel(o);
            if (n === 9 || n === 13) {
                if (n === 13) {
                    let e = $(":input");
                    this._focusNextInputField(document, e)
                }
                this._bProcessingMainInputAction = true;
                this.setExecuteActionDelay(-1);
                let e = this.isSfcPodSelectionType();
                this._sfcPodHandleMainInputAction(e, s, t)
            }
        },
        _invokeMainInputActionSfcPod: function(e) {
            let t = this;
            return t.awaitConditionOrTimeout(10, 500, function() {
                return t._checkResourceOperationUpdatedInModel()
            }).then(function(i) {
                if (i) {
                    t._executeMainInputActionSfcPod(e);
                    t._oLogger.debug("_invokeMainInputActionSfcPod - resource LOADED");
                    return true
                } else {
                    t._oLogger.debug("_invokeMainInputActionSfcPod - resource NOT LOADED");
                    return false
                }
            })
        },
        _executeMainInputActionSfcPod: function(e) {
            if (e) {
                this._oLogger.debug("_executeMainInputActionSfcPod - isSfcPodSelectionType='" + e + "'");
                if (!y.isEmpty(this._oConfiguration.mainInputActionButtonId) && !this._processedActionButton) {
                    let e = this;
                    let t = function() {
                        e._processedActionButton = true
                    };
                    let i = this.getPodSelectionModel();
                    let n = i.getResource();
                    this._oLogger.debug("_executeMainInputActionSfcPod executeActionButton was called.  Resource was '" + n + "'");
                    this.executeActionButton(e._oConfiguration.mainInputActionButtonId, t)
                }
            }
        },
        _sfcPodHandleMainInputAction(e, t, i) {
            this._processedActionButton = false;
            if (e) {
                let e = this;
                e._fireWorklistRefreshEvent(t, e._sServerNotificationEventType, true);
                return
            }
            let n = this;
            setTimeout(function() {
                n._handleMainInputAction(t, i)
            }, 0)
        },
        setExecuteActionDelay: function(e) {
            this.getPodController().setExecuteActionDelay(e)
        },
        _initializeWorklistType: function(e) {
            const t = this.getPodConfiguration();
            if (!t || !t.plugins || t.plugins.length === 0) {
                return
            }
            let i = false;
            for (let e of t.plugins) {
                if (e.id.startsWith("worklistPlugin")) {
                    i = true;
                    break
                }
            }
            if (!i) {
                let t = e.getInputType();
                e.setWorklistType(t)
            }
        },
        onSfcValueHelp: function(e) {
            let t = this.getSfcBrowseValueHelp();
            t.open(e)
        },
        processSfcBrowseSelection: function(e, t) {
            this._loadInputField(e, t);
            this._processChange(e.getId(), t)
        },
        onResourceValueHelp: function(e) {
            let t = this.getResourceBrowseValueHelp();
            t.open(e)
        },
        processResourceBrowseSelection: function(e, t) {
            let i = this._toUpperCase(t.name);
            e.setValue(i);
            this.changeResourceInPodSelectionModel(i)
        },
        onOperationActivityValueHelp: function(e) {
            if (!this.isSfcPodSelectionType()) {
                this.onOpenOperationActivityBrowse(e)
            } else {
                this.onOpenSfcOperationBrowse(e)
            }
        },
        onOpenOperationActivityBrowse: function(e) {
            let t = this.getOperationActivityBrowseValueHelp();
            t.open(e)
        },
        onOpenSfcOperationBrowse: function(e) {
            let t = this.getSfcOperationBrowseValueHelp();
            let i = e.getSource();
            let n = this._oPodModelEventHandler.getOperations();
            t.onSfcOperationValueHelp(i, n)
        },
        processOperationBrowseSelection: function(e, t) {
            let i = this._toUpperCase(t.name);
            let n = t.ref;
            e.setValue(i);
            this.changeOperationActivityInPodSelectionModel(i, n)
        },
        changeOperationActivityInPodSelectionModel: function(e, t) {},
        onWorkCenterValueHelp: function(e) {
            let t = this.getWorkCenterBrowseValueHelp();
            t.open(e)
        },
        processWorkCenterBrowseSelection: function(e, t) {
            let i = this._toUpperCase(t.name);
            e.setSelectedKey(t.ref);
            e.setValue(i);
            this._processChange(e.getId(), i)
        },
        onWorkCenterResourceValueHelp: function(e, t) {
            let i = this.getWorkCenterResourceBrowseValueHelp();
            i.open(e, t)
        },
        processWorkCenterResourceBrowseSelection: function(e, t) {
            let i = this._toUpperCase(t.name);
            e.setValue(i);
            this.changeResourceInPodSelectionModel(i)
        },
        getSfcBrowseValueHelp: function() {
            if (!this._oSfcBrowseValueHelp) {
                this._oSfcBrowseValueHelp = this.createSfcBrowseValueHelp()
            }
            return this._oSfcBrowseValueHelp
        },
        createSfcBrowseValueHelp: function() {
            return new C(this, {
                tableSelectMode: "SingleSelectMaster",
                statusExcludes: ["DONE"]
            })
        },
        getResourceBrowseValueHelp: function() {
            if (!this._oResourceBrowseValueHelp) {
                this._oResourceBrowseValueHelp = this.createResourceBrowseValueHelp()
            }
            return this._oResourceBrowseValueHelp
        },
        createResourceBrowseValueHelp: function() {
            return new P(this, {})
        },
        getOperationActivityBrowseValueHelp: function() {
            if (!this._oOperationActivityBrowseValueHelp) {
                this._oOperationActivityBrowseValueHelp = this.createOperationActivityBrowseValueHelp()
            }
            return this._oOperationActivityBrowseValueHelp
        },
        createOperationActivityBrowseValueHelp: function() {
            return new w(this, {})
        },
        getSfcOperationBrowseValueHelp: function() {
            if (!this._oSfcOperationBrowseValueHelp) {
                this._oSfcOperationBrowseValueHelp = this.createSfcOperationBrowseValueHelp()
            }
            return this._oSfcOperationBrowseValueHelp
        },
        createSfcOperationBrowseValueHelp: function() {
            return new m(this, {})
        },
        getWorkCenterBrowseValueHelp: function() {
            if (!this._oWorkCenterBrowseValueHelp) {
                this._oWorkCenterBrowseValueHelp = this.createWorkCenterBrowseValueHelp()
            }
            return this._oWorkCenterBrowseValueHelp
        },
        createWorkCenterBrowseValueHelp: function() {
            return new F(this, {})
        },
        getWorkCenterResourceBrowseValueHelp: function() {
            if (!this._oWorkCenterResourceBrowseValueHelp) {
                this._oWorkCenterResourceBrowseValueHelp = this.createWorkCenterResourceBrowseValueHelp()
            }
            return this._oWorkCenterResourceBrowseValueHelp
        },
        createWorkCenterResourceBrowseValueHelp: function() {
            return new E(this, {})
        },
        getSfcPodHelper: function() {
            if (!this._oSfcPodHelper) {
                this._oSfcPodHelper = new b(this)
            }
            return this._oSfcPodHelper
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ColumnPropertyEditorController", ["sap/ui/core/library", "sap/ui/core/mvc/Controller", "sap/ui/core/ValueState", "sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, t, i, n, r) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.controller.ColumnPropertyEditorController", {
        beforeOpen: function() {
            let e = this.getEditorTable();
            e.setModel(this._oTableModel)
        },
        getEditorTable: function() {
            return sap.ui.getCore().byId("columnPropertyEditorTable")
        },
        setTableModel: function(e) {
            this._oTableModel = e
        },
        setCloseHandler: function(e, t) {
            this._fnCloseHandler = e;
            this._oFnContext = t
        },
        _handleColumnPropertyEditorDialogClose: function(e) {
            let t = false;
            if (e && e.escPressed) {
                t = e.escPressed
            }
            let i = this.getEditorTable();
            let n = i.getModel();
            let r = n.getData();
            let l = true;
            if (!this._validateColumnPropertyValues(r)) {
                if (!t) {
                    return
                } else {
                    l = false
                }
            }
            this._fnCloseHandler.call(this._oFnContext, r, l)
        },
        _validateColumnPropertyValues: function(e) {
            if (!e || !e.ColumnConfiguration || e.ColumnConfiguration.length === 0) {
                return true
            }
            for (let t of e.ColumnConfiguration) {
                if (r.isNotEmpty(t.width)) {
                    if (!this._isValidCSS("width", t.width)) {
                        return false
                    }
                }
                if (r.isNotEmpty(t.minScreenWidth)) {
                    if (!this._validateMinimumScreenSize(t.minScreenWidth)) {
                        return false
                    }
                }
                delete t.hAlignValue;
                delete t.vAlignValue
            }
            return true
        },
        _validateMinimumScreenSize: function(e) {
            if (r.isEmpty(e)) {
                return true
            }
            if (!this._isValidCSS("width", e) && e !== "Phone" && e !== "Desktop" && e !== "Tablet" && e !== "Large" && e !== "Medium" && e !== "Small" && e !== "XLarge" && e !== "XXLarge" && e !== "XSmall" && e !== "XXSmall") {
                return false
            }
            return true
        },
        _onWidthChange: function(e) {
            let t = e.getSource();
            if (!t) {
                return
            }
            let n = t.getValue();
            if (r.isNotEmpty(n) && !this._isValidCSS("width", n)) {
                t.setValueState(i.Error);
                let e = this._getI18nText("message.invalidColumnWidthValueInput");
                t.setValueStateText(e);
                t.focus();
                return false
            }
            t.setValueState(i.None);
            t.setValueStateText(null);
            return true
        },
        _onMinScreenWidthChange: function(e) {
            let t = e.getSource();
            if (!t) {
                return
            }
            let n = t.getValue();
            if (r.isNotEmpty(n) && !this._validateMinimumScreenSize(n)) {
                t.setValueState(i.Error);
                let e = this._getI18nText("message.invalidMinScreenWidthValueInput");
                t.setValueStateText(e);
                t.focus();
                return false
            }
            t.setValueState(i.None);
            t.setValueStateText(null);
            return true
        },
        _isValidCSS: function(t, i) {
            return e.CSSSize.isValid(i) && !this._isNumber(i) && !this._endsWith(i, "%")
        },
        _isNumber: function(e) {
            if (r.isEmpty(e)) {
                return false
            }
            if (typeof e === "number" || !isNaN(e)) {
                return true
            }
            return false
        },
        _endsWith: function(e, t) {
            if (r.isEmpty(e) || r.isEmpty(t)) {
                return false
            }
            let i = e.length;
            return e.substring(i - t.trim().length, i) === t.trim()
        },
        _getI18nText: function(e, t) {
            return n.getPropertyEditorText(e, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/InputParameterTableController", ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/dm/dme/i18n/i18nBundles"], function(e, t, a) {
    "use strict";
    var o = e.extend("sap.dm.dme.podfoundation.controller.InputParameterTableController", {
        getEditorTable: function() {
            return sap.ui.getCore().byId("inputParameterTable")
        },
        setModels: function(e, t) {
            this._oTableModel = e;
            this._oI18nModel = t
        },
        onAddInputParameter: function() {
            var e = this._oTableModel.getData().parameters.length;
            var t = this._oTableModel.getData().parameters;
            if (e < 4) {
                t.push({
                    id: e + 1,
                    name: "",
                    value: ""
                });
                this._oTableModel.setData({
                    parameters: t
                });
                this.getEditorTable().setModel(this._oTableModel)
            } else {
                this.showErrorMessage(this._getI18nText("message.maxAllowedParams"))
            }
        },
        onRemoveParam: function(e) {
            var t = this._oTableModel.getData().parameters;
            var a = e.getSource().getBindingContext("oTableModel").getObject();
            t.splice(a.id - 1, 1);
            for (var o = 0; o < t.length; o++) {
                t[o].id = o + 1
            }
            this._oTableModel.setData({
                parameters: t
            });
            this.getEditorTable().setModel(this._oTableModel)
        },
        showErrorMessage: function(e) {
            t.error(e)
        },
        _getI18nText: function(e, t) {
            return a.getPropertyEditorText(e, t)
        }
    });
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ListColumnEditorController", ["sap/ui/core/syncStyleClass", "sap/ui/model/resource/ResourceModel", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/controller/BaseAssignmentListController", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, t, s, i, a, n, o) {
    "use strict";
    var l = n.extend("sap.dm.dme.podfoundation.controller.ListColumnEditorController", {
        beforeOpen: function(e) {
            var t = this.getAvailableTable();
            t.setModel(this._oAssignmentModel);
            t = this.getAssignedTable();
            t.setModel(this._oAssignmentModel)
        },
        afterOpen: function(e) {
            this.moveAvailableToAssigned()
        },
        setAssignmentModel: function(e) {
            this._oAssignmentModel = e
        },
        setListName: function(e) {
            this._sListName = e
        },
        setSaveHandler: function(e, t) {
            this._fnSaveHandler = e;
            this._oFnContext = t
        },
        setCancelHandler: function(e, t) {
            this._fnCancelHandler = e;
            this._oFnContext = t
        },
        handleListNameChange: function(e) {
            var t = e.getSource();
            if (t) {
                var s = t.getValue();
                if (jQuery.trim(s)) {
                    t.setValue(s.toUpperCase())
                }
            }
        },
        _onSortOrderLiveChange: function(e) {
            var t = e.getSource();
            var s = t.getValue();
            s = s.replace(/[^\d]/g, "");
            t.setValue(s)
        },
        _handleListColumnEditorDialogSave: function(e) {
            var t = this.getAssignedTable();
            var s = t.getModel();
            var i = s.getData();
            var n = i.listName;
            if (o.isEmpty(n)) {
                this.showErrorMessage(this.getI18nText("message.listNameRequiredMessage"));
                return
            }
            if (o.isEmpty(this.getListType())) {
                this.showErrorMessage(this.getI18nText("message.listTypeRequiredMessage"));
                return
            }
            var l = a.cloneObject(i);
            var r = l;
            r.columns = this._getAssignedColumns(l.columns);
            if (!this._checkDuplicateSortOrder(r.columns)) {
                this.showErrorMessage(this.getI18nText("message.duplicateSortOrderValues"));
                return
            }
            if (!this._sListName || this._sListName !== n) {
                this._createNewList(n, r)
            } else {
                this._updateExistingList(n, r)
            }
        },
        _createNewList: function(e, t) {
            var s = this.getListMaintenanceService();
            return s.createNewList(e, t).then(function() {
                this._fnSaveHandler.call(this._oFnContext, e, t.description)
            }.bind(this)).catch(function(e) {
                this._handleListSaveError(e)
            }.bind(this))
        },
        _updateExistingList: function(e, t) {
            const s = this.getListMaintenanceService();
            return s.updateExistingList(e, t).then(function() {
                this._fnSaveHandler.call(this._oFnContext, e, t.description)
            }.bind(this)).catch(function(e) {
                this._handleListSaveError(e)
            }.bind(this))
        },
        _handleListSaveError: function(e) {
            let t;
            if (e.nHttpStatus === 403) {
                let e = this.getMainView().getController().getI18nText("appTitle");
                t = this.getGlobalI18nText("message.errorNoAccessToModifyData", e)
            } else {
                t = this.getI18nText("message.listUpdateUnknownError")
            }
            this.showAjaxErrorMessage(t, e.oResponse)
        },
        _checkDuplicateSortOrder: function(e) {
            if (!e || e.length === 0) {
                return true
            }
            var t, s, i, a;
            for (t = 0; t < e.length; t++) {
                i = e[t].sortOrder;
                if (typeof i === "string") {
                    if (e[t].sortOrder === "") {
                        e[t].sortOrder = null
                    } else {
                        e[t].sortOrder = parseInt(i, 10)
                    }
                }
            }
            for (t = 0; t < e.length; t++) {
                i = e[t].sortOrder;
                if (typeof i !== "number") {
                    continue
                }
                if (t < e.length - 1) {
                    for (s = t + 1; s < e.length; s++) {
                        a = e[s].sortOrder;
                        if (typeof a === "number") {
                            if (i === a) {
                                return false
                            }
                        }
                    }
                }
            }
            return true
        },
        _getAssignedColumns: function(e) {
            e.sort(function(e, t) {
                if (e.Rank === t.Rank) {
                    return 0
                }
                if (e.Rank < t.Rank) {
                    return 1
                }
                return -11
            });
            var t = [];
            var s = 0;
            for (var i = 0; i < e.length; i++) {
                if (e[i].Rank > 0) {
                    s = s + 10;
                    t[t.length] = {
                        columnId: e[i].columnId,
                        description: e[i].description,
                        sequence: s,
                        sortOrder: e[i].sortOrder
                    }
                }
            }
            return t
        },
        _handleListColumnEditorDialogCancel: function(e) {
            this._fnCancelHandler.call(this._oFnContext)
        },
        _showColumnDetails: function(e) {
            this.sColumnDetailsDialogColumnName = this._getColumnNameForColumnDetails(e);
            var t = "100px";
            var s = "270px";
            var i = "";
            var a = "";
            var n = [];
            if (this.sColumnDetailsDialogColumnName === "STATUS") {
                i = this.getI18nText("statusDialogTitle");
                a = this.getI18nText("statusDialogColumnTitle");
                n = this._getStatusNames()
            } else if (this.sColumnDetailsDialogColumnName === "STATUS_ICON") {
                i = this.getI18nText("statusIconDialogTitle");
                a = this.getI18nText("statusIconDialogColumnTitle");
                n = this._getStatusNames()
            }
            this.showColumnDetailsDialog(n, i, a, t, s)
        },
        _getColumnNameForColumnDetails: function(e) {
            var t = this.getAssignedTable();
            var s = t.getModel();
            var i = e.getSource().getBindingContext().getPath();
            var a = s.getProperty(i);
            return a.columnId
        },
        showColumnDetailsDialog: function(e, i, a, n, o) {
            var l = {
                contentWidth: n,
                contentHeight: o,
                visibleRowCount: e.length,
                title: i,
                columnTitle: a,
                Details: e
            };
            this._oCddModel = new s;
            this._oCddModel.setData(l);
            this._oCddDetailsDialog = this._getDetailsDialogFragment();
            var r = new t({
                bundleName: "sap.dm.dme.i18n.propertyEditor"
            });
            this._oCddDetailsDialog.setModel(r, "cddI18n");
            var d = new t({
                bundleName: "sap.dm.dme.i18n.global"
            });
            this._oCddDetailsDialog.setModel(d, "i18n-global");
            this._oCddDetailsDialog.setModel(this._oCddModel);
            var u = this;
            this._oCddDetailsDialog.setEscapeHandler(function(e) {
                u._handleColumnDetailsDialogCancel();
                e.resolve()
            });
            this.getMainView().addDependent(this._oCddDetailsDialog);
            this._openColumnDetailsDialog(this._oCddDetailsDialog)
        },
        _getDetailsDialogFragment: function() {
            return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ColumnDetailsDialog", this)
        },
        _openColumnDetailsDialog: function(t) {
            e("sapUiSizeCompact", this.getMainView(), t);
            t.open()
        },
        _handleColumnDetailsDialogApply: function(e) {
            var t = this._byId("columnDetailsDialogTable");
            var s = t.getModel();
            var i = s.getData();
            t = this.getAssignedTable();
            var a = t.getModel();
            var n = a.getData();
            if (this.sColumnDetailsDialogColumnName === "STATUS" || this.sColumnDetailsDialogColumnName === "STATUS_ICON") {
                n.statusData.showActive = i.Details[0].selected;
                n.statusData.showHold = i.Details[1].selected;
                n.statusData.showInQueue = i.Details[2].selected;
                n.statusData.showNew = i.Details[3].selected
            }
            a.refresh();
            this._handleColumnDetailsDialogCancel()
        },
        _handleColumnDetailsDialogCancel: function() {
            this._oCddDetailsDialog.close();
            this._oCddModel.destroy();
            this._oCddDetailsDialog.destroy();
            this._oCddDetailsDialog = null
        },
        _getStatusNames: function() {
            var e = this.getAssignedTable();
            var t = e.getModel();
            var s = t.getData();
            return this._getStatusNamesFromTableModelData(s)
        },
        _getStatusNamesFromTableModelData: function(e) {
            var t = [];
            t[t.length] = {
                name: this.getGlobalI18nText("active"),
                selected: e.statusData.showActive
            };
            t[t.length] = {
                name: this.getGlobalI18nText("hold"),
                selected: e.statusData.showHold
            };
            t[t.length] = {
                name: this.getGlobalI18nText("inQueue"),
                selected: e.statusData.showInQueue
            };
            t[t.length] = {
                name: this.getGlobalI18nText("new"),
                selected: e.statusData.showNew
            };
            return t
        },
        _byId: function(e) {
            return sap.ui.getCore().byId(e)
        }
    });
    return l
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ListNameSearchController", ["sap/ui/core/syncStyleClass", "sap/ui/model/resource/ResourceModel", "sap/ui/model/json/JSONModel", "sap/dm/dme/podfoundation/controller/BaseListMaintenanceController", "sap/dm/dme/podfoundation/controller/ListColumnEditorController"], function(e, o, t, l, i) {
    "use strict";
    return l.extend("sap.dm.dme.podfoundation.controller.ListNameSearchController", {
        beforeOpen: function() {
            var e = sap.ui.getCore().byId("listNameSearchTable");
            e.setModel(this._oTableModel);
            this.setInitialSelection(e)
        },
        setInitialSelection: function(e) {
            if (!this._sCurrentListName) {
                return
            }
            var o = this._oTableModel.getData();
            if (!o || !o.ListNames) {
                return
            }
            var t = e.getItems();
            o.ListNames.some(function(o, l) {
                var i = this._sCurrentListName === o.listName;
                if (i && l < t.length) {
                    e.setSelectedItem(t[l])
                }
                return i
            }.bind(this))
        },
        setTableModel: function(e) {
            this._oTableModel = e
        },
        setCurrentListName: function(e) {
            this._sCurrentListName = e
        },
        setColumnEditorDetails: function(e) {
            this._aColumnEditorDetails = e
        },
        setConfirmHandler: function(e, o) {
            this._fnConfirmHandler = e;
            this._oFnContext = o
        },
        setCancelHandler: function(e, o) {
            this._fnCancelHandler = e;
            this._oFnContext = o
        },
        _handleListNameDialogConfirm: function(e) {
            var o = sap.ui.getCore().byId("listNameSearchTable");
            var t = o.getSelectedItem();
            var l = t.getBindingContext().getPath();
            var i = o.getModel();
            var s = i.getProperty(l);
            this._fnConfirmHandler.call(this._oFnContext, s.listName)
        },
        _handleListNameDialogCancel: function(e) {
            this._fnCancelHandler.call(this._oFnContext)
        },
        _handleListNameDialogNew: function(e) {
            var o = {
                listType: this.getListType(),
                listName: "",
                worklistType: "SFC",
                description: "",
                maximumNumberOfRow: 100,
                allowOperatorToChangeColumnSequence: false,
                allowOperatorToSortRows: false,
                allowMultipleSelection: false,
                statusData: {
                    showActive: true,
                    showHold: true,
                    showInQueue: true,
                    showNew: true
                },
                maxRowPerPage: null,
                listIcons: {
                    showBuyOff: false,
                    showCollectParentNumber: false,
                    showComponent: false,
                    showDataCollection: false,
                    showTool: false,
                    showWorkInstruction: false
                },
                showChangeAlert: false,
                columns: []
            };
            var t = null;
            if (o.listType === "POD_WORKLIST") {
                t = ["ITEM", "SHOP_ORDER"]
            }
            var l = this.getListMaintenanceService();
            return l.getCustomColumns(t).then(function(e) {
                this.showListColumnEditorDialog(o, e, this.getMainView(), this.getListType(), "", this._aColumnEditorDetails)
            }.bind(this))
        },
        _showDetails: function(e) {
            var o = sap.ui.getCore().byId("listNameSearchTable");
            var t = o.getModel();
            var l = e.getSource().getBindingContext().getPath();
            var i = t.getProperty(l).listName;
            var s = this.getListType();
            var n = null;
            if (s === "POD_WORKLIST") {
                n = ["ITEM", "SHOP_ORDER"]
            }
            var a = this.getListMaintenanceService();
            return a.getListConfiguration(s, i).then(function(e) {
                return a.getCustomColumns(n).then(function(o) {
                    this.showListColumnEditorDialog(e, o, this.getMainView(), s, i, this._aColumnEditorDetails)
                }.bind(this))
            }.bind(this)).catch(function(e) {
                var o = this.getI18nText("message.listSearchUnknownError");
                this.showAjaxErrorMessage(o, e)
            }.bind(this))
        },
        _addAvailableCustomDataColumns: function(e, o) {},
        showListColumnEditorDialog: function(e, o, l, s, n, a) {
            this._oLceDialogController = new i;
            this._oLceDialogController.setAvailableTableId("availableColumnsTable");
            this._oLceDialogController.setAssignedTableId("listColumnEditorTable");
            this._oLceDialogController.setAvailableKeyId("columnId");
            this._oLceDialogController.setAssignedKeyId("columnId");
            var r = this._getAvailableColumns(e, o, a);
            e.columns.sort(function(e, o) {
                if (e.sequence > o.sequence) {
                    return 1
                } else if (o.sequence > e.sequence) {
                    return -1
                }
                return 0
            });
            var u = [];
            for (var c = 0; c < e.columns.length; c++) {
                for (var m = 0; m < r.columns.length; m++) {
                    if (e.columns[c].columnId === r.columns[m].columnId) {
                        u[u.length] = e.columns[c];
                        break
                    }
                }
            }
            this._oLceModel = new t;
            this._oLceModel.setData(r);
            this._oLceDialogController.setAssignmentModel(this._oLceModel);
            this._oLceDialogController.setAssignedColumns(u);
            this._oLceDialogController.setMainView(l);
            this._oLceDialogController.setListType(s);
            this._oLceDialogController.setListName(n);
            this._oLceDialogController.setSaveHandler(this._handleListColumnEditorDialogSave, this);
            this._oLceDialogController.setCancelHandler(this._handleListColumnEditorDialogCancel, this);
            this._oLceDialogDialog = this._createListColumnEditorDialog(l, this._oLceDialogController);
            this._oLceDialogDialog.attachBeforeOpen(this._oLceDialogController.beforeOpen, this._oLceDialogController);
            this._oLceDialogDialog.attachAfterOpen(this._oLceDialogController.afterOpen, this._oLceDialogController);
            var h = new sap.ui.model.resource.ResourceModel({
                bundleName: "sap.dm.dme.i18n.propertyEditor"
            });
            this._oLceDialogDialog.setModel(h, "lceI18n");
            var d = new sap.ui.model.resource.ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            this._oLceDialogDialog.setModel(d, "i18n-global");
            this._oLceDialogDialog.setModel(this._oLceModel);
            var f = this;
            this._oLceDialogDialog.setEscapeHandler(function(e) {
                f._handleListColumnEditorDialogCancel();
                e.resolve()
            });
            l.addDependent(this._oLceDialogDialog);
            this._oLceDialogDialog.open()
        },
        _createListColumnEditorDialog: function(o, t) {
            var l = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ListColumnEditorDialog", t);
            e("sapUiSizeCompact", o, l);
            return l
        },
        _getAvailableColumns: function(e, o, t) {
            var l = {
                WorklistTypes: this._getWorklistTypes(),
                showMaximumNumberOfRows: false,
                showAllowMultipleSelection: false,
                allowOperatorToChangeColumnSequence: false,
                allowOperatorToSortRows: false,
                showWorklistType: false,
                showGlobalListFields: true,
                globalListSpacerWidth: "150px",
                showOperatorChangeColumnOrder: false,
                showOperatorChangeSortOrder: false,
                showOrderingOptions: false,
                showSortOrderColumn: true,
                showDetailsColumn: true,
                orderingOptionsSpacerWidth1: "200px",
                orderingOptionsSpacerWidth2: "20px",
                columns: []
            };
            var i;
            if (t && t.columns && t.columns.length > 0) {
                var s = 0;
                if (typeof t.showMaximumNumberOfRows !== "undefined" && t.showMaximumNumberOfRows) {
                    l.showMaximumNumberOfRows = t.showMaximumNumberOfRows;
                    s++
                }
                if (typeof t.showAllowMultipleSelection !== "undefined" && t.showAllowMultipleSelection) {
                    l.showAllowMultipleSelection = t.showAllowMultipleSelection;
                    s++
                }
                if (typeof t.showWorklistType !== "undefined" && t.showWorklistType) {
                    l.showWorklistType = t.showWorklistType;
                    s++
                }
                if (s === 0) {
                    l.showGlobalListFields = false
                } else if (s === 1) {
                    l.globalListSpacerWidth = "350px"
                } else if (s === 2) {
                    l.globalListSpacerWidth = "250px"
                }
                s = 0;
                if (typeof t.showOperatorChangeColumnOrder !== "undefined" && t.showOperatorChangeColumnOrder) {
                    l.showOperatorChangeColumnOrder = t.showOperatorChangeColumnOrder;
                    s++
                }
                if (typeof t.showOperatorChangeSortOrder !== "undefined" && t.showOperatorChangeSortOrder) {
                    l.showOperatorChangeSortOrder = t.showOperatorChangeSortOrder;
                    s++
                }
                if (s > 0) {
                    l.showOrderingOptions = true;
                    if (s === 1) {
                        l.orderingOptionsSpacerWidth2 = "0px";
                        if (l.showOperatorChangeColumnOrder) {
                            l.orderingOptionsSpacerWidth1 = "300px"
                        } else {
                            l.orderingOptionsSpacerWidth1 = "350px"
                        }
                    }
                }
                if (typeof t.hideSortOrderColumn !== "undefined") {
                    l.showSortOrderColumn = !t.hideSortOrderColumn
                }
                if (typeof t.hideDetailsColumn !== "undefined") {
                    l.showDetailsColumn = !t.hideDetailsColumn
                }
                if (e) {
                    l.listType = e.listType;
                    l.listName = e.listName;
                    l.worklistType = e.worklistType;
                    l.description = e.description;
                    if (typeof e.maximumNumberOfRow === "undefined" || !e.maximumNumberOfRow) {
                        l.maximumNumberOfRow = 100
                    } else {
                        l.maximumNumberOfRow = e.maximumNumberOfRow
                    }
                    l.allowOperatorToChangeColumnSequence = e.allowOperatorToChangeColumnSequence;
                    l.allowOperatorToSortRows = e.allowOperatorToSortRows;
                    l.allowMultipleSelection = e.allowMultipleSelection;
                    l.statusData = e.statusData;
                    l.maxRowPerPage = e.maxRowPerPage;
                    l.listIcons = e.listIcons;
                    l.showChangeAlert = e.showChangeAlert
                }
                if (!l.statusData) {
                    l.statusData = {
                        showActive: true,
                        showHold: true,
                        showInQueue: true,
                        showNew: true
                    }
                }
                if (!l.listIcons) {
                    l.listIcons = {
                        showBuyOff: false,
                        showCollectParentNumber: false,
                        showComponent: false,
                        showDataCollection: false,
                        showTool: false,
                        showWorkInstruction: false
                    }
                }
                this._loadColumnData(t, l, o)
            }
            this._loadDisplayEditFlags(l, t);
            return l
        },
        _loadColumnData: function(e, o, t) {
            var l, i, s, n;
            for (l = 0; l < e.columns.length; l++) {
                i = e.columns[l].name;
                s = e.columns[l].description;
                this._addAvailableColumn(o, i, s)
            }
            if (t && t.length > 0) {
                for (l = 0; l < t.length; l++) {
                    if (t[l].columnId.indexOf(".") > 0) {
                        n = this.getI18nText("customDataFieldLabelPrefix_" + t[l].tableName);
                        i = t[l].columnId;
                        s = n + t[l].columnLabel;
                        this._addAvailableColumn(o, i, s, false)
                    }
                }
            }
        },
        _isSortableColumn: function(e, o) {
            var t = ["ITEM_GROUP"];
            for (var l = 0; l < t.length; l++) {
                if (e === t[l]) {
                    return false
                }
            }
            return true
        },
        _addAvailableColumn: function(e, o, t, l) {
            var i = e.showSortOrderColumn;
            if (typeof l !== "undefined") {
                i = l
            } else {
                i = this._isSortableColumn(o, l)
            }
            e.columns[e.columns.length] = {
                columnId: o,
                description: t,
                Rank: this._oLceDialogController.config.initialRank,
                sequence: null,
                sortOrder: null,
                showSortField: i,
                sequenceEditable: true,
                sortOrderEditable: true,
                columnIdButtonEnabled: false,
                columnIdEditable: false,
                detailsVisible: false,
                switchVisible: false
            }
        },
        _loadDisplayEditFlags: function(e, o) {
            if (!e.columns || e.columns.length === 0) {
                return
            }
            for (var t = 0; t < e.columns.length; t++) {
                if (o.infoColumn && e.columns[t].columnId === o.infoColumn.name) {
                    if (o.infoColumn.controlType === "DETAIL_ICON") {
                        e.columns[t].detailsVisible = true
                    } else if (o.infoColumn.controlType === "SWITCH") {
                        e.columns[t].switchVisible = true
                    }
                } else if (o.statusColumn && e.columns[t].columnId === o.statusColumn.name) {
                    if (o.statusColumn.controlType === "DETAIL_ICON") {
                        e.columns[t].detailsVisible = true
                    } else if (o.statusColumn.controlType === "SWITCH") {
                        e.columns[t].switchVisible = true
                    }
                } else if (o.statusIconColumn && e.columns[t].columnId === o.statusIconColumn.name) {
                    if (o.statusIconColumn.controlType === "DETAIL_ICON") {
                        e.columns[t].detailsVisible = true
                    } else if (o.statusIconColumn.controlType === "SWITCH") {
                        e.columns[t].switchVisible = true
                    }
                } else if (o.riskEventColumn && e.columns[t].columnId === o.riskEventColumn.name) {
                    if (o.riskEventColumn.controlType === "DETAIL_ICON") {
                        e.columns[t].detailsVisible = true
                    } else if (o.riskEventColumn.controlType === "SWITCH") {
                        e.columns[t].switchVisible = true
                    }
                }
                if (o && o.columns && o.columns.length > 0) {
                    for (var l = 0; l < o.columns.length; l++) {
                        if (e.columns[t].columnId === o.columns[l].name) {
                            e.columns[t].description = o.columns[l].description;
                            break
                        }
                    }
                }
            }
        },
        _getWorklistTypes: function() {
            var e = [{
                worklistType: "SFC",
                description: this.getI18nText("prop_SFC")
            }, {
                worklistType: "PROCESS_LOT",
                description: this.getI18nText("prop_PROCESS_LOT")
            }];
            return e
        },
        _handleListColumnEditorDialogSave: function(e, o) {
            var t = sap.ui.getCore().byId("listNameSearchTable");
            var l = t.getModel();
            var i = l.getData();
            var s = o;
            if (o && o.indexOf("I18N[") === 0) {
                var n = o.substring(o.indexOf("[") + 1, o.indexOf("]"));
                s = this.getListMaintenanceI18nText(n)
            }
            var a = this._findListNameRowIndex(i.ListNames, e);
            if (a >= 0) {
                i.ListNames[a].description = s
            } else {
                i.ListNames[i.ListNames.length] = {
                    listType: this.getListType(),
                    listName: e,
                    description: s
                };
                i.ListNames.sort(function(e, o) {
                    if (e.listName > o.listName) {
                        return 1
                    } else if (o.listName > e.listName) {
                        return -1
                    }
                    return 0
                });
                a = this._findListNameRowIndex(i.ListNames, e)
            }
            l.refresh();
            var r = t.getItems();
            if (r && a < r.length) {
                t.setSelectedItem(r[a])
            }
            this._handleListColumnEditorDialogCancel()
        },
        _findListNameRowIndex: function(e, o) {
            var t = -1;
            e.some(function(e, l) {
                var i = e.listName === o;
                t = i ? l : -1;
                return i
            });
            return t
        },
        _handleListColumnEditorDialogCancel: function() {
            this._oLceDialogDialog.detachBeforeOpen(this._oLceDialogController.beforeOpen, this._oLceDialogController);
            this._oLceDialogDialog.detachAfterOpen(this._oLceDialogController.afterOpen, this._oLceDialogController);
            this._oLceDialogDialog.close();
            this._oLceModel.destroy();
            this._oLceDialogDialog.destroy();
            this._oLceDialogDialog = null
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ListPluginViewController", ["sap/m/TablePersoController", "sap/ui/core/syncStyleClass", "sap/ui/model/json/JSONModel", "sap/m/Button", "sap/m/HBox", "sap/m/ListMode", "sap/m/ListType", "sap/dm/dme/podfoundation/controller/PluginViewController", "sap/dm/dme/podfoundation/controller/MetadataMethodConstants", "sap/dm/dme/podfoundation/control/TableFactory", "sap/dm/dme/podfoundation/control/TablePersoService", "sap/dm/dme/podfoundation/control/ViewSettingsDialogFactory", "sap/dm/dme/podfoundation/formatter/InfoIconFormatter", "sap/dm/dme/podfoundation/handler/TableResizeHandler", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e, o, n, i, r, l, s, a, u, d, c, f, p, m) {
    "use strict";
    const g = -1;
    const h = 1;
    const y = 0;
    let I = s.extend("sap.dm.dme.podfoundation.controller.ListPluginViewController", {
        metadata: {
            methods: a.LIST_PLUGIN_VIEW_CONTROLLER_METHODS
        }
    });
    I.prototype.onInit = function() {
        if (s.prototype.onInit) {
            s.prototype.onInit.apply(this, arguments)
        }
        this._oViewSettingsDialog = null;
        this._oViewSettingsDialogFactory = null;
        this._oTablePersonalizationControl = null;
        this._sTableType = "mobile"
    };
    I.prototype.onExit = function() {
        if (s.prototype.onExit) {
            s.prototype.onExit.apply(this, arguments)
        }
        this.saveUserPreferences();
        this._destroyTablePersonalizationControl(this._oTablePersonalizationControl);
        this._oTablePersonalizationControl = null
    };
    I.prototype._destroyTablePersonalizationControl = function(t) {
        if (t) {
            let e = t.getTablePersoDialog();
            if (e) {
                e.destroy()
            }
            t.destroy()
        }
    };
    I.prototype.getColumnListType = function(t, e) {
        let o = l.Navigation;
        if (m.isEmpty(t.selectActionButtonId) && m.isEmpty(t.selectActionPageName)) {
            o = l.Active
        }
        if (e.allowMultipleSelection) {
            o = l.Inactive
        }
        return o
    };
    I.prototype.createTable = function(t, e, o, n, i, l) {
        let s = "medium";
        let a = this.getImageIconStyleInformation();
        if (a.imageStyle === "sapMesTableCellImageIconCompactButton") {
            s = "small"
        }
        f.init(this.getI18nResourceBundle(), s);
        let d = this._hideColumnFromSort(n);
        this._initializeSortColumns(d);
        let c = r.SingleSelectMaster;
        if (n.allowMultipleSelection) {
            c = r.MultiSelect
        }
        this._sTableType = n.tableType;
        let p = this._getColumnListData(l);
        this._setColumnFieldnames(l);
        let g = this.createStatusIconControl();
        if (g) {
            if (!p["STATUS_ICON"]) {
                p["STATUS_ICON"] = {}
            }
            p["STATUS_ICON"].columnListItem = g
        }
        let h = this.createInfoIconControl();
        if (h) {
            if (!p["INFO"]) {
                p["INFO"] = {}
            }
            p["INFO"] = {
                columnListItem: h
            }
        }
        let y = this.createOperationQtyControl();
        if (y) {
            p["OPERATION_QTY"] = {
                columnListItem: y
            }
        }
        let I = true;
        if (i && i.alternateRowColors) {
            I = i.alternateRowColors
        }
        let C = false;
        if (i && i.fixedLayout) {
            C = i.fixedLayout
        }
        let S = this.getStickyHeaders();
        if (!S || S.length === 0) {
            S = [sap.m.Sticky.ColumnHeaders]
        }
        let _ = this.getI18nResourceBundle();
        let T = new u(n, p, _);
        let O = {
            alternateRowColors: I,
            fixedLayout: C,
            mode: c,
            sticky: i.stickyHeader ? S : null,
            selectionChange: [this.onSelectionChangeEvent, this],
            itemPress: [this.onItemPressEvent, this]
        };
        if (typeof i.growing !== "undefined") {
            O.growing = i.growing
        }
        if (typeof i.growingThreshold !== "undefined") {
            O.growingThreshold = i.growingThreshold
        }
        if (typeof i.growingScrollToLoad !== "undefined") {
            O.growingScrollToLoad = i.growingScrollToLoad
        }
        let P = o;
        if (!o) {
            P = {}
        }
        if (m.isEmpty(P.vAlign)) {
            P.vAlign = "Middle"
        }
        let b = this.createId(t);
        let w = this.byId(b);
        if (w) {
            w.destroy()
        }
        return T.createTable(b, e, O, P)
    };
    I.prototype._getColumnListData = function(t) {
        return this.getColumnListData(t)
    };
    I.prototype.getColumnListData = function(t) {
        let e = [];
        if (t && t.length > 0) {
            for (let o = 0; o < t.length; o++) {
                let n = t[o].columnId;
                e[n] = {};
                if (t[o].label && t[o].label !== "") {
                    e[n].label = t[o].label
                }
                if (t[o].binding && t[o].binding !== "") {
                    e[n].binding = t[o].binding
                }
                if (t[o].width && t[o].width !== "") {
                    e[n].width = t[o].width
                }
                if (this._isCustomDataField(n)) {
                    e[n] = this._assignCustomDataColumn(t[o])
                }
                if (t[o].minScreenWidth && t[o].minScreenWidth !== "") {
                    e[n].minScreenWidth = t[o].minScreenWidth
                }
                if (t[o].popinHAlign && t[o].popinHAlign !== "") {
                    e[n].popinHAlign = t[o].popinHAlign
                }
                if (t[o].popinDisplay && t[o].popinDisplay !== "") {
                    e[n].popinDisplay = t[o].popinDisplay
                }
                if (t[o].vAlign && t[o].vAlign !== "") {
                    e[n].vAlign = t[o].vAlign
                }
                if (t[o].hAlign && t[o].hAlign !== "") {
                    e[n].hAlign = t[o].hAlign
                }
                if (typeof t[o].mergeDuplicates !== "undefined") {
                    e[n].mergeDuplicates = t[o].mergeDuplicates
                }
                if (typeof t[o].demandPopin !== "undefined") {
                    e[n].demandPopin = t[o].demandPopin
                }
                if (typeof t[o].wrapping !== "undefined") {
                    e[n].wrapping = t[o].wrapping
                }
                if (t[o].columnListItem) {
                    e[n].columnListItem = t[o].columnListItem
                }
                e[n].hideLabel = t[o].hideLabel
            }
        }
        return e
    };
    I.prototype._assignCustomDataColumn = function(t) {
        let e = t;
        if (t.label && t.label !== "") {
            e.label = t.label
        } else {
            e.label = t.description
        }
        if (t.width && t.width !== "") {
            e.width = t.width
        } else {
            e.width = this._getCustomDataWidth()
        }
        return e
    };
    I.prototype._getCustomDataWidth = function() {
        let t = "11em";
        let e = this.getI18nResourceBundle();
        if (!e) {
            return t
        }
        let o = e.getText("CUSTOM_DATA_COLUMN.WIDTH");
        if (m.isEmpty(o)) {
            return t
        }
        return o
    };
    I.prototype._isCustomDataField = function(t) {
        return this.isCustomDataField(t)
    };
    I.prototype.isCustomDataField = function(t) {
        if (m.isNotEmpty(t)) {
            if (t.indexOf("ITEM.") > -1) {
                return true
            } else if (t.indexOf("SHOP_ORDER.") > -1) {
                return true
            }
        }
        return false
    };
    I.prototype.getTableType = function() {
        return this._sTableType
    };
    I.prototype.getStickyHeaders = function() {
        return null
    };
    I.prototype.handleSelectAction = function(t) {
        if (m.isEmpty(t.selectActionButtonId) && m.isEmpty(t.selectActionPageName)) {
            return
        }
        if (this._vSelectTimerId) {
            clearTimeout(this._vSelectTimerId)
        }
        let e = this;
        this._vSelectTimerId = setTimeout(function() {
            if (m.isNotEmpty(t.selectActionButtonId)) {
                e.executeActionButton(t.selectActionButtonId)
            } else if (m.isNotEmpty(t.selectActionPageName)) {
                e.navigateToPage(t.selectActionPageName)
            }
        }, 125)
    };
    I.prototype.getSelectedRowData = function(t) {
        let e = [];
        if (!t) {
            return e
        }
        let o;
        let n;
        if (t.getSelectedIndices) {
            let i = t.getSelectedIndices();
            for (o = 0; o < i.length; o++) {
                let r = t.getContextByIndex(i[o]);
                if (r) {
                    if (r.getObject) {
                        n = r.getObject();
                        if (n) {
                            e[e.length] = n
                        }
                    } else {
                        e[e.length] = r
                    }
                }
            }
        } else if (t.getSelectedItems) {
            let i = t.getSelectedItems();
            if (i && i.length > 0) {
                for (o = 0; o < i.length; o++) {
                    n = i[o].getBindingContext().getObject();
                    if (n) {
                        e[e.length] = n
                    }
                }
            }
        }
        return e
    };
    I.prototype.createStatusIconControl = function() {
        return null
    };
    I.prototype.createOperationQtyControl = function() {
        return null
    };
    I.prototype.createInfoIconControl = function() {
        let t = new i;
        t.addItem(this._createBuyoffIconButton());
        t.addItem(this._createDcIconButton());
        t.addItem(this._createClIconButton());
        t.addItem(this._createPsnIconButton());
        t.addItem(this._createTlIconButton());
        t.addItem(this._createWiIconButton());
        t.addItem(this._createCaIconButton());
        return t
    };
    I.prototype._createBuyoffIconButton = function() {
        return this.createIconButton("BUYOFF", this.onBuyoffIconPressed, this)
    };
    I.prototype._createDcIconButton = function() {
        return this.createIconButton("DATA_COLLECTION", this.onDcIconPressed, this)
    };
    I.prototype._createClIconButton = function() {
        return this.createIconButton("COMPONENT_LIST", this.onAssembleIconPressed, this)
    };
    I.prototype._createPsnIconButton = function() {
        return this.createIconButton("PARENT_SERIAL_NUMBER", this.onCollectPsnIconPressed, this)
    };
    I.prototype._createTlIconButton = function() {
        return this.createIconButton("TOOL_LIST", this.onToolListIconPressed, this)
    };
    I.prototype._createWiIconButton = function() {
        return this.createIconButton("WORK_INSTRUCTION", this.onWorkInstructionIconPressed, this)
    };
    I.prototype._createCaIconButton = function() {
        return this.createIconButton("CHANGE_ALERT", this.onChangeAlertIconPressed, this)
    };
    I.prototype.createIconButton = function(t, e, o) {
        let i = this.getImageIconStyleInformation();
        let r = new n({
            tooltip: {
                path: "iconInfoRendererInfo",
                formatter: function(e) {
                    return f.getIconTooltip(t, e)
                }
            },
            visible: {
                path: "iconInfoRendererInfo",
                formatter: function(e) {
                    return f.isIconVisible(t, e)
                }
            },
            icon: {
                path: "iconInfoRendererInfo",
                formatter: function(e) {
                    return f.getIcon(t, e)
                }
            },
            press: [e, o]
        });
        r.addStyleClass(i.imageStyle);
        r.addStyleClass("sapUiTinyMarginEnd");
        return r
    };
    I.prototype.getImageIconStyleInformation = function() {
        if (!this._oImageIconStyleInfo) {
            let t = "sapMesTableCellImageIconButton";
            let e = "2rem";
            let o = this.getContentDensityStyle();
            if (m.isNotEmpty(o) && o === "sapUiSizeCompact") {
                e = "1rem";
                t = "sapMesTableCellImageIconCompactButton"
            }
            this._oImageIconStyleInfo = {
                imageSize: e,
                imageStyle: t
            }
        }
        return this._oImageIconStyleInfo
    };
    I.prototype.onBuyoffIconPressed = function(t) {};
    I.prototype.onDcIconPressed = function(t) {};
    I.prototype.onAssembleIconPressed = function(t) {};
    I.prototype.onCollectPsnIconPressed = function(t) {};
    I.prototype.onToolListIconPressed = function(t) {};
    I.prototype.onWorkInstructionIconPressed = function(t) {};
    I.prototype.onChangeAlertIconPressed = function(t) {};
    I.prototype.onSelectionChangeEvent = function(t) {};
    I.prototype.onItemPressEvent = function(t) {};
    I.prototype._hideColumnFromSort = function(t) {
        let e = ["ITEM_GROUP"];
        if (t && t.columns && t.columns.length > 0) {
            for (let o = 0; o < t.columns.length; o++) {
                for (let n = 0; n < e.length; n++) {
                    if (e[n] === t.columns[o].columnId) {
                        t.columns[o].showSort = false
                    }
                }
            }
        }
        return t
    };
    I.prototype._initializeSortColumns = function(t) {
        let e = [];
        if (t && t.columns && t.columns.length > 0) {
            for (let o = 0; o < t.columns.length; o++) {
                if (t.columns[o].sortOrder && t.columns[o].sortOrder > 0) {
                    let n = t.columns[o];
                    n.fieldName = this._getColumnFieldName(t.columns[o].columnId);
                    n.sortDescending = false;
                    e[e.length] = n
                }
            }
            if (e.length > 1) {
                e.sort(function(t, e) {
                    return t.sortOrder - e.sortOrder
                })
            }
        }
        this._aListColumnsSortOrder = e
    };
    I.prototype.sortListByColumnSortOrder = function(t, e) {
        if (t && t.length > 0) {
            let o = this;
            t.sort(function(t, n) {
                if (e) {
                    let e = n;
                    n = t;
                    t = e
                }
                return o.sortComparator(t, n)
            })
        }
    };
    I.prototype.sortComparator = function(t, e) {
        let o = this.getListColumnSortOrder();
        if (!o || o.length === 0) {
            return y
        }
        let n, i, r;
        let l = y;
        let s = this.getPluginName();
        for (let a = 0; a < o.length; a++) {
            r = o[a].fieldName;
            if (!r) {
                continue
            }
            if (s === "sap.dm.dme.plugins.operationListPlugin") {
                if (r === "operationStepId") {
                    r = "stepId"
                }
            }
            n = t[r];
            i = e[r];
            if (!n && i) {
                l = g
            } else if (!i && n) {
                l = h
            } else if (typeof n === "string" && typeof i === "string") {
                l = n.localeCompare(i)
            } else if (typeof n === "number" && typeof i === "number") {
                if (n > i) {
                    l = h
                } else if (i > n) {
                    l = g
                }
            }
            if (l !== 0) {
                return l
            }
        }
        return y
    };
    I.prototype._getColumnFieldName = function(t) {
        return this.getColumnFieldName(t)
    };
    I.prototype.getColumnFieldName = function(t) {
        if (this._isCustomDataField(t)) {
            return null
        }
        let e = this.getI18nResourceBundle();
        if (!e) {
            return null
        }
        let o = e.getText(t + ".BINDING");
        if (m.isEmpty(o)) {
            return null
        }
        o = o.substring(1, o.indexOf("}"));
        return o
    };
    I.prototype._getUserPreferencesConfig = function() {
        let t = this.getOwnerComponent();
        if (t) {
            return t.getUserPreferencesConfig()
        }
        return null
    };
    I.prototype._getSortOrderId = function() {
        let t = this._getUserPreferencesConfig();
        if (t) {
            return t.sortOrderId
        }
        return undefined
    };
    I.prototype._getColumnOrderId = function() {
        let t = this._getUserPreferencesConfig();
        if (t) {
            return t.columnOrderId
        }
        return undefined
    };
    I.prototype.updateTableSortOrder = function() {
        if (this._oViewSettingsDialogFactory) {
            let t = this;
            setTimeout(function() {
                t._oViewSettingsDialogFactory.updateTable()
            }, 125)
        }
    };
    I.prototype.addColumnOrderSettings = function(e, n, i) {
        if (e.tableType === "mobile" && e.allowOperatorToChangeColumnSequence) {
            let e = this._getColumnOrderId();
            let r = {};
            if (m.isNotEmpty(e)) {
                r = this.getUserPreference(e)
            }
            let l = this.getView().byId(i);
            if (l) {
                l.setVisible(true);
                l.attachPress(this.onColumOrderSettingsButtonPressed, this)
            }
            let s = this.getPluginName();
            let a = new o({
                hasGrouping: false
            });
            this.getView().setModel(a, "Grouping");
            let u = new d(s, n);
            if (r) {
                u.setColumnOrderData(r)
            }
            this._oTablePersonalizationControl = new t({
                table: n,
                componentName: s,
                persoService: u
            });
            this._oTablePersonalizationControl.activate();
            n.invalidate()
        }
    };
    I.prototype.addSortOrderSettings = function(t, e, o, n) {
        if (t.tableType === "mobile" && t.allowOperatorToSortRows) {
            let i = this._getSortOrderId();
            let r = {};
            if (m.isNotEmpty(i)) {
                r = this.getUserPreference(i)
            }
            let l = this.getView().byId(o);
            if (l) {
                l.setVisible(true);
                l.attachPress(this.onSortOrderSettingsButtonPressed, this)
            }
            let s = this.getI18nResourceBundle();
            this._oViewSettingsDialogFactory = new c(e, t, s, n);
            if (r) {
                this._oViewSettingsDialogFactory.setViewSettings(r)
            }
            this._oViewSettingsDialog = this._oViewSettingsDialogFactory.createDialog();
            this._oViewSettingsDialog.attachConfirm(this.onViewSettingsDialogConfirm, this)
        }
    };
    I.prototype.onViewSettingsDialogConfirm = function(t) {
        let e = t.getParameter("sortItem");
        if (!e) {
            return
        }
        let o = t.getParameter("sortDescending");
        if (typeof o === "undefined" || o === null) {
            o = false
        }
        this.updateListColumnSortOrder(e.getKey(), o)
    };
    I.prototype.onSortOrderSettingsButtonPressed = function(t) {
        if (this._oViewSettingsDialog) {
            e("sapUiSizeCompact", this.getView(), this._oViewSettingsDialog);
            this._oViewSettingsDialog.open()
        }
    };
    I.prototype.onColumOrderSettingsButtonPressed = function(t) {
        if (this._oTablePersonalizationControl) {
            this._oTablePersonalizationControl.openDialog()
        }
    };
    I.prototype.getListColumnSortOrder = function() {
        return this._aListColumnsSortOrder
    };
    I.prototype.setListColumnSortOrder = function(t) {
        this._aListColumnsSortOrder = t
    };
    I.prototype._setColumnFieldnames = function(t) {
        this._aColumnFieldNames = [];
        for (let e = 0; e < t.length; e++) {
            this._aColumnFieldNames[this._aColumnFieldNames.length] = {
                columnId: t[e].columnId,
                fieldName: this._getColumnFieldName(t[e].columnId)
            }
        }
    };
    I.prototype._getColumnFieldnames = function() {
        return this._aColumnFieldNames
    };
    I.prototype._findColumnIdForFieldname = function(t) {
        let e = this._getColumnFieldnames();
        for (let o = 0; o < e.length; o++) {
            if (e[o].fieldName === t) {
                return e[o].columnId
            }
        }
        return null
    };
    I.prototype._findSortOrderForFieldname = function(t) {
        let e = this.getListColumnSortOrder();
        if (!e || e.length === 0) {
            return -1
        }
        for (let o = 0; o < e.length; o++) {
            if (e[o].fieldName === t) {
                return e[o].sortOrder
            }
        }
        return -1
    };
    I.prototype._updateSortOrderForFieldname = function(t, e, o) {
        let n = this.getListColumnSortOrder();
        if (!n || n.length === 0) {
            return
        }
        for (let i = 0; i < n.length; i++) {
            if (n[i].fieldName === t) {
                n[i].sortOrder = 1
            } else if (n[i].sortOrder === 1) {
                n[i].sortOrder = o
            }
            n[i].sortDescending = e
        }
    };
    I.prototype._resetSortOrderByFieldname = function(t, e) {
        let o = this._findColumnIdForFieldname(t);
        let n = [];
        if (m.isNotEmpty(o)) {
            n[0] = {
                columnId: o,
                fieldName: t,
                sequence: 10,
                sortDescending: e,
                sortOrder: 1
            }
        }
        this.setListColumnSortOrder(n)
    };
    I.prototype.updateListColumnSortOrder = function(t, e) {
        let o = this._findSortOrderForFieldname(t);
        if (o > 0) {
            this._updateSortOrderForFieldname(t, e, o)
        } else {
            this._resetSortOrderByFieldname(t, e)
        }
        let n = this.getListColumnSortOrder();
        if (n.length > 1) {
            n.sort(function(t, e) {
                if (t.sortOrder > e.sortOrder) {
                    return 1
                } else if (t.sortOrder < e.sortOrder) {
                    return -1
                }
                return 0
            })
        }
    };
    I.prototype.saveUserPreferences = function() {
        let t = this._getSortOrderId();
        if (m.isNotEmpty(t)) {
            if (this._oViewSettingsDialogFactory) {
                let e = this._oViewSettingsDialogFactory.getViewSettings();
                if (e) {
                    this.setUserPreference(t, e)
                }
            }
        }
        let e = this._getColumnOrderId();
        if (m.isNotEmpty(e)) {
            if (this._oTablePersonalizationControl) {
                let t = this._oTablePersonalizationControl.getPersoService();
                if (t) {
                    let o = t.getColumnOrderData();
                    if (o) {
                        this.setUserPreference(e, o)
                    }
                }
            }
        }
    };
    I.prototype.getTableResizeHandler = function() {
        if (!this._oTableResizeHandler) {
            this._oTableResizeHandler = new p(this.getPodController(), this)
        }
        return this._oTableResizeHandler
    };
    I.prototype.initializeTableResizeHandler = function(t, e, o) {
        this.getTableResizeHandler().initializeTableResizeHandler(t, e, o)
    };
    return I
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/MetadataMethodConstants", function() {
    "use strict";
    var e = {
        public: true,
        final: true
    };
    var t = {
        public: true,
        final: false
    };
    return {
        PLUGIN_VIEW_CONTROLLER_METHODS: {
            createId: e,
            getLifecycleExtension: t,
            handleOnBeforeRendering: t,
            handleOnBeforeRenderingPlugin: t,
            handleOnAfterRendering: t,
            handleOnExit: t,
            onBeforeRenderingPlugin: t,
            findCustomControllerExtension: e,
            getCustomControllerExtension: e,
            findCustomViewExtension: e,
            onTabItemSelected: t,
            onTabItemOpened: t,
            onTabItemClosed: t,
            selectTabByTabPageName: e,
            getTabItem: e,
            closePlugin: t,
            onClosePress: t,
            navigateBack: t,
            navigateToPage: t,
            navigateToMainPage: t,
            executeNavigationButton: e,
            executeActionButton: e,
            executeGroupButton: e,
            executePlugins: e,
            executePlugin: e,
            onBackPress: t,
            removeMessageFromPopover: e,
            addMessageToPopover: e,
            closeMessagePopover: e,
            addMessage: e,
            clearMessages: e,
            setFocus: t,
            subscribe: e,
            unsubscribe: e,
            subscribeGlobalEventHandler: e,
            findGlobalEventHandler: e,
            publish: e,
            fireQueuedEvent: e,
            addOnRequestEvent: e,
            fireOnRequestEvent: e,
            isEventFiredByThisPlugin: e,
            getPodSelectionModel: t,
            isPodType: t,
            getPodType: t,
            getActiveViewController: e,
            getPodController: e,
            getPodConfiguration: t,
            findButtonConfiguration: e,
            getModelsToPropagate: t,
            getNotificationsConfiguration: t,
            getNotificationExtension: t,
            isSubscribingToNotifications: t,
            getCustomNotificationEvents: t,
            getNotificationMessageHandler: t,
            updateNotificationSubscriptions: e,
            getNotificationContextData: t,
            getContentDensityStyle: e,
            getPluginName: e,
            getUserId: e,
            getPluginId: e,
            getPageName: e,
            getDefinedOnPageName: e,
            getDynamicPageTitle: e,
            getDisplayType: e,
            isDefaultPlugin: e,
            isPopup: e,
            isModalPopup: e,
            isSfcPodSelectionMode: e,
            getConfiguration: t,
            getConfigurationValue: e,
            renderAssignedButtons: e,
            getAssignedButtonsHandler: e,
            setBusy: e,
            ajaxGetRequest: e,
            ajaxPostRequest: e,
            ajaxPatchRequest: e,
            ajaxPutRequest: e,
            ajaxDeleteRequest: e,
            getI18nResourceBundle: t,
            getI18nText: t,
            getGlobalI18nText: t,
            getUserPreference: e,
            setUserPreference: e,
            setGlobalProperty: t,
            getGlobalProperty: t,
            removeGlobalProperty: t,
            getGlobalModel: e,
            getQueryParameter: e,
            getPlantDataSourceUri: e,
            getPlantRestDataSourceUri: e,
            getProductDataSourceUri: e,
            getProductRestDataSourceUri: e,
            getProductionDataSourceUri: e,
            getProductionODataDataSourceUri: e,
            getPodFoundationDataSourceUri: e,
            getPodFoundationODataDataSourceUri: e,
            getNonConformanceDataSourceUri: e,
            getNonConformanceODataDataSourceUri: e,
            getAssemblyDataSourceUri: e,
            getAssemblyODataDataSourceUri: e,
            getClassificationDataSourceUri: e,
            getDemandODataDataSourceUri: e,
            getDemandRestDataSourceUri: e,
            getInventoryDataSourceUri: e,
            getInventoryODataDataSourceUri: e,
            getWorkInstructionRestDataSourceUri: e,
            getWorkInstructionDataSourceUri: e,
            getDataCollectionRestDataSourceUri: e,
            getDataCollectionDataSourceUri: e,
            getOEERestDataSourceUri: e,
            getOEEDataSourceUri: e,
            getAinRestDataSourceUri: e,
            getAinDataSourceUri: e,
            getPackingRestDataSourceUri: e,
            getPackingODataSourceUri: e,
            getNumberingRestDataSourceUri: e,
            getPeRestDataSourceUri: e,
            getPublicApiRestDataSourceUri: e,
            getImageOverlayDataSourceUri: e,
            getDataSourceUriFromManifest: e,
            getActivityConfirmationDataSourceUri: e,
            getActivityConfirmationRestDataSourceUri: e,
            getQualityInspectionRestDataSourceUri: e,
            getQualityInspectionDataSourceUri: e,
            getToolRestDataSourceUri: e,
            getLogisticsRestDataSourceUri: e,
            getAlertRestDataSourceUri: e,
            getAlertODataSourceUri: e,
            getTimeTrackingRestDataSourceUri: e,
            showErrorMessage: t,
            showSuccessMessage: t,
            showMessage: t,
            isCloseable: t
        },
        LIST_PLUGIN_VIEW_CONTROLLER_METHODS: {
            addSortOrderSettings: t,
            addColumnOrderSettings: t,
            getColumnListType: e,
            createTable: t,
            getColumnListData: t,
            isCustomDataField: t,
            getTableType: e,
            getStickyHeaders: t,
            getSelectedRowData: e,
            getImageIconStyleInformation: e,
            onSelectionChangeEvent: t,
            onItemPressEvent: t,
            sortListByColumnSortOrder: e,
            sortComparator: e,
            getColumnFieldName: e,
            getTableResizeHandler: e,
            initializeTableResizeHandler: t,
            handleSelectAction: t
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/PluginAssignmentViewController", ["sap/dm/dme/podfoundation/controller/ActionAssignmentViewController", "sap/dm/dme/podfoundation/util/PodUtility"], function(i, t) {
    "use strict";
    return i.extend("sap.dm.dme.podfoundation.controller.PluginAssignmentViewController", {
        EMPTY_SELECTION: "EMPTY",
        beforeOpen: function(i) {
            this._initializeAvailableActions();
            if (t.isNotEmpty(this._sAssignedPlugin)) {
                var e = true;
                if (this._sAssignedPlugin.indexOf(".") > 0) {
                    e = false
                }
                var n = this._findPropertyEditor(this._sAssignedPlugin, e);
                if (n) {
                    this._updateDialogModel(this._sAssignedPlugin, n.getTitle())
                }
                this._showConfiguration(this._sAssignedPlugin)
            }
        },
        _updateDialogModel: function(i, e) {
            var n = this.getDialogModel();
            var s = n.getData();
            s.AssignedPlugin = i;
            s.AssignedTitle = "";
            s.Assigned = false;
            if (t.isNotEmpty(i)) {
                s.Assigned = true
            }
            if (t.isNotEmpty(e)) {
                s.AssignedTitle = e
            }
            n.refresh()
        },
        setAssignedPlugin: function(i) {
            this._sAssignedPlugin = i
        },
        getAssignedPlugin: function() {
            return this._sAssignedPlugin
        },
        setNavigationPageSelections: function(i) {
            this._aNavigationPageSelections = i
        },
        getNavigationPageSelections: function() {
            return this._aNavigationPageSelections
        },
        setTabPageSelections: function(i) {
            this._aTabPageSelections = i
        },
        getTabPageSelections: function() {
            return this._aTabPageSelections
        },
        _getAvailablePlugins: function(t) {
            var e = i.prototype._getAvailablePlugins.apply(this, arguments);
            var n = {
                Rank: 0,
                highlight: "None",
                name: this.EMPTY_SELECTION,
                plugin: this.EMPTY_SELECTION,
                title: ""
            };
            e.Plugins.splice(0, 0, n);
            return e
        },
        onPluginItemSelected: function(i) {
            var e = i.getParameter("selectedItem");
            var n = e.data("pluginId");
            var s = e.data("title");
            if (n === this.EMPTY_SELECTION) {
                n = null;
                s = null
            }
            this._updateDialogModel(n, s);
            var o = this._assignPlugin(n);
            this.handleSinglePluginSelectionDialogClose();
            if (t.isNotEmpty(o)) {
                this._delayedShowConfiguration(o)
            } else {
                this.getActionAssignmentDialog().invalidate()
            }
        },
        _assignPlugin: function(i) {
            if (t.isNotEmpty(this._sAssignedPlugin)) {
                this.onRemoveFromAssigned(this._sAssignedPlugin);
                this._sAssignedPlugin = null
            }
            if (t.isEmpty(i)) {
                this._clearFormContainer()
            } else {
                this.onMoveToAssigned(i)
            }
            return this._sAssignedPlugin
        },
        onRemoveAssignedPlugin: function(i) {
            var e = this.getActionAssignmentDialog().getModel("DialogModel");
            var n = e.getData();
            this._sAssignedPlugin = n.AssignedPlugin;
            if (t.isNotEmpty(this._sAssignedPlugin)) {
                this.onRemoveFromAssigned(this._sAssignedPlugin);
                this._sAssignedPlugin = null
            }
            this._updateDialogModel(null, null);
            this._clearFormContainer()
        },
        onRemoveFromAssigned: function(i) {
            var t = this._findOrCreatePropertyEditor(i, i);
            if (t) {
                var e = {
                    pluginId: i
                };
                this.setPopupEnabled(e, false)
            }
            this._oMainControllerHelper.removeAssignedPluginPropertyEditor(i)
        },
        onMoveToAssigned: function(i) {
            var t = this.findAction(i);
            if (!t) {
                this._sAssignedPlugin = null;
                return
            }
            var e = t.action;
            var n = t.type;
            var s = e;
            if (s.indexOf(".") < 0) {
                s = this._createUniqueInstanceId(t)
            }
            var o = this._findOrCreatePropertyEditor(e, s, n);
            if (o) {
                if (o.initializeProperties) {
                    o.initializeProperties()
                }
                this._sAssignedPlugin = s
            }
        },
        onDialogOk: function(i) {
            this._oCloseHandler.onPluginAssignmentDialogClose(i)
        },
        _delayedShowConfiguration: function(i) {
            var t = this;
            setTimeout(function() {
                t._showConfiguration(i)
            }, 125)
        },
        _showConfiguration: function(i) {
            this._clearFormContainer();
            var t = this._getInputDataForPlugin(i);
            if (t && t.actionObject && !t.actionObject.multiInstance && !t.actionObject.viewPluginNotAssigned) {
                return
            }
            var e = t.propertyEditor;
            if (e) {
                var n = e.getControlType();
                var s = this.bShowPopupProperties;
                if (t.actionObject && t.actionObject.type !== "VIEW_PLUGIN") {
                    s = false
                }
                var o = this._byId("configurationSidePanelEditableForm");
                e.setShowPopupProperties(s);
                e.setNavigationPageSelections(this.getNavigationPageSelections());
                e.setTabPageSelections(this.getTabPageSelections());
                e.setMainController(this._oMainController);
                e.addPropertyEditorContent(o);
                if (n === "VIEW_PLUGIN") {
                    e.setPopupPropertyEditorController(this);
                    e.addPopupPropertyEditorContent(o)
                }
            }
            this.getActionAssignmentDialog().invalidate()
        },
        _getInputDataForPlugin: function(i) {
            var t = i;
            if (i.indexOf(".") > 0) {
                t = i.substring(0, i.indexOf("."))
            }
            var e = this.findAction(t);
            var n = false;
            if (e && !e.showConfiguration && !e.multiInstance && e.type === "VIEW_PLUGIN") {
                n = true
            }
            var s = this._findPropertyEditor(i, n);
            if (!s) {
                s = this._findOrCreatePropertyEditor(i, i)
            }
            return {
                propertyEditor: s,
                actionObject: e
            }
        },
        _clearFormContainer: function() {
            var i = this._byId("configurationSidePanelEditableForm");
            if (i) {
                i.destroyContent()
            }
        },
        _findPropertyEditor: function(i, t) {
            return this._oMainControllerHelper.findAssignedPluginPropertyEditor(i, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/PluginViewController", ["sap/ui/core/mvc/Controller", "sap/dm/dme/controller/Constants", "sap/dm/dme/logging/Logging", "sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/podfoundation/controller/MetadataMethodConstants", "sap/dm/dme/podfoundation/handler/AssignedButtonsHandler", "sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription", "sap/dm/dme/podfoundation/extension/PluginExtensionManager", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/podfoundation/model/PodSelectionType"], function(t, e, o, r, i, n, u, a, s, l) {
    "use strict";
    const g = o.getLogger("sap.dm.dme.podfoundation.controller.PluginViewController");
    let c = t.extend("sap.dm.dme.podfoundation.controller.PluginViewController", {
        metadata: {
            methods: i.PLUGIN_VIEW_CONTROLLER_METHODS
        },
        constructor: function(e, o) {
            t.call(this, arguments)
        }
    });
    c.prototype.subscriptions = {};
    c.prototype._subscribeEvents = function() {
        for (let t in this.subscriptions) {
            let e = this.subscriptions[t];
            if (e === true) {
                e = "on" + t
            }
            this.subscribe(t, this[e], this)
        }
    };
    c.prototype._unsubscribeEvents = function() {
        for (let t in this.subscriptions) {
            let e = this.subscriptions[t];
            if (e === true) {
                e = "on" + t
            }
            this.unsubscribe(t, this[e], this)
        }
    };
    c.prototype.onInit = function() {
        this._initializeBaseEventHandlers();
        this._getServerNotificationSubscription().init();
        this._getMessageManager().registerObject(this.getView(), true)
    };
    c.prototype.getLifecycleExtension = function() {
        return null
    };
    c.prototype._initializeBaseEventHandlers = function() {
        this.getView().attachEventOnce("beforeRendering", function() {
            this._onViewEventOnceHandler()
        }.bind(this))
    };
    c.prototype._onViewEventOnceHandler = function() {
        this._propagateModelsToPopup();
        this.onBeforeRenderingPlugin()
    };
    c.prototype.onExit = function() {
        this._unsubscribeEvents();
        this._getServerNotificationSubscription().destroy();
        this._getMessageManager().unregisterObject(this.getView(), true);
        let t = this.getLifecycleExtension();
        if (t) {
            t.onExit()
        }
    };
    c.prototype.handleOnExit = function() {};
    c.prototype._getPluginExtensionManager = function() {
        if (!this._oPluginExtensionManager) {
            this._oPluginExtensionManager = new a(this)
        }
        return this._oPluginExtensionManager
    };
    c.prototype.getCustomControllerExtension = function(t, e) {
        let o = this.findCustomControllerExtension(e);
        if (o) {
            o.setController(this);
            o.setCoreExtension(t)
        }
        return o
    };
    c.prototype.findCustomControllerExtension = function(t) {
        let e = this._getPluginExtensionManager();
        return e.findCustomControllerExtension(t)
    };
    c.prototype._getMessageManager = function() {
        return sap.ui.getCore().getMessageManager()
    };
    c.prototype.onBeforeRenderingPlugin = function() {
        this._subscribeEvents();
        let t = this.getLifecycleExtension();
        if (t) {
            t.onBeforeRenderingPlugin()
        }
    };
    c.prototype.handleOnBeforeRenderingPlugin = function() {};
    c.prototype.onBeforeRendering = function() {
        let t = this.getLifecycleExtension();
        if (t) {
            t.onBeforeRendering()
        }
    };
    c.prototype.handleOnBeforeRendering = function() {};
    c.prototype.onAfterRendering = function() {
        let t = this.getLifecycleExtension();
        if (t) {
            t.onAfterRendering()
        }
    };
    c.prototype.handleOnAfterRendering = function() {};
    c.prototype.onTabItemSelected = function() {};
    c.prototype.onTabItemOpened = function() {};
    c.prototype.onTabItemClosed = function() {};
    c.prototype.selectTabByTabPageName = function(t) {
        if (s.isNotEmpty(t)) {
            let e = this.getPodController();
            if (e) {
                e.selectTabByTabPageName(t)
            }
        }
    };
    c.prototype.getTabItem = function() {
        if (!this._oTabItem) {
            let t = this.getOwnerComponent();
            if (t && t.getTabItem) {
                this._oTabItem = t.getTabItem()
            }
        }
        return this._oTabItem
    };
    c.prototype.closePlugin = function(t) {
        let e = this.getPodController();
        if (e) {
            e.closePlugin(t)
        }
    };
    c.prototype.onClosePress = function() {
        this.closePlugin(this)
    };
    c.prototype.navigateBack = function(t) {
        let e = this.getPodController();
        if (e) {
            e.navigateBack(t)
        }
    };
    c.prototype.navigateToPage = function(t, e, o) {
        let r = this.getPodController();
        if (r) {
            r.navigateToPage(t, e, o)
        }
    };
    c.prototype.navigateToMainPage = function(t, e) {
        let o = this.getPodController();
        if (o) {
            o.navigateToMainPage(t, e)
        }
    };
    c.prototype.executeNavigationButton = function(t, e, o) {
        if (s.isEmpty(t)) {
            return
        }
        let r = this.getPodController();
        if (r) {
            r.executeNavigationButton(t, e, o)
        }
    };
    c.prototype.executeActionButton = function(t, e, o) {
        if (s.isEmpty(t)) {
            return
        }
        let r = this.getPodController();
        if (r) {
            r.executeActionButton(t, e, o)
        }
    };
    c.prototype.executeGroupButton = function(t, e) {
        if (s.isEmpty(t) || s.isEmpty(e)) {
            return
        }
        let o = this.getPodController();
        if (o) {
            o.executeGroupButton(t, e)
        }
    };
    c.prototype.executePlugins = function(t, e, o) {
        if (s.isEmpty(t)) {
            return
        }
        let r = this.getPodController();
        if (r) {
            r.executePlugins(t, e, o)
        }
    };
    c.prototype.executePlugin = function(t, e, o) {
        if (s.isEmpty(t)) {
            return
        }
        let r = this.getPodController();
        if (r) {
            r.executePlugin(t, e, o)
        }
    };
    c.prototype.onBackPress = function() {
        this.navigateBack(this)
    };
    c.prototype.removeMessageFromPopover = function(t, e) {
        let o = this.getPodController();
        if (o) {
            o.removeMessageFromPopover(t, e)
        }
    };
    c.prototype.addMessageToPopover = function(t, e, o) {
        let r = this.getPodController();
        if (r) {
            return r.addMessageToPopover(t, e, o)
        }
        return null
    };
    c.prototype.closeMessagePopover = function() {
        let t = this.getPodController();
        if (t) {
            t.closeMessagePopover()
        }
    };
    c.prototype.addMessage = function(t, e, o, r) {
        let i = this.getPodController();
        if (i) {
            return i.addMessage(t, e, o, r)
        }
        return null
    };
    c.prototype.clearMessages = function() {
        let t = this.getPodController();
        if (t) {
            t.clearMessages()
        }
    };
    c.prototype.setFocus = function(t, e) {
        if (!t) {
            return
        }
        let o = e || 500;
        setTimeout(function() {
            t.focus()
        }, o)
    };
    c.prototype.isUsingEventBus = function() {
        let t = this.getPodController();
        if (t && t.isUsingEventBus) {
            return t.isUsingEventBus()
        }
        return true
    };
    c.prototype.registerPodEventHandler = function(t) {
        let e = this.getPodController();
        if (e && e.getPodEventController) {
            e.getPodEventController().register(t)
        }
    };
    c.prototype.subscribe = function(t, o, r) {
        if (this.isUsingEventBus()) {
            let i = this._getEventBus();
            i.subscribe(e.POD_EVENT_CHANNEL, t, o, r);
            return
        }
        let i = this._getEventHandler();
        i.subscribe(this, t, o, r)
    };
    c.prototype.unsubscribe = function(t, o, r) {
        if (this.isUsingEventBus()) {
            let i = this._getEventBus();
            if (i) {
                i.unsubscribe(e.POD_EVENT_CHANNEL, t, o, r)
            }
            return
        }
        let i = this._getEventHandler();
        i.unsubscribe(this, t, o, r)
    };
    c.prototype.subscribeGlobalEventHandler = function(t, e, o, r) {
        let i = this.getPodController();
        if (i && i.subscribeGlobalEventHandler) {
            i.subscribeGlobalEventHandler(t, e, o, r)
        }
    };
    c.prototype.findGlobalEventHandler = function(t, e) {
        let o = this.getPodController();
        if (o && o.findGlobalEventHandler) {
            return o.findGlobalEventHandler(t, e)
        }
        return null
    };
    c.prototype.publish = function(t, o) {
        if (this.isUsingEventBus()) {
            let r = o;
            r.pluginId = this.getPluginId();
            let i = this._getEventBus();
            i.publish(e.POD_EVENT_CHANNEL, t, r);
            return
        }
        let r = this._getEventHandler();
        r.publish(this, t, o)
    };
    c.prototype.fireQueuedEvent = function(t, e) {
        if (this.isUsingEventBus()) {
            return
        }
        let o = this._getEventHandler();
        if (o.fireQueuedEvent) {
            o.fireQueuedEvent(t, e)
        }
    };
    c.prototype.addOnRequestEvent = function(t, e) {
        if (this.isUsingEventBus()) {
            return
        }
        let o = this._getEventHandler();
        o.addOnRequestEvent(t, e)
    };
    c.prototype.fireOnRequestEvent = function(t, e, o) {
        if (this.isUsingEventBus()) {
            return
        }
        let r = this._getEventHandler();
        r.fireOnRequestEvent(t, e, o)
    };
    c.prototype.isEventFiredByThisPlugin = function(t) {
        if (t && (t.source && t.source === this || t.pluginId && t.pluginId === this.getPluginId())) {
            return true
        }
        return false
    };
    c.prototype.getPodSelectionModel = function() {
        let t = this._getPodControllerViewParent();
        if (t && t.getModel) {
            let e = t.getModel("podSelectionModel");
            return e.getData()
        }
        return null
    };
    c.prototype.isPodType = function(t) {
        let e = this.getPodType();
        return s.isNotEmpty(e) && t === e
    };
    c.prototype.getPodType = function() {
        if (s.isEmpty(this._sPodType)) {
            let t = this.getPodSelectionModel();
            if (t) {
                this._sPodType = t.getPodType()
            }
        }
        return this._sPodType
    };
    c.prototype._getPodControllerViewParent = function() {
        let t = this._getPodControllerView();
        if (t && t.getParent) {
            return t.getParent()
        }
        return null
    };
    c.prototype._getPodControllerView = function() {
        let t = this.getPodController();
        if (t && t.getView) {
            return t.getView()
        }
        return null
    };
    c.prototype.getActiveViewController = function() {
        let t = this.getPodController();
        if (t) {
            if (t.getActiveViewController) {
                return t.getActiveViewController()
            }
            return t
        }
        return null
    };
    c.prototype.getPodController = function() {
        if (!this._oPodController) {
            if (!this.isPopup()) {
                let t = this.getOwnerComponent();
                if (t && t.getPodController) {
                    this._oPodController = t.getPodController()
                }
            } else {
                this._oPodController = window.opener.getPodController()
            }
        }
        return this._oPodController
    };
    c.prototype.getPodConfiguration = function() {
        let t = this.getPodController();
        if (!t) {
            return null
        }
        return t.getPodConfiguration()
    };
    c.prototype.findButtonConfiguration = function(t) {
        let e = this.getPodController();
        if (!e) {
            return null
        }
        return e.findButtonConfiguration(t)
    };
    c.prototype._propagateModelsToPopup = function() {
        let t = this.getModelsToPropagate();
        if (!t || t.length === 0) {
            return
        }
        let e = this.getPodController();
        if (!e || !this.isPopup() && !this.isModalPopup()) {
            return
        }
        for (let o = 0; o < t.length; o++) {
            let r = e.getOwnerComponent().getModel(t[o]);
            if (r) {
                this.getOwnerComponent().setModel(r, t[o])
            }
        }
    };
    c.prototype.getModelsToPropagate = function() {
        return null
    };
    c.prototype._getServerNotificationSubscription = function() {
        if (!this._oServerNotificationSubscription) {
            this._oServerNotificationSubscription = this.createServerNotificationSubscription()
        }
        return this._oServerNotificationSubscription
    };
    c.prototype.createServerNotificationSubscription = function() {
        return new u(this)
    };
    c.prototype.getNotificationsConfiguration = function() {
        let t = this.getPodConfiguration();
        if (!t) {
            return null
        }
        return t.pages[0].podConfig.notifications
    };
    c.prototype.getNotificationExtension = function() {
        return null
    };
    c.prototype.isSubscribingToNotifications = function() {
        let t = this.getNotificationExtension();
        if (t) {
            return t.isSubscribingToNotifications()
        }
        return false
    };
    c.prototype.getCustomNotificationEvents = function() {
        let t = this.getNotificationExtension();
        if (t) {
            return t.getCustomNotificationEvents()
        }
        return null
    };
    c.prototype.getNotificationMessageHandler = function(t) {
        let e = this.getNotificationExtension();
        if (e) {
            return e.getNotificationMessageHandler(t)
        }
        return null
    };
    c.prototype.updateNotificationSubscriptions = function() {
        this._getServerNotificationSubscription()._updateNotificationSubscriptions()
    };
    c.prototype.getNotificationContextData = function() {
        let t = {};
        let e = this.getPodSelectionModel();
        if (e) {
            let o = e.getResource();
            t.resource = o ? o.resource : undefined;
            if (!t.resource) {
                t.resource = o
            }
            t.workCenter = e.getWorkCenter();
            let r = e.getOperation();
            t.operation = r ? r.operation : undefined
        }
        return t
    };
    c.prototype.getContentDensityStyle = function() {
        let t = this.getPodController();
        if (t && t.getContentDensityStyle) {
            return t.getContentDensityStyle()
        }
        return null
    };
    c.prototype.getPluginName = function() {
        if (!this._sPluginName) {
            let t = this.getOwnerComponent();
            if (t) {
                let e = t.getManifestEntry("sap.app");
                if (e && e.id) {
                    this._sPluginName = e.id
                }
            }
        }
        return this._sPluginName
    };
    c.prototype.getUserId = function() {
        let t = this.getPodController();
        if (t && t.getUserId) {
            return t.getUserId()
        }
        return null
    };
    c.prototype.getPluginId = function() {
        if (!this._sPluginId) {
            let t = this.getOwnerComponent();
            if (t && t.getPluginId) {
                this._sPluginId = t.getPluginId()
            }
        }
        return this._sPluginId
    };
    c.prototype.getPageName = function() {
        if (!this._sPageName) {
            let t = this.getOwnerComponent();
            if (t && t.getPageName) {
                this._sPageName = t.getPageName()
            }
            if (!this._sPageName) {
                this._sPageName = this._getPageNameFromConfiguration()
            }
        }
        return this._sPageName
    };
    c.prototype._getPageNameFromConfiguration = function() {
        let t = this.getPodController();
        if (t) {
            let e = this.getPluginId();
            return t.getExecutionUtility().findPageNameByControlId(e)
        }
        return null
    };
    c.prototype.getDefinedOnPageName = function() {
        if (!this._sDefinedOnPageName) {
            let t = this.getPodController();
            if (t) {
                let e = this.getPluginId();
                this._sDefinedOnPageName = t.getExecutionUtility().findDefinedOnPageNameByControlId(e)
            }
        }
        return this._sDefinedOnPageName
    };
    c.prototype.getDynamicPageTitle = function() {
        let t = this.getActiveViewController();
        if (t) {
            return t.getDynamicPageTitle()
        }
        return null
    };
    c.prototype.getDisplayType = function() {
        if (!this._sDisplayType) {
            let t = this.getOwnerComponent();
            if (t && t.getDisplayType) {
                this._sDisplayType = t.getDisplayType()
            }
        }
        return this._sDisplayType
    };
    c.prototype.isDefaultPlugin = function() {
        if (typeof this._bDefaultPlugin === "undefined") {
            let t = this.getOwnerComponent();
            if (t && t.getDefaultPlugin) {
                this._bDefaultPlugin = t.getDefaultPlugin()
            }
        }
        return this._bDefaultPlugin
    };
    c.prototype.isPopup = function() {
        let t = this.getDisplayType();
        if (!t || t !== "popup" && t !== "popup_modeless") {
            return false
        }
        return true
    };
    c.prototype.isModalPopup = function() {
        let t = this.getDisplayType();
        if (!t || t !== "popup_modal") {
            return false
        }
        return true
    };
    c.prototype.isSfcPodSelectionMode = function() {
        let t = this.getPodSelectionModel();
        if (t) {
            let e = t.getPodSelectionType();
            if (s.isNotEmpty(e) && e === l.Sfc) {
                return true
            }
        }
        return false
    };
    c.prototype.getConfiguration = function() {
        if (!this._oPluginConfiguration) {
            let t = this.getOwnerComponent();
            if (t && t.getConfiguration) {
                this._oPluginConfiguration = t.getConfiguration()
            }
        }
        return this._oPluginConfiguration
    };
    c.prototype.getConfigurationValue = function(t) {
        let e = this.getConfiguration();
        if (e) {
            return e[t]
        }
        return null
    };
    c.prototype.renderAssignedButtons = function(t, e) {
        let o = this.getAssignedButtonsHandler();
        return o.renderButtons(t, e)
    };
    c.prototype.getAssignedButtonsHandler = function() {
        return new n(this)
    };
    c.prototype.setBusy = function(t, e) {
        let o = this.getActiveViewController();
        if (o) {
            o.getView().setBusy(t, e);
            return
        }
        this.getView().setBusy(t)
    };
    c.prototype.ajaxGetRequest = function(t, e, o, r) {
        let i = this.getActiveViewController();
        if (i) {
            i.ajaxGetRequest(t, e, o, r)
        }
    };
    c.prototype.ajaxPostRequest = function(t, e, o, r) {
        let i = this.getActiveViewController();
        if (i) {
            i.ajaxPostRequest(t, e, o, r)
        }
    };
    c.prototype.ajaxPatchRequest = function(t, e, o, r) {
        let i = this.getActiveViewController();
        if (i) {
            i.ajaxPatchRequest(t, e, o, r)
        }
    };
    c.prototype.ajaxPutRequest = function(t, e, o, r) {
        let i = this.getActiveViewController();
        if (i) {
            i.ajaxPutRequest(t, e, o, r)
        }
    };
    c.prototype.ajaxDeleteRequest = function(t, e, o, r) {
        let i = this.getActiveViewController();
        if (i) {
            i.ajaxDeleteRequest(t, e, o, r)
        }
    };
    c.prototype.getI18nResourceBundle = function() {
        if (!this.i18nResourceBundle && this.getView()) {
            let t = this.getView().getModel("i18n");
            if (!t) {
                let e = this.getOwnerComponent();
                if (e && e.getModel) {
                    t = e.getModel("i18n")
                }
            }
            if (t) {
                this.i18nResourceBundle = t.getResourceBundle()
            }
        }
        return this.i18nResourceBundle
    };
    c.prototype.getI18nText = function(t, e) {
        let o = this.getI18nResourceBundle();
        if (!o) {
            return t
        }
        return o.getText(t, e)
    };
    c.prototype.getGlobalI18nText = function(t, e) {
        return r.getGlobalBundle().getText(t, e)
    };
    c.prototype.getUserPreference = function(t) {
        let e = this.getPodController();
        if (e && e.getUserPreferences) {
            let o = e.getUserPreferences();
            if (o) {
                return o.getPreference(t)
            }
        }
        return null
    };
    c.prototype.setUserPreference = function(t, e) {
        let o = this.getPodController();
        if (o && o.getUserPreferences) {
            let r = o.getUserPreferences();
            if (r) {
                r.setPreference(t, e)
            }
        }
    };
    c.prototype.setGlobalProperty = function(t, e) {
        let o = this.getOwnerComponent();
        if (o) {
            o.setGlobalProperty(t, e)
        }
    };
    c.prototype.getGlobalProperty = function(t) {
        let e = this.getOwnerComponent();
        if (e) {
            return e.getGlobalProperty(t)
        }
        return null
    };
    c.prototype.removeGlobalProperty = function(t) {
        let e = this.getOwnerComponent();
        if (e) {
            return e.removeGlobalProperty(t)
        }
        return null
    };
    c.prototype.getGlobalModel = function() {
        let t = this.getOwnerComponent();
        if (t) {
            return t.getGlobalModel()
        }
        return null
    };
    c.prototype.getQueryParameter = function(t) {
        return this.getPodController().getQueryParameter(t)
    };
    c.prototype.getPlantDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPlantDataSourceUri) {
            return t.getPlantDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PLANT_DS_PATH)
    };
    c.prototype.getPlantRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPlantRestDataSourceUri) {
            return t.getPlantRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PLANT_DS_REST_PATH)
    };
    c.prototype.getProductDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductDataSourceUri) {
            return t.getProductDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PRODUCT_DS_PATH)
    };
    c.prototype.getProductRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductRestDataSourceUri) {
            return t.getProductRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PRODUCT_DS_REST_PATH)
    };
    c.prototype.getProductionDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductionDataSourceUri) {
            return t.getProductionDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PRODUCTION_DS_REST_PATH)
    };
    c.prototype.getProductionODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getProductionODataDataSourceUri) {
            return t.getProductionODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PRODUCTION_DS_PATH)
    };
    c.prototype.getPodFoundationDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPodFoundationDataSourceUri) {
            return t.getPodFoundationDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.POD_FOUNDATION_DS_REST_PATH)
    };
    c.prototype.getPodFoundationODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPodFoundationODataDataSourceUri) {
            return t.getPodFoundationODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.POD_FOUNDATION_DS_PATH)
    };
    c.prototype.getNonConformanceDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getNonConformanceDataSourceUri) {
            return t.getNonConformanceDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.NON_CONFORMANCE_DS_REST_PATH)
    };
    c.prototype.getNonConformanceODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getNonConformanceODataDataSourceUri) {
            return t.getNonConformanceODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.NON_CONFORMANCE_DS_PATH)
    };
    c.prototype.getAssemblyDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAssemblyDataSourceUri) {
            return t.getAssemblyDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.ASSEMBLY_DS_REST_PATH)
    };
    c.prototype.getAssemblyODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAssemblyODataDataSourceUri) {
            return t.getAssemblyODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.ASSEMBLY_DS_PATH)
    };
    c.prototype.getClassificationDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getClassificationDataSourceUri) {
            return t.getClassificationDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.CLASSIFICATION_DS_PATH)
    };
    c.prototype.getDemandODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getDemandODataDataSourceUri) {
            return t.getDemandODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.DEMAND_DS_PATH)
    };
    c.prototype.getDemandRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getDemandRestDataSourceUri) {
            return t.getDemandRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.DEMAND_DS_REST_PATH)
    };
    c.prototype.getInventoryDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getInventoryDataSourceUri) {
            return t.getInventoryDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.INVENTORY_DS_REST_PATH)
    };
    c.prototype.getInventoryODataDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getInventoryODataDataSourceUri) {
            return t.getInventoryODataDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.INVENTORY_DS_PATH)
    };
    c.prototype.getWorkInstructionRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getWorkInstructionRestDataSourceUri) {
            return t.getWorkInstructionRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.WI_DS_REST_PATH)
    };
    c.prototype.getWorkInstructionDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getWorkInstructionDataSourceUri) {
            return t.getWorkInstructionDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.WI_DS_PATH)
    };
    c.prototype.getDataCollectionRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getDataCollectionRestDataSourceUri) {
            return t.getDataCollectionRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.DC_DS_REST_PATH)
    };
    c.prototype.getDataCollectionDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getDataCollectionDataSourceUri) {
            return t.getDataCollectionDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.DC_DS_PATH)
    };
    c.prototype.getOEERestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getOEERestDataSourceUri) {
            return t.getOEERestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.OEE_DS_REST_PATH)
    };
    c.prototype.getOEEDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getOEEDataSourceUri) {
            return t.getOEEDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.OEE_DS_PATH)
    };
    c.prototype.getAinRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAinRestDataSourceUri) {
            return t.getAinRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.AIN_DS_REST_PATH)
    };
    c.prototype.getAinDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAinDataSourceUri) {
            return t.getAinDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.AIN_DS_REST_PATH)
    };
    c.prototype.getPackingRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPackingRestDataSourceUri) {
            return t.getPackingRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PACKING_DS_REST_PATH)
    };
    c.prototype.getPackingODataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPackingRestDataSourceUri) {
            return t.getPackingODataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PACKING_DS_ODATA_PATH)
    };
    c.prototype.getNumberingRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getNumberingRestDataSourceUri) {
            return t.getNumberingRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.NUMBERING_DS_REST_PATH)
    };
    c.prototype.getPeRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPeRestDataSourceUri) {
            return t.getPeRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PE_DS_REST_PATH)
    };
    c.prototype.getFmRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getFmRestDataSourceUri) {
            return t.getFmRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.FM_DS_REST_PATH)
    };
    c.prototype.getPublicApiRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getPublicApiRestDataSourceUri) {
            return t.getPublicApiRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.PUBLIC_API_HUB_REST_PATH)
    };
    c.prototype.getImageOverlayDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getImageOverlayDataSourceUri) {
            return t.getImageOverlayDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.IMAGE_OVERLAY_DS_PATH)
    };
    c.prototype.getDataSourceUriFromManifest = function(t) {
        let e = this.getOwnerComponent();
        if (e) {
            if (e.getBaseManifestEntry) {
                return e.getBaseManifestEntry(t)
            } else if (e.getManifestEntry) {
                return e.getManifestEntry(t)
            }
        }
        this._logMessage("getDataSourceUriFromManifest: datasource for '" + t + "' not found in manifest");
        return null
    };
    c.prototype.getActivityConfirmationDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getActivityConfirmationDataSourceUri) {
            return t.getActivityConfirmationDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.AC_DS_PATH)
    };
    c.prototype.getActivityConfirmationRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getActivityConfirmationRestDataSourceUri) {
            return t.getActivityConfirmationRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.AC_DS_REST_PATH)
    };
    c.prototype.getQualityInspectionRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getQualityInspectionRestDataSourceUri) {
            return t.getQualityInspectionRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.QUALITY_INSPECTION_REST_PATH)
    };
    c.prototype.getQualityInspectionDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getQualityInspectionDataSourceUri) {
            return t.getQualityInspectionDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.QUALITY_INSPECTION_DS_PATH)
    };
    c.prototype.getToolRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getToolRestDataSourceUri) {
            return t.getToolRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.TOOL_DS_REST_PATH)
    };
    c.prototype.getLogisticsRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getLogisticsRestDataSourceUri) {
            return t.getLogisticsRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.LOGISTICS_DS_REST_PATH)
    };
    c.prototype.getAlertRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAlertRestDataSourceUri) {
            return t.getAlertRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.ALERT_DS_REST_PATH)
    };
    c.prototype.getAlertODataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getAlertODataSourceUri) {
            return t.getAlertODataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.ALERT_DS_ODATA_PATH)
    };
    c.prototype.getTimeTrackingRestDataSourceUri = function() {
        let t = this.getPodController();
        if (t && t.getTimeTrackingRestDataSourceUri) {
            return t.getTimeTrackingRestDataSourceUri()
        }
        return this.getDataSourceUriFromManifest(e.TIMETRACKING_DS_REST_PATH)
    };
    c.prototype._logMessage = function(t) {
        g.error(t)
    };
    c.prototype.showErrorMessage = function(t, e, o, r) {
        let i = this.getPodController();
        if (i) {
            i.showErrorMessage(t, e, o, r)
        }
    };
    c.prototype.showSuccessMessage = function(t, e, o) {
        let r = this.getPodController();
        if (r) {
            r.showSuccessMessage(t, e, o)
        }
    };
    c.prototype.showMessage = function(t, e, o, r) {
        let i = this.getPodController();
        if (i) {
            i.showMessage(t, e, o, r)
        }
    };
    c.prototype.isCloseable = function() {
        return !(this.isPopup() || this.isDefaultPlugin())
    };
    c.prototype._getEventHandler = function() {
        let t = this.getPodController();
        if (t && t.getEventHandler) {
            return t.getEventHandler()
        }
        return null
    };
    c.prototype._getEventBus = function() {
        let t = this.getPodController();
        if (t && t.getEventBus) {
            return t.getEventBus()
        }
        return null
    };
    c.prototype._configureNavigationButtonVisibility = function() {
        let t = this.getView();
        let e = this.getConfiguration();
        let o = true;
        let r = true;
        if (!this.isCloseable()) {
            r = false;
            o = false
        } else if (e) {
            o = typeof e.backButtonVisible === "undefined" ? true : e.backButtonVisible;
            r = typeof e.closeButtonVisible === "undefined" ? true : e.closeButtonVisible
        }
        let i = t.byId("backButton");
        if (i) {
            i.setVisible(o)
        }
        let n = t.byId("closeButton");
        if (n) {
            n.setVisible(r)
        }
    };
    return c
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/PodVariantConfigurationDelegate", ["sap/ui/base/Object", "sap/ui/model/json/JSONModel", "sap/m/Token", "sap/dm/dme/podfoundation/model/OperationKeyData", "sap/dm/dme/podfoundation/model/ResourceKeyData"], function(e, t, i, n, a) {
    "use strict";
    const r = "DMPodVariants_";
    const l = "*standard*";
    let o = "";
    let s = [];
    return e.extend("sap.dm.dme.podfoundation.controller.PodVariantConfigurationDelegate", {
        constructor: function(e) {
            this._oPluginController = e;
            this.bIgnoreOperationChangeEvent = false;
            this.bOperationChangeEvent = false
        },
        enableVariantConfiguration: function() {
            if (this.isVariantManagementAvailable()) {
                this._initializeVariantManagement()
            }
        },
        isVariantManagementAvailable: function() {
            this.variantManagementAvailable = false;
            if (!this._oVariantMgmtControl && (this._oPluginController && this._oPluginController._getPodControllerView)) {
                this._oVariantMgmtControl = this._oPluginController._getPodControllerView().byId("pageHeaderVariant")
            }
            if (this._oVariantMgmtControl) {
                this.variantManagementAvailable = true
            }
            return this.variantManagementAvailable
        },
        _initializeVariantManagement() {
            if (this.isVariantManagementAvailable()) {
                this._oVariantMgmtControl.setBackwardCompatibility(false);
                this._oVariantModel = new t({
                    variantSet: [],
                    defaultVariant: l,
                    initialSelectedVariantKey: l,
                    standardItemText: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("VARIANT_MANAGEMENT_STANDARD")
                });
                this._oVariantMgmtControl.setModel(this._oVariantModel);
                this.aPluginDefaultValues = this._getSeededValuesFromPlugin();
                this.aUrlDefaultValues = this._getSeededValuesFromUrlParameters()
            }
        },
        getVariantKey: function() {
            return this.sVariantSetKey
        },
        setVariantKey: function(e) {
            this.sVariantSetKey = r + e
        },
        setFilterIds: function(e) {
            s = e
        },
        getFilterIds: function() {
            return s
        },
        variantCallback: function(e, t) {
            this._oVariantModel.setProperty("/variantSet", e);
            this._oVariantModel.setProperty("/initialSelectedVariantKey", t);
            this._oVariantModel.setProperty("/defaultVariant", t);
            let i = window.location.href;
            let n = {};
            if (i.lastIndexOf("&&") > -1) {
                let e = i.substring(i.lastIndexOf("&&"));
                n = this.parseQueryString(e)
            }
            if (Object.keys(n).length === 0) {
                this._oVariantMgmtControl.fireSelect({
                    id: this._oVariantMgmtControl.getId(),
                    key: t
                })
            }
            this.setCurrentVariantModified(false)
        },
        getAllVariants: function(e) {
            let t = {},
                i = [],
                n = [];
            let a = this.getVariantKey();
            this._oPersonalizationService = sap.ushell.Container.getService("Personalization");
            this._oPersonalizationContainer = this._oPersonalizationService.getPersonalizationContainer("MyVariantContainer");
            this._oPersonalizationContainer.fail(function() {
                e(i, l)
            });
            this._oPersonalizationContainer.done(function(r) {
                if (!r.containsVariantSet(a)) {
                    r.addVariantSet(a)
                }
                t = r.getVariantSet(a);
                n = t.getVariantNamesAndKeys();
                for (let e in n) {
                    if (n.hasOwnProperty(e)) {
                        let t = {
                            VariantKey: n[e],
                            VariantName: e
                        };
                        i.push(t)
                    }
                }
                let l = t.getCurrentVariantKey();
                e(i, l)
            }.bind(this))
        },
        _getFiltersWithValues: function() {
            let e = {};
            let t = this._oPluginController.getView().byId("filterBar");
            let i = t.getFilterGroupItems();
            i.forEach(function(i) {
                let n = t.determineControlByFilterItem(i);
                let a = i.getName();
                let r = n.getMetadata().getName();
                let l = n.getId();
                let o = n.getEnabled();
                let s = l.substring(l.lastIndexOf("--") + 2);
                e[a] = {};
                if (r === "sap.m.Input" && n.getValue) {
                    e[a].value = n.getValue()
                } else if (r === "sap.m.Select" && n.getSelectedKey) {
                    e[a].value = n.getSelectedKey()
                } else if (r === "sap.m.MultiComboBox" && n.getSelectedItems) {
                    let t = n.getSelectedItems();
                    let i = [];
                    for (let e = 0; e < t.length; e++) {
                        i.push(t[e].getKey())
                    }
                    e[a].value = i.join(",")
                } else if (r === "sap.m.DateTimePicker" && n.getDateValue) {
                    e[a].value = n.getDateValue() && n.getDateValue().toISOString()
                }
                e[a].visible = i.getVisibleInFilterBar();
                e[a].controlType = r;
                e[a].controlId = s;
                e[a].controlEnabled = o
            }.bind(this));
            return e
        },
        setCurrentVariantModified: function(e) {
            if (e === true) {
                this._oVariantMgmtControl.currentVariantSetModified(true)
            } else {
                this._oVariantMgmtControl.currentVariantSetModified(false)
            }
        },
        parseQueryString: function(e) {
            let t = {};
            let i = e.split("&&");
            if (i.length <= 1) {
                return t
            }
            if (i[1] === "") {
                return {}
            }
            i = i[1].split("&");
            for (let e = 0, n = i.length; e < n; e++) {
                let n = i[e].split("=");
                t[n[0]] = decodeURI(n[1])
            }
            return t
        },
        onSaveAsVariant: function(e) {
            let t = this._getFiltersWithValues();
            this.saveVariant(e.mParameters.name, t, e.mParameters.def, function() {}.bind(this))
        },
        saveVariant: function(e, t, i, n) {
            let a = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                n && n(false)
            });
            this._oPersonalizationContainer.done(function(r) {
                let l = {},
                    o = {},
                    s = "";
                if (!r.containsVariantSet(a)) {
                    r.addVariantSet(a)
                }
                l = r.getVariantSet(a);
                s = l.getVariantKeyByName(e);
                if (s) {
                    o = l.getVariant(s)
                } else {
                    o = l.addVariant(e);
                    this._updateNewVariantItemKey(e, l)
                }
                if (t) {
                    o.setItemValue("Filter", JSON.stringify(t))
                }
                r.save().fail(function() {
                    n(false)
                }).done(function() {
                    n(true);
                    if (i) {
                        this.changeDefaultVariant(o.getVariantKey())
                    }
                }.bind(this))
            }.bind(this))
        },
        onManageVariant: function(e) {
            this._oMappedVariants = e.getSource().oVariantList.getItems().reduce(function(e, t) {
                e[t.getProperty("key")] = t.getProperty("text");
                return e
            }, {});
            let t = e.getParameter("renamed");
            let i = e.getParameter("def");
            let n = e.getParameter("deleted");
            if (n.length > 0) {
                this.deleteVariants(n, function(e) {})
            }
            if (t.length > 0) {
                this.renameVariants(t, function(e) {})
            }
            if (i !== e.getSource().getInitialSelectionKey()) {
                this.changeDefaultVariant(i)
            }
            this._oMappedVariants = e.getSource().oVariantList.getItems().reduce(function(e, t) {
                e[t.getProperty("key")] = t.getProperty("text");
                return e
            }, {})
        },
        deleteVariants: function(e, t) {
            let i = {};
            let n;
            let a = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {});
            this._oPersonalizationContainer.done(function(r) {
                if (!r.containsVariantSet(a)) {
                    r.addVariantSet(a)
                }
                i = r.getVariantSet(a);
                for (let t of e) {
                    if (t) {
                        n = this._oMappedVariants[t];
                        let e = i.getVariantKeyByName(n);
                        i.delVariant(e)
                    }
                }
                r.save().fail(function() {
                    t(false)
                }).done(function() {
                    t(true)
                }.bind(this))
            }.bind(this))
        },
        _updateNewVariantItemKey: function(e, t) {
            let i = jQuery.grep(this._oVariantMgmtControl.getVariantItems(), function(t) {
                return t.getProperty("text") === e
            })[0];
            if (i) {
                i.setProperty("key", t.getVariantKeyByName(e))
            }
        },
        renameVariants: function(e, t) {
            let i = {};
            let n = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {});
            this._oPersonalizationContainer.done(function(a) {
                if (!a.containsVariantSet(n)) {
                    a.addVariantSet(n)
                }
                i = a.getVariantSet(n);
                for (let t of e) {
                    if (t) {
                        let e = i.getVariant(t.key);
                        let n = e.getItemValue("Filter");
                        i.delVariant(t.key);
                        let a = i.addVariant(t.name);
                        this._updateNewVariantItemKey(t.name, i);
                        a.setItemValue("Filter", n)
                    }
                }
                a.save().fail(function() {
                    t(false)
                }).done(function() {
                    t(true)
                }.bind(this))
            }.bind(this))
        },
        changeDefaultVariant: function(e, t) {
            let i = {};
            let n = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {});
            this._oPersonalizationContainer.done(function(a) {
                if (!a.containsVariantSet(n)) {
                    a.addVariantSet(n)
                }
                i = a.getVariantSet(n);
                i.setCurrentVariantKey(e);
                a.save().fail(function() {
                    t && t(false)
                }).done(function() {
                    this._oVariantModel.setProperty("/defaultVariant", e);
                    t && t(true)
                }.bind(this))
            }.bind(this))
        },
        onSelectVariant: function(e) {
            let t = e.getSource().getModel("save_enablement").getProperty("/selectedVariant");
            if (t) {
                this.setSelectVariantValue(t)
            }
        },
        setSelectVariantValue: function(e) {
            this.getVariantFromKey(e, function(e) {
                if (!e) {
                    this._lastSelectedVariant = l;
                    this._clearOtherFilters();
                    let e = this._assignDefaultFilterValues();
                    let t = this._oPluginController.getPodSelectionModel();
                    if (e > 0) {
                        this.invokeFilterGoButton();
                        this._oPluginController.firePodSelectionChangeEvent(t)
                    } else {
                        this._clearPodSelectionModel();
                        this.invokeFilterClearButton();
                        this._oPluginController.firePodSelectionChangeEvent(t)
                    }
                } else {
                    let t = JSON.parse(e._oItemMap.entries.Filter);
                    let i = this.setSelectVariantFilterValue(t);
                    let n = this.allowPodSelectionRefresh(i);
                    let a = this;
                    a.populatePodSelectionModel(i, !n);
                    this._lastSelectedVariant = e.getVariantKey()
                }
            }.bind(this))
        },
        _clearOtherFilters: function() {
            this.setCurrentVariantModified(this._lastSelectedVariant && this._lastSelectedVariant !== l);
            this._clearControlFilter("userFilter");
            this._clearControlFilter("operationFilter");
            this._clearControlFilter("resourceFilter");
            this._clearControlFilter("quantityFilter");
            this._clearControlFilter("workCenterFilter");
            this._clearControlFilter("inputFilter")
        },
        _clearControlFilter: function(e) {
            let t = this._oPluginController.byId(e);
            if (t) {
                if (t.removeAllTokens) {
                    t.removeAllTokens()
                } else if (t.setSelectedKey) {
                    t.setSelectedKey("")
                } else if (t.setValue) {
                    t.setValue("")
                }
            }
        },
        setSelectVariantFilterValue: function(e) {
            let t = [];
            for (let i in e) {
                let n = e[i];
                let a = e[i].controlId;
                let r = e[i].controlEnabled;
                let l = this._oPluginController.byId(a);
                let o = this._isFieldVisible(a);
                if (!o) {
                    continue
                }
                if (r) {
                    if (l.setSelectedKeys) {
                        l.setSelectedKeys(n.value && n.value.split(","));
                        t.push(this.createControlObject(a, n.value && n.value.split(",")))
                    } else if (l.setValue) {
                        l.setValue(n.value);
                        t.push(this.createControlObject(a, n.value))
                    } else if (l.setSelectedKey) {
                        l.setSelectedKey(n.value);
                        t.push(this.createControlObject(a, n.value))
                    }
                }
            }
            return t
        },
        _clearPodSelectionModel: function() {
            let e = this._oPluginController.getPodSelectionModel();
            e.clear()
        },
        _isFieldVisible: function(e) {
            let t = this._oPluginController._getViewData();
            if (e === "quantityFilter") {
                return t.quantityFilterVisible
            } else if (e === "userFilter") {
                return t.userFilterVisible
            }
            return true
        },
        createControlObject: function(e, t) {
            return {
                controlId: e,
                value: t
            }
        },
        getFilterValueCount: function(e) {
            let t = 0;
            e.forEach(function(e) {
                if (e.controlId !== "inputTypeFilter" && e.controlId !== "inputFilter") {
                    let i = e.value;
                    if (i && i.trim().length > 0) {
                        t++
                    }
                }
            });
            return t
        },
        allowPodSelectionRefresh: function(e) {
            let t = this.getFilterValueCount(e);
            if (t > 0) {
                return true
            }
            return false
        },
        _assignDefaultFilterValues: function() {
            this._setFilterControlValues(this.aPluginDefaultValues);
            this.populatePodSelectionModel(this.aPluginDefaultValues, true);
            this._setFilterControlValues(this.aUrlDefaultValues);
            this.populatePodSelectionModel(this.aUrlDefaultValues, true);
            return this.aPluginDefaultValues.length + this.aUrlDefaultValues.length
        },
        _setFilterControlValues: function(e) {
            for (let t in e) {
                let i = this._oPluginController.byId(e[t].controlId);
                let n = e[t].value;
                if (i.setSelectedKeys) {
                    i.setSelectedKeys(n && n.split(","))
                } else if (i.setValue) {
                    i.setValue(n)
                } else if (i.setSelectedKey) {
                    i.setSelectedKey(n)
                }
            }
        },
        _getSeededValuesFromPlugin: function() {
            let e = [];
            let t = this._oPluginController._getViewData();
            let i = t.operation;
            let n = t.workCenter;
            let a = t.user;
            let r = t.resource;
            let l = t.quantity;
            e = this._addFilterToArray(e, "workCenterFilter", n);
            e = this._addFilterToArray(e, "operationFilter", i);
            e = this._addFilterToArray(e, "userFilter", a);
            e = this._addFilterToArray(e, "resourceFilter", r);
            e = this._addFilterToArray(e, "quantityFilter", l);
            return e
        },
        _getSeededValuesFromUrlParameters: function() {
            let e = [];
            let t = this._oPluginController;
            let i = t._toUpperCase(t.getQueryParameter("WORKCENTER"));
            let n = t._toUpperCase(t.getQueryParameter("OPERATION"));
            let a = t._toUpperCase(t.getQueryParameter("USER"));
            let r = t._toUpperCase(t.getQueryParameter("RESOURCE"));
            let l = t._toUpperCase(t.getQueryParameter("QUANTITY"));
            e = this._addFilterToArray(e, "workCenterFilter", i);
            e = this._addFilterToArray(e, "operationFilter", n);
            e = this._addFilterToArray(e, "userFilter", a);
            e = this._addFilterToArray(e, "resourceFilter", r);
            e = this._addFilterToArray(e, "quantityFilter", l);
            return e
        },
        _addFilterToArray: function(e, t, i) {
            if (i) {
                let n = this._oPluginController._toUpperCase(i);
                e.push({
                    controlId: t,
                    value: n
                })
            }
            return e
        },
        populatePodSelectionModel: function(e, t) {
            let i = this._oPluginController.getPodSelectionModel();
            let n = false;
            let r = this;
            e.forEach(function(e) {
                let t = r._isFieldVisible(e.controlId);
                if (!t) {
                    return
                }
                if (e.controlId === "resourceFilter") {
                    i.setResource(new a(e.value));
                    n = true
                } else if (e.controlId === "operationFilter") {
                    r.processOperationActivityChange(e.value).then(function(e) {
                        if (!e) {
                            i.clearOperations()
                        }
                    }.bind(r))
                } else if (e.controlId === "userFilter") {
                    i.setUser(e.value);
                    n = true
                } else if (e.controlId === "quantityFilter") {
                    i.setQuantity(e.value);
                    n = true
                } else if (e.controlId === "workCenterFilter") {
                    i.setWorkCenter(e.value);
                    n = true
                }
            });
            if (n && !t) {
                let e = this;
                setTimeout(function() {
                    e.invokeFilterGoButton();
                    e._oPluginController.firePodSelectionChangeEvent(i)
                }, 100)
            }
        },
        invokeFilterGoButton: function() {
            let e = this._oPluginController.getView().byId("filterBar-btnGo");
            e.firePress()
        },
        invokeFilterClearButton: function() {
            let e = this._oPluginController.getView().byId("filterBar-btnClear");
            e.firePress()
        },
        getVariantFromKey: function(e, t) {
            let i = this.getVariantKey();
            this._oPersonalizationContainer.fail(function() {
                t && t(false)
            });
            this._oPersonalizationContainer.done(function(n) {
                let a = {};
                if (!n.containsVariantSet(i)) {
                    n.addVariantSet(i)
                }
                a = n.getVariantSet(i);
                let r = a.getVariantKeyByName(e);
                t(a.getVariant(r))
            }.bind(this))
        },
        processOperationActivityChange: function(e) {
            let t = this._oPluginController;
            let i = this;
            return new Promise(function(n) {
                let a = t.getProductDataSourceUri() + "Operations?$select=ref,operation,version,currentVersion&$filter=operation eq '" + e + "'" + " and operation ne '_SYSTEM'";
                if (e) {
                    t.ajaxGetRequest(a, null, function(t) {
                        let a = i.validateAndSaveOperationActivityInPodSelectionModel(e, t);
                        n(a);
                        return
                    })
                } else {
                    i.changeOperationActivityInPodSelectionModel(e)
                }
                n(true)
            })
        },
        changeOperationActivityInPodSelectionModel: function(e, t) {
            let i = this._oPluginController.getPodSelectionModel();
            let a;
            if (i) {
                a = i.getOperation()
            }
            i.clearOperations();
            let r;
            if (e) {
                r = new n(e);
                if (t) {
                    let e = t.substr(t.lastIndexOf(",") + 1);
                    r.setRef(t);
                    r.setVersion(e)
                }
                i.addOperation(r)
            }
        },
        validateAndSaveOperationActivityInPodSelectionModel: function(e, t) {
            let i = e.toUpperCase();
            let n = false;
            let a = this;
            t.value.forEach(function(e) {
                if (e.currentVersion && e.operation === i) {
                    a.changeOperationActivityInPodSelectionModel(e.operation, e.ref);
                    n = true
                }
            });
            return n
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/PrintLabelPropertyEditorController", ["sap/ui/core/mvc/Controller"], function(e) {
    "use strict";
    var t = e.extend("sap.dm.dme.podfoundation.controller.PrintLabelPropertyEditorController", {
        beforeOpen: function(e) {
            var t = this.getEditorTable();
            t.setModel(this._oTableModel)
        },
        getEditorTable: function() {
            return sap.ui.getCore().byId("printLabelPropertyEditorDialog")
        },
        setTableModel: function(e) {
            this._oTableModel = e
        },
        setCloseHandler: function(e, t) {
            this._fnCloseHandler = e;
            this._oFnContext = t
        },
        _handlePrintLabelPropertyEditorDialogClose: function(e) {
            var t = false;
            if (e && e.escPressed) {
                t = e.escPressed
            }
            var o = this.getEditorTable();
            var r = o.getModel();
            var n = r.getData();
            var l = true;
            this._fnCloseHandler.call(this._oFnContext, n, l)
        }
    });
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/ProductionProcessSelectionViewController", ["sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, r, o) {
    "use strict";
    var t = e.extend("sap.dm.dme.podfoundation.controller.ProductionProcessSelectionViewController", {
        onProductionProcessSelectionSearch: function(e) {
            var t = e.getParameter("value");
            var n = new r("name", o.Contains, t);
            var i = e.getParameter("itemsBinding");
            i.filter([n]);
            return n
        }
    });
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/SinglePluginSelectionViewController", ["sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, n, i) {
    "use strict";
    var t = e.extend("sap.dm.dme.podfoundation.controller.SinglePluginSelectionViewController", {
        config: {
            initialRank: 0,
            defaultRank: 10240
        },
        onSinglePluginSelectionSearch: function(e) {
            var t = e.getParameter("value");
            var r = new n("title", i.Contains, t);
            var a = e.getParameter("itemsBinding");
            a.filter([r]);
            return r
        }
    });
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/extensions/LifecycleExtension", ["sap/ui/core/mvc/ControllerExtension", "sap/dm/dme/podfoundation/controller/extensions/LifecycleExtensionConstants"], function(e, n) {
    "use strict";
    let t = e.extend("sap.dm.dme.podfoundation.controller.extensions.LifecycleExtension", {
        metadata: {
            methods: {
                onBeforeRendering: {
                    final: false,
                    public: true
                },
                onBeforeRenderingPlugin: {
                    final: false,
                    public: true
                },
                onAfterRendering: {
                    final: false,
                    public: true
                },
                onExit: {
                    final: false,
                    public: true
                }
            }
        }
    });
    t.prototype.onBeforeRendering = function() {
        let e = this._getCustomExtension();
        if (e) {
            if (e.isOverridingFunction(n.ON_BEFORE_RENDERING)) {
                e.executeFunction(n.ON_BEFORE_RENDERING, null);
                return
            }
            if (e.isExecutionBefore(n.ON_BEFORE_RENDERING)) {
                e.executeFunction(n.ON_BEFORE_RENDERING, null)
            }
        }
        if (this.base.handleOnBeforeRendering) {
            this.base.handleOnBeforeRendering()
        }
        if (e && e.isExecutionAfter(n.ON_BEFORE_RENDERING)) {
            e.executeFunction(n.ON_BEFORE_RENDERING)
        }
    };
    t.prototype.onBeforeRenderingPlugin = function() {
        let e = this._getCustomExtension();
        if (e) {
            if (e.isOverridingFunction(n.ON_BEFORE_RENDERING_PLUGIN)) {
                e.executeFunction(n.ON_BEFORE_RENDERING_PLUGIN, null);
                return
            }
            if (e.isExecutionBefore(n.ON_BEFORE_RENDERING_PLUGIN)) {
                e.executeFunction(n.ON_BEFORE_RENDERING_PLUGIN, null)
            }
        }
        if (this.base.handleOnBeforeRenderingPlugin) {
            this.base.handleOnBeforeRenderingPlugin()
        }
        if (e && e.isExecutionAfter(n.ON_BEFORE_RENDERING_PLUGIN)) {
            e.executeFunction(n.ON_BEFORE_RENDERING_PLUGIN)
        }
    };
    t.prototype.onAfterRendering = function() {
        let e = this._getCustomExtension();
        if (e) {
            if (e.isOverridingFunction(n.ON_AFTER_RENDERING)) {
                e.executeFunction(n.ON_AFTER_RENDERING, null);
                return
            }
            if (e.isExecutionBefore(n.ON_AFTER_RENDERING)) {
                e.executeFunction(n.ON_AFTER_RENDERING, null)
            }
        }
        if (this.base.handleOnAfterRendering) {
            this.base.handleOnAfterRendering()
        }
        if (e && e.isExecutionAfter(n.ON_AFTER_RENDERING)) {
            e.executeFunction(n.ON_AFTER_RENDERING)
        }
    };
    t.prototype.onExit = function() {
        let e = this._getCustomExtension();
        if (e) {
            if (e.isOverridingFunction(n.ON_EXIT)) {
                e.executeFunction(n.ON_EXIT, null);
                return
            }
            if (e.isExecutionBefore(n.ON_EXIT)) {
                e.executeFunction(n.ON_EXIT, null)
            }
        }
        if (this.base.handleOnExit) {
            this.base.handleOnExit()
        }
        if (e && e.isExecutionAfter(n.ON_EXIT)) {
            e.executeFunction(n.ON_EXIT)
        }
    };
    t.prototype._getCustomExtension = function() {
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.base.getCustomControllerExtension(this, n.EXTENSION_NAME)
        }
        return this._oCustomExtension
    };
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/extensions/LifecycleExtensionConstants", function() {
    "use strict";
    return {
        EXTENSION_NAME: "lifecycleExtension",
        ON_BEFORE_RENDERING: "onBeforeRendering",
        ON_BEFORE_RENDERING_PLUGIN: "onBeforeRenderingPlugin",
        ON_AFTER_RENDERING: "onAfterRendering",
        ON_EXIT: "onExit"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/extensions/NotificationExtension", ["sap/ui/core/mvc/ControllerExtension", "sap/dm/dme/podfoundation/controller/extensions/NotificationExtensionConstants"], function(t, n) {
    "use strict";
    let e = t.extend("sap.dm.dme.podfoundation.controller.extensions.NotificationExtension", {
        metadata: {
            methods: {
                isSubscribingToNotifications: {
                    final: false,
                    public: true
                },
                getCustomNotificationEvents: {
                    final: false,
                    public: true
                },
                getNotificationMessageHandler: {
                    final: false,
                    public: true
                }
            }
        }
    });
    e.prototype.isSubscribingToNotifications = function() {
        let t = this._getCustomExtension();
        if (t) {
            return t.executeFunction(n.IS_SUBSCRIBING, null)
        }
        return false
    };
    e.prototype.getCustomNotificationEvents = function() {
        let t = this._getCustomExtension();
        if (t) {
            return t.executeFunction(n.GET_NOTIFICATION_EVENTS, null)
        }
        return null
    };
    e.prototype.getNotificationMessageHandler = function(t) {
        let e = this._getCustomExtension();
        if (e) {
            return e.executeFunction(n.GET_NOTIFICATION_HANDLER, [t])
        }
        return null
    };
    e.prototype._getCustomExtension = function() {
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.base.getCustomControllerExtension(this, n.EXTENSION_NAME)
        }
        return this._oCustomExtension
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/controller/extensions/NotificationExtensionConstants", function() {
    "use strict";
    return {
        EXTENSION_NAME: "notificationExtension",
        IS_SUBSCRIBING: "isSubscribingToNotifications",
        GET_NOTIFICATION_EVENTS: "getCustomNotificationEvents",
        GET_NOTIFICATION_HANDLER: "getNotificationMessageHandler"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/BaseExtensionsLoader", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/extension/PluginExtensionType", "sap/dm/dme/podfoundation/util/PodUtility"], function(n, t, e) {
    "use strict";
    return n.extend("sap.dm.dme.podfoundation.extension.BaseExtensionsLoader", {
        constructor: function() {
            this._oControllerExtensionsMap = {};
            this._oPropertyEditorExtensionsMap = {}
        },
        getControllerExtensionsMap: function() {
            return this._oControllerExtensionsMap
        },
        setControllerExtensionsMap: function(n) {
            this._oControllerExtensionsMap = n
        },
        getPropertyEditorExtensionsMap: function() {
            return this._oPropertyEditorExtensionsMap
        },
        setPropertyEditorExtensionsMap: function(n) {
            this._oPropertyEditorExtensionsMap = n
        },
        loadPluginExtensions: function(n, e) {
            let o = e.getExtensions();
            if (o && o.length > 0) {
                let e = {};
                let i = {};
                for (const n of o) {
                    let o = n.getExtensionType();
                    if (o === t.Controller) {
                        e[n.getExtensionName()] = n
                    } else if (o === t.PropertyEditor) {
                        i[n.getExtensionName()] = n
                    }
                }
                let s = this.getControllerExtensionsMap();
                s[n] = e;
                this.setControllerExtensionsMap(s);
                let r = this.getPropertyEditorExtensionsMap();
                r[n] = i;
                this.setPropertyEditorExtensionsMap(r)
            }
        },
        _isExtensionToBeIncluded: function(n, t, e) {
            if (!n.inclusions || n.inclusions.length === 0) {
                return false
            }
            for (const o of n.inclusions) {
                if (this._isInclusionMatchFound(o.pods, o.plants, t, e)) {
                    return true
                }
            }
            return false
        },
        _isInclusionMatchFound: function(n, t, o, i) {
            if ((!n || n.length === 0) && (!t || t.length === 0)) {
                return false
            }
            let s = false;
            if (n && n.length > 0) {
                for (const t of n) {
                    if (e.isMatching(t, o)) {
                        s = true;
                        break
                    }
                }
                if (!s) {
                    return false
                }
            }
            if (t && t.length > 0) {
                s = t.indexOf(i) > -1
            }
            return s
        },
        _getExtensionProvider: function(n) {
            return new Promise(function(t) {
                sap.ui.require([n], function(n) {
                    let e = new n;
                    t(e)
                }, function(n) {
                    t(null)
                })
            })
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/BasePluginExtension", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.extension.BasePluginExtension", {
        metadata: {
            methods: {
                getExtensionName: {
                    final: false,
                    public: true
                },
                getExtensionType: {
                    final: false,
                    public: true
                },
                setController: {
                    final: true,
                    public: true
                },
                setCoreExtension: {
                    final: true,
                    public: true
                }
            }
        }
    });
    e.prototype.getExtensionName = function() {
        return null
    };
    e.prototype.getExtensionType = function() {
        return null
    };
    e.prototype.setController = function(t) {
        this._oController = t
    };
    e.prototype.getController = function() {
        return this._oController
    };
    e.prototype.setCoreExtension = function(t) {
        this._oCoreExtension = t
    };
    e.prototype.getCoreExtension = function() {
        return this._oCoreExtension
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/ExtendedRedline", [], function() {
    "use strict";
    var e = {
        ElementType: {
            Line: "line",
            Rectangle: "rectangle",
            Ellipse: "ellipse",
            Freehand: "freehand",
            Text: "text",
            Comment: "comment",
            FreehandClosed: "freehandClosed"
        },
        svgNamespace: "http://www.w3.org/2000/svg"
    };
    return e
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/extension/PluginControllerExtension", ["sap/dm/dme/podfoundation/extension/BasePluginExtension", "sap/ui/core/mvc/OverrideExecution", "sap/dm/dme/podfoundation/extension/PluginExtensionType", "sap/base/Log"], function(e, t, i, n) {
    "use strict";
    let o = e.extend("sap.dm.dme.podfoundation.extension.PluginControllerExtension", {
        metadata: {
            methods: {
                isOverridingFunction: {
                    final: true,
                    public: true
                },
                isExecutionBefore: {
                    final: true,
                    public: true
                },
                isExecutionAfter: {
                    final: true,
                    public: true
                },
                executeFunction: {
                    final: true,
                    public: true
                }
            }
        }
    });
    o.prototype.getExtensionType = function() {
        return i.Controller
    };
    o.prototype.isOverridingFunction = function(e) {
        return this._isCustomOverridingByExecutionType(e, t.Instead)
    };
    o.prototype.isExecutionBefore = function(e) {
        return this._isCustomOverridingByExecutionType(e, t.Before)
    };
    o.prototype.isExecutionAfter = function(e) {
        return this._isCustomOverridingByExecutionType(e, t.After)
    };
    o.prototype._isCustomOverridingByExecutionType = function(e, t) {
        if (this._isFunctionFinal(e)) {
            return false
        }
        let i = null;
        if (this.getMetadata) {
            i = this.getMetadata()
        }
        if (!i || !this.hasOverride(e)) {
            return false
        }
        let n = this.getOverrideExecution(e);
        if (!n) {
            return false
        }
        if (n === t) {
            return true
        }
        return false
    };
    o.prototype.executeFunction = function(e, t) {
        this._logCall(e);
        return this[e].apply(this, t)
    };
    o.prototype._isFunctionFinal = function(e) {
        if (!this._oCoreExtension) {
            return true
        }
        let t = this._oCoreExtension.getMetadata();
        if (!t) {
            return true
        }
        return t.isMethodFinal(e)
    };
    o.prototype.hasOverride = function(e) {
        if (this[e]) {
            return true
        }
        return false
    };
    o.prototype.getOverrideExecution = function(e) {
        return null
    };
    o.prototype.getLogger = function() {
        if (!this._oLogger) {
            let e = "";
            let t = this.getCoreExtension();
            if (t) {
                e = t.getMetadata().getName()
            }
            this._oLogger = n.getLogger(e, n.Level.INFO)
        }
        return this._oLogger
    };
    o.prototype._logCall = function(e) {
        let i = "";
        let n = this;
        if (n) {
            i = n.getMetadata().getName()
        }
        let o = "";
        if (this.isOverridingFunction(e)) {
            o = t.Instead
        } else if (this.isExecutionBefore(e)) {
            o = t.Before
        } else if (this.isExecutionAfter(e)) {
            o = t.After
        }
        let r = `Calling Extension: ${i}.${e}, Type: ${o}`;
        this.getLogger().info(r)
    };
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/PluginExtensionManager", ["sap/ui/base/Object"], function(t) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.extension.PluginExtensionManager", {
        constructor: function(t) {
            this._oController = t;
            this._oControllerExtensionsMap = {};
            this._oPropertyEditorExtensionsMap = {};
            this._bExtensionsLoaded = false
        },
        _initializePluginExtensions: function() {
            if (!this._bExtensionsLoaded) {
                var t = this._oController.getPluginName();
                var n = this._oController.getPodController();
                if (n) {
                    var o = n.getControllerExtensionsMap();
                    if (o && o[t]) {
                        this._oControllerExtensionsMap = o[t]
                    }
                    o = n.getPropertyEditorExtensionsMap();
                    if (o && o[t]) {
                        this._oPropertyEditorExtensionsMap = o[t]
                    }
                    this._bExtensionsLoaded = true
                }
            }
        },
        findCustomControllerExtension: function(t) {
            this._initializePluginExtensions();
            return this._oControllerExtensionsMap[t]
        },
        findCustomPropertyEditorExtension: function(t) {
            this._initializePluginExtensions();
            return this._oPropertyEditorExtensionsMap[t]
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/PluginExtensionProvider", ["sap/ui/base/Object"], function(e) {
    "use strict";
    var n = e.extend("sap.dm.dme.podfoundation.extension.PluginExtensionProvider", {
        metadata: {
            methods: {
                getExtensions: {
                    final: false,
                    public: true
                }
            }
        }
    });
    n.prototype.getExtensions = function() {
        return null
    };
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/PluginExtensionType", function() {
    "use strict";
    return {
        Controller: "Controller",
        PropertyEditor: "PropertyEditor"
    }
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/extension/PluginPropertyEditorExtension", ["sap/dm/dme/podfoundation/extension/BasePluginExtension", "sap/dm/dme/podfoundation/extension/PluginExtensionType"], function(t, e) {
    "use strict";
    var r = t.extend("sap.dm.dme.podfoundation.extension.PluginPropertyEditorExtension", {
        metadata: {
            methods: {
                addPropertyEditorContentBefore: {
                    final: false,
                    public: true
                },
                addPropertyEditorContentAfter: {
                    final: false,
                    public: true
                },
                getPropertyData: {
                    final: false,
                    public: true
                },
                setPropertyData: {
                    final: false,
                    public: true
                },
                getDefaultPropertyData: {
                    final: false,
                    public: true
                }
            }
        }
    });
    r.prototype.getExtensionName = function() {
        return "propertyEditor"
    };
    r.prototype.getExtensionType = function() {
        return e.PropertyEditor
    };
    r.prototype.addPropertyEditorContentBefore = function(t, e) {
        return
    };
    r.prototype.addPropertyEditorContentAfter = function(t, e) {
        return
    };
    r.prototype.getPropertyData = function(t) {
        return t
    };
    r.prototype.setPropertyData = function(t) {
        return t
    };
    r.prototype.getDefaultPropertyData = function(t) {
        return t
    };
    return r
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/RedlineElementFreehandClosed", ["sap/ui/vk/RedlineElementFreehand", "sap/ui/vk/RedlineElement", "sap/dm/dme/podfoundation/extension/ExtendedRedline"], function(e, t, r) {
    "use strict";
    var o = e.extend("sap.dm.dme.podfoundation.extension.RedlineElementFreehandClosed", {
        metadata: {
            properties: {
                fillColor: {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "rgba(0, 0, 0, 0)"
                }
            }
        }
    });
    o.prototype.renderElement = function(e, t) {
        e.openStart("path", this);
        e.attr("d", this._getProcessedPath());
        e.attr("stroke", this.getStrokeColor());
        e.attr("stroke-width", this.getStrokeWidth());
        if (this.getStrokeDashArray().length > 0) {
            e.attr("stroke-dasharray", this.getStrokeDashArray().toString())
        }
        e.attr("opacity", this.getOpacity());
        e.attr("fill", this.getFillColor());
        if (t) {
            e.attr("filter", this._getHaloFilter())
        }
        e.openEnd();
        e.close("path")
    };
    o.prototype.exportJSON = function() {
        return jQuery.extend(true, t.prototype.exportJSON.call(this), {
            type: r.ElementType.FreehandClosed,
            version: 1,
            path: (this.getPath() || []).slice(),
            fillColor: this.getFillColor()
        })
    };
    o.prototype.importJSON = function(e) {
        if (e.type === r.ElementType.FreehandClosed) {
            if (e.version === 1) {
                t.prototype.importJSON.call(this, e);
                if (e.hasOwnProperty("path")) {
                    this.setPath(e.path.slice())
                }
                if (e.hasOwnProperty("fillColor")) {
                    this.setFillColor(e.fillColor)
                }
            } else {
                Log.error("wrong version number")
            }
        } else {
            Log.error("Redlining JSON import: Wrong element type")
        }
        return this
    };
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/extension/tools/ExtendedRedlineTool", ["sap/base/Log", "sap/ui/vk/RedlineElementRectangle", "sap/ui/vk/RedlineElementEllipse", "sap/dm/dme/podfoundation/extension/RedlineElementFreehandClosed", "sap/ui/vk/RedlineElementLine", "sap/ui/vk/RedlineElementText", "sap/ui/vk/tools/RedlineTool", "sap/ui/vk/tools/RedlineToolHandler", "sap/ui/vk/tools/Tool"], function(e, n, t, i, o, l, s, d, a) {
    "use strict";
    var r = {
        rectangle: n,
        ellipse: t,
        freehand: i,
        line: o,
        text: l,
        freehandClosed: i
    };
    var p = s.extend("sap.dm.dme.podfoundation.extension.tools.ExtendedRedlineTool", {
        constructor: function(e, n) {
            a.apply(this, arguments);
            this._viewport = null;
            this._handler = new d(this)
        }
    });
    p.prototype.importJSON = function(n) {
        var t = this.getGizmo();
        n = Array.isArray(n) ? n : [n];
        n.forEach(function(n) {
            var i = r[n.type];
            if (i) {
                t.addRedlineElement((new i).importJSON(n))
            } else {
                e.warning("Unsupported JSON element type " + n.type)
            }
        });
        t.rerender();
        return this
    };
    return p
});
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/BrowseFormatter", [], function() {
    "use strict";
    var t;
    var e = {
        ENABLED: "status.enabled",
        DISABLED: "status.disabled"
    };
    var u = {
        ENABLED: "resourceStatus.enabled",
        DISABLED: "resourceStatus.disabled",
        HOLD: "resourceStatus.hold",
        UNKNOWN: "resourceStatus.unknown",
        PRODUCTIVE: "resourceStatus.productive",
        STANDBY: "resourceStatus.standby",
        ENGINEERING: "resourceStatus.engineering",
        SCHEDULED_DOWN: "resourceStatus.scheduledDown",
        UNSCHEDULED_DOWN: "resourceStatus.unscheduledDown",
        NON_SCHEDULED: "resourceStatus.nonScheduled"
    };

    function r(e, u) {
        return e ? t.getText(e) : u
    }

    function s(t) {
        var e = [];
        e.push({
            key: "ALL",
            text: r("all")
        });
        for (var u in t) {
            if (t.hasOwnProperty(u)) {
                e.push({
                    key: u,
                    text: r(t[u])
                })
            }
        }
        return e
    }
    return {
        init: function(e) {
            t = e
        },
        getStatusText: function(t) {
            return r(e[t], t)
        },
        getResourceStatusText: function(t) {
            return r(u[t], t)
        },
        getStatusEnumText: function(t) {
            var e = t;
            if (t) {
                e = t.toUpperCase()
            }
            return r("enum.status." + e)
        },
        getResourceStatusList: function() {
            return s(u)
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter", ["sap/ui/model/resource/ResourceModel", "sap/dm/dme/model/ResourceModelEnhancer"], function(t, e) {
    "use strict";
    let o;
    let i;
    const n = ["activities", "activityConfirmation", "assembly", "availabilityStrip", "changeEquipmentStatus", "clock", "complete", "componentList", "cycleTimer", "dataCollection", "dataCollectionList", "dataCollectionDataEntry", "dmiKpi", "downtime", "electronicSignature", "goodsReceipt", "guidedSteps", "headerInformation", "home", "kpi", "lmAsset", "lmAssetDetails", "lmAssetDetailsTooltip", "lmAssetOverview", "lmAssetOverviewTooltip", "lmDashboard", "lmOEE", "lmOEEDetails", "lmOEEDetailsTooltip", "lmOEEOverview", "lmOEEOverviewTooltip", "lmProduction", "lmProductionDetails", "lmProductionDetailsTooltip", "lmProductionOverview", "lmProductionOverviewTooltip", "lmQuality", "lmQualityDetails", "lmQualityDetailsTooltip", "lmQualityOverview", "lmQualityOverviewTooltip", "lmWorkCenters", "logBuyoff", "logNc", "main", "materialConsumption", "ncDataTree", "ncSelection", "nonConformance", "operationList", "orderCard", "orderScheduleInformation", "orderSelectionList", "packing", "pageViewer", "phaseDetails", "phaseList", "phases", "postProductionReporting", "productionProcess", "quantityConfirmation", "qualityInspectionCharacteristicList", "qualityInspectionResults", "raiseAlert", "resourceStatus", "sfcCard", "sfcMerge", "sfcRelabel", "sfcSerialize", "sfcSplit", "signoff", "speedLossDetails", "speedLossOrderList", "start", "stopwatch", "transaction", "toolLoading", "toolValidation", "sfcDestinationAssign", "untaggedEvents", "visualInspector", "workInstruction", "workInstructionList", "workInstructionViewer", "workList", "logTool", "details"];
    const r = ["activities", "actions", "button", "create", "menu", "more", "productionProcesses", "transactions"];

    function s(t, e) {
        return t ? o.getText(t) : e
    }

    function a(t) {
        return t.map(function(t) {
            return {
                i18nLabel: s(t),
                i18nName: `I18n[${t}]`
            }
        })
    }

    function l(t) {
        return t.map(function(t) {
            return {
                i18nLabel: s(`${t}Tooltip`),
                i18nName: `I18n[${t}Tooltip]`
            }
        })
    }

    function u(e) {
        return new t({
            bundleName: e
        })
    }
    return {
        init: function() {
            i = u("sap.dm.dme.podfoundation.i18n.buttonLabels");
            const t = i.getResourceBundle();
            const n = t.oUrlInfo.url;
            e.enhanceIndustryTypes(n, i);
            o = i.getResourceBundle()
        },
        getButtonText: function(t) {
            return s(t, "")
        },
        getPageDescriptionText: function(t) {
            return s(t, "")
        },
        getActionButtonLabelList: function() {
            return a(n)
        },
        getActionButtonTooltipList: function() {
            return l(n)
        },
        getNavigationButtonLabelList: function() {
            return a(n)
        },
        getNavigationButtonTooltipList: function() {
            return l(n)
        },
        getGroupButtonLabelList: function() {
            return a(r)
        },
        getGroupButtonTooltipList: function() {
            return l(r)
        },
        getPageDescriptionList: function() {
            return a(n)
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/InfoIconFormatter", ["../images/ImagePool"], function(o) {
    "use strict";
    var e;
    var n;

    function t(e) {
        return o.getImageURI(e, n)
    }

    function i(o) {
        return e.getText(o)
    }
    return {
        init: function(o, t) {
            e = o;
            n = t;
            if (!jQuery.trim(n)) {
                n = "medium"
            }
        },
        getIconTooltip: function(o, e) {
            if (!o) {
                return ""
            }
            if (o === "BUYOFF") {
                return this.getBuyoffIconTooltip(e)
            } else if (o === "DATA_COLLECTION") {
                return this.getDcIconTooltip(e)
            } else if (o === "COMPONENT_LIST") {
                return this.getClIconTooltip(e)
            } else if (o === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIconTooltip(e)
            } else if (o === "TOOL_LIST") {
                return this.getTlIconTooltip(e)
            } else if (o === "WORK_INSTRUCTION") {
                return this.getWiIconTooltip(e)
            } else if (o === "CHANGE_ALERT") {
                return this.getCaIconTooltip(e)
            }
            return ""
        },
        isIconVisible: function(o, e) {
            if (!o) {
                return false
            }
            if (o === "BUYOFF") {
                return this.getBuyoffIconVisible(e)
            } else if (o === "DATA_COLLECTION") {
                return this.getDcIconVisible(e)
            } else if (o === "COMPONENT_LIST") {
                return this.getClIconVisible(e)
            } else if (o === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIconVisible(e)
            } else if (o === "TOOL_LIST") {
                return this.getTlIconVisible(e)
            } else if (o === "WORK_INSTRUCTION") {
                return this.getWiIconVisible(e)
            } else if (o === "CHANGE_ALERT") {
                return this.getCaIconVisible(e)
            }
            return false
        },
        getIcon: function(o, e) {
            if (!o) {
                return ""
            }
            if (o === "BUYOFF") {
                return this.getBuyoffIcon(e)
            } else if (o === "DATA_COLLECTION") {
                return this.getDcIcon(e)
            } else if (o === "COMPONENT_LIST") {
                return this.getClIcon(e)
            } else if (o === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIcon(e)
            } else if (o === "TOOL_LIST") {
                return this.getTlIcon(e)
            } else if (o === "WORK_INSTRUCTION") {
                return this.getWiIcon(e)
            } else if (o === "CHANGE_ALERT") {
                return this.getCaIcon(e)
            }
            return ""
        },
        getBuyoffIconTooltip: function(o) {
            if (!o || !o.buyoffOpenIcon && !o.buyoffClosedIcon) {
                return ""
            }
            if (o.buyoffClosedIcon) {
                return i("buyoffIconFullfilledTooltip")
            }
            return i("buyoffIconTooltip")
        },
        getBuyoffIconVisible: function(o) {
            if (o && (o.buyoffOpenIcon || o.buyoffClosedIcon)) {
                return true
            }
            return false
        },
        getBuyoffIcon: function(o) {
            if (!o || !o.buyoffOpenIcon && !o.buyoffClosedIcon) {
                return ""
            }
            if (o.buyoffClosedIcon) {
                return t("buyoff_fulfil")
            }
            return t("buyoff")
        },
        getDcIconTooltip: function(o) {
            if (!o || !o.dcOpenIcon && !o.dcClosedIcon) {
                return ""
            }
            if (o.dcClosedIcon) {
                return i("dataCollectionFullfilledIconTooltip")
            }
            return i("dataCollectionIconTooltip")
        },
        getDcIconVisible: function(o) {
            if (o && (o.dcOpenIcon || o.dcClosedIcon)) {
                return true
            }
            return false
        },
        getDcIcon: function(o) {
            if (!o || !o.dcOpenIcon && !o.dcClosedIcon) {
                return ""
            }
            if (o.dcClosedIcon) {
                return t("data_col_fulfil")
            }
            return t("data_col")
        },
        getClIconTooltip: function(o) {
            if (!o || !o.compListOpenIcon && !o.compListClosedIcon) {
                return ""
            }
            if (o.compListClosedIcon) {
                return i("assembleFullfilledIconTooltip")
            }
            return i("assembleIconTooltip")
        },
        getClIconVisible: function(o) {
            if (o && (o.compListOpenIcon || o.compListClosedIcon)) {
                return true
            }
            return false
        },
        getClIcon: function(o) {
            if (!o || !o.compListOpenIcon && !o.compListClosedIcon) {
                return ""
            }
            if (o.compListClosedIcon) {
                return t("assemble_fulfil")
            }
            return t("assemble")
        },
        getPsnIconTooltip: function(o) {
            if (!o || !o.collectPSNOpenIcon && !o.collectPSNClosedIcon) {
                return ""
            }
            if (o.collectPSNClosedIcon) {
                return i("collectPSNFullfilledIconTooltip")
            }
            return i("collectPSNIconTooltip")
        },
        getPsnIconVisible: function(o) {
            if (o && (o.collectPSNOpenIcon || o.collectPSNClosedIcon)) {
                return true
            }
            return false
        },
        getPsnIcon: function(o) {
            if (!o || !o.collectPSNOpenIcon && !o.collectPSNClosedIcon) {
                return ""
            }
            if (o.collectPSNClosedIcon) {
                return t("collect_parent_serial_fulfil")
            }
            return t("collect_parent_serial")
        },
        getTlIconTooltip: function(o) {
            if (!o || !o.toolListOpenIcon && !o.toolListClosedIcon) {
                return ""
            }
            if (o.toolListClosedIcon) {
                return i("logToolFullfilledIconTooltip")
            }
            return i("logToolIconTooltip")
        },
        getTlIconVisible: function(o) {
            if (o && (o.toolListOpenIcon || o.toolListClosedIcon)) {
                return true
            }
            return false
        },
        getTlIcon: function(o) {
            if (!o || !o.toolListOpenIcon && !o.toolListClosedIcon) {
                return ""
            }
            if (o.toolListClosedIcon) {
                return t("log_tool_fulfil")
            }
            return t("log_tool")
        },
        getWiIconTooltip: function(o) {
            return i("workInstructionIconTooltip")
        },
        getWiIconVisible: function(o) {
            if (o && o.wiIcon) {
                return true
            }
            return false
        },
        getWiIcon: function(o) {
            if (!o || !o.wiIcon) {
                return ""
            }
            return t("workinst")
        },
        getCaIconTooltip: function(o) {
            return i("changeAlertIconTooltip")
        },
        getCaIconVisible: function(o) {
            if (o && o.wiChangeAlertIcon) {
                return true
            }
            return false
        },
        getCaIcon: function(o) {
            if (!o || !o.wiChangeAlertIcon) {
                return ""
            }
            return t("change_alert")
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/NumberFormatter", ["sap/ui/core/format/NumberFormat", "sap/dm/dme/formatter/NumberFormatter", "sap/ui/core/Locale"], function(t, e, r) {
    "use strict";
    return {
        getFloatValue: function(t, r, o) {
            let a = "";
            const n = this.baseNumberFormat();
            let i;
            let s;
            if (r && o) {
                i = r;
                s = o
            } else {
                i = n.oFormatOptions.groupingSeparator;
                s = n.oFormatOptions.decimalSeparator
            }
            let l = "";
            for (let e = 0; e < t.length; e++) {
                l = t.substring(e, e + 1);
                if (l === s) {
                    l = l.replace(s, ".")
                } else if (l === i) {
                    l = ""
                }
                a = a + l
            }
            return e.dmcLocaleNumberParser(a)
        },
        convertFloatToLocal: function(t, e, r) {
            let o = "";
            if (!t) {
                return ""
            }
            const a = t.toString();
            const n = this.baseNumberFormat();
            let i;
            let s;
            if (e && r) {
                i = e;
                s = r
            } else {
                i = n.oFormatOptions.groupingSeparator;
                s = n.oFormatOptions.decimalSeparator
            }
            if (i === "," && s === ".") {
                return a
            }
            let l = "";
            for (let t = 0; t < a.length; t++) {
                l = a.substring(t, t + 1);
                if (l === ".") {
                    l = l.replace(".", s)
                } else if (l === ",") {
                    l = ""
                }
                o = o + l
            }
            return o
        },
        baseNumberFormat: function() {
            const e = new r(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
            return t.getFloatInstance({
                strictGroupingValidation: true
            }, e)
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/StatusIconFormatter", ["sap/ui/core/theming/Parameters", "sap/ui/core/ValueState"], function(e, t) {
    "use strict";
    var i = {
        icons: function(e, t, i) {
            var r = [];
            if (!jQuery.trim(e)) {
                return r
            }
            if (e.toLowerCase().indexOf("multiple") >= 0) {
                var n = t || 0;
                var o = i || 0;
                if (n > 0) {
                    r[r.length] = "sap-icon://circle-task-2"
                }
                if (o > 0) {
                    r[r.length] = "sap-icon://color-fill"
                }
            } else if (e === "401") {
                r[r.length] = "sap-icon://rhombus-milestone-2"
            } else if (e === "402") {
                r[r.length] = "sap-icon://circle-task-2"
            } else if (e === "403") {
                r[r.length] = "sap-icon://color-fill"
            } else if (e === "404") {
                r[r.length] = "sap-icon://status-negative"
            }
            return r
        },
        iconColors: function(t, i, r) {
            var n = [];
            if (!t) {
                return n
            }
            if (t.toLowerCase().indexOf("multiple") >= 0) {
                var o = i || 0;
                var l = r || 0;
                if (o > 0) {
                    n[n.length] = e.get("sapInformativeColor")
                }
                if (l > 0) {
                    n[n.length] = e.get("sapPositiveColor")
                }
            } else if (t === "401") {
                n[n.length] = e.get("sapNeutralColor")
            } else if (t === "402") {
                n[n.length] = e.get("sapInformativeColor")
            } else if (t === "403") {
                n[n.length] = e.get("sapPositiveColor")
            } else if (t === "404") {
                n[n.length] = e.get("sapNegativeColor")
            }
            return n
        },
        statusHighlight: function(e) {
            if (e === "404") {
                return t.Error
            }
            return t.None
        }
    };
    return i
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/formatter/TextFormatter", [], function() {
    "use strict";
    var t;
    var n;

    function e(n, e) {
        return n ? t.getText(n) : e
    }
    return {
        init: function(e, i) {
            t = e;
            n = "";
            if (i) {
                n = i + "."
            }
        },
        getText: function(t) {
            return e(n + t)
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/AssignedButtonsHandler", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/control/ActionButton", "sap/dm/dme/podfoundation/control/NavigationButton", "sap/dm/dme/podfoundation/control/MenuButton", "sap/m/Menu", "sap/m/MenuItem", "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter"], function(t, e, n, o, r, a, i) {
    "use strict";
    var u = t.extend("sap.dm.dme.podfoundation.handler.AssignedButtonsHandler", {
        constructor: function(e) {
            t.apply(this, arguments);
            this._oController = e
        }
    });
    u.prototype.renderButtons = function(t, e) {
        if (!t || t.length === 0) {
            return []
        }
        var n = [];
        for (var o = 0; o < t.length; o++) {
            var r = this._createButton(t[o], e);
            if (r) {
                if (e) {
                    this._addButtonToContainer(e, r)
                }
                n[n.length] = r
            }
        }
        this._registerButtonsWithPod(t);
        return n
    };
    u.prototype._byId = function(t) {
        return sap.ui.getCore().byId(t)
    };
    u.prototype._createButton = function(t, r) {
        var a = this._getButtonMetadata(t);
        var i = false;
        var u;
        var s = this._oController.createId(t.buttonUid);
        var d = this._byId(s);
        if (d) {
            i = true
        }
        if (t.buttonType === "ACTION_BUTTON" && !i) {
            u = new e(s, a)
        } else if (t.buttonType === "MENU_BUTTON" && !i) {
            u = new o(s, a);
            this._createMenu(u, s, t.actions)
        } else if (t.buttonType === "NAVIGATION_BUTTON" && !i) {
            u = new n(s, a)
        } else if (t.buttonType === "ACTION_BUTTON" && i || t.buttonType === "MENU_BUTTON" && i || t.buttonType === "NAVIGATION_BUTTON" && i) {
            u = d
        } else {
            return null
        }
        u.addStyleClass("sapMesPodActionButton");
        var l = this._oController.getPodController();
        u.setPodController(l);
        t.button = u;
        t.buttonId = s;
        return u
    };
    u.prototype._createMenu = function(t, e, n) {
        if (n && n.length > 0) {
            var o = new r;
            var i;
            for (var u = 0; u < n.length; u++) {
                i = this._translateText(n[u].menuLabel);
                var s = new a(e + "_menu" + u, {
                    text: i
                });
                o.addItem(s)
            }
            o.attachItemSelected(t.onMenuItemPress, t);
            t.setMenu(o)
        }
    };
    u.prototype._registerButtonsWithPod = function(t) {
        var e = this;
        setTimeout(function() {
            for (var n = 0; n < t.length; n++) {
                e._registerButtonWithPod(t[n])
            }
        }, 500)
    };
    u.prototype._registerButtonWithPod = function(t) {
        var e = this._oController.getActiveViewController();
        var n = e.getLayoutHandler();
        var o = this._getPlugins(t.actions, n);
        if (t.buttonType === "MENU_BUTTON") {
            this._updateMenuItems(t.button, o)
        }
        var r = {
            id: t.buttonId,
            plugins: o,
            selectActionPageName: t.selectActionPageName,
            parentControlId: null,
            parentType: null,
            buttonType: t.buttonType,
            visible: true,
            title: t.button.getText()
        };
        var a = n.getPodLayoutData();
        if (a.buttons) {
            a.buttons[a.buttons.length] = r
        }
        return r
    };
    u.prototype._updateMenuItems = function(t, e) {
        var n = t.getMenu();
        var o = n.getItems();
        for (var r = 0; r < e.length; r++) {
            var a = "";
            if (e[r]) {
                a = e[r].id
            }
            o[r].data("PLUGIN_ID", a)
        }
    };
    u.prototype._getButtonMetadata = function(t) {
        var e = {};
        e.text = this._translateText(t.buttonName);
        e.icon = t.buttonIcon;
        e.tooltip = this._translateText(t.buttonTooltip);
        e.selectActionPageName = t.selectActionPageName;
        return e
    };
    u.prototype._getPlugins = function(t, e) {
        var n = [];
        if (t && t.length > 0) {
            var o = e.getPlugins();
            for (var r = 0; r < t.length; r++) {
                var a = this._getPluginData(t[r].pluginId, o);
                n[n.length] = a
            }
        }
        return n
    };
    u.prototype._getPluginData = function(t, e) {
        var n = t.lastIndexOf(".");
        for (var o = 0; o < e.length; o++) {
            var r = e[o].id;
            if (n < 0) {
                var a = r.lastIndexOf(".");
                if (a > 0) {
                    r = e[o].id.substring(0, a)
                }
            }
            if (r === t) {
                return e[o]
            }
        }
        return null
    };
    u.prototype._addButtonToContainer = function(t, e) {
        if (t.addAction) {
            t.addAction(e)
        } else if (t.addItem) {
            t.addItem(e)
        } else if (t.addContent) {
            t.addContent(e)
        }
    };
    u.prototype._translateText = function(t) {
        var e = t;
        if (t && t.trim().length > 0) {
            if (t.toLowerCase().indexOf("i18n[") === 0) {
                var n = t.substring(t.indexOf("[") + 1, t.indexOf("]"));
                e = this._getI18nButtonText(n)
            }
        }
        return e
    };
    u.prototype._getI18nButtonText = function(t) {
        var e = i.getButtonText(t);
        if (!e || e.trim().length === 0) {
            return t
        }
        return e
    };
    return u
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/BasePodEventHandler", ["sap/ui/base/Object", "sap/dm/dme/controller/Constants"], function(t, o) {
    "use strict";
    const n = "@POD_EVENT_HANDLER@";
    const e = "@POD_PAGE@";
    return t.extend("sap.dm.dme.podfoundation.handler.BasePodEventHandler", {
        constructor: function() {
            t.call(this)
        },
        setPodController: function(t) {
            this._oPodController = t
        },
        getPodController: function() {
            return this._oPodController
        },
        init: function() {},
        getPluginId: function() {
            return n
        },
        getPageName: function() {
            return e
        },
        getPodSelectionModel: function() {
            return this._oPodController.getPodSelectionModel()
        },
        subscribe: function(t, o, n) {
            this._oPodController.subscribeGlobalEventHandler(this, t, o, n)
        },
        publish: function(t, n) {
            if (this._oPodController.isUsingEventBus()) {
                const e = this._oPodController.getEventBus();
                e.publish(o.POD_EVENT_CHANNEL, t, n);
                return
            }
            const e = this._oPodController.getEventHandler();
            e.publish(this, t, n)
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/handler/BaseResponseHandler", ["sap/ui/base/Object"], function(e) {
    "use strict";
    var t = e.extend("sap.dm.dme.podfoundation.handler.BaseResponseHandler", {
        constructor: function() {
            e.apply(this, arguments)
        }
    });
    t.prototype.getResponseType = function(e) {
        return null
    };
    t.prototype.getResourceBundle = function() {
        return null
    };
    t.prototype.handleResponse = function(e) {};
    t.prototype.getMessage = function(e) {
        return null
    };
    t.prototype.getI18nText = function(e, t) {
        var r = this.getResourceBundle();
        if (!r) {
            return e
        }
        return r.getText(e, t)
    };
    t.prototype.isValidResponse = function(e) {
        var t = this.getResponseType();
        if (!e || !jQuery.trim(e.responseType) || !jQuery.trim(t)) {
            return false
        }
        t = t.trim().toLowerCase();
        var r = [];
        if (e.responseType.indexOf(",") >= 0) {
            r = e.responseType.split(",")
        } else {
            r[0] = e.responseType
        }
        for (var n = 0; n < r.length; n++) {
            if (jQuery.trim(r[n]) && r[n].trim().toLowerCase() === t) {
                return true
            }
        }
        return false
    };
    return t
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/ResponseTypes", function() {
    "use strict";
    return {
        START: "start",
        COMPLETE: "complete",
        ASSEMBLE: "assemble"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/SfcPodHelper", ["sap/ui/base/Object", "sap/ui/model/json/JSONModel", "sap/dm/dme/podfoundation/model/InputType", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/util/PlantSettings", "sap/dm/dme/logging/Logging"], function(e, t, o, r, n, i) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.handler.SfcPodHelper", {
        constructor: function(e) {
            this._oController = e;
            this._oLogger = i.getLogger("sap.dm.dme.podfoundation.handler.SfcPodHelper")
        },
        clearOperationField: function() {
            let e = this.byId("operationFilter");
            if (e) {
                e.setValue("")
            }
            this.processChange("operationFilter", "");
            this.clearResourceField()
        },
        clearWorkCenterField: function() {
            let e = this.byId("workCenterFilter");
            if (e) {
                e.setValue("")
            }
            this.processChange("workCenterFilter", "");
            this.clearResourceField()
        },
        clearResourceField: function() {
            let e = this.byId("resourceFilter");
            if (e) {
                e.setValue("")
            }
            this.processChange("resourceFilter", "")
        },
        isSfcSelectionsDefined: function() {
            let e = this.getPodSelectionModel();
            let t = e.getSelections();
            return t && t.length > 0
        },
        loadOperationField: function(e) {
            let t = this;
            return new Promise(function(o) {
                t._oLogger.debug("SfcPodHelper(LO): Enter loadOperationField()");
                if (!t.isSfcSelectionsDefined()) {
                    let r = null;
                    if (e) {
                        r = e
                    }
                    t._oLogger.debug("SfcPodHelper(LO): loadOperationField() -  MISSING RESOURCE.  Results: " + r);
                    o({
                        resourceLoaded: false
                    });
                    return
                }
                let n = null;
                let i = null;
                let u = t.getActiveOperation(e);
                if (u) {
                    n = u.operation;
                    i = u.operationVersion
                }
                if (r.isEmpty(n)) {
                    t.clearOperationField();
                    o({
                        resourceLoaded: false
                    });
                    t._oLogger.debug("SfcPodHelper(LO): loadOperationField() - PodUtility.isEmpty() = false-  MISSING RESOURCE");
                    return
                }
                t._updateOperationFieldAndModel(n, i);
                if (r.isNotEmpty(u.resource)) {
                    t._updateResourceFieldAndModel(u.resource);
                    t._oLogger.debug("SfcPodHelper: loadOperationField(LO) - _updateResourceFieldAndModel() - resourceLoaded: true, value='" + u.resource + "'");
                    o({
                        resourceLoaded: true
                    });
                    return
                }
                return t._loadDefaultResourceFromOperation().then(function(e) {
                    if (!e.updated) {
                        this._loadDefaultResourceFromConfiguration();
                        t._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromConfiguration - NOT updated")
                    } else {
                        t._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromConfiguration - ALREADY updated")
                    }
                    o({
                        resourceLoaded: true
                    })
                }.bind(t))
            })
        },
        loadWorkCenterField: function() {
            let e = this;
            return new Promise(function(t, o) {
                if (!e.isSfcSelectionsDefined()) {
                    t({
                        resourceLoaded: false
                    });
                    return
                }
                let n = e.getPodSelectionModel();
                let i = n.getSelections();
                let u = e.getSelectedWorkCenter(i);
                if (r.isEmpty(u)) {
                    e.clearWorkCenterField();
                    t({
                        resourceLoaded: false
                    });
                    return
                }
                let s = e.getUserId();
                return e.validateWorkCenterForCurrentUser(u, s).then(function(r) {
                    if (!r) {
                        e.clearWorkCenterField();
                        let t = [u, s];
                        let r = this.getPodI18nText("workCenterNotAssignedToUser", t);
                        o({
                            message: r
                        });
                        return
                    }
                    this._updateWorkCenterFieldAndModel(u);
                    return this.retrieveResourcesForWorkCenter(u).then(function(e) {
                        let o = [];
                        if (e && e.members) {
                            o = e.members
                        }
                        this.loadActiveResourceFromSelections(o);
                        t({
                            resourceLoaded: true
                        })
                    }.bind(this))
                }.bind(e))
            })
        },
        getSelectedWorkCenter: function(e) {
            let t = null;
            if (e && e.length > 0) {
                let o;
                for (let n of e) {
                    o = n.getSfcData();
                    if (!o) {
                        continue
                    }
                    if (r.isEmpty(t)) {
                        t = o.getWorkCenter()
                    } else if (t !== o.getWorkCenter()) {
                        t = null;
                        break
                    }
                }
            }
            return t
        },
        loadActiveResourceFromSelections: function(e) {
            let t = this.getPodSelectionModel();
            let o = this.getActiveResourceFromSelections(t);
            if (r.isEmpty(o)) {
                if (e && e.length === 1) {
                    if (e[0].childResource && r.isNotEmpty(e[0].childResource.resource)) {
                        o = e[0].childResource.resource
                    }
                }
                if (r.isEmpty(o)) {
                    o = this.getDefaultResource()
                }
            }
            if (r.isEmpty(o)) {
                t.setResource(null);
                this.clearResourceField();
                return
            }
            this._updateResourceFieldAndModel(o)
        },
        getActiveResourceFromSelections: function(e) {
            let t = e;
            if (!e) {
                t = this.getPodSelectionModel()
            }
            let o = t.getSelections();
            let n = null;
            if (o.length > 0) {
                let e;
                for (let t of o) {
                    e = t.getSfcData();
                    if (!e || e.getStatusCode() !== "403") {
                        continue
                    }
                    if (r.isEmpty(n)) {
                        n = e.getResource()
                    } else if (n !== e.getResource()) {
                        n = null;
                        break
                    }
                }
            }
            return n
        },
        getDefaultResource: function() {
            let e = this.toUpperCase(this.getQueryParameter("RESOURCE"));
            if (r.isEmpty(e)) {
                let t = this.getConfiguration();
                if (t && r.isNotEmpty(t.resource)) {
                    e = this.toUpperCase(t.resource)
                }
            }
            return e
        },
        retrieveResourcesForWorkCenter: function(e) {
            let t = this;
            return new Promise(function(o) {
                let r = n.getCurrentPlant();
                let i = `WorkCenterBO:${r},${e}`;
                let u = "$expand=resourceType($select=ref,resourceType,description,createdDateTime)";
                let s = `$expand=resourceTypeResources(${u})`;
                let l = `$expand=childResource($select=ref,resource,description,status,plant,resourceTypeResources;${s})`;
                let a = `$expand=members(${l})`;
                let c = t.getPlantDataSourceUri();
                let d = `${c}Workcenters('${i}')?${a}`;
                t.ajaxGetRequest(d, {}, function(e) {
                    o(e)
                })
            })
        },
        getResourcesForWorkCenter: function(e, t, o) {
            return this.retrieveResourcesForWorkCenter(e).then(function(e) {
                t.call(o, e)
            })
        },
        onOperationListSelectEvent: function() {
            let e = this.getPodSelectionModel();
            let t = e.getWorkCenter();
            if (r.isEmpty(t)) {
                return
            }
            let o = this.getActiveResourceFromSelections(e);
            if (r.isNotEmpty(o)) {
                this._updateResourceFieldAndModel(o);
                return
            }
            this.getResourcesForWorkCenter(t, this._loadResourceFromWorkCenterRequest, this)
        },
        _loadResourceFromWorkCenterRequest: function(e) {
            let o = new t(e);
            let r = this.getChildResources(o);
            if (r && r.resourceList.length > 0) {
                if (r.resourceList.length === 1) {
                    this._loadDefaultResourceFromWorkCenter(r.resourceList[0].resource)
                }
                return null
            }
            return this._loadDefaultResourceFromOperation().then(function(e) {
                if (!e.updated) {
                    this._loadDefaultResourceFromConfiguration()
                }
            }.bind(this))
        },
        _loadDefaultResourceFromWorkCenter: function(e) {
            let t = this.toUpperCase(e);
            if (r.isNotEmpty(t)) {
                let e = this.byId("resourceFilter");
                if (e) {
                    e.setValue(t)
                }
                this.processChange("resourceFilter", t)
            }
        },
        _loadDefaultResourceFromOperation: function() {
            let e = this;
            return new Promise(function(t) {
                let o = e.getPodSelectionModel();
                let r = o.getOperations();
                if (!r || r.length === 0) {
                    e._updateResourceFieldAndModel(null);
                    t({
                        updated: false
                    })
                }
                let i = e.getProductDataSourceUri();
                let u = n.getCurrentPlant();
                let s = `OperationBO:${u},${r[0].operation},${r[0].version}`;
                let l = `${i}Operations('${s}')`;
                e.ajaxGetRequest(l, {}, function(o) {
                    let r = e._loadResourceFromOperationRequest(o);
                    e._oLogger.debug("SfcPodHelper(LO): _loadDefaultResourceFromOperation updated=" + r);
                    t({
                        updated: r
                    })
                })
            })
        },
        _loadResourceFromOperationRequest: function(e) {
            if (!e || r.isEmpty(e.resource)) {
                this._updateResourceFieldAndModel(null);
                return false
            }
            let t = e.resource;
            if (typeof t !== "string") {
                t = e.resource.resource
            }
            this._updateResourceFieldAndModel(t);
            return true
        },
        _loadDefaultResourceFromConfiguration: function() {
            let e = this.getConfiguration();
            if (e && r.isNotEmpty(e.resource)) {
                this._updateResourceFieldAndModel(e.resource)
            }
        },
        validateWorkCenterForCurrentUser: function(e, t) {
            let o = this;
            return new Promise(function(r) {
                let i = n.getCurrentPlant();
                let u = `WorkCenterBO:${i},${e}`;
                let s = "?$expand=userWorkCenters($expand=user($select=ref,userId))";
                let l = `&$filter=ref eq ('${u}')`;
                let a = o.getPlantDataSourceUri();
                let c = `${a}Workcenters${s}${l}`;
                o.ajaxGetRequest(c, {}, function(e) {
                    r(o._isValidWorkCenterForCurrentUser(e, t))
                })
            })
        },
        _isValidWorkCenterForCurrentUser: function(e, t) {
            if (!e || !e.value || e.value.length === 0) {
                return false
            }
            for (let o of e.value[0].userWorkCenters) {
                if (o.user.userId === t) {
                    return true
                }
            }
            return false
        },
        _updateResourceFieldAndModel: function(e) {
            let t = this.byId("resourceFilter");
            if (t) {
                let o = t.getValue();
                if (r.isEmpty(o) || o !== e) {
                    t.setValue(e)
                }
            }
            this.processChange("resourceFilter", e)
        },
        _updateWorkCenterFieldAndModel: function(e) {
            let t = this.byId("workCenterFilter");
            if (t) {
                t.setValue(e)
            }
            this.processChange("workCenterFilter", e)
        },
        _updateOperationFieldAndModel: function(e, t) {
            let o = this.byId("operationFilter");
            if (o) {
                o.setValue(e)
            }
            let i = null;
            if (r.isNotEmpty(e) && r.isNotEmpty(t)) {
                let o = n.getCurrentPlant();
                i = `OperationBO:${o},${e},${t}`
            }
            this.changeOperationActivityInPodSelectionModel(e, i)
        },
        loadSfcDetails: function(e) {
            let t = this;
            return new Promise(function(o, r) {
                let n = t.getSfcDetailsRequestUrl(e, true);
                t._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() called");
                t._postSfcDetailsRequest(n).then(function(e) {
                    t._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() RESOLVED");
                    o(e)
                }.bind(t)).catch(function(e) {
                    t._oLogger.debug("SfcPodHelper(LO): loadSfcDetails() ERROR");
                    r(e)
                }.bind(t))
            })
        },
        getSfcDetailsRequestUrl: function(e) {
            this._sRequestInputValue = e;
            const t = this.getProductionDataSourceUri();
            const o = n.getCurrentPlant();
            return `${t}sfc/v1/sfcdetail?plant=${o}&sfc=${e}`
        },
        _postSfcDetailsRequest: function(e) {
            let t = this;
            return new Promise(function(o, r) {
                t.ajaxGetRequest(e, null, function(e) {
                    let r = t._loadSfcDetails(e);
                    o(r)
                }, function(e, t) {
                    let o = e || t;
                    r(o)
                })
            })
        },
        _loadSfcDetails: function(e) {
            this._oFlattenedResponse = this.flattenResponse(e);
            return this._oFlattenedResponse
        },
        flattenResponse: function(e) {
            let t = {};
            t.sfc = e.sfc;
            t.quantity = e.quantity;
            if (e.status) {
                t.statusCode = e.status.code;
                t.statusDescription = e.status.description
            }
            t.startDate = null;
            t.datetimeQueued = null;
            t.dueDatetime = null;
            if (e.routing) {
                t.routing = e.routing.routing;
                t.routingType = e.routing.type;
                t.routingRevision = e.routing.version;
                t.routingSequence = null;
                t.routingAndRevision = e.routing.routing + "/" + e.routing.version
            }
            if (e.material) {
                t.material = e.material.material;
                t.materialDescription = e.material.description;
                t.materialRevision = e.material.version;
                t.materialAndRevision = e.material.material + "/" + e.material.version;
                t.materialGroup = ""
            }
            if (e.order) {
                t.shopOrder = e.order.order;
                t.shopOrderType = e.order.type;
                t.orderPlannedStartDatetime = e.order.orderPlannedStartDateTime_Z
            }
            this._flattenStepsResponse(t, e);
            return {
                value: [t]
            }
        },
        _flattenStepsResponse: function(e, t) {
            e.stepID = null;
            e.quantityInWork = 0;
            e.quantityInQueue = 0;
            e.quantityCompletePending = 0;
            e.operationScheduleStartDate = null;
            e.operationScheduleEndDate = null;
            let o = this.getPodSelectionModel();
            let n = o.getOperation();
            let i = null;
            if (n && r.isNotEmpty(n.operation)) {
                i = n.operation
            }
            if (t.steps && t.steps.length > 0) {
                for (let o of t.steps) {
                    if (!o.operation || r.isEmpty(o.operation.operation)) {
                        continue
                    }
                    this._addToOperationList(e, o);
                    if (r.isNotEmpty(i) && o.operation.operation === i) {
                        if (r.isEmpty(this._sSelectedOperation)) {
                            this._sSelectedOperation = o.operation.operation
                        }
                        e.operation = o.operation.operation;
                        e.stepID = o.stepId;
                        e.quantityInWork = o.quantityInWork;
                        e.quantityInQueue = o.quantityInQueue;
                        e.quantityCompletePending = o.quantityCompletePending;
                        e.operationScheduleStartDate = o.operationScheduledStartDate;
                        e.operationScheduleEndDate = o.operationScheduledCompletionDate
                    }
                }
            }
        },
        _addToOperationList: function(e, t) {
            if (!this._aSfcOperations) {
                this._aSfcOperations = []
            }
            let o = t.operation.operation;
            let r = t.operation.version;
            let n = t.stepId;
            let i = this._findOperationInList(o);
            if (i) {
                if (i.sfc !== e.sfc) {
                    i.sfc = this._sMultipleTextTitle
                }
                if (i.routing !== e.routing) {
                    i.routing = this._sMultipleTextTitle;
                    i.routingRevision = this._sMultipleTextTitle;
                    i.routingAndRevision = this._sMultipleTextTitle
                }
                if (i.stepId !== n) {
                    i.stepId = this._sMultipleTextTitle
                }
                return
            }
            this._aSfcOperations[this._aSfcOperations.length] = {
                sfc: e.sfc,
                routing: e.routing,
                routingRevision: e.routingRevision,
                routingAndRevision: e.routingAndRevision,
                operation: o,
                operationVersion: r,
                stepId: n,
                quantityInWork: t.quantityInWork,
                quantityInQueue: t.quantityInQueue,
                quantityCompletePending: t.quantityCompletePending,
                resource: t.resource,
                stepDone: t.stepDone
            }
        },
        _findOperationInList: function(e) {
            if (!this._aSfcOperations || this._aSfcOperations.length === 0) {
                return null
            }
            for (let t of this._aSfcOperations) {
                if (t.operation === e) {
                    return t
                }
            }
            return null
        },
        findExactMatch: function(e, t, r) {
            if (!e || e.length === 0) {
                return null
            }
            for (let n of e) {
                if (r === o.Sfc && t === n.sfc || r === o.ProcessLot && t === n.processLot) {
                    return n
                }
            }
            return null
        },
        getActiveOperation: function(e) {
            let t = null;
            if (e && e.length > 0) {
                for (let o of e) {
                    if (o.stepDone) {
                        continue
                    }
                    if (this._onlyInQueueQuantities(o) || this._onlyInWorkQuantities(o) || this._onlyCompletePendingQuantities(o)) {
                        t = o;
                        break
                    }
                }
            }
            return t
        },
        _onlyInQueueQuantities: function(e) {
            if (e.quantityInQueue > 0 && (e.quantityInWork === 0 && e.quantityCompletePending === 0)) {
                return true
            }
            return false
        },
        _onlyInWorkQuantities: function(e) {
            if (e.quantityInWork > 0 && (e.quantityInQueue === 0 && e.quantityCompletePending === 0)) {
                return true
            }
            return false
        },
        _onlyCompletePendingQuantities: function(e) {
            if (e.quantityCompletePending > 0 && (e.quantityInQueue === 0 && e.quantityInWork === 0)) {
                return true
            }
            return false
        },
        getSfcDetails: function() {
            return this._oFlattenedResponse
        },
        getSfcOperations: function() {
            return this._aSfcOperations
        },
        getSelectedOperation: function() {
            return this._sSelectedOperation
        },
        clearSfcDetails: function() {
            this._oFlattenedResponse = null;
            this._aSfcOperations = null;
            this._sSelectedOperation = null
        },
        byId: function(e) {
            return this._oController.getView().byId(e)
        },
        getPodSelectionModel: function() {
            return this._oController._getPodSelectionModel()
        },
        getPlantDataSourceUri: function() {
            return this._oController.getPlantDataSourceUri()
        },
        getProductDataSourceUri: function() {
            return this._oController.getProductDataSourceUri()
        },
        getProductionDataSourceUri: function() {
            return this._oController.getProductionDataSourceUri()
        },
        ajaxGetRequest: function(e, t, o, r) {
            this._oController.ajaxGetRequest(e, t, o, r)
        },
        getChildResources: function(e) {
            return this._oController._getChildResources(e)
        },
        changeOperationActivityInPodSelectionModel: function(e, t) {
            this._oController.changeOperationActivityInPodSelectionModel(e, t, false)
        },
        processChange: function(e, t) {
            this._oController._processChange(e, t)
        },
        toUpperCase: function(e) {
            if (r.isNotEmpty(e)) {
                return e.toUpperCase()
            }
            return e
        },
        getQueryParameter: function(e) {
            return this._oController.getQueryParameter(e)
        },
        getConfiguration: function() {
            return this._oController.getConfiguration()
        },
        getUserId: function() {
            return this._oController.getUserId()
        },
        getPodI18nText: function(e, t) {
            return this._oController.getPodController().getI18nText(e, t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/TableResizeHandler", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, e) {
    "use strict";
    var i = t.extend("sap.dm.dme.podfoundation.handler.TableResizeHandler", {
        constructor: function(e, i) {
            t.apply(this, arguments);
            this._oPodController = e;
            this._oPluginController = i;
            this._iLastScrollLeft = 0
        }
    });
    i.prototype.getExecutionUtility = function() {
        return this._oPodController.getExecutionUtility()
    };
    i.prototype.getPluginId = function() {
        return this._oPluginController.getPluginId()
    };
    i.prototype.getPodView = function() {
        return this._oPodController.getView()
    };
    i.prototype.getView = function() {
        return this._oPluginController.getView()
    };
    i.prototype.initializeTableResizeHandler = function(t, e, i) {
        if (!t) {
            return
        }
        if (this._sInitializeTimerId) {
            return
        }
        var r = this;
        this._sInitializeTimerId = setTimeout(function() {
            r._doInitialize(t, e, i);
            r._sInitializeTimerId = undefined
        }, 2e3)
    };
    i.prototype._doInitialize = function(t, i, r) {
        var n = t.getHeaderToolbar();
        if (!n) {
            return
        }
        var o = null;
        if (e.isNotEmpty(i)) {
            var l = this.getView().byId(i);
            if (l) {
                o = this._getJQueryElementById(l.getId())
            }
        }
        this._attachSplitterResizeHandler(t, n, o);
        this._attachTableScrollHandler(t, n, o, r);
        this._setTableHeaderWidth(t, n, this._iLastScrollLeft)
    };
    i.prototype._attachSplitterResizeHandler = function(t, e, i) {
        var r = this._getSplitterPaneContainer();
        if (r) {
            r._oSplitter.attachResize(function(r) {
                this._handleSplitterResizeEventEvent(t, e, i)
            }, this)
        }
    };
    i.prototype._handleSplitterResizeEventEvent = function(t, e, i) {
        if (this._sSplitterResizeTimerId) {
            return
        }
        var r = this;
        this._sSplitterResizeTimerId = setTimeout(function() {
            r._setTableHeaderWidth(t, e, r._iLastScrollLeft);
            r._sSplitterResizeTimerId = undefined
        }, 125)
    };
    i.prototype._attachTableScrollHandler = function(t, e, i, r) {
        if (i) {
            var n = this;
            i.scroll(function() {
                n._handleHorizontalScrollEvent(t, e, i, r)
            })
        }
    };
    i.prototype._handleHorizontalScrollEvent = function(t, e, i, r) {
        if (this._sScrollerTimerId) {
            return
        }
        var n = 500;
        if (typeof r !== "undefined") {
            n = r
        }
        var o = this;
        this._sScrollerTimerId = setTimeout(function() {
            var r = i.scrollLeft();
            if (o._iLastScrollLeft != r) {
                o._iLastScrollLeft = r;
                o._setTableHeaderWidth(t, e, r)
            }
            o._sScrollerTimerId = undefined
        }, n)
    };
    i.prototype._setTableHeaderWidth = function(t, e, i) {
        if (t && e) {
            var r = this._getJQueryElementById(t.getId());
            if (!r) {
                return
            }
            var n = r.width();
            if (!n) {
                return
            }
            var o = this._getJQueryElementById(e.getId());
            var l = n + i - 16;
            o.width(l)
        }
    };
    i.prototype._getSplitterPaneContainer = function() {
        if (!this._oPaneContainer) {
            var t = this.getExecutionUtility();
            if (!t) {
                return null
            }
            var e = t.findParentResponsiveSplitterData(this.getPluginId());
            if (!e) {
                return null
            }
            var i = this.getPodView().byId(e.paneId);
            if (!i) {
                return null
            }
            this._oPaneContainer = i.getParent()
        }
        return this._oPaneContainer
    };
    i.prototype._getJQueryElementById = function(t) {
        return jQuery("#" + t)
    };
    return i
});
sap.ui.predefine("sap/dm/dme/podfoundation/handler/ViewerHandler", ["sap/ui/base/Object", "sap/ui/vk/ContentResource", "sap/dm/dme/podfoundation/extension/tools/ExtendedRedlineTool", "sap/ui/vk/tools/RedlineToolGizmo", "sap/dm/dme/podfoundation/util/PodUtility", "sap/base/util/uid"], function(e, t, o, i, n, r) {
    "use strict";
    var l = ["png", "gif", "jpg", "jpeg", "jpe", "jif", "jfif", "jfi", "bmp", "dib"];
    var s = e.extend("sap.dm.dme.podfoundation.handler.ViewerHandler", {
        constructor: function(t) {
            e.apply(this, arguments);
            this._oController = t;
            this._removedElements = []
        }
    });
    s.prototype.getViewer = function() {
        return this._oController.getViewer()
    };
    s.prototype.addSubscriptions = function() {
        if (this._oController.addSubscriptions) {
            this._oController.addSubscriptions()
        }
    };
    s.prototype.addRedlineToolToViewer = function() {
        if (!this.oRedlineTool) {
            this.oRedlineTool = this.createRedlineTool();
            this.oRedlineToolGizmo = this.createRedlineToolGizmo();
            this.oRedlineTool.setGizmo(this.oRedlineToolGizmo);
            this.oRedlineTool.attachElementClicked(this._onClick, this);
            var e = this.getViewer();
            var t = e.getNativeViewport();
            this.oRedlineTool.setViewport(t);
            t.addTool(this.oRedlineTool);
            this.oRedlineTool.setActive(true, t, t);
            this.addSubscriptions()
        }
    };
    s.prototype.createRedlineTool = function() {
        return new o
    };
    s.prototype.createRedlineToolGizmo = function() {
        var e = this._oController.getPluginId();
        var t = "redlineTool-" + e.substring(e.lastIndexOf(".") + 1);
        var o = r();
        return new i(t + "-gizmo-" + o)
    };
    s.prototype.destroy = function() {
        var e = this.getRedlineTool();
        if (e) {
            e.detachElementClicked(this._onClick, this)
        }
    };
    s.prototype.rerenderViewer = function() {
        var e = this.getRedlineTool();
        if (e) {
            e.setActive(false);
            var t = this.getViewer();
            var o = t.getNativeViewport();
            e.setViewport(o);
            e.setGizmo(this.oRedlineToolGizmo);
            e.setActive(true, o, o)
        }
    };
    s.prototype.loadModel = function(e, o) {
        var i = this.getViewer();
        i.attachContentResourceChangesProcessed(this._onContentResourceChangesProcessed, this);
        i.destroyContentResources();
        if (n.isNotEmpty(e)) {
            var r = o;
            if (n.isEmpty(r)) {
                r = this.getSourceType(e)
            }
            var l = new t({
                source: e,
                sourceType: r,
                sourceId: "abc"
            });
            i.addContentResource(l)
        }
    };
    s.prototype._onContentResourceChangesProcessed = function(e) {
        this.getViewer().detachContentResourceChangesProcessed(this._onContentResourceChangesProcessed, this);
        if (this._oController && this._oController.onModelUpdated) {
            this._oController.onModelUpdated(e)
        }
    };
    s.prototype.getSourceType = function(e) {
        var t = null;
        var o = e.lastIndexOf(".");
        if (o >= 0 && o < e.length - 1) {
            t = e.substr(o + 1)
        }
        if (n.isNotEmpty(t)) {
            o = l.indexOf(t.toLowerCase());
            if (o >= 0) {
                return l[o]
            }
        }
        return null
    };
    s.prototype.importRedline = function(e, t) {
        var o = this.getRedlineTool();
        e.forEach(e => {
            if (e.metadata.colorStrategy === "Semantic") {
                e.strokeWidth = 0;
                e.fillColor = null;
                e.opacity = 0
            }
        });
        if (t.toLowerCase() === "svg") {
            o.importSVG(e)
        } else {
            this.scaleRedline(e);
            o.importJSON(e)
        }
        this.rerenderViewer();
        this.updateImportedElements(e)
    };
    s.prototype.scaleRedline = function(e) {
        for (var t = 0; t < e.length; t++) {
            this._scaleRedlineElement(e[t])
        }
    };
    s.prototype._scaleRedlineElement = function(e) {
        var t = this._getZoomAndPanOffset();
        var o = t.fZoomBy;
        e.originX *= o;
        e.originY *= o;
        e.originX += t.iDeltaX;
        e.originY += t.iDeltaY;
        if (e.type === "rectangle") {
            e.width = e.width * o;
            e.height = e.height * o
        } else if (e.type === "ellipse" || e.type === "circle") {
            e.radiusX *= o;
            e.radiusY *= o
        } else if (e.type.indexOf("freehand") === 0) {
            e.path = e.path.map(function(e) {
                return e * o
            })
        } else if (e.type === "text") {
            e.fontSize *= o;
            e.width *= o;
            e.height *= o
        }
    };
    s.prototype._resetRedlineElementScale = function(e) {
        var t = this._getZoomAndPanOffset();
        var o = t.fZoomBy;
        e.originX -= t.iDeltaX;
        e.originY -= t.iDeltaY;
        e.originX /= o;
        e.originY /= o;
        if (e.type === "rectangle") {
            e.width /= o;
            e.height /= o
        } else if (e.type === "ellipse" || e.type === "circle") {
            e.radiusX /= o;
            e.radiusY /= o
        } else if (e.type.indexOf("freehand") === 0) {
            e.path = e.path.map(function(e) {
                return e / o
            })
        } else if (e.type === "text") {
            e.fontSize /= o;
            e.width /= o;
            e.height /= o
        }
    };
    s.prototype._getZoomAndPanOffset = function() {
        var e = this.getViewer();
        var t = e.getNativeViewport();
        var o = t.getViewInfo();
        var i = o["camera"][0];
        var n = i / 1;
        var r = t.getViewInfo().camera[4];
        var l = t.getViewInfo().camera[5];
        var s = this.getRedlineTool().getGizmo()._virtualSideLength;
        var d = r / s;
        var a = l / s;
        return {
            fZoomBy: n,
            iDeltaX: d,
            iDeltaY: a
        }
    };
    s.prototype.updateImportedElements = function(e) {
        if (!e || e.length === 0) {
            return
        }
        var t = this._oController.getPluginId();
        for (var o = 0; o < e.length; o++) {
            var i = e[o];
            if (n.isNotEmpty(i.elementId)) {
                var r = this.findRedlineElement(i.elementId);
                if (r) {
                    r.data("PLUGIN_ID", t);
                    r.data("OVERLAY_TYPE", i.metadata.overlayType);
                    r.data("COLOR_STRATEGY", i.metadata.colorStrategy);
                    r.data("OVERLAY_REDLINE_TYPE", i.type)
                }
            }
        }
    };
    s.prototype.restoreRedlineElement = function(e) {
        var t = this.getRedlineTool();
        this._deleteRemovedElement(e);
        e.mProperties.type = e.data("OVERLAY_REDLINE_TYPE");
        this._scaleRedlineElement(e.mProperties);
        t.addRedlineElement(e);
        this.rerenderRedlineElements()
    };
    s.prototype.removeRedlineElement = function(e) {
        e.mProperties.type = e.data("OVERLAY_REDLINE_TYPE");
        this._resetRedlineElementScale(e.mProperties);
        this._removedElements.push(e);
        this.getRedlineTool().removeRedlineElement(e);
        this.rerenderRedlineElements()
    };
    s.prototype.rerenderRedlineElements = function() {
        var e = this.getRedlineTool();
        e.getGizmo().rerender()
    };
    s.prototype.findRedlineElement = function(e) {
        var t = this.getRedlineTool();
        var o = t.getRedlineElements();
        if (o && o.length > 0) {
            for (var i = 0; i < o.length; i++) {
                if (o[i].getElementId() === e) {
                    return o[i]
                }
            }
        }
        return null
    };
    s.prototype.findRemovedElement = function(e) {
        if (this._removedElements && this._removedElements.length > 0) {
            for (var t = 0; t < this._removedElements.length; t++) {
                if (this._removedElements[t].getElementId() === e) {
                    return this._removedElements[t]
                }
            }
        }
        return null
    };
    s.prototype._deleteRemovedElement = function(e) {
        var t = e;
        if (typeof e !== "string" && e.getElementId) {
            t = e.getElementId()
        }
        if (this._removedElements && this._removedElements.length > 0) {
            for (var o = 0; o < this._removedElements.length; o++) {
                if (this._removedElements[o].getElementId() === t) {
                    this._removedElements.splice(o, 1);
                    return
                }
            }
        }
    };
    s.prototype.setViewInfo = function(e) {
        this.getViewer().getNativeViewport().setViewInfo(e)
    };
    s.prototype._onClick = function(e) {
        var t = e.getParameter("elementId");
        var o = this.findRedlineElement(t);
        if (o) {
            if (o.getText) {
                $("#" + o.getId() + ">textarea").attr("readonly", true)
            }
            var i = o.data("PLUGIN_ID");
            var n = this._oController.getPluginId();
            if (i === n) {
                this._oController.onClick(e, o)
            }
        }
    };
    s.prototype.getRedlineTool = function() {
        return this.oRedlineTool
    };
    return s
});
sap.ui.predefine("sap/dm/dme/podfoundation/images/ImagePool", ["sap/ui/Device"], function(e) {
    "use strict";
    return {
        getImageURI: function(e, i) {
            if (!e || e === "") {
                return undefined
            }
            var s;
            if (i && i !== "") {
                s = i.toLowerCase();
                if (s !== "auto" && s !== "large" && s !== "medium" && s !== "small") {
                    s = "auto"
                }
            }
            if (!s || s === "auto") {
                if (sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop) {
                    s = "medium"
                } else if (sap.ui.Device.system.tablet && sap.ui.Device.system.desktop) {
                    s = "large"
                } else {
                    s = "small"
                }
            }
            var a;
            if (s === "small") {
                a = "sap/dm/dme/podfoundation/images/small/"
            } else if (s === "medium") {
                a = "sap/dm/dme/podfoundation/images/medium/"
            } else if (s === "large") {
                a = "sap/dm/dme/podfoundation/images/large/"
            }
            var t = e;
            if (e.indexOf(".") < 0) {
                t = e + ".png"
            }
            var m = t.indexOf("//");
            if (m > 0) {
                t = t.substring(m + 2)
            }
            return jQuery.sap.getResourcePath(a + t)
        }
    }
});
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2016 SAP SE. All rights reserved
    
 */
sap.ui.predefine("sap/dm/dme/podfoundation/library", ["sap/ui/core/library"], function(o) {
    "use strict";
    sap.ui.getCore().initLibrary({
        name: "sap.dm.dme.podfoundation",
        dependencies: ["sap.ui.core"],
        types: [],
        interfaces: [],
        controls: ["sap.dm.dme.podfoundation.control.ActionButton", "sap.dm.dme.podfoundation.control.ConfigurableButton", "sap.dm.dme.podfoundation.control.DraggableListItem", "sap.dm.dme.podfoundation.control.GroupButton", "sap.dm.dme.podfoundation.control.ListPluginViewController", "sap.dm.dme.podfoundation.control.NavigationButton", "sap.dm.dme.podfoundation.control.PluginViewController", "sap.dm.dme.podfoundation.control.IconTabBar", "sap.dm.dme.podfoundation.control.IconTabFilter", "sap.dm.dme.podfoundation.control.ProductionComponent", "sap.dm.dme.podfoundation.control.ProductionUIComponent", "sap.dm.dme.podfoundation.control.PropertyEditor", "sap.dm.dme.podfoundation.control.StatusIconControl", "sap.dm.dme.podfoundation.control.TableFactory", "sap.dm.dme.podfoundation.control.TablePersoService", "sap.dm.dme.podfoundation.extension.PluginExtension", "sap.dm.dme.podfoundation.extension.PluginExtensionManager", "sap.dm.dme.podfoundation.extension.PluginExtensionProvider", "sap.dm.dme.podfoundation.extension.PluginExtensionType", "sap.dm.dme.podfoundation.handler.ViewerHandler", "sap.dm.dme.podfoundation.model.InputType", "sap.dm.dme.podfoundation.model.ItemKeyData", "sap.dm.dme.podfoundation.model.OperationKeyData", "sap.dm.dme.podfoundation.model.PodSelectionModel", "sap.dm.dme.podfoundation.model.ProcessLotKeyData", "sap.dm.dme.podfoundation.model.ResourceKeyData", "sap.dm.dme.podfoundation.model.Selection", "sap.dm.dme.podfoundation.model.SfcKeyData", "sap.dm.dme.podfoundation.model.ShopOrderKeyData", "sap.dm.dme.podfoundation.model.UserPreferences", "sap.dm.dme.podfoundation.popup.PopupHandler"],
        elements: [],
        noLibraryCSS: false,
        version: "19.1.0"
    });
    return sap.dm.dme.podfoundation
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/BackendLoggingListener", ["sap/ui/base/Object", "sap/base/Log", "sap/dm/dme/controller/Constants", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/serverevent/Notifications", "sap/dm/dme/serverevent/NotificationConfig", "sap/dm/dme/podfoundation/logging/LoggingSession", "sap/dm/dme/podfoundation/logging/WorkCenterPodClientContext", "sap/dm/dme/podfoundation/logging/OperationPodClientContext", "sap/dm/dme/podfoundation/logging/OrderPodClientContext"], function(e, t, i, n, o, g, s, r, a, c) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.logging.BackendLoggingListener", {
        constructor: function(e, t) {
            this._oController = e;
            this._oBackendLoggingSession = t;
            this._oNotifications = new o(this);
            this._oNotifications.setRetainSubscriptions(true);
            this._activeUiLoggingConfiguration = null;
            let i = this._oController.getEventHandler();
            i.subscribe(this, "PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this)
        },
        destroy: function() {
            this._unsubscribePodSelectionChange()
        },
        onPodSelectionChangeEvent: function() {
            try {
                let e = this.getPodSelectionModel();
                let t = this.getPodSelectionModel().getPodType();
                if (this._isSupportedPodType(t)) {
                    this._createLoggingSession(t);
                    let i = this._getConfigurationForPodSelection(e, t);
                    if (i) {
                        if (!this._isActiveLoggingConfiguration(i)) {
                            this._addLogListener();
                            this._clearLoggingLevels(this._activeUiLoggingConfiguration);
                            this._initUi5Loggers(i);
                            this._createSubscription(i)
                        }
                    } else {
                        this._removeLogListener();
                        this._clearLoggingLevels(this._activeUiLoggingConfiguration);
                        this._activeUiLoggingConfiguration = null
                    }
                } else {
                    console.debug("BackendLoggingListener.onPodSelectionChangeEvent - Pod type " + t + " is not supported.")
                }
            } catch (e) {
                console.error("BackendLoggingListener.onPodSelectionChange - Error processing POD selection change event: " + e)
            }
        },
        onLogEntry: function(e) {
            try {
                if (this.getLoggingSession().filterLogMessage(e, this._activeUiLoggingConfiguration.getId())) {
                    this._sendLogMessage(e)
                }
            } catch (e) {}
        },
        getPodSelectionModel: function() {
            return this.getController().getView().getModel("podSelectionModel").getData()
        },
        getController: function() {
            return this._oController
        },
        setController: function(e) {
            this._oController = e
        },
        getLoggingSession: function() {
            return this._oLoggingSession
        },
        setLoggingSession: function(e) {
            this._oLoggingSession = e
        },
        getNotifications: function() {
            return this._oNotifications
        },
        getPluginId: function() {
            return "BackendLoggingListener_pluginId"
        },
        getPageName: function() {
            return "@POD_PAGE@"
        },
        getPodController: function() {},
        getBackendLoggingSession: function() {
            return this._oBackendLoggingSession
        },
        _createLoggingSession: function(e) {
            if (!this.getLoggingSession()) {
                this.setLoggingSession(new s(e, this.getBackendLoggingSession()))
            }
        },
        _isSupportedPodType: function(e) {
            return n.WorkCenter === e || n.Operation === e || n.Order === e
        },
        _initUi5Loggers: function(e) {
            this._activeUiLoggingConfiguration = e;
            for (let i of e.getLogSettings()) {
                t.setLevel(i.getLevel(), i.getComponent())
            }
        },
        _clearLoggingLevels: function(e) {
            if (e) {
                let i = e.getLogSettings();
                for (let e of i) {
                    t.setLevel(t.Level.NONE, e.getComponent())
                }
            }
        },
        _sendLogMessage: function(e) {
            let t = this._oNotifications._getStompClient();
            let i = this._getLogLevelStringFromIntLevel(e.level);
            t.connected && t.publish({
                destination: "/UI_LOG",
                body: '{component: "' + e.component + '",message:"[' + e.time + "] " + e.message + '",level:"' + i + '"}'
            })
        },
        _createSubscription: function(e) {
            this._oNotifications.createStompConnection().then(function() {
                this._oNotifications.subscribeServerEvent({
                    notificationContext: e.getNotificationContext(),
                    notificationConfig: e.getNotificationConfig(),
                    msgHandler: this._handleBackendConfigurationUpdated.bind(this)
                });
                e.notificationContext = e.getNotificationContext()
            }.bind(this))
        },
        _handleBackendConfigurationUpdated: function(e) {
            let t = this.getLoggingSession().createLoggingConfiguration(e);
            if (t.isDeleted()) {
                this._handleBackendConfigurationDeleted(t)
            } else if (this._isActiveLoggingConfiguration(t)) {
                this._clearLoggingLevels(this._activeUiLoggingConfiguration);
                this._activeUiLoggingConfiguration.setLogSettings(t.getLogSettings());
                this.getLoggingSession().refreshLogLevelMap();
                this._initUi5Loggers(this._activeUiLoggingConfiguration)
            } else {
                this.getLoggingSession().updateLogSettingsForConfiguration(t.getId(), t.getLogSettings())
            }
        },
        _handleBackendConfigurationDeleted: function(e) {
            let t = this.getLoggingSession().removeConfiguration(e.getId());
            if (t) {
                if (this._isActiveLoggingConfiguration(t)) {
                    this._clearLoggingLevels(t);
                    this._oNotifications.unsubscribeServerEvent(t.getNotificationContext());
                    this._removeLogListener();
                    this._activeUiLoggingConfiguration = null
                }
                if (!this.getLoggingSession().hasConfigurations()) {
                    this._removeLogListener();
                    this._unsubscribePodSelectionChange();
                    this._oNotifications.destroy();
                    this._oLoggingSession = null;
                    this._activeUiLoggingConfiguration = null
                }
            }
        },
        _unsubscribePodSelectionChange: function() {
            let e = this._oController.getEventHandler();
            e.unsubscribe(this, "PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this)
        },
        _hasActiveLoggingConfiguration: function() {
            return !!this._activeUiLoggingConfiguration
        },
        _isActiveLoggingConfiguration: function(e) {
            return this._activeUiLoggingConfiguration && this._activeUiLoggingConfiguration.getId() === e.getId()
        },
        _getConfigurationForPodSelection: function(e, t) {
            if (n.Order === t) {
                return this._getConfigurationForOrderPodSelection(e)
            } else {
                let i = this._createClientContextForPodSelection(e, t);
                return this.getLoggingSession().getConfiguration(i)
            }
        },
        _createClientContextForPodSelection: function(e, t) {
            if (n.WorkCenter === t) {
                return new r(e.getWorkCenter(), e.getResource())
            } else if (n.Operation === t) {
                return new a(e.getOperation().operation, e.getResource().resource)
            }
        },
        _getConfigurationForOrderPodSelection: function(e) {
            let t = null;
            let i = null;
            let n = e.getSelectedWorkCenters();
            let o = e.getShopOrders();
            if (n && n.length > 0) {
                let g = e.getResource();
                let s = e.getMaterialNo();
                for (let e of n) {
                    if (o && o.length > 0) {
                        for (let n of o) {
                            i = new c(e, g, s, n);
                            t = this.getLoggingSession().getConfiguration(i);
                            if (t) {
                                return t
                            }
                        }
                    } else {
                        i = new c(e, g, s);
                        t = this.getLoggingSession().getConfiguration(i);
                        if (t) {
                            return t
                        }
                    }
                }
            }
        },
        _getLogLevelStringFromIntLevel: function(e) {
            switch (e) {
                case 1:
                    return "ERROR";
                case 2:
                    return "WARNING";
                case 3:
                    return "INFO";
                case 4:
                    return "DEBUG";
                case 5:
                    return "TRACE"
            }
        },
        _addLogListener: function() {
            if (!this._hasActiveLoggingConfiguration()) {
                t.addLogListener(this)
            }
        },
        _removeLogListener: function() {
            t.removeLogListener(this)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/LogSetting", ["sap/ui/base/Object", "sap/base/Log"], function(e, t) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.logging.LogSetting", {
        constructor: function(e, t) {
            this._component = e;
            this._level = this._getUi5LogLevel(t)
        },
        getComponent: function() {
            return this._component
        },
        getLevel: function() {
            return this._level
        },
        _getUi5LogLevel: function(e) {
            let n = null;
            switch (e) {
                case "NONE":
                    n = t.Level.NONE;
                    break;
                case "ERROR":
                    n = t.Level.ERROR;
                    break;
                case "WARNING":
                    n = t.Level.WARNING;
                    break;
                case "INFO":
                    n = t.Level.INFO;
                    break;
                case "DEBUG":
                    n = t.Level.DEBUG;
                    break;
                case "TRACE":
                    n = t.Level.TRACE;
                    break;
                default:
                    n = t.Level.NONE
            }
            return n
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/LoggingConfiguration", ["sap/ui/base/Object", "sap/dm/dme/podfoundation/logging/LogSetting", "sap/dm/dme/serverevent/NotificationContext"], function(t, n, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.LoggingConfiguration", {
        constructor: function(t) {
            this._id = t.id;
            this._deleted = !!t.deleted;
            this._logSettings = [];
            for (let i of t.loggingSettings) {
                this._logSettings.push(new n(i.component, i.level))
            }
            let e = new i("UI_LOG");
            e.setPlant(t.plant);
            e.setPodId(t.podId);
            e.setBackendLoggingConfigurationId(t.id);
            this._oNotificationContext = e
        },
        getId: function() {
            return this._id
        },
        getClientContext: function() {
            return this._oClientContext
        },
        getNotificationContext: function() {
            return this._oNotificationContext
        },
        getNotificationConfig: function() {
            return this._oNotificationConfig
        },
        getLogSettings: function() {
            return this._logSettings
        },
        setLogSettings: function(t) {
            this._logSettings = t
        },
        isDeleted: function() {
            return this._deleted
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/LoggingSession", ["sap/ui/base/Object", "sap/ui/base/Interface", "sap/base/Log", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/podfoundation/logging/WorkCenterPodLoggingConfiguration", "sap/dm/dme/podfoundation/logging/OperationPodLoggingConfiguration", "sap/dm/dme/podfoundation/logging/OrderPodLoggingConfiguration"], function(t, e, n, o, i, g, r) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.LoggingSession", {
        constructor: function(t, e) {
            this._plant = e.plant;
            this._podId = e.podId;
            this._podType = t;
            this._configurationsMap = new Map;
            for (let t of e.configurations) {
                let e = this.createLoggingConfiguration(t);
                this._configurationsMap.set(e.getClientContext().getKey(), e)
            }
            this._logLevelMap = this._createLogLevelMap()
        },
        getPlant: function() {
            return this._plant
        },
        getPodId: function() {
            return this._podId
        },
        getPodType: function() {
            return this._podType
        },
        createLoggingConfiguration: function(t) {
            t.plant = this.getPlant();
            t.podId = this.getPodId();
            if (o.WorkCenter === this.getPodType()) {
                return new i(t).getInterface()
            } else if (o.Operation === this.getPodType()) {
                return new g(t).getInterface()
            } else if (o.Order === this.getPodType()) {
                return new r(t).getInterface()
            }
        },
        removeConfiguration: function(t) {
            let e = this.getConfigurationById(t);
            if (e) {
                this.getConfigurations().delete(e.getClientContext().getKey());
                this.refreshLogLevelMap()
            }
            return e
        },
        hasConfigurations: function() {
            return this.getConfigurations().size > 0
        },
        getConfiguration: function(t) {
            return this._configurationsMap.get(t.getKey())
        },
        getConfigurations: function() {
            return this._configurationsMap
        },
        getConfigurationById: function(t) {
            let e = null;
            this.getConfigurations().forEach(function(n) {
                if (n.getId() === t) {
                    e = n
                }
            });
            return e
        },
        filterLogMessage: function(t, e) {
            let o = this._logLevelMap[e];
            if (o && o[t.component] && (t.level > n.Level.FATAL && t.level < n.Level.ALL)) {
                return t
            }
        },
        updateLogSettingsForConfiguration: function(t, e) {
            this.getConfigurations().forEach(function(n) {
                if (n.getId() === t) {
                    n.setLogSettings(e)
                }
            });
            this.refreshLogLevelMap()
        },
        refreshLogLevelMap: function() {
            this._logLevelMap = this._createLogLevelMap()
        },
        _createLogLevelMap: function() {
            let t = {};
            let e = this.getConfigurations();
            let n = {};
            e.forEach(function(e) {
                let o = e.getLogSettings();
                for (let t of o) {
                    n[t.getComponent()] = t.getLevel()
                }
                t[e.getId()] = n
            });
            return t
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/OperationPodClientContext", ["sap/ui/base/Object"], function(t) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.OperationPodClientContext", {
        constructor: function(t, e) {
            this._operationActivity = t;
            this._resource = e
        },
        getKey: function() {
            return this._operationActivity + this._resource
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/OperationPodLoggingConfiguration", ["sap/dm/dme/podfoundation/logging/LoggingConfiguration", "sap/dm/dme/podfoundation/logging/OperationPodClientContext", "sap/dm/dme/serverevent/NotificationConfig"], function(t, i, o) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.OperationPodLoggingConfiguration", {
        constructor: function(e) {
            t.call(this, e);
            this._oClientContext = new i(e.clientContext.operationActivity, e.clientContext.resource).getInterface();
            this._oNotificationConfig = new o({
                subscribeOperation: true,
                subscribeResource: true,
                uiLoggingNotification: true
            });
            this.getNotificationContext().setPodType("O");
            this.getNotificationContext().setOperation(e.clientContext.operationActivity);
            this.getNotificationContext().setResource(e.clientContext.resource)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/OrderPodClientContext", ["sap/ui/base/Object"], function(r) {
    "use strict";
    return r.extend("sap.dm.dme.podfoundation.logging.OrderPodClientContext", {
        constructor: function(r, e, t, i) {
            if (!r || !r.trim()) {
                throw Error("Work center must be defined for backend logging.")
            }
            this._workCenter = r;
            this._resource = e;
            this._material = t;
            this._order = i
        },
        hasResource: function() {
            return !!this._resource
        },
        hasMaterial: function() {
            return !!this._material
        },
        hasOrder: function() {
            return !!this._order
        },
        getKey: function() {
            let r = this._workCenter;
            r = this.hasResource() ? r + this._resource : r;
            r = this.hasMaterial() ? r + this._material : r;
            return this.hasOrder() ? r + this._order : r
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/OrderPodLoggingConfiguration", ["sap/dm/dme/podfoundation/logging/LoggingConfiguration", "sap/dm/dme/podfoundation/logging/OrderPodClientContext", "sap/dm/dme/serverevent/NotificationConfig"], function(t, e, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.OrderPodLoggingConfiguration", {
        constructor: function(o) {
            t.call(this, o);
            this._oClientContext = new e(o.clientContext.workCenter, o.clientContext.resource, o.clientContext.material, o.clientContext.order).getInterface();
            this._oNotificationConfig = new i({
                subscribeWorkCenter: true,
                subscribeResource: this._oClientContext.hasResource(),
                subscribeMaterial: this._oClientContext.hasMaterial(),
                subscribeOrder: this._oClientContext.hasOrder(),
                uiLoggingNotification: true
            });
            this.getNotificationContext().setPodType("R");
            this.getNotificationContext().setWorkCenter(o.clientContext.workCenter);
            this.getNotificationContext().setResource(o.clientContext.resource);
            this.getNotificationContext().setMaterial(o.clientContext.material);
            this.getNotificationContext().setOrder(o.clientContext.order)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/WorkCenterPodClientContext", ["sap/ui/base/Object"], function(e) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.logging.WorkCenterPodClientContext", {
        constructor: function(e, t) {
            this._workCenter = e;
            this._resource = t ? t.resource : null
        },
        getKey: function() {
            return this._resource ? this._workCenter + this._resource : this._workCenter
        },
        hasResource: function() {
            return !!this._resource
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/logging/WorkCenterPodLoggingConfiguration", ["sap/dm/dme/podfoundation/logging/LoggingConfiguration", "sap/dm/dme/podfoundation/logging/WorkCenterPodClientContext", "sap/dm/dme/serverevent/NotificationConfig"], function(t, e, o) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.logging.WorkCenterPodLoggingConfiguration", {
        constructor: function(n) {
            t.call(this, n);
            this._oClientContext = new e(n.clientContext.workCenter, {
                resource: n.clientContext.resource
            }).getInterface();
            this._oNotificationConfig = new o({
                subscribeWorkCenter: true,
                subscribeResource: this._oClientContext.hasResource(),
                uiLoggingNotification: true
            });
            this.getNotificationContext().setPodType("W");
            this.getNotificationContext().setWorkCenter(n.clientContext.workCenter);
            this.getNotificationContext().setResource(n.clientContext.resource)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/InputType", [], function() {
    "use strict";
    return {
        Sfc: "SFC",
        ShopOrder: "SHOP_ORDER",
        ProcessLot: "PROCESS_LOT",
        Item: "ITEM",
        ItemVersion: "ITEM_VERSION"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/ItemKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.ItemKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.site = "";
            this.item = t;
            this.version = ""
        }
    });
    e.prototype.init = function(t) {
        this.ref = t.ref;
        this.site = t.site;
        this.item = t.item;
        this.version = t.version
    };
    e.prototype.getRef = function() {
        return this.ref
    };
    e.prototype.setRef = function(t) {
        this.ref = t
    };
    e.prototype.getSite = function() {
        return this.site
    };
    e.prototype.setSite = function(t) {
        this.site = t
    };
    e.prototype.getItem = function() {
        return this.item
    };
    e.prototype.setItem = function(t) {
        this.item = t
    };
    e.prototype.getVersion = function() {
        return this.version
    };
    e.prototype.setVersion = function(t) {
        this.version = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/OperationKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.OperationKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.site = "";
            this.operation = t;
            this.version = ""
        }
    });
    e.prototype.init = function(t) {
        this.ref = t.ref;
        this.site = t.site;
        this.operation = t.operation;
        this.version = t.version
    };
    e.prototype.getRef = function() {
        return this.ref
    };
    e.prototype.setRef = function(t) {
        this.ref = t
    };
    e.prototype.getSite = function() {
        return this.site
    };
    e.prototype.setSite = function(t) {
        this.site = t
    };
    e.prototype.getOperation = function() {
        return this.operation
    };
    e.prototype.setOperation = function(t) {
        this.operation = t
    };
    e.prototype.getVersion = function() {
        return this.version
    };
    e.prototype.setVersion = function(t) {
        this.version = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/PodSelectionModel", ["sap/ui/base/Object", "./InputType", "./PodType"], function(e, t, n) {
    "use strict";
    const o = ["podType", "podSelectionType", "inputType", "worklistType", "inputValue", "resource", "user", "substepGroup", "workCenter", "endUnit", "quantity", "workInstruction", "dataCollection", "currentComponentIndex", "assemblyMode", "materialNo", "materialVersion", "fromDate", "toDate", "orderSelectionRange", "timeZoneId", "downtimeTypeToShow", "orderContextFromSpeedLossRow", "inspectionCharacteristic", "selectedWorklistOperations", "isInventoryManaged", "selectedPhaseWorkCenter", "requiredValuesLoaded", "orderId", "productionProcessWorkCenters"];
    const s = [{
        singular: "selection",
        plural: "selections"
    }, {
        singular: "operation",
        plural: "operations"
    }, {
        singular: "component",
        plural: "components"
    }, {
        singular: "distinctSelection",
        plural: "distinctSelections"
    }, {
        singular: "selectedWorkCenter",
        plural: "selectedWorkCenters"
    }, {
        singular: "selectedRoutingStep",
        plural: "selectedRoutingSteps"
    }, {
        singular: "shopOrder",
        plural: "shopOrders"
    }];

    function i(e) {
        return e.charAt(0).toUpperCase() + e.slice(1)
    }

    function r(e, t) {
        e["get" + i(t)] = function() {
            return e[t]
        }
    }

    function l(e, t) {
        let n = "set" + i(t);
        if (!e[n]) {
            e[n] = function(n) {
                e[t] = n
            }
        }
    }

    function u(e, t, n) {
        e["get" + i(n)] = function(n) {
            return e[t][n || 0]
        }
    }

    function p(e, t, n) {
        e["add" + i(n)] = function(n) {
            return e[t].unshift(n)
        }
    }

    function c(e, t) {
        let n = "clear" + i(t);
        if (!e[n]) {
            e[n] = function() {
                e[t] = []
            }
        }
    }

    function a(e) {
        for (let t of o) {
            r(e, t);
            l(e, t)
        }
    }

    function d(e) {
        for (let t of s) {
            e[t.plural] = [];
            r(e, t.plural);
            l(e, t.plural);
            u(e, t.plural, t.singular);
            p(e, t.plural, t.singular);
            c(e, t.plural)
        }
    }

    function h(e) {
        a(e);
        d(e)
    }
    let f = e.extend("sap.dm.dme.podfoundation.model.PodSelectionModel", {
        constructor: function() {
            e.apply(this, arguments);
            h(this);
            this.podType = n.Operation;
            this.podSelectionType = "";
            this.inputType = t.Sfc;
            this.worklistType = t.Sfc;
            this.user = "";
            this.substepGroup = "";
            this.workCenter = "";
            this.orderId = "";
            this.endUnit = "";
            this.quantity = null;
            this.currentComponentIndex = -1;
            this.downtimeTypeToShow = "";
            this.selectedWorklistOperations = [];
            this.selectedWorkCenters = [];
            this.shopOrders = [];
            this.selectedPhaseWorkCenter = "";
            this.requiredValuesLoaded = false;
            this.selectedRoutingSteps = []
        }
    });
    f.prototype.clear = function() {
        this.selections = [];
        this.operations = [];
        this.distinctSelections = [];
        this.resource = null;
        this.user = "";
        this.substepGroup = "";
        this.workCenter = "";
        this.endUnit = "";
        this.quantity = null;
        this.workInstruction = null;
        this.dataCollection = null;
        this.currentComponentIndex = -1;
        this.materialNo = "";
        this.materialVersion = "";
        this.orderId = "";
        this.fromDate = "";
        this.toDate = "";
        this.orderSelectionRange = "";
        this.timeZoneId = "";
        this.downtimeTypeToShow = "";
        this.orderContextFromSpeedLossRow = "";
        this.inspectionCharacteristic = {};
        this.selectedWorklistOperations = [];
        this.isInventoryManaged = {};
        this.selectedWorkCenters = [];
        this.selectedPhaseWorkCenter = "";
        this.requiredValuesLoaded = false;
        this.selectedRoutingSteps = [];
        this.shopOrders = []
    };
    f.prototype.setComponents = function(e) {
        this.components = e || [];
        this.currentComponentIndex = -1
    };
    f.prototype.clearComponents = function() {
        this.components = [];
        this.currentComponentIndex = -1
    };
    f.prototype.getCurrentComponent = function() {
        return this.components[this.currentComponentIndex]
    };
    return f
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/PodSelectionType", [], function() {
    "use strict";
    return {
        Sfc: "SFC",
        WorkCenter: "WORK_CENTER",
        Operation: "OPERATION"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/PodType", [], function() {
    "use strict";
    return {
        Operation: "OPERATION",
        WorkCenter: "WORK_CENTER",
        Order: "ORDER",
        NC: "NC",
        Custom: "OTHER",
        Monitor: "MONITOR",
        OEE: "OEE"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/ProcessLotKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var o = t.extend("sap.dm.dme.podfoundation.model.ProcessLotKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.processLot = t
        }
    });
    o.prototype.init = function(t) {
        this.ref = t.ref;
        this.processLot = t.processLot
    };
    o.prototype.getRef = function() {
        return this.ref
    };
    o.prototype.setRef = function(t) {
        this.ref = t
    };
    o.prototype.getProcessLot = function() {
        return this.processLot
    };
    o.prototype.setProcessLot = function(t) {
        this.processLot = t
    };
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/ResourceKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.ResourceKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.site = "";
            this.resource = t
        }
    });
    e.prototype.init = function(t) {
        this.ref = t.ref;
        this.site = t.site;
        this.resource = t.resource
    };
    e.prototype.getRef = function() {
        return this.ref
    };
    e.prototype.setRef = function(t) {
        this.ref = t
    };
    e.prototype.getSite = function() {
        return this.site
    };
    e.prototype.setSite = function(t) {
        this.site = t
    };
    e.prototype.getResource = function() {
        return this.resource
    };
    e.prototype.setResource = function(t) {
        this.resource = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/RoutingStep", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var o = t.extend("sap.dm.dme.podfoundation.model.RoutingStep", {
        constructor: function(t) {
            this.routing = "";
            this.routingVersion = "";
            this.routingType = "";
            this.operation = "";
            this.stepId = "";
            if (t) {
                this.init(t)
            }
        }
    });
    o.prototype.init = function(t) {
        this.routing = t.routing;
        this.routingVersion = t.routingVersion;
        this.routingType = t.routingType;
        this.operation = t.operation;
        this.stepId = t.stepId
    };
    o.prototype.getRouting = function() {
        return this.routing
    };
    o.prototype.setRouting = function(t) {
        this.routing = t
    };
    o.prototype.getRoutingVersion = function() {
        return this.routingVersion
    };
    o.prototype.setRoutingVersion = function(t) {
        this.routingVersion = t
    };
    o.prototype.getRoutingType = function() {
        return this.routingType
    };
    o.prototype.setRoutingType = function(t) {
        this.routingType = t
    };
    o.prototype.getOperation = function() {
        return this.operation
    };
    o.prototype.setOperation = function(t) {
        this.operation = t
    };
    o.prototype.getStepId = function() {
        return this.stepId
    };
    o.prototype.setStepId = function(t) {
        this.stepId = t
    };
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/Selection", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var o = t.extend("sap.dm.dme.podfoundation.model.Selection", {
        constructor: function() {
            this.input = "";
            this.sfc;
            this.item;
            this.processLot;
            this.shopOrder;
            this.sfcData
        }
    });
    o.prototype.init = function(t) {
        this.input = t.input;
        this.sfc = t.sfc;
        this.item = t.item;
        this.processLot = t.processLot;
        this.shopOrder = t.shopOrder;
        this.sfcData = t.sfcData
    };
    o.prototype.getInput = function() {
        return this.input
    };
    o.prototype.setInput = function(t) {
        this.input = t
    };
    o.prototype.getSfc = function() {
        return this.sfc
    };
    o.prototype.setSfc = function(t) {
        this.sfc = t
    };
    o.prototype.getItem = function() {
        return this.item
    };
    o.prototype.setItem = function(t) {
        this.item = t
    };
    o.prototype.getProcessLot = function() {
        return this.processLot
    };
    o.prototype.setProcessLot = function(t) {
        this.processLot = t
    };
    o.prototype.getShopOrder = function() {
        return this.shopOrder
    };
    o.prototype.setShopOrder = function(t) {
        this.shopOrder = t
    };
    o.prototype.getSfcData = function() {
        return this.sfcData
    };
    o.prototype.setSfcData = function(t) {
        this.sfcData = t
    };
    return o
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/SfcData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.SfcData", {
        constructor: function(t) {
            this.sfc = t;
            this.quantity = 0;
            this.statusCode = "";
            this.completePending = "";
            this.material = "";
            this.materialVersion = "";
            this.materialAndVersion = "";
            this.materialDescription = "";
            this.routing = "";
            this.routingVersion = "";
            this.routingType = "";
            this.operation = "";
            this.stepId = "";
            this.workCenter = "";
            this.resource = ""
        }
    });
    e.prototype.init = function(t) {
        this.sfc = t.sfc;
        this.quantity = t.quantity;
        this.statusCode = t.statusCode;
        this.completePending = t.completePending;
        this.material = t.material;
        this.materialVersion = t.materialVersion;
        this.materialAndVersion = t.materialAndVersion;
        this.materialDescription = t.materialDescription;
        this.routing = t.routing;
        this.routingVersion = t.routingVersion;
        this.routingType = t.routingType;
        this.operation = t.operation;
        this.stepId = t.stepId;
        this.workCenter = t.workCenter;
        this.resource = t.resource
    };
    e.prototype.getSfc = function() {
        return this.sfc
    };
    e.prototype.setSfc = function(t) {
        this.sfc = t
    };
    e.prototype.getQuantity = function() {
        return this.quantity
    };
    e.prototype.setQuantity = function(t) {
        this.quantity = t
    };
    e.prototype.getStatusCode = function() {
        return this.statusCode
    };
    e.prototype.setStatusCode = function(t) {
        this.statusCode = t
    };
    e.prototype.getCompletePending = function() {
        return this.completePending
    };
    e.prototype.setCompletePending = function(t) {
        this.completePending = t
    };
    e.prototype.getMaterial = function() {
        return this.material
    };
    e.prototype.setMaterial = function(t) {
        this.material = t
    };
    e.prototype.getMaterialVersion = function() {
        return this.materialVersion
    };
    e.prototype.setMaterialVersion = function(t) {
        this.materialVersion = t
    };
    e.prototype.getMaterialAndVersion = function() {
        return this.materialAndVersion
    };
    e.prototype.setMaterialAndVersion = function(t) {
        this.materialAndVersion = t
    };
    e.prototype.getMaterialDescription = function() {
        return this.materialDescription
    };
    e.prototype.setMaterialDescription = function(t) {
        this.materialDescription = t
    };
    e.prototype.getRouting = function() {
        return this.routing
    };
    e.prototype.setRouting = function(t) {
        this.routing = t
    };
    e.prototype.getRoutingVersion = function() {
        return this.routingVersion
    };
    e.prototype.setRoutingVersion = function(t) {
        this.routingVersion = t
    };
    e.prototype.getRoutingType = function() {
        return this.routingType
    };
    e.prototype.setRoutingType = function(t) {
        this.routingType = t
    };
    e.prototype.getOperation = function() {
        return this.operation
    };
    e.prototype.setOperation = function(t) {
        this.operation = t
    };
    e.prototype.getStepId = function() {
        return this.stepId
    };
    e.prototype.setStepId = function(t) {
        this.stepId = t
    };
    e.prototype.getWorkCenter = function() {
        return this.workCenter
    };
    e.prototype.setWorkCenter = function(t) {
        this.workCenter = t
    };
    e.prototype.getResource = function() {
        return this.resource
    };
    e.prototype.setResource = function(t) {
        this.resource = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/SfcKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.SfcKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.site = "";
            this.sfc = t
        }
    });
    e.prototype.init = function(t) {
        this.ref = t.ref;
        this.site = t.site;
        this.sfc = t.sfc
    };
    e.prototype.getRef = function() {
        return this.ref
    };
    e.prototype.setRef = function(t) {
        this.ref = t
    };
    e.prototype.getSite = function() {
        return this.site
    };
    e.prototype.setSite = function(t) {
        this.site = t
    };
    e.prototype.getSfc = function() {
        return this.sfc
    };
    e.prototype.setSfc = function(t) {
        this.sfc = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/ShopOrderKeyData", ["sap/ui/base/Object"], function(t) {
    "use strict";
    var e = t.extend("sap.dm.dme.podfoundation.model.ShopOrderKeyData", {
        constructor: function(t) {
            this.ref = "";
            this.site = "";
            this.shopOrder = t
        }
    });
    e.prototype.init = function(t) {
        this.ref = t.ref;
        this.site = t.site;
        this.shopOrder = t.shopOrder
    };
    e.prototype.getRef = function() {
        return this.ref
    };
    e.prototype.setRef = function(t) {
        this.ref = t
    };
    e.prototype.getSite = function() {
        return this.site
    };
    e.prototype.setSite = function(t) {
        this.site = t
    };
    e.prototype.getShopOrder = function() {
        return this.shopOrder
    };
    e.prototype.setShopOrder = function(t) {
        this.shopOrder = t
    };
    return e
});
sap.ui.predefine("sap/dm/dme/podfoundation/model/UserPreferences", ["sap/ui/base/Object"], function(e) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.model.UserPreferences", {
        constructor: function(r, t) {
            e.call(this);
            this._oPodController = r;
            this._sUserPreferencesKey = "USER_PREFERENCES_" + t
        },
        getPreferences: function() {
            return this.getGlobalProperty(this._sUserPreferencesKey)
        },
        setPreferences: function(e) {
            this.setGlobalProperty(this._sUserPreferencesKey, e);
            return true
        },
        getPreference: function(e) {
            var r = this.getPreferences();
            if (r && r[e]) {
                return r[e]
            }
            return undefined
        },
        setPreference: function(e, r) {
            var t = this.getPreferences();
            if (!t) {
                t = {}
            }
            t[e] = r;
            this.setPreferences(t)
        },
        removePreference: function(e) {
            var r = this.getPreferences();
            if (!r) {
                return
            }
            if (r[e]) {
                delete r[e]
            }
            this.setPreferences(r)
        },
        clearPreferences: function() {
            this.removeGlobalProperty(this._sUserPreferencesKey)
        },
        setGlobalProperty: function(e, r) {
            return this._oPodController.getOwnerComponent().setGlobalProperty(e, r)
        },
        getGlobalProperty: function(e) {
            return this._oPodController.getOwnerComponent().getGlobalProperty(e)
        },
        removeGlobalProperty: function(e) {
            return this._oPodController.getOwnerComponent().removeGlobalProperty(e)
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/popup/PopupHandler", ["sap/base/security/URLWhitelist", "sap/ui/util/Storage"], function(e, t) {
    "use strict";
    var o = [];
    return {
        openPodPopupViewerWindow: function(e, t, o, n, i, r) {
            var a = {
                sPluginId: "popupViewPlugin",
                pluginName: "sap.dm.dme.plugins.popupViewerPlugin",
                pluginData: {
                    configuration: r
                }
            };
            var p = JSON.stringify(a);
            this.setData("POPUP_WINDOW_PLUGIN_DATA", p);
            var u = this.getApplicationPopupWindowUrl("pod");
            return this.openModelessWindow(u, a.sPluginId, e, t, o, n, i)
        },
        openModelessWindow: function(t, o, n, i, r, a, p) {
            var u = t;
            if (!jQuery.trim(u)) {
                throw new Error("URL is undefined")
            }
            if (!e.validate(u)) {
                throw new Error("Invalid URL: " + u)
            }
            var l = this._getScreenAvailableHeight();
            var s = this._getScreenAvailableWidth();
            var f = s;
            var d = l;
            if (n && n > 0 && n < s) {
                f = n
            }
            if (i && i > 0 && i < l) {
                d = i
            }
            var c = r;
            if (!c || c < 0) {
                if (l > d) {
                    c = (l - d) / 2 - 30 - 15
                } else {
                    c = 0;
                    d = l - 30 - 15
                }
            }
            var g = a;
            if (!g || g < 0) {
                if (s > f) {
                    g = (s - f) / 2
                } else {
                    g = 0
                }
            }
            var h = true;
            if (typeof p !== "undefined") {
                h = p
            }
            var v = "top=" + c + ",left=" + g + ",width=" + f + ",height=" + d + ",resizable=" + h + ",toolbar=0,location=0,directories=0,status=0,menubar=0,copyhistory=0";
            var m = window.open("", o, v);
            if (!m) {
                throw new Error("Window not created")
            }
            this._addPopupName(o);
            if (this.isPopupClosed(m)) {
                m.location = u
            } else {
                m.location.reload()
            }
            m.focus();
            return m
        },
        getApplicationPopupWindowUrl: function(e) {
            var t = this._getWindowLocationUrl();
            var o = t;
            var n = new URL(t);
            if (n.pathname.indexOf("/cp.portal") >= 0) {
                o = n.origin.concat("/sapdmdmepod/popup.html")
            } else if (n.hostname === "localhost" && n.pathname.indexOf("/portal") >= 0) {
                o = n.origin.concat("/dme/podfoundation-ui/pod/webapp/test/flppopup.html")
            } else {
                var i = t.indexOf("/" + e);
                if (i < 0) {
                    i = t.lastIndexOf("/index.html")
                }
                if (i < 0) {
                    throw new Error("Cannot resolve url from " + t)
                }
                o = t.substring(0, i);
                if (o.indexOf("/dme") < 0) {
                    o = o + "/dme"
                }
                if (t.indexOf("/test") >= 0) {
                    o = o + "/" + e + "/test/popup.html"
                } else if (t.indexOf("/index.html#") >= 0) {
                    o = o + "/" + e + "/edgepopup.html"
                } else {
                    o = o + "/" + e + "/popup.html"
                }
            }
            return o
        },
        _addPopupName: function(e) {
            var t = false;
            if (o && o.length > 0) {
                for (var n = 0; n < o.length; n++) {
                    if (o[n].popupName === e) {
                        t = true;
                        break
                    }
                }
            }
            if (!t) {
                o[o.length] = {
                    popupName: e,
                    component: null
                }
            }
        },
        setPopupComponent: function(e, t) {
            if (o && o.length > 0) {
                for (var n = 0; n < o.length; n++) {
                    if (o[n].popupName === e) {
                        o[n].component = t;
                        break
                    }
                }
            }
        },
        onPopupClosed: function(e, t) {
            if (o && o.length > 0) {
                var n = -1;
                for (var i = 0; i < o.length; i++) {
                    if (o[i].popupName === e) {
                        try {
                            this.destroyPopupComponent(o[i].component)
                        } catch (e) {
                            jQuery.sap.log.error("PopupHandler.destroyPopupComponent: Could not destroy " + o[i].popupName + ". Error = " + e.message)
                        }
                        n = i;
                        break
                    }
                }
                if (n > -1) {
                    o.splice(n, 1)
                }
            }
        },
        destroyPopupComponent: function(e) {
            if (e) {
                var t = e.getRootControl();
                if (t && t.getController) {
                    var o = t.getController();
                    if (o) {
                        o.onExit()
                    }
                    t.destroy()
                }
            }
        },
        isPopupClosed: function(e) {
            if (!e || e.closed) {
                return true
            }
            if (!e.document.URL || e.document.URL.indexOf("about") === 0) {
                return true
            }
            return false
        },
        closePopupWindow: function(e) {
            var t = window.open("", e);
            if (!t || t.closed) {
                return
            }
            t.close()
        },
        isPopupDisplayed: function() {
            if (o && o.length > 0) {
                return true
            }
            return false
        },
        _getScreenAvailableHeight: function() {
            return screen.availHeight
        },
        _getScreenAvailableWidth: function() {
            return screen.availWidth
        },
        _getWindowLocationUrl: function() {
            return window.location.href
        },
        _getPopupWindowList: function() {
            return o
        },
        getData: function(e) {
            var t = this._getStorage();
            return t.get(e)
        },
        setData: function(e, t) {
            var o = this._getStorage();
            o.put(e, t)
        },
        removeData: function(e) {
            var t = this._getStorage();
            t.remove(e)
        },
        clearAllData: function() {
            var e = this._getStorage();
            e.removeAll()
        },
        _getStorage: function() {
            if (!this._oLocalStorage) {
                this._oLocalStorage = new t(t.Type.local, "popup_storage")
            }
            return this._oLocalStorage
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/process/ProcessSimulator", ["sap/ui/base/Object", "sap/ui/util/Storage", "sap/dm/dme/logging/Logging", "sap/dm/dme/message/ErrorHandler"], function(t, e, o, r) {
    "use strict";
    var n = t.extend("sap.dm.dme.podfoundation.process.ProcessSimulator", {
        constructor: function() {
            this._subscribeToStorageEvent();
            this._oLogger = o.getLogger("sap.dm.dme.podfoundation.process.ProcessSimulator")
        }
    });
    n.prototype.destroy = function() {
        this._unsubscribeToStorageEvent();
        var t = this._getLocalStorage();
        if (t) {
            t.remove("PROCESS_EVENT")
        }
    };
    n.prototype.attachProcessEventListener = function(t, e, o) {
        if (!this._oEventListeners) {
            this._oEventListeners = {}
        }
        if (!this._oEventListeners[t]) {
            this._oEventListeners[t] = []
        }
        this._oEventListeners[t][this._oEventListeners[t].length] = {
            callback: e,
            context: o
        }
    };
    n.prototype.sendProcessEventMessage = function(t, e) {
        var o = this._getLocalStorage();
        if (o) {
            var r = {
                event: t,
                message: e
            };
            o.put("PROCESS_EVENT", JSON.stringify(r))
        }
    };
    n.prototype._handleStorageChangeEvent = function(t) {
        var e = this._getLocalStorage();
        var o = e.get("PROCESS_EVENT");
        if (!o || o === "") {
            return
        }
        if (!this._oEventListeners) {
            return
        }
        var r = null;
        try {
            r = JSON.parse(o)
        } catch (t) {
            this._oLogger.error("_handleStorageChangeEvent: error parsing event = " + o);
            return
        }
        var n = this._oEventListeners[r.event];
        if (!n || n.length === 0) {
            return
        }
        for (var a = 0; a < n.length; a++) {
            this._callFunctionCallback(n[a].callback, n[a].context, r)
        }
    };
    n.prototype._callFunctionCallback = function(t, e, o) {
        var n = this;
        setTimeout(function() {
            try {
                t.call(e, o)
            } catch (e) {
                var a = r.getErrorMessage(e);
                n._oLogger.error("_handleStorageChangeEvent: error calling '" + t + "'", a)
            }
        }, 0)
    };
    n.prototype._subscribeToStorageEvent = function() {
        var t = this._getLocalStorage();
        if (t) {
            var e = this;
            this._getJQueryWindowObject().on("storage", function(t) {
                e._handleStorageChangeEvent(t)
            })
        }
    };
    n.prototype._unsubscribeToStorageEvent = function() {
        var t = this._getLocalStorage();
        if (t) {
            this._getJQueryWindowObject().off("storage")
        }
    };
    n.prototype._getLocalStorage = function() {
        if (typeof this._oLocalStorage === "undefined") {
            var t = this._createLocalStorage();
            if (this._isLocalStorageSupported(t)) {
                this._oLocalStorage = t
            } else {
                this._oLocalStorage = false
            }
        }
        return this._oLocalStorage
    };
    n.prototype._createLocalStorage = function() {
        return new e(e.Type.local, "PROCESS_SIMULATOR")
    };
    n.prototype._isLocalStorageSupported = function(t) {
        var e;
        try {
            e = t.isSupported()
        } catch (t) {
            e = false
        }
        return e
    };
    n.prototype._getJQueryWindowObject = function() {
        return jQuery(window)
    };
    return n
});
sap.ui.predefine("sap/dm/dme/podfoundation/serverevent/LineMonitorNotificationConfig", ["sap/dm/dme/serverevent/NotificationConfig", "sap/dm/dme/serverevent/Topic"], function(i, o) {
    "use strict";
    return i.extend("sap.dm.dme.podfoundation.serverevent.LineMonitorNotificationConfig", {
        constructor: function(i) {
            var o = i ? i : {};
            this._subscribeWorkCenter = !!o.subscribeWorkCenter;
            this._productionProcessNotification = !!o.productionProcessNotification;
            this._topics = this._addTopics(o)
        },
        _addTopics: function(i) {
            var t = [];
            !!i.productionProcessNotification && t.push(o.PP_ACTION);
            return t
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/serverevent/LineMonitorServerNotificationSubscription", ["sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription", "sap/dm/dme/podfoundation/serverevent/LineMonitorNotificationConfig"], function(t, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.serverevent.LineMonitorServerNotificationSubscription", {
        constructor: function(i) {
            t.call(this, i, true)
        },
        _getNotificationConfiguration: function() {
            var t = this._getNotificationConfigurationData();
            var o = new i(t);
            if (o.addCustomTopics) {
                var n = this._getCustomNotificationEvents();
                if (n.length > 0) {
                    o.addCustomTopics(n)
                }
            }
            return o
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/serverevent/PhaseListProcessNotificationConfig", ["sap/dm/dme/serverevent/NotificationConfig", "sap/dm/dme/serverevent/Topic"], function(e, i) {
    "use strict";
    return e.extend("sap.dm.dme.podfoundation.serverevent.PhaseListProcessNotificationConfig", {
        _addTopics: function(e) {
            let t = [];
            !!e.productionProcessNotification && t.push(i.PP_ACTION);
            return t
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/serverevent/PhaseListServerNotificationSubscription", ["sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription", "sap/dm/dme/podfoundation/serverevent/PhaseListProcessNotificationConfig"], function(t, i) {
    "use strict";
    return t.extend("sap.dm.dme.podfoundation.serverevent.PhaseListServerNotificationSubscription", {
        constructor: function(i) {
            t.call(this, i, true)
        },
        init: function() {
            this._createNotificationsObject()
        },
        _getNotificationConfiguration: function() {
            let t = this._getNotificationConfigurationData();
            return new i(t)
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription", ["sap/ui/base/Object", "sap/dm/dme/serverevent/Topic", "sap/dm/dme/serverevent/NotificationConfig", "sap/dm/dme/logging/Logging"], function(t, i, e, n) {
    "use strict";
    var o = /^[a-zA-Z]{1}[a-zA-Z0-9\-_\.]+$/;
    var r = n.getLogger("sap.dm.dme.podfoundation.serverevent.ServerNotificationSubscription");
    return t.extend("sap.dm.dme.podfoundation.serverevent.ServerNotificationSubscription", {
        constructor: function(i, e) {
            t.call(this);
            this._oViewController = i;
            this._oNotifications = null;
            this._bIsPluginController = false;
            if (i.getPluginName) {
                this._bIsPluginController = true
            }
            this._bGroupSubscriptionSupport = !!e
        },
        init: function() {
            this._createNotificationsObject();
            if (this._oViewController.isSubscribingToNotifications() && this._bIsPluginController) {
                this._oViewController.getView().attachEventOnce("beforeRendering", function() {
                    this._onBeforeRendering()
                }.bind(this));
                this._oViewController.getView().attachEventOnce("afterRendering", function() {
                    this._onAfterRendering()
                }.bind(this))
            }
        },
        destroy: function() {
            if (this._oViewController.isSubscribingToNotifications()) {
                this._oViewController.unsubscribe("PodSelectionChangeEvent", this._onPodSelectionChangeEvent, this);
                var t = this._getNotifications();
                if (t) {
                    t.destroy()
                }
            }
        },
        _onBeforeRendering: function(t) {
            this._oViewController.subscribe("PodSelectionChangeEvent", this._onPodSelectionChangeEvent, this)
        },
        _onAfterRendering: function(t) {
            var i = this;
            setTimeout(function() {
                i._updateNotificationSubscriptions()
            }, 1e3)
        },
        _onPodSelectionChangeEvent: function(t, i, e) {
            this._updateNotificationSubscriptions()
        },
        _updateNotificationSubscriptions: function() {
            var t = this._getNotificationConfiguration();
            var e = this._getCurrentNotificationContext();
            if (t.isNotificationsEnabled() && t.hasValuesForSubscription(e)) {
                r.info("_updateNotificationSubscriptions: Notifications enabled and there are values selected for subscription.");
                var n = this._getNotifications();
                if (!n) {
                    r.warning("_updateNotificationSubscriptions: Notifications object not defined, aborting subscription processing.");
                    return
                }
                r.debug("_updateNotificationSubscriptions: Calling creation of STOMP connection.");
                n.createStompConnection().then(function() {
                    var e = t.getTopics();
                    r.info("_updateNotificationSubscriptions: Connection created, begin creating subscriptions for topics=." + e);
                    for (var o = 0; o < e.length; o++) {
                        var s = this._getCurrentNotificationContext();
                        this._updateContextWithTopic(s, e[o]);
                        var a = e[o];
                        if (s.getTopic() === "/" + i.CUSTOM + "/") {
                            a = s.getCustomEventName()
                        }
                        r.debug("_updateNotificationSubscriptions: Processing subscription for event=" + a);
                        var c = this._getNotificationMessageHandler(a);
                        if (c) {
                            r.debug("_updateNotificationSubscriptions: Message handler function defined, proceeding with subscription creation.");
                            n.subscribeServerEvent({
                                notificationContext: s,
                                notificationConfig: t,
                                msgHandler: c.bind(this._oViewController)
                            })
                        }
                    }
                }.bind(this))
            }
        },
        _updateContextWithTopic: function(t, e) {
            var n = e;
            var o = null;
            if (n.indexOf(i.CUSTOM + ".") === 0) {
                o = n.substring(7);
                n = i.CUSTOM
            }
            t.setTopic(n);
            if (o) {
                t.setCustomEventName(o)
            }
        },
        _getNotificationConfiguration: function() {
            var t = this._getNotificationConfigurationData();
            var i = new e(t);
            if (i.addCustomTopics) {
                var n = this._getCustomNotificationEvents();
                if (n.length > 0) {
                    i.addCustomTopics(n)
                }
            }
            return i
        },
        _getCurrentNotificationContext: function() {
            var t = this._getNotificationConfigurationData();
            var i = this._getNotificationContextData();
            var e = this._getNotifications();
            if (!e) {
                return null
            }
            var n = e.createNotificationContext();
            if (t) {
                if (t.subscribeResource) {
                    n.setResource(i.resource)
                }
                if (t.subscribeWorkCenter) {
                    n.setWorkCenter(i.workCenter)
                }
                if (t.subscribeOperation) {
                    n.setOperation(i.operation)
                }
            }
            n.setPlant(this._getUserPlant());
            return n
        },
        _getNotificationMessageHandler: function(t) {
            return this._oViewController.getNotificationMessageHandler(t)
        },
        _getCustomNotificationEvents: function() {
            var t = this._oViewController.getCustomNotificationEvents();
            return this._getValidCustomEventNames(t)
        },
        _getNotificationContextData: function() {
            return this._oViewController.getNotificationContextData()
        },
        _getNotificationConfigurationData: function() {
            return this._oViewController.getNotificationsConfiguration()
        },
        _getUserPlant: function() {
            return this._oViewController.getPodController().getUserPlant()
        },
        _getNotifications: function() {
            return this._oNotifications
        },
        _createNotificationsObject: function() {
            var t = this;
            sap.ui.require(["sap/dm/dme/serverevent/Notifications"], function(i) {
                t._oNotifications = new i(t._oViewController, t._bGroupSubscriptionSupport)
            }, function(t) {
                throw t
            })
        },
        _getValidCustomEventNames: function(t) {
            var i = [];
            if (t && t.length > 0) {
                for (var e = 0; e < t.length; e++) {
                    if (this._isValidCustomEventName(t[e])) {
                        i[i.length] = t[e]
                    }
                }
            }
            return i
        },
        _isValidCustomEventName: function(t) {
            if (t.length < 4 || t.length > 24) {
                r.error("'" + t + "' contains " + t.length + " characters.  Must be 4 to 24 characters in length.");
                return false
            }
            if (!o.test(t)) {
                r.error("'" + t + "' is not valid. Must start with alphabetic character and contain only alpha-numeric and .-_ special characters.");
                return false
            }
            return true
        }
    })
}, true);
sap.ui.predefine("sap/dm/dme/podfoundation/service/ListMaintenanceService", ["sap/ui/base/Object", "sap/base/security/encodeURL", "sap/dm/dme/logging/Logging", "sap/dm/dme/message/ErrorHandler", "sap/dm/dme/service/ServiceClient", "sap/dm/dme/podfoundation/util/PodUtility", "sap/dm/dme/model/AjaxUtil"], function(t, e, i, n, r, o, a) {
    "use strict";
    var s = i.getLogger("sap.dm.dme.podfoundation.service.ListMaintenanceService");
    var u;
    return t.extend("sap.dm.dme.podfoundation.service.ListMaintenanceService", {
        constructor: function(e, i) {
            t.call(this);
            this._sProductionDatasourceUri = e;
            this._sPlantDatasourceUri = i
        },
        getListNamesByType: function(t) {
            var e = this;
            var i = new Promise(function(i, n) {
                var r = e._sProductionDatasourceUri + "listConfigurations/" + t;
                var o = e._getServiceClient();
                o.get(r).then(function(t) {
                    i(t);
                    return
                }.bind(e)).catch(function(e, i) {
                    var r = e || i;
                    s.error("getListNames: Error retrieving list names for " + t);
                    n(r)
                }.bind(e))
            });
            return i
        },
        getListConfiguration: function(t, e) {
            var i = this;
            var n = new Promise(function(n, r) {
                var o = i._sProductionDatasourceUri + "listConfigurations/" + t + "/" + e;
                var a = i._getServiceClient();
                a.get(o).then(function(t) {
                    this._getModifiedDataTime(t);
                    n(t)
                }.bind(i)).catch(function(i, n) {
                    var o = i || n;
                    s.error("getListConfiguration: Error getting list configuration for " + t + "/" + e);
                    r(o)
                }.bind(i))
            });
            return n
        },
        getCustomColumns: function(t) {
            var e = this;
            var i = new Promise(function(i) {
                if (!t || t.length === 0) {
                    i([]);
                    return
                }
                e.getCustomDataColumns(t).then(function(t) {
                    var e = [];
                    this._addCustomColumns(t, e);
                    i(e)
                }.bind(e)).catch(function(t, e) {
                    s.error("getCustomColumns: Error getting custom data columns");
                    i([])
                }.bind(e))
            });
            return i
        },
        _addCustomColumns: function(t, e) {
            if (!t || !t.value || t.value.length === 0) {
                return e
            }
            for (var i = 0; i < t.value.length; i++) {
                e[e.length] = {
                    columnId: t.value[i].tableName + "." + t.value[i].fieldName,
                    columnLabel: t.value[i].fieldLabel,
                    tableName: t.value[i].tableName
                }
            }
        },
        getCustomDataColumns: function(t) {
            var i = this;
            var n = new Promise(function(n) {
                var r = "";
                for (var o = 0; o < t.length; o++) {
                    if (o > 0) {
                        r = r + " or "
                    }
                    r = r + "tableName eq '" + t[o] + "'"
                }
                var a = i._sPlantDatasourceUri + "CustomFieldDefinitions";
                if (r !== "") {
                    a = a + "?$filter=" + e(r)
                }
                var u = i._getServiceClient();
                u.get(a).then(function(t) {
                    n(t)
                }.bind(i)).catch(function(t, e) {
                    s.error("getCustomDataColumns: Error getting custom data columns");
                    n(null)
                }.bind(i))
            });
            return n
        },
        createNewList: function(t, e) {
            return new Promise(function(t, i) {
                var n = this._sProductionDatasourceUri + "listConfigurations";
                a.post(n, e, t, function(t, e, n) {
                    let r = {
                        oResponse: t,
                        message: e,
                        nHttpStatus: n
                    };
                    i(r)
                })
            }.bind(this))
        },
        updateExistingList: function(t, e) {
            return new Promise(function(t, i) {
                var n = this._sProductionDatasourceUri + "listConfigurations";
                this._appendModifiedDateTime(e);
                a.put(n, e, t, function(t, e, n) {
                    let r = {
                        oResponse: t,
                        message: e,
                        nHttpStatus: n
                    };
                    i(r)
                })
            }.bind(this))
        },
        _getModifiedDataTime: function(t) {
            if (t && t.modifiedDateTime) {
                u = t.modifiedDateTime
            } else {
                u = undefined
            }
        },
        _appendModifiedDateTime: function(t) {
            if (u) {
                t.modifiedDateTime = u
            }
            return t
        },
        _getServiceClient: function() {
            if (!this._oServiceClient) {
                this._oServiceClient = new r
            }
            return this._oServiceClient
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/service/ServiceRegistry", ["sap/ui/base/Object", "sap/base/security/encodeURL", "sap/dm/dme/logging/Logging", "sap/dm/dme/message/ErrorHandler", "sap/dm/dme/service/ServiceClient", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, r, i, n, t, a) {
    "use strict";
    var s = i.getLogger("sap.dm.dme.podfoundation.service.ServiceRegistry");
    return e.extend("sap.dm.dme.podfoundation.service.ServiceRegistry", {
        constructor: function(r) {
            e.call(this);
            this._dataSourceUri = r
        },
        registerExtensionPlugins: function(e, r, i) {
            if (!e) {
                throw error("fnRegisterPromise is a required input")
            }
            var t = this;
            var a = new Promise(function(a) {
                t.getUiExtensionServices().then(function(o) {
                    if (!o || o.length === 0) {
                        a()
                    }
                    var c = 0;
                    for (var d = 0; d < o.length; d++) {
                        var u = {
                            endpoint: o[d].url,
                            pluginsUri: o[d].path,
                            pluginsUrn: o[d].namespace,
                            componentsUri: o[d].path + "/designer/components.json"
                        };
                        e.call(r, u, i).then(function() {
                            if (c === o.length - 1) {
                                a()
                            }
                            c++
                        }.bind(t)).catch(function(e, r) {
                            var i = n.getErrorMessage(e);
                            s.error("registerExtensionPlugins: error occured registering " + u.endpoint, i);
                            if (c === o.length - 1) {
                                a()
                            }
                            c++
                        }.bind(t))
                    }
                }.bind(t)).catch(function(e, r) {
                    var i = n.getErrorMessage(e);
                    s.error("registerExtensionPlugins: cannot find UI Extension services", i);
                    a()
                }.bind(t))
            });
            return a
        },
        getProductionProcesses: function() {
            var e = this;
            var r = new Promise(function(r, i) {
                var n = e._dataSourceUri + "api/svc/productionProcesses";
                var t = e._getServiceClient();
                t.get(n).then(function(e) {
                    r(e);
                    return
                }.bind(e)).catch(function(e, r) {
                    s.error("getProductionProcesses: Error retrieving production processes");
                    i(e, r)
                }.bind(e))
            });
            return r
        },
        getServicesByGroupId: function(e) {
            var r = this;
            var i = new Promise(function(i, n) {
                var t = r._dataSourceUri + "api/svc/groups/" + e;
                var a = r._getServiceClient();
                a.get(t).then(function(e) {
                    i(e);
                    return
                }.bind(r)).catch(function(r, i) {
                    s.error("getServicesByGroup: Groups for '" + e + "' not found");
                    n(r, i)
                }.bind(r))
            });
            return i
        },
        getServiceByServiceId: function(e) {
            var r = this;
            var i = new Promise(function(i, n) {
                var t = r._dataSourceUri + "api/svc/services/" + e;
                var a = r._getServiceClient();
                a.get(t).then(function(e) {
                    i(e);
                    return
                }.bind(r)).catch(function(r, i) {
                    s.error("getServiceByServiceId: Service for '" + e + "' not found");
                    n(r, i)
                }.bind(r))
            });
            return i
        },
        getUiExtensionServices: function() {
            var e = this;
            var r = new Promise(function(r, i) {
                var n = e._dataSourceUri + "api/uiExtensions";
                var t = e._getServiceClient();
                t.get(n).then(function(e) {
                    var n = [];
                    if (e && e.length > 0) {
                        try {
                            n = this._extractServiceMetadata(e)
                        } catch (e) {
                            i(e);
                            return
                        }
                    }
                    r(n)
                }.bind(e)).catch(function(e, r) {
                    s.error("getUiExtensionServices: services not found");
                    i(e, r)
                }.bind(e))
            });
            return r
        },
        _extractServiceMetadata: function(e) {
            var r = [];
            for (var i = 0; i < e.length; i++) {
                if (this._isEnabled(e[i])) {
                    try {
                        this._validateServiceData(e[i], r);
                        r[r.length] = e[i]
                    } catch (e) {
                        var t = n.getErrorMessage(e);
                        s.error("_extractServiceMetadata: JSON data error", t)
                    }
                }
            }
            return r
        },
        _isEnabled: function(e) {
            if (e.url === "url" && e.path === "path" && e.namespace === "namespace") {
                return false
            }
            return e.enabled
        },
        _validateServiceData: function(e, r) {
            if (!e) {
                throw "Service data is not defined"
            }
            if (a.isEmpty(e.url)) {
                throw "Service url is not defined"
            }
            if (a.isEmpty(e.path)) {
                throw "Service path is not defined"
            }
            if (a.isEmpty(e.namespace)) {
                throw "Service namespace is not defined"
            }
            if (e.namespace.indexOf(".") >= 0) {
                var i = e.namespace.split(".").join("/");
                e.namespace = i
            }
            if (e.namespace.indexOf("sap/dm/dme") >= 0) {
                throw "Service is using a reserved namespace (i.e.; 'sap/dm/dme')"
            }
            if (r.length > 0) {
                for (var n = 0; n < r.length; n++) {
                    if (e.namespace === r[n].namespace) {
                        var t = "Namespace '" + e.namespace;
                        t = t + "' assigned to '" + e.url;
                        t = t + "' is already assigned to " + r[n].url;
                        throw t
                    }
                }
            }
        },
        _getServiceClient: function() {
            if (!this._oServiceClient) {
                this._oServiceClient = new t
            }
            return this._oServiceClient
        }
    })
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/ControlConstants", function() {
    "use strict";
    return {
        UI5_HBox: "sap.m.HBox",
        UI5_VBox: "sap.m.VBox",
        UI5_IconTabBar: "sap.m.IconTabBar",
        UI5_IconTabFilter: "sap.m.IconTabFilter",
        UI5_ComponentContainer: "sap.ui.core.ComponentContainer",
        UI5_SplitPane: "sap.ui.layout.SplitPane",
        UI5_PaneContainer: "sap.ui.layout.PaneContainer",
        UI5_ResponsiveSplitter: "sap.ui.layout.ResponsiveSplitter",
        POD_ActionButton: "sap.dm.dme.control.ActionButton",
        POD_GroupButton: "sap.dm.dme.control.GroupButton",
        POD_NavigationButton: "sap.dm.dme.control.NavigationButton",
        EmptyPlugin: "sap.dm.dme.plugins.emptyPlugin",
        Panel: "sap.dm.dme.podbuilder.controls.Panel",
        PodHeader: "sap.dm.dme.podbuilder.controls.PodHeader",
        PageHeader: "sap.dm.dme.podbuilder.controls.PageHeader",
        HBox: "sap.dm.dme.podbuilder.controls.HBox",
        VBox: "sap.dm.dme.podbuilder.controls.VBox",
        Splitter: "sap.dm.dme.podbuilder.controls.Splitter",
        ResponsiveSplitter: "sap.dm.dme.podbuilder.controls.ResponsiveSplitter",
        PaneContainer: "sap.dm.dme.podbuilder.controls.PaneContainer",
        SplitPaneContent: "sap.dm.dme.podbuilder.controls.SplitPaneContent",
        Table: "sap.dm.dme.podbuilder.controls.Table",
        HButtonBar: "sap.dm.dme.podbuilder.controls.HButtonBar",
        VButtonBar: "sap.dm.dme.podbuilder.controls.VButtonBar",
        ActionButton: "sap.dm.dme.podbuilder.controls.ActionButton",
        GroupButton: "sap.dm.dme.podbuilder.controls.GroupButton",
        NavigationButton: "sap.dm.dme.podbuilder.controls.NavigationButton",
        DynamicSideContent: "sap.dm.dme.podbuilder.controls.DynamicSideContent",
        IconTabBar: "sap.dm.dme.podbuilder.controls.IconTabBar",
        IconTabFilter: "sap.dm.dme.podbuilder.controls.IconTabFilter",
        PageContainer: "sap.dm.dme.podbuilder.controls.PageContainer"
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/NamespaceChangeTranslator", ["sap/dm/dme/podfoundation/util/PodUtility"], function(i) {
    return {
        translate: function(n, e, t, a) {
            if (!i.isValidPodData(n, e)) {
                return n
            }
            i.replacePluginNamespaces(n.plugins, a);
            n.version = t;
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslator", ["sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/controller/Constants", "sap/dm/dme/podfoundation/util/PodTranslatorV0", "sap/dm/dme/podfoundation/util/PodTranslatorV1", "sap/dm/dme/podfoundation/util/PodTranslatorV2", "sap/dm/dme/podfoundation/util/PodTranslatorV3", "sap/dm/dme/podfoundation/util/PodTranslatorV4", "sap/dm/dme/podfoundation/util/PodTranslatorV5", "sap/dm/dme/podfoundation/util/PodTranslatorV6", "sap/dm/dme/podfoundation/util/PodTranslatorV7", "sap/dm/dme/podfoundation/util/PodTranslatorV8", "sap/dm/dme/podfoundation/util/PodTranslatorV9", "sap/dm/dme/podfoundation/util/PodTranslatorV10", "sap/dm/dme/podfoundation/util/PodTranslatorV11", "sap/dm/dme/podfoundation/util/PodTranslatorV12", "sap/dm/dme/podfoundation/util/PodTranslatorV13", "sap/dm/dme/podfoundation/util/PodTranslatorV14", "sap/dm/dme/podfoundation/util/PodTranslatorV18"], function(a, t, o, d, n, r, s, l, e, i, u, m, p, f, P, V, T, v) {
    "use strict";
    var c = "19.0";
    return {
        getLatestPodVersion: function() {
            return c
        },
        translate: function(a) {
            o.translate(a);
            var t = d.translate(a);
            var c = n.translate(t);
            var g = r.translate(c);
            var B = s.translate(g);
            var C = l.translate(B);
            var L = e.translate(C);
            var b = i.translate(L);
            var h = u.translate(b);
            var j = m.translate(h);
            var k = p.translate(j);
            var q = f.translate(k);
            var w = P.translate(q);
            var x = V.translate(w);
            var y = T.translate(x);
            return v.translate(y)
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV0", ["sap/dm/dme/podfoundation/util/PodUtility"], function(n) {
    "use strict";
    var i = "sap.ui.mes";
    var t = "sap.dm.dme";
    return {
        translate: function(n) {
            if (!n || jQuery.isEmptyObject(n)) {
                return n
            }
            if (!n.podConfig) {
                return n
            }
            var i, t;
            if (n.podConfig && n.podConfig.control) {
                t = n.podConfig.control;
                n.podConfig.control = this.updateControlName(t)
            }
            if (n.layout && n.layout.length > 0) {
                for (i = 0; i < n.layout.length; i++) {
                    if (!n.layout[i].control || n.layout[i].control === "") {
                        continue
                    }
                    t = n.layout[i].control;
                    n.layout[i].control = this.updateControlName(t)
                }
            }
            if (n.plugins && n.plugins.length > 0) {
                for (i = 0; i < n.plugins.length; i++) {
                    if (!n.plugins[i].name || n.plugins[i].name === "") {
                        continue
                    }
                    t = n.plugins[i].name;
                    n.plugins[i].name = this.updateControlName(t);
                    t = n.plugins[i].name;
                    n.plugins[i].name = this.updateExecutionPluginName(t)
                }
            }
        },
        updateControlName: function(n) {
            if (!n) {
                return n
            }
            if (n.indexOf(i + ".controls") === 0) {
                return t + ".control" + n.substring(19)
            }
            if (n.indexOf(i) === 0) {
                return t + n.substring(10)
            }
            return n
        },
        updateExecutionPluginName: function(n) {
            if (!n) {
                return n
            }
            if (n.indexOf("sap.dm.dme.plugins.execution.CompletePlugin") === 0) {
                return "sap.dm.dme.plugins.execution.completePlugin"
            }
            if (n.indexOf("sap.dm.dme.plugins.execution.StartPlugin") === 0) {
                return "sap.dm.dme.plugins.execution.startPlugin"
            }
            if (n.indexOf("sap.dm.dme.plugins.execution.SignoffPlugin") === 0) {
                return "sap.dm.dme.plugins.execution.signoffPlugin"
            }
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV1", ["sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/controller/Constants", "sap/dm/dme/podfoundation/util/PodUtility"], function(n, i, t) {
    "use strict";
    return {
        translate: function(o) {
            if (!o || t.isEmpty(o)) {
                return o
            }
            var e = t.trim(o.version);
            if (e === "2.0") {
                return o
            }
            if (!o.podConfig) {
                return o
            }
            var r = {
                page: i.POD_MAIN_PAGE,
                description: n.getGlobalText("mainPageDescription"),
                podConfig: o.podConfig,
                layout: o.layout,
                layoutConfig: o.layoutConfig
            };
            var a = [r];
            return {
                version: "2.0",
                pages: a,
                plugins: o.plugins
            }
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV10", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(e) {
    return {
        translate: function(a) {
            return e.translate(a, "10.0", "11.0", this.getNamespaces())
        },
        getNamespaces: function() {
            var e = [];
            e[e.length] = {
                from: "sap.dm.dme.plugins.oeePod",
                to: "sap.dm.dme.oeeplugins.oeePod"
            };
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV11", ["sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/util/PodUtility"], function(t, n) {
    "use strict";
    var e = "sap.ui.layout.Splitter";
    var i = "sap.ui.core.ComponentContainer";
    var r = "sap.m.IconTabBar";
    return {
        translate: function(t) {
            if (!n.isValidPodData(t, "11.0")) {
                return t
            }
            t.version = "12.0";
            if (!t.pages || t.pages.length === 0) {
                return t
            }
            var e;
            for (var i = 0; i < t.pages.length; i++) {
                e = this.convertSplitters(t.pages[i].layout);
                t.pages[i].layout = e
            }
            return t
        },
        convertSplitters: function(i) {
            var r, a, o;
            var l, d, u, s;
            var c = [];
            var p = [];
            for (var h = 0; h < i.length; h++) {
                if (n.isNotEmpty(i[h].translated)) {
                    continue
                }
                if (i[h].control !== e) {
                    p[p.length] = t.cloneObject(i[h]);
                    i[h].translated = i[h].id;
                    continue
                }
                r = i[h].orientation;
                a = i[h].id;
                s = this.findSplitterChildren(a, i);
                d = this.findParent(i[h].parentId, i);
                if (d.control !== e) {
                    l = t.cloneObject(i[h]);
                    l.control = "sap.ui.layout.ResponsiveSplitter";
                    o = this.getLayoutCount("rsplitter", c);
                    l.id = "rsplitter" + o;
                    delete l.orientation;
                    p[p.length] = l;
                    i[h].translated = l.id;
                    u = this.createPaneContainer(l.id, r, c);
                    p[p.length] = u
                }
                this.convertSplitterChildren(s, i, p, c)
            }
            return p
        },
        convertSplitterChildren: function(i, r, a, o) {
            var l = a.length - 1;
            var d = a[l].id;
            var u, s, c, p, h, f, g, v;
            p = 0;
            if (i && i.length > 0) {
                p = i.length;
                for (u = 0; u < i.length; u++) {
                    c = this.findLayoutIndex(i[u].id, r);
                    if (i[u].control === e) {
                        f = this.findSplitterChildren(i[u].id, r);
                        h = t.cloneObject(r[c]);
                        h.control = "sap.ui.layout.PaneContainer";
                        s = this.getLayoutCount("pcontainer", o);
                        h.id = "pcontainer" + s;
                        h.parentId = d;
                        delete h.width;
                        delete h.height;
                        a[a.length] = h;
                        r[c].translated = h.id;
                        this.convertSplitterChildren(f, r, a, o);
                        continue
                    }
                    c = this.findLayoutIndex(i[u].id, r);
                    var y = null;
                    if (n.isNotEmpty(i[u].layoutDataSize)) {
                        y = i[u].layoutDataSize
                    }
                    g = this.createSplitPaneContent(d, o, y);
                    a[a.length] = g;
                    h = t.cloneObject(r[c]);
                    h.parentId = g.id;
                    a[a.length] = h;
                    r[c].translated = h.id
                }
            }
            if (p < 2) {
                for (u = 0; u < 2 - p; u++) {
                    g = this.createSplitPaneContent(d, o);
                    a[a.length] = g;
                    v = this.createEmptyContent(g.id, o);
                    a[a.length] = v
                }
            }
        },
        createPaneContainer: function(t, n, e) {
            var i = this.getLayoutCount("pcontainer", e);
            var r = {
                id: "pcontainer" + i,
                orientation: n,
                control: "sap.ui.layout.PaneContainer",
                parentId: t
            };
            return r
        },
        createSplitPaneContent: function(t, e, i) {
            var r = 50;
            if (n.isNotEmpty(i) && i.indexOf("%") >= 0) {
                r = parseInt(i)
            }
            var a = this.getLayoutCount("splitpanecontent", e);
            var o = {
                id: "splitpanecontent" + a,
                requiredParentWidth: 800,
                size: r,
                control: "sap.ui.layout.SplitPane",
                parentId: t
            };
            return o
        },
        createEmptyContent: function(t, n) {
            var e = this.getLayoutCount("emptyplugincontainer", n);
            var r = {
                id: "emptyplugincontainer" + e,
                width: "100%",
                height: "100%",
                control: i,
                layoutDataSize: "auto",
                parentId: t
            };
            return r
        },
        findLayoutIndex: function(t, n) {
            for (var e = 0; e < n.length; e++) {
                if (n[e].id === t) {
                    return e
                }
            }
            return -1
        },
        findParent: function(t, n) {
            for (var e = 0; e < n.length; e++) {
                if (n[e].id === t) {
                    return n[e]
                }
            }
            return null
        },
        findSplitterChildren: function(t, n) {
            var a = [];
            for (var o = 0; o < n.length; o++) {
                if (n[o].parentId === t) {
                    if (n[o].control === e || n[o].control === i || n[o].control === r || n[o].control === "sap.m.IconTabFilter") {
                        a[a.length] = n[o]
                    } else {
                        var l = [];
                        this.loadValidNestedChildren(n[o], n, l);
                        if (l.length > 0) {
                            for (var d = 0; d < l.length; d++) {
                                if (l[d]) {
                                    l[d].parentId = t;
                                    a[a.length] = l[d];
                                    n[o].translated = n[o].id
                                }
                            }
                        }
                    }
                }
            }
            return a
        },
        loadValidNestedChildren: function(n, a, o) {
            for (var l = 0; l < a.length; l++) {
                if (a[l].parentId === n.id) {
                    if (a[l].control === e || a[l].control === i || a[l].control === r) {
                        o[o.length] = t.cloneObject(a[l])
                    } else {
                        this.loadValidNestedChildren(a[l], a, o);
                        a[l].translated = a[l].id
                    }
                }
            }
        },
        updateParentIds: function(t, n, e) {
            for (var i = 0; i < e.length; i++) {
                if (e[i].parentId === n) {
                    e[i].parentId = t
                }
            }
        },
        getLayoutCount: function(t, n) {
            var e = 0;
            if (n[t] && n[t].count > 0) {
                e = n[t].count
            } else {
                n[t] = {}
            }
            e++;
            n[t].count = e;
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV12", ["sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, o, i) {
    "use strict";
    return {
        translate: function(e) {
            if (!i.isValidPodData(e, "12.0")) {
                return e
            }
            e.version = "13.0";
            if (!e.pages || e.pages.length === 0) {
                return e
            }
            var a = o.Custom;
            switch (e.pages[0].podConfig.headerPluginId) {
                case "operationPodSelectionPlugin":
                    a = o.Operation;
                    break;
                case "wcPodSelectionPlugin":
                    a = o.WorkCenter;
                    break;
                case "orderPodSelectionPlugin":
                    a = o.Order;
                    break;
                case "oeePod":
                    a = "OEE";
                    break
            }
            e.pages[0].podConfig.podType = a;
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV13", ["sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/podfoundation/util/PodUtility"], function(e, o, i) {
    "use strict";
    return {
        translate: function(e) {
            if (!i.isValidPodData(e, "13.0")) {
                return e
            }
            e.version = "14.0";
            if (!e.pages || e.pages.length === 0) {
                return e
            }
            if (e.pages[0].podConfig && i.isNotEmpty(e.pages[0].podConfig.podType)) {
                return e
            }
            var n = e.pages[0].podConfig.headerPluginId;
            if (n.indexOf(".") > 0) {
                n = n.substring(0, n.indexOf("."))
            }
            var t = o.Custom;
            switch (n) {
                case "operationPodSelectionPlugin":
                    t = o.Operation;
                    break;
                case "wcPodSelectionPlugin":
                    t = o.WorkCenter;
                    break;
                case "orderPodSelectionPlugin":
                    t = o.Order;
                    break;
                case "oeePod":
                    t = "OEE";
                    break;
                case "defaultMonitorPodSelectionPlugin":
                case "lineMonitorSelectionPlugin":
                    t = o.Monitor;
                    break
            }
            e.pages[0].podConfig.podType = t;
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV14", ["sap/dm/dme/device/CrossPlatformUtilities", "sap/dm/dme/podfoundation/model/PodType", "sap/dm/dme/podfoundation/util/PodUtility"], function(i, e, o) {
    "use strict";
    return {
        translate: function(i) {
            if (!o.isValidPodData(i, "14.0")) {
                return i
            }
            i.version = "15.0";
            if (!i.pages || i.pages.length === 0) {
                return i
            }
            if (i.pages[0].podConfig.podType !== e.Custom) {
                return i
            }
            var n = i.pages[0].podConfig.headerPluginId;
            if (n.indexOf(".") > 0) {
                n = n.substring(0, n.indexOf("."))
            }
            if (n === "defaultMonitorPodSelectionPlugin" || n === "lineMonitorSelectionPlugin") {
                i.pages[0].podConfig.podType = e.Monitor
            }
            return i
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV18", ["sap/dm/dme/podfoundation/util/PodUtility"], function(i) {
    "use strict";
    return {
        translate: function(n) {
            if (!i.isValidPodData(n, "15.0")) {
                if (!i.isValidPodData(n, "16.0")) {
                    if (!i.isValidPodData(n, "17.0")) {
                        if (!i.isValidPodData(n, "18.0")) {
                            return n
                        }
                    }
                }
            }
            if (n.pages && n.pages.length > 0) {
                for (const i of n.pages) {
                    let n = i.layoutConfig;
                    if (n) this.checkPageConfig(n)
                }
            }
            n.version = "19.0";
            return n
        },
        checkPageConfig: function(i) {
            if (i.length > 0 && i[0].components) {
                for (const n of i) {
                    if (n.components && n.components.length > 0) {
                        for (let i = n.components.length - 1; i >= 0; i--) {
                            if (n.components[i].pluginId.includes("lineAndResourceAvailabilityStrip") || n.components[i].pluginId.includes("indicatorChartCardPlugin")) {
                                n.components.splice(i, 1)
                            }
                        }
                    }
                }
            }
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV2", ["sap/dm/dme/controller/Constants", "sap/dm/dme/podfoundation/util/PodUtility"], function(n, i) {
    "use strict";
    return {
        translate: function(e) {
            if (!i.isValidPodData(e, "2.0")) {
                return e
            }
            if (!e.pages || e.pages.length === 0) {
                return e
            }
            for (var t = 0; t < e.pages.length; t++) {
                if (e.pages[t].page === n.POD_MAIN_PAGE) {
                    var a = e.pages[t].podConfig;
                    e.pages[t].podConfig = {
                        id: a.id,
                        headerPluginId: a.headerPluginId,
                        control: a.control,
                        notifications: a.notifications
                    };
                    break
                }
            }
            e.version = "3.0";
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV3", ["sap/dm/dme/i18n/i18nBundles", "sap/dm/dme/podfoundation/util/PodUtility"], function(i, n) {
    "use strict";
    var e = "wcPodSelectionPlugin";
    var o = "sap.dm.dme.plugins.";
    return {
        translate: function(t) {
            if (!n.isValidPodData(t, "3.0")) {
                return t
            }
            if (!t.pages || t.pages.length === 0) {
                return t
            }
            for (var g = 0; g < t.pages.length; g++) {
                if (t.pages[g].podConfig && t.pages[g].podConfig.headerPluginId === "podSelectionPlugin") {
                    var l = t.pages[g].podConfig;
                    t.pages[g].podConfig = {
                        id: l.id,
                        headerPluginId: e,
                        control: l.control,
                        notifications: t.pages[g].podConfig.notifications
                    };
                    break
                }
            }
            if (t.plugins && t.plugins.length > 0) {
                for (g = 0; g < t.plugins.length; g++) {
                    if (!t.plugins[g].name || t.plugins[g].name === "") {
                        continue
                    }
                    if (t.plugins[g].id === "podSelectionPlugin") {
                        t.plugins[g].id = e;
                        t.plugins[g].name = o + e;
                        t.plugins[g].title = i.getPluginPropertiesText(e, "title")
                    }
                }
            }
            t.version = "4.0";
            return t
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV4", ["sap/dm/dme/podfoundation/util/PodUtility"], function(n) {
    "use strict";
    return {
        translate: function(i) {
            if (!n.isValidPodData(i, "4.0")) {
                return i
            }
            if (i.plugins && i.plugins.length > 0) {
                for (var u = 0; u < i.plugins.length; u++) {
                    if (i.plugins[u].id === "dataCollectionListPlugin") {
                        var l = i.plugins[u].configuration.columnConfiguration;
                        if (l) {
                            var o = l.length;
                            for (var t = o - 1; t >= 0; t--) {
                                if (l[t].columnId === "PARAMETER" || l[t].columnId === "DESCRIPTION" || l[t].columnId === "DATE_TIME" || l[t].columnId === "QTY_REQUIRED" || l[t].columnId === "QTY_OPTIONAL") {
                                    l.splice(t, 1)
                                }
                            }
                        }
                    }
                }
            }
            i.version = "5.0";
            return i
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV5", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(n) {
    return {
        translate: function(t) {
            return n.translate(t, "5.0", "6.0", this.getV6Namespaces())
        },
        getV6Namespaces: function() {
            var n = [];
            n[n.length] = {
                from: "sap.dm.dme.plugins.dataCollectionListPlugin",
                to: "sap.dm.dme.dcplugins.dataCollectionListPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.dataCollectionEntryPlugin",
                to: "sap.dm.dme.dcplugins.dataCollectionEntryPlugin"
            };
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV6", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(n) {
    return {
        translate: function(e) {
            return n.translate(e, "6.0", "7.0", this.getV7Namespaces())
        },
        getV7Namespaces: function() {
            var n = [];
            n[n.length] = {
                from: "sap.dm.dme.plugins.logNcPlugin",
                to: "sap.dm.dme.ncplugins.logNcPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.ncSelectionPlugin",
                to: "sap.dm.dme.ncplugins.ncSelectionPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.ncTreePlugin",
                to: "sap.dm.dme.ncplugins.ncTreePlugin"
            };
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV7", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(n) {
    return {
        translate: function(s) {
            return n.translate(s, "7.0", "8.0", this.getV8Namespaces())
        },
        getV8Namespaces: function() {
            var n = [];
            n[n.length] = {
                from: "sap.dm.dme.plugins.assemblyPointPlugin",
                to: "sap.dm.dme.assyplugins.assemblyPointPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.componentListPlugin",
                to: "sap.dm.dme.assyplugins.componentListPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.materialConsumptionPlugin",
                to: "sap.dm.dme.assyplugins.materialConsumptionPlugin"
            };
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV8", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(n) {
    return {
        translate: function(t) {
            return n.translate(t, "8.0", "9.0", this.getV9Namespaces())
        },
        getV9Namespaces: function() {
            var n = [];
            n[n.length] = {
                from: "sap.dm.dme.plugins.workInstructionListPlugin",
                to: "sap.dm.dme.wiplugins.workInstructionListPlugin"
            };
            n[n.length] = {
                from: "sap.dm.dme.plugins.workInstructionViewPlugin",
                to: "sap.dm.dme.wiplugins.workInstructionViewPlugin"
            };
            return n
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodTranslatorV9", ["sap/dm/dme/podfoundation/util/NamespaceChangeTranslator"], function(e) {
    return {
        translate: function(i) {
            return e.translate(i, "9.0", "10.0", this.getV10Namespaces())
        },
        getV10Namespaces: function() {
            var e = [];
            e[e.length] = {
                from: "sap.dm.dme.plugins.goodsReceiptPlugin",
                to: "sap.dm.dme.inventoryplugins.goodsReceiptPlugin"
            };
            e[e.length] = {
                from: "sap.dm.dme.plugins.kpiPlugin",
                to: "sap.dm.dme.oeeplugins.kpiPlugin"
            };
            e[e.length] = {
                from: "sap.dm.dme.plugins.availabilityStrip",
                to: "sap.dm.dme.oeeplugins.availabilityStrip"
            };
            return e
        }
    }
});
sap.ui.predefine("sap/dm/dme/podfoundation/util/PodUtility", ["sap/base/util/UriParameters", "sap/base/util/isEmptyObject", "sap/ui/core/Locale", "sap/ui/core/ValueState", "sap/ui/core/format/NumberFormat", "sap/dm/dme/formatter/NumberFormatter", "sap/dm/dme/constants/DMCConstants"], function(t, e, i, n, r, o, a) {
    "use strict";
    return {
        isTestMode: function(t) {
            let e = null;
            if (t && t.getOwnerComponent() && t.getOwnerComponent().getComponentData()) {
                let i = t.getOwnerComponent().getComponentData().startupParameters;
                if (i.TEST_MODE) {
                    e = i.TEST_MODE[0]
                }
            } else if (this.isRunningTests()) {
                e = "true"
            } else {
                let t = this.getUriParameters();
                e = t.get("TEST_MODE")
            }
            if (!e) {
                return false
            }
            return e.toLowerCase() === "true"
        },
        isRunningTests: function() {
            let t = this.getWindowLocation();
            console.debug("PodUtility.isRunningTests: sUrl = " + t);
            return !!(this.isNotEmpty(t) && (t.indexOf("test/integration") > 0 || t.indexOf("test/unit") > 0))
        },
        getWindowLocation: function() {
            return window.location.href
        },
        getUriParameters: function() {
            return new t(window.location.href)
        },
        isEmpty: function(t) {
            if (t == null || t === "") {
                return true
            }
            if (typeof t === "boolean" || typeof t === "number") {
                return false
            }
            if (Array.isArray(t) && t.length === 0) {
                return true
            }
            if (typeof t === "string") {
                let e = t.trim();
                return e.length === 0
            }
            return e(t)
        },
        isNotEmpty: function(t) {
            return !this.isEmpty(t)
        },
        endsWith: function(t, e, i) {
            if (!t || !e) {
                return false
            }
            if (typeof i === "undefined" || i > t.length) {
                i = t.length
            }
            return t.substring(i - e.length, i) === e
        },
        trim: function(t) {
            if (!t) {
                return t
            }
            if (typeof t !== "string" && !(t instanceof String)) {
                return t
            }
            return t.trim()
        },
        isValidPodData: function(t, e) {
            if (!t || this.isEmpty(t)) {
                return false
            }
            if (typeof e !== "undefined") {
                if (!t.version || this.trim(t.version) !== e) {
                    return false
                }
            }
            return true
        },
        validateQuantityField: function(t, e, i, r, o, a) {
            let s;
            let l = false;
            if (!r) {
                i.setValue(undefined);
                e.setQuantity(undefined);
                i.setValueState(n.None);
                l = true
            }
            if (this.isNumeric(r)) {
                s = this.stringToFloat(r.toString())
            }
            if (s > -1) {
                e.setQuantity(s);
                i.setValue(r)
            } else {
                e.setQuantity(undefined);
                i.setValue(r)
            }
            if (s > 0) {
                i.setValueState(n.None);
                t.clearMessages()
            } else if (!l) {
                i.setValueStateText(t.getI18nText("invalidQuantityValue"));
                i.setValueState(n.Error)
            }
            if (a) {
                t.publish("QuantityChangeEvent", {
                    source: this,
                    newValue: r,
                    oldValue: o
                })
            }
        },
        getFormatSettings: function(t) {
            const e = sap.ui.getCore().getConfiguration();
            let i = e.getFormatSettings().getFormatLocale();
            let n = i.toString();
            let r = n;
            if (t) {
                if (this.isNotEmpty(t.fromFormatLocale)) {
                    n = t.fromFormatLocale
                }
                if (this.isNotEmpty(t.toFormatLocale)) {
                    r = t.toFormatLocale
                }
            }
            return {
                fromLocale: n,
                toLocale: r
            }
        },
        isNumeric: function(t, e) {
            if (this.isEmpty(t)) {
                return false
            }
            if (typeof t !== "string" && typeof t !== "number") {
                return false
            }
            let i = t;
            if (typeof t === "string") {
                let n = {
                    fromFormatLocale: null,
                    toFormatLocale: "en"
                };
                if (e) {
                    const t = this.getFormatSettings(e);
                    n.fromFormatLocale = t.fromLocale;
                    n.toFormatLocale = t.toLocale
                }
                i = this.stringToFloat(t, n)
            }
            return i.toString() !== "NaN"
        },
        countDecimals: function(t) {
            let e = this.floatToString(t, {
                formatLocale: "en"
            });
            if (this.isEmpty(e) || !this.isNumeric(e)) {
                return 0
            }
            let i = this.stringToFloat(e, {
                toFormatLocale: "en"
            });
            if (Math.floor(i) === i) {
                return 0
            }
            let n = i.toString().split(".");
            if (!n || n.length === 1) {
                return 0
            }
            return n[1].length || 0
        },
        stringToFloat: function(t, e) {
            if (this.isEmpty(t)) {
                return null
            }
            const n = this.getFormatSettings(e);
            let a = n.fromLocale;
            let s = n.toLocale;
            if (a === s) {
                let e = o.dmcLocaleNumberParser(t);
                if (e === "") {
                    return "NaN"
                }
                return e
            }
            let l = new i(a);
            let u = r.getFloatInstance({
                strictGroupingValidation: true
            }, l);
            const f = u.oFormatOptions.groupingSeparator;
            const m = u.oFormatOptions.decimalSeparator;
            l = new i(s);
            u = r.getFloatInstance({
                strictGroupingValidation: true
            }, l);
            const c = u.oFormatOptions.groupingSeparator;
            const g = u.oFormatOptions.decimalSeparator;
            let p = t;
            if (f !== c) {
                let e = [];
                let i = t.split("");
                for (let t = 0; t < i.length; t++) {
                    if (i[t] === m) {
                        e[e.length] = g
                    } else if (i[t] !== f) {
                        e[e.length] = i[t]
                    }
                }
                p = e.join("")
            }
            let d = r.getFloatInstance({
                strictGroupingValidation: true,
                parseAsString: false
            }, l);
            return d.parse(p.toString())
        },
        floatToString: function(t, e) {
            if (!t && t !== 0) {
                return null
            }
            let n = null;
            let s = 0;
            let l = 6;
            if (e) {
                if (this.isNotEmpty(e.formatLocale)) {
                    n = e.formatLocale
                }
                if (typeof e.minimumFractionDigits !== "undefined") {
                    s = e.minimumFractionDigits
                }
                if (typeof e.maximumFractionDigits !== "undefined") {
                    l = e.maximumFractionDigits
                }
            }
            if (!n) {
                return o.dmcLocaleFloatNumberFormatter(t, {
                    minFractionDigits: s,
                    maxFractionDigits: l
                })
            }
            let u = new i(n);
            let f = r.getFloatInstance({
                maxFractionDigits: l,
                minFractionDigits: s,
                roundingMode: a.roundingMode,
                style: a.style,
                parseAsString: true
            }, u);
            return f.format(t.toString())
        },
        replacePluginNamespaces: function(t, e) {
            if (t && t.length > 0 && e && e.length > 0) {
                for (const i of t) {
                    for (const t of e) {
                        if (i.name === t.from) {
                            i.name = t.to
                        }
                    }
                }
            }
        },
        hasClass: function(t, e) {
            return jQuery(t).hasClass(e)
        },
        getPluginsFromButtons: function(t) {
            if (!t || t.length === 0) {
                return null
            }
            let e, i = [];
            for (let n of t) {
                if (n.actions && n.actions.length > 0) {
                    for (let t of n.actions) {
                        e = true;
                        if (i.length > 0) {
                            for (let n of i) {
                                if (n === t.pluginId) {
                                    e = false;
                                    break
                                }
                            }
                        }
                        if (e) {
                            i[i.length] = t.pluginId
                        }
                    }
                }
            }
            return i
        },
        getStringsToRemove: function(t, e) {
            if (!e || e.length === 0) {
                return null
            }
            let i, n = [];
            for (let r of e) {
                i = true;
                if (t && t.length > 0) {
                    for (let e of t) {
                        if (r === e) {
                            i = false;
                            break
                        }
                    }
                }
                if (i) {
                    n[n.length] = r
                }
            }
            return n
        },
        copyToClipboard: function(t) {
            if (!document.queryCommandSupported || !document.queryCommandSupported("copy")) {
                return false
            }
            let e = document.createElement("textarea");
            e.textContent = t;
            e.style.position = "fixed";
            document.body.appendChild(e);
            e.select();
            try {
                return document.execCommand("copy")
            } catch (t) {
                return false
            } finally {
                document.body.removeChild(e)
            }
        },
        addMomentLibraries: function() {
            sap.ui.loader.config({
                shim: {
                    "sap/dm/dme/thirdparty/moment-min": {
                        amd: true,
                        exports: "moment"
                    },
                    "sap/dm/dme/thirdparty/moment-with-locales-min": {
                        amd: true,
                        exports: "moment-with-locales"
                    },
                    "sap/dm/dme/thirdparty/moment-timezone-with-data-min": {
                        amd: true,
                        exports: "moment-timezone-with-data"
                    }
                }
            })
        },
        isMatching: function(t, e) {
            if (this.isEmpty(t) && this.isEmpty(e)) {
                return true
            }
            if (t.length > 1 && t[0] === "*" && this.isEmpty(e)) {
                return false
            }
            if (t.length > 1 && t[0] === "?" || this.isNotEmpty(t) && this.isNotEmpty(e) && t[0] === e[0]) {
                return this.isMatching(t.substring(1), e.substring(1))
            }
            if (this.isNotEmpty(t) && t[0] === "*") {
                return this.isMatching(t.substring(1), e) || this.isMatching(t, e.substring(1))
            }
            return false
        }
    }
});
sap.ui.require.preload({
    "sap/dm/dme/podfoundation/browse/view/OperationActivityBrowse.fragment.xml": '<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"\n        xmlns:fb="sap.ui.comp.filterbar"\n        xmlns:l="sap.ui.layout"><Dialog\n        id="dialog"\n        title="{i18n-operation>browseDialog.operation.title}"\n        afterClose="onClose"\n        contentHeight="2000px"><content><fb:FilterBar\n                id="filterBar"\n                showGoOnFB="false"\n                showClearOnFB="true"\n                showFilterConfiguration="false"\n                filterBarExpanded="false"\n                filterContainerWidth="225px"\n                clear="onFilterBarClear"\n                basicSearch="searchField"><fb:content><SearchField\n                       id="searchField"\n                       showSearchButton="false"\n                       liveChange="onSearchLiveChange"\n                       maxLength="200"/></fb:content><fb:filterGroupItems><fb:FilterGroupItem\n                        groupName="basic"\n                        name="operation"\n                        label="{i18n-operation>common.operation.lbl}"\n                        visibleInFilterBar="true"><fb:control><Input\n                                id="operationFilter"\n                                change="onFilterBarChange"\n                                class="mesUpperCaseTransform"\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="description"\n                        label="{i18n-global>common.description.lbl}"\n                        visibleInFilterBar="true"><fb:control><Input\n                                id="descriptionFilter"\n                                change="onFilterBarChange"\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="status"\n                        label="{i18n-status>common.status.lbl}"\n                        visibleInFilterBar="true"><fb:control><Select\n                                id="statusFilter"\n                                selectedKey="ALL"\n                                items="{productStatusItems>/}"\n                                change="onFilterBarChange"><items><core:Item key="{productStatusItems>key}" text="{productStatusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="creationTimeRange"\n                        label="{i18n-global>common.creationTimeRange.lbl}"\n                        visibleInFilterBar="true"><fb:control><DateRangeSelection\n                                id="creationTimeRangeFilter"\n                                displayFormat="yyyy/MM/dd"\n                                change="onFilterBarChange"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        id="resourceType"\n                        groupName="basic"\n                        name="resourceType"\n                        label="{i18n-objectType>common.resourceType.lbl}"\n                        visibleInFilterBar="true"><fb:control><ComboBox\n                                id="resourceTypeFilter"\n                                showSecondaryValues="true"\n                                change="onFilterBarChange"\n                                items="{\n                                    path: \'plant>/ResourceTypes\',\n                                    parameters: { $select: \'ref,resourceType\' }\n                                }"><core:ListItem key="{plant>ref}" text="{plant>resourceType}"/></ComboBox></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\n                id="resultTable"\n                items="{\n                    path: \'/Operations\',\n                    parameters: {\n                        $select: [\'ref\',\'operation\',\'description\',\'status\']\n                    }\n                }"\n                mode="SingleSelectMaster"\n                selectionChange="onSelect"\n                growing="true"\n                growingThreshold="20"\n                growingScrollToLoad="true"><columns><Column minScreenWidth="Desktop"><Text text="{i18n-operation>common.operation.lbl}"/></Column><Column minScreenWidth="Desktop"><Text text="{i18n-global>common.description.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-status>common.status.lbl}"/></Column></columns><items><ColumnListItem><cells><Text text="{operation}" /><Text text="{description}" /><Text text="{\n                                path: \'status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.statusFormatter.getStatusText\'\n                            }" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n-global>common.cancel.btn}"\n                tooltip="{i18n-global>common.cancel.btn}"\n                press="onCancel"/></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/browse/view/ResourceBrowse.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:fb="sap.ui.comp.filterbar"\n    xmlns:l="sap.ui.layout"\n><Dialog\n        id="dialog"\n        title="{i18n>browseDialog.resource.title}"\n        afterClose="onClose"\n        contentHeight="2000px"\n    ><content><fb:FilterBar\n                id="filterBar"\n                showGoOnFB="false"\n                showClearOnFB="true"\n                showFilterConfiguration="false"\n                filterBarExpanded="false"\n                filterContainerWidth="225px"\n                clear="onFilterBarClear"\n                basicSearch="searchField"\n            ><fb:content><SearchField\n                        id="searchField"\n                        showSearchButton="false"\n                        liveChange="onSearchLiveChange"\n                        maxLength="200"\n                    /></fb:content><fb:filterGroupItems><fb:FilterGroupItem\n                        groupName="basic"\n                        name="resource"\n                        label="{i18n>resource}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="resourceFilter"\n                                change="onFilterBarChange"\n                                class="mesUpperCaseTransform"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="description"\n                        label="{i18n>description}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="descriptionFilter"\n                                change="onFilterBarChange"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="status"\n                        label="{i18n>status}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Select\n                                id="statusFilter"\n                                selectedKey="ALL"\n                                items="{statusItems>/}"\n                                change="onFilterBarChange"\n                            ><items><core:Item key="{statusItems>key}" text="{statusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="resourceType"\n                        label="{i18n>resourceType}"\n                        visibleInFilterBar="true"\n                    ><fb:control><ComboBox\n                                id="resourceTypeFilter"\n                                showSecondaryValues="true"\n                                change="onFilterBarChange"\n                                items="{\n                                    path: \'plant>/ResourceTypes\',\n                                    parameters: { $select: \'ref,resourceType,description\' }\n                                }"\n                            ><core:ListItem\n                                    key="{plant>ref}"\n                                    text="{plant>resourceType}"\n                                    additionalText="{=(${plant>description}===${plant>resourceType})?null:${plant>description}}"\n                                /></ComboBox></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="creationTimeRange"\n                        label="{i18n>creationTimeRange}"\n                        visibleInFilterBar="true"\n                    ><fb:control><DateRangeSelection\n                                id="creationTimeRangeFilter"\n                                displayFormat="yyyy/MM/dd"\n                                change="onFilterBarChange"\n                            /></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\n                id="resultTable"\n                items="{\n                    path: \'plant>/Resources\',\n                    parameters: {\n                        $select: [\'ref\',\'resource\',\'description\',\'status\',\'resourceTypeResources\'],\n                        $expand: \'resourceTypeResources($expand=resourceType($select=ref,resourceType))\'\n                    }\n                }"\n                mode="SingleSelectMaster"\n                selectionChange="onSelect"\n                growing="true"\n                growingThreshold="20"\n                growingScrollToLoad="true"\n            ><columns><Column width="15em"><Text text="{i18n>resource}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>description}"/></Column><Column width="10em" minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>status}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>resourceType}"/></Column></columns><items><ColumnListItem><cells><Text text="{plant>resource}" /><Text text="{plant>description}" /><Text text="{\n                                path: \'plant>status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.formatter.getResourceStatusText\'\n                            }" /><Text text="{\n                                path: \'plant>ref\',\n                                formatter: \'.getResourceTypesAsText\'\n                            }" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n>common.cancel}"\n                tooltip="{i18n>common.cancel}"\n                press="onCancel"\n            /></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/browse/view/SfcBrowse.fragment.xml": '<core:FragmentDefinition\r\n        xmlns="sap.m"\r\n        xmlns:core="sap.ui.core"\r\n        xmlns:fb="sap.ui.comp.filterbar"\r\n        xmlns:l="sap.ui.layout"><Dialog\r\n            id="dialog"\r\n            title="{i18n-sfc>browseDialog.sfc.title}"\r\n            afterClose="onClose"\r\n            contentHeight="2000px"><content><fb:FilterBar\r\n                id="filterBar"\r\n                showGoOnFB="false"\r\n                showClearOnFB="true"\r\n                showFilterConfiguration="false"\r\n                filterBarExpanded="false"\r\n                filterContainerWidth="225px"\r\n                clear="onFilterBarClear"\r\n                basicSearch="searchField"><fb:content><SearchField\r\n                        id="searchField"\r\n                        showSearchButton="false"\r\n                        liveChange="onSearchLiveChange"\r\n                        maxLength="200"/></fb:content><fb:filterGroupItems><fb:FilterGroupItem\r\n                        groupName="basic"\r\n                        name="status"\r\n                        label="{i18n-status>common.status.lbl}"\r\n                        visibleInFilterBar="true"><fb:control><Select\r\n                                id="statusFilter"\r\n                                selectedKey="ALL"\r\n                                items="{sfcStatusItems>/}"\r\n                                change="onFilterBarChange"><items><core:Item key="{sfcStatusItems>key}" text="{sfcStatusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\r\n                        groupName="basic"\r\n                        name="order"\r\n                        label="{i18n-shopOrder>common.shopOrder.lbl}"\r\n                        visibleInFilterBar="true"><fb:control><Input\r\n                                id="shopOrderFilter"\r\n                                class="mesUpperCaseTransform"\r\n                                showValueHelp="true"\r\n                                valueHelpRequest="onShopOrderBrowse"\r\n                                valueHelpOnly="true"\r\n                                change="onShopOrderFilterBarChange"\r\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\r\n                        groupName="basic"\r\n                        name="material"\r\n                        label="{i18n-material>common.material.lbl}"\r\n                        visibleInFilterBar="true"><fb:control><Input\r\n                                id="materialFilter"\r\n                                class="mesUpperCaseTransform"\r\n                                showValueHelp="true"\r\n                                valueHelpRequest="onMaterialBrowse"\r\n                                valueHelpOnly="true"\r\n                                change="onMaterialFilterBarChange"\r\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\r\n                        groupName="basic"\r\n                        name="materialVersion"\r\n                        label="{i18n-sfc>common.materialVersion.lbl}"\r\n                        visibleInFilterBar="true"><fb:control><Input\r\n                                id="materialVersionFilter"\r\n                                class="mesUpperCaseTransform"\r\n                                editable="false"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\r\n                        groupName="basic"\r\n                        name="creationTimeRange"\r\n                        label="{i18n-global>common.creationTimeRange.lbl}"\r\n                        visibleInFilterBar="true"><fb:control><DateRangeSelection\r\n                                id="creationTimeRangeFilter"\r\n                                displayFormat="yyyy/MM/dd"\r\n                                change="onFilterBarChange"/></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\r\n                id="resultTable"\r\n                items="{\r\n                   path: \'/Sfcs\',\r\n                    parameters: {\r\n                        $select: [\'ref\',\'sfc\',\'status\',\'material\',\'shopOrder\'],\r\n                        $filter: \'status ne com.sap.mes.odata.SfcStatus\\\'DONE\\\' and status ne com.sap.mes.odata.SfcStatus\\\'SCRAPPED\\\' and status ne com.sap.mes.odata.SfcStatus\\\'INVALID\\\' and status ne com.sap.mes.odata.SfcStatus\\\'DELETED\\\' and status ne com.sap.mes.odata.SfcStatus\\\'DONE_HOLD\\\' and status ne com.sap.mes.odata.SfcStatus\\\'RETURNED\\\' and status ne com.sap.mes.odata.SfcStatus\\\'GOLDEN_UNIT\\\'\'\r\n                    }\r\n                }"\r\n                mode="MultiSelect"\r\n                updateFinished="onListUpdate"\r\n                growing="true"\r\n                growingThreshold="20"\r\n                growingScrollToLoad="true"\r\n            ><headerToolbar><Toolbar><core:Fragment fragmentName="sap.dm.dme.fragment.TableTitle" type="XML"/></Toolbar></headerToolbar><columns><Column minScreenWidth="Desktop"><Text text="{i18n-sfc>common.sfc.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-status>common.status.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-shopOrder>common.shopOrder.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-material>common.materialVersion.lbl}"/></Column></columns><items><ColumnListItem><cells><Text text="{sfc}"/><Text text="{\r\n                                path: \'status\',\r\n                                type: \'sap.ui.model.odata.type.String\',\r\n                                formatter: \'.statusFormatter.getStatusText\'\r\n                            }"/><Text text="{shopOrder/shopOrder}"/><Text text="{material/material} / {material/version}"/></cells></ColumnListItem></items></Table></content><beginButton><Button\r\n                id="okButton"\r\n                text="{i18n-global>common.ok.btn}"\r\n                tooltip="{i18n-global>common.ok.btn}"\r\n                press="onSelect"/></beginButton><endButton><Button\r\n                id="closeButton"\r\n                text="{i18n-global>common.cancel.btn}"\r\n                tooltip="{i18n-global>common.cancel.btn}"\r\n                press="onCancel"/></endButton></Dialog></core:FragmentDefinition>\r\n',
    "sap/dm/dme/podfoundation/browse/view/SfcOperationBrowse.fragment.xml": '<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"\n        xmlns:fb="sap.ui.comp.filterbar"\n        xmlns:l="sap.ui.layout"><Dialog\n        id="dialog"\n        title="{i18n-operation>browseDialog.operation.title}"\n        afterClose="onClose"\n        contentHeight="2000px"><content><Table\n                id="resultTable"\n                items="{\n                    path: \'/Operations\'\n                }"\n                mode="SingleSelectMaster"\n                selectionChange="onSelectOperation"\n                growing="false"><columns><Column minScreenWidth="Desktop"><Text text="{i18n-operation>common.operation.lbl}"/></Column><Column minScreenWidth="Desktop"><Text text="{i18n-global>common.description.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-status>common.status.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-sfc>common.sfc.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-routing>common.routingVersion.lbl}"/></Column></columns><items><ColumnListItem><cells><Text text="{operation}" /><Text text="{description}" /><Text text="{\n                                path: \'status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.statusFormatter.getStatusText\'\n                            }" /><Text text="{sfc}" /><Text text="{routingAndRevision}" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n-global>common.cancel.btn}"\n                tooltip="{i18n-global>common.cancel.btn}"\n                press="onCancel"/></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/browse/view/ShopOrderBrowse.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:fb="sap.ui.comp.filterbar"\n    xmlns:l="sap.ui.layout"><Dialog\n        id="dialog"\n        title="{i18n-shopOrder>browseDialog.shopOrder.title}"\n        afterClose="onClose"\n        contentHeight="2000px"><content><fb:FilterBar\n                id="filterBar"\n                showGoOnFB="false"\n                showClearOnFB="true"\n                showFilterConfiguration="false"\n                filterBarExpanded="false"\n                filterContainerWidth="225px"\n                clear="onFilterBarClear"\n                basicSearch="searchField"><fb:content><SearchField\n                        id="searchField"\n                        showSearchButton="false"\n                        liveChange="onSearchLiveChange"\n                        maxLength="200"/></fb:content><fb:filterGroupItems><fb:FilterGroupItem\n                        groupName="basic"\n                        name="shopOrder"\n                        label="{i18n-shopOrder>common.shopOrder.lbl}"\n                        visibleInFilterBar="true"><fb:control><Input\n                                id="shopOrderFilter"\n                                change="onFilterBarChange"\n                                class="mesUpperCaseTransform"\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="shopOrderType"\n                        label="{i18n-objectType>common.orderType.lbl}"\n                        visibleInFilterBar="true"><fb:control><Select\n                                id="typeFilter"\n                                selectedKey="ALL"\n                                items="{shopOrderTypeItems>/}"\n                                change="onFilterBarChange"><items><core:Item key="{shopOrderTypeItems>key}" text="{shopOrderTypeItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="material"\n                        label="{i18n-material>common.material.lbl}"\n                        visibleInFilterBar="true"><fb:control><Input\n                                id="materialFilter"\n                                class="mesUpperCaseTransform"\n                                showValueHelp="true"\n                                valueHelpRequest="onMaterialBrowse"\n                                change="onMaterialFilterBarChange"\n                                maxLength="200"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="materialGroup"\n                        label="{i18n-material>common.materialGroup.lbl}"\n                        visibleInFilterBar="true"><fb:control><ComboBox\n                                id="materialGroupFilter"\n                                showSecondaryValues="true"\n                                change="onFilterBarChange"\n                                items="{\n                                    path: \'product>/MaterialGroups\',\n                                    parameters: { $select: \'ref,materialGroup,description\' }\n                                }"><core:ListItem\n                                key="{product>ref}"\n                                text="{product>materialGroup}"\n                                additionalText="{=(${product>description}===${product>materialGroup})?null:${product>description}}"/></ComboBox></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="status"\n                        label="{i18n-status>common.status.lbl}"\n                        visibleInFilterBar="true"><fb:control><Select\n                                id="statusFilter"\n                                selectedKey="ALL"\n                                items="{shopOrderStatusItems>/}"\n                                change="onFilterBarChange"><items><core:Item key="{shopOrderStatusItems>key}" text="{shopOrderStatusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="creationTimeRange"\n                        label="{i18n-global>common.creationTimeRange.lbl}"\n                        visibleInFilterBar="true"><fb:control><DateRangeSelection\n                                id="creationTimeRangeFilter"\n                                displayFormat="yyyy/MM/dd"\n                                change="onFilterBarChange"/></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="plannedCompletionDate"\n                        label="{i18n-shopOrder>common.plannedCompletion.lbl}"\n                        visibleInFilterBar="true"><fb:control><DateTimePicker\n                                id="plannedCompletionDateFilter"\n                                change="onFilterBarChange"/></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\n                id="resultTable"\n                items="{\n                    path: \'/ShopOrders\',\n                    parameters: {\n                        $select: [\'ref\',\'shopOrder\',\'status\',\'shopOrderType\',\'plannedCompletionDate\',\'material\',\'materialRef\',\'buildQuantity\',\'releasedQuantity\'],\n                        $filter: \'status ne com.sap.mes.odata.ShopOrderStatus\\\'DONE\\\' and status ne com.sap.mes.odata.ShopOrderStatus\\\'CLOSED\\\' and status ne com.sap.mes.odata.ShopOrderStatus\\\'DISCARDED\\\'\',\n                        $expand: \'shopOrderType\'\n                    }\n                }"\n                mode="SingleSelectMaster"\n                selectionChange="onSelect"\n                growing="true"\n                growingThreshold="20"\n                updateFinished="onListUpdate"\n                growingScrollToLoad="true"><headerToolbar><Toolbar><core:Fragment fragmentName="sap.dm.dme.fragment.TableTitle" type="XML"/></Toolbar></headerToolbar><columns><Column minScreenWidth="Desktop"><Text text="{i18n-shopOrder>common.shopOrder.lbl}"/></Column><Column minScreenWidth="Desktop"><Text text="{i18n-material>common.material.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-objectType>common.orderType.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-shopOrder>common.plannedCompletion.lbl}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-status>common.status.lbl}"/></Column></columns><items><ColumnListItem><cells><Text text="{shopOrder}" /><Text text="{\n                                path: \'material/material\',\n                                type: \'sap.ui.model.odata.type.String\'\n                            }" /><Text text="{\n                                path: \'shopOrderType/orderType\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.objectTypeFormatter.getShopOrderTypeText\'\n                            }" /><Text text="{\n                                path: \'plannedCompletionDate\',\n                                type: \'sap.ui.model.odata.type.DateTimeOffset\'\n                            }" /><Text text="{\n                                path: \'status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.statusFormatter.getStatusText\'\n                            }" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n-global>common.cancel.btn}"\n                tooltip="{i18n-global>common.cancel.btn}"\n                press="onCancel"/></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/browse/view/WorkCenterBrowse.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:fb="sap.ui.comp.filterbar"\n    xmlns:l="sap.ui.layout"\n><Dialog\n        id="dialog"\n        title="{i18n-workCenter>workCenterBrowseTitle}"\n        afterClose="onClose"\n        contentHeight="2000px"\n    ><content><fb:FilterBar\n                id="filterBar"\n                showGoOnFB="false"\n                showClearOnFB="true"\n                showFilterConfiguration="false"\n                filterBarExpanded="false"\n                filterContainerWidth="225px"\n                clear="onFilterBarClear"\n                basicSearch="searchField"\n            ><fb:content><SearchField\n                        id="searchField"\n                        showSearchButton="false"\n                        liveChange="onSearchLiveChange"\n                        maxLength="200"\n                    /></fb:content><fb:filterGroupItems><fb:FilterGroupItem\n                        groupName="basic"\n                        name="workcenter"\n                        label="{i18n-workCenter>common.workCenter.lbl}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="workCenterFilter"\n                                change="onFilterBarChange"\n                                class="mesUpperCaseTransform"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="description"\n                        label="{i18n-global>common.description.lbl}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="descriptionFilter"\n                                change="onFilterBarChange"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="status"\n                        label="{i18n-status>common.status.lbl}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Select\n                                id="statusFilter"\n                                selectedKey="ALL"\n                                items="{workCenterStatusItems>/}"\n                                change="onFilterBarChange"\n                            ><items><core:Item key="{workCenterStatusItems>key}" text="{workCenterStatusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="creationTimeRange"\n                        label="{i18n-global>common.creationTimeRange.lbl}"\n                        visibleInFilterBar="true"\n                    ><fb:control><DateRangeSelection\n                                id="creationTimeRangeFilter"\n                                displayFormat="yyyy/MM/dd"\n                                change="onFilterBarChange"\n                            /></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\n                id="resultTable"\n                items="{\n                    path: \'plant>/Workcenters\',\n                    parameters: {$select: [\'ref\',\'workcenter\',\'description\',\'status\', \'workcenterCategory\']}\n                }"\n                mode="SingleSelectMaster"\n                selectionChange="onSelect"\n                growing="true"\n                growingThreshold="20"\n                growingScrollToLoad="true"\n            ><columns><Column width="15em"><Text text="{i18n-workCenter>common.workCenter.lbl}"/></Column><Column width="10em" minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-global>common.description.lbl}"/></Column><Column width="10em" minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-status>common.status.lbl}"/></Column><Column width="10em" minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n-workCenter>common.workCenterCategory.lbl}"/></Column></columns><items><ColumnListItem><cells><Text text="{plant>workcenter}" /><Text text="{plant>description}" /><Text text="{\n                                path: \'plant>status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.statusFormatter.getStatusEnumText\'\n                            }" /><Text text="{\n                                path: \'plant>workcenterCategory\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.enumFormatter.getWorkCenterCategoryText\'\n                            }" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n-global>cancel}"\n                tooltip="{i18n-global>cancel}"\n                press="onCancel"\n            /></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/browse/view/WorkCenterResourceBrowse.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:fb="sap.ui.comp.filterbar"\n    xmlns:l="sap.ui.layout"\n><Dialog\n        id="dialog"\n        title="{i18n>browseDialog.resource.title}"\n        afterClose="onClose"\n        contentHeight="2000px"\n    ><content><fb:FilterBar\n                id="filterBar"\n                showGoOnFB="false"\n                showClearOnFB="true"\n                showFilterConfiguration="false"\n                filterBarExpanded="false"\n                filterContainerWidth="225px"\n                clear="onFilterBarClear"\n                basicSearch="searchField"\n            ><fb:content><SearchField\n                        id="searchField"\n                        showSearchButton="false"\n                        liveChange="onSearchLiveChange"\n                        maxLength="200"\n                    /></fb:content><fb:filterGroupItems><fb:FilterGroupItem\n                        groupName="basic"\n                        name="resource"\n                        label="{i18n>resource}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="resourceFilter"\n                                change="onFilterBarChange"\n                                class="mesUpperCaseTransform"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="description"\n                        label="{i18n>description}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Input\n                                id="descriptionFilter"\n                                change="onFilterBarChange"\n                                maxLength="200"\n                            /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="status"\n                        label="{i18n>status}"\n                        visibleInFilterBar="true"\n                    ><fb:control><Select\n                                id="statusFilter"\n                                selectedKey="ALL"\n                                items="{statusItems>/}"\n                                change="onFilterBarChange"\n                            ><items><core:Item key="{statusItems>key}" text="{statusItems>text}" /></items></Select></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="resourceTypeResourceType"\n                        label="{i18n>resourceType}"\n                        visibleInFilterBar="true"\n                    ><fb:control><ComboBox\n                                id="resourceTypeFilter"\n                                showSecondaryValues="true"\n                                change="onFilterBarChange"\n                                items="{\n                                    path: \'/resourceTypeList\',\n                                    parameters: { $select: \'ref,resourceType,description\' }\n                                }"\n                            ><core:ListItem\n                                    key="{ref}"\n                                    text="{resourceType}"\n                                    additionalText="{=(${description}===${resourceType})?null:${description}}"\n                                /></ComboBox></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                        groupName="basic"\n                        name="resourceTypecreatedDateTime"\n                        label="{i18n>creationTimeRange}"\n                        visibleInFilterBar="true"\n                    ><fb:control><DateRangeSelection\n                                id="creationTimeRangeFilter"\n                                displayFormat="yyyy/MM/dd"\n                                change="onFilterBarChange"\n                            /></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar><Table\n                id="resultTable"\n                \n                items="{\n                    path: \'/items\',\n                    parameters: {\n                        $select: [\'ref\',\'resource\',\'description\',\'status\',\'resourceTypeResources\']\n                    }\n                }"\n                                \n                mode="SingleSelectMaster"\n                selectionChange="onSelect"\n                growing="true"\n                growingThreshold="20"\n                growingScrollToLoad="true"\n            ><columns><Column width="15em"><Text text="{i18n>resource}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>description}"/></Column><Column width="10em" minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>status}"/></Column><Column minScreenWidth="Desktop" demandPopin="true"><Text text="{i18n>resourceType}"/></Column></columns><items><ColumnListItem><cells><Text text="{resource}" /><Text text="{description}" /><Text text="{\n                                path: \'status\',\n                                type: \'sap.ui.model.odata.type.String\',\n                                formatter: \'.formatter.getResourceStatusText\'\n                            }" /><Text text="{\n                                path: \'resourceTypeAsText\'\n                            }" /></cells></ColumnListItem></items></Table></content><beginButton><Button\n                id="closeButton"\n                text="{i18n>common.cancel}"\n                tooltip="{i18n>common.cancel}"\n                press="onCancel"\n            /></beginButton></Dialog></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/fragment/ActionAssignmentActionButtonTable.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:l="sap.ui.layout"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><Table\n        width="100%"\n        backgroundDesign="Solid"\n        contextualWidth="Auto"\n        popinLayout="GridSmall"\n        mode="SingleSelectMaster"\n        noDataText="{18n>noDataInActionAssignmentDialog}"\n        class="sapUiSizeCompact"\n        items="{\n            path: \'/Actions\',\n            filters: {path: \'Rank\', operator: \'GT\', value1: \'0\'},\n            sorter: {path: \'Rank\', descending: true}\n        }"><columns><Column width="12rem" hAlign="Begin" vAlign="Middle"><Text text="{i18n>actionAssignmentTypeColumn}" tooltip="{i18n>actionAssignmentTypeColumn}" wrapping="false"/></Column><Column minScreenWidth="tablet" demandPopin="true" popinDisplay="WithoutHeader" hAlign="Begin" vAlign="Middle"><Text text="{i18n>actionAssignmentTypeDefinitionColumn}" tooltip="{i18n>actionAssignmentTypeDefinitionColumn}" wrapping="false"/></Column><Column width="6.5rem" hAlign="Center" vAlign="Middle"><Text text="{i18n>actionAssignmentConfigurationColumn}" tooltip="{i18n>actionAssignmentConfigurationColumn}" wrapping="false"/></Column><Column width="4rem" hAlign="Center" vAlign="Middle"><Text text="" wrapping="false"/></Column></columns><items><ColumnListItem><cells><Text text="{actionType}" wrapping="true"/><HBox renderType="Bare" alignContent="Center" alignItems="Center"><Text text="{typeDefinitionTitle}" wrapping="true" visible="{= ${actionTypeKey} !== \'TRANSACTION\'}"/><Input value="{typeDefinitionTitle}" width="18rem" change="onTypeDefinitionTitleChange" app:actionId="{action}" \n\t\t\t\t\t\t       visible="{= ${actionTypeKey} === \'TRANSACTION\'}" /></HBox><HBox renderType="Bare" justifyContent="Center" alignContent="Center" alignItems="Center"><core:Icon \n\t\t\t\t\t\t    class="sapUiTinyMarginBottom"\n\t\t\t\t\t\t    src="sap-icon://settings"\n\t\t\t\t\t\t    tooltip="{i18n>actionAssignmentConfigurationTitle}"\n\t\t\t\t\t\t    alt="{i18n>actionAssignmentConfigurationTitle}"\n\t\t\t\t\t\t    press="onShowConfiguration"\n\t\t\t\t\t\t    visible="{showConfiguration}"\n\t\t\t\t\t\t    app:actionId="{action}"\n\t\t\t\t\t\t/></HBox><core:Icon \n\t\t\t\t\t    class="sapUiTinyMarginBottom"\n\t\t\t\t\t    src="sap-icon://sys-cancel"\n\t\t\t\t\t    tooltip="{i18n>delete}"\n\t\t\t\t\t    alt="{i18n>delete}"\n\t\t\t\t\t    press="onRemoveAction"\n\t\t\t\t\t    app:actionId="{action}"\n\t\t\t\t\t/></cells></ColumnListItem></items></Table></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ActionAssignmentDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:l="sap.ui.layout"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><Dialog\n    title="{DialogModel>/buttonTypeLabel}"\n    class="sapUiPopupWithPadding"\n    resizable="true"\n    draggable="true"\n    contentWidth="1550px"\n    contentHeight="650px"\n    verticalScrolling="false"><content><l:DynamicSideContent\n\t        class="sapUiDSCExplored"\n\t        containerQuery="true"\n\t        sideContentFallDown="BelowM"\n\t        showSideContent="false"\n\t        breakpointChanged="handleBreakpointChangeEvent"><l:mainContent><HBox height="100%" width="100%"><Panel height="100%" width="100%" backgroundDesign="Transparent" \n\t                       expandable="false" expanded="true" class="sapUiNoContentPadding"><headerToolbar><Toolbar><content><Title text="{i18n>actionAssignmentTableTitle}"/><ToolbarSpacer/><Button\n\t                                    icon="sap-icon://navigation-up-arrow"\n\t                                    tooltip="{i18n>moveActionUp}"\n\t                                    press="moveUp"/><Button\n\t                                    icon="sap-icon://navigation-down-arrow"\n\t                                    tooltip="{i18n>moveActionDown}"\n\t                                    press="moveDown"/><Button\n\t                                    text="{i18n>actionAssignmentAddButtonText}"\n\t                                    tooltip="{i18n>actionAssignmentAddButtonTooltip}"\n\t                                    press="onAddAction"/></content></Toolbar></headerToolbar><content><HBox visible="{= ${DialogModel>/buttonType} === \'ACTION_BUTTON\'}"><core:Fragment fragmentName="sap.dm.dme.podfoundation.fragment.ActionAssignmentActionButtonTable" type="XML" /></HBox><HBox visible="{= ${DialogModel>/buttonType} === \'MENU_BUTTON\'}"><core:Fragment fragmentName="sap.dm.dme.podfoundation.fragment.ActionAssignmentMenuButtonTable" type="XML" /></HBox></content></Panel></HBox></l:mainContent><l:sideContent><VBox width="100%" height="100%" direction="Column"><items><Panel height="100%" width="100%" expandable="false" expanded="true" class="sapMesActionAssignmentPanel"><headerToolbar><Toolbar height="3rem"><Title text="{i18n>actionAssignmentConfigurationTitle}"/><ToolbarSpacer /><Button icon="sap-icon://decline" tooltip="{i18n>close}" press="onCloseConfiguration"/></Toolbar></headerToolbar><content><f:SimpleForm layout="ResponsiveGridLayout" width="100%" editable="true"></f:SimpleForm></content></Panel></items></VBox></l:sideContent></l:DynamicSideContent></content><buttons><Button text="{i18n>close}" press="onDialogOk" /></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ActionAssignmentMenuButtonTable.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:l="sap.ui.layout"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><Table\n        contextualWidth="Auto"\n        popinLayout="GridSmall"\n        backgroundDesign="Solid"\n        mode="SingleSelectMaster"\n        noDataText="{18n>noDataInActionAssignmentDialog}"\n        class="sapUiSizeCompact"\n        items="{\n            path: \'/Actions\',\n            filters: {path: \'Rank\', operator: \'GT\', value1: \'0\'},\n            sorter: {path: \'Rank\', descending: true}\n        }"><columns><Column width="12rem" hAlign="Begin" vAlign="Middle"><Text text="{i18n>actionAssignmentNameColumn}" tooltip="{i18n>actionAssignmentNameColumn}" wrapping="false"/></Column><Column width="8rem" hAlign="Begin" vAlign="Middle"><Text text="{i18n>actionAssignmentTypeColumn}" tooltip="{i18n>actionAssignmentTypeColumn}" wrapping="false"/></Column><Column minScreenWidth="tablet" demandPopin="true" popinDisplay="WithoutHeader" hAlign="Begin" vAlign="Middle"><Text text="{i18n>actionAssignmentTypeDefinitionColumn}" tooltip="{i18n>actionAssignmentTypeDefinitionColumn}" wrapping="false"/></Column><Column width="6.5rem" hAlign="Center" vAlign="Middle"><Text text="{i18n>actionAssignmentConfigurationColumn}" tooltip="{i18n>actionAssignmentConfigurationColumn}" wrapping="false"/></Column><Column width="4rem" hAlign="Center" vAlign="Middle"><Text text="" wrapping="false"/></Column></columns><items><ColumnListItem><cells><Input \n\t\t\t\t\t    value="{menuLabel}"\n\t\t\t\t\t    type="Text"\n\t\t\t\t\t    valueHelpRequest="onLabelBrowse"\n\t\t\t\t\t    showSuggestion="true"\n\t\t\t\t\t    showValueHelp="false"\n                        change="onMenuLabelChange"\n                        app:actionId="{action}"\n\t\t\t\t\t    suggestionItems="{path:\'DialogModel>/I18nButtonLabels\', templateShareable:true}"><suggestionItems><core:ListItem text="{DialogModel>i18nName}" additionalText="{DialogModel>i18nLabel}"/></suggestionItems></Input><Text text="{actionType}" wrapping="true"/><HBox width="100%" renderType="Bare" alignContent="Center" alignItems="Center"><Text text="{typeDefinitionTitle}" wrapping="true" visible="{= ${actionTypeKey} !== \'TRANSACTION\'}"/><Input value="{typeDefinitionTitle}" width="100%" change="onTypeDefinitionTitleChange" app:actionId="{action}" \n\t\t\t\t\t           visible="{= ${actionTypeKey} === \'TRANSACTION\'}" /></HBox><HBox renderType="Bare" justifyContent="Center" alignContent="Center" alignItems="Center"><core:Icon \n\t\t\t\t\t\t    class="sapUiTinyMarginBottom"\n\t\t\t\t\t\t    src="sap-icon://settings"\n\t\t\t\t\t\t    tooltip="{i18n>actionAssignmentConfigurationTitle}"\n\t\t\t\t\t\t    alt="{i18n>actionAssignmentConfigurationTitle}"\n\t\t\t\t\t\t    press="onShowConfiguration"\n\t\t\t\t\t\t    visible="{showConfiguration}"\n\t\t\t\t\t\t    app:actionId="{action}"\n\t\t\t\t\t\t/></HBox><core:Icon \n\t\t\t\t\t    class="sapUiTinyMarginBottom"\n\t\t\t\t\t    src="sap-icon://sys-cancel"\n\t\t\t\t\t    tooltip="{i18n>delete}"\n\t\t\t\t\t    alt="{i18n>delete}"\n\t\t\t\t\t    press="onRemoveAction"\n\t\t\t\t\t    app:actionId="{action}"\n\t\t\t\t\t/></cells></ColumnListItem></items></Table></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/AddActionDetails.fragment.xml": '<core:FragmentDefinition \n    xmlns="sap.m"\n    xmlns:l="sap.ui.layout" \n    xmlns:f="sap.ui.layout.form" \n    xmlns:core="sap.ui.core"><f:SimpleForm\n        id="addActionDetailsForm"\n        editable="true"\n        layout="ResponsiveGridLayout"\n        adjustLabelSpan="false"\n        labelSpanXL="4"\n        labelSpanL="4"\n        labelSpanM="4"\n        labelSpanS="12"\n        emptySpanXL="1"\n        emptySpanL="1"\n        emptySpanM="1"\n        emptySpanS="0"\n        columnsXL="1"\n        columnsL="1"\n        columnsM="1"\n        singleContainerFullSize="true"><f:content><Label text="{i18n>actionAssignmentTypeColumn}" labelFor="actionTypeInput"/><Select id="actionTypeInput"\n                forceSelection="true"\n                selectedKey="AddActionData>/actionType"\n                change="onActionTypeChange"\n                items="{ActionTypes>/}"><core:Item key="{ActionTypes>actionType}" text="{ActionTypes>name}" /></Select><Label text="{i18n>actionAssignmentTypeDefinitionColumn}" labelFor="pluginTypeDefinitionInput" \n                   required="true" visible="{= ${AddActionData>/actionType} === \'PLUGIN\'}"/><Input id="pluginTypeDefinitionInput" \n                value="{AddActionData>/typeDefinitionTitle}"\n                editable="true"\n                required="true"\n                type="Text"\n                valueHelpRequest="onPluginTypeDefinitionBrowse"\n                valueHelpOnly="true"\n                showSuggestion="false"\n                showValueHelp="true"\n                visible="{= ${AddActionData>/actionType} === \'PLUGIN\'}"></Input><Label text="{i18n>actionAssignmentMultiInstanceColumn}" labelFor="pluginMultiInstanceSwitch" \n                   visible="{= ${AddActionData>/actionType} === \'PLUGIN\'}"/><Switch id="pluginMultiInstanceSwitch" \n                state="{AddActionData>/multiInstanceConfigurable}"\n                tooltip="{i18n>actionAssignmentMultiInstanceTooltip}"\n                visible="{AddActionData>/showMultiInstanceSwitch}"></Switch><Label text="{i18n>actionAssignmentTypeDefinitionColumn}" labelFor="productionProcessTypeDefinitionInput" \n                   required="true" visible="{= ${AddActionData>/actionType} === \'PRODUCTION_PROCESS\'}"/><Input id="productionProcessTypeDefinitionInput" \n                value="{AddActionData>/typeDefinitionTitle}"\n                editable="true"\n                required="true"\n                type="Text"\n                valueHelpRequest="onProductionProcessTypeDefinitionBrowse"\n                valueHelpOnly="true"\n                showSuggestion="false"\n                showValueHelp="true"\n                visible="{= ${AddActionData>/actionType} === \'PRODUCTION_PROCESS\'}"></Input><Label text="{i18n>actionAssignmentTypeDefinitionColumn}" labelFor="transactionTypeDefinitionInput" \n                   required="true" visible="{= ${AddActionData>/actionType} === \'TRANSACTION\'}"/><Input id="transactionTypeDefinitionInput" \n                value="{AddActionData>/typeDefinitionTitle}"\n                editable="true"\n                required="true"\n                type="Text"\n                change="onTransactionTypeDefinitionChange"\n                showSuggestion="false"\n                showValueHelp="false"\n                visible="{= ${AddActionData>/actionType} === \'TRANSACTION\'}"></Input><Label text="{i18n>actionAssignmentTypeDefinitionColumn}" labelFor="eventTypeDefinitionInput" \n                   required="true" visible="{= ${AddActionData>/actionType} === \'EVENT\'}"/><Select id="eventTypeDefinitionInput"\n                forceSelection="true"\n                selectedKey="AddActionData>/typeDefinitionEventKey"\n                change="onEventTypeDefinitionChange"\n                items="{EventTypes>/}"\n                visible="{= ${AddActionData>/actionType} === \'EVENT\'}"><core:Item key="{EventTypes>event}" text="{EventTypes>title}" /></Select><Label text="{i18n>actionAssignmentNameColumn}" \n                   visible="{AddActionData>/showMenuLabel}" \n                   labelFor="menuLabelInput"/><Input id="menuLabelInput" \n                visible="{AddActionData>/showMenuLabel}"\n                value="{AddActionData>/menuLabel}"\n                valueHelpRequest="onMenuLabelBrowse"\n                showSuggestion="true"\n                showValueHelp="false"\n                suggestionItems="{I18nButtonLabels>/}"><suggestionItems><core:ListItem text="{I18nButtonLabels>i18nName}" additionalText="{I18nButtonLabels>i18nLabel}"/></suggestionItems></Input></f:content></f:SimpleForm></core:FragmentDefinition>\n',
    "sap/dm/dme/podfoundation/fragment/AddActionDialog.fragment.xml": '<core:FragmentDefinition\r\n    xmlns="sap.m"\r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns:f="sap.ui.layout.form"\r\n    xmlns:core="sap.ui.core"><Dialog\r\n    id="addActionDialog"\r\n    title="{i18n>addActionDialogTitle}"\r\n    resizable="false"\r\n    draggable="true"\r\n    contentWidth="760px"><content><Panel id="addActionPanel" width="100%" height="100%" expandable="false" expanded="true"><content><HBox id="addActionHBox" height="100%" width="100%" alignItems="Start" justifyContent="Start" fitContainer="true" renderType="Bare" ><items><core:Fragment fragmentName="sap.dm.dme.podfoundation.fragment.AddActionDetails" type="XML" /></items></HBox></content></Panel></content><buttons><Button id="createActionButton" text="{i18n-global>common.create.btn}" press="onAddActionCreate" type="Emphasized"/><Button id="cancelActionButton" text="{i18n-global>common.cancel.btn}" press="onAddActionCancel"/></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/AddRemoveButtonControl.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:smartList="sap.ui.comp.smartlist"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><smartList:SmartList width="100%" renderType="Bare" enableAutoBinding="true" showRowCount="false"\n        showFullScreenButton="false" listBindingPath="ButtonsControl>/" ><smartList:listItemTemplate><CustomListItem><HBox width="100%" ><VBox class="sapUiNoMarginBegin" ><CheckBox text="" selected="{ButtonsControl>selected}"/></VBox><VBox width="100%" ><HBox width="100%" alignContent="Start" alignItems="Center" ><Label width="3rem" text="{i18n>buttonAssignmentNameTitle}"/><Input width="13rem" value="{ButtonsControl>buttonName}"\n\t\t                           showSuggestion="true" suggest=".onButtonNameSuggest" suggestionItems="{/I18nButtonLabels}"\n\t\t                           app:buttonUid="{ButtonsControl>buttonUid}" class="sapUiNoMarginBegin"><suggestionItems><core:ListItem text="{i18nName}" additionalText="{i18nLabel}"/></suggestionItems></Input></HBox><HBox width="100%" alignContent="Start" alignItems="Center"><Label width="3rem" text="{i18n>buttonAssignmentTypeTitle}"/><Select width="13rem" selectedKey="{ButtonsControl>buttonType}" change="onButtonTypeChange" \n\t\t\t\t                    app:buttonUid="{ButtonsControl>buttonUid}" class="sapUiNoMarginBegin"><items><core:Item key="ACTION_BUTTON" text="{i18n>actionbutton}" /><core:Item key="MENU_BUTTON" text="{i18n>groupbutton}" /><core:Item key="NAVIGATION_BUTTON" text="{i18n>navigationbutton}" /></items></Select></HBox><HBox width="100%" alignContent="Start" alignItems="Center" visible="{= ${ButtonsControl>buttonType} !== \'NAVIGATION_BUTTON\'}"><Label width="4rem" text=""/><Button text="{i18n>buttonAssignmentButtonTitle}" tooltip="{i18n>buttonAssignmentButtonTitle}" \n                                    app:buttonUid="{ButtonsControl>buttonUid}" press="onAssignActionsPress"/></HBox><HBox width="100%" alignContent="Start" alignItems="Center" visible="{= ${ButtonsControl>buttonType} === \'NAVIGATION_BUTTON\'}"><Label width="3rem" text="{i18n>buttonAssignmentPageTitle}"/><Select width="13rem" selectedKey="{ButtonsControl>selectActionPageName}" class="sapUiNoMarginBegin"\n                                items="{\n\t\t\t                        path: \'Pages>/\',\n\t\t\t                        sorter: { path: \'pageName\' }\n\t\t\t                    }" ><core:Item key="{Pages>page}" text="{Pages>pageName}" /></Select></HBox><HBox width="100%" alignContent="Start" alignItems="Center"><Label width="3rem" text="{i18n>buttonAssignmentIconTitle}"/><Input width="13rem" value="{ButtonsControl>buttonIcon}" showValueHelp="true" \n                                   valueHelpRequest="onIconBrowsePress" class="sapUiNoMarginBegin"/></HBox><HBox width="100%" alignContent="Start" alignItems="Center"><Label width="3rem" text="{i18n>buttonAssignmentTooltipTitle}"/><Input width="13em" value="{ButtonsControl>buttonTooltip}"\n                                   showSuggestion="true" suggest=".onButtonTooltipSuggest" suggestionItems="{/I18nTooltipLabels}"\n                                   app:buttonUid="{ButtonsControl>buttonUid}" class="sapUiNoMarginBegin"><suggestionItems><core:ListItem text="{i18nName}" additionalText="{i18nLabel}"/></suggestionItems></Input></HBox></VBox></HBox></CustomListItem></smartList:listItemTemplate><OverflowToolbar design="Transparent"><ToolbarSpacer/><Button icon="sap-icon://add" press="onAddButtonPress" tooltip="{i18n>buttonAssignmentAddTooltip}" /><Button icon="sap-icon://delete" press="onDeleteButtonPress" tooltip="{i18n>buttonAssignmentDeleteTooltip}" /></OverflowToolbar></smartList:SmartList></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ColumnDetailsDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.ui.table"\n    xmlns:core="sap.ui.core"\n    xmlns:m="sap.m"><m:Dialog\n    title="{/title}"\n    class="sapUiPopupWithPadding"\n    resizable="true"\n    draggable="true"\n    contentWidth="{/contentWidth}"\n    contentHeight="{/contentHeight}"><m:content><Table\n            id="columnDetailsDialogTable" \n            width="100%" \n            selectionMode="None"\n            rows="{path: \'/Details\'}"\n            visibleRowCount="{path: \'/visibleRowCount\'}"><columns><Column hAlign="Begin"><m:Text text="{path: \'/columnTitle\'}" wrapping="false"/><template><m:CheckBox text="{name}" selected="{selected}" /></template></Column></columns></Table></m:content><m:buttons><m:Button id="applyColumnDetailsButton" text="{i18n-global>apply}" press="_handleColumnDetailsDialogApply" /><m:Button id="cancelColumnDetailsButton" text="{i18n-global>cancel}" press="_handleColumnDetailsDialogCancel" /></m:buttons></m:Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ColumnPropertyEditorDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"><Dialog\n    title="{cpeI18n>columnPropertyEditor}"\n    class="sapUiPopupWithPadding"\n    resizable="true"\n    draggable="true"\n    contentWidth="1200px"\n    contentHeight="600px"><content><Table\n            id="columnPropertyEditorTable"\n            inset="false"\n            backgroundDesign="Solid"\n            sticky="HeaderToolbar,ColumnHeaders"\n            mode="None"\n            class="sapMesListCellHeight32 sapUiSizeCompact"\n            items="{path: \'/ColumnConfiguration\'}"><columns><Column hAlign="Begin" sortProperty="columnId" filterProperty="columnId"><Text text="{cpeI18n>prop_columnId}" wrapping="false" /></Column><Column width="10rem" hAlign="Begin"><Text text="{cpeI18n>prop_label}" wrapping="false" /></Column><Column width="7rem" hAlign="Center"><Text text="{cpeI18n>prop_width}" wrapping="false" /></Column><Column width="6rem" hAlign="Center"><Text text="{cpeI18n>prop_wrapping}" wrapping="false" /></Column><Column width="7rem" hAlign="Center"><Text text="{cpeI18n>prop_demandPopin}" wrapping="false" /></Column><Column width="8rem" hAlign="Center"><Label text="{cpeI18n>prop_minScreenWidth}" /></Column><Column width="7rem" hAlign="Center"><Label text="{cpeI18n>prop_hAlign}" /></Column><Column width="7rem" hAlign="Center"><Label text="{cpeI18n>prop_vAlign}" /></Column></columns><items><ColumnListItem><cells><Text text="{description}" wrapping="false" /><Input value="{label}" /><Input value="{width}" change="_onWidthChange" /><Switch state="{wrapping}" /><Switch state="{demandPopin}" /><Input value="{minScreenWidth}" change="_onMinScreenWidthChange" /><ComboBox value="{hAlignValue}" selectedKey="{hAlign}" items="{path: \'/HAlign\', templateShareable:false}"><core:Item key="{Key}" text="{Name}"/></ComboBox><ComboBox value="{vAlignValue}" selectedKey="{vAlign}"  items="{path: \'/VAlign\', templateShareable:false}"><core:Item key="{Key}" text="{Name}"/></ComboBox></cells></ColumnListItem></items></Table></content><buttons><Button id="closeButton" text="{i18n-global>close}" press="_handleColumnPropertyEditorDialogClose" /></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/IconSelectDialog.fragment.xml": '<core:FragmentDefinition\r\n    xmlns="sap.m"\r\n    xmlns:core="sap.ui.core"><SelectDialog\r\n        noDataText="{i18n>noIconsFound}"\r\n        title="{i18n>iconSelectDialogTitle}"\r\n        search="handleIconSelectSearch"\r\n        confirm="handleIconSelectConfirm"\r\n        items="{\r\n            path: \'ButtonIconData>/allIcons\'\r\n        }" ><StandardListItem\r\n            title="{ButtonIconData>name}"\r\n            icon="{ButtonIconData>icon}"\r\n            iconDensityAware="false"\r\n            iconInset="false"\r\n            type="Active" /></SelectDialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/InputParameterTable.fragment.xml": '<core:FragmentDefinition\n        xmlns="sap.m"\n        xmlns:core="sap.ui.core"><Table  id="inputParameterTable"\n            backgroundDesign="Solid"\n            inset="false"\n            class="sapMesListCellHeight32 sapUiSizeCompact"\n            contentWidth="1100px"\n            contentHeight="500px"\n            items="{path: \'oTableModel>/parameters\'}"><headerToolbar><Toolbar><content><Title text="{iptI18n>inputParameters}"/><ToolbarSpacer/><Button\n                            id="addParameterButton"\n                            text="{i18n-global>common.add.btn}"\n                            press="onAddInputParameter"/></content></Toolbar></headerToolbar><columns><Column hAlign="Begin" vAlign="Middle"><Text text="{iptI18n>parameterName}" wrapping="false"/></Column><Column hAlign="Begin" vAlign="Middle"><Text text="{iptI18n>parameterValue}" wrapping="false"/></Column><Column width="10%" hAlign="Center" vAlign="Middle"><Text text="" wrapping="false"/></Column></columns><items><ColumnListItem><cells><HBox alignContent="Center" alignItems="Center"><Input value="{oTableModel>name}" /></HBox><HBox alignContent="Center" alignItems="Center"><Input value="{oTableModel>value}" /></HBox><core:Icon\n                            class="sapUiTinyMarginBottom"\n                            src="sap-icon://sys-cancel"\n                            tooltip="{i18n-global>common.delete.btn}"\n                            alt="{i18n-global>common.delete.btn}"\n                            press="onRemoveParam"\n                            visible="{= ${oTableModel>id} > 1}"\n                    /></cells></ColumnListItem></items></Table></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ListColumnEditorDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:l="sap.ui.layout"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><Dialog\n    id="listColumnEditor"\n    title="{lceI18n>listColumnEditor}"\n    class="sapUiPopupWithPadding"\n    resizable="true"\n    draggable="true"\n    verticalScrolling="false"\n    contentWidth="1100px"\n    contentHeight="100%"><content><Panel id="listColumnEditorMainPanel" backgroundDesign="Transparent" height="100%" expandable="false" expanded="true"><headerToolbar><Toolbar height="3rem"><ToolbarSpacer width="90px"/><Label text="{lceI18n>prop_listName}" labelFor="columnEditorListName" /><Input id="columnEditorListName" value="{/listName}" width="300px" class="sapMesUpperCaseTransform"\n                           change="handleListNameChange" maxLength="36"/><ToolbarSpacer width="20px"/><Label text="{lceI18n>prop_description}" labelFor="columnEditorDescription"/><Input id="columnEditorDescription" value="{/description}" width="300px" maxLength="128"/></Toolbar></headerToolbar><infoToolbar><Toolbar height="auto" visible="{= ${/showGlobalListFields} || ${/showOrderingOptions} }" ><VBox width="100%" ><HBox width="100%" alignItems="Center" visible="{/showGlobalListFields}" ><ToolbarSpacer width="{/globalListSpacerWidth}"/><Label text="{lceI18n>prop_maximumNumberOfRows}" labelFor="maxRowsInput" visible="{/showMaximumNumberOfRows}"/><Input id="maxRowsInput" value="{/maximumNumberOfRow}" width="75px" type="Number" visible="{/showMaximumNumberOfRows}"\n\t\t                           tooltip="{lceI18n>prop_maximumNumberOfRowsTooltip}" /><ToolbarSpacer width="20px"/><Label text="{lceI18n>prop_allowMultipleSelection}" labelFor="multipleSelectionSwitch" visible="{/showAllowMultipleSelection}"/><Switch id="multipleSelectionSwitch" state="{/allowMultipleSelection}" tooltip="{lceI18n>prop_allowMultipleSelectionTooltip}"\n\t\t                            visible="{/showAllowMultipleSelection}" /><ToolbarSpacer width="20px"/><Label text="{lceI18n>prop_worklistType}" labelFor="worklistTypeSelect" visible="{/showWorklistType}" /><Select id="worklistTypeSelect" forceSelection="true" selectedKey="{/worklistType}" visible="{/showWorklistType}"\n\t\t                            tooltip="{lceI18n>prop_worklistTypeTooltip}"\n\t\t                            items="{\n\t\t                                path: \'/WorklistTypes\',\n\t\t                                sorter: { path: \'description\' }\n\t\t                            }"><core:Item key="{worklistType}" text="{description}" /></Select></HBox><HBox width="100%" alignItems="Center" visible="{/showOrderingOptions}" ><ToolbarSpacer width="{/orderingOptionsSpacerWidth1}" /><Label text="{lceI18n>prop_operatorColumnOrder}" labelFor="changeColumnSequenceSwitch" visible="{/showOperatorChangeColumnOrder}" /><Switch id="changeColumnSequenceSwitch" state="{/allowOperatorToChangeColumnSequence}" tooltip="{lceI18n>prop_operatorColumnOrderTooltip}"\n                                    visible="{/showOperatorChangeColumnOrder}" /><ToolbarSpacer width="{/orderingOptionsSpacerWidth2}"/><Label text="{lceI18n>prop_operatorSortOrder}" labelFor="changeSortOrderSwitch" visible="{/showOperatorChangeSortOrder}" /><Switch id="changeSortOrderSwitch" state="{/allowOperatorToSortRows}" tooltip="{lceI18n>prop_operatorSortOrderTooltip}"\n                                    visible="{/showOperatorChangeSortOrder}" /></HBox></VBox></Toolbar></infoToolbar><content><HBox id="listColumnEditorPanelHBox" width="100%" height="100%" renderType="Bare"><items><Panel id="listColumnEditorAvailablePanel" width="40%" height="100%" \n                                expandable="false" expanded="true" visible="true"><headerToolbar><Toolbar height="3rem"><Title text="{lceI18n>listColumnEditorAvailableColumns}" /></Toolbar></headerToolbar><content><Table\n                                    id="availableColumnsTable"\n                                    inset="false"\n                                    mode="MultiSelect"\n                                    includeItemInSelection="true"\n                                    class="sapMesListCellHeight32 sapUiSizeCompact"\n                                    items="{\n                                        path: \'/columns\',\n                                        filters: {path: \'Rank\', operator: \'EQ\', value1: \'0\'},\n                                        sorter: {path: \'description\'}\n                                    }"><columns><Column><Text text="{lceI18n>prop_columnId}" wrapping="false"/></Column></columns><items><ColumnListItem><cells><Text text="{description}" wrapping="false"/></cells></ColumnListItem></items></Table></content></Panel><VBox height="100%" justifyContent="Center" class="sapUiSmallMarginBeginEnd"><Button\n                               id="moveToAssignedButton"\n                               class="sapUiTinyMarginBottom"\n                               icon="sap-icon://navigation-right-arrow"\n                               tooltip="{lceI18n>moveToAssigned}"\n                               press="moveToAssigned"/><Button\n                               id="moveToAvailableButton"\n                               icon="sap-icon://navigation-left-arrow"\n                               tooltip="lceI18n>moveToAvailable"\n                               press="moveToAvailable"/></VBox><Panel id="listColumnEditorAssignedPanel" width="60%" height="100%" expandable="false" expanded="true" visible="true"><headerToolbar><Toolbar height="3rem"><Title text="{lceI18n>listColumnEditorAssignedColumns}" /><ToolbarSpacer/><Button\n                                        id="moveColumnUpButton"\n                                        icon="sap-icon://navigation-up-arrow"\n                                        tooltip="{lceI18n>moveColumnUp}"\n                                        press="moveUp"/><Button\n                                        id="moveColumnDownButton"\n                                        icon="sap-icon://navigation-down-arrow"\n                                        tooltip="{lceI18n>moveColumnDown}"\n                                        press="moveDown"/></Toolbar></headerToolbar><content><Table\n                                    id="listColumnEditorTable"\n                                    inset="false"\n                                    mode="MultiSelect"\n                                    includeItemInSelection="true"\n                                    class="sapMesListCellHeight32 sapUiSizeCompact"\n                                    items="{\n                                        path: \'/columns\',\n                                        filters: {path: \'Rank\', operator: \'GT\', value1: \'0\'},\n                                        sorter: {path: \'Rank\', descending: true}\n                                    }"><columns><Column hAlign="Begin" vAlign="Middle"><Text text="{lceI18n>prop_columnId}" wrapping="false"/></Column><Column width="6rem" hAlign="Center" visible="{/showSortOrderColumn}"><Text text="{lceI18n>prop_sortOrder}" wrapping="false"/></Column><Column width="6rem" hAlign="Center" vAlign="Middle" visible="{/showDetailsColumn}"><Text text="{lceI18n>prop_details}" wrapping="false"/></Column></columns><items><ColumnListItem><cells><Text text="{description}" wrapping="false" /><Input value="{path: \'sortOrder\'}" liveChange="_onSortOrderLiveChange" editable="{sortOrderEditable}" \n                                                       visible="{showSortField}"/><HBox alignItems="Center" justifyContent="Center" visible="{/showDetailsColumn}"><core:Icon src="sap-icon://settings" tooltip="{lceI18n>prop_columnDetailsTooltip}" \n                                                        visible="{detailsVisible}" press="_showColumnDetails" class="sapUiTinyMarginBottom"/><Switch state="{path: \'/showChangeAlert\'}" visible="{switchVisible}" tooltip="{lceI18n>prop_showChangeAlertTooltip}"/></HBox></cells></ColumnListItem></items></Table></content></Panel></items></HBox></content></Panel></content><buttons><Button id="saveListButton" text="{i18n-global>save}" press="_handleListColumnEditorDialogSave" /><Button id="cancelListButton" text="{i18n-global>cancel}" press="_handleListColumnEditorDialogCancel" /></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ListNameSearchDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"><Dialog\n    title="{lnsI18n>listNameSearch}"\n    class="sapUiPopupWithPadding"\n    showHeader="false"\n    resizable="true"\n    draggable="true"\n    contentWidth="700px"\n    contentHeight="585px"><content><Table\n            id="listNameSearchTable" \n            backgroundDesign="Solid"\n            inset="false"\n            width="100%" \n            mode="SingleSelectMaster"\n            items="{\n                path: \'/ListNames\'\n            }"><columns><Column width="15rem" hAlign="Begin"><Text text="{lnsI18n>prop_listName}"  wrapping="false"/></Column><Column hAlign="Begin"><Text text="{lnsI18n>prop_description}"  wrapping="false"/></Column><Column width="6rem" hAlign="Center"><Text text="{lnsI18n>prop_details}" /></Column></columns><items><ColumnListItem><cells><Text text="{listName}"/><Text text="{description}"/><core:Icon src="sap-icon://settings" tooltip="{lnsI18n>prop_detailsTooltip}"\n                                   press="_showDetails" class="sapUiTinyMarginBottom"/></cells></ColumnListItem></items></Table></content><buttons><Button id="newButton" text="{lnsI18n>newList}" icon="sap-icon://add" press="_handleListNameDialogNew" /><Button id="okButton" text="{i18n-global>ok}" press="_handleListNameDialogConfirm" /><Button id="cancelButton" text="{i18n-global>cancel}" press="_handleListNameDialogCancel" /></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/PluginAssignmentDialog.fragment.xml": '<core:FragmentDefinition\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:l="sap.ui.layout"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><Dialog\n    title="{DialogModel>/buttonTypeLabel}"\n    class="sapUiPopupWithPadding"\n    resizable="true"\n    draggable="true"\n    contentWidth="800px"\n    contentHeight="500px"\n    verticalScrolling="false"><content><f:SimpleForm\n\t        id="addPluginDetailsForm" editable="true" layout="ResponsiveGridLayout"\n\t        adjustLabelSpan="false" singleContainerFullSize="false" width="100%"\n\t        labelSpanXL="4" labelSpanL="4" labelSpanM="4" labelSpanS="12"\n\t        emptySpanXL="1" emptySpanL="1" emptySpanM="1" emptySpanS="0"\n\t        columnsXL="1" columnsL="1" columnsM="1"><f:content><Label text="{i18n>actionType.enum.plugin}" labelFor="pluginTypeDefinitionInput"/><Input id="pluginTypeDefinitionInput"  value="{DialogModel>/AssignedTitle}"\n\t              editable="true" required="false" type="Text" showSuggestion="false" showValueHelp="true"\n\t              valueHelpRequest="onPluginTypeDefinitionBrowse" valueHelpOnly="true"></Input></f:content></f:SimpleForm><Panel id="configurationSidePanelPanel" height="100%" width="100%" expandable="false" expanded="true"\n               class="sapUiNoContentPadding"><headerToolbar><OverflowToolbar><Title text="{i18n>properties}"/></OverflowToolbar></headerToolbar><content><f:SimpleForm\n\t                id="configurationSidePanelEditableForm" editable="true" layout="ResponsiveGridLayout"\n\t                adjustLabelSpan="false" singleContainerFullSize="false" width="100%"\n\t                labelSpanXL="4" labelSpanL="4" labelSpanM="4" labelSpanS="12"\n\t                emptySpanXL="1" emptySpanL="1" emptySpanM="1" emptySpanS="0"\n\t                columnsXL="1" columnsL="1" columnsM="1" class="sapMesPluginDialogConfigurationForm"></f:SimpleForm></content></Panel></content><buttons><Button text="{i18n>close}" tooltip="{i18n>closePluginAssignmentDialogTooltip}"  press="onDialogOk" /></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/PrintLabelPropertyEditorDialog.fragment.xml": '<core:FragmentDefinition\n        xmlns:l="sap.ui.layout"\n        xmlns:core="sap.ui.core"\n        xmlns="sap.m"><Dialog\n            id="printLabelPropertyEditorDialog"\n            title="{lprI18n>printLabelPropertyEditor}"\n            class="sapUiPopupWithPadding"\n            resizable="true"\n            draggable="true"\n            contentWidth="1200px"\n            contentHeight="600px"><content><l:VerticalLayout><HBox width="100%" class="sapUiMediumMarginBottom sapUiSmallMarginTop" alignContent="Center" alignItems="Center"><VBox><Label text="{path: \'/labelDocName/description\'}:" labelFor="inputLabelDocName" /></VBox><VBox width="30%"><Input id="inputLabelDocName" class="sapUiTinyMarginBegin" width="100%"\n                               value="{path: \'/labelDocName/value\'}"/></VBox><VBox class="sapUiLargeMarginBegin"><Label text="{path: \'/labelDocVersion/description\'}:" labelFor="inputLabelDocVersion" /></VBox><VBox width="10%"><Input id="inputLabelDocVersion" class="sapUiTinyMarginBegin" width="100%"\n                               value="{path: \'/labelDocVersion/value\'}"/></VBox></HBox><HBox width="100%"><Table\n                        id="printLabelPropertyEditorTable"\n                        inset="false"\n                        backgroundDesign="Solid"\n                        sticky="HeaderToolbar,ColumnHeaders"\n                        mode="None"\n                        class="sapMesListCellHeight32 sapUiSizeCompact"\n                        items="{path: \'/customFields\'}"><headerToolbar><OverflowToolbar><content><Title text="{lprI18n>customFields}" level="H2"/></content></OverflowToolbar></headerToolbar><columns><Column hAlign="Begin" sortProperty="columnId" filterProperty="columnId" width="3%"><Text text="" wrapping="false"/></Column><Column hAlign="Begin"><Text text="{lprI18n>customFieldName}" wrapping="false"/></Column><Column hAlign="Begin"><Text text="{lprI18n>customFieldLabel}" wrapping="false"/></Column><Column hAlign="Begin" visible="{/isGR}"><Text text="{lprI18n>propertyValuePath}" wrapping="false" /></Column><Column hAlign="Begin" visible="{/isGR}" width="10%"><Text text="{lprI18n>readOnly}" wrapping="false" /></Column></columns><items><ColumnListItem><cells><Text text="{columnId}" /><Input value="{name}" maxLength="60"/><Input value="{label}"/><Select selectedKey="{propertyValuePath}" width="100%"><items><core:Item key="" text="" /><core:Item key="/&lt;index&gt;/batchNumber" text="{lprI18n>batchNumber}" /><core:Item key="/&lt;index&gt;/quantity/value" text="{lprI18n>quantity}" /><core:Item key="/&lt;index&gt;/quantity/unitOfMeasure/uom" text="{lprI18n>quantityUnit}" /></items></Select><Switch state="{readOnly}" /></cells></ColumnListItem></items></Table></HBox></l:VerticalLayout></content><buttons><Button id="closeButton" text="{i18n-global>close}" press="_handlePrintLabelPropertyEditorDialogClose"/></buttons></Dialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/ProductionProcessSelectionDialog.fragment.xml": '<core:FragmentDefinition\r\n\txmlns="sap.m"\r\n\txmlns:core="sap.ui.core"><TableSelectDialog\r\n\t\tnoDataText="{i18n>productionProcess.message.notFound}"\r\n\t\ttitle="{i18n>productionProcess.title.lbl}"\r\n\t\tliveChange=".onProductionProcessSelectionSearch"\r\n\t\tconfirm=".onProductionProcessItemSelected"\r\n\t\tcancel=".handleProductionProcessDialogClose"\r\n\t\tclass="sapMesListCellHeight32 sapUiSizeCompact"\r\n\t\tcontentWidth="1100px"\r\n    \tcontentHeight="500px"\r\n\t\titems="{\r\n\t\t\tpath : \'/\',\r\n            sorter: {path: \'name\', descending: false}\r\n\t\t}"><ColumnListItem><cells><ObjectIdentifier title="{name}"/><Text text="{displayName}" /><Text text="{description}" /></cells></ColumnListItem><columns><Column width="8em"><header><Text text="{i18n>productionProcess.column.name}" /></header></Column><Column width="12em"><header><Text text="{i18n>productionProcess.column.displayName}" /></header></Column><Column width="12em"><header><Text text="{i18n>productionProcess.column.description}" /></header></Column></columns></TableSelectDialog></core:FragmentDefinition>',
    "sap/dm/dme/podfoundation/fragment/SinglePluginSelectionDialog.fragment.xml": '<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n    xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"><SelectDialog\n\t    id="pluginSelectDialog"\n\t\tnoDataText="{i18n>noAvailableDataInPluginSelectionDialog}"\n\t\ttitle="{i18n>pluginSelectionDialog}"\n\t\tliveChange=".onSinglePluginSelectionSearch"\n\t\tgrowing="false"\n\t\tconfirm=".onPluginItemSelected"\n\t\tcancel=".onDialogClose"\n\t\tshowClearButton="false"\n\t\tclass="sapUiNoContentPadding"\n\t\titems="{\n            path: \'/Plugins\',\n            filters: {path: \'Rank\', operator: \'EQ\', value1: \'0\'}\n        }"><StandardListItem\n\t\t\tselected="{selected}"\n\t\t\ttitle="{title}"\n\t\t\thighlight="{highlight}"\n\t\t\ttype="Active" \n            app:pluginId="{plugin}"\n            app:title="{title}"/></SelectDialog></core:FragmentDefinition>\n\n',
    "sap/dm/dme/podfoundation/manifest.json": '{"_version":"1.21.0","sap.app":{"id":"sap.dm.dme.podfoundation","type":"library","embeds":[],"applicationVersion":{"version":"19.1.0"},"title":"POD Foundation library: sap.dm.dme.podfoundation","description":"POD Foundation library: sap.dm.dme.podfoundation","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_hcb","sap_belize_hcw","sap_belize_plus","sap_fiori_3","sap_fiori_3_dark","sap_hcb"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.108","libs":{"sap.ui.core":{"minVersion":"1.108.5"},"sap.dm.dme":{}}},"library":{"i18n":false,"content":{"controls":["sap.dm.dme.podfoundation.control.ActionButton","sap.dm.dme.podfoundation.control.ConfigurableButton","sap.dm.dme.podfoundation.control.DraggableListItem","sap.dm.dme.podfoundation.control.GroupButton","sap.dm.dme.podfoundation.control.ListPluginViewController","sap.dm.dme.podfoundation.control.NavigationButton","sap.dm.dme.podfoundation.control.PluginViewController","sap.dm.dme.podfoundation.control.IconTabBar","sap.dm.dme.podfoundation.control.IconTabFilter","sap.dm.dme.podfoundation.control.ProductionComponent","sap.dm.dme.podfoundation.control.ProductionUIComponent","sap.dm.dme.podfoundation.control.PropertyEditor","sap.dm.dme.podfoundation.control.StatusIconControl","sap.dm.dme.podfoundation.control.TableFactory","sap.dm.dme.podfoundation.control.TablePersoService","sap.dm.dme.podfoundation.extension.PluginExtension","sap.dm.dme.podfoundation.extension.PluginExtensionManager","sap.dm.dme.podfoundation.extension.PluginExtensionProvider","sap.dm.dme.podfoundation.extension.PluginExtensionType","sap.dm.dme.podfoundation.handler.ViewerHandler","sap.dm.dme.podfoundation.model.InputType","sap.dm.dme.podfoundation.model.ItemKeyData","sap.dm.dme.podfoundation.model.OperationKeyData","sap.dm.dme.podfoundation.model.PodSelectionModel","sap.dm.dme.podfoundation.model.ProcessLotKeyData","sap.dm.dme.podfoundation.model.ResourceKeyData","sap.dm.dme.podfoundation.model.Selection","sap.dm.dme.podfoundation.model.SfcKeyData","sap.dm.dme.podfoundation.model.ShopOrderKeyData","sap.dm.dme.podfoundation.model.UserPreferences","sap.dm.dme.podfoundation.popup.PopupHandler"],"elements":[],"types":[],"interfaces":[]}}}}'
});
//# sourceMappingURL=library-preload.js.map