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
  let userData = await utilities.getUser(req)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    errors: null,
    nav,
    userData,
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

  // render customer reviews
  const reviews = await invModel.getReviewsByInvId(inv_id)
  const customerReviews = await utilities.buildCustomerReview(reviews)

  // render add new review
  const addNewReview = await utilities.buildAddReview(req)

  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const carName = data.inv_make + ' ' + data.inv_model
  res.render("./inventory/details", {
    title:carName,
    errors: null,
    nav,
    userData,
    details,
    customerReviews,
    addNewReview,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const invManagement = await utilities.buildManagementView()
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title:"Vehicle Management",
    errors: null,
    nav,
    userData,
    invManagement,
    classificationSelect,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  res.render("./inventory/add-classification", {
    title:"Add Classification",
    errors: null,
    nav,
    userData,
  })
}

/* ****************************************
*  Add new classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  
  const { classification_name } = req.body
  const addClassResult = await invModel.addClassification(
    classification_name
  )

  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)

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
      userData,
    })
  }
}

/* ***************************
 *  Build add vehicle view
 * ************************** */
invCont.buildAddVehicleView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title:"Add Inventory",
    errors: null,
    nav,
    userData,
    classificationList,
  })
}

/* ****************************************
*  Add new vehicle
* *************************************** */
invCont.addVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
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
      `The vehicle ${addVehicle.inv_make} ${addVehicle.inv_model} was successfully added.`
    )
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", `Sorry, the ${addVehicle.inv_make} ${addVehicle.inv_model} couldn't be added.`)
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: null,
      nav,
      userData,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ****************************************
*  Edit inventory view
* *************************************** */
invCont.buildEditByInvId = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)

  const data = await invModel.getCarDetailsByInvId(inv_id)
  const carName = data.inv_make + ' ' + data.inv_model

  const classificationList = await utilities.buildClassificationList(data.classification_id)
  res.render("./inventory/edit-inventory", {
    title:"Edit " + carName,
    nav,
    userData,
    classificationList,
    errors:null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_description: data.inv_description,
    inv_image: data.inv_image,
    inv_thumbnail: data.inv_thumbnail,
    inv_price: data.inv_price,
    inv_miles: data.inv_miles,
    inv_color: data.inv_color,
    classification_id: data.classification_id
  })
}

/* ****************************************
*  Modify vehicle's data
* *************************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { 
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const updateVehicle = await invModel.updateVehicle(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateVehicle) {
    req.flash(
      "notice",
      `The vehicle ${updateVehicle.inv_make} ${updateVehicle.inv_model} was successfully updated.`
    )
    res.status(201).redirect("/inv")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", `Sorry, the ${updateVehicle.inv_make} ${updateVehicle.inv_model} couldn't be updated.`)
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit Inventory",
      errors: null,
      nav,
      userData,
      classificationList: classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ****************************************
*  Delete inventory view
* *************************************** */
invCont.buildDeleteByInvId = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)

  const data = await invModel.getCarDetailsByInvId(inv_id)
  const carName = data.inv_make + ' ' + data.inv_model

  res.render("./inventory/delete-confirm", {
    title:"Delete " + carName,
    nav,
    userData,
    errors:null,
    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_price: data.inv_price,
  })
}

/* ****************************************
*  Modify vehicle's data
* *************************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  
  const { 
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  } = req.body

  let invId = parseInt(inv_id)

  const deleteVehicle = await invModel.deleteVehicle(invId)

  if (deleteVehicle) {
    req.flash(
      "notice",
      `The vehicle ${inv_make} ${inv_model} was successfully deleted.`
    )
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", `Sorry, the ${inv_make} ${inv_model} couldn't be deleted.`)
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete Vehicle",
      errors: null,
      nav,
      userData,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    })
  }
}

/* ****************************************
*  Add new review
* *************************************** */
invCont.addReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { 
    review_text,
    inv_id,
    account_id
  } = req.body

  const addNewReview = await invModel.addReview(
    review_text,
    inv_id,
    account_id
  )

  if (addNewReview) {
    req.flash(
      "notice",
      `The review was successfully added.`
    )
    res.status(201).redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("notice", `Sorry, the review couldn't be added.`)
    res.status(501).render(`/inv/detail/${inv_id}`, {

      errors,
      title: "Add Vehicle",
      nav,
      userData,
      screen_name,
      review_text,
      account_id,
      inv_id

    })
  }
}


/* ****************************************
*  Edit review
* *************************************** */
invCont.editReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { 
    review_id,
    review_text,
    inv_id,
    account_id
  } = req.body

  const editReview = await invModel.editReview(
    review_id,
    review_text,
    inv_id,
    account_id
  )

  if (editReview) {
    req.flash(
      "notice",
      `The review was successfully edited.`
    )
    res.status(201).redirect(`/account/`)
  } else {
    req.flash("notice", `Sorry, the review couldn't be edited.`)
    res.status(501).render(`/inv/review/edit-review`, {

      errors,
      title: "Edit Review",
      nav,
      userData,
      screen_name,
      review_text,
      account_id,
      inv_id

    })
  }
}



/* ************************
 * Format Date
 ************************** */
function formatDate(date) {
  const d = new Date(date)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const year = d.getFullYear()
  const monthName = months[d.getMonth()]
  const day = d.getDate()
  
  return `${monthName} ${day}, ${year}` }

module.exports = invCont