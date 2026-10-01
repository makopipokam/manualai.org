// Main Application State
let appState = {
    currentScreen: 'start',
    currentQuestion: 0,
    userAnswers: [],
    userPersonality: {
        O: 50, // Openness
        C: 50, // Conscientiousness
        E: 50, // Extraversion
        A: 50, // Agreeableness
        N: 50  // Neuroticism
    },
    matchingDogs: [],
    currentDogIndex: 0,
    chatHistory: [],
    currentDog: null
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    test: document.getElementById('test-screen'),
    loading: document.getElementById('loading-screen'),
    results: document.getElementById('results-screen'),
    chat: document.getElementById('chat-screen'),
    noMore: document.getElementById('no-more-screen')
};

const elements = {
    startTestBtn: document.getElementById('start-test-btn'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    prevQuestionBtn: document.getElementById('prev-question-btn'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    dogName: document.getElementById('dog-name'),
    dogBreed: document.getElementById('dog-breed'),
    dogSize: document.getElementById('dog-size'),
    dogEnergy: document.getElementById('dog-energy'),
    dogGrooming: document.getElementById('dog-grooming'),
    dogFamily: document.getElementById('dog-family'),
    dogTrainability: document.getElementById('dog-trainability'),
    dogDescription: document.getElementById('dog-description'),
    dogImage1: document.getElementById('dog-image-1'),
    dogImage2: document.getElementById('dog-image-2'),
    dogImage3: document.getElementById('dog-image-3'),
    matchReason: document.getElementById('match-reason'),
    interestBtn: document.getElementById('interest-btn'),
    noInterestBtn: document.getElementById('no-interest-btn'),
    backToResultsBtn: document.getElementById('back-to-results-btn'),
    chatDogName: document.getElementById('chat-dog-name'),
    chatDogNameMsg: document.getElementById('chat-dog-name-msg'),
    chatMessages: document.getElementById('chat-messages'),
    userMessageInput: document.getElementById('user-message-input'),
    sendMessageBtn: document.getElementById('send-message-btn'),
    restartTestBtn: document.getElementById('restart-test-btn'),
    quickReplyBtns: document.querySelectorAll('.quick-reply-btn')
};

// Initialize the application
function init() {
    setupEventListeners();
    showScreen('start');
}

// Setup all event listeners
function setupEventListeners() {
    // Start test button
    elements.startTestBtn.addEventListener('click', startTest);
    
    // Navigation buttons
    elements.prevQuestionBtn.addEventListener('click', prevQuestion);
    elements.nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // Action buttons
    elements.interestBtn.addEventListener('click', showChat);
    elements.noInterestBtn.addEventListener('click', showNextDog);
    elements.backToResultsBtn.addEventListener('click', backToResults);
    elements.restartTestBtn.addEventListener('click', restartTest);
    
    // Chat input
    elements.userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    
    // Quick reply buttons
    elements.quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.dataset.message;
            elements.userMessageInput.value = message;
            sendMessage();
        });
    });
}

// Show a specific screen
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    screens[screenName].classList.add('active');
    appState.currentScreen = screenName;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Start the personality test
function startTest() {
    appState.currentQuestion = 0;
    appState.userAnswers = [];
    appState.userPersonality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    appState.matchingDogs = [];
    appState.currentDogIndex = 0;
    appState.chatHistory = [];
    
    loadQuestion();
    showScreen('test');
}

// Load the current question
function loadQuestion() {
    const question = bigFiveQuestions[appState.currentQuestion];
    elements.questionText.textContent = question.text;
    
    // Clear previous options
    elements.optionsContainer.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.dataset.index = index;
        btn.addEventListener('click', () => selectOption(index));
        elements.optionsContainer.appendChild(btn);
    });
    
    // Update progress
    updateProgress();
    
    // Enable/disable navigation buttons
    elements.prevQuestionBtn.disabled = appState.currentQuestion === 0;
    elements.nextQuestionBtn.disabled = true;
}

// Select an option for the current question
function selectOption(optionIndex) {
    const question = bigFiveQuestions[appState.currentQuestion];
    
    // Remove selected class from all options
    const options = elements.optionsContainer.querySelectorAll('.option-btn');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    options[optionIndex].classList.add('selected');
    
    // Store the answer
    appState.userAnswers[appState.currentQuestion] = {
        question: question.text,
        option: question.options[optionIndex],
        dimension: question.dimension,
        reverse: question.reverse,
        optionIndex: optionIndex
    };
    
    // Enable next button
    elements.nextQuestionBtn.disabled = false;
}

// Go to previous question
function prevQuestion() {
    if (appState.currentQuestion > 0) {
        appState.currentQuestion--;
        loadQuestion();
    }
}

// Go to next question
function nextQuestion() {
    if (appState.currentQuestion < bigFiveQuestions.length - 1) {
        appState.currentQuestion++;
        loadQuestion();
    } else {
        // Test is complete, calculate personality and find matching dogs
        calculatePersonality();
        findMatchingDogs();
    }
}

// Update progress bar and text
function updateProgress() {
    const totalQuestions = bigFiveQuestions.length;
    const current = appState.currentQuestion + 1;
    
    const progressPercent = ((current - 1) / totalQuestions) * 100;
    elements.progressBar.style.width = `${progressPercent}%`;
    elements.progressText.textContent = `Frage ${current} von ${totalQuestions}`;
}

// Calculate user personality based on answers
function calculatePersonality() {
    // Reset personality scores
    appState.userPersonality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    
    // Count answers for each dimension
    const dimensionCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const dimensionScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    
    appState.userAnswers.forEach(answer => {
        if (answer) {
            const dimension = answer.dimension;
            const isReverse = answer.reverse;
            const optionIndex = answer.optionIndex;
            
            // For reverse questions, option 0 is the "positive" answer
            const score = isReverse ? (optionIndex === 0 ? 100 : 0) : (optionIndex === 1 ? 100 : 0);
            
            dimensionScores[dimension] += score;
            dimensionCounts[dimension]++;
        }
    });
    
    // Calculate average scores for each dimension
    for (const dim in dimensionCounts) {
        if (dimensionCounts[dim] > 0) {
            appState.userPersonality[dim] = Math.round(dimensionScores[dim] / dimensionCounts[dim]);
        }
    }
    
    console.log('User Personality:', appState.userPersonality);
}

// Find matching dogs based on user personality
function findMatchingDogs() {
    showScreen('loading');
    
    // Simulate loading delay
    setTimeout(() => {
        appState.matchingDogs = getMatchingDogs(appState.userPersonality, 10);
        appState.currentDogIndex = 0;
        
        if (appState.matchingDogs.length > 0) {
            showDogResult();
        } else {
            showScreen('no-more');
        }
    }, 1500);
}

// Show the dog result
function showDogResult() {
    const dog = appState.matchingDogs[appState.currentDogIndex];
    appState.currentDog = dog;
    
    // Update dog info
    elements.dogName.textContent = dog.name;
    elements.dogBreed.textContent = dog.breed;
    elements.dogSize.textContent = dog.size;
    elements.dogEnergy.textContent = dog.energy;
    elements.dogGrooming.textContent = dog.grooming;
    elements.dogFamily.textContent = dog.familyFriendly;
    elements.dogTrainability.textContent = dog.trainability;
    elements.dogDescription.textContent = dog.description;
    
    // Load images with fallback
    loadDogImages(dog.images);
    
    // Generate match explanation
    const explanation = generateMatchExplanation(appState.userPersonality, dog);
    elements.matchReason.textContent = explanation + ` (Übereinstimmung: ${dog.matchScore.toFixed(1)}%)`;
    
    // Show results screen
    showScreen('results');
}

// Load dog images with fallback
function loadDogImages(imageUrls) {
    const fallbackImage = "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop";
    
    // Main image
    elements.dogImage1.onerror = function() {
        this.src = fallbackImage;
    };
    elements.dogImage1.src = imageUrls[0] || fallbackImage;
    elements.dogImage1.alt = appState.currentDog.name;
    
    // Thumbnail images
    elements.dogImage2.onerror = function() {
        this.src = fallbackImage;
    };
    elements.dogImage2.src = imageUrls[1] || imageUrls[0] || fallbackImage;
    elements.dogImage2.alt = appState.currentDog.name;
    
    elements.dogImage3.onerror = function() {
        this.src = fallbackImage;
    };
    elements.dogImage3.src = imageUrls[2] || imageUrls[0] || fallbackImage;
    elements.dogImage3.alt = appState.currentDog.name;
}

// Show chat screen
function showChat() {
    const dog = appState.matchingDogs[appState.currentDogIndex];
    appState.currentDog = dog;
    
    // Update dog name in chat
    elements.chatDogName.textContent = dog.name;
    elements.chatDogNameMsg.textContent = dog.name;
    
    // Clear chat history
    appState.chatHistory = [];
    elements.chatMessages.innerHTML = '';
    
    // Add initial assistant message
    addChatMessage('assistant', `Hallo! Ich bin ${dog.name}. 🐶 Wie kann ich dir helfen?`);
    
    // Clear input
    elements.userMessageInput.value = '';
    
    // Show chat screen
    showScreen('chat');
    
    // Focus input
    setTimeout(() => {
        elements.userMessageInput.focus();
    }, 100);
}

// Show next dog
function showNextDog() {
    appState.currentDogIndex++;
    
    if (appState.currentDogIndex < appState.matchingDogs.length) {
        showDogResult();
    } else {
        showScreen('no-more');
    }
}

// Back to results from chat
function backToResults() {
    showScreen('results');
}

// Restart the test
function restartTest() {
    startTest();
}

// Send a message in chat
function sendMessage() {
    const message = elements.userMessageInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addChatMessage('user', message);
    
    // Clear input
    elements.userMessageInput.value = '';
    
    // Generate and add assistant response
    setTimeout(() => {
        const response = generateChatResponse(message);
        addChatMessage('assistant', response);
        
        // Scroll to bottom
        scrollChatToBottom();
    }, 500);
}

// Add a message to the chat
function addChatMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    elements.chatMessages.appendChild(messageDiv);
    
    // Store in history
    appState.chatHistory.push({ sender, text });
    
    // Scroll to bottom
    scrollChatToBottom();
}

// Scroll chat to bottom
function scrollChatToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Generate chat response based on user message
function generateChatResponse(message) {
    const dogName = appState.currentDog.name;
    const dogResponses = dogChatResponses[dogName];
    
    // Check for quick reply keywords
    if (quickReplyMessages[message]) {
        const responseKey = quickReplyMessages[message];
        if (dogResponses && dogResponses[responseKey]) {
            return dogResponses[responseKey];
        }
    }
    
    // Check for specific keywords in the message
    const lowerMessage = message.toLowerCase();
    
    if (dogResponses) {
        // Check for movement/activity keywords
        if (lowerMessage.includes('bewegung') || lowerMessage.includes('spazieren') || 
            lowerMessage.includes('laufen') || lowerMessage.includes('sport')) {
            return dogResponses.movement || "Ich liebe Bewegung! Tägliche Spaziergänge und Spiel sind wichtig für mich.";
        }
        
        // Check for food keywords
        if (lowerMessage.includes('futter') || lowerMessage.includes('essen') || 
            lowerMessage.includes('fressen') || lowerMessage.includes('leckerli')) {
            return dogResponses.food || "Ich esse am liebsten hochwertiges Hundefutter. Leckerlis sind auch immer willkommen!";
        }
        
        // Check for children keywords
        if (lowerMessage.includes('kinder') || lowerMessage.includes('kind') || 
            lowerMessage.includes('familie')) {
            return dogResponses.children || "Ich liebe Kinder! Aber wie bei allen Hunden: Kleine Kinder sollten nie unbeaufsichtigt mit mir spielen.";
        }
        
        // Check for grooming keywords
        if (lowerMessage.includes('pflege') || lowerMessage.includes('bürsten') || 
            lowerMessage.includes('fell') || lowerMessage.includes('haare')) {
            return dogResponses.grooming || "Mein Fell braucht regelmäßige Pflege. Bürsten hält es gesund und glänzend!";
        }
        
        // Check for lifespan keywords
        if (lowerMessage.includes('leben') || lowerMessage.includes('alter') || 
            lowerMessage.includes('jahre') || lowerMessage.includes('wie alt')) {
            return dogResponses.lifespan || "Mit guter Pflege lebe ich durchschnittlich 10-15 Jahre. Regelmäßige Tierarztbesuche sind wichtig!";
        }
        
        // Check for training keywords
        if (lowerMessage.includes('erziehung') || lowerMessage.includes('trainieren') || 
            lowerMessage.includes('lernen') || lowerMessage.includes('tricks')) {
            return dogResponses.training || "Ich bin intelligent und lernwillig! Positive Verstärkung mit Leckerlis und Lob funktioniert am besten.";
        }
    }
    
    // Check for greeting
    if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || 
        lowerMessage.includes('hey') || lowerMessage.includes('servus')) {
        return `Hallo! Ich bin ${dogName}. 🐶 Wie kann ich dir helfen?`;
    }
    
    // Check for name question
    if (lowerMessage.includes('name') || lowerMessage.includes('heißt') || 
        lowerMessage.includes('bist du')) {
        return `Ich bin ${dogName}, ein ${appState.currentDog.breed}. Freut mich, dich kennenzulernen!`;
    }
    
    // Check for thanks
    if (lowerMessage.includes('danke') || lowerMessage.includes('vielen dank')) {
        return "Gern geschehen! 😊 hast du noch andere Fragen?";
    }
    
    // Check for goodbye
    if (lowerMessage.includes('tschüss') || lowerMessage.includes('auf wiedersehen') || 
        lowerMessage.includes('bye')) {
        return "Tschüss! Es war schön, mit dir zu plaudern. Komm bald wieder! 🐾";
    }
    
    // Default responses
    const defaultResponses = [
        `Das ist eine interessante Frage! Als ${dogName} kann ich dazu sagen: Ich bin ein toller Hund!`,
        `Ich verstehe deine Frage, aber ich bin nur ein Hund. 🐶 Vielleicht kannst du mir eine Frage zu meiner Rasse, Pflege oder meinem Verhalten stellen?`,
        `Wuff! Ich bin nicht sicher, wie ich darauf antworten soll. Möchtest du etwas über meine Bedürfnisse, mein Verhalten oder meine Rasse wissen?`,
        `Das ist eine schlaue Frage! Als ${dogName} würde ich sagen: Frag mich etwas über Hundethematiken!`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
