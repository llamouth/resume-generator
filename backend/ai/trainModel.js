const tf = require("@tensorflow/tfjs"); // Use browser-compatible TensorFlow.js
const use = require("@tensorflow-models/universal-sentence-encoder");

// Function to get text embeddings
async function getEmbedding(text) {
  const model = await use.load();
  const embeddings = await model.embed([text]);
  return embeddings.arraySync()[0]; // Convert tensor to an array
}

// Load Dataset (Simulated Fetch for Local File)
async function loadCSV(filePath) {
  const fs = require("fs");
  const csv = require("csv-parser");

  return new Promise((resolve, reject) => {
    const jobDescriptions = [];
    const labels = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.job_description && row.match_score) {
          jobDescriptions.push(row.job_description);
          labels.push(parseFloat(row.match_score) / 100); // Normalize match score
        }
      })
      .on("end", () => resolve({ jobDescriptions, labels }))
      .on("error", reject);
  });
}

// Prepare Data
async function prepareData() {
  const { jobDescriptions, labels } = await loadCSV("datasets/train.csv");

  // Sample resumes (replace with real data)
  const resumes = [
    "Software engineer with experience in JavaScript and AI.",
    "Data scientist skilled in machine learning and NLP.",
  ];

  const resumeEmbeddings = await Promise.all(resumes.map(getEmbedding));
  const jobEmbeddings = await Promise.all(jobDescriptions.map(getEmbedding));

  // Combine resume & job description embeddings as input
  const combinedInputs = resumeEmbeddings.map((resumeVec, i) =>
    [...resumeVec, ...jobEmbeddings[i]]
  );

  return {
    inputs: tf.tensor2d(combinedInputs),
    targets: tf.tensor2d(labels.map((score) => [score])),
  };
}

// Train Model
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

  // Save model (IndexedDB for browser, LocalStorage for Node.js workaround)
  await model.save("localstorage://resume-model");
}

// Run Training
trainModel();
