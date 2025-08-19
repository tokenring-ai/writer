import GhostAdminAPI from "@tryghost/admin-api";
import fs from "fs";
import {Readable} from "node:stream";
import FormData from "form-data";

const adminAPI = new GhostAdminAPI({

 // Ghost Admin API client
 url: process.env.GHOST_URL,
 version: "v5.0",
 key: process.env.GHOST_ADMIN_API_KEY,
});
// Create directory structure: images/YYYY-MM-DD/
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format

const imageData = fs.readFileSync('../financialcontent-writer/images/2025-08-01/3c445fe5-7ff5-488b-a3f0-022251db0ef9.png', 'binary');

const filename = `3c445fe5-7ff5-488b-a3f0-022251db0ef9.png`;

const fileObject = new Blob([imageData]);
//TODO: It should be possible to pass fileObject directly to formData.append, but their is a bug in Bun that throws an error when doing this
const readableFile = Readable.from(fileObject.stream());

const formData = new FormData();
formData.append('file', imageData, {filename});
formData.append('purpose', 'image');

console.log(formData);
//const uploadResult = await adminAPI.images.upload({ file: '../financialcontent-writer/images/2025-08-01/3c445fe5-7ff5-488b-a3f0-022251db0ef9.png'});
const uploadResult = await adminAPI.images.upload(formData); // This isn't really described in the docs but should work

console.log(uploadResult);
