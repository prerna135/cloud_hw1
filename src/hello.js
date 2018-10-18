var apigClientFactory = require('aws-api-gateway-client').default;
var config = {
  apiKey : 'Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91',
  invokeUrl : 'https://bt3rsxq007.execute-api.us-west-2.amazonaws.com/test'
};
var apigClient = apigClientFactory.newClient(config);

var messages = [], lastUserMessage = "",
  botMessage = "Kucch toh bolo",
  botName = 'Chatbot';


function chatbotResponse() {
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