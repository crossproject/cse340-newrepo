// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')
const authZ = require("../utilities/account-permission")

/*  **********************************
*  GET Routes
* ********************************* */

// Route to inventory management
router.get("/", 
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.buildManagementView)
);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build car product details
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Inexistent route for 500-type error
router.get("/faildirection", utilities.handleErrors(invController.badFunction))

// Route to build add classification view
router.get("/inventory/add-classification",
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.buildAddClassView)
    );

// Route to build add vehicle view
router.get("/inventory/add-inventory",
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.buildAddVehicleView)
    );

// Route to build inventory view
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit view by inventory id
router.get("/edit/:invId", 
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.buildEditByInvId)
    );

// Route to build delete view by inventory id
router.get("/delete/:invId",
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.buildDeleteByInvId)
    );



/*  **********************************
*  POST Routes
* ********************************* */

// Route for register a new classification
router.post(
    "/inventory/add-classification",
    utilities.checkLogin,
    authZ.employeePermission,
    invValidate.classificationRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
);

// Route to add a vehicle
router.post(
    "/inventory/add-inventory",
    utilities.checkLogin,
    authZ.employeePermission,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addVehicle)
);

// Update vehicle data
router.post(
    "/update/",
    utilities.checkLogin,
    authZ.employeePermission,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))


// Delete vehicle data
router.post(
    "/delete/",
    utilities.checkLogin,
    authZ.employeePermission,
    utilities.handleErrors(invController.deleteInventory))


// Route to add a review
router.post(
    "/review/add-review/:invId",
    utilities.checkLogin,
    invValidate.addReviewRules(),
    invValidate.checkAddNewReview,
    utilities.handleErrors(invController.addReview)
);



module.exports = router;