const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const connect = require("./database/db");
const { libraryRoutes } = require("./routes/library.route");
const { adminRoutes } = require("./routes/admin.routes");
const { GloballibraryRoutes } = require("./routes/globalLibrary.routes");
const questionBankRoutes = require("./routes/QuestionBank.routes");
const fs = require('fs');
const mammoth = require("mammoth");
const multer = require("multer");
const practiceTestRoutes = require("./routes/practiceTest.routes");
const batchRoutes = require("./routes/batch.routes");
const questionsRoutes = require("./routes/question.routes");
const { questionModel } = require("./model/Questions");
const { questionBankModel } = require("./model/QuestionBank");
const solutionRouter = require("./routes/solution.routes");
const userRoutes = require("./routes/user.routes");
const topicRouter = require("./routes/topic.route");
const chapterRouter = require("./routes/chapterName.route");
const classRouter = require("./routes/class.route");
const subjectRouter = require("./routes/subject.route");
const courseRouter = require("./routes/course.route");
const FormRouter = require("./routes/form.routes");
const Topic = require("./model/topic");
const Chapter = require("./model/chapterName");
const Subject = require("./model/subject");
const Class = require("./model/class");
const CourseModel = require("./model/course");
const { default: mongoose } = require("mongoose");
const routerJSON = require("./routes/json.route");
const path = require("path");
dotenv.config();
const app = express();
app.use(helmet());

app.use(express.json());
app.use(compression());
app.use(morgan('dev'));



const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.get('/', (req, res) => {
  res.send('API is running...');
});
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/library', libraryRoutes);
app.use('/api/admin',adminRoutes)
app.use("/api/global-library" , GloballibraryRoutes);
app.use("/api/question-bank",questionBankRoutes);
app.use("/api/practice-test", practiceTestRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/questions", questionsRoutes);
app.use('/api/solutions', solutionRouter);
app.use('/api/users', userRoutes);
app.use("/api/subject", subjectRouter);
app.use("/api/class", classRouter);
app.use("/api/chapter", chapterRouter);
app.use("/api/topic", topicRouter);
app.use("/api/course", courseRouter);
app.use("/api/form", FormRouter);
app.use("/api",routerJSON)
// **************************************************
// Quilt of courage:- 

const {
  BREVO_API_KEY,
  FROM_EMAIL,
  FROM_NAME = 'Quilt Of Courage',
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PROJECT_ID
} = process.env;


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    }),
  });
}
const db = admin.firestore();

if (!BREVO_API_KEY) console.warn('WARN: BREVO_API_KEY missing in .env');
if (!FROM_EMAIL) console.warn('WARN: FROM_EMAIL missing in .env');

const defaultClient = Sib.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = BREVO_API_KEY;

const emailsApi = new Sib.TransactionalEmailsApi();

app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    if (!FROM_EMAIL) {
      return res.status(500).json({ error: 'Server not configured: FROM_EMAIL missing.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    await db.collection('email')
      .doc(normalizedEmail)
      .set(
        {
          email: normalizedEmail,
          subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    const sendSmtpEmail = {
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email }],
      subject: 'Welcome Quilt Of Courage!',
      htmlContent: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to The Quilt of Courage</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <!-- Preheader text -->
    <div style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">Thank you for joining our community.</div>
    
    <!-- Main Email Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; margin: 0; padding: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tr>
                        <td style="background-color: #F75D45; padding: 20px 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">The Quilt of Courage</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 25px 25px; background-color: #ffffff;">
                            <h2 style="color: #333333; font-size: 24px; font-weight: bold; margin: 0 0 8px 0; line-height: 1.3;">
                                Welcome to The Quilt of Courage
                            </h2>
                            
                            <p style="color: #333333; font-size: 18px; line-height: 1.5; margin: 0 0 12px 0;">Hello,</p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                Thank you for subscribing and for choosing to be part of The Quilt of Courage community. By joining us, you are adding a vital thread to a growing tapestry of support, resilience, and hope.
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                This newsletter is one of the ways we stitch our community together. You can expect to receive:
                            </p>
                            
                            <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 12px 0; padding-left: 20px;">
                                <li style="margin-bottom: 6px;">Updates on new patches and stories added to the quilt</li>
                                <li style="margin-bottom: 6px;">Carefully curated resources for healing and support</li>
                                <li style="margin-bottom: 6px;">Occasional insights and words of strength from our community</li>
                            </ul>
                            
                            <div style="border-top: 2px solid #f0f0f0; margin: 18px 0;"></div>
                            
                            <h3 style="color: #FF6A00; font-size: 22px; font-weight: bold; margin: 18px 0 10px 0; line-height: 1.4;">A Community of Support</h3>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                Your journey is your own, but you do not have to walk it alone. The Quilt exists as a testament to the collective strength found in sharing and witnessing each other's courage.
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                If you are looking for support at this moment, our collection of resources is available anytime:
                            </p>
                            
                            <div style="text-align: center; margin: 16px 0;">
                                <a href="https://www.thequiltofcourage.org/resources" style="display: inline-block; padding: 12px 28px; background-color: #FF6A00; color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; text-align: center; margin: 0;">View Resources</a>
                            </div>
                            
                            <div style="border-top: 2px solid #f0f0f0; margin: 18px 0;"></div>
                            
                            <h3 style="color: #FF6A00; font-size: 22px; font-weight: bold; margin: 18px 0 10px 0; line-height: 1.4;">Weave Your Thread</h3>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                If you feel ready, we invite you to contribute your own patch to this living tapestry.
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
                                <strong>Share Your Story of Courage</strong>
                            </p>
                            
                            <div style="text-align: center; margin: 16px 0;">
                                <a href="https://www.thequiltofcourage.org/quilt-form" style="display: inline-block; padding: 12px 28px; background-color: #FF6A00; color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; text-align: center; margin: 0;">Add Your Patch</a>
                            </div>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 18px 0 0 0;">
                                Your presence here matters. Thank you for helping us create a blanket of solidarity that offers warmth and proof that no one is alone.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #F75D45; padding: 20px 15px; text-align: center;">
                            <p style="color: #ffffff; font-size: 14px; line-height: 1.5; margin: 0 0 6px 0;">
                                With gratitude and solidarity,
                            </p>
                            <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 12px 0 0 0;">
                                The Team at The Quilt of Courage
                            </p>
                            <p style="color: #ffffff; font-size: 12px; line-height: 1.5; margin: 12px 0 0 0;">
                                © 2025 Eagles Empowered to Soar (EEtS)
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

      `,
    };

    const resp = await emailsApi.sendTransacEmail(sendSmtpEmail);

    return res.json({
      message: 'Welcome email sent.',
      id: resp?.messageId || resp?.messageIds || resp
    });
  } catch (err) {
    console.error('Send error:', err);
    
    const details = err?.response?.text || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Failed to send email.', details });
  }
});

// *****************************************************

async function findOrCreateReference(model, field, value, additionalData = {}) {
  if (!value || value.trim() === '') return null;
  
  try {
    const trimmedValue = value.trim();
    
    // Try to find existing record (case-insensitive)
    const query = {};
    query[field] = { $regex: new RegExp(`^${trimmedValue}$`, 'i') };
    
    let record = await model.findOne(query);
    
    // If not found, create new record
    if (!record) {
      const newRecord = { [field]: trimmedValue, ...additionalData };
      record = await model.create(newRecord);
    }
    
    return record._id;
  } catch (error) {
    console.error(`Error finding/creating ${model.modelName}:`, error);
    return null;
  }
}


app.post('/upload-docx', upload.single('docfile'), async (req, res) => {
  const filePath = req.file.path;
  const { questionBankParentId, createdBy, sectionIds } = req.body;
  
  try {
    const questionBanks = await questionBankModel.findOne({ _id: questionBankParentId });
    const existingCount = await questionModel.countDocuments();
    const data = await fs.promises.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: data });
    const text = result.value;
    const parsedQuestions = parseQuestionsFromText(text);

    if (parsedQuestions.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "No valid questions found in the document." });
    }

    // Process each question and resolve references
    for (let i = 0; i < parsedQuestions.length; i++) {
      const question = parsedQuestions[i];
      const { type, questionText, marks, difficultyLevel, options, answerType, correctAnswer, blanks, passage, subQuestions, solution } = question;

      // Validate required fields
      if (!type || !questionText || !marks || !difficultyLevel) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`,
        });
      }

      // Fix negativeMarking logic
      if (question.negativeMarksValue && question.negativeMarksValue > 0) {
        question.negativeMarking = true;
      } else {
        question.negativeMarking = false;
      }

      // Type-specific validation
      switch (type) {
        case "mcq":
          if (!answerType) {
            question.answerType = 'single';
          }
          if (!Array.isArray(options) || options.length < 2) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: MCQ questions must have at least 2 options.`,
            });
          }
          const hasCorrectOption = options.some(opt => opt.isCorrect === true);
          if (!hasCorrectOption) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: MCQ questions must have at least one correct option.`,
            });
          }
          break;
        
      case 'correctAnswer':
        if (currentQuestion.type === 'truefalse') {
          currentQuestion.correctAnswer = lowerLine === 'true';
        } else if (currentQuestion.type === 'integerType') {
          currentQuestion.correctAnswer = parseInt(line);
        }
        expectingValue = null;
        break;
        
      case 'blanks':
        if (lowerLine === 'correctanswer') {
          expectingValue = 'blankAnswer';
        }
        break;
        
      case 'blankAnswer':
        if (!currentQuestion.blanks) {
          currentQuestion.blanks = [];
        }
        currentQuestion.blanks.push({
          correctAnswer: line
        });
        expectingValue = 'blanks'; // Go back to expecting blanks for next blank
        break;

        case "truefalse":
          if (correctAnswer === undefined || typeof correctAnswer !== "boolean") {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: True/False questions must have a boolean correctAnswer.`,
            });
          }
          break;

        case "fillintheblank":
          if (!Array.isArray(blanks) || blanks.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: Fill-in-the-blank questions must have at least one blank.`,
            });
          }
          for (const blank of blanks) {
            if (!blank.correctAnswer) {
              fs.unlinkSync(filePath);
              return res.status(400).json({
                message: `Question ${i + 1}: Each blank must have id and correctAnswer.`,
              });
            }
          }
          break;

        case "integerType":
          if (correctAnswer === undefined || typeof correctAnswer !== "number" || !Number.isInteger(correctAnswer)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: Integer questions must have a numeric correctAnswer.`,
            });
          }
          break;

        case "comprehension":
          if (!passage) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: Comprehension questions must have a passage.`,
            });
          }
          if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              message: `Question ${i + 1}: Comprehension questions must have at least one sub-question.`,
            });
          }
          break;

        default:
          fs.unlinkSync(filePath);
          return res.status(400).json({
            message: `Question ${i + 1}: Invalid question type '${type}'.`,
          });
      }
      try {
        if (question.extractedSubject) {
          question.subject = await findOrCreateReference(Subject, 'subject', question.extractedSubject);
        } else {
          question.subject = questionBanks.subject;
        }

        // Find or create class
        if (question.extractedClass) {
          question.class = await findOrCreateReference(Class, 'class', question.extractedClass);
        }

        // Find or create course
        if (question.extractedCourse) {
          question.course = await findOrCreateReference(CourseModel, 'course', question.extractedCourse);
        }

        // Find or create chapter (needs subjectId)
        if (question.extractedChapterName && question.subject) {
          question.chapterName = await findOrCreateReference(
            Chapter, 
            'chapterName', 
            question.extractedChapterName, 
            { subjectId: question.subject }
          );
        } else {
          question.chapterName = questionBanks.chapterName;
        }

        // Find or create topic (needs chapterId and subjectId)
        if (question.extractedTopic && question.chapterName && question.subject) {
          question.topic = await findOrCreateReference(
            Topic, 
            'topic', 
            question.extractedTopic, 
            { 
              chapterId: question.chapterName,
              subjectId: question.subject 
            }
          );
        } else {
          question.topic = questionBanks.topic;
        }

      } catch (refError) {
        console.error(`Error resolving references for question ${i + 1}:`, refError);
        // Continue with default values if reference resolution fails
        question.subject = questionBanks.subject;
        question.chapterName = questionBanks.chapterName;
        question.topic = questionBanks.topic;
      }

      // Clean up extracted fields
      delete question.extractedSubject;
      delete question.extractedClass;
      delete question.extractedCourse;
      delete question.extractedChapterName;
      delete question.extractedTopic;

      // Set other fields
      question.questionBankParentId = questionBankParentId ?? null;
      question.createdBy = createdBy;
question.sectionId = sectionIds
  ? (Array.isArray(sectionIds)
      ? sectionIds.map(id => new mongoose.Types.ObjectId(id))
      : [new mongoose.Types.ObjectId(sectionIds)])
  : [];      question.number = existingCount + i + 1;
    }

    const insertedQuestions = await questionModel.insertMany(parsedQuestions);
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      message: `${insertedQuestions.length} questions parsed and created successfully`,
      totalQuestions: insertedQuestions.length,
      questions: insertedQuestions
    });

  } catch (error) {
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }
    
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the document and creating questions.",
      error: error.message
    });
  }
});

// Enhanced parsing function that properly handles the document structure
function parseQuestionsFromText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
  const questions = [];
  let currentQuestion = null;
  let expectingValue = null;
  let optionIndex = 0;
  let blankIndex = 0;
  let optionUrlIndex = 0;
  let solutionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const lowerLine = line.toLowerCase();

    if (lowerLine === 'question') {
      if (currentQuestion && currentQuestion.questionText) {
        if (solutionLines.length > 0) {
          currentQuestion.solution = processSolutionLines(solutionLines);
        }
        questions.push(formatQuestion(currentQuestion));
      }

      currentQuestion = {
        type: '',
        questionText: '',
        marks: 0,
        negativeMarking: false,
        negativeMarksValue: 0,
        correctAnswer: null,
        answerType: 'single',
        options: [],
        blanks: [],
        extractedSubject: null,
        extractedClass: null,
        extractedCourse: null,
        extractedChapterName: null,
        extractedTopic: null,
        extractedResource: null,
        previousYearsQuestion: false,
        year: '',
        titles: []
      };

      expectingValue = 'questionText';
      optionIndex = 0;
      blankIndex = 0;
      optionUrlIndex = 0;
      solutionLines = [];
      continue;
    }

    if (!currentQuestion) continue;

    if (expectingValue === 'solution') {
      const isNewField = [
        'question', 'type', 'marks', 'negativemarksvalue', 'difficultylevel',
        'subject', 'class', 'course', 'chaptername', 'topic', 'resources',
        'previousyear', 'year', 'titles', 'correctanswer', 'option', 'optionurl', 'blanks'
      ].includes(lowerLine);

      if (isNewField) {
        currentQuestion.solution = processSolutionLines(solutionLines);
        solutionLines = [];
        expectingValue = lowerLine;
        i--; // re-process this line
      } else {
        solutionLines.push(line);
      }
      continue;
    }

    if (lowerLine === 'solution') {
      expectingValue = 'solution';
      solutionLines = [];
      continue;
    }

    if (lowerLine === 'questionimage' && nextLine.startsWith('https://')) {
      currentQuestion.questionUrl = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'option') {
      expectingValue = 'option';
      currentQuestion.options.push({ text: '', isCorrect: false });
      optionIndex = currentQuestion.options.length - 1;
      continue;
    }

    if (lowerLine === 'optionurl' && nextLine.startsWith('https://')) {
      if (optionUrlIndex < currentQuestion.options.length) {
        currentQuestion.options[optionUrlIndex].optionUrl = nextLine;
        optionUrlIndex++;
      }
      i++;
      continue;
    }

    if (lowerLine === 'type') {
      expectingValue = 'type';
      continue;
    }

    if (lowerLine === 'marks') {
      expectingValue = 'marks';
      continue;
    }

    if (lowerLine === 'negativemarksvalue') {
      expectingValue = 'negativeMarksValue';
      continue;
    }

    if (lowerLine === 'difficultylevel') {
      expectingValue = 'difficultyLevel';
      continue;
    }

    if (lowerLine === 'subject' && nextLine) {
      currentQuestion.extractedSubject = nextLine.toUpperCase();
      i++;
      continue;
    }

    if (lowerLine === 'class' && nextLine) {
      currentQuestion.extractedClass = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'course' && nextLine) {
      currentQuestion.extractedCourse = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'chaptername' && nextLine) {
      currentQuestion.extractedChapterName = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'topic' && nextLine) {
      currentQuestion.extractedTopic = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'resources' && nextLine) {
      currentQuestion.resource = nextLine.toUpperCase();
      i++;
      continue;
    }

    if (lowerLine === 'previousyear' && nextLine) {
      currentQuestion.previousYearsQuestion = nextLine.toLowerCase() === 'true';
      i++;
      continue;
    }

    if (lowerLine === 'year' && nextLine) {
      currentQuestion.year = currentQuestion.previousYearsQuestion ? nextLine : '';
      i++;
      continue;
    }

    if (lowerLine === 'titles' && nextLine) {
      currentQuestion.titles = currentQuestion.previousYearsQuestion ?
        nextLine.split(',').map(title => title.trim()).filter(Boolean) : [];
      i++;
      continue;
    }

    if (lowerLine === 'correctanswer' && nextLine) {
      currentQuestion.correctAnswer = nextLine;
      i++;
      continue;
    }

    if (lowerLine === 'blanks' && nextLine !== 'blanks') {
      currentQuestion.blanks.push({ correctAnswer: nextLine });
      i++;
      continue;
    }

    switch (expectingValue) {
      case 'questionText':
        if (currentQuestion.questionText === '') {
          currentQuestion.questionText = line;
          expectingValue = null;
        }
        break;

      case 'option':
        if (currentQuestion.options[optionIndex] && currentQuestion.options[optionIndex].text === '') {
          currentQuestion.options[optionIndex].text = line;
          expectingValue = 'optionCorrectness';
        }
        break;

      case 'optionCorrectness':
        if (lowerLine === 'correct' || lowerLine === 'incorrect') {
          currentQuestion.options[optionIndex].isCorrect = (lowerLine === 'correct');
          expectingValue = null;
        }
        break;

      case 'type':
        if (['mcq', 'truefalse', 'fillintheblank', 'integertype', 'comprehension'].includes(lowerLine)) {
          currentQuestion.type = lowerLine === 'integertype' ? 'integerType' : lowerLine;
          expectingValue = null;
        }
        break;

      case 'marks':
        if (!isNaN(line)) {
          currentQuestion.marks = parseInt(line);
          expectingValue = null;
        }
        break;

      case 'negativeMarksValue':
        if (!isNaN(line)) {
          currentQuestion.negativeMarksValue = parseFloat(line);
          expectingValue = null;
        }
        break;

      case 'difficultyLevel':
        if (['easy', 'medium', 'hard'].includes(lowerLine)) {
          currentQuestion.difficultyLevel = lowerLine;
          expectingValue = null;
        }
        break;

      default:
        break;
    }
  }

  // Final question (if any)
  if (currentQuestion && currentQuestion.questionText) {
    if (solutionLines.length > 0) {
      currentQuestion.solution = processSolutionLines(solutionLines);
    }
    questions.push(formatQuestion(currentQuestion));
  }

  return questions.filter(q => q.type !== 'comprehension');
}

// Helper function to format multiline solution
function processSolutionLines(lines) {
  if (lines.length === 1 && lines[0].includes('$$')) {
    const segments = lines[0].split('$$').filter(Boolean);
    return segments.map(seg => `$$${seg}$$`).join('\n');
  } else {
    return lines.join('\n');
  }
}



// Enhanced formatting function
function formatQuestion(question) {
  const formattedQuestion = {
    type: question.type,
    questionText: question.questionText,
    marks: question.marks || 1,
    negativeMarking: question.negativeMarking,
    negativeMarksValue: question.negativeMarksValue,
    difficultyLevel: question.difficultyLevel || 'easy',
    solution: question.solution || '',
    previousYearsQuestion: question.previousYearsQuestion || false,
    year: question.year || '',
    resource: question.resource || '',
    titles: question.titles || []
  };
  console.log(1,question);
  // Add questionUrl if it exists
  if (question.questionUrl) {
    formattedQuestion.questionUrl = question.questionUrl;
  }
  
  // Copy extracted metadata for reference resolution
  if (question.extractedSubject) formattedQuestion.extractedSubject = question.extractedSubject;
  if (question.extractedClass) formattedQuestion.extractedClass = question.extractedClass;
  if (question.extractedCourse) formattedQuestion.extractedCourse = question.extractedCourse;
  if (question.extractedChapterName) formattedQuestion.extractedChapterName = question.extractedChapterName;
  if (question.extractedTopic) formattedQuestion.extractedTopic = question.extractedTopic;
  
  switch (question.type) {
    case 'mcq':
      formattedQuestion.answerType = 'single';
      formattedQuestion.options = question.options ? question.options.filter(opt => opt.text.trim() !== '') : [];
      formattedQuestion.blanks = [];
      break;
      
    case 'truefalse':
      formattedQuestion.correctAnswer = question.correctAnswer === "true" ? true : false;
      formattedQuestion.options = [];
      formattedQuestion.blanks = [];
      break;
      
    case 'fillintheblank':
      formattedQuestion.blanks = question.blanks || [];
      formattedQuestion.options = [];
      break;
      
    case 'integerType':
      formattedQuestion.correctAnswer = parseInt(question.correctAnswer);
      formattedQuestion.options = [];
      formattedQuestion.blanks = [];
      break;
      
    default:
      formattedQuestion.options = [];
      formattedQuestion.blanks = [];
      break;
  }
  
  return formattedQuestion;
}

// ***************************************************
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
   try {
     console.log(`Server running on port ${PORT}`)
    connect();
    console.log("database connected")
   } catch (error) {
    console.log(error)
   }
});


