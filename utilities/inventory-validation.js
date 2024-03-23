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
          .withMessage("Please provide a classification name."), // on error this message is sent.
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

module.exports = validate