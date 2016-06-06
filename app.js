var restify  = require('restify');

//app config
var server = restify.createServer({
  name: 'app',
  version: '1.0.0'
});

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : process.env.HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASS,
    database : process.env.DB_NAME,
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var States = bookshelf.Model.extend({
  tableName: 'cepbr_estado'
});

restify.CORS.ALLOW_HEADERS.push('authorization');
server.pre(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('states', function (req, res, next) {
  States.fetchAll().then(function (states) {
    res.send(states.toJSON());
    next();
  }).catch(function (err) {
    return next(err)
  })
});

//start server
server.listen(3000);
