const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* *****************************
*   Update data account
* *************************** */
async function updateDataAccount(account_id, account_firstname, account_lastname, account_email){
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Update password account
* *************************** */
async function updatePasswordAccount(account_id, account_password){
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    return await pool.query(sql, [account_password, account_id])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching ID found")
  }
}

/* *****************************
* Return review using account_id
* ***************************** */
async function getReviewByAccountId (account_id) {
  try {
    const result = await pool.query(
      'SELECT inv_year, inv_make, inv_model, review_date, review_id FROM public.review INNER JOIN public.inventory ON review.inv_id = inventory.inv_id WHERE review.account_id = $1',
      [account_id])
    return result.rows
  } catch (error) {
    return new Error("No matching ID found")
  }
}

/* ***************************
 *  Get car reviews by review_id
 * ************************** */
async function getReviewByReviewId(review_id) {
  try {
    const data = await pool.query(
      `SELECT inv_year, inv_make, inv_model, review_text, review_date
      FROM public.review
      INNER JOIN public.inventory
        ON review.inv_id = inventory.inv_id
      WHERE review.review_id = $1`,
      [review_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getReviewsByInvId error " + error)
  }
}

/* ***************************
 *  Updates a review's data
 * ************************** */
async function editReview(
  review_id,
  review_text
    ) {
try {
  const sql = "UPDATE public.review SET review_text = $2 WHERE review_id = $1 RETURNING *"
  const data = await pool.query(sql, [
    review_id,
    review_text])
    return data.rows[0]
} catch (error) {
  return "model error: " + error.message
}
}

/* ***************************
 *  Delete a review's data
 * ************************** */
async function deleteReview(review_id) {
try {
  const sql = "DELETE FROM review WHERE review_id = $1"
  const data = await pool.query(sql, [
    review_id])
    return data
} catch (error) {
  return "Delete Review Error"
}
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateDataAccount,
  getAccountById,
  updatePasswordAccount,
  getReviewByAccountId,
  getReviewByReviewId,
  editReview,
  deleteReview
}