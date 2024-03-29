const utilities = require(".")
const permission = {}

/*  **********************************
*  Client permission rule
* ********************************* */
permission.clientPermission = async (req, res, next) =>{
    let accountData = await utilities.getJWTInfo(req)
    switch(accountData.account_type) {
        case "Client":
            next()
            break
        case "Employee":
            next()
            break
        case "Admin":
            next()
            break
        default:
            req.flash("notice", "You don't have enough permission.")
            return res.redirect("/account/login")
    }
}

/*  **********************************
*  Employee permission rule
* ********************************* */
permission.employeePermission = async (req, res, next) =>{
    let accountData = await utilities.getJWTInfo(req)
    switch(accountData.account_type) {
        case "Employee":
            next()
            break
        case "Admin":
            next()
            break
        default:
            req.flash("notice", "You don't have enough permission.")
            return res.redirect("/account/login")
    }
}

/*  **********************************
*  Admin permission rule
* ********************************* */
permission.adminPermission = async (req, res, next) =>{
    let accountData = await utilities.getJWTInfo(req)
    switch(accountData.account_type) {
        case "Admin":
            next()
            break
        default:
            req.flash("notice", "You don't have enough permission.")
            return res.redirect("/account/login")
    }
}

/*  **********************************
*  Staff permission check
* ********************************* */
permission.isStaff = async (req, res, next) =>{
    let accountData = await utilities.getJWTInfo(req)
    switch(accountData.account_type) {
        case "Employee":
            return true
        case "Admin":
            return true
        default:
            return false
    }
}

module.exports = permission