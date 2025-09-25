const { default: mongoose } = require("mongoose");
const { batchModel } = require("../model/batch");
const {studentModel} = require("../model/Student");
const { fileModel } = require("../model/myLibraryFiles");
const { globalFileModel } = require("../model/globalLibraryFiles");

const validateBatchInput = (body) => {
  const {
    title, startingDate, batchCode,
    subject, fees
  } = body;
  if (!title || title.trim() === '') return 'Title is required.';
  if (title.length > 100) return 'Title cannot exceed 100 characters.';

  if (!startingDate) return 'Starting date is required.';
  if (!batchCode || batchCode.trim() === '') return 'Batch code is required.';
  if (!subject || !Array.isArray(subject) || subject.length === 0) return 'At least one subject is required.';
  if (!fees || typeof fees.amount !== 'number') return 'Fees amount must be a number.';

  return null;
};

const createbatch = async (req, res) => {
  try {
    const errorMessage = validateBatchInput(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });

    const {
      title,
      description,
      startingDate,
      batchCode,
      subject,
      level,
      fees,
      
    } = req.body;

    const createdBy = req.user?._id;
    if (!createdBy) return res.status(401).json({ error: 'User not authenticated.' });

    const newBatch = new batchModel({
      title,
      description,
      startingDate,
      createdBy,
      batchCode,
      subject,
      level,
      fees,
    });

    await newBatch.save();
    res.status(201).json({ message: "Batch created successfully", batchId: newBatch._id });
  } catch (err) {
    console.error("Error creating batch:", err);
    res.status(500).json({ error: err.message });
  }
};


const getAllbatchs = async (req, res) => {
  try {
    const batches = await batchModel.find().populate('createdBy').lean();
    const allTestIds = batches.flatMap(batch => batch.test || []);

    // Fetch tests from both collections
    const myLibraryTests = await fileModel.find({ _id: { $in: allTestIds } }).lean();
    const globalLibraryTests = await globalFileModel.find({ _id: { $in: allTestIds } }).lean();

    // Build a lookup map of testId => test object
    const testMap = {};
    myLibraryTests.forEach(test => { testMap[test._id.toString()] = { ...test, source: 'myLibrary' }; });
    globalLibraryTests.forEach(test => { testMap[test._id.toString()] = { ...test, source: 'globalLibrary' }; });

    // Attach populated test details into each batch
    const formattedBatches = batches.map(batch => ({
      ...batch,
      students: batch.students || [],
      fees: batch.fees && batch.fees.amount > 0
        ? batch.fees
        : { amount: 0, currency: 'INR', note: 'Free' },
      tests: (batch.test || []).map(testId => testMap[testId.toString()] || null).filter(Boolean)
    }));

    res.status(200).json({ message: "Get all batches successfully", batches: formattedBatches });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: err.message });
  }
}


const getbatchById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid batch ID format.' });
  }
  try {
    const batch = await batchModel
      .findById(id)
      .populate('createdBy')
      .populate('students.studentId', 'name email');
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const processedStudents = (batch.students || []).map(s => {
      if (s.studentId && s.studentId.name && s.studentId.email) {
        return {
          studentId: s.studentId._id,
          name: s.studentId.name,
          email: s.studentId.email,
          enrollmentDate: s.enrollmentDate,
          enrollmentStatus: s.enrollmentStatus,
          progress: s.progress
        };
      }
      return null; 
    }).filter(Boolean);

    const responseData = {
      ...batch._doc,
      students: processedStudents,
      fees: batch.fees && batch.fees.amount > 0
        ? batch.fees
        : { amount: 0, currency: 'INR', note: 'Free' }
    };

    res.status(200).json({message : "fetched" , batch : responseData});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatebatch = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    const batchId = req.params.id;

 

    if (updatedData.endingDate && updatedData.startingDate &&
        new Date(updatedData.endingDate) <= new Date(updatedData.startingDate)) {
      return res.status(400).json({ error: 'Ending date must be after starting date.' });
    }

    // Fetch the existing batch first to modify its student array
    const batch = await batchModel.findById(batchId);
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });

    // Handle student updates if provided
    if (Array.isArray(updatedData.students)) {
      const uniqueEmails = new Set();
      const existingStudentIds = new Set(batch.students.map(s => s.studentId.toString()));
      const newStudentsToAdd = [];

      for (const student of updatedData.students) {
        const { name, email } = student;
        if (!email || uniqueEmails.has(email)) continue;
        uniqueEmails.add(email);

        // Check if student exists or create new one
        let studentDoc = await studentModel.findOne({ email });
        if (!studentDoc) {
          studentDoc = await studentModel.create({ name, email });
        }

        // Skip if student is already in the batch
        if (existingStudentIds.has(studentDoc._id.toString())) continue;

        newStudentsToAdd.push({
          studentId: studentDoc._id,
          enrollmentDate: new Date(),
          enrollmentStatus: 'enrolled',
          progress: 0
        });
      }

      // Merge new students into the batch
      batch.students.push(...newStudentsToAdd);
      updatedData.currentEnrollment = batch.students.length;
    }

    // Apply other updates to the batch
    Object.keys(updatedData).forEach(key => {
      if (key !== 'students') {
        batch[key] = updatedData[key];
      }
    });

    // Save the updated batch
    const updatedBatch = await batch.save();

    res.status(200).json({ message: "Batch updated successfully", updatedBatch });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ error: err.message });
  }
};



const deletebatch = async (req, res) => {
  try {
    const deleted = await batchModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Batch not found.' });

    res.status(200).json({ message: 'Batch deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const onlyTitleOfBatchs = async (req, res) => {
  try {
    const batches = await batchModel.find().select('title');

    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: "No batches found." });
    }

    res.status(200).json({
      message: "Fetched batch titles successfully",
      titles: batches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeStudentFromBatch = async (req, res) => {
  const { id, studentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid batch ID or student ID format.' });
  }
  try {
    const updatedBatch = await batchModel.findByIdAndUpdate(
      id,
      {
        $pull: { students: { studentId: studentId } },
        $inc: { currentEnrollment: -1 }
      },
      { new: true }
    );
    if (!updatedBatch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }
    res.status(200).json({ message: 'Student removed from batch successfully.', updatedBatch });
  } catch (error) {
    console.error('Error removing student from batch:', error);
    res.status(500).json({ error: err.message });
  }
};

const removeArrayOfStudentFromBatch = async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid batch ID format.' });
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'studentIds must be a non-empty array.' });
  }
  const validStudentIds = studentIds.filter(sid => mongoose.Types.ObjectId.isValid(sid));

  try {
    const batch = await batchModel.findById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }
    const originalCount = batch.students.length;
    batch.students = batch.students.filter(s => !validStudentIds.includes(s.studentId.toString()));
    const newCount = batch.students.length;
    batch.currentEnrollment = newCount;

    await batch.save();

    res.status(200).json({
      message: 'Students removed from batch successfully.',
      removedCount: originalCount - newCount,
      updatedBatch: batch
    });
  } catch (error) {
    console.error('Error removing students from batch:', error);
    res.status(500).json({ error: error.message });
  }
};


const addTestsToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { testIds } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: "batchId is required." });
    }
    if (!Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ message: "testIds must be a non-empty array." });
    }

    const batch = await batchModel.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    testIds.forEach(testId => {
      if (!batch.test.includes(testId)) {
        batch.test.push(testId);
      }
    });

    await batch.save();

    res.status(200).json({ message: "Tests added successfully.", updatedBatch: batch });
  } catch (error) {
    console.error("Error adding tests to batch:", error);
    res.status(500).json({ message: "Failed to add tests to batch.", error: error.message });
  }
};



module.exports = {
  createbatch,
  getAllbatchs,
  getbatchById,
  updatebatch,
  deletebatch,
  removeStudentFromBatch,
  onlyTitleOfBatchs,
  removeArrayOfStudentFromBatch,
  addTestsToBatch
};
