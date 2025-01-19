sap.ui.define([],function(){
    let localPodSelectionData = {
        /**
         * login data won't be available in actual pod selection model.
         * only be available in local pod selection model
         * add any other props in this section and respective private methods in LocalPodSelection.js model file
         */
        loginData:{
            plant:"<%= plant%>",
            userId:"<%= userMailid%>"
        },
        /**
         * update the below data from pod selection model. get this data from developer tools console while running the app in DM
         * below data will be used while running the app in local
         */
        "selections": [
            {
                "input": "",
                "customFields": {
                    "ITEM.INJECTIONPRESSURE": "",
                },
                "sfc": {
                    "ref": "",
                    "site": "",
                    "sfc": ""
                },
                "shopOrder": {
                    "ref": "",
                    "site": "",
                    "shopOrder": ""
                },
                "processLot": {
                    "ref": "",
                    "processLot": null
                },
                "item": {
                    "ref": "",
                    "site": "",
                    "item": "",
                    "version": ""
                },
                "sfcData": {
                    "sfc": "",
                    "quantity": "",
                    "statusCode": "",
                    "completePending": "",
                    "material": "",
                    "materialVersion": "",
                    "materialAndVersion": "",
                    "materialDescription": "",
                    "routing": "",
                    "routingVersion": "",
                    "routingType": "",
                    "operation": "",
                    "stepId": "",
                    "workCenter": "",
                    "resource": null
                }
            }
        ],
        "operations": [
            {
                "sfc": "",
                "sfcStepHandle": "",
                "stepId": "",
                "routing": "",
                "routingType": "",
                "routingRevision": "",
                "routingSequence": 0,
                "stepDescription": "",
                "statusDescription": "",
                "reworkFlag": null,
                "priority": "",
                "quantity": 0,
                "quantityComplete": 0,
                "quantityInQueue": 0,
                "quantityInWork": 0,
                "quantityReject": 0,
                "quantityCompletePending": 0,
                "workCenter": null,
                "endItem": null,
                "previouslyStarted": "",
                "dateTimeQueued": "",
                "dueDatetime": null,
                "material": "",
                "materialRevision": "",
                "processLot": null,
                "operation": "",
                "operationRevision": "",
                "operationGroup": null,
                "operationRef": "",
                "assignedUsers": "",
                "riskEvent": null,
                "info": null,
                "customFields": {},
                "laboredOperators": null,
                "statusNew": false,
                "statusBypassed": false,
                "statusInQueue": false,
                "statusInWork": false,
                "statusComplete": false,
                "statusCompletePending": false,
                "statusInQueueRework": true,
                "statusInWorkRework": false,
                "statusCompletePendingRework": false,
                "statusInQueueReject": false,
                "statusInWorkReject": false,
                "statusCompletePendingReject": false,
                "statusEmpty": false,
                "statusesNumber": 1,
                "operationScheduleStartDate": null,
                "operationScheduleEndDate": null,
                "plannedStartDate": null,
                "plannedEndDate": null,
                "splitId": null,
                "opSplitId": null,
                "splitQuantity": null,
                "display": false,
                "resource": null,
                "resourceType": null,
                "operationStepId": "",
                "materialAndRevision": "",
                "status": "",
                "statusCode": {
                    "statusNew": false,
                    "statusBypassed": false,
                    "statusInQueue": false,
                    "statusInWork": false,
                    "statusComplete": false,
                    "statusCompletePending": false,
                    "statusInQueueRework": true,
                    "statusInWorkRework": false,
                    "statusCompletePendingRework": false,
                    "statusInQueueReject": false,
                    "statusInWorkReject": false,
                    "statusCompletePendingReject": false
                },
                "version": ""
            }
        ],
        "components": [],
        "distinctSelections": [
            {
                "input": "",
                "customFields": {
                    "ITEM.INJECTIONPRESSURE": ""
                },
                "sfc": {
                    "ref": "",
                    "site": "",
                    "sfc": ""
                },
                "shopOrder": {
                    "ref": "",
                    "site": "",
                    "shopOrder": ""
                },
                "processLot": {
                    "ref": "",
                    "processLot": null
                },
                "item": {
                    "ref": "",
                    "site": "",
                    "item": "598286CZ-17",
                    "version": "ERP001"
                },
                "sfcData": {
                    "sfc": "",
                    "quantity": "",
                    "statusCode": "",
                    "completePending": "",
                    "material": "",
                    "materialVersion": "",
                    "materialAndVersion": "",
                    "materialDescription": "",
                    "routing": "",
                    "routingVersion": "",
                    "routingType": "",
                    "operation": "",
                    "stepId": "",
                    "workCenter": "",
                    "resource": null
                }
            }
        ],
        "selectedWorkCenters": [],
        "selectedRoutingSteps": [
            {
                "routing": "",
                "routingVersion": "",
                "routingType": "",
                "operation": "",
                "stepId": ""
            }
        ],
        "shopOrders": [],
        "podType": "WORK_CENTER",
        "podSelectionType": "WORK_CENTER",
        "inputType": "SFC",
        "worklistType": "SFC",
        "user": "",
        "substepGroup": "",
        "workCenter": "",
        "orderId": "",
        "endUnit": "",
        "quantity": null,
        "currentComponentIndex": -1,
        "downtimeTypeToShow": "",
        "selectedWorklistOperations": [
            {
                "sfc": "",
                "material": "",
                "materialDescription": "",
                "materialRevision": "",
                "materialAndRevision": "",
                "materialGroup": null,
                "routing": "",
                "routingType": "",
                "routingRevision": "",
                "routingSequence": null,
                "routingAndRevision": "",
                "shopOrder": "",
                "shopOrderType": "",
                "shopOrderBatchNumber": null,
                "workCenter": "",
                "rmaNumber": null,
                "processLot": null,
                "statusCode": "",
                "statusDescription": "",
                "priority": "",
                "quantity": "",
                "quantityInQueue": "",
                "quantityInWork": null,
                "quantityCompletePending": "",
                "completePending": "False",
                "startDate": null,
                "datetimeQueued": "2024-12-09T18:12:25Z",
                "dueDatetime": "2024-08-24T14:56:08Z",
                "orderScheduledStartDatetime": "2024-08-24T14:53:30Z",
                "orderPlannedStartDatetime": "2024-08-24T14:55:08Z",
                "orderScheduledCompleteDatetime": "2024-08-26T14:53:34Z",
                "shopFloorScheduledStartDate": null,
                "shopFloorScheduledCompletionDate": null,
                "operationScheduledStartDate": null,
                "operationScheduledCompletionDate": null,
                "operationPlannedStartDate": null,
                "operationPlannedCompletionDate": null,
                "operation": "",
                "operationDescription": null,
                "operationGroup": null,
                "stepID": "10",
                "resource": null,
                "resourceSchedule": null,
                "customer": null,
                "customerOrder": null,
                "customFields": "{\"ITEM.INJECTIONPRESSURE\":\"\"}",
                "laboredOperators": "[]",
                "@$ui5.context.isSelected": true
            }
        ],
        "selectedPhaseWorkCenter": "",
        "requiredValuesLoaded": true,
        "inputValue": "",
        "resource": {
            "ref": "",
            "site": "",
            "resource": ""
        },
        "badgedInUser": ""
    }
    return localPodSelectionData;
}) 