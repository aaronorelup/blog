// Folders where the bucket holds more files than the site shows (docs/MEDIA.md, "Taking a file off the site").
// From these only a file that matches is served. Any other path there answers as a file that isn't there, and
// /stats never quotes it. A path is the URL's, decoded, with its leading slash (/stats lower-cases it first).
const SHOWN = [['/media/guitar-tabs-from-video/', /-(001|002|003|004|009)\.(mp4|mp3)$/]];

export const withheld = (path) => SHOWN.some(([folder, shown]) => path.startsWith(folder) && !shown.test(path));
