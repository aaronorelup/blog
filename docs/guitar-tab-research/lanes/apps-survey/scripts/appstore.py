"""Summarise a saved App Store page's plain text (from html2txt.py): name, developer, description, latest version, in-app purchases."""
import sys, re
L=[l for l in open(sys.argv[1],encoding="utf-8").read().split("\n") if l.strip() and l.strip()!="-"]
def find(s, start=0):
    for i in range(start, len(L)):
        if L[i].strip()==s: return i
    return -1
out=["Name: "+L[0].replace(" App - App Store","").strip("‎")]
i=find("Developer"); out.append("Developer: "+(L[i+1] if i>=0 else "?"))
r=find("Ratings & Reviews")
dev=[k for k in range(0, r if r>0 else len(L)) if re.match(r"^(iPhone|iPad|Mac|Apple TV|Apple Watch|Apple Vision)(, (iPhone|iPad|Mac|Apple TV|Apple Watch|Apple Vision))*$", L[k])]
if dev and r>0: out.append("DESCRIPTION: "+" | ".join(L[dev[-1]+1:r]))
w=find("What’s New")
if w>=0: out.append("WhatsNew: "+" | ".join(L[w+1:w+7]))
v=[l for l in L if re.match(r"^Version \d",l)]
out.append("Versions (latest first): "+"; ".join(v[:2]))
p=find("In-App Purchases")
if p>=0:
    items=[]
    for l in L[p+1:p+50]:
        if l.startswith(("App Support","Privacy Policy","Developer Website","Supports","Compatibility","Copyright","Seller","Family Sharing","More By","You Might Also Like","Developer")): break
        items.append(l)
    out.append("IAP: "+" | ".join(items))
s=find("Seller")
if s>=0: out.append("Seller: "+L[s+1])
c=next((l for l in L if l.startswith("©")),None)
if c: out.append("Copyright: "+c)
print("\n".join(x[:2500] for x in out))
