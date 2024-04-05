const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const inventoryModel = require("../models/inventory-model")
const Util = require(".")

  /*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */

validate.classificationRules = () => {
    return [
        // classification_name is required and must be string
        body("classification_name")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 1 })
          .matches("[a-zA-Z0-9]+", 'i')
          .withMessage("Please provide a valid classification name") // on error this message is sent.
          .custom(async (classification_name) => {
            const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
            if (classificationExists){
              throw new Error("This Classification exists. Please use different a different name.")
            }}),
    ]
}


 /* ******************************
 * Check data and return errors or add classification
 * ***************************** */
 validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let userData = await utilities.getUser(req)
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        userData,
        classification_name,
      })
      return
    }
    next()
  }


  /*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */

  validate.inventoryRules = () => {
    return [
        // classification_name is required and must be string
        body("classification_id")
          .trim()
          .escape()
          .notEmpty()
          .withMessage("Please select a classification"), // on error this message is sent.
          
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .matches("[a-zA-Z]{3,}", 'i')
        .withMessage("Please provide a correct Make."), // on error this message is sent.

        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .matches("[a-zA-Z]{3,}", 'i')
        .withMessage("Please provide a correct Model."), // on error this message is sent.

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Description."), // on error this message is sent.

        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .matches("[0-9]+", 'i')
        .withMessage("Please provide a correct Price."), // on error this message is sent.

        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .matches("[0-9]{4}", 'i')
        .withMessage("Please provide a correct Year."), // on error this message is sent.

        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .matches("[0-9]+", 'i')
        .withMessage("Please provide a correct Mileage."), // on error this message is sent.

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .matches("[a-zA-Z]+", 'i')
        .withMessage("Please provide a correct Color."), // on error this message is sent.

    ]
  }

 /* ******************************
 * Check data and return errors or add vehicle
 * ***************************** */
 validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color } = req.body
  let classificationList = await Util.buildClassificationList(classification_id)
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      userData,
      classificationList,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

 /* ******************************
 * Check data and return errors or edit vehicle
 * ***************************** */
 validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color } = req.body
  let classificationList = await Util.buildClassificationList(classification_id)
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit Vehicle",
      nav,
      userData,
      classificationList,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id
    })
    return
  }
  next()
}

  /*  **********************************
  *  Add new review Validation Rules
  * ********************************* */

  validate.addReviewRules = () => {
    return [         
        body("review_text")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage("The review should have at least 10 characters."), // on error this message is sent.

        body("account_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Invalid account."), // on error this message is sent.

        body("inv_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Invalid article."), // on error this message is sent.

    ]
  }

 /* ******************************
 * Check review data and return errors or add review
 * ***************************** */
 validate.checkAddNewReview = async (req, res, next) => {
  const { screen_name, review_text, account_id, inv_id } = req.body
  
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)

    const data = await inventoryModel.getCarDetailsByInvId(inv_id)
    const details = await utilities.buildByInvId(data)

    const carName = data.inv_make + ' ' + data.inv_model

    const reviews = await inventoryModel.getReviewsByInvId(inv_id)
    const customerReviews = await utilities.buildCustomerReview(reviews)

    const addNewReview = await utilities.buildAddReview(req)

    res.render("./inventory/details", {
      title:carName,
      errors,
      nav,
      userData,
      details,
      customerReviews,
      addNewReview,
      screen_name,
      review_text,
      account_id,
      inv_id
    })
    return
  }
  next()
}



module.exports = validate