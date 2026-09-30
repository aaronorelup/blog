// Which posts appear anywhere a reader browses: the ledger list (homepage panel and /ledger),
// the RSS feed, the series threads and the older/newer links under a post, the agent hand-off
// email, and any search, tag or category page added later. Use this, not `!data.draft`,
// whenever you list posts.
//
// draft: true     -> not built at all.
// unlisted: true  -> "soft private". The page still builds at /ledger/<slug>/ so Aaron can open
//                    it by URL, but it carries noindex and appears in no list. Set it on a
//                    post Aaron doesn't want representing the site; don't delete the post.
export const isListed = (data) => !data.draft && !data.unlisted;
