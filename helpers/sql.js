const { BadRequestError } = require("../expressError");

/** Converts a JavaScript object into a SQL-safe string and values array for
 * use in a parameterized SQL update query
 * 
 * INPUTS:
 *  - dataToUpdate: Key/Value pairs representing the fields to update
 *  - jsToSql: Mapping ot JS-style field names to SQL column names
 * 
 * OUTPUT: Object 
 *    - setCols: a SQL string
 *    - values: array of the values to bind to SQL placeholders
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
