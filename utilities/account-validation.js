const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (!emailExists){
            throw new Error("Email doesn't exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let userData = await utilities.getUser(req)
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        userData,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }
  
  /* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
  validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let userData = await utilities.getUser(req)
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        userData,
        account_email,
      })
      return
    }
    next()
  }

/*  **********************************
*  Update Data Validation Rules
* ********************************* */
  validate.updateDataRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      body("account_id")
        .notEmpty(),
      
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => { //Fix needed
        const actualInformation = await accountModel.getAccountById(req.body.account_id)
        if (actualInformation.account_email == account_email){
          return true
        } else {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please use a different email")
      }}})
      ]}
        
  


/*  **********************************
*  Update Password Validation Rules
* ********************************* */
validate.updatePasswordRules = () => {
  return [
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
* Check user data and return errors or continue to update
* ***************************** */
  validate.checkUserUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let userData = await utilities.getUser(req)
      res.render("account/update", {
        errors,
        title: "Account Management",
        nav,
        userData,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

/* ******************************
* Check password validation and return errors or continue to update
* ***************************** */
validate.checkPasswordUpdateData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)
    let userInfo = await utilities.getJWTInfo(req)
    res.render("account/update", {
      errors,
      title: "Account Management",
      nav,
      userData,
      account_firstname:userInfo.account_firstname,
      account_lastname:userInfo.account_lastname,
      account_email:userInfo.account_email,
      account_id:userInfo.account_id,
      pw_account_id:userInfo.account_id
    })
    return
  }
  next()
}

  /*  **********************************
  *  Edit review Validation Rules
  * ********************************* */

  validate.editReviewRules = () => {
    return [
      body("review_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Invalid review."), // on error this message is sent.
        
      body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("The review should have at least 10 characters."), // on error this message is sent.


    ]
  }


   /* ******************************
 * Check review data and return errors or add review
 * ***************************** */
 validate.checkEditNewReview = async (req, res, next) => {
  const { review_id, review_text, review_date } = req.body
  
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    
    const data = await accountModel.getReviewByReviewId(review_id)
  
    let carReview = `${data.inv_year} ${data.inv_model} ${data.inv_make}`
  
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)
    
    

    res.render('./account/edit-review', {

      title:"Edit Review",
      errors,
      nav,
      userData,
      carReview,
      reviewDate:review_date,
      review_id,

      review_text,


    })
    return
  }
  next()
}

  module.exports = validate