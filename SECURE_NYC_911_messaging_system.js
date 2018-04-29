/*
911 Messaging System
*/
var client = require('twilio')(  //Calling Twillion API to use their messaging service
  '',//please don't steal my account...I have to pay for it...
  ''
);
var express = require('express');  
/* 
Express is an addon that allows Node.js to run web application on the server.
Web Applications cab be run through the pm2 commands.
There should be a list of pm2 commands in  your home directory.
*/
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
/* 
Watson conversation links Watson API to our program. 
This segment is required to connect the program to the IBM's API.
*/
var app = express();
/*
Creating new exress application process.
*/
var contexts = [];  //variable array that holds our data in.
app.get('/smssent', function (req, res) 
/*
"app" calls our application process.
".get" is a method that our data was sent to the server.
    *GET is more open and can be seen via anyone, I will change it later to the POST.
    *POST is more secure but it we will need additional modules to decrypt the data.
"req" is for requested data, aka data that comes in.
"res" is for response data, aka data that is going to be sent to the user.
"/smssent" is an extenstion of the port, port is specified on the bottom of a page in "port.listen()".
  *smssent is just like any other variable and can be changed on a fly.
  *smssent is bound to Twillio input.
"function " declares a new function with two qrguments, req and req.
*/
{
  var message = req.query.Body;    
  var number = req.query.From;
  var twilioNumber = req.query.To;
  /* 
  Twilio sends several packages of data in separate variables.
  Items such as: Body, Country, State, etc.
  We are only interested in this 3 (for now)
      *Body (what was sent to us, aka the message or text)
      *From (who it was sent from from, aka the user)
      *To (who was it sent to, aka final destination or server)
  */
  //console.log(message); 
  /*
  consol.log output data to the screen when NODE.js is running.
  This allows us to debugg and look at the data being sent
  */
  var intent_checker = false;
  var context = null;  //variable for the context
  var index = 0;  //Variable to track users
  var contextIndex = 0;

  function send_message(argument)
  {
    client.messages.create({ //sending a response back to the user
      from: twilioNumber, //out twillio number
      to: number,//to user
      body: argument
      })
  }
  contexts.forEach(function(value) {  //similar to PHP, for each function does the function for every new request
    //console.log(value.from);
    if (value.from == number) 
    {  //if the user has texted before in this session
      context = value.context;
      contextIndex = index;
    }
    index = index + 1; //making sure that every user gets a unique session
  });//end of the user checking loop
  console.log('Recieved message from ' + number + ' saying \'' + message  + '\'');  //this allows me to see who sent what
  var conversation = new ConversationV1({   //API Call to Watson conversation
    username: '',  //please don't steal my log-in...
    password: '',
    version_date: ConversationV1.VERSION_DATE_2017_05_26 //this is important, because it won't work if it's outdated (I tried...)
  });//end of Watson Conversation API Code
  if (context != null)
  {
    //console.log(JSON.stringify(context)); //used for debugging
  }
/*
This is where things get complicated, so bare with me...
I am converting Java Script values into JSON.
JSON files are used by several NoSQL databases like MongoDB.
Unlike SQL, the data is erraged in a file instead of a collection of tables.
This allows for faster data access and easier replecation.
*/
/*
  if (contexts.length != 0)
  {
    console.log(contexts.length); //outputs the length
  }
  */
  conversation.message(
    {  //Conversation is a new variable created  by us and a function assigned by Watson Conversation
    input: 
    { 
        text: message 
    }, //text is a type, message is a variable previously binded to the inout of a user
    workspace_id: '', //our project ID aka Foodpall (will most likely change really soon)
    context: context //context is gonna allow us to see who sent it
   }, function(err, response) 
   { //if there is an issue, print error
       if (err) 
       {
         console.error(err);
       } 
       else 
       { //if there is no issue - output what was sent
         console.log("Server Response: ",response.output.text[0]);
         if (context == null) 
         {//if user is new - output the message and number
           contexts.push({'from': number, 'context': response.context});
         } else 
         {
           contexts[contextIndex].context = response.context;
         }
         /*
if (response.intents[0].intent != null)
{
intent = response.intents[0].intent;
}
*/
//This is a function that is going to allow us to manipulate intents, but I didn't have time to learn about it yet
if (intent_checker == false)
{
         client.messages.create(
           { //sending a response back to the user
           from: twilioNumber, //out twillio number
           to: number,//to user
           body: (response.output.text[0])
         }, function(err, message) 
         {
           if(err) 
           {
             console.error(err.message);//if can't send - eror
           }
         });
        }
       }
  });
  res.send('');
});
app.listen(10083, function () { //waiting for the call on that port
  console.log('Waiting for Messages: (On Port: 10083) '); // when it boots up, this message will appear to indicate that the program is running
});