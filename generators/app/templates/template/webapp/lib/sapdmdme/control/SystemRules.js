sap.ui.define(["sap/ui/core/Control",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/table/Table",
    "sap/ui/model/json/JSONModel"
], function(Control, ODataModel, HorizontalLayout, Table, JSONModel) {
    "use strict";
    return Control.extend("sap.dm.dme.control.SystemRules", {
        metadata: {
            properties: {
                /**
                 * The following properties may be modified to use field values required by the oData Service.
                 * Once the oData service is available, the default properties below should be changed to the actual values.
                 *
                 * systemRuleCollection - the name of the object collection which contains the system rules.
                 * systemRuleOverridable - the system rule can be overriden (true) or not (false).  In such case that the value is false, the control will be disabled for modification.
                 * valueObjectType - Identifies the type of object to render, such as: S=String, I=Integer & B=Boolean (or list of items in JSON format).
                 * ruleValue - the value associated with the rule.
                 * ruleGlobalValue - The Global value associated with the current rule.
                 * rule - The rule to be displayed
                 *
                 * Usage Example:
                 * <mvc:View ... xmlns:comp="sap.dm.dme.control">
                 *
                 *  <content>
                    <comp:SystemRules id="systemRules"
                        systemRuleCollection="/SystemRuleCollection"
                        systemRuleOverridable="systemRuleOverridable"
                        valueObjectType="valueObjectType"
                        ruleValue="ruleValue"
                        ruleList="ruleList"
                        ruleGlobalValue="ruleGlobalValue"
                        rule="rule"
                        />
                </content>
                 **/
                systemRuleCollection: {
                    type: "string",
                    defaultValue: "/systemRulesCollection"
                },
                systemRuleOverridable: {
                    type: "string",
                    defaultValue: "overrideSetting"
                },
                valueObjectType: {
                    type: "string",
                    defaultValue: "valueObjectType"
                },
                ruleValue: {
                    type: "string",
                    defaultValue: "ruleValue"
                },
                ruleList: {
                    type: "string",
                    defaultValue: "systemRules"
                },
                ruleGlobalValue: {
                    type: "string",
                    defaultValue: "currentSiteSetting"
                },
                rule: {
                    type: "string",
                    defaultValue: "description"
                }
            },
            publicMethods: [
                "setJSONModel",
                "getSystemRuleModel",
                "setOdataModel"
            ],
            aggregations: {
                _table: {
                    type: "sap.ui.table.Table",
                    multiple: false,
                    visibility: "visible"
                },
                defaultAggregation: "content",
                events: {
                    currentModel: {
                        parameters: {
                            value: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        },

        /***
         * Wrap the Property value in curly brackets
         **/
        wrapProperty: function(sValue) {
            return "{" + sValue + "}";
        },

        /***
         * Sets the model as a JSON object
         **/
        setJSONModel: function(newModel) {
            let oModel = new JSONModel();
            oModel.setData(newModel);
            oModel.setDefaultBindingMode("TwoWay");
            this.setModel(oModel);
        },

        /***
         * Sets the model from an OData object
         **/
        setOdataModel: function(url) {
            let oModel = new sap.ui.model.odata.ODataModel(url, false);
            oModel.setDefaultBindingMode("TwoWay");
            sap.ui.getCore().setModel(oModel);
        },

        /***
         * Returns the Model
         **/
        getSystemRuleModel: function() {
            if (this.getModel() !== undefined) {
                let model = this.getModel().getProperty("/");
                return JSON.stringify(model);
            } else {
                return undefined;
            }
        },

        /***
         * Create the System Rule table
         **/
        createTable: function() {
            // Create the Table
            this.setAggregation("_table", new sap.ui.table.Table({
                enabled: true,
                enableSelectAll: false,
                visibleRowCountMode: "Interactive",
                // visibleRowCountMode: "Auto",
                enableColumnReordering: false,
                // selectionMode: "None",
                selectionMode: "None",
                rows: this.wrapProperty(this.getSystemRuleCollection())
            }));

            let oTable = this.getTable();
            // Create the columns for the table
            this.createTableColumns(oTable);
        },

        /**
         * Initialize the control
         **/
        init: function() {
            this.createTable();
        },

        /***
         * Assign the column template to render the rows based on the model
         **/
        assignColumnTemplate: function(oColumn) {
            let oTemplate = new sap.ui.core.Item({
                text: "{Text}"
            });
            oColumn.setTemplate(
                new sap.ui.layout.HorizontalLayout({
                    width: "auto",
                    flexible: true,
                    autoResizable: true,
                    templateShareable: false,
                    content: [
                        new sap.m.Input({
                            width: "215px",
                            flexible: true,
                            autoResizable: true,
                            value: this.wrapProperty(this.getRuleValue()),
                            enabled: {
                                path: this.getSystemRuleOverridable(),
                                formatter: function(v) {
                                    return !v || v.toString().toLowerCase() === "true";
                                }
                            },
                            visible: {
                                path: this.getValueObjectType(),
                                templateShareable: false,
                                formatter: function(v) {
                                    return v === "S";
                                }
                            }
                        }),
                        new sap.m.Select({
                            width: "215px",
                            flexible: true,
                            autoResizable: true,
                            enabled: {
                                path: this.getSystemRuleOverridable(),
                                formatter: function(v) {
                                    return !v || v.toString().toLowerCase() === "true";
                                }
                            },
                            value: this.wrapProperty(this.getRuleValue()),
                            visible: {
                                path: this.getValueObjectType(),
                                key: this.getRuleValue(),
                                templateShareable: false,
                                formatter: function(v) {
                                    return v === "B";
                                }
                            }
                        }).bindAggregation("items", this.getRuleList(), oTemplate),
                        new sap.m.Input({
                            width: "215px",
                            flexible: true,
                            autoResizable: true,
                            type: "Number",
                            value: this.wrapProperty(this.getRuleValue()),
                            enabled: {
                                path: this.getSystemRuleOverridable(),
                                formatter: function(v) {
                                    return !v || v.toString().toLowerCase() === "true";
                                }
                            },
                            visible: {
                                path: this.getValueObjectType(),
                                key: this.getRuleValue(),
                                templateShareable: false,
                                formatter: function(v) {
                                    return v === "I";
                                }
                            }
                        }),
                        new sap.m.MultiComboBox({
                            width: "215px",
                            flexible: true,
                            autoResizable: true,
                            value: this.wrapProperty(this.getRuleValue()),
                            enabled: {
                                path: this.getSystemRuleOverridable(),
                                formatter: function(v) {
                                    return !v || v.toString().toLowerCase() === "true";
                                }
                            },
                            visible: {
                                path: this.getValueObjectType(),
                                key: this.getRuleValue(),
                                templateShareable: false,
                                formatter: function(v) {
                                    return v === "Z";
                                }
                            }
                        }).bindAggregation("items", this.getRuleList(), oTemplate)
                    ]
                })
            );
        },

        /**
         * Get the Table Aggregate
         */
        getTable: function() {
            return this.getAggregation("_table");
        },

        /***
         * Create the Columns for the Custom Control
         */
        createTableColumns: function(oTable) {
            oTable.addColumn(new sap.ui.table.Column({
                resizable: false,
                label: new sap.m.Label({
                    text: "{i18n>systemRule.Name}"
                }),
                template: new sap.m.Text().bindProperty(
                    "text", this.getRule()
                )
            }));
            oTable.addColumn(new sap.ui.table.Column({
                resizable: false,
                label: new sap.m.Label({
                    text: "{i18n>systemRule.Value}"
                }),
                template: new sap.m.Text().bindProperty(
                    "text", this.getRuleValue()
                )
            }));
            this.assignColumnTemplate(this.getTable().getColumns()[1]);

            oTable.addColumn(new sap.ui.table.Column({
                resizable: false,
                label: new sap.m.Label({
                    text: "{i18n>systemRule.GlobalValue}"
                }),
                template: new sap.m.Text().bindProperty(
                    "text", this.getRuleGlobalValue()
                )
            }));
        },

        /**
         * Render the Component
         */
        renderer: function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            // oRm.addClass("sapUiSmallMarginBeginEnd");
            oRm.addClass("sapUiSmallMarginBeginEnd");
            oRm.addClass("sapUiSmallMarginTopBottom");

            oRm.writeClasses();
            oRm.write(">");
            oRm.renderControl(oControl.getAggregation("_table"));
            oRm.write("</div>");
        }

    });
});