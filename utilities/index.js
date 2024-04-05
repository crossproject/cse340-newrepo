const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the car details view HTML
* ************************************ */
Util.buildByInvId = async function(data){
  let details
  if(Object.keys(data).length > 0){
    details = '<div class="productInfo">'
    details += '<img src="' + data.inv_image + '" alt="Image of ' + data.inv_make + ' ' + data.inv_model + '">'
    details += '<div class="productDetails">'
    details += '<h2>' + data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model + ' Details</h2>'
    details += '<span class="detailPrice"><b>Price:</b> $'+ new Intl.NumberFormat('en-US').format(data.inv_price) + '</span>'
    details += '<p><b>Description:</b> ' + data.inv_description + '</p>'
    details += '<span class="detailMiles"><b>Miles:</b> ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</span>'
    details += '<span class="detailColor"><b>Color:</b> ' + capitalizeWord(data.inv_color) + '</span>'
    details += '</div>'
    details += '</div>'
  } else {
    details = '<p class="notice">Sorry, the vehicle could not be found.</p>'
  }
  return details
}

/* **************************************
* Build the 404 not found error view
* ************************************ */
Util.buidNotFoundView = async function(message){
  let background = '<div class=errorView>'
  background += '<h2>' + message + '</h2>'
  background += '<img src="/images/site/not-found-error.jpg" alt=not-found-error-message-image>'
  background += '</div>'
  return background
}

/* **************************************
* Build the error server view
* ************************************ */
Util.buidErrorView = async function(message){
  let background = '<div class=errorView>'
  background += '<h2>' + message + '</h2>'
  background += '<img src="/images/site/server-error.jpg" alt=error-message-image>'
  background += '</div>'
  return background
}

/* **************************************
* Build the management view
* ************************************ */
Util.buildManagementView = async function(){
  let manageItems = '<div class=manageItems>'

  manageItems += '<a href="./inv/inventory/add-classification">Add New Classification</a>'
  manageItems += '<br>'
  manageItems += '<a href="./inv/inventory/add-inventory">Add New Vehicle</a>'
  
  manageItems += '</div>'
  return manageItems
}

/* **************************************
* Build the classification list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}




 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ************************
 * Get JWT Token Info
 ************************** */
Util.getJWTInfo = async function (req, res, next) {
  let JWTData
  if (req.cookies.jwt) {
    jwt.verify(
     req.cookies.jwt,
     process.env.ACCESS_TOKEN_SECRET,
     function (err, accountData) {
      if (err) {
       console.log(err)
      }
      JWTData = accountData
     })
   } else {
    JWTData = false
   }
  return JWTData
}
/* ************************
 * Constructs Headers username
 ************************** */
Util.getUser = async function (req, res, next) {
  let userData
  let JWTData = await this.getJWTInfo(req)
  
  if (JWTData) {
      userData = '<a href="/account/">Welcome ' + JWTData.account_firstname + '</a>'
      userData += '<a title="Click to log out" href="/account/logout">Logout</a>'
   } else {
    userData = '<a title="Click to log in" href="/account/login">My Account</a>'
   }
  return userData
}

/* ************************
 * Build Customer Reviews
 ************************** */
Util.buildCustomerReview = async function (data) {
  let review
  
  if(Object.keys(data).length > 0){
    review = '<div class="customerReview">'
    review += '<ul>'
    data.forEach(rev => { 
      review += '<li>'
      review += '<div class="reviewDate">'
      review += createScreenName(rev.account_firstname, rev.account_lastname) + ' wrote on ' + formatDate(rev.review_date)
      review += '</div>'

      review += '<div class="reviewText">'
      review += rev.review_text
      review += '</div>'
      review += '</li>'
    })
    review += '</ul>'
    review += '</div>'
  } else {
    review = '<p class="noReview">Be the first to write a review.</p>'
  }
  return review
}

/* ************************
 * Build add new Review
 ************************** */
Util.buildAddReview = async function (req, res, next) {
  const inv_id = req.params.invId
  let reviewForm
  let JWTData = await this.getJWTInfo(req)
  
  if(JWTData){
    reviewForm = '<div class="addNewReview">'
    reviewForm += '<h3>Add Your Own Review</h3>'
    reviewForm += `<form id="reviewForm" action="/inv/review/add-review/${inv_id}" method="post" class="validated-form">`

    reviewForm += '<label for="screen_name">Screen Name:</label>'
    reviewForm += `<input type="text" id="screen_name" name="screen_name" value="${createScreenName(JWTData.account_firstname, JWTData.account_lastname)}" readonly>`

    reviewForm += '<label for="review_text">Review:</label>'
    reviewForm += '<textarea id="review_text" name="review_text" minlength="10" required></textarea>'

    reviewForm += '<input type="submit" value="Submit Review" id="submitButton">'

    reviewForm += `<input type="hidden" name="account_id" value=${JWTData.account_id}>`
    reviewForm += `<input type="hidden" name="inv_id" value=${inv_id}>`
    

    reviewForm += '</form>'
    } else {
    reviewForm = '<p class="noLoginReview">You must <a href="/account/login">login</a> to write a review.</p>'
  }
  return reviewForm
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
 * Word functions
 **************************************** */
function capitalizeWord(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function createScreenName(firstname, lastname) {
  return firstname.charAt(0).toUpperCase() + lastname.charAt(0).toUpperCase() + lastname.slice(1)
}

 /* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util