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
    errors: null,
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
    errors: null,
    nav,
    details,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const invManagement = await utilities.buildManagementView()
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title:"Vehicle Management",
    errors: null,
    nav,
    invManagement,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title:"Add Classification",
    errors: null,
    nav,
  })
}

/* ****************************************
*  Add new classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  
  const { classification_name } = req.body
  const invManagement = await utilities.buildManagementView()
  const addClassResult = await invModel.addClassification(
    classification_name
  )

  let nav = await utilities.getNav()

  if (addClassResult) {
    req.flash(
      "notice",
      `The ${classification_name} was successfully added.`
    )
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", `Sorry, the ${classification_name} couldn't be added.`)
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      errors: null,
      nav,
    })
  }
}

/* ***************************
 *  Build add vehicle view
 * ************************** */
invCont.buildAddVehicleView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title:"Add Inventory",
    errors: null,
    nav,
    classificationList,
  })
}

/* ****************************************
*  Add new vehicle
* *************************************** */
invCont.addVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { 
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const addVehicle = await invModel.addVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (addVehicle) {
    req.flash(
      "notice",
      `The vehicle ${inv_make} ${inv_model} was successfully added.`
    )
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", `Sorry, the ${inv_make} ${inv_model} couldn't be added.`)
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: null,
      nav,
      classificationList: null,
    })
  }
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