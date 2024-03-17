// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build car product details
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Inexistent route for 500-type error
router.get("/faildirection", utilities.handleErrors(invController.badFunction))
module.exports = router;