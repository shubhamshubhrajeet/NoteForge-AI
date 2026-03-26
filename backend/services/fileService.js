const fs = require("fs");
const crypto = require("crypto");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function computeFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (d) => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function extractTextContent(filePath, mimeType) {
  try {
    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text.substring(0, 1000);
    }
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.substring(0, 1000);
    }
    if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf8").substring(0, 1000);
    }
    return null;
  } catch (err) {
    console.warn("Text extraction failed:", err.message);
    return null;
  }
}

function deleteFileFromDisk(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

module.exports = { computeFileHash, extractTextContent, deleteFileFromDisk };
