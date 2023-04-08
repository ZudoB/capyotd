import fetch from "node-fetch";
import {login} from "masto";
import {createWriteStream, createReadStream} from "fs";

function saveFile(url) {
    return new Promise((resolve, reject) => {
        const ws = createWriteStream("capy.jpg");

        fetch(url).then(res => {
            if (!res.ok) reject();

            res.body.on("end", () => resolve());
            res.body.pipe(ws);
        });
    });
}

const client = await login({url: process.env.MASTODON_URI, accessToken: process.env.MASTODON_TOKEN} );

const capyResult = await fetch("https://api.capy.life/");

if (!capyResult.ok) process.exit();

const capyJson = await capyResult.json();

console.log("Downloading capybara...");
await saveFile(capyJson.image);

console.log("Uploading capybara...");
const attachment = await client.mediaAttachments.create({file: createReadStream("capy.jpg"), description: `A capybara named ${capyJson.name}.`});

console.log("Posting capybara...");
await client.statuses.create({
    status: `${capyJson.name} #capybara`,
    mediaIds: [attachment.id]
});
