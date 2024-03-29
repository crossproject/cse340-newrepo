// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

/*  **********************************
*  GET Routes
* ********************************* */

// Route to root
router.get("/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountRootView)
  );

// Route to login view
router.get("/login",
  utilities.handleErrors(accountController.buildLogin)
  );

// Route to register view
router.get("/register",
  utilities.handleErrors(accountController.buildRegister)
  );

/*  **********************************
*  POST Routes
* ********************************* */

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

module.exports = router;