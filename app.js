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
  states: function() {
    return this.belongsTo(States);
  }
});

var Districts = bookshelf.Model.extend({
  tableName: 'cepbr_bairro',
  city: function() {
    return this.belongsTo(Cities);
  }
});

var Addresses = bookshelf.Model.extend({
  tableName: 'cepbr_endereco',
  district: function() {
    return this.belongsTo(Districts);
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

server.post('citiesbystate', function (req, res, next) {
  var params = req.params;
  Cities.where({ uf: params.uf }).fetchAll().then(function (cities) {
    res.send(cities.toJSON());
    return next();
  }).then(function (err) {
    return next(err)
  });
});

server.post('districtsbycity', function (req, res, next) {
  var params = req.params;
  Districts.where({ id_cidade: params.cidade }).fetchAll().then(function (districts) {
    res.send(districts.toJSON());
    return next();
  }).then(function (err) {
    return next(err);
  });
});

server.post('addressbyzipcode', function (req, res, next) {
  var params = req.params;
  Addresses.where({ cep: params.zipcode }).fetch().then(function (address) {
    res.send(address.toJSON());
    return next();
  }).then(function (err) {
    return next(err);
  });
});

//start server
server.listen(3000);
