"use strict";
const express = require("express");
const fortune = require("./lib/fortune");
const credentials = require("./credentials");
const getWeatherData = require("./models/weather");
const mongoose = require("mongoose");
const Vacation = require('./models/vacation');
const VacationInSeasonListener = require('./models/vacationInSeason');
const connectionOptions = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
};
const seedDatabase = require('./models/seed');

const handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

const app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", process.env.PORT || 3000);

switch (app.get("env")) {
  case "development":
    app.use(require("morgan")("dev"));
    mongoose.connect(
      credentials.mongo.development.connectionString,
      connectionOptions
    );
    seedDatabase();
    break;
  case "production":
    app.use(
      require("express-logger")({
        path: __dirname + "/log/requests.log"
      })
    );
    mongoose.connect(
      credentials.mongo.production.connectionString,
      connectionOptions
    );
    break;
  default:
    throw new Error(`Unknown execution environmnet ${app.get("env")}`);
    break;
}

app.use(express.static(__dirname + "/public"));

app.use(require("body-parser")());
app.use(require("cookie-parser")(credentials.cookieSecret));
app.use(require("express-session")());

app.use((request, response, next) => {
  let cluster = require("cluster");
  if (cluster.isWorker)
    console.log(`Worker ${cluster.worker.id} received request`);
  next();
});

app.use(function(req, res, next) {
  res.locals.showTests =
    app.get("env") !== "production" && req.query.test === "1";
  next();
});

app.use((request, response, next) => {
  response.locals.flash = request.session.flash;
  delete request.session.flash;
  next();
});

app.use(function(req, res, next) {
  if (!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weather = getWeatherData();
  next();
});

app.get("/", (request, response) => {
  response.render("home");
});

app.get('/vacations', (request, response) => {
  Vacation.find({available: true}, (error, vacations) => {
    var context = {
      vacations: vacations.map((vacation) => {
        return {
          sku: vacation.sku,
          name: vacation.name,
          description: vacation.description, 
          price: vacation.getDisplayPrice(), 
          inSeason: vacation.inSeason,
        }
      })
    };
    response.render('vacations', context);
  });
})

app.get("/about", (request, response) => {
  response.render("about", {
    fortune: fortune.getFortune(),
    pageTestScript: "/qa/tests-about.js"
  });
});

app.get("/form", (request, response) => {
  response.render("form");
});

app.post("/process", (request, response) => {
  console.log(request.body);
  response.redirect(303, "about");
});

app.get('/notify-me-when-in-season', (request, response) => {
  response.render('notify-me-when-in-season', {sku: request.query.sku});
})

app.post('/notify-me-when-in-season', (request, response) => {
  VacationInSeasonListener.update(
    {email: request.body.email},
    {$push: {skus: request.body.sku}},
    {upsert: true},
    function(err) {
      if(err) {
        console.error(err.stack);
        request.session.flash = {
          type: 'danger',
          intro: 'Oops!',
          message: 'There was an error processing your request',
        };
        return response.redirect(303, '/vacations');
      }
      request.session.flash ={
        type: 'success',
        intro: 'Thank you',
        message: 'You will be notified when this vacation in season',
      }
      return response.redirect(303, '/vacations' );
    }
  )
});

app.get("/headers", (request, response) => {
  response.set("Content-type", "text/plain");
  var s = "";
  for (let name in request.headers) {
    s = s + name + ": " + request.headers[name] + "\n";
  }
  response.send(s);
});

app.get("/tours/hood-river", (request, response) => {
  response.render("tours/hood-river");
});

app.get("/tours/request-group-rate", (request, response) => {
  response.render("tours/request-group-rate");
});

app.get("/newsletter", function(req, res) {
  res.render("newsletter", { csrf: "CSRF token goes here" });
});

app.post("/process", function(req, res) {
  console.log("Form (from querystring): " + req.query.form);
  console.log("CSRF token (from hidden form field): " + req.body._csrf);
  console.log("Name (from visible form field): " + req.body.name);
  console.log("Email (from visible form field): " + req.body.email);
  res.redirect(303, "/thank-you");
});

app.get("/thank-you", (request, response) => {
  response.render("thank-you", { word: "Gracias" });
});

app.use((request, response) => {
  response.status(404);
  response.render("404");
});

//catch all
app.use((error, request, response, next) => {
  if (error) console.error(error);
  response.status(500);
  response.render("500");
});

const startServer = () => {
  app.listen(app.get("port"), () => {
    console.log(
      `Express started in ${app.get("env")} mode on http://localhost:${app.get(
        "port"
      )}`
    );
  });
};

if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
