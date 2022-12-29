var { Readability } = require("@mozilla/readability");
import { DOMParser } from "linkedom"; // since DOMParser is not available in the background script for chrome
import { castSpell, setApiKey } from "./router.js";

async function distill(spell) {
	// Get the active tab
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];

	let text = "";

	// get selected text from the active tab
	const selected = (
		await chrome.scripting.executeScript({
			func: () => window.getSelection().toString(),
			target: { tabId: tab.id },
		})
	)[0].result;

	console.log(selected);

	if (selected !== "") {
		text = selected;
	} else if (tab.url.includes("youtube.com")) {
		// get the video id from the url
		const videoId = tab.url.split("v=")[1].split("&")[0];
		// download the video transcript from youtubetranscript.com with "Access-Control-Allow-Origin": "*" in header
		const transcript = await fetch(
			`https://corsproxy.io/?` +
				encodeURIComponent(
					`https://youtubetranscript.com/?server_vid=${videoId}`
				)
		);

		// parse the xml
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(await transcript.text(), "text/xml");
		const textNodes = xmlDoc.getElementsByTagName("text");
		const textArray = Array.from(textNodes).map((node) => node.textContent);
		console.log(textArray);

		// join the array to a string with new lines
		text = textArray.join("\n");
	} else {
		// get the document of the active tab
		const html = (
			await chrome.scripting.executeScript({
				func: () => document.documentElement.outerHTML,
				target: { tabId: tab.id },
			})
		)[0].result;

		console.log("html", html);

		// parse the html with readability
		// fix First argument to Readability constructor should be a document object
		const parser = new DOMParser();
		const document = parser.parseFromString(html, "text/html");
		text = new Readability(document).parse().textContent;
		console.log(text);
	}

	// Send the encoded Text castSpell in router.js
	const response = await castSpell(text, spell);

	try {
		console.log(response);
		// Send a message to the default_popup with the summary text
		chrome.runtime.sendMessage({
			type: "result",
			answer: response,
		});
	} catch (e) {
		console.log(e);
		chrome.runtime.sendMessage({
			type: "result",
			answer: "Could not get result. Something went wrong...",
		});
	}
}

chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "request") {
		distill(message.spell);
	}
});

chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "key") {
		setApiKey(message.key);
	}
});
