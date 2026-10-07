from math import sin, cos, pi
from pathlib import Path
import html

OUT = Path(__file__).parent
W, H = 1600, 1000
INK = '#1d2925'; MUTED = '#627068'; GREEN = '#286d59'; PALE = '#fbf8f0'
BLUE = '#6c9da1'; SOLAR = '#375b7a'; CORAL = '#c66e50'; LINE = '#aeb8ae'; GOLD = '#d8ab4e'
parts = []
def add(s): parts.append(s)
def text(x,y,s,size=20,fill=INK,weight=500,anchor='start',family='Inter, Arial, sans-serif'):
    add(f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{html.escape(s)}</text>')
def line(x1,y1,x2,y2,stroke=LINE,width=2,dash=''):
    d=f' stroke-dasharray="{dash}"' if dash else ''
    add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{width}"{d}/>')
def rect(x,y,w,h,fill,stroke='none',rx=0,sw=2):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def path(d,fill='none',stroke=INK,width=2):
    add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>')
def circle(cx,cy,r,fill,stroke='none',sw=2):
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
add('<rect width="100%" height="100%" fill="#f3efe5"/>')
# Header
text(70,76,'WORLD HUNGER SOLVES  /  VORSTUDIE',18,GREEN,800)
text(70,126,'Die Dispensary — rund, solar, on demand',38,INK,750)
text(70,158,'Schematische Schnitt- und Draufsicht · nicht maßstäblich · technische Detailplanung offen',17,MUTED,450)
# panel background
rect(55,190,970,740,'#fbf8f0','#d5d4c9',28,2)
rect(1050,190,495,740,'#fbf8f0','#d5d4c9',28,2)
text(90,232,'A  QUERSCHNITT',14,GREEN,800)
text(1080,232,'B  DRAUFSICHT · RING',14,GREEN,800)

# Cross-section elevations
# roof surface: outer raised edges slope inward to center collection channel
# PV panels separated by rainwater channels
path('M140 365 Q270 315 390 370 L485 418 L515 418 L610 370 Q735 315 865 365', '#e8e3d4', INK, 5)
# lower central drain channel
path('M485 418 Q500 430 515 418 L515 445 Q500 456 485 445 Z', BLUE, '#42696d', 3)
# segmented PV panels along sloping roof, trapezoids
for d in [
'M165 355 L220 339 L328 361 L290 378 Z',
'M235 335 L294 326 L395 369 L351 383 Z',
'M310 324 L362 325 L457 396 L416 399 Z',
'M835 355 L780 339 L672 361 L710 378 Z',
'M765 335 L706 326 L605 369 L649 383 Z',
'M690 324 L638 325 L543 396 L584 399 Z']:
    path(d, SOLAR, '#fbf8f0', 3)
# rain channel on panels; rain vectors
for x1,y1,x2,y2 in [(175,367,488,422),(242,353,491,424),(318,353,494,423),(825,367,512,422),(758,353,509,424),(682,353,506,423)]:
    line(x1,y1,x2,y2,BLUE,3)
for x,y in [(205,344),(290,333),(360,344),(795,344),(710,333),(640,344)]:
    path(f'M{x} {y-30} l0 28 l-8 -9 M{x} {y-2} l8 -9', 'none', BLUE, 3)
# roof arrows/pv labels
text(500,294,'PV-Segmente',17,SOLAR,750,'middle')
text(500,316,'Lichtfläche + offene Regenrinnen',14,MUTED,500,'middle')
line(500,321,500,344,SOLAR,2)
text(500,480,'Regenwasser: Rinne · First flush · Filter · Tank',15,BLUE,700,'middle')
path('M500 446 L500 457 L500 462','none',BLUE,3)
# central storage cistern under central gutter
rect(432,495,136,80,'#d9e9e7','#42696d',15,3)
text(500,526,'Zisterne',18,INK,750,'middle')
text(500,550,'nur nach Aufbereitung',12,MUTED,600,'middle')
# water path to process
path('M500 576 L500 603 L412 603 L412 638','none',BLUE,4)
path('M403 628 L412 640 L421 628','none',BLUE,3)
text(315,600,'aufbereitetes Wasser',13,BLUE,650,'middle')
# building ring chamber walls, rounded hull
path('M185 383 L185 765 Q185 785 210 785 L800 785 Q825 785 825 765 L825 383', '#ede7db', INK, 4)
# lower floor
line(185,785,825,785,INK,5)
# crop opening areas and service windows around walls
for x in [225,330,670,775]:
    rect(x,560,38,44,'#efe1d2',CORAL,8,3)
    line(x+19,604,x+19,635,CORAL,2)
# customer-facing outward arrow icons
for x,dir in [(201,-1),(811,1)]:
    y=582
    path(f'M{x} {y} l{dir*38} 0 M{x+dir*28} {y-8} l{dir*10} 8 l{dir*-10} 8','none',CORAL,3)
# closed inner circular herb store represented section row of bins
text(500,496,'108 Sorten max.',14,GREEN,800,'middle')
for i,x in enumerate([255,292,329,366,403,440,477,514,551,588,625,662,699,736,773]):
    rect(x,461,24,28,'#dce8d8',GREEN,5,1.5)
    if i%3==0: line(x+12,462,x+12,455,GREEN,1.5)
text(500,455,'geschlossene Kräuter-Kartuschen (Blick von der Seite)',12,MUTED,500,'middle')
# cooking modules center under bins
rect(298,646,404,104,'#eee8da','#8b7961',16,3)
text(500,670,'Modulare Kochzellen · kleine Lose · versetzt gestartet',17,INK,750,'middle')
for i,x in enumerate([325,382,439,496,553,610,667]):
    rect(x,687,42,43,'#fffdf8',GREEN,9,2)
    # steam lines
    path(f'M{x+12} 683 q-6 -8 0 -13 M{x+25} 683 q-6 -8 0 -13','none',BLUE,1.5)
text(500,747,'Reis + Wasser + genau eine ausgewählte Trockenkräuter-Sorte',13,MUTED,600,'middle')
# output streams split to outward station
path('M345 752 L345 765 L242 765 L242 620','none',CORAL,3)
path('M655 752 L655 765 L768 765 L768 620','none',BLUE,3)
text(250,635,'Teereis',13,CORAL,800,'middle')
text(760,635,'Reistee',13,BLUE,800,'middle')
# data controls/energy buffer
rect(208,818,250,77,'#e6edeb','#9cb7ae',12,2)
text(333,846,'PV / Regler / Akku',15,INK,750,'middle')
text(333,870,'Steuerung / Pumpen / Notbetrieb',12,MUTED,500,'middle')
rect(542,818,250,77,'#f2e4ce','#d1aa63',12,2)
text(667,846,'PV / elektrische Wärme',15,INK,750,'middle')
text(667,870,'Wärme-Puffer klein, kein Reis-Lager',12,MUTED,500,'middle')
line(333,818,380,752,GOLD,2,'6 5')
line(667,818,610,752,GOLD,2,'6 5')

# Right plan view ring with up to 108 outward stations
cx,cy,R=1298,490,160
circle(cx,cy,R,'#ede7db',INK,3)
circle(cx,cy,R-22,'#fbf8f0','#a7b2a8',2)
# radial stations, exactly 108 in the concept drawing
for i in range(108):
    a=2*pi*i/108 - pi/2
    x=cx+(R+13)*cos(a); y=cy+(R+13)*sin(a)
    ang=a*180/pi+90
    add(f'<rect x="{x-4:.1f}" y="{y-7:.1f}" width="8" height="14" rx="2" fill="{CORAL}" stroke="#fbf8f0" stroke-width="1" transform="rotate({ang:.2f} {x:.1f} {y:.1f})"/>')
# center zones
circle(cx,cy,95,'#dce8d8',GREEN,2)
circle(cx,cy,56,'#e6edeb','#7a9d94',2)
text(cx,cy-18,'108',22,GREEN,800,'middle')
text(cx,cy+5,'Ausgaben max.',12,INK,750,'middle')
text(cx,cy+25,'geschlossen',10,MUTED,500,'middle')
text(cx,cy+126,'innen: Kräuter-Ring · Prozesskern',14,MUTED,600,'middle')
# legend
rect(1087,734,423,162,'#f3efe5','#d5d4c9',15,1.5)
rect(1110,758,15,15,SOLAR,'none',3,0)
text(1138,772,'PV-Module auf den Dachsegmenten',14,INK,550)
line(1110,801,1127,801,BLUE,4)
text(1138,806,'Regenwasserkanal im Dach',14,INK,550)
rect(1110,824,15,15,GREEN,'none',3,0)
text(1138,838,'Kräuter-Kartuschen (Sortenlimit 108)',14,INK,550)
rect(1110,857,15,15,CORAL,'none',3,0)
text(1138,871,'Ausgabestellen nach außen (max. 108)',14,INK,550)
# Footer caveat
text(70,966,'Entwurfsprinzip: Nie auf Vorrat kochen. Nachfrage steuert Losgröße und Takt; unverkaufte warme Speisen sind kein Betriebsmodus.',15,MUTED,600)
add('</svg>')
svg='\n'.join(parts)
(OUT/'architecture.svg').write_text(svg,encoding='utf-8')
try:
    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode(),write_to=str(OUT/'architecture.png'),output_width=1600,output_height=1000)
except Exception as e:
    print('SVG gespeichert; PNG nicht erzeugt:',e)
else:
    print('SVG und PNG gespeichert')
