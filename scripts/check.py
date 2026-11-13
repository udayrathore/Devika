"""Validate the portable proposal, metadata and its local asset references."""
from html.parser import HTMLParser
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.refs=[];self.anchors=[];self.meta={};self.analytics=[];self.sections=[]
    def handle_starttag(self,tag,items):
        a=dict(items)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='section' and 'id' in a:self.sections.append(a['id'])
        if tag=='meta':self.meta[a.get('property',a.get('name',''))]=a.get('content','')
        if tag=='script' and a.get('src','').startswith('https://analytics.artworksit.com/'):
            self.analytics.append(a)
        for key in ('src','href'):
            value=a.get(key,'')
            if value.startswith('#'):self.anchors.append(value[1:])
            elif value and not value.startswith(('https:','http:','data:','tel:','mailto:')):self.refs.append(value)
def check(html,standalone=False):
    p=Page();p.feed(html)
    assert len(p.ids)==len(set(p.ids)), 'Duplicate HTML IDs'
    assert all(anchor in p.ids for anchor in p.anchors), 'Broken section or SVG anchor'
    assert len(p.sections)==10, f'Expected 10 proposal sections, got {len(p.sections)}'
    assert all((ROOT/ref).is_file() for ref in p.refs), 'Missing local asset'
    if standalone:assert not p.refs, 'Standalone page still depends on local assets'
    assert len(p.analytics)==1 and p.analytics[0].get('data-website-id')=='0e8f7c25-c8f2-441e-a51a-011ba5fe3da7'
    assert 'defer' in p.analytics[0], 'Analytics must not block rendering'
    assert p.meta['og:image'].startswith('https://') and p.meta['twitter:card']=='summary_large_image'
    assert p.meta['og:image:width']=='1200' and p.meta['og:image:height']=='630'
    assert len(p.meta['description'])>60
    for schema in re.findall(r'<script type="application/ld\+json">(.*?)</script>',html,re.S):json.loads(schema)
    assert 'id="terms-list"><details>' in html, 'Terms must be available without JavaScript'
    print(('Standalone' if standalone else 'Source')+': assets, anchors, metadata, structured data and analytics pass')
if __name__=='__main__':
    check((ROOT/'index.html').read_text())
    portable=ROOT/'standalone/Devika-Sakhuja-Proposal.html'
    if portable.is_file():check(portable.read_text(),True)
