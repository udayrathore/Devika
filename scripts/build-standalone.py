"""Build the portable HTML without altering remote analytics or social metadata."""
from pathlib import Path
import base64,mimetypes,re
ROOT=Path(__file__).resolve().parents[1]
def data_uri(path):
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
def build(root):
    html=(root/'index.html').read_text()
    html=re.sub(r'<link\b[^>]*\brel="preload"[^>]*>\n?', '',html)
    def css_link(match):
        path=root/match[1]
        if not path.is_file():return match[0]
        css=path.read_text()
        def asset_url(m):
            value=m[1].strip('\"\'')
            asset=root/value
            return 'url('+data_uri(asset)+')' if not value.startswith(('data:','http:','https:','#')) and asset.is_file() else m[0]
        css=re.sub(r'url\(([^)]+)\)',asset_url,css)
        return '<style>'+css+'</style>'
    html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css_link,html)
    def script(match):
        path=root/match[1]
        if match[1].startswith(('https:','http:')) or not path.is_file():return match[0]
        return '<script>'+path.read_text().replace('</script','<\\/script')+'</script>'
    html=re.sub(r'<script\b[^>]*\bsrc="([^"]+)"[^>]*></script>',script,html)
    def image(match):
        value=match[2];path=root/value
        return match[1]+data_uri(path)+match[3] if not value.startswith(('https:','http:','data:','#')) and path.is_file() and path.suffix in ('.webp','.jpg','.png','.svg') else match[0]
    html=re.sub(r'((?:src|href)=")([^"]+)(")',image,html)
    return html
if __name__=='__main__':
    target=ROOT/'standalone/Devika-Sakhuja-Proposal.html'
    target.parent.mkdir(exist_ok=True)
    target.write_text(build(ROOT))
    print('Created',target.relative_to(ROOT))
