const express = require("express");
const fs = require('fs')
const bodyParser = require("body-parser");
const axios = require("axios");
const querystring = require('qs');
const open = require('opn');

const app = express();

const configs =JSON.parse(fs.readFileSync('server/configs.json'))
const port = configs.port;
const oDataservice = configs['manufacturing-execution-service']
const targetServerUrl = configs['public-api-endpoint'];
const authUrl = configs['auth-url']

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Serve the static files from the 'webapp' directory
app.use(express.static("<%= name %>/webapp"));

let oauthToken = "";

axios
  .post(
    authUrl,
    null,
    {
      params: {
        grant_type: "client_credentials",
        client_id:configs.clientId,
        client_secret:configs.clientSecret,
      },
    }
  )
  .then((tokenResponse) => {
    oauthToken = tokenResponse.data.access_token;
    axios.defaults.headers.common["Authorization"] = "Bearer " + oauthToken;
  });


app.get("/api/:servicePath*", (req, res) => {
  const targetPath = req.params.servicePath + (req.params[0] || "");
  const url = targetServerUrl + "/" + targetPath;

  console.log(url, req.query);

  axios.get(url, {
      params: req.query,
      headers: {
        Accept: "application/json",
      },
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error:", error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Request Error:", error.message);
        res.status(500).send("Internal Server Error:" + error);
      }
    });
});

app.post("/api/:servicePath*", async (req, res) => {
  try {

    const targetPath = req.params.servicePath + (req.params[0] || "");
    const url = new URL(targetPath, targetServerUrl);

    console.log(url.toString(), req.body);

    const response = await axios.post(url.toString(), req.body, {
      params:req.query,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Request Error:", error.message);
    
    if (error.response) {
      console.error("Error:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.put("/api/:servicePath*", async (req, res) => {
  try {

    const targetPath = req.params.servicePath + (req.params[0] || "");
    const url = new URL(targetPath, targetServerUrl);

    console.log(url.toString(), req.body);

    const response = await axios.put(url.toString(), req.body, {
      params:req.query,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json", // Specify the content type
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Request Error:", error.message);
    
    if (error.response) {
      console.error("Error:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.patch("/api/:servicePath*", async (req, res) => {
  try {

    const targetPath = req.params.servicePath + (req.params[0] || "");
    const url = new URL(targetPath, targetServerUrl);

    console.log(url.toString(), req.body);

    const response = await axios.patch(url.toString(), req.body, {
      params:req.query,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json", // Specify the content type
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Request Error:", error.message);
    
    if (error.response) {
      console.error("Error:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.get("/oData/:servicePath*", (req, res) => {
  const targetPath = extractEndpoint(req.params[0])
 
  console.log(targetPath)
  let service = extractService(targetPath)
  let url = oDataservice.replace('#service#',service) + targetPath;
  const host = oDataservice.replace('#service#',service)

 
  const serializedParams = querystring.stringify(req.query, {encode: false});
  url +="?"+serializedParams
  console.log(url);

  axios.get(url,{
      headers: {
        ...req.headers,
        Accept: req.headers.accept || "application/json",
        host:host
      }
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error:", error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Request Error:", error.message);
        res.status(500).send("Internal Server Error:" + error);
      }
    });
});
app.post("/oData/:servicePath*", (req, res) => {
  const targetPath = extractEndpoint(req.params[0])
 
  console.log(targetPath)
  let service = extractService(targetPath)
  const url = oDataservice.replace('#service#',service) + targetPath;
  const host = oDataservice.replace('#service#',service)

  console.log(url, req.query);
  axios.post(url,req.body,{
      params: req.query,
      headers: {
        ...req.headers,
        Accept: req.headers.accept || "application/json",
        host:host
      }
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error:", error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Request Error:", error.message);
        res.status(500).send("Internal Server Error:" + error);
      }
    });
});

function extractEndpoint(url) {
  let urlArray = url.split('/');
  let index;
  urlArray.forEach((element,i) => {
    if(element.indexOf('.svc')>0){
        index = i;
        return;
    }
  });

  urlArray.splice(0,index)
  return "/"+urlArray.join('/')

}

function extractService(input) {
  const regex = /([^\/]+)\.svc/;
  const match = input.match(regex);
  let service;
  
  if (match && match.length > 1) {
    service = match[1];
  }

  return service;
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  let url = `http://localhost:${port}`
  open(url).then(()=>{
    console.log("Opened UI5 App in browser", url)
  }).catch(err=>console.log(err))
});
