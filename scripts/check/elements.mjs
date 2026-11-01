// The component gallery stays whole: every src/elements/ao-*/ folder has its "## <ao-x>" section in
// docs/COMPONENTS.md. (A post using a tag with no folder is rehype-post-text's error, not this rule's.)
export default function elements(repo, report) {
  const tags = [...new Set(repo.list('src/elements', (f) => /^src\/elements\/ao-[a-z0-9-]+\//.test(f))
    .map((f) => f.split('/')[2]))];
  const gallery = repo.exists('docs/COMPONENTS.md') ? repo.read('docs/COMPONENTS.md') : '';
  for (const tag of tags) {
    if (!gallery.includes(`## <${tag}>`)) report(`src/elements/${tag}`, null, `no "## <${tag}>" section in docs/COMPONENTS.md`, 'check');
  }
}
