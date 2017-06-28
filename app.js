"use strict";

const express = require("express");

const handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

const app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));

app.get("/", (request, response) => {
  response.render("home");
});

var fortunes = [
  "Conquer your fears or they will conquer you.",
  "Rivers need springs.",
  "Do not fear what you don't know.",
  "You will have a pleasant surprise.",
  "Whenever possible, keep it simple."
];

app.get("/about", (request, response) => {
  var randomFortune = 
    fortunes[Math.floor(Math.random() * fortunes.length)];
  response.render("about", { fortune: randomFortune });
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
