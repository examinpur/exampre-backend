const { studentModel } = require("../model/Student");


exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, examType } = req.body;

    const existingStudent = await studentModel.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    
 const verificationToken = jwt.sign(
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new studentModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      examType,
      verificationToken
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully, Verify your email' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await studentModel.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if(student.isDeleted){
      return res.status(400).json({ message: 'Account is already deleted' });
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}