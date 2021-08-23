var express = require('express');
var router = express.Router();

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Initialize WebHooks module.
//var WebHooks = require('node-webhooks');
var WebHooks = require('./webhook')

// Initialize webhooks module from on-disk database
var webHooks = new WebHooks({
  db: './data/webHooksDB.json', // json file that store webhook URLs
  httpSuccessCodes: [200, 201, 202, 203, 204], //optional success http status codes
})

var emitter = webHooks.getEmitter()
 
emitter.on('*.success', function (shortname, statusCode, body) {
    console.log('Success on trigger webHook' + shortname + 'with status code', statusCode, 'and body', body)
})
 
emitter.on('*.failure', function (shortname, statusCode, body) {
    console.error('Error on trigger webHook' + shortname + 'with status code', statusCode, 'and body', body)
})


const server = require('http').createServer(express);
const io = require('socket.io')(server);
io.on('connection', () => { /* … */ });
server.listen(3001);

//var server = app.listen(3000)
//var io = require('socket.io').listen(server);

/* GET home page. */
router.get('/', function(req, res, next) {
  webHooks.getListeners();

  var db = require('../data/webHooksDB.json');
  res.render('index', { title: 'Webhook Demo', json: JSON.stringify(db)});
});

/* Hook Created method */
router.post('/createhook', function(req, res, next) {

  //unique ID
  var guid = generateUUID();

  webHooks.add(guid, 'http://localhost:3000/api/webhook/get/' + guid).then(function(){
    // done
  }).catch(function(err){
    console.log(err)
  })
 // webHooks.trigger(guid, {data: guid}, {header: 'header'}) // payload will be sent as POST request with JSON body (Content-Type: application/json) and custom header
 
});

/* Hook Delete method */
router.delete( {

});

/* Get JSON Data */
router.get('/api/webhook/get', function(req, res, next) {
  var db = require('../data/webHooksDB.json');
  res.writeHead(200, {"Content-Type": "text/json"});
  res.end(JSON.stringify(db));
});

/* Get Specific Webhook */
router.get('/api/webhook/get/:shortname', function(req, res) {
  res.json({ shortname: req.params.shortname });
  //webHooks.trigger(req.params.shortname, {data: req.params.shortname})
});

router.post('/api/webhook/get/:shortname', function(req, res) {
  //res.json({ shortname: req.params.shortname });
  //WebHooks.trigger(req.params.shortname)
  webHooks.trigger(req.params.shortname, {data: req.params.shortname})
});


/* Delete Specific Webhook */
//POST /api/webhook/delete/[WebHookShortname]

//function to generate random guid
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

module.exports = router;
