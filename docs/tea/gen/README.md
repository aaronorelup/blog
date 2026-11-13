# Generation logs

One log per chapter (`<id>.md`), plus `shared.md` (the shared art) and `key.md` (the house sheet): every picture
generated for the page, with its prompt, its references, its size, kept or rejected, and who approved it.

**The model.** Write the tool (`generate_image` on Higgsfield) and "the image model", never the model's name or
id: the repo is public, and no model's name is written in its documents, code comments or file names. The model
in use is the one the build brief names; a log that used another says "a second image model" and why.

The never-publish scan reads every file here (`scripts/check/never-publish.mjs`).
