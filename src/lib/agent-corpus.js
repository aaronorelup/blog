// /llms-full.txt's text (lib/agent-text.js llmsFullTxt over the listed posts and their notes), and its size in bytes:
// its page writes the text, and /llms.txt and every page's note for agents give the size. The size is made once a
// build (the note is on every page); a dev server keeps the first figure until it restarts.
import { cardOf } from './cards.js';
import { listedPosts, notesBySlug } from './content.js';
import { llmsFullTxt } from './agent-text.js';

export const corpusText = async () => llmsFullTxt({ posts: await listedPosts(), notes: await notesBySlug(), cardOf });

let bytes;
export const corpusBytes = () => (bytes ??= corpusText().then((text) => new TextEncoder().encode(text).length));
