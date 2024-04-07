const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the ${chalk.red(
          "SAP Digital Manufacturing Cloud POD Plugin with local dev env",
        )} generator!`,
      ),
    );

    const prompts = [
      {
        type: "input",
        name: "pluginName",
        message: "Enter Plugin Id",
        default: "testplugin",
      },
      {
        type: "input",
        name: "pluginDisplayName",
        message: "Enter Plugin Display Name in Pod Designer",
        default: "Test Plugin",
      },
      {
        type: "input",
        name: "version",
        message: "Version Number",
        default: "0.0.1",
      },

      {
        type: "input",
        name: "host",
        message: "Enter your DMC host name",
        default: "yourhost.execution.eu20.dmc.cloud.sap",
      },
      {
        type: "input",
        name: "namespace",
        message: "Enter Plugin Namespace",
        default: "<company>.custom.plugin.<pluginName>",
      },
      {
        type: "input",
        name: "cfUrl",
        message: "Enter Clound foundary end point",
        default: "https://api.cf.eu20.hana.ondemand.com/",
      },
      {
        type: "input",
        name: "meServiceUrl",
        message: "Enter manufacturing-execution-integration url(optional)",
        default:
          "https://yourDomain-dme-integration-ms.cfapps.eu20.hana.ondemand.com",
      },
      {
        type: "input",
        name: "publicApiEndPoint(you can change this latter in local-configs.json file)",
        message: "Enter public-api-endpoint url",
        default: "https://api.test.eu20.dmc.cloud.sap",
      },
      {
        type: "input",
        name: "oauthUrl",
        message:
          "Enter Authorization token url (you can change this latter in local-configs.json file)",
        default: "https://yourdomain.authentication.eu20.hana.ondemand.com",
      },
      {
        type: "input",
        name: "clientid (you can change this latter in local-configs.json file)",
        message: "Enter client id",
      },
      {
        type: "input",
        name: "clientSecret (you can change this latter in local-configs.json file)",
        message: "Enter client secret",
      },
      {
        type: "input",
        name: "userMailid",
        message: "Enter your mail id to login",
        default: "yourName@company.com",
      },
      {
        type: "input",
        name: "port",
        message:
          "Enter localhost port number (you can change this latter in local-configs.json file)",
        default: 8080,
      },
      {
        type: "confirm",
        name: "workcenter",
        message: "Support WORK_CENTER PODS?",
        default: true,
      },
      {
        type: "confirm",
        name: "operation",
        message: "Support OPERATION PODS?",
        default: true,
      },
      {
        type: "confirm",
        name: "order",
        message: "Support ORDER PODS?",
        default: true,
      },
      {
        type: "confirm",
        name: "custom",
        message: "Support CUSTOM PODS?",
        default: true,
      },
      {
        type: "confirm",
        name: "line",
        message: "Support Line Monitor PODS?",
        default: true,
      },
      {
        type: "confirm",
        name: "multiple",
        message: "Allow multiple instances?",
        default: true,
      },
      {
        type: "confirm",
        name: "PP",
        message: "Production Process Enabled?",
        default: false,
      },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = props;
    });
  }

  writing() {
    const meServiceUrl = this.props.meServiceUrl.replace(
      "integration",
      "#service#",
    );
    this.fs.copyTpl(
      this.templatePath("local-configs.json"),
      this.destinationPath("local-configs.json"),
      {
        port: this.props.port,
        meServiceUrl,
        publicApiEndPoint: this.props.publicApiEndPoint,
        oauthUrl: this.props.oauthUrl,
        clientid: this.props.clientid,
        clientSecret: this.props.clientSecret,
      },
    );

    this.fs.copyTpl(
      this.templatePath("xs-security.json"),
      this.destinationPath("xs-security.json"),
      { xsappname: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("mta.yaml"),
      this.destinationPath("mta.yaml"),
      { name: this.props.pluginName, host: this.props.host },
    );

    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath("package.json"),
      {
        name: this.props.pluginName,
        cfUrl: this.props.cfUrl,
        userMailid: this.props.userMailid,
      },
    );

    this.fs.copyTpl(
      this.templatePath("gitignore.txt"),
      this.destinationPath(".gitignore"),
      {},
    );

    this.fs.copyTpl(
      this.templatePath("template/xs-app.json"),
      this.destinationPath(this.props.pluginName + "/xs-app.json"),
      { name: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("template/package.json"),
      this.destinationPath(this.props.pluginName + "/package.json"),
      { name: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("template/ui5.yaml"),
      this.destinationPath(this.props.pluginName + "/ui5.yaml"),
      { name: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/index.html"),
      this.destinationPath(this.props.pluginName + "/webapp/index.html"),
      { name: this.props.pluginName, namespace: this.props.namespace },
    );

    let strPodTypes = "[";

    if (this.props.workcenter) {
      strPodTypes += '"WORK_CENTER"';
    }

    if (this.props.workcenter && this.props.operation) {
      strPodTypes += ",";
    }

    if (this.props.operation) {
      strPodTypes += '"OPERATION"';
    }

    if (this.props.operation && this.props.order) {
      strPodTypes += ",";
    }

    if (this.props.order) {
      strPodTypes += '"ORDER"';
    }

    if (this.props.order && this.props.custom) {
      strPodTypes += ",";
    }

    if (this.props.custom) {
      strPodTypes += '"OTHER"';
    }

    strPodTypes += "]";

    this.fs.copyTpl(
      this.templatePath("template/webapp/designer/components.json"),
      this.destinationPath(
        this.props.pluginName + "/webapp/designer/components.json",
      ),
      {
        name: this.props.pluginName,
        namespace: this.props.namespace,
        podTypes: strPodTypes,
      },
    );

    // Copying lib folder
    const libSource = this.templatePath("template/webapp/lib");
    const libDest = this.destinationPath(this.props.pluginName + "/webapp/lib");
    this.fs.copy(libSource, libDest);

    this.fs.copyTpl(
      this.templatePath("template/webapp/manifest.json"),
      this.destinationPath(this.props.pluginName + "/webapp/manifest.json"),
      { name: this.props.pluginName, namespace: this.props.namespace },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/Component.js"),
      this.destinationPath(this.props.pluginName + "/webapp/Component.js"),
      { name: this.props.pluginName, namespace: this.props.namespace },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/view/MainView.view.xml"),
      this.destinationPath(
        this.props.pluginName + "/webapp/view/MainView.view.xml",
      ),
      { name: this.props.pluginName, namespace: this.props.namespace },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/model/models.js"),
      this.destinationPath(this.props.pluginName + "/webapp/model/models.js"),
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/i18n/builder.properties"),
      this.destinationPath(
        this.props.pluginName + "/webapp/i18n/builder.properties",
      ),
      {
        name: this.props.pluginName,
        displayName: this.props.pluginDisplayName,
      },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/i18n/builder_en.properties"),
      this.destinationPath(
        this.props.pluginName + "/webapp/i18n/builder_en.properties",
      ),
      {
        name: this.props.pluginName,
        displayName: this.props.pluginDisplayName,
      },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/i18n/i18n.properties"),
      this.destinationPath(
        this.props.pluginName + "/webapp/i18n/i18n.properties",
      ),
      { name: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/css/style.css"),
      this.destinationPath(this.props.pluginName + "/webapp/css/style.css"),
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/controller/MainView.controller.js"),
      this.destinationPath(
        this.props.pluginName + "/webapp/controller/MainView.controller.js",
      ),
      {
        name: this.props.pluginName,
        namespace: this.props.namespace,
        namespacePath: this.props.namespace.replaceAll(".", "/"),
      },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/controller/BaseController.js"),
      this.destinationPath(
        this.props.pluginName + "/webapp/controller/BaseController.js",
      ),
      {
        name: this.props.pluginName,
        namespace: this.props.namespace,
        namespacePath: this.props.namespace.replaceAll(".", "/"),
      },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/builder/PropertyEditor.js"),
      this.destinationPath(
        this.props.pluginName + "/webapp/builder/PropertyEditor.js",
      ),
      { name: this.props.pluginName, namespace: this.props.namespace },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/builder/localPodConfigs.js"),
      this.destinationPath(
        this.props.pluginName + "/webapp/builder/localPodConfigs.js",
      ),
      { name: this.props.pluginName },
    );

    this.fs.copyTpl(
      this.templatePath("template/webapp/data/localPodSelectionModelData.js"),
      this.destinationPath(
        this.props.pluginName + "/webapp/data/localPodSelectionModelData.js",
      ),
      { userMailid: this.props.userMailid },
    );

    // Copying third party library folder
    const thirdPartyLibSource = this.templatePath(
      "template/webapp/thirdPartyLib",
    );
    const thirdPartyLibDest = this.destinationPath(
      `${this.props.pluginName}/webapp/thirdPartyLib`,
    );
    this.fs.copy(thirdPartyLibSource, thirdPartyLibDest);
  }

  install() {}

  end() {
    this.log(
      yosay(`All finished! Ready for you to add some cool functionality`),
    );
  }
};
