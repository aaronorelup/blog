"""Plain-text extraction of a saved HTML page (stdlib only). Drops script/style, breaks lines at block tags."""
import sys, html.parser, re
BLOCK = {"p","div","br","li","h1","h2","h3","h4","h5","h6","tr","section","article","header","footer","td","th","dt","dd","ul","ol","table","blockquote","pre","main","nav","aside"}
class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.out=[]; self.skip=0
    def handle_starttag(self, t, a):
        if t in ("script","style","noscript","svg"): self.skip+=1
        if t in BLOCK: self.out.append("\n")
        if t=="li": self.out.append("- ")
    def handle_endtag(self, t):
        if t in ("script","style","noscript","svg") and self.skip: self.skip-=1
        if t in BLOCK: self.out.append("\n")
    def handle_data(self, d):
        if not self.skip: self.out.append(d)
raw=open(sys.argv[1],"rb").read().decode("utf-8","replace")
p=P(); p.feed(raw)
txt="".join(p.out)
txt=re.sub(r"[ \t\r\f\v]+"," ",txt)
txt="\n".join(l.strip() for l in txt.split("\n"))
txt=re.sub(r"\n{3,}","\n\n",txt)
print(txt.strip())
