# DMC POD Plugin With Local Development Environment

run `npm run start` to start the application in local environment

## Configure local-configs.json file
Refere dmc-local-app-router [documentation](https://www.npmjs.com/package/dmc-local-app-router#200-version) to configure the local-configs.json file with profiles 

## Calling Public API 
use below code to call the public api in controller.js file

get sfc details
```js
    let params = {
        plant: this.getPlant(),
        sfc: "" //enter sfc here
    }
    this.get('sfc/v1/sfcdetail',params)
    .then(res=>{
        console.log(res)
    })
    .catch(err=>{
        console.log(err)
    })
```

post API call

```js
    let payload = {
        plant: this.getPlant(),
        sfcs: [""] //enter sfc here
    }
    this.post('sfc/v1/start',payload)
    .then(res=>{
        console.log(res)
    })
    .catch(err=>{
        console.log(err)
    })
```

find other Ajax methods in BaseController.js file like `patch`,`put`,`delete`

## Calling Production Process
calling production process is same as calling public api like below or directly use this.callpp function

```js   
    let key ="" //production process key
    let payload = { } //your payload
    this.callpp(key, payload)
    .then(res=>{

    }).catch(err=>{
        console.log(err)
    })
```
or

```js
    let params = {
        key: "",//PP key, find it in manage service registry app
    }
    let payload = {
        //your PP payload
    }

    this.post('pe/api/v1/process/processDefinitions/start',payload,{},params)
    .then(res=>{
        console.log(res)
    })
    .catch(err=>{
        console.log(err)
    })
```

## using MDO Model
Mdo Model is available out of the box. you can access the MDO model using `this.mdoModel`. Also mdo model is set to View by default in Base controller with name 'mdo', which means it is available to use directly in the XML Views.

>mdov2.edmx file included in data folder. Install VS code extention 'SAP Mobile Services OData CSDL modeler' to visualize the MDO skima

sample using MDO Model in XML view
```xml
    <Table growing="true" growingScrollToLoad="true" items="{mdo>/SFC_PRODUCTION_EVENTS}" >
        <columns>
            <Column>
                <Label text="Plant"></Label>
            </Column>
            <Column>
                <Label text="SFC"></Label>
            </Column>
        </columns>
        <items>
            <ColumnListItem >
                <cells>
                    <Text text="{mdo>PLANT}" />
                    <Text text="{mdo>SFC}" />
                </cells>
            </ColumnListItem>
        </items>
    </Table>
```

## Calling the Public API through destination
By default `SAP_DMC_DEFAULT_SERVICE_KEY` is add with route /api, you can use it to make any public API's though destination using below sample code using ajax utility functions (check in utils/AjaxUtil.js file)

```js
    let url = this.getPluginBaseUri()+'api/sfc/v1/sfcdetail';
    let params ={
        plant:this.getPlant(),
        sfc:""
    }
    ajax.get(url,params)
    .then(res=>{
        console.log(res)
    })
    .catch(err=>console.error(err))
```

## Useful links

1. [DMC Custom plugin samples](https://github.com/SAP-samples/digital-manufacturing-extension-samples)
2. [POD Plugin Developer's Guide for View Plugins](https://help.sap.com/docs/sap-digital-manufacturing/pod-plugin-developer-s-guide/view-plugins)
3. [dmc-local-app-router module documentation](https://www.npmjs.com/package/dmc-local-app-router)

