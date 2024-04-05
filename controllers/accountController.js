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

  // Render Inventory Management
  let isStaff = await authZ.isStaff(req)

  if (isStaff) {
    invManagement =  '<h3>Inventory Management</h3>'
    invManagement += '<div class="management-view">'
    invManagement += '<a href="/inv/">Manage Inventory</a>'
    invManagement += '</div>'
  } else {
    invManagement = null
  }
  updateLink = `<a href="/account/edit/${userInformation.account_id}">Edit Account Information</a>`
  

  // Render Review Management
  let reviewHistory = await accountModel.getReviewByAccountId(userInformation.account_id)
  let reviewManagement = '<ul id="reviewDisplay">'
  
  reviewHistory.forEach(function (row) {
    reviewManagement += `<li>Reviewed the ${row.inv_year} ${row.inv_make} ${row.inv_model} on ${formatDate(row.review_date)} | `
    reviewManagement += `<a href='/account/review/edit/${row.review_id}'>Edit</a> | `
    reviewManagement += `<a href='/account/review/delete/${row.review_id}'>Delete</a>`
    reviewManagement += `</li>`
  })

  reviewManagement += '</ul>'

  res.render("account/management", {
    title: "Account Management",
    errors: null,
    nav,
    userData,
    userName,
    updateLink,
    invManagement,
    reviewManagement
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

/* ***************************
 *  Build edit review view
 * ************************** */
 async function buildEditReviewView(req, res, next) {
  const review_id = req.params.reviewId
  const data = await accountModel.getReviewByReviewId(review_id)

  let carReview = `${data.inv_year} ${data.inv_model} ${data.inv_make}`

  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  
  let reviewDate = formatDate(data.review_date)

  res.render("./account/edit-review", {
    title:"Edit Review",
    errors: null,
    nav,
    userData,
    carReview,
    reviewDate,
    review_text:data.review_text,
    review_id,

  })
}

/* ***************************
 *  Build delete review view
 * ************************** */
async function buildDeleteReviewView(req, res, next) {
  const review_id = req.params.reviewId
  const data = await accountModel.getReviewByReviewId(review_id)

  let carReview = `${data.inv_year} ${data.inv_model} ${data.inv_make}`

  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  
  let reviewDate = formatDate(data.review_date)

  res.render("./account/delete-review", {
    title:"Delete Review",
    errors: null,
    nav,
    userData,
    carReview,
    reviewDate,
    review_text:data.review_text,
    review_id,

  })
}

/* ****************************************
*  Update review process
* *************************************** */
async function updateReview(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)

  const { review_id, review_text } = req.body

  const updateData = await accountModel.editReview(
    review_id,
    review_text
  )

  if (updateData) {
    req.flash(
      "notice",
      "Congratulations, the review has been updated."
    )
    res.status(201).redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update has failed.")
    res.status(501).render("account/", {
      title: "Edit Review",
      errors: null,
      userData,
      nav,
    })
  }
}

/* ****************************************
*  Update review process
* *************************************** */
async function deleteReview(req, res) {
  let nav = await utilities.getNav()
  let userData = await utilities.getUser(req)
  
  const { review_id } = req.body

  let reviewId = parseInt(review_id)

  
  const deleteData = await accountModel.deleteReview(
    reviewId
  )

  
  if (deleteData) {
    req.flash(
      "notice",
      "Congratulations, the review has been deleted."
    )
    res.status(201).redirect("/account")
  } else {
    req.flash("notice", "Sorry, the delete has failed.")
    res.status(501).render("account/", {
      title: "Delete Review",
      errors: null,
      userData,
      nav,
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
  
  return `${monthName} ${day}, ${year}` 
}

/* ****************************************
*  Logout process
* *************************************** */
async function logoutProcess(req, res, next) {
  res.clearCookie("jwt")
  res.status(201).redirect("/")
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountRootView,
  updateUserAccount,
  buildUpdateAccount,
  updatePassword,
  logoutProcess,
  buildEditReviewView,
  updateReview,
  buildDeleteReviewView,
  deleteReview
}