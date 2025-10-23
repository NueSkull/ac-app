function makeJsonArray(data) {
  const rows = new Array();

  for (const obj in data) {
    rows.push(Object.values(data[obj]));
  }
  return rows;
}

module.exports = makeJsonArray;