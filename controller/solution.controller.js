const { solutionModel } = require("../model/solutionModel");


exports.createOrUpdateSolution = async (req, res) => {
  try {
    const { questionId,  steps, createdBy } = req.body;

    if (!questionId || !steps?.length || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const solution = await solutionModel.findOneAndUpdate(
      { questionId },
      { steps, createdBy },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: 'Solution saved successfully', solution });
  } catch (error) {
    console.error('Error saving solution:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.DeleteSolutionBysolutionId = async (req, res) => {
  try {
    const { solutionId } = req.params;

    if (!solutionId) {
      return res.status(400).json({ message: 'solutionId is required.' });
    }

    const solution = await solutionModel.findByIdAndDelete(solutionId);

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found.' });
    }

    return res.status(200).json({ message: 'Solution deleted successfully.', solution });
  } catch (error) {
    console.error('Error deleting solution:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
