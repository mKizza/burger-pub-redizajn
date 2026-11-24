const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

const DOWNLOAD_DIR = path.join(
  __dirname,
  "../node_modules/.cache/mongodb-memory-server",
);

// inače MMS traži binarku prema cwd-u, pa bi je iz roota repoa skinuo ponovno
function useRepoBinary() {
  if (!process.env.MONGOMS_DOWNLOAD_DIR) {
    process.env.MONGOMS_DOWNLOAD_DIR = DOWNLOAD_DIR;
  }
}

async function startMemoryMongo({ port } = {}) {
  useRepoBinary();

  return MongoMemoryServer.create({
    instance: { ip: "127.0.0.1", port },
  });
}

module.exports = { startMemoryMongo };
