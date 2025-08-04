const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
  test("correctly formats data and mapping", () => {
    const data = { firstName: "Aliya", age: 32 };
    const mapping = { firstName: "first_name" };

    const result = sqlForPartialUpdate(data, mapping);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });

  test("works when no mapping is needed", () => {
    const data = { title: "CEO", salary: 100000 };
    const result = sqlForPartialUpdate(data, {});

    expect(result).toEqual({
      setCols: '"title"=$1, "salary"=$2',
      values: ["CEO", 100000],
    });
  });

  test("partially maps keys", () => {
    const data = { firstName: "Aliya", age: 32 };
    const mapping = { firstName: "first_name" };

    const result = sqlForPartialUpdate(data, mapping);

    expect(result.setCols).toContain('"first_name"=$1');
    expect(result.setCols).toContain('"age"=$2');
    expect(result.values).toEqual(["Aliya", 32]);
  });

  test("throws BadRequestError if no data provided", () => {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });
});
