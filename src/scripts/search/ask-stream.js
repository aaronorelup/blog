// RAG Goobie's answer stream (POST /api/ask, worker/ask/events.js): server-sent events, "data: <json>\n\n" each,
// read with fetch because the request is a POST. events(body) yields them as they come, whatever the chunk
// boundaries (a frame or a UTF-8 character split across reads); 40 s without any event ends it with an error.
export const GIVE_UP = 40e3;

export async function* events(body, idle = GIVE_UP) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  let quiet = 0;
  try {
    for (;;) {
      const { value, done } = await Promise.race([reader.read(), new Promise((_, no) => {
        quiet = setTimeout(() => no(new Error('no event for 40 s')), idle);
      })]);
      clearTimeout(quiet);
      if (done) return;
      buf += value;
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (frame.startsWith('data: ')) yield JSON.parse(frame.slice(6));
      }
    }
  } finally {
    clearTimeout(quiet);
    reader.cancel().catch(() => {});
  }
}
