const db = require("../../data/db-config.js");

function find() {
  return db("schemes as sc")
    .select("sc.*")
    .count("st.step_id as number_of_steps")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .groupBy("sc.scheme_id")
    .orderBy("sc.scheme_id", "asc");
}

function findById(scheme_id) {
  return db("schemes as sc")
    .select("sc.scheme_name", "st.*", "sc.scheme_id")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .where("sc.scheme_id", scheme_id)
    .orderBy("st.step_number", "asc")
    .then((data) => {
      if (!data || Object.keys(data).length === 0) {
        return [];
      }
      let arr = [];
      data.map((step) => {
        if (!step.step_id) {
          return arr;
        }
        let newStep = {
          step_id: step.step_id,
          step_number: step.step_number,
          instructions: step.instructions,
        };
        arr.push(newStep);
      });
      let finalObject = {
        scheme_id: data[0].scheme_id,
        scheme_name: data[0].scheme_name,
        steps: arr,
      };
      return finalObject;
    });
}

function findSteps(scheme_id) {
  return db("steps as st")
    .select("st.step_id", "st.step_number", "st.instructions", "sc.scheme_name")
    .leftJoin("schemes as sc", "sc.scheme_id", "st.scheme_id")
    .where("sc.scheme_id", scheme_id)
    .orderBy("st.step_number", "asc");
}

function add(scheme) {
  return db("schemes")
    .insert(scheme)
    .then(async (ids) => {
      return await findById(ids[0]);
    });
}

function addStep(scheme_id, step) {
  return db("steps")
    .insert(Object.assign(step, { scheme_id }))
    .then(() => {
      return findSteps(scheme_id);
    });
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
};
