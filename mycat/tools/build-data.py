#!/usr/bin/env python3
"""Build browser data.js from the curated cat source catalogue."""
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
source=Path(__file__).resolve().parents[2]/'mydog'/'data.js'
source_text=source.read_text(encoding='utf-8')
marker='// Dog Database with personality matching'
if marker not in source_text:
    raise SystemExit('Could not locate reusable Big Five questionnaire in MyDog data.js')
questions=source_text.split(marker,1)[0]
research=json.loads((root/'breed-research.json').read_text(encoding='utf-8'))['breeds']
large={2,3,9,10}; small={13,14}; sizes={i:('Groß' if i in large else 'Klein bis mittelgroß' if i in small else 'Mittelgroß') for i in range(1,19)}
energy={1:'niedrig',2:'eher ruhig',3:'mittel',4:'aktiv',5:'sehr aktiv'}
groom={1:'gering',2:'gelegentlich',3:'regelmäßig',4:'erhöht',5:'hoch'}
family={1:'Individuelles Tier und Umfeld entscheidend',2:'Ruhige, passende Begegnungen wichtig',3:'Stark vom einzelnen Tier abhängig',4:'Kann bei respektvollem Umgang gut passen',5:'Gilt oft als sozial; jedes Tier bleibt individuell'}
train={1:'braucht viel Geduld und positive Verstärkung',2:'mit Geduld und kurzen Einheiten',3:'spielerisch und individuell',4:'lernt oft gut über Spiel und Belohnung',5:'oft sehr lernfreudig; jedes Tier individuell'}
profiles=[]
for b in research:
    photos=[f"/mycat/images/v1/{b['id']:02d}/{i}.webp" for i in range(1,7)]
    profiles.append({
      'id':b['id'], 'name':b['name'], 'breed':b['name'], 'images':photos,
      'imagesLabels':[f"{b['name']} · Foto {i}" for i in range(1,7)],
      'description':b['description'], 'size':sizes[b['id']],
      'energy':f"{energy[b['energy']]} – orientiert am typischen Aktivitätsprofil",
      'grooming':f"{groom[b['grooming']]} – Pflegebedarf variiert individuell",
      'familyFriendly':family[b['family']], 'trainability':train[b['trainability']],
      'personality':b['personality'],
      'idealFor':f"Menschen, deren Alltag zu folgendem Profil passt: {', '.join(b['temperament'][:3])}.",
      'temperament':b['temperament'], 'healthCaution':b['healthCaution'],
      'sourceName':b['sourceName'], 'sourceUrl':b['sourceUrl'],
      'ratings':{'family':b['family'],'energy':b['energy'],'trainability':b['trainability'],'grooming':b['grooming']}
    })
out=questions+'// Cat breed profiles: matching scores are playful heuristics, not scientific findings.\n'
out+='const catDatabase = '+json.dumps(profiles,ensure_ascii=False,indent=4)+';\n\n'
out+='''// Heuristic profile similarity for play only; not a validated compatibility test.
function calculateMatchScore(userPersonality, catPersonality) {
    const dimensions = Object.keys(catPersonality || {});
    if (!dimensions.length) return 0;
    const total = dimensions.reduce((sum, dimension) => {
        const userScore = Number(userPersonality?.[dimension] ?? 50);
        const catScore = Number(catPersonality[dimension] ?? 50);
        return sum + (100 - Math.abs(userScore - catScore));
    }, 0);
    return total / dimensions.length;
}

function getMatchingCats(userPersonality, limit = catDatabase.length) {
    const catsWithScores = catDatabase.map(cat => ({
        ...cat,
        matchScore: calculateMatchScore(userPersonality, cat.personality)
    }));
    catsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    return catsWithScores.slice(0, limit);
}

'''
out+="// Breed-specific chat details live in each sourced catalogue entry; no live AI or diagnosis.\nconst catChatResponses = {};\n"
out='\n'.join(line.rstrip(' \t') for line in out.splitlines())+'\n'
(root/'data.js').write_text(out,encoding='utf-8')
print(f'Wrote {len(profiles)} researched MyCat profiles and {len(questions.splitlines())} shared questionnaire lines.')
