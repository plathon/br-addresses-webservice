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
  tableName: 'cepbr_estado',
  cities: function () {
    return this.hasMany(Cities);
  }
});

var Cities = bookshelf.Model.extend({
  tableName: 'cepbr_cidade',
  state: function() {
    return this.belongsTo(States, 'uf');
  }
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
    return next();
  }).catch(function (err) {
    return next(err)
  })
});

server.post('citiesByState', function (req, res, next) {
  var params = req.params;
  Cities.where({ uf: params.uf }).fetch({ withRelated: ['cepbr_estado'] }).then(function (cities) {
    res.send(JSON.stringify( cities.related('cepbr_estado') ))
    return next();
  }).then(function (err) {
    return next(err)
  });
});

//start server
server.listen(3000);
