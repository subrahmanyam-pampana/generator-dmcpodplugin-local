'use strict';
const childProcess = require('child_process');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the ${chalk.red('SAP Digital Manufacturing Cloud POD Plugin with local dev env V1.0.10')} generator!`
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'pluginName',
        message: 'What is the name of your plugin?',
        default: "testPlugin"
      },

      {
        type: "input",
        name: "version",
        message: "Version Number?",
        default: "0.0.1"
      },

      {
        type: "input",
        name: "host",
        message: "What is your DMC host name?",
        default: "yourhost.execution.eu20.dmc.cloud.sap"
      },
      {
        type: "input",
        name: "namespace",
        message: "What is your plugin namespace?",
        default: "company.custom.plugin.<pluginName>"
      },
      {
        type: "input",
        name: "cfUrl",
        message: "What is your clound foundary end point?",
        default: "https://api.cf.eu20.hana.ondemand.com/"
      },
      {
        type: "input",
        name: "meServiceUrl",
        message: "What is your manufacturing-execution-integration url?",
        default: "https://yourDomain-dme-integration-ms.cfapps.eu20.hana.ondemand.com"
      },
      {
        type: "input",
        name: "publicApiEndPoint",
        message: "What is your public-api-endpoint url?",
        default: "https://api.test.eu20.dmc.cloud.sap"
      },
      {
        type: "input",
        name: "oauthUrl",
        message: "What is your authorization token url?",
        default: "https://yourdomain.authentication.eu20.hana.ondemand.com"
      },
      {
        type: "input",
        name: "clientid",
        message: "What is your client id?"
      },
      {
        type: "input",
        name: "clientSecret",
        message: "What is your client secret?"
      },
      {
        type: "input",
        name: "userMailid",
        message: "What is your mail id to login?",
        default: "yourName@company.com"
      },
      {
        type: "input",
        name: "port",
        message: "Enter the localhost port",
        default: 8080
      },
      {
        type: "confirm",
        name: "workcenter",
        message: "Support WORK_CENTER PODS?",
        default: true
      },
      {
        type: "confirm",
        name: "operation",
        message: "Support OPERATION PODS?",
        default: true
      },
      {
        type: "confirm",
        name: "order",
        message: "Support ORDER PODS?",
        default: true
      },
      {
        type: "confirm",
        name: "custom",
        message: "Support CUSTOM PODS?",
        default: true
      },
      {
        type: "confirm",
        name: "line",
        message: "Support Line Monitor PODS?",
        default: true
      },
      {
        type: "confirm",
        name: "multiple",
        message: "Allow multiple instances?",
        default: true
      },
      {
        type: "confirm",
        name: "PP",
        message: "Production Process Enabled?",
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {

    let meServiceUrl = this.props.meServiceUrl.replace('integration', '#service#')
    this.fs.copyTpl(
      this.templatePath('local-configs.json'),
      this.destinationPath('local-configs.json'),
      {
        port: this.props.port,
        meServiceUrl: meServiceUrl,
        publicApiEndPoint: this.props.publicApiEndPoint,
        oauthUrl: this.props.oauthUrl,
        clientid: this.props.clientid,
        clientSecret: this.props.clientSecret
      }
    );

    this.fs.copyTpl(
      this.templatePath('xs-security.json'),
      this.destinationPath('xs-security.json'),
      { xsappname: this.props.pluginName }
    );

    this.fs.copyTpl(
      this.templatePath('mta.yaml'),
      this.destinationPath('mta.yaml'),
      { name: this.props.pluginName, host: this.props.host }
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      { name: this.props.pluginName, 
        cfUrl: this.props.cfUrl,
        userMailid:this.props.userMailid
       }
    );

    this.fs.copyTpl(
      this.templatePath('gitignore.txt'),
      this.destinationPath('.gitignore'),
      {}
    );

    this.fs.copyTpl(
      this.templatePath('template/xs-app.json'),
      this.destinationPath(this.props.pluginName + '/xs-app.json'),
      { name: this.props.pluginName }
    );

    this.fs.copyTpl(
      this.templatePath('template/package.json'),
      this.destinationPath(this.props.pluginName+'/package.json'),
      { name: this.props.pluginName}
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/index.html'),
      this.destinationPath(this.props.pluginName + '/webapp/index.html'),
      { name: this.props.pluginName, namespace: this.props.namespace }
    );

    var strPodTypes = "[";

    if (this.props.workcenter) { strPodTypes = strPodTypes + "\"WORK_CENTER\""; }
    if (this.props.workcenter && this.props.operation) { strPodTypes = strPodTypes + ","; }

    if (this.props.operation) { strPodTypes = strPodTypes + "\"OPERATION\""; }
    if (this.props.operation && this.props.order) { strPodTypes = strPodTypes + ","; }

    if (this.props.order) { strPodTypes = strPodTypes + "\"ORDER\""; }
    if (this.props.order && this.props.custom) { strPodTypes = strPodTypes + ","; }

    if (this.props.custom) { strPodTypes = strPodTypes + "\"OTHER\""; }

    var strPodTypes = strPodTypes + "]";


    this.fs.copyTpl(
      this.templatePath('template/webapp/designer/components.json'),
      this.destinationPath(this.props.pluginName + '/webapp/designer/components.json'),
      { name: this.props.pluginName, namespace: this.props.namespace, podTypes: strPodTypes }
    )

    //copying lib folder
    const libSource = this.templatePath('template/webapp/lib')
    const libDest = this.destinationPath(this.props.pluginName + '/webapp/lib')
    this.fs.copy(libSource, libDest);

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/serviceBinding.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/serviceBindings.js')
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/manifest.json'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/manifest.json'),
      { name: this.props.pluginName, namespace: this.props.namespace }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/Component.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/Component.js'),
      { name: this.props.pluginName, namespace: this.props.namespace }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/view/MainView.view.xml'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/view/MainView.view.xml'),
      { name: this.props.pluginName, namespace: this.props.namespace }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/model/models.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/model/models.js')
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/i18n/builder.properties'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/i18n/builder.properties'),
      { name: this.props.pluginName }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/i18n/i18n.properties'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/i18n/i18n.properties'),
      { name: this.props.pluginName }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/css/style.css'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/css/style.css')
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/controller/MainView.controller.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/controller/MainView.controller.js'),
      { name: this.props.pluginName, namespace: this.props.namespace,
        namespacePath:this.props.namespace.replaceAll('.','/')
       }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/controller/BaseController.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/controller/BaseController.js'),
      { name: this.props.pluginName, 
        namespace: this.props.namespace,
        namespacePath:this.props.namespace.replaceAll('.','/')
       }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/builder/PropertyEditor.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/builder/PropertyEditor.js'),
      { name: this.props.pluginName, namespace: this.props.namespace }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/builder/localPodConfigs.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/builder/localPodConfigs.js'),
      { name: this.props.pluginName }
    );

    this.fs.copyTpl(
      this.templatePath('template/webapp/template/data/localPodSelectionModelData.js'),
      this.destinationPath(this.props.pluginName + '/webapp/' + this.props.pluginName + '/data/localPodSelectionModelData.js'),
      { userMailid: this.props.userMailid }
    );

    //copying third party library folder
    const thirdPartyLibSource = this.templatePath('template/webapp/template/thirdPartyLib');
    const thirdPartyLibDest = this.destinationPath(`${this.props.pluginName}/webapp/${this.props.pluginName}/thirdPartyLib`);
    this.fs.copy(thirdPartyLibSource, thirdPartyLibDest);
  }

  install() {

  }

  end() {
    this.log(
      yosay(
        `All finished! Ready for you to add some cool functionality`
      )
    );
  }
};
