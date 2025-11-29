const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const Sib = require('sib-api-v3-sdk');
const connect = require("./database/db");
const { libraryRoutes } = require("./routes/library.route");
const { adminRoutes } = require("./routes/admin.routes");
const { GloballibraryRoutes } = require("./routes/globalLibrary.routes");
const questionBankRoutes = require("./routes/QuestionBank.routes");
const practiceTestRoutes = require("./routes/practiceTest.routes");
const batchRoutes = require("./routes/batch.routes");
const questionsRoutes = require("./routes/question.routes");
const solutionRouter = require("./routes/solution.routes");
const userRoutes = require("./routes/user.routes");
const topicRouter = require("./routes/topic.route");
const chapterRouter = require("./routes/chapterName.route");
const subjectRouter = require("./routes/subject.route");
const courseRouter = require("./routes/course.route");
const FormRouter = require("./routes/form.routes");
const routerJSON = require("./routes/json.route");
const path = require("path");
const examTypesRouter = require("./routes/examTypes.routes");
const examSubCategoryRouter = require("./routes/examSubCategory.routes");
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
app.use("/api/chapter", chapterRouter);
app.use("/api/topic", topicRouter);
app.use("/api/course", courseRouter);
app.use("/api/form", FormRouter);
app.use("/api/exam-type", examTypesRouter);
app.use("/api/exam-category", examSubCategoryRouter);
app.use("/api",routerJSON)



const {
  BREVO_API_KEY,
  FROM_EMAIL,
  FROM_NAME = 'Quilt Of Courage',
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PROJECT_ID
} = process.env;

let db = null;
if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  try {
    if (!admin.apps.length) {
      // Handle escaped newlines in private key (common in env vars)
      const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    db = admin.firestore();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.warn('Firebase features will be disabled');
  }
} else {
  console.warn('WARN: Firebase environment variables missing. Firebase features will be disabled.');
}

if (!BREVO_API_KEY) console.warn('WARN: BREVO_API_KEY missing in .env');
if (!FROM_EMAIL) console.warn('WARN: FROM_EMAIL missing in .env');

let emailsApi = null;
if (BREVO_API_KEY) {
  try {
    const defaultClient = Sib.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = BREVO_API_KEY;
    emailsApi = new Sib.TransactionalEmailsApi();
    console.log('Brevo API initialized successfully');
  } catch (error) {
    console.error('Error initializing Brevo API:', error.message);
  }
} else {
  console.warn('WARN: Brevo API not initialized - BREVO_API_KEY missing');
}

app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    if (!FROM_EMAIL) {
      return res.status(500).json({ error: 'Server not configured: FROM_EMAIL missing.' });
    }
    if (!db) {
      return res.status(500).json({ error: 'Server not configured: Firebase not initialized.' });
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
      subject: 'Welcome Quilt of Courage!',
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

    if (!emailsApi) {
      return res.status(500).json({ error: 'Server not configured: Brevo API not initialized.' });
    }

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

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
   try {
     console.log(`Server running on port ${PORT}`)
    connect();
    console.log("database connected")
   } catch (error) {
    console.log(error)
   }
});


