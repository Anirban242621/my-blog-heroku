import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import path from "path";
import { config } from "dotenv";
const app = express();
app.use(express.static(path.join(__dirname, "/build")));
app.use(bodyParser.json());
const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://itsboyraj:Boi242621@my-blog.hixy3.mongodb.net/",
      { useNewUrlParser: true }
    );
    const db = client.db("my-blog");
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({ message: "Error connecting to db", error });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);

  //   try {
  //   const articleName = req.params.name;
  // const client = await MongoClient.connect(
  //   "mongodb+srv://itsboyraj:Boi242621@my-blog.hixy3.mongodb.net/",
  //   { useNewUrlParser: true }
  // );

  //   const db = client.db("my-blog");

  //   const articlesInfo = await db
  //     .collection("articles")
  //     .findOne({ name: articleName });
  //   res.status(200).json(articlesInfo);
  //     client.close();
  //   } catch (error) {
  //     res.status(500).json({ message: "Error connecting to db", error });
  //   }
});

app.post("/api/articles/:name/upVote", async (req, res) => {
  //   try {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articlesInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db
      .collection("articles")
      .updateOne(
        { name: articleName },
        { $set: { upVotes: articlesInfo.upVotes + 1 } }
      );
    const updatedArticlesInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updatedArticlesInfo);
  }, res);

  //     client.close();
  //   } catch (error) {
  //     res.status(500).json({ message: "Error connecting to db", error });
  //   }
});
app.post("/api/articles/:name/add-comment", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  //   articlesInfo[articleName].comments.push({ username, text });
  //   res.status(200).send(articlesInfo[articleName]);
  withDB(async (db) => {
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text }),
        },
      }
    );

    const updatedArticleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.get("*", (req, res) => {
  res.send(path.json(__dirname + "/build/index.html"));
});

app.listen(process.env.PORT || 8000, () =>
  console.log("Server is running on port 8000")
);
