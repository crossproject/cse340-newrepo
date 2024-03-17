const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build car details by inventory view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getCarDetailsByInvId(inv_id)
  const details = await utilities.buildByInvId(data)
  let nav = await utilities.getNav()
  const carName = data.inv_make + ' ' + data.inv_model
  res.render("./inventory/details", {
    title:carName,
    nav,
    details,
  })
}

/* ***************************
 *  Bad function
 * ************************** */
invCont.badFunction = async function (req, res, next) {
  res.render("./inventory/inexistent", {
    title:inexistent
  })
}

module.exports = invCont