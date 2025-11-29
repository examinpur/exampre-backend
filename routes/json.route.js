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
    jsonFile: jsonFile?.originalname,
    zipFile: zipFile?.originalname || "none",
  });

  const tempExtractPath = path?.join(__dirname, "../uploads", `temp_${Date.now()}`);

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
    const rawData = await fs.promises.readFile(jsonFile?.path, "utf-8");
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





// async function findOrCreateReference(model, field, value, additionalData = {}) {
//   if (!value || value.trim() === '') return null;
  
//   try {
//     const trimmedValue = value.trim();
    
//     // Try to find existing record (case-insensitive)
//     const query = {};
//     query[field] = { $regex: new RegExp(`^${trimmedValue}$`, 'i') };
    
//     let record = await model.findOne(query);
    
//     // If not found, create new record
//     if (!record) {
//       const newRecord = { [field]: trimmedValue, ...additionalData };
//       record = await model.create(newRecord);
//     }
    
//     return record._id;
//   } catch (error) {
//     console.error(`Error finding/creating ${model.modelName}:`, error);
//     return null;
//   }
// }


// app.post('/upload-docx', upload.single('docfile'), async (req, res) => {
//   const filePath = req.file.path;
//   const { questionBankParentId, createdBy, sectionIds } = req.body;
  
//   try {
//     const questionBanks = await questionBankModel.findOne({ _id: questionBankParentId });
//     const existingCount = await questionModel.countDocuments();
//     const data = await fs.promises.readFile(filePath);
//     const result = await mammoth.extractRawText({ buffer: data });
//     const text = result.value;
//     const parsedQuestions = parseQuestionsFromText(text);

//     if (parsedQuestions.length === 0) {
//       fs.unlinkSync(filePath);
//       return res.status(400).json({ message: "No valid questions found in the document." });
//     }
//     for (let i = 0; i < parsedQuestions.length; i++) {
//       const question = parsedQuestions[i];
//       const { type, questionText, marks, difficultyLevel, options, answerType, correctAnswer, blanks, passage, subQuestions, solution } = question;

//       if (!type || !questionText || !marks || !difficultyLevel) {
//         fs.unlinkSync(filePath);
//         return res.status(400).json({
//           message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`,
//         });
//       }
//       if (question.negativeMarksValue && question.negativeMarksValue > 0) {
//         question.negativeMarking = true;
//       } else {
//         question.negativeMarking = false;
//       }
//       switch (type) {
//         case "mcq":
//           if (!answerType) {
//             question.answerType = 'single';
//           }
//           if (!Array.isArray(options) || options.length < 2) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: MCQ questions must have at least 2 options.`,
//             });
//           }
//           const hasCorrectOption = options.some(opt => opt.isCorrect === true);
//           if (!hasCorrectOption) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: MCQ questions must have at least one correct option.`,
//             });
//           }
//           break;
        
//       case 'correctAnswer':
//         if (currentQuestion.type === 'truefalse') {
//           currentQuestion.correctAnswer = lowerLine === 'true';
//         } else if (currentQuestion.type === 'integerType') {
//           currentQuestion.correctAnswer = parseInt(line);
//         }
//         expectingValue = null;
//         break;
        
//       case 'blanks':
//         if (lowerLine === 'correctanswer') {
//           expectingValue = 'blankAnswer';
//         }
//         break;
        
//       case 'blankAnswer':
//         if (!currentQuestion.blanks) {
//           currentQuestion.blanks = [];
//         }
//         currentQuestion.blanks.push({
//           correctAnswer: line
//         });
//         expectingValue = 'blanks';
//         break;

//         case "truefalse":
//           if (correctAnswer === undefined || typeof correctAnswer !== "boolean") {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: True/False questions must have a boolean correctAnswer.`,
//             });
//           }
//           break;

//         case "fillintheblank":
//           if (!Array.isArray(blanks) || blanks.length === 0) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: Fill-in-the-blank questions must have at least one blank.`,
//             });
//           }
//           for (const blank of blanks) {
//             if (!blank.correctAnswer) {
//               fs.unlinkSync(filePath);
//               return res.status(400).json({
//                 message: `Question ${i + 1}: Each blank must have id and correctAnswer.`,
//               });
//             }
//           }
//           break;

//         case "integerType":
//           if (correctAnswer === undefined || typeof correctAnswer !== "number" || !Number.isInteger(correctAnswer)) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: Integer questions must have a numeric correctAnswer.`,
//             });
//           }
//           break;

//         case "comprehension":
//           if (!passage) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: Comprehension questions must have a passage.`,
//             });
//           }
//           if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
//             fs.unlinkSync(filePath);
//             return res.status(400).json({
//               message: `Question ${i + 1}: Comprehension questions must have at least one sub-question.`,
//             });
//           }
//           break;

//         default:
//           fs.unlinkSync(filePath);
//           return res.status(400).json({
//             message: `Question ${i + 1}: Invalid question type '${type}'.`,
//           });
//       }
//       try {
//         if (question.extractedSubject) {
//           question.subject = await findOrCreateReference(Subject, 'subject', question.extractedSubject);
//         } else {
//           question.subject = questionBanks.subject;
//         }

//         if (question.extractedClass) {
//           question.class = await findOrCreateReference(Class, 'class', question.extractedClass);
//         }
//         if (question.extractedCourse) {
//           question.course = await findOrCreateReference(CourseModel, 'course', question.extractedCourse);
//         }
//         if (question.extractedChapterName && question.subject) {
//           question.chapterName = await findOrCreateReference(
//             Chapter, 
//             'chapterName', 
//             question.extractedChapterName, 
//             { subjectId: question.subject }
//           );
//         } else {
//           question.chapterName = questionBanks.chapterName;
//         }
//         if (question.extractedTopic && question.chapterName && question.subject) {
//           question.topic = await findOrCreateReference(
//             Topic, 
//             'topic', 
//             question.extractedTopic, 
//             { 
//               chapterId: question.chapterName,
//               subjectId: question.subject 
//             }
//           );
//         } else {
//           question.topic = questionBanks.topic;
//         }

//       } catch (refError) {
//         question.subject = questionBanks.subject;
//         question.chapterName = questionBanks.chapterName;
//         question.topic = questionBanks.topic;
//       }
//       delete question.extractedSubject;
//       delete question.extractedClass;
//       delete question.extractedCourse;
//       delete question.extractedChapterName;
//       delete question.extractedTopic;
//       question.questionBankParentId = questionBankParentId ?? null;
//       question.createdBy = createdBy;
// question.sectionId = sectionIds
//   ? (Array.isArray(sectionIds)
//       ? sectionIds.map(id => new mongoose.Types.ObjectId(id))
//       : [new mongoose.Types.ObjectId(sectionIds)])
//   : [];      question.number = existingCount + i + 1;
//     }

//     const insertedQuestions = await questionModel.insertMany(parsedQuestions);
//     fs.unlinkSync(filePath);

//     res.status(201).json({
//       success: true,
//       message: `${insertedQuestions.length} questions parsed and created successfully`,
//       totalQuestions: insertedQuestions.length,
//       questions: insertedQuestions
//     });

//   } catch (error) {
//     try {
//       fs.unlinkSync(filePath);
//     } catch (unlinkError) {
//       console.error('Error deleting file:', unlinkError);
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while processing the document and creating questions.",
//       error: error.message
//     });
//   }
// });
// function parseQuestionsFromText(text) {
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
//   const questions = [];
//   let currentQuestion = null;
//   let expectingValue = null;
//   let optionIndex = 0;
//   let blankIndex = 0;
//   let optionUrlIndex = 0;
//   let solutionLines = [];

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];
//     const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
//     const lowerLine = line.toLowerCase();

//     if (lowerLine === 'question') {
//       if (currentQuestion && currentQuestion.questionText) {
//         if (solutionLines.length > 0) {
//           currentQuestion.solution = processSolutionLines(solutionLines);
//         }
//         questions.push(formatQuestion(currentQuestion));
//       }

//       currentQuestion = {
//         type: '',
//         questionText: '',
//         marks: 0,
//         negativeMarking: false,
//         negativeMarksValue: 0,
//         correctAnswer: null,
//         answerType: 'single',
//         options: [],
//         blanks: [],
//         extractedSubject: null,
//         extractedClass: null,
//         extractedCourse: null,
//         extractedChapterName: null,
//         extractedTopic: null,
//         extractedResource: null,
//         previousYearsQuestion: false,
//         year: '',
//         titles: []
//       };

//       expectingValue = 'questionText';
//       optionIndex = 0;
//       blankIndex = 0;
//       optionUrlIndex = 0;
//       solutionLines = [];
//       continue;
//     }

//     if (!currentQuestion) continue;

//     if (expectingValue === 'solution') {
//       const isNewField = [
//         'question', 'type', 'marks', 'negativemarksvalue', 'difficultylevel',
//         'subject', 'class', 'course', 'chaptername', 'topic', 'resources',
//         'previousyear', 'year', 'titles', 'correctanswer', 'option', 'optionurl', 'blanks'
//       ].includes(lowerLine);

//       if (isNewField) {
//         currentQuestion.solution = processSolutionLines(solutionLines);
//         solutionLines = [];
//         expectingValue = lowerLine;
//         i--; 
//       } else {
//         solutionLines.push(line);
//       }
//       continue;
//     }

//     if (lowerLine === 'solution') {
//       expectingValue = 'solution';
//       solutionLines = [];
//       continue;
//     }

//     if (lowerLine === 'questionimage' && nextLine.startsWith('https://')) {
//       currentQuestion.questionUrl = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'option') {
//       expectingValue = 'option';
//       currentQuestion.options.push({ text: '', isCorrect: false });
//       optionIndex = currentQuestion.options.length - 1;
//       continue;
//     }

//     if (lowerLine === 'optionurl' && nextLine.startsWith('https://')) {
//       if (optionUrlIndex < currentQuestion.options.length) {
//         currentQuestion.options[optionUrlIndex].optionUrl = nextLine;
//         optionUrlIndex++;
//       }
//       i++;
//       continue;
//     }

//     if (lowerLine === 'type') {
//       expectingValue = 'type';
//       continue;
//     }

//     if (lowerLine === 'marks') {
//       expectingValue = 'marks';
//       continue;
//     }

//     if (lowerLine === 'negativemarksvalue') {
//       expectingValue = 'negativeMarksValue';
//       continue;
//     }

//     if (lowerLine === 'difficultylevel') {
//       expectingValue = 'difficultyLevel';
//       continue;
//     }

//     if (lowerLine === 'subject' && nextLine) {
//       currentQuestion.extractedSubject = nextLine.toUpperCase();
//       i++;
//       continue;
//     }

//     if (lowerLine === 'class' && nextLine) {
//       currentQuestion.extractedClass = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'course' && nextLine) {
//       currentQuestion.extractedCourse = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'chaptername' && nextLine) {
//       currentQuestion.extractedChapterName = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'topic' && nextLine) {
//       currentQuestion.extractedTopic = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'resources' && nextLine) {
//       currentQuestion.resource = nextLine.toUpperCase();
//       i++;
//       continue;
//     }

//     if (lowerLine === 'previousyear' && nextLine) {
//       currentQuestion.previousYearsQuestion = nextLine.toLowerCase() === 'true';
//       i++;
//       continue;
//     }

//     if (lowerLine === 'year' && nextLine) {
//       currentQuestion.year = currentQuestion.previousYearsQuestion ? nextLine : '';
//       i++;
//       continue;
//     }

//     if (lowerLine === 'titles' && nextLine) {
//       currentQuestion.titles = currentQuestion.previousYearsQuestion ?
//         nextLine.split(',').map(title => title.trim()).filter(Boolean) : [];
//       i++;
//       continue;
//     }

//     if (lowerLine === 'correctanswer' && nextLine) {
//       currentQuestion.correctAnswer = nextLine;
//       i++;
//       continue;
//     }

//     if (lowerLine === 'blanks' && nextLine !== 'blanks') {
//       currentQuestion.blanks.push({ correctAnswer: nextLine });
//       i++;
//       continue;
//     }

//     switch (expectingValue) {
//       case 'questionText':
//         if (currentQuestion.questionText === '') {
//           currentQuestion.questionText = line;
//           expectingValue = null;
//         }
//         break;

//       case 'option':
//         if (currentQuestion.options[optionIndex] && currentQuestion.options[optionIndex].text === '') {
//           currentQuestion.options[optionIndex].text = line;
//           expectingValue = 'optionCorrectness';
//         }
//         break;

//       case 'optionCorrectness':
//         if (lowerLine === 'correct' || lowerLine === 'incorrect') {
//           currentQuestion.options[optionIndex].isCorrect = (lowerLine === 'correct');
//           expectingValue = null;
//         }
//         break;

//       case 'type':
//         if (['mcq', 'truefalse', 'fillintheblank', 'integertype', 'comprehension'].includes(lowerLine)) {
//           currentQuestion.type = lowerLine === 'integertype' ? 'integerType' : lowerLine;
//           expectingValue = null;
//         }
//         break;

//       case 'marks':
//         if (!isNaN(line)) {
//           currentQuestion.marks = parseInt(line);
//           expectingValue = null;
//         }
//         break;

//       case 'negativeMarksValue':
//         if (!isNaN(line)) {
//           currentQuestion.negativeMarksValue = parseFloat(line);
//           expectingValue = null;
//         }
//         break;

//       case 'difficultyLevel':
//         if (['easy', 'medium', 'hard'].includes(lowerLine)) {
//           currentQuestion.difficultyLevel = lowerLine;
//           expectingValue = null;
//         }
//         break;

//       default:
//         break;
//     }
//   }
//   if (currentQuestion && currentQuestion.questionText) {
//     if (solutionLines.length > 0) {
//       currentQuestion.solution = processSolutionLines(solutionLines);
//     }
//     questions.push(formatQuestion(currentQuestion));
//   }

//   return questions.filter(q => q.type !== 'comprehension');
// }
// function processSolutionLines(lines) {
//   if (lines.length === 1 && lines[0].includes('$$')) {
//     const segments = lines[0].split('$$').filter(Boolean);
//     return segments.map(seg => `$$${seg}$$`).join('\n');
//   } else {
//     return lines.join('\n');
//   }
// }

// function formatQuestion(question) {
//   const formattedQuestion = {
//     type: question.type,
//     questionText: question.questionText,
//     marks: question.marks || 1,
//     negativeMarking: question.negativeMarking,
//     negativeMarksValue: question.negativeMarksValue,
//     difficultyLevel: question.difficultyLevel || 'easy',
//     solution: question.solution || '',
//     previousYearsQuestion: question.previousYearsQuestion || false,
//     year: question.year || '',
//     resource: question.resource || '',
//     titles: question.titles || []
//   };
//   console.log(1,question);
//   if (question.questionUrl) {
//     formattedQuestion.questionUrl = question.questionUrl;
//   }
  
//   if (question.extractedSubject) formattedQuestion.extractedSubject = question.extractedSubject;
//   if (question.extractedClass) formattedQuestion.extractedClass = question.extractedClass;
//   if (question.extractedCourse) formattedQuestion.extractedCourse = question.extractedCourse;
//   if (question.extractedChapterName) formattedQuestion.extractedChapterName = question.extractedChapterName;
//   if (question.extractedTopic) formattedQuestion.extractedTopic = question.extractedTopic;
  
//   switch (question.type) {
//     case 'mcq':
//       formattedQuestion.answerType = 'single';
//       formattedQuestion.options = question.options ? question.options.filter(opt => opt.text.trim() !== '') : [];
//       formattedQuestion.blanks = [];
//       break;
      
//     case 'truefalse':
//       formattedQuestion.correctAnswer = question.correctAnswer === "true" ? true : false;
//       formattedQuestion.options = [];
//       formattedQuestion.blanks = [];
//       break;
      
//     case 'fillintheblank':
//       formattedQuestion.blanks = question.blanks || [];
//       formattedQuestion.options = [];
//       break;
      
//     case 'integerType':
//       formattedQuestion.correctAnswer = parseInt(question.correctAnswer);
//       formattedQuestion.options = [];
//       formattedQuestion.blanks = [];
//       break;
      
//     default:
//       formattedQuestion.options = [];
//       formattedQuestion.blanks = [];
//       break;
//   }
  
//   return formattedQuestion;
// }