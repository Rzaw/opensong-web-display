const express = require('express');

module.exports = (app) => {

    app.set("view engine", "ejs");
    app.set('views', __dirname + './../app/views/');
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    // for use of web dependencies
    app.use("/public", express.static("public"));
    app.use(
        "/scripts",
        express.static(__dirname + "./../node_modules/socket.io-client/dist")
    );
    app.use(
        "/font-awesome",
        express.static(__dirname + "./../ode_modules/@fortawesome/fontawesome-free/")
    );

    app.use('/jquery', express.static(__dirname + './../node_modules/jquery/dist/'));
    app.use('/bootstrap', express.static(__dirname + './../node_modules/bootstrap/dist/'));


};