const { getEmbedding } = require('./ai/embedding');

(async () => {
  const text = "Software engineer with 5 years of experience in JavaScript and AI.";
  await getEmbedding(text)
  .then(embedding => console.log("Embedding:", embedding))
  .catch(error => console.error("Error:", error));
})();
