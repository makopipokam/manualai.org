#!/usr/bin/env python3
"""Render the MyCat attribution page from the photo-source manifest."""
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'photo-sources.json').read_text(encoding='utf-8'))
rows = []
for breed in manifest['breeds']:
    for photo in breed['photos']:
        license_url = photo.get('license_url') or photo['commons_url']
        rows.append(
            '<tr>'
            f'<td>{escape(breed["breed"])}</td>'
            f'<td>{escape(photo["title"])}</td>'
            f'<td>{escape(photo["artist"])}</td>'
            f'<td><a href="{escape(license_url, quote=True)}" target="_blank" rel="noopener noreferrer">{escape(photo["license"])}</a></td>'
            f'<td><a href="{escape(photo["commons_url"], quote=True)}" target="_blank" rel="noopener noreferrer">Originaldatei ↗</a></td>'
            '</tr>'
        )
html = '''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#745181">
  <title>Bildnachweise – MyCat</title>
  <style>
    :root{--ink:#302338;--muted:#75697b;--paper:#f7f2fa;--card:#fffaff;--line:#e4ddec;--accent:#745181}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
    main{width:min(1180px,100% - 32px);margin:0 auto;padding:40px 0 64px}article{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:clamp(20px,4vw,48px);box-shadow:0 12px 30px #30233812}
    h1{font-size:clamp(2rem,5vw,3rem);line-height:1.1;margin:0 0 12px;color:var(--accent)}h2{margin:32px 0 8px}p{margin:10px 0}.meta,small{color:var(--muted)}a{color:var(--accent);font-weight:650;overflow-wrap:anywhere}.back{display:inline-block;margin-bottom:22px;text-decoration:none}
    .notice{padding:14px 16px;border-left:4px solid var(--accent);background:#f0e7f5;border-radius:10px;margin:22px 0}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;vertical-align:top;padding:9px 10px;border-bottom:1px solid var(--line)}th{position:sticky;top:0;background:#f7f2fa;color:var(--accent)}tbody tr:last-child td{border-bottom:0}td:nth-child(2){overflow-wrap:anywhere}
    @media(max-width:700px){.table-wrap{overflow:visible;border:0}table,thead,tbody,tr,th,td{display:block}thead{display:none}tr{padding:12px 0;border-bottom:1px solid var(--line)}td{border:0;padding:2px 0}td:first-child{font-weight:700;color:var(--accent)}td:nth-child(2){color:var(--muted)}}
  </style>
</head>
<body><main><a class="back" href="/mycat/">← Zurück zu MyCat</a><article>
  <h1>Bildnachweise</h1>
  <p class="meta">MyCat · Wikimedia-Commons-Fotos · Stand: 03.10.2026</p>
  <div class="notice">Alle Galeriebilder werden als verkleinerte WebP-Kopien ohne Beschnitt lokal von MyCat ausgeliefert. Die folgenden Originaldateien, Urheberinnen und Urheber und Lizenzen sind den Commons-Metadaten zugeordnet. Bitte die verlinkte Originalseite für den vollständigen Lizenztext und die jeweilige Namensnennung beachten.</div>
  <p>Die Vorschläge beschreiben allgemeine Rasseprofile; ein Foto oder Rassemerkmal sagt nicht zuverlässig die Persönlichkeit eines einzelnen Tiers voraus. Die Katzenfotos sind Beispiele und keine Zusage, dass ein Tier exakt einem Rassestandard entspricht.</p>
  <h2>Verwendete Fotos</h2>
  <p>Die Bilddateien wurden auf höchstens 960 Pixel längste Kante verkleinert und in WebP umgewandelt. Es wurde kein Ausschnitt erzeugt. Eine maschinenlesbare Liste der Bildquellen steht außerdem in <a href="/mycat/photo-sources.json">photo-sources.json</a>.</p>
  <div class="table-wrap"><table><thead><tr><th>Katzenprofil</th><th>Originaldatei</th><th>Urheber/in</th><th>Lizenz</th><th>Quelle</th></tr></thead><tbody>
''' + '\n'.join(rows) + '''
  </tbody></table></div>
  <h2>App-Symbol</h2>
  <p>Die MyCat-Katzenillustration wurde eigens für diese App KI-generiert und lokal als PWA-Symbol eingebunden.</p>
  <p><small>Die Zuordnung enthält die Lizenzangaben, die zum Erstellungszeitpunkt aus der Wikimedia-Commons-API ausgelesen wurden. Die Originaldateiseite ist maßgeblich, falls Commons-Metadaten nachträglich geändert werden.</small></p>
</article></main></body></html>
'''
(ROOT / 'legal' / 'attribution.html').write_text(html, encoding='utf-8')
print(f'Wrote attribution for {len(rows)} local Commons photos.')
