from pathlib import Path
import base64,re
r=Path(__file__).resolve().parents[1]
(r/'standalone').mkdir(exist_ok=True)
s=(r/'index.html').read_text()
fontcss=(r/'fonts.css').read_text()
for path in re.findall(r'url\((fonts/[^)]+)\)',fontcss):
 fontcss=fontcss.replace(path,('data:font/woff2;base64,' if path.endswith('.woff2') else 'data:font/ttf;base64,')+base64.b64encode((r/path).read_bytes()).decode())
s=s.replace('<link rel="stylesheet" href="fonts.css">','<style>'+fontcss+'</style>').replace('<link rel="stylesheet" href="style.css">','<style>'+(r/'style.css').read_text()+'</style>')
for name in ['gsap.min.js','ScrollTrigger.min.js','SplitText.min.js','script.js','type-controls.js','gradient-wave.js','hero.js','loader.js']:
 s=s.replace('<script src="'+name+'"></script>','<script>'+(r/name).read_text().replace('</script','<\\/script')+'</script>')
for asset in ['lake-twilight.jpg','lake-day.jpg']:
 s=s.replace(asset,'data:image/jpeg;base64,'+base64.b64encode((r/asset).read_bytes()).decode())
s=s.replace('celebration.jpg','data:image/jpeg;base64,'+base64.b64encode((r/'celebration.jpg').read_bytes()).decode())
(r/'standalone/Devika-Sakhuja-Proposal.html').write_text(s)
print('Created standalone/Devika-Sakhuja-Proposal.html')
