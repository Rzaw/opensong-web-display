const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const config = require('../../config/server');

router.post("/slide-control", (req, res) => {
    if (req.body.webAction) {
      const actions = {
        "current-slide": "/presentation/slide/current",
        "first-slide": "/presentation/slide/first",
        "previous-section": "/presentation/section/previous",
        "previous-slide": "/presentation/slide/previous",
        "next-slide": "/presentation/slide/next",
        "next-section": "/presentation/section/next",
        "last-slide": "/presentation/slide/last",
      };
  
      const reqToOpensong = actions[req.body.webAction];
  
      if (reqToOpensong) {
        const url = `http://${config.opensongAddress}:${config.opensongPort}${reqToOpensong}`;
        fetch(url, { method: "POST" });
        res.json({});
      } else {
        res.json({ message: "Action not found" });
      }
    } else {
      res.json({ message: "webAction is missing" });
    }
  });
  
  module.exports = router;