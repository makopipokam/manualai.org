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
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Labrador (schwarz)", "Labrador mit Ball", "Labrador Porträt", "Labrador Welpe", "Labrador beim Schwimmen", "Labrador Senior"],
        description: "Der Labrador Retriever ist einer der beliebtesten Familienhunde weltweit. Er ist freundlich, intelligent und extrem lernwillig. Labradore lieben Wasser und Apportierspiele. Sie sind hervorragende Begleiter für aktive Familien und Einzelpersonen.",
        size: "Groß (55-62 cm, 25-36 kg)",
        energy: "Hoch - Braucht viel Bewegung und geistige Auslastung",
        grooming: "Mittel - Regelmäßiges Bürsten nötig",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Sehr gut trainierbar",
        personality: {
            O: 70,
            C: 80,
            E: 90,
            A: 95,
            N: 30
        },
        idealFor: "Aktive Familien, Ersthundebesitzer, Menschen die einen treuen Begleiter suchen",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 5,
            grooming: 4,
            health: 4
        }
    },
    {
        id: 2,
        name: "Golden Retriever",
        breed: "Golden Retriever",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Golden Retriever", "Golden im Schnee", "Golden Porträt", "Golden Welpe", "Golden beim Apportieren", "Golden Senior"],
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
        idealFor: "Familien mit Kindern, Senioren, Therapiearbeit",
        ratings: {
            family: 5,
            energy: 4,
            trainability: 5,
            grooming: 2,
            health: 4
        }
    },
    {
        id: 3,
        name: "Border Collie",
        breed: "Border Collie",
        images: [
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Border Collie", "Border Collie beim Hüten", "Border Collie Porträt", "Border Collie Welpe", "Border Collie beim Agility", "Border Collie Senior"],
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
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Hundesportler",
        ratings: {
            family: 3,
            energy: 5,
            trainability: 5,
            grooming: 3,
            health: 4
        }
    },
    {
        id: 4,
        name: "Dackel",
        breed: "Dackel (Teckel)",
        images: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Dackel", "Dackel im Gras", "Dackel Porträt", "Dackel Welpe", "Dackel beim Spielen", "Dackel Senior"],
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
        idealFor: "Erfahrene Hundebesitzer, Menschen die einen Hund mit Charakter suchen",
        ratings: {
            family: 3,
            energy: 3,
            trainability: 3,
            grooming: 5,
            health: 4
        }
    },
    {
        id: 5,
        name: "Französische Bulldogge",
        breed: "Französische Bulldogge",
        images: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsene Französische Bulldogge", "Bulldogge auf Sofa", "Bulldogge Porträt", "Bulldogge Welpe", "Bulldogge beim Schlafen", "Bulldogge Senior"],
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
        idealFor: "Wohnungshaltung, Ersthundebesitzer, Menschen die einen gemütlichen Begleiter suchen",
        ratings: {
            family: 5,
            energy: 2,
            trainability: 3,
            grooming: 5,
            health: 3
        }
    },
    {
        id: 6,
        name: "Beagle",
        breed: "Beagle",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Beagle", "Beagle beim Schnüffeln", "Beagle Porträt", "Beagle Welpe", "Beagle beim Spielen", "Beagle Senior"],
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
        idealFor: "Aktive Familien, Menschen die gerne spazieren gehen",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 3,
            grooming: 5,
            health: 4
        }
    },
    {
        id: 7,
        name: "Malteser",
        breed: "Malteser",
        images: [
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Malteser", "Malteser auf Schoß", "Malteser Porträt", "Malteser Welpe", "Malteser beim Schlafen", "Malteser Senior"],
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
        idealFor: "Wohnungshaltung, Menschen die einen Schoßhund suchen, Senioren",
        ratings: {
            family: 3,
            energy: 3,
            trainability: 4,
            grooming: 2,
            health: 4
        }
    },
    {
        id: 8,
        name: "Deutscher Schäferhund",
        breed: "Deutscher Schäferhund",
        images: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Schäferhund", "Schäferhund beim Arbeiten", "Schäferhund Porträt", "Schäferhund Welpe", "Schäferhund beim Training", "Schäferhund Senior"],
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
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Schutz- und Diensthundearbeit",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 5,
            grooming: 3,
            health: 3
        }
    },
    {
        id: 9,
        name: "Pudel",
        breed: "Pudel (alle Größen)",
        images: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Pudel", "Pudel beim Tricktraining", "Pudel Porträt", "Pudel Welpe", "Pudel beim Laufen", "Pudel Senior"],
        description: "Der Pudel ist ein intelligenter, lernwilliger und hypoallergener Hund. Er gibt es in drei Größen (Toy, Zwerg, Standard). Pudel sind vielseitig, können Tricks lernen und sind gute Begleiter für verschiedene Lebensstile.",
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
        idealFor: "Allergiker, aktive Menschen, Hundesportler, Familien",
        ratings: {
            family: 5,
            energy: 4,
            trainability: 5,
            grooming: 2,
            health: 4
        }
    },
    {
        id: 10,
        name: "Chihuahua",
        breed: "Chihuahua",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Chihuahua", "Chihuahua auf Decke", "Chihuahua Porträt", "Chihuahua Welpe", "Chihuahua beim Schlafen", "Chihuahua Senior"],
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
        idealFor: "Wohnungshaltung, Einzelpersonen, Menschen die einen kleinen Begleiter suchen",
        ratings: {
            family: 2,
            energy: 3,
            trainability: 3,
            grooming: 4,
            health: 3
        }
    },
    {
        id: 11,
        name: "Australian Shepherd",
        breed: "Australian Shepherd",
        images: [
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Australian Shepherd", "Aussie beim Hüten", "Aussie Porträt", "Aussie Welpe", "Aussie beim Agility", "Aussie Senior"],
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
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, Hundesportler, Bauernhöfe",
        ratings: {
            family: 4,
            energy: 5,
            trainability: 5,
            grooming: 3,
            health: 4
        }
    },
    {
        id: 12,
        name: "Cavalier King Charles Spaniel",
        breed: "Cavalier King Charles Spaniel",
        images: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Cavalier", "Cavalier auf Sofa", "Cavalier Porträt", "Cavalier Welpe", "Cavalier beim Kuscheln", "Cavalier Senior"],
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
        idealFor: "Wohnungshaltung, Familien, Senioren, Menschen die einen sanften Begleiter suchen",
        ratings: {
            family: 5,
            energy: 3,
            trainability: 4,
            grooming: 2,
            health: 3
        }
    },
    {
        id: 13,
        name: "Berger Picard",
        breed: "Berger Picard (Picardischer Schäferhund)",
        images: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Berger Picard", "Berger Picard stehend", "Berger Picard Porträt", "Berger Picard Welpe", "Berger Picard bei der Arbeit", "Berger Picard Senior"],
        description: "Der Berger Picard ist ein französischer Hütehund mit drahtigem, wetterfestem Fell und aufmerksamen, ausdrucksstarken Augen. Er ist intelligent, energiegeladen und sehr an seine Familie gebunden. Berger Picards sind vielseitige Arbeitshunde, die auch als Familienhunde glänzen.",
        size: "Mittel bis Groß (55-65 cm, 20-30 kg)",
        energy: "Sehr hoch - Braucht intensive Bewegung und geistige Auslastung",
        grooming: "Mittel - Regelmäßiges Bürsten und gelegentliches Trimmen",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Ausgezeichnet trainierbar",
        personality: {
            O: 80,
            C: 85,
            E: 75,
            A: 70,
            N: 35
        },
        idealFor: "Aktive Familien, Hundesportler, Menschen die einen treuen und intelligenten Begleiter suchen",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 5,
            grooming: 3,
            health: 4
        }
    },
    {
        id: 14,
        name: "Berner Sennenhund",
        breed: "Berner Sennenhund",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Berner Sennenhund", "Berner im Schnee", "Berner Porträt", "Berner Welpe", "Berner mit Familie", "Berner Senior"],
        description: "Der Berner Sennenhund ist ein sanfter Riese mit dreifarbigem Fell. Er ist bekannt für sein freundliches, ruhiges Wesen und seine Treue. Berner sind hervorragende Familienhunde, die gut mit Kindern umgehen können. Sie brauchen viel Platz und sind nicht für heiße Klimazonen geeignet.",
        size: "Groß (58-70 cm, 36-54 kg)",
        energy: "Mittel - Braucht moderate Bewegung",
        grooming: "Hoch - Tägliches Bürsten empfohlen",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Gut trainierbar",
        personality: {
            O: 60,
            C: 70,
            E: 70,
            A: 95,
            N: 30
        },
        idealFor: "Familien mit Kindern, Menschen mit viel Platz, kühles Klima",
        ratings: {
            family: 5,
            energy: 3,
            trainability: 4,
            grooming: 2,
            health: 3
        }
    },
    {
        id: 15,
        name: "Shiba Inu",
        breed: "Shiba Inu",
        images: [
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Shiba Inu", "Shiba Inu im Herbst", "Shiba Inu Porträt", "Shiba Inu Welpe", "Shiba Inu beim Spielen", "Shiba Inu Senior"],
        description: "Der Shiba Inu ist eine japanische Hunderasse mit fuchsähnlichem Aussehen und einem starken, unabhängigen Charakter. Er ist intelligent, sauber und hat eine katzenartige Persönlichkeit. Shibas sind loyal, können aber auch eigenwillig sein.",
        size: "Mittel (35-43 cm, 8-10 kg)",
        energy: "Mittel bis Hoch - Braucht tägliche Bewegung und geistige Auslastung",
        grooming: "Hoch - Tägliches Bürsten, besonders während des Haarwechsels",
        familyFriendly: "Mit älteren Kindern geeignet",
        trainability: "Mittel - Kann stur sein, braucht konsequente Erziehung",
        personality: {
            O: 70,
            C: 60,
            E: 50,
            A: 40,
            N: 50
        },
        idealFor: "Erfahrene Hundebesitzer, Menschen die einen Hund mit Charakter suchen",
        ratings: {
            family: 3,
            energy: 4,
            trainability: 3,
            grooming: 2,
            health: 4
        }
    },
    {
        id: 16,
        name: "Sibirischer Husky",
        breed: "Sibirischer Husky",
        images: [
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Husky", "Husky im Schnee", "Husky Porträt", "Husky Welpe", "Husky beim Laufen", "Husky Senior"],
        description: "Der Sibirische Husky ist bekannt für seine atemberaubenden blauen oder mehrfarbigen Augen und sein wolfsähnliches Aussehen. Er ist ein energiegeladener, freundlicher und geselliger Hund, der ursprünglich als Schlittenhund gezüchtet wurde.",
        size: "Groß (50-60 cm, 16-27 kg)",
        energy: "Sehr hoch - Braucht extrem viel Bewegung",
        grooming: "Hoch - Tägliches Bürsten, besonders während des Haarwechsels",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Mittel - Intelligent, aber eigenwillig",
        personality: {
            O: 85,
            C: 40,
            E: 90,
            A: 80,
            N: 40
        },
        idealFor: "Erfahrene Hundebesitzer, aktive Menschen, kühles Klima",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 3,
            grooming: 2,
            health: 4
        }
    },
    {
        id: 17,
        name: "Dalmatiner",
        breed: "Dalmatiner",
        images: [
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Dalmatiner", "Dalmatiner beim Laufen", "Dalmatiner Porträt", "Dalmatiner Welpe", "Dalmatiner mit Familie", "Dalmatiner Senior"],
        description: "Der Dalmatiner ist bekannt für sein einzigartiges geflecktes Fell und sein energiegeladenes Wesen. Er ist ein aktiver, intelligenter und geselliger Hund, der ursprünglich als Kutschenbegleithund gezüchtet wurde.",
        size: "Groß (56-61 cm, 23-32 kg)",
        energy: "Sehr hoch - Braucht viel Bewegung und Auslastung",
        grooming: "Niedrig - Wöchentliches Bürsten reicht",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Gut trainierbar",
        personality: {
            O: 80,
            C: 70,
            E: 90,
            A: 75,
            N: 40
        },
        idealFor: "Aktive Familien, Menschen mit viel Platz, erfahrene Hundebesitzer",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 4,
            grooming: 5,
            health: 4
        }
    },
    {
        id: 18,
        name: "Boxer",
        breed: "Boxer",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=82",
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=82"
        ],
        imagesLabels: ["Erwachsener Boxer", "Boxer beim Spielen", "Boxer Porträt", "Boxer Welpe", "Boxer beim Training", "Boxer Senior"],
        description: "Der Boxer ist ein muskulöser, energiegeladener Hund mit einem freundlichen, verspieltem Wesen. Er ist bekannt für seine Treue und seinen Schutzinstinkt. Boxer sind hervorragende Familienhunde, die gut mit Kindern umgehen.",
        size: "Groß (53-63 cm, 25-32 kg)",
        energy: "Hoch - Braucht viel Bewegung und Auslastung",
        grooming: "Niedrig - Wöchentliches Bürsten reicht",
        familyFriendly: "Sehr familienfreundlich",
        trainability: "Gut trainierbar",
        personality: {
            O: 70,
            C: 75,
            E: 85,
            A: 80,
            N: 40
        },
        idealFor: "Aktive Familien, Menschen die einen Beschützer und Spielkameraden suchen",
        ratings: {
            family: 5,
            energy: 5,
            trainability: 4,
            grooming: 5,
            health: 4
        }
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
    },
    "Berger Picard": {
        movement: "Ich brauche viel Bewegung - mindestens 1-2 Stunden täglich! Ich liebe lange Spaziergänge, Laufen, Apportierspiele und geistige Herausforderungen. Als Hütehund brauche ich viel Auslastung, sonst werde ich unglücklich.",
        food: "Ich esse etwa 300-400g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Bei viel Arbeit kann ich mehr brauchen. Achte auf eine ausgewogene Ernährung mit hochwertigen Proteinen.",
        children: "Ich bin ein hervorragender Familienhund! Ich bin geduldig mit Kindern und beschützend. Aber ich brauche eine konsequente Erziehung und viel Sozialisierung. Mein drahtiges Fell macht mich robust für Spiel mit Kindern.",
        grooming: "Mein drahtiges Fell braucht wöchentliches Bürsten, um Verfilzungen zu vermeiden. Alle 2-3 Monate sollte ich professionell getrimmt werden. Mein Fell ist wetterfest und schützt mich gut.",
        lifespan: "Ich lebe durchschnittlich 12-14 Jahre. Berger Picards sind im Allgemeinen gesunde Hunde, aber Hüftdysplasie kann vorkommen. Regelmäßige Bewegung hält mich fit!",
        training: "Ich bin extrem intelligent und lernwillig! Ich eigne mich hervorragend für Hundesport, Hütearbeit und Gehorsamstraining. Ich brauche eine konsequente, positive Erziehung und viel geistige Auslastung. Ich liebe es, neue Aufgaben zu lernen!"
    },
    "Berner Sennenhund": {
        movement: "Ich brauche moderate Bewegung - etwa 1 Stunde täglich reicht mir. Ich liebe Spaziergänge und Zeit mit meiner Familie. Ich bin kein Hochleistungssportler, aber ich bin gerne aktiv. Achte darauf, mich nicht bei großer Hitze zu überlasten!",
        food: "Ich esse etwa 400-600g hochwertiges Hundefutter täglich, aufgeteilt auf 2-3 Mahlzeiten. Berner sind große Hunde und brauchen viel hochwertiges Futter. Achte auf eine ausgewogene Ernährung.",
        children: "Ich bin ein perfekter Familienhund! Ich bin sanft, geduldig und liebe Kinder. Ich bin sehr beschützend und treu. Aber wegen meiner Größe sollten kleine Kinder nicht auf mir reiten oder mich überfordern.",
        grooming: "Mein langes, dreifarbiges Fell braucht tägliches Bürsten, besonders während des Haarwechsels (zweimal jährlich). Mein Fell ist wetterfest, aber ich haare viel! Ein guter Staubsauger ist empfehlenswert.",
        lifespan: "Ich lebe leider nur durchschnittlich 7-10 Jahre. Berner Sennenhunde haben eine kürzere Lebenserwartung als viele andere Rassen. Regelmäßige Tierarztbesuche sind wichtig, um meine Gesundheit zu überwachen.",
        training: "Ich bin intelligent und lernwillig. Ich reagiere gut auf positive Verstärkung mit Leckerlis und Lob. Ich bin ein sanfter Riese, aber ich brauche eine konsequente Erziehung. Sozialisierung ist wichtig, damit ich ein gut erzogener Familienhund werde."
    },
    "Shiba Inu": {
        movement: "Ich brauche täglich 45-60 Minuten Bewegung. Ich liebe Spaziergänge und das Erkunden neuer Gerüche. Ich bin aktiv, aber kein Hochleistungssportler. Ich genieße auch Zeit auf dem Sofa.",
        food: "Ich esse etwa 150-200g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Shibas können wählerisch sein, also finde ein Futter, das ich gerne esse. Achte auf hochwertige Proteine.",
        children: "Ich kann mit älteren Kindern umgehen, die respektvoll und sanft mit mir sind. Kleine Kinder können mich überfordern, da ich eigenwillig bin. Ich bin ein sauberer Hund und mag es nicht, schmutzig zu werden. Ich bin sehr an meine Bezugsperson gebunden.",
        grooming: "Mein dickes Fell braucht tägliches Bürsten, besonders während des Haarwechsels (zweimal jährlich). Ich haare sehr stark! Mein Fell ist wasserabweisend, aber ich mag es nicht, nass zu werden. Professionelles Trimmen ist normalerweise nicht nötig.",
        lifespan: "Ich lebe durchschnittlich 12-15 Jahre. Shibas sind im Allgemeinen gesunde Hunde, aber Allergien, Patellaluxation und Hüftdysplasie können vorkommen.",
        training: "Ich bin intelligent, aber sehr eigenwillig! Ich brauche eine konsequente, positive Erziehung mit viel Geduld. Ich reagiere gut auf Leckerlis, aber ich bin kein Hund für harte Methoden. Sozialisierung ist extrem wichtig, damit ich nicht aggressiv werde. Ich bin ein Hund mit starkem Charakter!"
    },
    "Sibirischer Husky": {
        movement: "Ich brauche EXTREM viel Bewegung - mindestens 2 Stunden täglich, besser mehr! Ich bin ein Hochleistungssportler und brauche intensive Auslastung. Ohne genug Bewegung werde ich unglücklich und kann Verhaltensprobleme entwickeln. Ich liebe Laufen, Ziehen und Hundesport.",
        food: "Ich esse etwa 400-600g hochwertiges Hundefutter täglich, je nach Aktivitätslevel. Bei viel Bewegung kann ich auch mehr brauchen. Achte auf eine proteinreiche Ernährung. Ich bin ein effizienter Futterverwerter!",
        children: "Ich bin ein hervorragender Familienhund! Ich bin freundlich, gesellig und liebe Kinder. Aber ich bin sehr energiegeladen und kann kleine Kinder versehentlich umrennen. Ich brauche eine sichere Umzäunung, da ich ein Escape-Künstler bin!",
        grooming: "Mein dickes Doppelfell braucht tägliches Bürsten, besonders während des Haarwechsels (zweimal jährlich, dann verlier ich extrem viel Fell!). Ich haare viel, besonders im Frühling und Herbst. Ein guter Staubsauger ist ein Muss!",
        lifespan: "Ich lebe durchschnittlich 12-14 Jahre. Huskys sind im Allgemeinen gesunde Hunde, aber Augenprobleme (Katarakt, progressive Retinaatrophie) und Hüftdysplasie können vorkommen. Regelmäßige Bewegung hält mich gesund!",
        training: "Ich bin intelligent, aber sehr eigenwillig! Ich lerne schnell, aber ich entscheide selbst, ob ich gehorchen will. Ich brauche eine konsequente, positive Erziehung mit viel Geduld. Ich eigne mich gut für Hundesport. Aber ich bin kein Hund für Anfänger!"
    },
    "Dalmatiner": {
        movement: "Ich brauche viel Bewegung - mindestens 1-2 Stunden täglich! Ich bin ein energiegeladener Hund, der viel Auslastung braucht. Ich liebe Laufen, Apportierspiele und lange Spaziergänge. Ohne genug Bewegung werde ich unglücklich.",
        food: "Ich esse etwa 300-450g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Dalmatiner können zu Harnsteinen neigen, also achte auf eine spezielle Ernährung mit wenig Purin. Viel Wasser ist wichtig!",
        children: "Ich bin ein hervorragender Familienhund! Ich bin verspielt, freundlich und liebe Kinder. Ich bin sehr geduldig und kann ein guter Spielkamerad sein. Aber ich bin groß und stark, also sollten kleine Kinder nicht zu wild mit mir spielen.",
        grooming: "Mein kurzes Fell braucht nur wöchentliches Bürsten. Aber ich haare ganz schön! Mein Fell ist pflegeleicht, aber ich verlier viele Haare. Ein guter Staubsauger ist empfehlenswert. Meine Ohren sollten regelmäßig kontrolliert werden.",
        lifespan: "Ich lebe durchschnittlich 11-13 Jahre. Dalmatiner sind im Allgemeinen gesunde Hunde, aber Taubheit (angeboren oder erworben) und Harnsteine können Probleme sein. Regelmäßige Tierarztbesuche sind wichtig.",
        training: "Ich bin intelligent und lernwillig! Ich reagiere gut auf positive Verstärkung mit Leckerlis und Lob. Ich bin ein aktiver Hund, der viel geistige und körperliche Auslastung braucht. Ich eigne mich gut für Hundesport und Gehorsamstraining."
    },
    "Boxer": {
        movement: "Ich brauche viel Bewegung - mindestens 1-2 Stunden täglich! Ich bin ein energiegeladener Hund, der viel Auslastung braucht. Ich liebe Laufen, Spielen, Apportieren und lange Spaziergänge. Ich bin ein Sportler!",
        food: "Ich esse etwa 350-500g hochwertiges Hundefutter täglich, aufgeteilt auf 2 Mahlzeiten. Boxer sind muskulöse Hunde und brauchen eine proteinreiche Ernährung. Achte auf eine ausgewogene Ernährung.",
        children: "Ich bin ein hervorragender Familienhund! Ich bin verspielt, freundlich und liebe Kinder. Ich bin sehr geduldig und beschützend. Ich bin bekannt als 'Kinderliebhaber' und kann ein toller Spielkamerad sein. Aber ich bin groß und stark, also sollten kleine Kinder nicht zu wild mit mir spielen.",
        grooming: "Mein kurzes Fell braucht nur wöchentliches Bürsten. Ich bin pflegeleicht! Aber ich haare und sabbere etwas. Ein guter Staubsauger ist empfehlenswert. Meine Hautfalten sollten regelmäßig kontrolliert und gereinigt werden.",
        lifespan: "Ich lebe durchschnittlich 10-12 Jahre. Boxer sind im Allgemeinen gesunde Hunde, aber Herzprobleme, Hüftdysplasie und bestimmte Krebsarten können vorkommen. Regelmäßige Tierarztbesuche sind wichtig.",
        training: "Ich bin intelligent und lernwillig! Ich reagiere sehr gut auf positive Verstärkung mit Leckerlis und Lob. Ich bin ein arbeitswilliger Hund, der gerne gefordert wird. Ich eigne mich gut für Gehorsamstraining und Hundesport. Konsequenz ist wichtig, da ich manchmal etwas stur sein kann."
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
function getMatchingDogs(userPersonality, limit = 10) {
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
