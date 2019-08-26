const { Schema, model } = require("mongoose");
const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const s3 = new aws.S3();

const FileSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: Number,
    url: String
  },
  {
    timestamps: true
  }
);

FileSchema.pre("save", function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${encodeURIComponent(this.path)}`;
  }
});

FileSchema.pre("remove", function() {
  if (process.env.STORAGE_TYPE === "s3") {
    return s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: this.path
      })
      .promise();
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", this.path)
    );
  }
});

module.exports = model("File", FileSchema);
