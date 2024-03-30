const utilities = require("../utilities/")
const authZ = require("../utilities/account-permission")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    let userData = await utilities.getUser(req)
    res.render("./account/login", {
      title: "Login",
      errors: null,
      nav,
      userData,
    })
  }
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  res.render("account/register", {
    title: "Register",
    errors: null,
    nav,
    userData,
  })
}

/* ****************************************
*  Deliver root view
* *************************************** */
async function buildAccountRootView(req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  let invManagement
  let updateLink

  const userInformation = await utilities.getJWTInfo(req)
  let userName = userInformation.account_firstname

  let isStaff = await authZ.isStaff(req)

  if (isStaff) {
    invManagement = '<h3>Inventory Management</h3>'
    invManagement += '<a href="/inv/">Manage Inventory</a>'
  } else {
    invManagement = null
  }
  updateLink = `<a href="/account/edit/${userInformation.account_id}">Edit Account Information</a>`
  

  res.render("account/management", {
    title: "Account Management",
    errors: null,
    nav,
    userData,
    userName,
    updateLink,
    invManagement,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      userData,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      errors: null,
      userData,
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      errors: null,
      userData,
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    userData,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
*  Update user process
* *************************************** */
async function updateUserAccount(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateData = await accountModel.updateDataAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateData) {
    req.flash(
      "notice",
      "Congratulations, your information has been updated."
    )
    res.status(201).redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update has failed.")
    res.status(501).render("account/", {
      title: "Account Management",
      errors: null,
      userData,
      nav,
    })
  }
}

/* ****************************************
*  Update account view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)

  const account_id = req.params.userId

  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Account Management",
    errors: null,
    nav,
    userData,
    account_firstname:accountData.account_firstname,
    account_lastname:accountData.account_lastname,
    account_email:accountData.account_email,
    account_id:account_id
  })
}

/* ****************************************
*  Update password process
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/update", {
      title: "Account Management",
      nav,
      userData,
      errors: null,
    })
  }

  const updateData = await accountModel.updatePasswordAccount(
    account_id,
    hashedPassword
  )

  if (updateData) {
    req.flash(
      "notice",
      "Congratulations, your password has been changed."
    )
    res.status(201).redirect("/account")
  } else {
    req.flash("notice", "Sorry, the password couldn't be changed.")
    res.status(501).render("account/update", {
      title: "Account Management",
      errors: null,
      userData,
      nav,
    })
  }
}

/* ****************************************
*  Logout process
* *************************************** */
async function logoutProcess(req, res, next) {
  res.clearCookie("jwt")
  res.status(201).redirect("/")
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountRootView, updateUserAccount, buildUpdateAccount, updatePassword, logoutProcess }