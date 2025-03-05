const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const resumeDir = "datasets/trainResumes"; // Change to "testResumes" for test data

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function processAllResumes() {
  const resumes = [];
  const files = fs.readdirSync(resumeDir);

  for (const file of files) {
    if (path.extname(file) === ".pdf") {
      const filePath = path.join(resumeDir, file);
      const text = await extractTextFromPDF(filePath);
      resumes.push({ filename: file, text });
    }
  }

  fs.writeFileSync("datasets/resumes.json", JSON.stringify(resumes, null, 2));
  console.log("✅ Extracted resume text saved to datasets/resumes.json");
}

processAllResumes();
