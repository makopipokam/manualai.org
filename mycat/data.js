// Big Five Personality Test Questions
// Shared five-point Likert scale used by every personality question.
const likertScale = [0, 25, 50, 75, 100];

// Each question maps to one of the OCEAN dimensions:
// O = Openness (Offenheit)
// C = Conscientiousness (Gewissenhaftigkeit)
// E = Extraversion (Extraversion)
// A = Agreeableness (Verträglichkeit)
// N = Neuroticism (Neurotizismus)

const bigFiveQuestions = [
    // Openness (10 questions)
    { text: "Ich bin eher...", options: ["traditionell und bewährt", "neugierig und experimentierfreudig"], dimension: "O", reverse: false },
    { text: "Ich genieße...", options: ["vertraute Routinen", "neue Erfahrungen"], dimension: "O", reverse: false },
    { text: "Ich bin...", options: ["praktisch veranlagt", "kreativ und künstlerisch"], dimension: "O", reverse: false },
    { text: "Ich mag...", options: ["einfache, klare Lösungen", "komplexe Probleme zu lösen"], dimension: "O", reverse: false },
    { text: "Ich bin...", options: ["bodenständig", "fantasievoll"], dimension: "O", reverse: false },
    { text: "Ich interessiere mich für...", options: ["konkrete Fakten", "abstrakte Ideen"], dimension: "O", reverse: false },
    { text: "Ich bin...", options: ["vorsichtig mit Veränderungen", "offen für Veränderungen"], dimension: "O", reverse: false },
    { text: "Ich mag...", options: ["bewährte Traditionen", "ungewöhnliche Ideen"], dimension: "O", reverse: false },
    { text: "Ich bin...", options: ["realistisch", "träumerisch"], dimension: "O", reverse: false },
    { text: "Ich genieße...", options: ["einfache Freuden", "tiefgründige Diskussionen"], dimension: "O", reverse: false },

    // Conscientiousness (6 questions)
    { text: "Ich bin...", options: ["spontan", "organisiert"], dimension: "C", reverse: false },
    { text: "Ich erledige Aufgaben...", options: ["wenn ich Lust habe", "pünktlich und gewissenhaft"], dimension: "C", reverse: false },
    { text: "Ich bin...", options: ["nachlässig", "gründlich"], dimension: "C", reverse: false },
    { text: "Ich plane...", options: ["selten im Voraus", "alles genau"], dimension: "C", reverse: false },
    { text: "Ich bin...", options: ["unordentlich", "ordentlich"], dimension: "C", reverse: false },
    { text: "Ich halte mich an...", options: ["Regeln nur wenn nötig", "Regeln strikt"], dimension: "C", reverse: false },

    // Extraversion (6 questions)
    { text: "Ich bin...", options: ["zurückhaltend", "gesellig"], dimension: "E", reverse: false },
    { text: "Ich fühle mich wohl...", options: ["in Ruhe", "im Mittelpunkt"], dimension: "E", reverse: false },
    { text: "Ich bin...", options: ["still", "energiegeladen"], dimension: "E", reverse: false },
    { text: "Ich rede...", options: ["wenig", "viel"], dimension: "E", reverse: false },
    { text: "Ich bin...", options: ["reserviert", "offen und freundlich"], dimension: "E", reverse: false },
    { text: "Ich genieße...", options: ["Zeit für mich allein", "Partys mit vielen Leuten"], dimension: "E", reverse: false },

    // Agreeableness (6 questions)
    { text: "Ich bin...", options: ["kritisch", "mitfühlend"], dimension: "A", reverse: false },
    { text: "Ich handle...", options: ["im eigenen Interesse", "im Interesse aller"], dimension: "A", reverse: false },
    { text: "Ich bin...", options: ["konkurrenzorientiert", "kooperativ"], dimension: "A", reverse: false },
    { text: "Ich vergebe...", options: ["schwer", "leicht"], dimension: "A", reverse: false },
    { text: "Ich bin...", options: ["misstrauisch", "vertrauensselig"], dimension: "A", reverse: false },
    { text: "Ich helfe anderen...", options: ["nur wenn ich muss", "gerne und oft"], dimension: "A", reverse: false },

    // Neuroticism (2 questions)
    { text: "Ich bin...", options: ["gelassen", "ängstlich"], dimension: "N", reverse: false },
    { text: "Ich reagiere auf Stress...", options: ["ruhig", "gestresst"], dimension: "N", reverse: false }
];

// Cat breed profiles: matching scores are playful heuristics, not scientific findings.
const catDatabase = [
    {
        "id": 1,
        "name": "Hauskatze / Domestic Shorthair",
        "breed": "Hauskatze / Domestic Shorthair",
        "images": [
            "/mycat/images/v1/01/1.webp",
            "/mycat/images/v1/01/2.webp",
            "/mycat/images/v1/01/3.webp",
            "/mycat/images/v1/01/4.webp",
            "/mycat/images/v1/01/5.webp",
            "/mycat/images/v1/01/6.webp"
        ],
        "imagesLabels": [
            "Hauskatze / Domestic Shorthair · Foto 1",
            "Hauskatze / Domestic Shorthair · Foto 2",
            "Hauskatze / Domestic Shorthair · Foto 3",
            "Hauskatze / Domestic Shorthair · Foto 4",
            "Hauskatze / Domestic Shorthair · Foto 5",
            "Hauskatze / Domestic Shorthair · Foto 6"
        ],
        "description": "Kurzhaarige Hauskatzen sind keine einheitliche Rasse, sondern sehr verschieden. Das Fell lässt sich meist unkompliziert bürsten; Spiel und Beschäftigung sollten zum individuellen Tier passen.",
        "size": "Mittelgroß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Stark vom einzelnen Tier abhängig",
        "trainability": "spielerisch und individuell",
        "personality": {
            "O": 55,
            "C": 50,
            "E": 50,
            "A": 55,
            "N": 50
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: Kann verspielt oder gelassen sein, Kann selbstbewusst oder scheu sein, Kein einheitlicher Persönlichkeitstyp.",
        "temperament": [
            "Kann verspielt oder gelassen sein",
            "Kann selbstbewusst oder scheu sein",
            "Kein einheitlicher Persönlichkeitstyp"
        ],
        "healthCaution": "TICA betont die große individuelle Vielfalt. Persönlichkeit und Bedürfnisse lassen sich bei Hauskatzen nicht verlässlich aus einem einheitlichen Rasseprofil ableiten.",
        "sourceName": "TICA – Household Pet",
        "sourceUrl": "https://tica.org/breed/household-pet/",
        "ratings": {
            "family": 3,
            "energy": 3,
            "trainability": 3,
            "grooming": 2
        }
    },
    {
        "id": 2,
        "name": "Maine Coon",
        "breed": "Maine Coon",
        "images": [
            "/mycat/images/v1/02/1.webp",
            "/mycat/images/v1/02/2.webp",
            "/mycat/images/v1/02/3.webp",
            "/mycat/images/v1/02/4.webp",
            "/mycat/images/v1/02/5.webp",
            "/mycat/images/v1/02/6.webp"
        ],
        "imagesLabels": [
            "Maine Coon · Foto 1",
            "Maine Coon · Foto 2",
            "Maine Coon · Foto 3",
            "Maine Coon · Foto 4",
            "Maine Coon · Foto 5",
            "Maine Coon · Foto 6"
        ],
        "description": "Maine Coons gelten als freundliche, sanfte und gesellige Begleiter, die gern in der Nähe ihrer Menschen sind und oft verspielt bleiben. Das halblange Fell braucht regelmäßiges Kämmen; der individuelle Pflegebedarf kann variieren.",
        "size": "Groß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "regelmäßig – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 65,
            "C": 55,
            "E": 75,
            "A": 85,
            "N": 25
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: freundlich, sanft, sozial.",
        "temperament": [
            "freundlich",
            "sanft",
            "sozial",
            "verspielt",
            "gelassen"
        ],
        "healthCaution": "TICA weist auf eine mögliche Veranlagung zu hypertropher Kardiomyopathie (HCM) hin und empfiehlt in der Zucht genetische Tests sowie regelmäßige Herzultraschalluntersuchungen. Kein individuelles Gesundheitsurteil.",
        "sourceName": "TICA – Maine Coon",
        "sourceUrl": "https://tica.org/breed/maine-coon/",
        "ratings": {
            "family": 5,
            "energy": 3,
            "trainability": 4,
            "grooming": 3
        }
    },
    {
        "id": 3,
        "name": "Ragdoll",
        "breed": "Ragdoll",
        "images": [
            "/mycat/images/v1/03/1.webp",
            "/mycat/images/v1/03/2.webp",
            "/mycat/images/v1/03/3.webp",
            "/mycat/images/v1/03/4.webp",
            "/mycat/images/v1/03/5.webp",
            "/mycat/images/v1/03/6.webp"
        ],
        "imagesLabels": [
            "Ragdoll · Foto 1",
            "Ragdoll · Foto 2",
            "Ragdoll · Foto 3",
            "Ragdoll · Foto 4",
            "Ragdoll · Foto 5",
            "Ragdoll · Foto 6"
        ],
        "description": "Ragdolls gelten als gelassen, freundlich und anhänglich; sie spielen gern, sind aber meist moderat aktiv und kommen laut TICA oft gut mit Kindern und anderen Tieren zurecht. Das seidige halblange Fell sollte regelmäßig, etwa wöchentlich, gebürstet werden.",
        "size": "Groß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 75,
            "C": 60,
            "E": 65,
            "A": 90,
            "N": 25
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: gelassen, freundlich, anhänglich.",
        "temperament": [
            "gelassen",
            "freundlich",
            "anhänglich",
            "intelligent",
            "spielfreudig",
            "tolerant"
        ],
        "healthCaution": "TICA nennt HCM als mögliche gesundheitliche Veranlagung und empfiehlt, bei Zuchtkatzen nach einem HCM-DNA-Test zu fragen. Kein individuelles Gesundheitsurteil.",
        "sourceName": "TICA – Ragdoll",
        "sourceUrl": "https://tica.org/breed/ragdoll/",
        "ratings": {
            "family": 5,
            "energy": 3,
            "trainability": 4,
            "grooming": 2
        }
    },
    {
        "id": 4,
        "name": "Britisch Kurzhaar",
        "breed": "Britisch Kurzhaar",
        "images": [
            "/mycat/images/v1/04/1.webp",
            "/mycat/images/v1/04/2.webp",
            "/mycat/images/v1/04/3.webp",
            "/mycat/images/v1/04/4.webp",
            "/mycat/images/v1/04/5.webp",
            "/mycat/images/v1/04/6.webp"
        ],
        "imagesLabels": [
            "Britisch Kurzhaar · Foto 1",
            "Britisch Kurzhaar · Foto 2",
            "Britisch Kurzhaar · Foto 3",
            "Britisch Kurzhaar · Foto 4",
            "Britisch Kurzhaar · Foto 5",
            "Britisch Kurzhaar · Foto 6"
        ],
        "description": "Die Britisch Kurzhaar gilt als ruhig, freundlich und anhänglich, bleibt aber gern unabhängig. Ihr dichtes Kurzhaar lässt sich meist mit wöchentlichem Kämmen pflegen; regelmäßiges Spielen unterstützt einen aktiven Alltag.",
        "size": "Mittelgroß",
        "energy": "eher ruhig – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "spielerisch und individuell",
        "personality": {
            "O": 45,
            "C": 70,
            "E": 35,
            "A": 75,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: gelassen, freundlich, eher unabhängig.",
        "temperament": [
            "gelassen",
            "freundlich",
            "eher unabhängig",
            "ruhig mit gelegentlichen Spielphasen"
        ],
        "healthCaution": "TICA weist auf das Risiko einer hypertrophen Kardiomyopathie (HCM) hin. Fragen zu Vorsorge und Gesundheit gehören in eine Tierarztpraxis.",
        "sourceName": "TICA – British Shorthair",
        "sourceUrl": "https://tica.org/breed/british-shorthair/",
        "ratings": {
            "family": 4,
            "energy": 2,
            "trainability": 3,
            "grooming": 2
        }
    },
    {
        "id": 5,
        "name": "Siamkatze",
        "breed": "Siamkatze",
        "images": [
            "/mycat/images/v1/05/1.webp",
            "/mycat/images/v1/05/2.webp",
            "/mycat/images/v1/05/3.webp",
            "/mycat/images/v1/05/4.webp",
            "/mycat/images/v1/05/5.webp",
            "/mycat/images/v1/05/6.webp"
        ],
        "imagesLabels": [
            "Siamkatze · Foto 1",
            "Siamkatze · Foto 2",
            "Siamkatze · Foto 3",
            "Siamkatze · Foto 4",
            "Siamkatze · Foto 5",
            "Siamkatze · Foto 6"
        ],
        "description": "Siamkatzen gelten als sehr soziale, gesprächige und aktive Gefährten. Sie schätzen Zuwendung, Spiel, Beschäftigung und Klettermöglichkeiten; ihr kurzes Fell ist meist pflegeleicht.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 75,
            "C": 55,
            "E": 90,
            "A": 75,
            "N": 40
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: sehr sozial und menschenbezogen, gesprächig, intelligent.",
        "temperament": [
            "sehr sozial und menschenbezogen",
            "gesprächig",
            "intelligent",
            "verspielt",
            "athletisch"
        ],
        "healthCaution": "TICA nennt eine mögliche Empfindlichkeit gegenüber Narkosemitteln; vor Eingriffen sollte die Tierarztpraxis informiert werden.",
        "sourceName": "TICA – Siamese",
        "sourceUrl": "https://tica.org/breed/siamese/",
        "ratings": {
            "family": 5,
            "energy": 5,
            "trainability": 4,
            "grooming": 1
        }
    },
    {
        "id": 6,
        "name": "Perserkatze",
        "breed": "Perserkatze",
        "images": [
            "/mycat/images/v1/06/1.webp",
            "/mycat/images/v1/06/2.webp",
            "/mycat/images/v1/06/3.webp",
            "/mycat/images/v1/06/4.webp",
            "/mycat/images/v1/06/5.webp",
            "/mycat/images/v1/06/6.webp"
        ],
        "imagesLabels": [
            "Perserkatze · Foto 1",
            "Perserkatze · Foto 2",
            "Perserkatze · Foto 3",
            "Perserkatze · Foto 4",
            "Perserkatze · Foto 5",
            "Perserkatze · Foto 6"
        ],
        "description": "Perserkatzen gelten als sanft, ruhig und freundlich; auf kurze verspielte Phasen folgen gern entspannte Ruhezeiten. Das lange Fell braucht tägliches Kämmen und regelmäßige Pflege von Gesicht und Augen.",
        "size": "Mittelgroß",
        "energy": "eher ruhig – orientiert am typischen Aktivitätsprofil",
        "grooming": "hoch – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "spielerisch und individuell",
        "personality": {
            "O": 45,
            "C": 65,
            "E": 35,
            "A": 80,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: sanft, ruhig, freundlich.",
        "temperament": [
            "sanft",
            "ruhig",
            "freundlich",
            "mag sanftes Spiel",
            "bevorzugt ruhige Umgebung"
        ],
        "healthCaution": "TICA empfiehlt bei Perserkatzen, mögliche polyzystische Nierenerkrankung (PKD) sowie Atemwegs- und Augenprobleme zu beachten und Vorsorge mit Tierarztpraxis und Zuchtstelle abzustimmen.",
        "sourceName": "TICA – Persian",
        "sourceUrl": "https://tica.org/breed/persian/",
        "ratings": {
            "family": 4,
            "energy": 2,
            "trainability": 3,
            "grooming": 5
        }
    },
    {
        "id": 7,
        "name": "Bengalkatze",
        "breed": "Bengalkatze",
        "images": [
            "/mycat/images/v1/07/1.webp",
            "/mycat/images/v1/07/2.webp",
            "/mycat/images/v1/07/3.webp",
            "/mycat/images/v1/07/4.webp",
            "/mycat/images/v1/07/5.webp",
            "/mycat/images/v1/07/6.webp"
        ],
        "imagesLabels": [
            "Bengalkatze · Foto 1",
            "Bengalkatze · Foto 2",
            "Bengalkatze · Foto 3",
            "Bengalkatze · Foto 4",
            "Bengalkatze · Foto 5",
            "Bengalkatze · Foto 6"
        ],
        "description": "Bengalkatzen sind meist neugierig, selbstsicher und sehr aktiv. Sie brauchen regelmäßige Bewegung, Kletter- und Denkspiele sowie Beschäftigung; ihr kurzes Fell ist pflegeleicht, und viele lernen gern Tricks.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "oft sehr lernfreudig; jedes Tier individuell",
        "personality": {
            "O": 85,
            "C": 60,
            "E": 90,
            "A": 75,
            "N": 30
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: selbstsicher, neugierig, athletisch.",
        "temperament": [
            "selbstsicher",
            "neugierig",
            "athletisch",
            "lebhaft",
            "intelligent",
            "menschenbezogen"
        ],
        "healthCaution": "TICA empfiehlt, bei Züchtern nach Untersuchungen auf HCM und genetischen Tests auf progressive Retinaatrophie sowie PK-Mangel zu fragen.",
        "sourceName": "TICA – Bengal",
        "sourceUrl": "https://tica.org/breed/bengal/",
        "ratings": {
            "family": 4,
            "energy": 5,
            "trainability": 5,
            "grooming": 1
        }
    },
    {
        "id": 8,
        "name": "Sphynx",
        "breed": "Sphynx",
        "images": [
            "/mycat/images/v1/08/1.webp",
            "/mycat/images/v1/08/2.webp",
            "/mycat/images/v1/08/3.webp",
            "/mycat/images/v1/08/4.webp",
            "/mycat/images/v1/08/5.webp",
            "/mycat/images/v1/08/6.webp"
        ],
        "imagesLabels": [
            "Sphynx · Foto 1",
            "Sphynx · Foto 2",
            "Sphynx · Foto 3",
            "Sphynx · Foto 4",
            "Sphynx · Foto 5",
            "Sphynx · Foto 6"
        ],
        "description": "Sphynx-Katzen gelten als anhänglich, gesellig und aktiv: Sie suchen gern Nähe und spielen oft ausdauernd. Haut, Ohren und Krallen benötigen besondere Pflege; die haararme Katze sollte vor Kälte und Sonne geschützt werden.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "erhöht – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 80,
            "C": 55,
            "E": 95,
            "A": 90,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: anhänglich, kontaktfreudig, lebhaft.",
        "temperament": [
            "anhänglich",
            "kontaktfreudig",
            "lebhaft",
            "neugierig",
            "intelligent"
        ],
        "healthCaution": "TICA nennt HCM als mögliches Risiko und empfiehlt Herz-Ultraschall-Screenings. Dies ist keine individuelle Diagnose.",
        "sourceName": "TICA – Sphynx",
        "sourceUrl": "https://tica.org/breed/sphynx/",
        "ratings": {
            "family": 5,
            "energy": 5,
            "trainability": 4,
            "grooming": 4
        }
    },
    {
        "id": 9,
        "name": "Norwegische Waldkatze",
        "breed": "Norwegische Waldkatze",
        "images": [
            "/mycat/images/v1/09/1.webp",
            "/mycat/images/v1/09/2.webp",
            "/mycat/images/v1/09/3.webp",
            "/mycat/images/v1/09/4.webp",
            "/mycat/images/v1/09/5.webp",
            "/mycat/images/v1/09/6.webp"
        ],
        "imagesLabels": [
            "Norwegische Waldkatze · Foto 1",
            "Norwegische Waldkatze · Foto 2",
            "Norwegische Waldkatze · Foto 3",
            "Norwegische Waldkatze · Foto 4",
            "Norwegische Waldkatze · Foto 5",
            "Norwegische Waldkatze · Foto 6"
        ],
        "description": "Die Norwegische Waldkatze gilt als sanft, liebevoll und anpassungsfähig; sie ist gern bei ihrer Familie und spielt interaktiv, bleibt aber eigenständig. Sie klettert und springt gern; während des Fellwechsels hilft zusätzliches Kämmen.",
        "size": "Groß",
        "energy": "aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "spielerisch und individuell",
        "personality": {
            "O": 80,
            "C": 60,
            "E": 65,
            "A": 85,
            "N": 25
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: sanftmütig, liebevoll, intelligent.",
        "temperament": [
            "sanftmütig",
            "liebevoll",
            "intelligent",
            "anpassungsfähig",
            "verspielt",
            "familienbezogen und unabhängig"
        ],
        "healthCaution": "TICA warnt, dass Mylar-Spielzeug beim Verschlucken schaden kann. Rasse-Tendenzen sind keine Garantie und unterscheiden sich je nach Tier.",
        "sourceName": "TICA – Norwegian Forest",
        "sourceUrl": "https://tica.org/breed/norwegian-forest/",
        "ratings": {
            "family": 4,
            "energy": 4,
            "trainability": 3,
            "grooming": 2
        }
    },
    {
        "id": 10,
        "name": "Sibirische Katze",
        "breed": "Sibirische Katze",
        "images": [
            "/mycat/images/v1/10/1.webp",
            "/mycat/images/v1/10/2.webp",
            "/mycat/images/v1/10/3.webp",
            "/mycat/images/v1/10/4.webp",
            "/mycat/images/v1/10/5.webp",
            "/mycat/images/v1/10/6.webp"
        ],
        "imagesLabels": [
            "Sibirische Katze · Foto 1",
            "Sibirische Katze · Foto 2",
            "Sibirische Katze · Foto 3",
            "Sibirische Katze · Foto 4",
            "Sibirische Katze · Foto 5",
            "Sibirische Katze · Foto 6"
        ],
        "description": "Sibirische Katzen gelten als lebhaft, verspielt und anhänglich; sie suchen gern die Nähe ihrer Familie. Das dichte, saisonal wechselnde Fell sollte mehrmals pro Woche gekämmt werden.",
        "size": "Groß",
        "energy": "aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "erhöht – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 70,
            "C": 65,
            "E": 75,
            "A": 85,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: lebhaft, verspielt, anhänglich.",
        "temperament": [
            "lebhaft",
            "verspielt",
            "anhänglich",
            "intelligent",
            "familienbezogen"
        ],
        "healthCaution": "TICA empfiehlt, auf HCM untersuchen zu lassen. Rassebeschreibungen sind Tendenzen, keine Garantie; individuelle Gesundheitsfragen gehören in die Tierarztpraxis.",
        "sourceName": "TICA – Siberian",
        "sourceUrl": "https://tica.org/breed/siberian/",
        "ratings": {
            "family": 5,
            "energy": 4,
            "trainability": 4,
            "grooming": 4
        }
    },
    {
        "id": 11,
        "name": "Abessinier",
        "breed": "Abessinier",
        "images": [
            "/mycat/images/v1/11/1.webp",
            "/mycat/images/v1/11/2.webp",
            "/mycat/images/v1/11/3.webp",
            "/mycat/images/v1/11/4.webp",
            "/mycat/images/v1/11/5.webp",
            "/mycat/images/v1/11/6.webp"
        ],
        "imagesLabels": [
            "Abessinier · Foto 1",
            "Abessinier · Foto 2",
            "Abessinier · Foto 3",
            "Abessinier · Foto 4",
            "Abessinier · Foto 5",
            "Abessinier · Foto 6"
        ],
        "description": "Abessinier gelten als ausgesprochen aktiv, neugierig und verspielt. Sie klettern und erkunden gern und beziehen Menschen oft in ihre Beschäftigung ein; das kurze Fell braucht wenig Pflege.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 90,
            "C": 45,
            "E": 90,
            "A": 75,
            "N": 25
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: sehr aktiv, verspielt, neugierig.",
        "temperament": [
            "sehr aktiv",
            "verspielt",
            "neugierig",
            "intelligent",
            "anhänglich",
            "sozial"
        ],
        "healthCaution": "TICA nennt eine erhöhte Veranlagung unter anderem für Pyruvatkinase-Mangel und progressive Retinaatrophie; entsprechende Gentests sind bei der Zucht relevant.",
        "sourceName": "TICA – Abyssinian",
        "sourceUrl": "https://tica.org/breed/abyssinian/",
        "ratings": {
            "family": 4,
            "energy": 5,
            "trainability": 4,
            "grooming": 1
        }
    },
    {
        "id": 12,
        "name": "Heilige Birma",
        "breed": "Heilige Birma",
        "images": [
            "/mycat/images/v1/12/1.webp",
            "/mycat/images/v1/12/2.webp",
            "/mycat/images/v1/12/3.webp",
            "/mycat/images/v1/12/4.webp",
            "/mycat/images/v1/12/5.webp",
            "/mycat/images/v1/12/6.webp"
        ],
        "imagesLabels": [
            "Heilige Birma · Foto 1",
            "Heilige Birma · Foto 2",
            "Heilige Birma · Foto 3",
            "Heilige Birma · Foto 4",
            "Heilige Birma · Foto 5",
            "Heilige Birma · Foto 6"
        ],
        "description": "Die Heilige Birma gilt als sanft, anhänglich und menschenbezogen; sie sucht gern Gesellschaft und hat eine verspielte, neugierige Seite. Das seidige halblange Fell lässt sich meist durch wöchentliches Kämmen pflegen.",
        "size": "Mittelgroß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 75,
            "C": 55,
            "E": 70,
            "A": 90,
            "N": 25
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: sanft, anhänglich, menschenbezogen.",
        "temperament": [
            "sanft",
            "anhänglich",
            "menschenbezogen",
            "gesellig",
            "verspielt",
            "neugierig"
        ],
        "healthCaution": "Rassebeschreibungen sind Tendenzen, keine Garantie. Pflege- und Gesundheitsbedürfnisse unterscheiden sich individuell.",
        "sourceName": "TICA – Birman",
        "sourceUrl": "https://tica.org/breed/birman/",
        "ratings": {
            "family": 5,
            "energy": 3,
            "trainability": 4,
            "grooming": 2
        }
    },
    {
        "id": 13,
        "name": "Russisch Blau",
        "breed": "Russisch Blau",
        "images": [
            "/mycat/images/v1/13/1.webp",
            "/mycat/images/v1/13/2.webp",
            "/mycat/images/v1/13/3.webp",
            "/mycat/images/v1/13/4.webp",
            "/mycat/images/v1/13/5.webp",
            "/mycat/images/v1/13/6.webp"
        ],
        "imagesLabels": [
            "Russisch Blau · Foto 1",
            "Russisch Blau · Foto 2",
            "Russisch Blau · Foto 3",
            "Russisch Blau · Foto 4",
            "Russisch Blau · Foto 5",
            "Russisch Blau · Foto 6"
        ],
        "description": "Russisch Blau gelten als ruhig, intelligent und ihrer Familie eng verbunden; Fremden gegenüber können sie zunächst reserviert sein. Sie mögen Spiel und Beschäftigung; das kurze, dichte Fell lässt sich mit gelegentlichem Bürsten pflegen.",
        "size": "Klein bis mittelgroß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 70,
            "C": 75,
            "E": 45,
            "A": 75,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: ruhig, intelligent, beobachtend.",
        "temperament": [
            "ruhig",
            "intelligent",
            "beobachtend",
            "anhänglich mit der Familie",
            "verspielt",
            "bei Fremden zurückhaltend"
        ],
        "healthCaution": "Rassemerkmale sind Tendenzen, keine Garantie; jedes Tier ist individuell. Bei konkreten Gesundheitsfragen bitte eine Tierarztpraxis fragen.",
        "sourceName": "TICA – Russian Blue",
        "sourceUrl": "https://tica.org/breed/russian-blue/",
        "ratings": {
            "family": 4,
            "energy": 3,
            "trainability": 4,
            "grooming": 1
        }
    },
    {
        "id": 14,
        "name": "Devon Rex",
        "breed": "Devon Rex",
        "images": [
            "/mycat/images/v1/14/1.webp",
            "/mycat/images/v1/14/2.webp",
            "/mycat/images/v1/14/3.webp",
            "/mycat/images/v1/14/4.webp",
            "/mycat/images/v1/14/5.webp",
            "/mycat/images/v1/14/6.webp"
        ],
        "imagesLabels": [
            "Devon Rex · Foto 1",
            "Devon Rex · Foto 2",
            "Devon Rex · Foto 3",
            "Devon Rex · Foto 4",
            "Devon Rex · Foto 5",
            "Devon Rex · Foto 6"
        ],
        "description": "Devon Rex gelten als neugierig, menschenbezogen und verspielt; sie sind aktiv und lernen oft gern Tricks. Das kurze, wellige Fell braucht wenig Pflege, doch Ohren und Krallen können besondere Aufmerksamkeit benötigen.",
        "size": "Klein bis mittelgroß",
        "energy": "aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 85,
            "C": 55,
            "E": 90,
            "A": 85,
            "N": 30
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: menschenbezogen, verspielt, neugierig.",
        "temperament": [
            "menschenbezogen",
            "verspielt",
            "neugierig",
            "intelligent",
            "gesellig",
            "aktiv"
        ],
        "healthCaution": "TICA empfiehlt Gentests einschließlich auf Devon-Myopathie sowie HCM-Untersuchungen der Elterntiere.",
        "sourceName": "TICA – Devon Rex",
        "sourceUrl": "https://tica.org/breed/devon-rex/",
        "ratings": {
            "family": 5,
            "energy": 4,
            "trainability": 4,
            "grooming": 2
        }
    },
    {
        "id": 15,
        "name": "Türkisch Angora",
        "breed": "Türkisch Angora",
        "images": [
            "/mycat/images/v1/15/1.webp",
            "/mycat/images/v1/15/2.webp",
            "/mycat/images/v1/15/3.webp",
            "/mycat/images/v1/15/4.webp",
            "/mycat/images/v1/15/5.webp",
            "/mycat/images/v1/15/6.webp"
        ],
        "imagesLabels": [
            "Türkisch Angora · Foto 1",
            "Türkisch Angora · Foto 2",
            "Türkisch Angora · Foto 3",
            "Türkisch Angora · Foto 4",
            "Türkisch Angora · Foto 5",
            "Türkisch Angora · Foto 6"
        ],
        "description": "Türkisch Angoras werden als anhänglich, gesellig, intelligent und neugierig beschrieben. Sie sind aktiv, lieben Spiel und Bewegung und können Tricks lernen; das seidige Fell lässt sich meist wöchentlich kämmen.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gelegentlich – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "oft sehr lernfreudig; jedes Tier individuell",
        "personality": {
            "O": 85,
            "C": 60,
            "E": 90,
            "A": 75,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: anhänglich, menschenbezogen, intelligent.",
        "temperament": [
            "anhänglich",
            "menschenbezogen",
            "intelligent",
            "neugierig",
            "lebhaft",
            "athletisch",
            "lernfreudig"
        ],
        "healthCaution": "Bei weißen Türkisch Angoras kann teilweise oder vollständige Taubheit vorkommen; TICA nennt einen BAER-Hörtest zur Abklärung.",
        "sourceName": "TICA – Turkish Angora",
        "sourceUrl": "https://tica.org/breed/turkish-angora/",
        "ratings": {
            "family": 4,
            "energy": 5,
            "trainability": 5,
            "grooming": 2
        }
    },
    {
        "id": 16,
        "name": "Burma",
        "breed": "Burma",
        "images": [
            "/mycat/images/v1/16/1.webp",
            "/mycat/images/v1/16/2.webp",
            "/mycat/images/v1/16/3.webp",
            "/mycat/images/v1/16/4.webp",
            "/mycat/images/v1/16/5.webp",
            "/mycat/images/v1/16/6.webp"
        ],
        "imagesLabels": [
            "Burma · Foto 1",
            "Burma · Foto 2",
            "Burma · Foto 3",
            "Burma · Foto 4",
            "Burma · Foto 5",
            "Burma · Foto 6"
        ],
        "description": "Burma-Katzen gelten als anhänglich, menschenbezogen und verspielt; sie genießen Gesellschaft und Beschäftigung. Ihr kurzes, seidiges Fell braucht wenig Pflege; manche Tiere fühlen sich bei langem Alleinsein weniger wohl.",
        "size": "Mittelgroß",
        "energy": "aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 75,
            "C": 60,
            "E": 82,
            "A": 90,
            "N": 38
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: anhänglich, menschenbezogen, gesellig.",
        "temperament": [
            "anhänglich",
            "menschenbezogen",
            "gesellig",
            "verspielt",
            "intelligent",
            "tolerant"
        ],
        "healthCaution": "TICA nennt HCM als mögliches Gesundheitsrisiko und betont Screening durch Zuchtstellen; dies ist keine individuelle Diagnose.",
        "sourceName": "TICA – Burmese",
        "sourceUrl": "https://tica.org/breed/burmese/",
        "ratings": {
            "family": 5,
            "energy": 4,
            "trainability": 4,
            "grooming": 1
        }
    },
    {
        "id": 17,
        "name": "Cornish Rex",
        "breed": "Cornish Rex",
        "images": [
            "/mycat/images/v1/17/1.webp",
            "/mycat/images/v1/17/2.webp",
            "/mycat/images/v1/17/3.webp",
            "/mycat/images/v1/17/4.webp",
            "/mycat/images/v1/17/5.webp",
            "/mycat/images/v1/17/6.webp"
        ],
        "imagesLabels": [
            "Cornish Rex · Foto 1",
            "Cornish Rex · Foto 2",
            "Cornish Rex · Foto 3",
            "Cornish Rex · Foto 4",
            "Cornish Rex · Foto 5",
            "Cornish Rex · Foto 6"
        ],
        "description": "Cornish Rex gelten als lebhaft, verspielt, intelligent und sozial; sie suchen gern die Nähe ihrer Menschen. Ihr Bewegungsdrang braucht Spiel und Beschäftigung, während das kurze, wellige Fell wenig Pflege braucht.",
        "size": "Mittelgroß",
        "energy": "sehr aktiv – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Kann bei respektvollem Umgang gut passen",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 75,
            "C": 60,
            "E": 90,
            "A": 80,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: lebhaft, verspielt, sehr sozial.",
        "temperament": [
            "lebhaft",
            "verspielt",
            "sehr sozial",
            "menschenbezogen",
            "intelligent",
            "aufmerksam"
        ],
        "healthCaution": "TICA nennt mögliche Hautprobleme einschließlich Sonnenbrand sowie mögliche Veranlagungen für HCM und Patellaluxation. Das sind allgemeine Vorsorgehinweise, keine Diagnose.",
        "sourceName": "TICA – Cornish Rex",
        "sourceUrl": "https://tica.org/breed/cornish-rex/",
        "ratings": {
            "family": 4,
            "energy": 5,
            "trainability": 4,
            "grooming": 1
        }
    },
    {
        "id": 18,
        "name": "Amerikanisch Kurzhaar",
        "breed": "Amerikanisch Kurzhaar",
        "images": [
            "/mycat/images/v1/18/1.webp",
            "/mycat/images/v1/18/2.webp",
            "/mycat/images/v1/18/3.webp",
            "/mycat/images/v1/18/4.webp",
            "/mycat/images/v1/18/5.webp",
            "/mycat/images/v1/18/6.webp"
        ],
        "imagesLabels": [
            "Amerikanisch Kurzhaar · Foto 1",
            "Amerikanisch Kurzhaar · Foto 2",
            "Amerikanisch Kurzhaar · Foto 3",
            "Amerikanisch Kurzhaar · Foto 4",
            "Amerikanisch Kurzhaar · Foto 5",
            "Amerikanisch Kurzhaar · Foto 6"
        ],
        "description": "Amerikanisch Kurzhaar gilt als gelassen, menschenbezogen und anpassungsfähig; sie schätzt Gesellschaft, spielt gern und kann apportieren. Ihr kurzes Fell ist pflegeleicht und braucht nur gelegentliches Kämmen.",
        "size": "Mittelgroß",
        "energy": "mittel – orientiert am typischen Aktivitätsprofil",
        "grooming": "gering – Pflegebedarf variiert individuell",
        "familyFriendly": "Gilt oft als sozial; jedes Tier bleibt individuell",
        "trainability": "lernt oft gut über Spiel und Belohnung",
        "personality": {
            "O": 65,
            "C": 70,
            "E": 65,
            "A": 80,
            "N": 35
        },
        "idealFor": "Menschen, deren Alltag zu folgendem Profil passt: gutartig, gelassen, menschenbezogen.",
        "temperament": [
            "gutartig",
            "gelassen",
            "menschenbezogen",
            "neugierig",
            "intelligent",
            "verspielt und unabhängig"
        ],
        "healthCaution": "Rassetendenzen sind keine Garantie und variieren von Katze zu Katze. Bei individuellen Gesundheitsfragen bitte eine Tierarztpraxis fragen.",
        "sourceName": "TICA – American Shorthair",
        "sourceUrl": "https://tica.org/breed/american-shorthair/",
        "ratings": {
            "family": 5,
            "energy": 3,
            "trainability": 4,
            "grooming": 1
        }
    }
];

// Heuristic profile similarity for play only; not a validated compatibility test.
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

// Breed-specific chat details live in each sourced catalogue entry; no live AI or diagnosis.
const catChatResponses = {};
