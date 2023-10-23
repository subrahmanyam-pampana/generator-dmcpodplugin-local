# generator-dmcpodplugin-local
By Using this yomen generator you can create SAP DMC POD Plugins easy and can also run locally

## Installation

First, install [Yeoman](http://yeoman.io) and generator-dmcpodplugin-local using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-dmcpodplugin-local
```
## Prerequisites
Keep below configurations handy before generating the templete code

1. `User Email` email with access to sap dmc
2. `host` your sap dmc host address. ex: 'yourhost.execution.eu20.dmc.cloud.sap'
3. `cf endpoint url` cloud foundary endpoint url. you can get from your BTP subaccount page
4. `manufacturing-execution-integration server url` you can find it in servece key configuration file
5. `public-api-endpoint` you can find it in servece key configuration file under uaa section
6. `authorization token url` you can find it in servece key configuration file under uaa section as 'url'
7. `clientid` you can find it in servece key configuration file under uaa section as 'clientid'
8. `clientsecret` you can find it in servece key configuration file under uaa section as 'clientsecret'

## Generating Your Project

To create a new project using this generator, follow these steps:

1. Open your terminal or command prompt.

2. Run the generator using the following command:

```bash
yo dmcpodplugin-local
```
3. The generator will prompt you to answer questions. Provide the required information, and it will generate the template code based on your responses.

Answer all the promts to generate the template code.

## (optional)Installing build and deploy dependencies for vs code 
if you are using BTP for developing the plugin this section is completely optional as BTP already have build and deploy tools preinstalled.

if you are using local system and vs code, then you need to install below dependecies to build the plugin and deploy it to BTP Space.

### steps for Windows Users
1. open command promt
2. check choco exist in windows by running `choco -v` command
3. if exist run below command in Power shell to install make. in case not exist download and install choco from [official website](https://chocolatey.org/install#individual)
4. run `choco install make` to install make


### steps for Mac Users
1. Open terminal
2. Install make by running `brew install make`

### Common steps
1. Download and Install clound foundary cli from [official git repo](https://github.com/cloudfoundry/cli/blob/main/doc/installation-instructions/installation-instructions-v7.md#installers-and-compressed-binaries)
2. Install dependency mbt and multiapps
```bash
    npm install -g mbt
    cf install-plugin multiapps
```
3. Create new Folder and Open it in Vs code
4. Open new terminal and run below command and answer all the promts to generate the template code
```bash
yo dmcpodplugin-local
```
5. Once the template is ready, open terminal and run `npm run start`. this will start the application in localhost.
6. To Build the App, run `npm run build`. This will build the app and genrate new .mtar file in 'mta_archives' folder
7. Before deploying the app, we have to login to cloud foundary. So run `npm run login` command and give your password and then select your org and space. 
you can default the org and space by mentioning addtional arguments to command in package.json file like below. for more commands check [cf docs](https://docs.cloudfoundry.org/cf-cli/getting-started.html#login)

```bash
{
    .......
    "scripts":{
        .................
        "login":"cf login -a https://api.cf.eu10.hana.ondemand.com/ -u subrahmanyam@myComapny.com -o <your org> -s <your dev space>"
        ...................
    }
    ......
}

```

8. run `npm run deploy` to deploy the plugin to BTP Space.
9. you can run build and deploy commands together  using `npm run bd` command.
10. Please follow the [blog](https://blogs.sap.com/2022/04/11/building-a-custom-digital-manufacturing-cloud-pod-plugin-the-easy-way/) to configure the plugin in SAP DMC.

**Note**: cf login session is valid until you kill the terminal. So you don't need to run `npm run login` command everytime you deploy the app.




## License

his generator is open-source software and is provided under the Apache License 2.0. For the full license details, please refer to the LICENSE file included with this generator.


## About the Author

**Author:** Subrahmanyam Pampana

**Contact:** [subrahmanyam.pampana.28@gmail.com](mailto:subrahmanyam.pampana.28@gmail.com)

**About Subrahmanyam Pampana:**

Subrahmanyam Pampana is a software engineer with a passion for developing tools and utilities that make developers' lives easier.This Yeoman generator was created as a result of his experience in working with SAP DMC and the desire to simplify the plugin creation process. This is the Extention to the [dmcpodplugin generator](https://www.npmjs.com/package/generator-dmcpodplugin?activeTab=readme) created by [kevinhunter12](https://www.npmjs.com/~kevinhunter12) with local development support.


For more information or support, please contact [Subrahmanyam Pampana](https://www.linkedin.com/in/subrahmanyam-pampana-411660146/)


