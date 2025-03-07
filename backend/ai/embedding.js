require('@tensorflow/tfjs'); // Use WebGL backend (browser-compatible)
const use = require('@tensorflow-models/universal-sentence-encoder');

async function getEmbedding(text) {
  const model = await use.load(); // Load model
  const embeddings = await model.embed([text]); // Generate embeddings
  return embeddings.arraySync()[0]; // Convert tensor to array
}

module.exports = { getEmbedding };
