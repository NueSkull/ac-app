const db = require("../db/connection");

exports.retrieveSettings = async (userID) => {
  const result = await db.query(`
    SELECT * FROM users WHERE subdom = $1;`,
     [userID]);
  return result.rows[0];
}

exports.storeSettings = async (userID, updates) => {
  const allowedUpdates = ['company_name', 'address_line_one', 'address_line_two', 'address_line_three', 'post_code', 'telephone']

  const updatesArr = [];
  const valuesArr = [userID]
  let startingIndex = 2;

  for(const update in updates) {
    if(allowedUpdates.includes(update)) {
      updatesArr.push(`${update} = $${startingIndex}`);
      valuesArr.push(updates[update]);
      startingIndex++;
    }
  }

  if(updatesArr.length === 0) {
    return null;
  }

  const setClause = updatesArr.join(', ');
  const query = `
    UPDATE users
    SET ${setClause}
    WHERE subdom = $1
    RETURNING *;
  `;

  const result = await db.query(query, valuesArr);
  return result.rows[0];
}

