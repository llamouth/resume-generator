const fs = require("fs");
const csv = require("csv-parser");
const { getEmbedding } = require("./embedding");
const tf = require("@tensorflow/tfjs-node");

const resumes = [];
const jobDescriptions = [];
const labels = [];

// Load Job Descriptions & Labels
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.job_description && row.match_score) {
          jobDescriptions.push(row.job_description);
          labels.push(parseFloat(row.match_score) / 100); // Normalize 0-1
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });
}

// Load Resume Texts
function loadResumes() {
  const data = JSON.parse(fs.readFileSync("datasets/resumes.json", "utf-8"));
  data.forEach((resume) => resumes.push(resume.text));
}

// Load Everything
async function prepareData() {
  await loadCSV("datasets/train.csv");
  loadResumes();

  const resumeEmbeddings = await Promise.all(resumes.map(getEmbedding));
  const jobEmbeddings = await Promise.all(jobDescriptions.map(getEmbedding));

  // Combine resume & job description embeddings as input
  const combinedInputs = resumeEmbeddings.map((resumeVec, i) => 
    [...resumeVec, ...jobEmbeddings[i]] // Concatenate embeddings
  );

  return {
    inputs: tf.tensor2d(combinedInputs), // Input is now a combination of both
    targets: tf.tensor2d(labels.map((score) => [score])),
  };
}



async function trainModel() {
  const { inputs, targets } = await prepareData();

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 128, activation: "relu", inputShape: [inputs.shape[1]] }));
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // Output: Match Score (0-1)

  model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

  console.log("Training model...");
  await model.fit(inputs, targets, { epochs: 15 });
  console.log("Training complete!");

  await model.save("file://./model");
}


trainModel();
