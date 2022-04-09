const router = require('express').Router()

router.get("", async (req, res, next) => {
  res.render('index')
})

module.exports = router