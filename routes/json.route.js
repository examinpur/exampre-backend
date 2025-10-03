// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const AdmZip = require("adm-zip");
// const cloudinary = require("cloudinary").v2;
// const { questionModel } = require("../model/Questions");
// const Subject = require("../model/subject");
// const Class = require("../model/class");
// const Chapter = require("../model/chapterName");
// const Topic = require("../model/topic");

// const upload = multer({ dest: "uploads/" });
// const routerJSON = express.Router();

// cloudinary.config({ 
//   cloud_name: 'dvh5crcf9', 
//   api_key: '244819348473191', 
//   api_secret: 'XL6sSyFzrGWIa9LRGQYRb_c3qPE' 
// });

// async function findOrCreateReference(model, field, value, additionalData = {}) {
//   if (!value || !value.trim()) return null;
//   const trimmed = value.trim();
//   const record = await model.findOneAndUpdate(
//     { [field]: trimmed },
//     { $setOnInsert: { [field]: trimmed, ...additionalData } },
//     {
//       new: true,
//       upsert: true,
//       collation: { locale: "en", strength: 2 }
//     }
//   );
//   return record._id;
// }

// function mapQuestionType(questionTypeRaw) {
//   if (!questionTypeRaw) return null;
//   const qt = questionTypeRaw.toLowerCase();
//   if (qt.includes("mcq")) return "mcq";
//   if (qt.includes("truefalse") || qt.includes("true/false")) return "truefalse";
//   if (qt.includes("fill")) return "fillintheblank";
//   if (qt.includes("numeric") || qt.includes("integer")) return "integerType";
//   if (qt.includes("comprehension")) return "comprehension";
//   return null;
// }

// function normalizeLatex(input = "") {
//   if (!input) return "";
//   let str = String(input);
//   str = str.replace(/<\/?p>/gi, "");
//   str = str.replace(/\\\((.*?)\\\)/g, (_, expr) => `$${expr}$`);
//   str = str.replace(/\\\[(.*?)\\\]/gs, (_, expr) => `\\[${expr}\\]`);
//   str = str.replace(/<sub>(.*?)<\/sub>/gi, "_{$1}");
//   str = str.replace(/<sup>(.*?)<\/sup>/gi, "^{$1}");
//   str = str.replace(/\{\{(.*?)\}\}/g, "$1");
//   str = str.replace(/~/g, "\\,");
//   str = str.replace(
//     /\b([A-Z][a-z]?)(\d+)?([+-])?\b/g,
//     (match, element, num, charge) => {
//       let res = element;
//       if (num) res += `_{${num}}`;
//       if (charge) res += `^{${charge}}`;
//       return `\\mathrm{${res}}`;
//     }
//   );

//   return str.trim();
// }


// async function uploadImageToCloudinary(imageBuffer, folderName, filename) {
//   console.log(`Uploading image ${filename} to Cloudinary...`);
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream({
//       folder: folderName,
//       public_id: path.parse(filename).name,
//       overwrite: true
//     }, (error, result) => {
//       if (error) {
//         console.error(`Cloudinary upload failed for ${filename}:`, error);
//         reject(error);
//       } else {
//         console.log(`Cloudinary upload succeeded for ${filename}`);
//         resolve(result.secure_url);
//       }
//     });

//     stream.end(imageBuffer);
//   });
// }

// // Helper function to recursively find image files in extracted directory
// function findImageFiles(dir, imageMap = {}) {
//   const files = fs.readdirSync(dir);
  
//   files.forEach(file => {
//     const fullPath = path.join(dir, file);
//     const stat = fs.statSync(fullPath);
    
//     if (stat.isDirectory()) {
//       // Recursively search in subdirectories
//       findImageFiles(fullPath, imageMap);
//     } else if (stat.isFile()) {
//       // Check if it's an image file
//       const ext = path.extname(file).toLowerCase();
//       if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)) {
//         const nameWithoutExt = path.parse(file).name;
//         console.log(`Mapping image: ${file} (${nameWithoutExt}) -> ${fullPath}`);
//         // Map both with and without extension for flexibility
//         imageMap[file] = fullPath;
//         imageMap[nameWithoutExt] = fullPath;
//       }
//     }
//   });
  
//   return imageMap;
// }

// const multiUpload = upload.fields([
//   { name: "jsonfile", maxCount: 1 },
//   { name: "zipfile", maxCount: 1 }
// ]);

// routerJSON.post("/upload-json", multiUpload, async (req, res) => {
//   console.log("Received upload request");

//   const jsonFile = req.files?.jsonfile?.[0];
//   const zipFile = req.files?.zipfile?.[0];

//   if (!jsonFile || !zipFile) {
//     console.error("JSON file or ZIP file missing");
//     return res.status(400).json({ message: "JSON file and zip file are required" });
//   }

//   console.log("Files received:", {
//     jsonFile: jsonFile.originalname,
//     zipFile: zipFile.originalname
//   });

//   const tempExtractPath = path.join(__dirname, "../uploads", `temp_${Date.now()}`);
//   try {
//     // Extract zip file
//     console.log("Extracting zip file...");
//     const zip = new AdmZip(zipFile.path);
//     zip.extractAllTo(tempExtractPath, true);

//     console.log("Zip extracted to", tempExtractPath);

//     // Recursively find all image files in the extracted directory
//     const imageMap = findImageFiles(tempExtractPath);
//     console.log("Image files found:", Object.keys(imageMap));

//     // Read and parse JSON
//     console.log("Reading JSON file...");
//     const rawData = await fs.promises.readFile(jsonFile.path, "utf-8");
//     const questions = JSON.parse(rawData);

//     if (!Array.isArray(questions)) {
//       throw new Error("Uploaded JSON must be an array");
//     }
//     console.log(`Parsed ${questions.length} questions`);

//     const { questionBankParentId, createdBy, sectionIds } = req.body;
//     const formattedQuestions = [];
//     const count = await questionModel.countDocuments({});
// console.log("Total questions:", count);


//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       console.log(`Processing question ${i + 1}`);

//       const type = mapQuestionType(q.metadata?.question_type);
//       if (!type) {
//         throw new Error(`Question ${i + 1}: Invalid question_type '${q.metadata?.question_type}'`);
//       }

//       const subjectId = await findOrCreateReference(Subject, "subject", q.metadata?.subject);
//       const classId = await findOrCreateReference(Class, "class", q.metadata?.class);
//       const chapterId = await findOrCreateReference(Chapter, "chapterName", q.metadata?.chapter, { subjectId });
//       const topicId = await findOrCreateReference(Topic, "topic", q.metadata?.topic, { chapterId, subjectId });

//       const folderName = "questions";

//       // Process question images
//       const questionUrl = [];
//       for (const img of q.question_images || []) {
//         const filename = path.basename(img.hosted_url);
//         const nameWithoutExt = path.parse(filename).name;
        
//         console.log(`Looking for question image: ${filename} or ${nameWithoutExt}`);
        
//         const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
//         if (imagePath) {
//           console.log(`Found image ${filename}, uploading...`);
//           const buffer = fs.readFileSync(imagePath);
//           const url = await uploadImageToCloudinary(buffer, folderName, filename);
//           const obj = {url , style : img.style || ""};
//           questionUrl.push(obj);
//         } else {
//           console.warn(`Question image file not found: ${filename} (also tried ${nameWithoutExt})`);
//         }
//       }

//       // Process solution images
//       const solutionUrl = [];
//       for (const img of q.solution_images || []) {
//         const filename = path.basename(img.hosted_url);
//         const nameWithoutExt = path.parse(filename).name;
        
//         console.log(`Looking for solution image: ${filename} or ${nameWithoutExt}`);
        
//         const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
//         if (imagePath) {
//           console.log(`Found image ${filename}, uploading...`);
//           const buffer = fs.readFileSync(imagePath);
//           const url = await uploadImageToCloudinary(buffer, folderName, filename);
//           const obj = {url,style : img.style || ""};
//           solutionUrl.push(obj);
//         } else {
//           console.warn(`Solution image file not found: ${filename} (also tried ${nameWithoutExt})`);
//         }
//       }

//       // Process MCQ options with images
//       const processedOptions = [];
//       if (type === "mcq" && q.options && Array.isArray(q.options)) {
//         for (const option of q.options) {
//           const optionImageUrls = [];
          
//           // Process option images
//           for (const img of option.option_images || []) {
//             const filename = path.basename(img.hosted_url);
//             const nameWithoutExt = path.parse(filename).name;
            
//             console.log(`Looking for option image: ${filename} or ${nameWithoutExt}`);
            
//             const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
//             if (imagePath) {
//               console.log(`Found option image ${filename}, uploading...`);
//               const buffer = fs.readFileSync(imagePath);
//               const url = await uploadImageToCloudinary(buffer, folderName, filename);
//               // Format as object to match schema expectations
//               optionImageUrls.push({
//                 url: url,
//                 style: img.style || '',
//               });
//             } else {
//               console.warn(`Option image file not found: ${filename} (also tried ${nameWithoutExt})`);
//             }
//           }

//        processedOptions.push({
//   option_letter: option.option_letter || "",   // if exists, else empty
//   text: normalizeLatex(option.option_text || ""),
//   isCorrect: option.is_correct || false,
//   optionUrl: optionImageUrls   // not optionImages
// });

//         }
//       }
//       const current = Number(count) + Number(i + 1);
//       // console.log("q",q);
//       const formatted = {
//         type,
//         question_id: q.question_id ? String(q.question_id) : "",
//         questionText: normalizeLatex(q.question_text || ""),
//         questionUrl,
//         solution: normalizeLatex(q.solution_text || ""),
//         solutionUrl,
//         options: type === "mcq" ? processedOptions : [],
//         subject: subjectId,
//         class: classId,
//         chapterName: chapterId,
//         topic: topicId,
//         difficultyLevel: q.metadata?.level?.toLowerCase() || "easy",
//         createdBy: createdBy || req.user?._id || "system",
//         questionBankParentId: questionBankParentId || null,
//         sectionId: Array.isArray(sectionIds) ? sectionIds : (sectionIds ? [sectionIds] : []),
//         resource: "json-import",
//         previousYearsQuestion: false,
//         titles: [],
//         number: current,
//       }; 
//       formattedQuestions.push(formatted);
//     }

//     console.log("Inserting questions into database...");
//     const inserted = await questionModel.insertMany(formattedQuestions);

//     console.log(`Successfully inserted ${inserted.length} questions`);

//     res.status(201).json({
//       success: true,
//       message: `${inserted.length} questions added successfully`,
//       questions: inserted
//     });

//   } catch (err) {
//     console.error("Error during processing:", err);
//     return res.status(500).json({ message: "Failed to process upload", error: err.message });
//   } finally {
//     try {
//       console.log("Cleaning up temporary files...");
//       if (jsonFile?.path && fs.existsSync(jsonFile.path)) {
//         fs.unlinkSync(jsonFile.path);
//         console.log("Deleted JSON file");
//       }
//       if (zipFile?.path && fs.existsSync(zipFile.path)) {
//         fs.unlinkSync(zipFile.path);
//         console.log("Deleted ZIP file");
//       }
//       if (fs.existsSync(tempExtractPath)) {
//         fs.rmSync(tempExtractPath, { recursive: true, force: true });
//         console.log("Deleted extracted folder");
//       }
//     } catch (cleanupErr) {
//       console.error("Cleanup error:", cleanupErr);
//     }
//   }
// });

// module.exports = routerJSON;



const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const cloudinary = require("cloudinary").v2;
const { questionModel } = require("../model/Questions");
const Subject = require("../model/subject");
const Class = require("../model/class");
const Chapter = require("../model/chapterName");
const Topic = require("../model/topic");

const upload = multer({ dest: "uploads/" });
const routerJSON = express.Router();

cloudinary.config({
  cloud_name: "dvh5crcf9",
  api_key: "244819348473191",
  api_secret: "XL6sSyFzrGWIa9LRGQYRb_c3qPE",
});

async function findOrCreateReference(model, field, value, additionalData = {}) {
  if (!value || !value.trim()) return null;
  const trimmed = value.trim();
  const record = await model.findOneAndUpdate(
    { [field]: trimmed },
    { $setOnInsert: { [field]: trimmed, ...additionalData } },
    {
      new: true,
      upsert: true,
      collation: { locale: "en", strength: 2 },
    }
  );
  return record._id;
}

function mapQuestionType(questionTypeRaw) {
  if (!questionTypeRaw) return null;
  const qt = questionTypeRaw.toLowerCase();
  if (qt.includes("mcq")) return "mcq";
  if (qt.includes("truefalse") || qt.includes("true/false")) return "truefalse";
  if (qt.includes("fill")) return "fillintheblank";
  if (qt.includes("numeric") || qt.includes("integer")) return "integerType";
  if (qt.includes("comprehension")) return "comprehension";
  return null;
}

/**
 * Clean HTML, normalize LaTeX for KaTeX frontend
 * - Removes <p>, <span>, inline styles
 * - Converts \(...\) → $...$
 * - Ensures \ → \\, { → {{}}, } → }}
 */
function normalizeLatex(input = "") {
  if (!input) return "";

  let str = String(input);

  return str.trim();
}

async function uploadImageToCloudinary(imageBuffer, folderName, filename) {
  console.log(`Uploading image ${filename} to Cloudinary...`);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: path.parse(filename).name,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload failed for ${filename}:`, error);
          reject(error);
        } else {
          console.log(`Cloudinary upload succeeded for ${filename}`);
          resolve(result.secure_url);
        }
      }
    );

    stream.end(imageBuffer);
  });
}

// Recursively find image files in extracted directory
function findImageFiles(dir, imageMap = {}) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findImageFiles(fullPath, imageMap);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"].includes(ext)) {
        const nameWithoutExt = path.parse(file).name;
        imageMap[file] = fullPath;
        imageMap[nameWithoutExt] = fullPath;
      }
    }
  });

  return imageMap;
}

const multiUpload = upload.fields([
  { name: "jsonfile", maxCount: 1 },
  { name: "zipfile", maxCount: 1 },
]);

routerJSON.post("/upload-json", multiUpload, async (req, res) => {
  console.log("Received upload request");

  const jsonFile = req.files?.jsonfile?.[0];
  const zipFile = req.files?.zipfile?.[0];

  if (!jsonFile) {
    return res.status(400).json({ message: "JSON file is required" });
  }

  console.log("Files received:", {
    jsonFile: jsonFile.originalname,
    zipFile: zipFile?.originalname || "none",
  });

  const tempExtractPath = path.join(__dirname, "../uploads", `temp_${Date.now()}`);

  try {
    // Extract zip if present
    let imageMap = {};
    if (zipFile) {
      console.log("Extracting zip file...");
      const zip = new AdmZip(zipFile.path);
      zip.extractAllTo(tempExtractPath, true);
      imageMap = findImageFiles(tempExtractPath);
      console.log("Image files found:", Object.keys(imageMap));
    }

    // Parse JSON
    const rawData = await fs.promises.readFile(jsonFile.path, "utf-8");
    const questions = JSON.parse(rawData);

    if (!Array.isArray(questions)) {
      throw new Error("Uploaded JSON must be an array");
    }
    console.log(`Parsed ${questions.length} questions`);

    const { questionBankParentId, createdBy, sectionIds } = req.body;
    const formattedQuestions = [];
    const count = await questionModel.countDocuments({});

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`Processing question ${i + 1}`);

      const type = mapQuestionType(q.metadata?.question_type);
      if (!type) {
        throw new Error(
          `Question ${i + 1}: Invalid question_type '${q.metadata?.question_type}'`
        );
      }

      const subjectId = await findOrCreateReference(
        Subject,
        "subject",
        q.metadata?.subject
      );
      const classId = await findOrCreateReference(
        Class,
        "class",
        q.metadata?.class
      );
      const chapterId = await findOrCreateReference(
        Chapter,
        "chapterName",
        q.metadata?.chapter,
        { subjectId }
      );
      const topicId = await findOrCreateReference(
        Topic,
        "topic",
        q.metadata?.topic,
        { chapterId, subjectId }
      );

      const folderName = "questions";

      // Question images
      const questionUrl = [];
      for (const img of q.question_images || []) {
        const filename = path.basename(img.hosted_url);
        const nameWithoutExt = path.parse(filename).name;
        const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
        if (imagePath) {
          const buffer = fs.readFileSync(imagePath);
          const url = await uploadImageToCloudinary(buffer, folderName, filename);
          questionUrl.push({ url, style: img.style || "" });
        }
      }

      // Solution images
      const solutionUrl = [];
      for (const img of q.solution_images || []) {
        const filename = path.basename(img.hosted_url);
        const nameWithoutExt = path.parse(filename).name;
        const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
        if (imagePath) {
          const buffer = fs.readFileSync(imagePath);
          const url = await uploadImageToCloudinary(buffer, folderName, filename);
          solutionUrl.push({ url, style: img.style || "" });
        }
      }

      // MCQ options
      const processedOptions = [];
      if (type === "mcq" && q.options && Array.isArray(q.options)) {
        for (const option of q.options) {
          const optionImageUrls = [];
          for (const img of option.option_images || []) {
            const filename = path.basename(img.hosted_url);
            const nameWithoutExt = path.parse(filename).name;
            const imagePath = imageMap[filename] || imageMap[nameWithoutExt];
            if (imagePath) {
              const buffer = fs.readFileSync(imagePath);
              const url = await uploadImageToCloudinary(buffer, folderName, filename);
              optionImageUrls.push({ url, style: img.style || "" });
            }
          }
          processedOptions.push({
            option_letter: option.option_letter || "",
            text: normalizeLatex(option.option_text || ""),
            isCorrect: option.is_correct || false,
            optionUrl: optionImageUrls,
          });
        }
      }

      const current = Number(count) + Number(i + 1);

      const formatted = {
        type,
        question_id: q.question_id ? String(q.question_id) : "",
        questionText: normalizeLatex(q.question_text || ""),
        questionUrl,
        solution: normalizeLatex(q.solution_text || ""),
        solutionUrl,
        options: type === "mcq" ? processedOptions : [],
        subject: subjectId,
        class: classId,
        chapterName: chapterId,
        topic: topicId,
        difficultyLevel: q.metadata?.level?.toLowerCase() || "easy",
        createdBy: createdBy || req.user?._id || "system",
        questionBankParentId: questionBankParentId || null,
        sectionId: Array.isArray(sectionIds)
          ? sectionIds
          : sectionIds
          ? [sectionIds]
          : [],
        resource: "json-import",
        previousYearsQuestion: false,
        titles: [],
        number: current,
      };
      formattedQuestions.push(formatted);
    }

    console.log("Inserting questions into database...");
    const inserted = await questionModel.insertMany(formattedQuestions);

    console.log(`Successfully inserted ${inserted.length} questions`);

    res.status(201).json({
      success: true,
      message: `${inserted.length} questions added successfully`,
      questions: inserted,
    });
  } catch (err) {
    console.error("Error during processing:", err);
    return res
      .status(500)
      .json({ message: "Failed to process upload", error: err.message });
  } finally {
    try {
      if (jsonFile?.path && fs.existsSync(jsonFile.path)) fs.unlinkSync(jsonFile.path);
      if (zipFile?.path && fs.existsSync(zipFile.path)) fs.unlinkSync(zipFile.path);
      if (fs.existsSync(tempExtractPath))
        fs.rmSync(tempExtractPath, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }
  }
});

module.exports = routerJSON;
