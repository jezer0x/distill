var tokenizer = require("sbd");
const crypto = require("crypto");
import { get, set } from "idb-keyval";

// create a database class
class Database {
	constructor() {}

	async get(key) {
		return await get(key);
	}

	async set(key, value) {
		return await set(key, value);
	}
}

const db = new Database();

const prompts = {
	summarize: {
		spell: "Write a tldr version of the text below:",
		recursive: true,
	},
	highlights: {
		spell:
			"Pick out the sentences that are key highlights of the text below and present as a list:",
		recursive: false,
	},
	assumptions: {
		spell:
			"Analyze the text below and identify any underlying assumptions it makes, and explain the implications of these assumptions and provide counterarguments or alternative perspectives:",
		recursive: false,
	},
	devil: {
		spell: "Play devil's advocate with respect to the text below:",
		recursive: true,
	},
	factcheck: {
		spell:
			"Please fact check the text below and identify any false or misleading statements, provide evidence to support your claim, and present alternative perspectives or explanations:",
		recursive: false,
	},
	bias: {
		spell:
			"Point out any common logical fallacies or cognitive biases in the text below:",
		recursive: false,
	},
	eli5: {
		spell: "Explain the following text like I'm a second grader:",
		recursive: true,
	},
};

function getApproxTokenCount(str) {
	return (str.trim().split(/\s+/).length * 2048) / 1500;
}

function getTextChunks(sentences, maxTokensPerChunk) {
	var res = [];
	var chunk = "";
	var counter = 0;
	for (var sentence of sentences) {
		let sentLen = getApproxTokenCount(sentence);
		if (counter + sentLen > maxTokensPerChunk) {
			res.push(chunk);
			chunk = sentence;
			counter = sentLen;
		} else {
			chunk += " " + sentence;
			counter += sentLen;
		}
	}

	// finally, for the last chunk that did not hit maxTokensPerCHunk
	res.push(chunk);

	return res;
}

export async function setApiKey(key) {
	await db.set("openai-api-key", key);
}

async function getAnswer(apiKey, text, prompt) {
	let response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + apiKey,
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: "You are the world's most helpful reading assistant.",
				},
				{ role: "user", content: prompt.concat("\n", text) },
			],
			temperature: 0.7,
			max_tokens: 512,
		}),
	});

	console.log(response);
	return response.json().then((data) => {
		console.log(data);
		return data.choices[0].message.content;
	});
}

export async function castSpell(text, prompt) {
	const apiKey = await db.get("openai-api-key");

	if (apiKey == undefined || apiKey == "") {
		return "Please set OpenAI API key first!";
	}

	if (text == undefined) {
		return "text not found!";
	}

	if (prompts[prompt] === undefined) {
		return "prompt not valid!";
	}

	const hasher = crypto.createHash("md5");
	hasher.update(text);
	const hash = hasher.digest("hex");

	console.log(text, prompt);

	const key = prompts[prompt];
	const dbKey = hash + "-" + key.spell + "-" + key.recursive;
	const val = await db.get(dbKey);

	if (val) {
		return val;
	} else {
		var sentences = tokenizer.sentences(text, {});
		var chunks = getTextChunks(sentences, 3000);

		var answer = "";

		try {
			for (var chunk of chunks) {
				if (key.recursive) {
					answer = await getAnswer(apiKey, answer + chunk, key.spell);
				} else {
					answer += await getAnswer(apiKey, chunk, key.spell);
				}
			}
		} catch (e) {
			console.log(e);
			return "Something went wrong!";
		}

		// TODO: handle outOfSpace error. Use a Fifo Cache?
		await db.set(dbKey, answer);
		return answer;
	}
}
