"use strict";

const express = require("express");
var fortune = require("./lib/fortune");

const handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

const app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.locals.showTests =
    app.get("env") !== "production" && req.query.test === "1";
  next();
});

app.get("/", (request, response) => {
  response.render("home");
});

app.get("/about", (request, response) => {
  response.render("about", { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
});

app.get("/tours/hood-river", (request, response) => {
  response.render("tours/hood-river");
});

app.get("/tours/request-group-rate", (request, response) => {
  response.render("tours/request-group-rate");
});

app.use((request, response) => {
  response.status(404);
  response.render("404");
});

app.use((error, request, response, next) => {
  if (error) console.error(error);
  response.status(500);
  response.render("500");
});

app.listen(app.get("port"), () => {
  console.log("Express started on http://localhost:" + app.get("port"));
});
