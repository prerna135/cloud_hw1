import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'
const REGION = "us-west-2";
const USER_POOL_ID = 'us-west-2_0pbBNuSKk';
const CLIENT_ID = '3d5ptsm32jnpln89d2rs4p7hsj';
const IDENTITY_POOL_ID = 'us-west-2:4b6b2e57-e660-466a-9800-7b2206ddce1c';
var AWS = require('aws-sdk');

var poolData = {
  UserPoolId : USER_POOL_ID,
  ClientId : CLIENT_ID
};

var messages = [],
lastUserMessage = "",
botMessage = "Kucch toh bolo",
botName = 'Chatbot';
var loggedIn = false;
var config = {};
var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = null;

function login() {
    var authenticationData = {
    Username : 'pk2600@columbia.edu',
    Password : 'Qwerty123#',
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Username : 'pk2600@columbia.edu',
    Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
        console.log(result);
        var accessToken = result.getAccessToken().getJwtToken();
        var idToken = result.getIdToken().getJwtToken();

        //POTENTIAL: Region needs to be set if not already set previously elsewhere.
        AWS.config.region = REGION;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : IDENTITY_POOL_ID, // your identity pool id here
            Logins : {
                // Change the key below according to the specific region your user pool is in.
                'cognito-idp.us-west-2.amazonaws.com/us-west-2_0pbBNuSKk' : idToken
            }
        });

        //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        AWS.config.credentials.refresh((error) => {
            if (error) {
                 console.error(error);
            } else {
                 // Instantiate aws sdk service objects now that the credentials have been updated.
                 // example: var s3 = new AWS.S3();
                  console.log('Successfully logged!');
                  loggedIn = true;
            }
        });
    },
    onFailure: function(err) {
        alert(err.message || JSON.stringify(err));
    },

  });
}

function getCurrentUser() {
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('session validity: ' + session.isValid());
            cognitoUser.getUserAttributes(function(err, attributes) {
                if (err) {
                    console.log('unable to get user attributes');
                } else {
                    console.log('got user attributes');
                }
            });
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : IDENTITY_POOL_ID,
                Logins : {
                    'cognito-idp.us-west-2.amazonaws.com/us-west-2_0pbBNuSKk' : session.getIdToken().getJwtToken()
                }
            });
            config = {
              apiKey : 'Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91',
              invokeUrl : 'https://bt3rsxq007.execute-api.us-west-2.amazonaws.com/test',
              region : REGION,
              accessKey : AWS.config.credentials.accessKeyId, // REQUIRED
              secretKey : AWS.config.credentials.secretAccessKey, // REQUIRED
              sessionToken : AWS.config.credentials.sessionToken
            };
            apigClient = apigClientFactory.newClient(config);
        });
    }
}

function chatbotResponse(argument) {
  if(loggedIn === false) {
    login();
  }
  getCurrentUser();
 if (document.getElementById("chatbox").value !== "") {
    lastUserMessage = document.getElementById("chatbox").value;
    messages.push(lastUserMessage);
    document.getElementById("chatbox").value = "";
    var params = {};
    var additionalParams = {
      headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true,
        "Access-Control-Allow-Methods" : "'GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept",
        "Content-Type" : "application/json",
      },
      queryParams: {}
    };
    var body = {
      "question" : lastUserMessage,
    };
    apigClient.invokeApi(params, '/chatbot', 'POST', additionalParams, body).then(function(result) {
      console.log("Sucessfully got chatbot response")
      botMessage = String(result.data.answer);
      console.log(botMessage);
      messages.push("<b>" + botName + ":</b> " + botMessage);
      for (var i = 1; i < 8; i++) {
        if (messages[messages.length - i])
          document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
      }
    }).catch(function(result) {
      console.error("Chatbot response failure")
    });
  }
}
//runs the keypress() function when a key is pressed
document.onkeypress = keyPress;
//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key === 13 || key === 3) {
    //runs this function when enter is pressed
    chatbotResponse();
  }
  if (key === 38) {
    console.log('hi')
  }
}

//clears the placeholder text ion the chatbox
//this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}
