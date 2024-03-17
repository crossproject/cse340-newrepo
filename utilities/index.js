const invModel = require("../models/inventory-model")
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
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
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
    
    details += '<img src="' + data.inv_image + '" alt="' + data.inv_make + ' ' + data.inv_model + '">'
    
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

/* ****************************************
 * Word functions
 **************************************** */
function capitalizeWord(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util