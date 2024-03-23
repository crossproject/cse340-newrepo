const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const inventoryModel = require("../models/inventory-model")

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
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
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
          .withMessage("Please provide a valid classification name"), // on error this message is sent.
          

        // body("inv_make")
        // .trim()
        // .escape()
        // .notEmpty()
        // .isLength({ min: 3 })
        // .withMessage("Please provide a Make."), // on error this message is sent.

        // body("inv_model")
        // .trim()
        // .escape()
        // .notEmpty()
        // .isLength({ min: 3 })
        // .withMessage("Please provide a Model."), // on error this message is sent.

        // body("inv_description")
        // .trim()
        // .escape()
        // .notEmpty()
        // .withMessage("Please provide a Description."), // on error this message is sent.

        // body("inv_price")
        // .trim()
        // .escape()
        // .notEmpty()
        // .isNumeric()
        // .withMessage("Please provide a Price."), // on error this message is sent.

        // body("inv_year")
        // .trim()
        // .escape()
        // .notEmpty()
        // .isNumeric()
        // .withMessage("Please provide a Year."), // on error this message is sent.

        // body("inv_miles")
        // .trim()
        // .escape()
        // .notEmpty()
        // .isNumeric()
        // .withMessage("Please provide a Mileage."), // on error this message is sent.

        // body("inv_color")
        // .trim()
        // .escape()
        // .notEmpty()
        // .withMessage("Please provide a Color."), // on error this message is sent.

    ]
}

 /* ******************************
 * Check data and return errors or add vehicle
 * ***************************** */
 validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color } = req.body
  let classificationList = classification_id
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
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


module.exports = validate