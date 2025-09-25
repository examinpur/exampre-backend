const express = require("express");
const { getTopicsByChapterId, createTopic, getAllTopics, getTopicById, updateTopic, deleteTopic } = require("../controller/topic.controller");
const topicRouter = express.Router();

topicRouter.post("/",  createTopic );
topicRouter.get("/",  getAllTopics);
topicRouter.get("/:id",  getTopicById);
topicRouter.patch("/:id",  updateTopic);
topicRouter.delete("/:id",  deleteTopic);
topicRouter.get("/chapter/:chapterId", getTopicsByChapterId);

module.exports = topicRouter;
