const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  res.render("index", {title: "Home", nav, userData})
}

module.exports = baseController