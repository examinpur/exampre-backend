const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  startingDate: {
    type: Date,
    required: true,
  },
   createdBy: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    enrollmentStatus: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped', 'suspended'],
      default: 'enrolled'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  batchCode: {
    type: String,
    unique: true,
    required: true
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'open', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  subject: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref : "Subject"
  }],
  course : [{type : mongoose.Schema.Types.ObjectId ,ref : "Course", default :[]}],
  test : [{type : mongoose.Schema.Types.Mixed , default :[]}],
  fees: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'IND'
    }
  },
}, {
  timestamps: true
});


const batchModel = mongoose.model("Batch", batchSchema);

module.exports  = {batchModel};