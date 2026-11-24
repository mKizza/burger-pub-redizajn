const crypto = require("crypto");
const Module = require("module");
const path = require("path");

const backendDir = path.join(__dirname, "..");

let mailStore = null;
let imageStore = null;

function installFakeMail() {
  if (mailStore) {
    mailStore.clear();
    mailStore.setFail(false);
    return mailStore;
  }

  // radi jer kontroleri zovu createTransport pri svakom zahtjevu
  const nodemailer = require(
    require.resolve("nodemailer", { paths: [backendDir] }),
  );

  const mails = [];
  let fail = false;

  nodemailer.createTransport = (options) => ({
    options,
    sendMail: async (message) => {
      if (fail) {
        throw new Error("Fake mail: sending is set to fail");
      }

      mails.push({
        to: message.to ?? null,
        from: message.from ?? null,
        replyTo: message.replyTo ?? null,
        subject: message.subject ?? null,
        html: message.html ?? null,
        text: message.text ?? null,
      });

      return { messageId: `<fake-${mails.length}@burgerpub.test>` };
    },
  });

  mailStore = {
    mails,
    clear() {
      mails.length = 0;
    },
    setFail(value) {
      fail = Boolean(value);
    },
    isFailing() {
      return fail;
    },
  };

  return mailStore;
}

function parseDataUri(file) {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(String(file));

  if (!match) {
    throw new Error("Fake ImageKit: file must be a base64 data URI");
  }

  return { mimeType: match[1], data: Buffer.from(match[2], "base64") };
}

function installFakeImageKit({ baseUrl }) {
  if (imageStore) {
    imageStore.setBaseUrl(baseUrl);
    imageStore.clear();
    return imageStore;
  }

  const controllerPath = require.resolve("../controllers/foodController");

  if (require.cache[controllerPath]) {
    throw new Error("Install the fake ImageKit before foodController.js loads");
  }

  const images = new Map();
  let currentBaseUrl = baseUrl;

  class FakeImageKit {
    constructor(options) {
      this.options = options;

      this.files = {
        upload: async ({ file, fileName, folder }) => {
          const { mimeType, data } = parseDataUri(file);
          const fileId = crypto.randomBytes(12).toString("hex");

          images.set(fileId, {
            fileId,
            fileName,
            folder,
            mimeType,
            data,
            deleted: false,
          });

          return {
            fileId,
            name: fileName,
            filePath: `${folder}/${fileName}`,
            size: data.length,
            url: `${currentBaseUrl}/${fileId}`,
          };
        },

        delete: async (fileId) => {
          const image = images.get(fileId);

          if (!image || image.deleted) {
            const error = new Error(`Fake ImageKit: file ${fileId} not found`);
            error.status = 404;
            throw error;
          }

          image.deleted = true;
        },
      };
    }
  }

  const resolved = require.resolve("@imagekit/nodejs", { paths: [backendDir] });
  const fakeModule = new Module(resolved, module);
  fakeModule.filename = resolved;
  fakeModule.loaded = true;
  fakeModule.exports = FakeImageKit;
  require.cache[resolved] = fakeModule;

  imageStore = {
    FakeImageKit,
    list() {
      return [...images.values()].map(
        ({ fileId, fileName, folder, deleted }) => ({
          fileId,
          fileName,
          folder,
          deleted,
        }),
      );
    },
    get(fileId) {
      return images.get(fileId) ?? null;
    },
    clear() {
      images.clear();
    },
    setBaseUrl(value) {
      currentBaseUrl = value;
    },
  };

  return imageStore;
}

module.exports = { installFakeMail, installFakeImageKit };
