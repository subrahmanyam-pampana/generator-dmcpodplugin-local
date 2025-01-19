# DMC POD Plugin With Local Development Environment

run `npm run start` to start the application in local environment

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
```


find other Ajax methods in BaseController.js file like `patch`,`put`,`delete`

## Calling Production Process
calling production process is same as calling public api like below

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
```

## using MDO Model
Mdo Model is available out of the box. you can access the MDO model using `this.mdoModel`. Also mdo model is set to View by default with name 'mdo', which means it is available to use directly in the XML Views.

>mdov2.edmx file included in data folder. Install VS code extention 'SAP Mobile Services OData CSDL modeler' to visualize the MDO skima

sample using MDO Model in XML view
```xml
    <Table>
        <columns>
            <>
        </columns>

    </Table>
```


