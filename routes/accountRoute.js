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

// Route to login out
router.get("/logout",
  utilities.handleErrors(accountController.logoutProcess)
  );

// Route to register view
router.get("/register",
  utilities.handleErrors(accountController.buildRegister)
  );

// Route to build edit user view
router.get("/edit/:userId", utilities.handleErrors(accountController.buildUpdateAccount));


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

// Update account data
router.post(
  "/account-update",
  regValidate.updateDataRules(),
  regValidate.checkUserUpdateData,
  utilities.handleErrors(accountController.updateUserAccount)
)

// Update password
router.post(
  "/password-update",
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;