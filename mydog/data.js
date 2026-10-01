// Big Five Personality Test Questions
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
    { text: "Ich bin...", options: ["spontan", "organisiert"], dimension: "C", reverse: true },
    { text: "Ich erledige Aufgaben...", options: ["wenn ich Lust habe", "pünktlich und gewissenhaft"], dimension: "C", reverse: true },
    { text: "Ich bin...", options: ["nachlässig", "gründlich"], dimension: "C", reverse: true },
    { text: "Ich plane...", options: ["selten im Voraus", "alles genau"], dimension: "C", reverse: true },
    { text: "Ich bin...", options: ["unordentlich", "ordentlich"], dimension: "C", reverse: true },
    { text: "Ich halte mich an...", options: ["Regeln nur wenn nötig", "Regeln strikt"], dimension: "C", reverse: true },
    
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
    { text: "Ich bin...", options: ["gelassen", "ängstlich"], dimension: "N", reverse: true },
    { text: "Ich reagiere auf Stress...", options: ["ruhig", "gestresst"], dimension: "N", reverse: true }
];

// Dog Database with personality matching
const dogDatabase = [
    {
        id: 1,
        name: "Labrador Retriever",
        breed: "Labrador Retriever",
        images: [
            "https://images.unsplash.com/photo-1568572933382-74d440642017?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1529429617124-95b44e41a3b2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
        ],
        description: "Der Labrador Retriever ist einer der beliebtesten Familienhunde weltweit. Er ist freundlich, intelligent und extrem lernwillig. Labradore lieben Wasser und Apportierspiele. Sie sind hervorragende Begleiter für aktive Familien und Einzelpersonen.",
        size: "Groß (55-62 cm, 25-36 kg)",
        energy: "Hoch - Braucht viel Bewegung und geistige Auslastung",
        grooming: "Mittel - Regelmäßiges Bürsten nötig",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Sehr gut trainierbar",
        personality: {
            O: 70,  // Openness - anpassungsfähig, neugierig
            C: 80,  // Conscientiousness - zuverlässig, arbeitswillig
            E: 90,  // Extraversion - gesellig, freundlich
            A: 95,  // Agreeableness - sehr verträglich
            N: 30   // Neuroticism - gelassen, stabil
        },
        idealFor: "Aktive Familien, Ersthundebesitzer, Menschen die einen treuen Begleiter suchen"
    },
    {
        id: 2,
        name: "Golden Retriever",
        breed: "Golden Retriever",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
        ],
        description: "Der Golden Retriever ist bekannt für sein sanftes Wesen und seine Geduld. Er ist ein hervorragender Familienhund und Therapiehund. Goldies sind intelligent, lernwillig und lieben es, Menschen zu gefallen.",
        size: "Groß (51-61 cm, 25-34 kg)",
        energy: "Hoch - Braucht tägliche Bewegung",
        grooming: "Hoch - Tägliches Bürsten empfohlen",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Sehr gut trainierbar",
        personality: {
            O: 75,
            C: 85,
            E: 85,
            A: 98,
            N: 25
        },
        idealFor: "Familien mit Kindern, Senioren, Therapiearbeit"
    },
    {
        id: 3,
        name: "Border Collie",
        breed: "Border Collie",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Border Collie ist einer der intelligentesten Hunde der Welt. Er ist extrem arbeitswillig und braucht viel geistige und körperliche Auslastung. Border Collies sind hervorragende Hütehunde und Sportpartner.",
        size: "Mittel (46-56 cm, 12-20 kg)",
        energy: "Sehr hoch - Braucht intensive Beschäftigung",
        grooming: "Mittel - Regelmäßiges Bürsten",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Ausgezeichnet trainierbar",
        personality: {
            O: 90,
            C: 95,
            E: 70,
            A: 60,
            N: 40
        },
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Hundesportler"
    },
    {
        id: 4,
        name: "Dackel",
        breed: "Dackel (Teckel)",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop"
        ],
        description: "Der Dackel ist ein mutiger, intelligenter und eigenwilliger kleiner Hund. Ursprünglich für die Jagd gezüchtet, hat er einen starken Jagdtrieb. Dackel sind loyal und haben eine große Persönlichkeit.",
        size: "Klein (20-27 cm, 4-9 kg)",
        energy: "Mittel - Braucht moderate Bewegung",
        grooming: "Niedrig - Einfache Pflege",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Mittel - Kann stur sein",
        personality: {
            O: 60,
            C: 70,
            E: 75,
            A: 50,
            N: 60
        },
        idealFor: "Erfahrene Hundebesitzer, Menschen die einen Hund mit Charakter suchen"
    },
    {
        id: 5,
        name: "Französische Bulldogge",
        breed: "Französische Bulldogge",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Die Französische Bulldogge ist ein lustiger, verspielter und anhänglicher Begleithund. Sie ist relativ pflegeleicht und kommt gut in Wohnungen zurecht. Französische Bulldoggen sind bekannt für ihre 'Fledermausohren' und ihr charmantes Wesen.",
        size: "Klein (30 cm, 8-14 kg)",
        energy: "Niedrig bis Mittel - Braucht moderate Bewegung",
        grooming: "Niedrig - Einfache Pflege",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Mittel - Kann stur sein",
        personality: {
            O: 50,
            C: 40,
            E: 80,
            A: 85,
            N: 40
        },
        idealFor: "Wohnungshaltung, Ersthundebesitzer, Menschen die einen gemütlichen Begleiter suchen"
    },
    {
        id: 6,
        name: "Beagle",
        breed: "Beagle",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Beagle ist ein fröhlicher, neugieriger und geselliger Hund. Er hat einen starken Jagdtrieb und eine hervorragende Nase. Beagles sind gute Familienhunde, die viel Bewegung und geistige Auslastung brauchen.",
        size: "Mittel (33-40 cm, 10-15 kg)",
        energy: "Hoch - Braucht viel Bewegung und Beschäftigung",
        grooming: "Niedrig - Einfache Pflege",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Mittel - Kann abgelenkt sein",
        personality: {
            O: 85,
            C: 50,
            E: 90,
            A: 80,
            N: 45
        },
        idealFor: "Aktive Familien, Menschen die gerne spazieren gehen"
    },
    {
        id: 7,
        name: "Malteser",
        breed: "Malteser",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Malteser ist ein kleiner, eleganter und anhänglicher Begleithund. Er ist intelligent, lernwillig und liebt es, auf dem Schoß zu sitzen. Malteser haben ein langes, seidiges Fell, das regelmäßige Pflege erfordert.",
        size: "Klein (20-25 cm, 1-4 kg)",
        energy: "Mittel - Braucht moderate Bewegung",
        grooming: "Hoch - Tägliches Bürsten empfohlen",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Gut trainierbar",
        personality: {
            O: 40,
            C: 60,
            E: 70,
            A: 90,
            N: 35
        },
        idealFor: "Wohnungshaltung, Menschen die einen Schoßhund suchen, Senioren"
    },
    {
        id: 8,
        name: "Deutscher Schäferhund",
        breed: "Deutscher Schäferhund",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Deutsche Schäferhund ist ein vielseitiger, intelligenter und treuer Hund. Er ist ein hervorragender Arbeitshund (Polizei, Rettung, Diensthund) und Familienhund. Schäferhunde brauchen viel Bewegung, geistige Auslastung und eine konsequente Erziehung.",
        size: "Groß (55-65 cm, 22-40 kg)",
        energy: "Sehr hoch - Braucht intensive Beschäftigung",
        grooming: "Mittel - Regelmäßiges Bürsten",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Ausgezeichnet trainierbar",
        personality: {
            O: 80,
            C: 90,
            E: 75,
            A: 70,
            N: 30
        },
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Schutz- und Diensthundearbeit"
    },
    {
        id: 9,
        name: "Pudel",
        breed: "Pudel (alle Größen)",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Pudel ist ein intelligenter, lernwilliger und hypoallergenen Hund. Er gibt es in drei Größen (Toy, Zwerg, Standard). Pudel sind vielseitig, können Tricks lernen und sind gute Begleiter für verschiedene Lebensstile.",
        size: "Variiert (Toy: 24-28 cm, Zwerg: 28-35 cm, Standard: 45-60 cm)",
        energy: "Hoch - Braucht viel Bewegung und geistige Auslastung",
        grooming: "Hoch - Professionelle Pflege empfohlen",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Ausgezeichnet trainierbar",
        personality: {
            O: 90,
            C: 85,
            E: 80,
            A: 85,
            N: 25
        },
        idealFor: "Allergiker, aktive Menschen, Hundesportler, Familien"
    },
    {
        id: 10,
        name: "Chihuahua",
        breed: "Chihuahua",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Chihuahua ist der kleinste Hunderasse der Welt, aber mit einer großen Persönlichkeit. Er ist mutig, wachsam und sehr an seine Bezugsperson gebunden. Chihuahuas können in Wohnungen gut gehalten werden.",
        size: "Sehr klein (15-23 cm, 1-3 kg)",
        energy: "Mittel - Braucht moderate Bewegung",
        grooming: "Niedrig bis Mittel - Abhängig von Felltyp",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Mittel - Kann stur sein",
        personality: {
            O: 50,
            C: 40,
            E: 60,
            A: 50,
            N: 70
        },
        idealFor: "Wohnungshaltung, Einzelpersonen, Menschen die einen kleinen Begleiter suchen"
    },
    {
        id: 11,
        name: "Australian Shepherd",
        breed: "Australian Shepherd",
        images: [
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Australian Shepherd ist ein intelligenter, energiegeladener Hütehund. Er ist extrem arbeitswillig und braucht viel körperliche und geistige Auslastung. Aussies sind loyal und gut mit Kindern, wenn sie richtig sozialisiert sind.",
        size: "Mittel (46-58 cm, 16-32 kg)",
        energy: "Sehr hoch - Braucht intensive Beschäftigung",
        grooming: "Mittel - Regelmäßiges Bürsten",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Ausgezeichnet trainierbar",
        personality: {
            O: 85,
            C: 90,
            E: 75,
            A: 65,
            N: 40
        },
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Hundesportler, Bauernhöfe"
    },
    {
        id: 12,
        name: "Cavalier King Charles Spaniel",
        breed: "Cavalier King Charles Spaniel",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop"
        ],
        description: "Der Cavalier King Charles Spaniel ist ein sanfter, anhänglicher und freundlicher Begleithund. Er ist bekannt für seine großen, dunklen Augen und sein seidiges Fell. Cavaliers sind hervorragende Schoßhunde und gute Familienhunde.",
        size: "Klein (30-33 cm, 5-8 kg)",
        energy: "Mittel - Braucht moderate Bewegung",
        grooming: "Hoch - Tägliches Bürsten empfohlen",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Gut trainierbar",
        personality: {
            O: 50,
            C: 60,
            E: 75,
            A: 95,
            N: 30
        },
        idealFor: "Wohnungshaltung, Familien, Senioren, Menschen die einen sanften Begleiter suchen"
    }
];

// Chat responses for dogs
const dogChatResponses = {
    "Labrador Retriever": {
        movement: "Ich brauche mindestens 1-2 Stunden Bewegung täglich, inklusive Spaziergänge, Apportierspiele und Schwimmen. Ich liebe Wasser!",
        food: "Ich esse am liebsten hochwertiges Hundefutter, etwa 250-400g täglich, aufgeteilt auf 2 Mahlzeiten. Leckerlis sind auch immer willkommen!",
        children: "Ich liebe Kinder! Ich bin sehr geduldig und spiele gerne mit Kindern jeden Alters. Aber wie bei allen Hunden: Kleine Kinder sollten nie unbeaufsichtigt mit mir spielen.",
        grooming: "Mein kurzes Fell braucht nur wöchentliches Bürsten. Aber ich haare ganz schön, besonders im Frühling und Herbst. Ein guter Staubsauger ist empfehlenswert!",
        lifespan: "Mit guter Pflege lebe ich durchschnittlich 10-14 Jahre. Labradore sind im Allgemeinen gesunde Hunde.",
        training: "Ich bin sehr leicht zu erziehen! Ich lerne schnell neue Kommandos und liebe es, meinem Besitzer zu gefallen. Positive Verstärkung mit Leckerlis und Lob funktioniert am besten."
    },
    "Golden Retriever": {
        movement: "Ich brauche täglich 1-2 Stunden Bewegung. Ich liebe lange Spaziergänge, Apportierspiele und Schwimmen. Geistige Auslastung durch Suchspiele ist auch wichtig.",
        food: "Ich esse etwa 250-400g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Achte darauf, dass ich nicht zu viel esse - Goldies neigen zu Übergewicht!",
        children: "Ich bin ein perfekter Familienhund! Ich bin sanft, geduldig und liebe Kinder. Ich spiele gerne, aber ich bin auch ein guter Kuschelpartner.",
        grooming: "Mein langes Fell braucht tägliches Bürsten, um Verfilzungen zu vermeiden. Besonders im Wechsel des Fells brauche ich extra Pflege. Auch die Ohren sollten regelmäßig kontrolliert werden.",
        lifespan: "Ich lebe durchschnittlich 10-12 Jahre. Mit guter Pflege und regelmäßigen Tierarztbesuchen kann ich auch länger leben.",
        training: "Ich bin sehr intelligent und lernwillig. Ich liebe es, neue Tricks zu lernen und meinem Besitzer zu gefallen. Sanfte, positive Trainingsmethoden funktionieren am besten."
    },
    "Border Collie": {
        movement: "Ich brauche VIELE Bewegung - mindestens 2 Stunden täglich, besser mehr! Ich liebe Hundesport wie Agility, Flyball und Hütearbeit. Ohne ausreichend Auslastung werde ich unglücklich und kann Verhaltensprobleme entwickeln.",
        food: "Ich esse etwa 200-350g hochwertiges Hundefutter täglich, je nach Aktivitätslevel. Bei viel Arbeit kann ich auch mehr brauchen.",
        children: "Ich kann gut mit älteren Kindern umgehen, die verstehen, dass ich ein Arbeitshund bin. Kleine Kinder können mich überfordern. Ich brauche eine konsequente Erziehung.",
        grooming: "Mein Fell braucht wöchentliches Bürsten. In der Haarwechselzeit sollte ich täglich gebürstet werden. Meine Ohren sollten regelmäßig kontrolliert werden.",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Border Collies sind im Allgemeinen gesunde Hunde, aber Hüftdysplasie kann ein Problem sein.",
        training: "Ich bin einer der intelligentesten Hunde der Welt! Ich lerne extrem schnell und brauche geistige Herausforderungen. Ohne Arbeit werde ich unglücklich. Ich eigne mich hervorragend für Hundesport."
    },
    "Dackel": {
        movement: "Ich brauche täglich 30-60 Minuten Bewegung. Ich liebe Spaziergänge und das Erkunden neuer Gerüche. Aber pass auf - ich habe einen starken Jagdtrieb und könnte weglaufen!",
        food: "Ich esse etwa 150-250g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Dackel neigen zu Übergewicht, also achte auf die Portionsgrößen!",
        children: "Ich kann gut mit älteren Kindern umgehen, die respektvoll mit mir sind. Kleine Kinder können mich verletzen, da ich einen langen Rücken habe. Ich bin ein mutiger kleiner Hund mit einer großen Persönlichkeit!",
        grooming: "Mein Fellpflegebedarf hängt von der Art ab: Kurzhaar-Dackel brauchen wenig Pflege, Langhaar-Dackel sollten regelmäßig gebürstet werden, und Rauhaar-Dackel brauchen gelegentliches Trimmen.",
        lifespan: "Ich lebe durchschnittlich 12-16 Jahre. Dackel sind im Allgemeinen robuste Hunde, aber Rückenschmerzen können ein Problem sein wegen meines langen Rückens.",
        training: "Ich bin intelligent, aber kann auch stur sein. Konsequente, positive Erziehung funktioniert am besten. Mein Jagdtrieb kann die Erziehung manchmal erschweren. Geduld ist wichtig!"
    },
    "Französische Bulldogge": {
        movement: "Ich brauche nur moderate Bewegung - etwa 30 Minuten täglich reichen mir. Ich bin kein Ausdauersportler! Ich liebe kurze Spaziergänge und viel Zeit auf dem Sofa.",
        food: "Ich esse etwa 150-200g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Französische Bulldoggen neigen zu Übergewicht und Allergien, also achte auf eine gute Ernährung.",
        children: "Ich liebe Kinder! Ich bin ein fröhlicher, verspielter Hund, der gut mit Kindern jeden Alters klarkommt. Aber ich bin kein großer Hund, also sollten kleine Kinder vorsichtig mit mir sein.",
        grooming: "Mein kurzes Fell braucht nur wöchentliches Bürsten. Aber ich habe viele Hautfalten, die regelmäßig gereinigt werden müssen, um Infektionen zu vermeiden.",
        lifespan: "Ich lebe durchschnittlich 10-12 Jahre. Französische Bulldoggen können gesundheitliche Probleme haben, besonders mit der Atmung wegen ihrer kurzen Schnauze.",
        training: "Ich bin intelligent, aber kann auch stur sein. Kurze, positive Trainingseinheiten funktionieren am besten. Ich reagiere gut auf Leckerlis und Lob. Aber ich bin kein Hund für strenge Erziehungsmethoden."
    },
    "Beagle": {
        movement: "Ich brauche mindestens 1 Stunde Bewegung täglich. Ich liebe lange Spaziergänge und das Folgen von Geruchsspuren. Ich habe viel Energie und brauche geistige Auslastung durch Suchspiele.",
        food: "Ich esse etwa 200-300g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Beagles neigen zu Übergewicht, also achte auf die Portionsgrößen! Auch sollte ich nicht vom Tisch gefüttert werden.",
        children: "Ich bin ein hervorragender Familienhund! Ich liebe Kinder und spiele gerne mit ihnen. Ich bin geduldig und fröhlich. Aber mein starker Jagdtrieb bedeutet, dass ich manchmal weglaufen könnte.",
        grooming: "Mein kurzes Fell braucht nur wöchentliches Bürsten. Aber ich haare ganz schön! Meine Ohren sollten regelmäßig kontrolliert werden, da sie zu Infektionen neigen können.",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Beagles sind im Allgemeinen gesunde Hunde, aber Ohreninfektionen und Übergewicht können Probleme sein.",
        training: "Ich bin intelligent, aber kann leicht abgelenkt werden, besonders von interessanten Gerüchen! Kurze, abwechslungsreiche Trainingseinheiten mit vielen Leckerlis funktionieren am besten. Geduld ist wichtig!"
    },
    "Malteser": {
        movement: "Ich brauche moderate Bewegung - etwa 30-45 Minuten täglich reichen mir. Ich liebe kurze Spaziergänge und Zeit auf dem Schoß meiner Bezugsperson.",
        food: "Ich esse etwa 100-150g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Malteser können wählerisch sein, also finde ein Futter, das ich gerne esse.",
        children: "Ich kann gut mit älteren Kindern umgehen, die sanft mit mir sind. Kleine Kinder können mich verletzen, da ich so klein bin. Ich bin ein wunderbarer Schoßhund für Erwachsene.",
        grooming: "Mein langes, seidige Fell braucht tägliches Bürsten, um Verfilzungen zu vermeiden. Auch meine Augen sollten regelmäßig gereinigt werden, da sie zu Tränenflecken neigen. Professionelles Trimmen alle 6-8 Wochen ist empfehlenswert.",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Malteser sind im Allgemeinen gesunde Hunde, aber Zahnprobleme und Patellaluxation können vorkommen.",
        training: "Ich bin intelligent und lernwillig. Ich reagiere gut auf positive Verstärkung mit Leckerlis und Lob. Ich kann viele Tricks lernen! Aber ich bin auch empfindlich, also sei geduldig mit mir."
    },
    "Deutscher Schäferhund": {
        movement: "Ich brauche viel Bewegung - mindestens 1-2 Stunden täglich. Ich liebe lange Spaziergänge, Laufen, Apportierspiele und geistige Herausforderungen. Ich bin ein Arbeitshund und brauche viel Auslastung.",
        food: "Ich esse etwa 350-500g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Bei viel Arbeit kann ich mehr brauchen. Achte auf eine ausgewogene Ernährung.",
        children: "Ich kann ein hervorragender Familienhund sein, wenn ich richtig sozialisiert bin. Ich bin loyal und beschützend. Aber ich brauche eine konsequente Erziehung und viel Sozialisierung mit Kindern.",
        grooming: "Mein Fell braucht wöchentliches Bürsten, besonders während des Haarwechsels. Ich haare ganz schön! Meine Krallen sollten regelmäßig kontrolliert werden, da ich groß bin.",
        lifespan: "Ich lebe durchschnittlich 9-13 Jahre. Deutsche Schäferhunde können gesundheitliche Probleme haben, besonders Hüft- und Ellbogendysplasie. Regelmäßige Tierarztbesuche sind wichtig.",
        training: "Ich bin extrem intelligent und lernwillig. Ich eigne mich hervorragend für Schutzhundearbeit, Rettungshundearbeit und Diensthundearbeit. Ich brauche eine konsequente, positive Erziehung und viel geistige Auslastung."
    },
    "Pudel": {
        movement: "Ich brauche täglich 45-60 Minuten Bewegung, plus geistige Auslastung. Ich liebe Spaziergänge, Apportierspiele und das Lernen neuer Tricks. Ich bin ein aktiver Hund!",
        food: "Ich esse etwa 150-300g hochwertiges Hundefutter täglich, je nach Größe (Toy, Zwerg oder Standard). Achte auf eine ausgewogene Ernährung.",
        children: "Ich bin ein hervorragender Familienhund! Ich bin intelligent, geduldig und liebe Kinder. Ich kann viele Tricks lernen und bin ein unterhaltsamer Begleiter. Aber ich brauche auch Zeit für mich.",
        grooming: "Mein lockiges Fell braucht viel Pflege! Ich sollte alle 6-8 Wochen professionell getrimmt werden. Tägliches Bürsten ist empfehlenswert, um Verfilzungen zu vermeiden. Ich bin hypoallergen, was für Allergiker gut ist.",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Pudel sind im Allgemeinen gesunde Hunde, aber Augenprobleme und Hüftdysplasie können vorkommen.",
        training: "Ich bin einer der intelligentesten Hunde der Welt! Ich lerne extrem schnell und liebe geistige Herausforderungen. Ich eigne mich hervorragend für Hundesport und Tricktraining. Positive Verstärkung funktioniert am besten."
    },
    "Chihuahua": {
        movement: "Ich brauche moderate Bewegung - etwa 30 Minuten täglich reichen mir. Ich liebe kurze Spaziergänge und Zeit auf dem Schoß. Ich bin kein Ausdauersportler, aber ich bin neugierig und erkunde gerne meine Umgebung.",
        food: "Ich esse nur wenig - etwa 50-100g hochwertiges Hundefutter täglich, aufgeteilt auf 2-3 kleine Mahlzeiten. Chihuahuas können wählerisch sein, also finde ein Futter, das ich gerne esse.",
        children: "Ich kann mit älteren Kindern umgehen, die respektvoll und sanft mit mir sind. Kleine Kinder können mich leicht verletzen, da ich so klein bin. Ich bin ein Ein-Personen-Hund und bin sehr an meine Bezugsperson gebunden.",
        grooming: "Mein Fellpflegebedarf hängt von der Art ab: Kurzhaar-Chihuahuas brauchen wenig Pflege, Langhaar-Chihuahuas sollten regelmäßig gebürstet werden. Meine Zähne sollten regelmäßig kontrolliert werden, da kleine Hunde zu Zahnproblemen neigen.",
        lifespan: "Ich lebe durchschnittlich 12-20 Jahre! Chihuahuas sind bekannt für ihre Langlebigkeit. Aber ich kann gesundheitliche Probleme haben, besonders mit den Zähnen, dem Herzen und der Patella.",
        training: "Ich bin intelligent, aber kann auch stur sein. Kurze, positive Trainingseinheiten funktionieren am besten. Ich reagiere gut auf Leckerlis und Lob. Aber ich bin kein Hund für harte Erziehungsmethoden - ich bin empfindlich!"
    },
    "Australian Shepherd": {
        movement: "Ich brauche VIELE Bewegung - mindestens 2 Stunden täglich, besser mehr! Ich liebe Hundesport wie Agility, Flyball und Hütearbeit. Ohne ausreichend Auslastung werde ich unglücklich und kann Verhaltensprobleme entwickeln.",
        food: "Ich esse etwa 250-400g hochwertiges Hundefutter täglich, je nach Aktivitätslevel. Bei viel Arbeit kann ich auch mehr brauchen. Achte auf eine ausgewogene Ernährung.",
        children: "Ich kann gut mit älteren Kindern umgehen, die verstehen, dass ich ein Arbeitshund bin. Kleine Kinder können mich überfordern. Ich brauche eine konsequente Erziehung und viel Sozialisierung.",
        grooming: "Mein Fell braucht wöchentliches Bürsten. In der Haarwechselzeit sollte ich täglich gebürstet werden. Meine Ohren sollten regelmäßig kontrolliert werden. Manche Aussies haben natürliche Bobtails (kurze Schwänze).",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Australian Shepherds sind im Allgemeinen gesunde Hunde, aber Hüftdysplasie, Augenprobleme und Epilepsie können vorkommen.",
        training: "Ich bin extrem intelligent und arbeitswillig. Ich lerne sehr schnell und brauche viel geistige und körperliche Auslastung. Ich eigne mich hervorragend für Hundesport und Hütearbeit. Konsequente, positive Erziehung ist wichtig."
    },
    "Cavalier King Charles Spaniel": {
        movement: "Ich brauche moderate Bewegung - etwa 45 Minuten täglich reichen mir. Ich liebe Spaziergänge und Zeit mit meiner Familie. Ich bin kein Hochleistungssportler, aber ich bin gerne aktiv.",
        food: "Ich esse etwa 150-200g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Cavaliers können zu Übergewicht neigen, also achte auf die Portionsgrößen.",
        children: "Ich bin ein hervorragender Familienhund! Ich liebe Kinder und bin sehr geduldig. Ich bin ein sanfter, anhänglicher Hund, der gerne kuschelt. Aber ich bin auch verspielt und unterhaltsam.",
        grooming: "Mein seidiges Fell braucht tägliches Bürsten, um Verfilzungen zu vermeiden. Besonders die Ohren, die Beine und der Schwanz brauchen Aufmerksamkeit. Professionelles Trimmen alle 6-8 Wochen ist empfehlenswert.",
        lifespan: "Ich lebe durchschnittlich 9-14 Jahre. Cavaliers sind im Allgemeinen gesunde Hunde, aber Herzprobleme (Mitralklappenerkrankung) und Syringomyelie können vorkommen. Regelmäßige Tierarztbesuche sind wichtig.",
        training: "Ich bin intelligent und lernwillig. Ich reagiere gut auf positive Verstärkung mit Leckerlis und Lob. Ich kann viele Tricks lernen! Aber ich bin auch empfindlich, also sei geduldig und sanft mit mir."
    }
};

// Quick reply messages mapping
const quickReplyMessages = {
    "Wie viel Bewegung brauchst du täglich?": "movement",
    "Was frisst du am liebsten?": "food",
    "Wie verhältst du dich mit Kindern?": "children",
    "Brauchst du viel Pflege?": "grooming",
    "Wie lange lebst du durchschnittlich?": "lifespan",
    "Bist du leicht zu erziehen?": "training"
};

// Function to calculate match score between user personality and dog personality
function calculateMatchScore(userPersonality, dogPersonality) {
    let score = 0;
    let maxScore = 0;
    
    // Calculate score for each dimension
    for (const dim in userPersonality) {
        const userScore = userPersonality[dim];
        const dogScore = dogPersonality[dim];
        
        // The closer the scores, the better the match
        // We use 100 - absolute difference to get a similarity score
        const dimScore = 100 - Math.abs(userScore - dogScore);
        score += dimScore;
        maxScore += 100;
    }
    
    // Return percentage match
    return (score / maxScore) * 100;
}

// Function to get the best matching dogs for a user personality
function getMatchingDogs(userPersonality, limit = 5) {
    const dogsWithScores = dogDatabase.map(dog => {
        const score = calculateMatchScore(userPersonality, dog.personality);
        return { ...dog, matchScore: score };
    });
    
    // Sort by match score (descending)
    dogsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    return dogsWithScores.slice(0, limit);
}

// Function to generate match explanation
function generateMatchExplanation(userPersonality, dog) {
    const explanations = [];
    
    // Openness
    if (userPersonality.O > 70 && dog.personality.O > 70) {
        explanations.push("Ihr beide seid neugierig und offen für neue Erfahrungen - perfekt für gemeinsame Abenteuer!");
    } else if (userPersonality.O <= 30 && dog.personality.O <= 30) {
        explanations.push("Ihr beide bevorzugt bewährte Routinen und ein ruhiges Leben - eine gute Basis für eine harmonische Beziehung!");
    }
    
    // Conscientiousness
    if (userPersonality.C > 70 && dog.personality.C > 70) {
        explanations.push("Ihr beide seid gewissenhaft und zuverlässig - das erleichtert die Erziehung und das gemeinsame Leben!");
    } else if (userPersonality.C <= 30 && dog.personality.C <= 30) {
        explanations.push("Ihr beide seid eher spontan - das macht das Leben interessant, aber eine konsequente Erziehung ist trotzdem wichtig!");
    }
    
    // Extraversion
    if (userPersonality.E > 70 && dog.personality.E > 70) {
        explanations.push("Ihr beide seid gesellig und energiegeladen - perfekt für gemeinsame Aktivitäten und Ausflüge!");
    } else if (userPersonality.E <= 30 && dog.personality.E <= 30) {
        explanations.push("Ihr beide bevorzugt ruhige Momente - das schafft eine entspannte Atmosphäre zu Hause!");
    }
    
    // Agreeableness
    if (userPersonality.A > 70 && dog.personality.A > 70) {
        explanations.push("Ihr beide seid mitfühlend und kooperativ - das schafft eine harmonische und liebevolle Beziehung!");
    } else if (userPersonality.A <= 30 && dog.personality.A <= 30) {
        explanations.push("Ihr beide habt einen starken Willen - eine konsequente und respektvolle Erziehung ist hier besonders wichtig!");
    }
    
    // Neuroticism
    if (userPersonality.N <= 30 && dog.personality.N <= 30) {
        explanations.push("Ihr beide seid gelassen und emotional stabil - das macht das Zusammenleben sehr entspannt!");
    } else if (userPersonality.N > 70 && dog.personality.N > 70) {
        explanations.push("Ihr beide seid etwas ängstlicher - Geduld und eine sichere Umgebung sind wichtig für euer Wohlbefinden!");
    }
    
    // If no specific matches, use generic explanation
    if (explanations.length === 0) {
        explanations.push("Basierend auf deinem Persönlichkeitsprofil passt dieser Hund gut zu deinem Lebensstil und Charakter.");
    }
    
    return explanations.join(" ");
}
