// Main Application State
let appState = {
    currentScreen: 'start',
    currentQuestion: 0,
    userAnswers: [],
    userPersonality: {
        O: 50,
        C: 50,
        E: 50,
        A: 50,
        N: 50
    },
    matchingDogs: [],
    currentDogIndex: 0,
    chatHistory: [],
    currentDog: null,
    favorites: [],
    filters: {
        size: [],
        energy: [],
        family: [],
        trainability: [],
        grooming: []
    },
    darkMode: false
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    test: document.getElementById('test-screen'),
    loading: document.getElementById('loading-screen'),
    results: document.getElementById('results-screen'),
    chat: document.getElementById('chat-screen'),
    favorites: document.getElementById('favorites-screen'),
    noMore: document.getElementById('no-more-screen')
};

const elements = {
    startTestBtn: document.getElementById('start-test-btn'),
    viewFavoritesBtn: document.getElementById('view-favorites-btn'),
    backFromFavoritesBtn: document.getElementById('back-from-favorites-btn'),
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
    favoriteBtn: document.getElementById('favorite-btn'),
    shareBtn: document.getElementById('share-btn'),
    backToResultsBtn: document.getElementById('back-to-results-btn'),
    chatDogName: document.getElementById('chat-dog-name'),
    chatDogNameMsg: document.getElementById('chat-dog-name-msg'),
    chatMessages: document.getElementById('chat-messages'),
    userMessageInput: document.getElementById('user-message-input'),
    sendMessageBtn: document.getElementById('send-message-btn'),
    restartTestBtn: document.getElementById('restart-test-btn'),
    quickReplyBtns: document.querySelectorAll('.quick-reply-btn'),
    favoritesList: document.getElementById('favorites-list'),
    energyRating: document.getElementById('energy-rating'),
    groomingRating: document.getElementById('grooming-rating'),
    familyRating: document.getElementById('family-rating'),
    trainabilityRating: document.getElementById('trainability-rating'),
    overallRating: document.getElementById('overall-rating'),
    overallRatingText: document.getElementById('overall-rating-text'),
    shareModal: document.getElementById('share-modal'),
    shareLinkInput: document.getElementById('share-link-input'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    closeModalBtn: document.querySelector('.close-btn'),
    darkModeToggle: document.getElementById('dark-mode-toggle')
};

// Initialize the application
function init() {
    loadState();
    setupEventListeners();
    updateDarkMode();
    showScreen('start');
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('mydog_appState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            appState.favorites = state.favorites || [];
            appState.darkMode = state.darkMode || false;
            appState.userAnswers = state.userAnswers || [];
            appState.currentQuestion = state.currentQuestion || 0;
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }
}

// Save state to localStorage
function saveState() {
    const state = {
        favorites: appState.favorites,
        darkMode: appState.darkMode,
        userAnswers: appState.userAnswers,
        currentQuestion: appState.currentQuestion
    };
    localStorage.setItem('mydog_appState', JSON.stringify(state));
}

// Setup all event listeners
function setupEventListeners() {
    // Start test button
    elements.startTestBtn.addEventListener('click', startTest);
    elements.viewFavoritesBtn.addEventListener('click', showFavorites);
    
    // Navigation buttons
    elements.prevQuestionBtn.addEventListener('click', prevQuestion);
    elements.nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // Action buttons
    elements.interestBtn.addEventListener('click', showChat);
    elements.noInterestBtn.addEventListener('click', showNextDog);
    elements.backToResultsBtn.addEventListener('click', backToResults);
    elements.restartTestBtn.addEventListener('click', restartTest);
    elements.backFromFavoritesBtn.addEventListener('click', () => showScreen('start'));
    
    // Favorite button
    elements.favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Share button
    elements.shareBtn.addEventListener('click', openShareModal);
    elements.copyLinkBtn.addEventListener('click', copyLink);
    elements.closeModalBtn.addEventListener('click', closeShareModal);
    
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
    
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Close modal on outside click
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) {
            closeShareModal();
        }
    });
    
    // Window beforeunload - save test progress
    window.addEventListener('beforeunload', saveState);
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
    
    // Save progress
    saveState();
    
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
    appState.userPersonality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    
    const dimensionCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const dimensionScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    
    appState.userAnswers.forEach(answer => {
        if (answer) {
            const dimension = answer.dimension;
            const isReverse = answer.reverse;
            const optionIndex = answer.optionIndex;
            
            const score = isReverse ? (optionIndex === 0 ? 100 : 0) : (optionIndex === 1 ? 100 : 0);
            
            dimensionScores[dimension] += score;
            dimensionCounts[dimension]++;
        }
    });
    
    for (const dim in dimensionCounts) {
        if (dimensionCounts[dim] > 0) {
            appState.userPersonality[dim] = Math.round(dimensionScores[dim] / dimensionCounts[dim]);
        }
    }
}

// Find matching dogs based on user personality
function findMatchingDogs() {
    showScreen('loading');
    
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
    
    // Update ratings
    updateRatings(dog.ratings);
    
    // Generate match explanation
    const explanation = generateMatchExplanation(appState.userPersonality, dog);
    elements.matchReason.textContent = explanation + ` (Übereinstimmung: ${dog.matchScore.toFixed(1)}%)`;
    
    // Update favorite button state
    updateFavoriteButton();
    
    // Show results screen
    showScreen('results');
}

// Load dog images with fallback
function loadDogImages(imageUrls) {
    const fallbackImage = "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop";
    
    elements.dogImage1.onerror = function() { this.src = fallbackImage; };
    elements.dogImage1.src = imageUrls[0] || fallbackImage;
    elements.dogImage1.alt = appState.currentDog.name;
    
    elements.dogImage2.onerror = function() { this.src = fallbackImage; };
    elements.dogImage2.src = imageUrls[1] || imageUrls[0] || fallbackImage;
    elements.dogImage2.alt = appState.currentDog.name;
    
    elements.dogImage3.onerror = function() { this.src = fallbackImage; };
    elements.dogImage3.src = imageUrls[2] || imageUrls[0] || fallbackImage;
    elements.dogImage3.alt = appState.currentDog.name;
}

// Update star ratings
function updateRatings(ratings) {
    if (!ratings) {
        // Default ratings if not provided
        ratings = { family: 3, energy: 3, trainability: 3, grooming: 3, health: 3 };
    }
    
    // Update individual ratings
    elements.energyRating.innerHTML = generateStarRating(ratings.energy || 3);
    elements.groomingRating.innerHTML = generateStarRating(ratings.grooming || 3);
    elements.familyRating.innerHTML = generateStarRating(ratings.family || 3);
    elements.trainabilityRating.innerHTML = generateStarRating(ratings.trainability || 3);
    
    // Calculate overall rating
    const overall = calculateOverallRating(ratings);
    elements.overallRating.innerHTML = generateStarRating(overall);
    elements.overallRatingText.textContent = `${overall.toFixed(1)}/5`;
}

// Generate HTML for star rating
function generateStarRating(score) {
    let html = '';
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    for (let i = 0; i < fullStars; i++) {
        html += '<span class="star">★</span>';
    }
    if (hasHalfStar) {
        html += '<span class="star">½</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<span class="star empty">★</span>';
    }
    
    return html;
}

// Calculate overall rating from individual ratings
function calculateOverallRating(ratings) {
    const values = Object.values(ratings);
    if (values.length === 0) return 3;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
}

// Show chat screen
function showChat() {
    const dog = appState.matchingDogs[appState.currentDogIndex];
    appState.currentDog = dog;
    
    elements.chatDogName.textContent = dog.name;
    elements.chatDogNameMsg.textContent = dog.name;
    
    appState.chatHistory = [];
    elements.chatMessages.innerHTML = '';
    
    addChatMessage('assistant', `Hallo! Ich bin ${dog.name}. 🐶 Wie kann ich dir helfen?`);
    
    elements.userMessageInput.value = '';
    
    showScreen('chat');
    
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
    appState.userAnswers = [];
    appState.currentQuestion = 0;
    saveState();
    startTest();
}

// Show favorites screen
function showFavorites() {
    renderFavorites();
    showScreen('favorites');
}

// Render favorites list
function renderFavorites() {
    if (appState.favorites.length === 0) {
        elements.favoritesList.innerHTML = '<div class="empty-favorites">Du hast noch keine Favoriten. Füge Hunde zu deinen Favoriten hinzu, indem du auf den ❤️-Button klickst!</div>';
        return;
    }
    
    elements.favoritesList.innerHTML = '';
    
    appState.favorites.forEach((dog, index) => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <img src="${dog.images[0] || 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop'}" alt="${dog.name}">
            <h3>${dog.name}</h3>
            <p class="breed">${dog.breed}</p>
            <p>${dog.description.substring(0, 100)}...</p>
            <div class="rating">
                <span>⭐ ${calculateOverallRating(dog.ratings).toFixed(1)}/5</span>
            </div>
            <button class="remove-btn" data-index="${index}">Entfernen</button>
        `;
        
        card.addEventListener('click', () => {
            // Find the dog in the full database
            const fullDog = dogDatabase.find(d => d.id === dog.id);
            if (fullDog) {
                appState.matchingDogs = [fullDog];
                appState.currentDogIndex = 0;
                showDogResult();
                showScreen('results');
            }
        });
        
        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(index);
        });
        
        elements.favoritesList.appendChild(card);
    });
}

// Toggle favorite
function toggleFavorite() {
    const dog = appState.matchingDogs[appState.currentDogIndex];
    if (!dog) return;
    
    const isFavorite = appState.favorites.some(f => f.id === dog.id);
    
    if (isFavorite) {
        removeFavorite(appState.favorites.findIndex(f => f.id === dog.id));
        showToast('❤️ aus Favoriten entfernt', 'error');
    } else {
        addFavorite(dog);
        showToast('❤️ zu Favoriten hinzugefügt', 'success');
    }
    
    updateFavoriteButton();
    saveState();
}

// Add to favorites
function addFavorite(dog) {
    if (!appState.favorites.some(f => f.id === dog.id)) {
        appState.favorites.push({
            id: dog.id,
            name: dog.name,
            breed: dog.breed,
            images: dog.images,
            description: dog.description,
            ratings: dog.ratings
        });
    }
}

// Remove from favorites
function removeFavorite(index) {
    appState.favorites.splice(index, 1);
    renderFavorites();
    updateFavoriteButton();
    saveState();
}

// Update favorite button state
function updateFavoriteButton() {
    if (!appState.currentDog) return;
    
    const isFavorite = appState.favorites.some(f => f.id === appState.currentDog.id);
    elements.favoriteBtn.classList.toggle('favorited', isFavorite);
    elements.favoriteBtn.textContent = isFavorite ? '❤️ Aus Favoriten entfernen' : '❤️ Zu Favoriten hinzufügen';
}

// Open share modal
function openShareModal() {
    const dog = appState.currentDog;
    if (!dog) return;
    
    const shareText = `Schau mal, ich habe meinen perfekten Hund gefunden: ${dog.name}! Teste auch du auf `;
    const shareUrl = `${window.location.origin}${window.location.pathname}?dog=${dog.id}`;
    
    elements.shareLinkInput.value = shareUrl;
    elements.shareModal.classList.add('active');
}

// Close share modal
function closeShareModal() {
    elements.shareModal.classList.remove('active');
}

// Copy link to clipboard
function copyLink() {
    elements.shareLinkInput.select();
    document.execCommand('copy');
    showToast('Link kopiert!', 'success');
}

// Share on social media functions
function shareOnTwitter() {
    const dog = appState.currentDog;
    if (!dog) return;
    
    const text = `Ich habe meinen perfekten Hund gefunden: ${dog.name}! Teste auch du auf ${window.location.origin}${window.location.pathname}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareOnFacebook() {
    const dog = appState.currentDog;
    if (!dog) return;
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function shareOnWhatsApp() {
    const dog = appState.currentDog;
    if (!dog) return;
    
    const text = `Ich habe meinen perfekten Hund gefunden: ${dog.name}! Teste auch du hier: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Add a message to the chat
function addChatMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    elements.chatMessages.appendChild(messageDiv);
    
    appState.chatHistory.push({ sender, text });
    
    scrollChatToBottom();
}

// Scroll chat to bottom
function scrollChatToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Send a message in chat
function sendMessage() {
    const message = elements.userMessageInput.value.trim();
    
    if (message === '') return;
    
    addChatMessage('user', message);
    elements.userMessageInput.value = '';
    
    setTimeout(() => {
        const response = generateChatResponse(message);
        addChatMessage('assistant', response);
        scrollChatToBottom();
    }, 500);
}

// Generate chat response based on user message
function generateChatResponse(message) {
    const dogName = appState.currentDog.name;
    const dogResponses = dogChatResponses[dogName];
    
    if (dogResponses) {
        const lowerMessage = message.toLowerCase();
        
        if (quickReplyMessages[message]) {
            const responseKey = quickReplyMessages[message];
            if (dogResponses[responseKey]) {
                return dogResponses[responseKey];
            }
        }
        
        if (lowerMessage.includes('bewegung') || lowerMessage.includes('spazieren') || 
            lowerMessage.includes('laufen') || lowerMessage.includes('sport')) {
            return dogResponses.movement || "Ich liebe Bewegung! Tägliche Spaziergänge und Spiel sind wichtig für mich.";
        }
        
        if (lowerMessage.includes('futter') || lowerMessage.includes('essen') || 
            lowerMessage.includes('fressen') || lowerMessage.includes('leckerli')) {
            return dogResponses.food || "Ich esse am liebsten hochwertiges Hundefutter. Leckerlis sind auch immer willkommen!";
        }
        
        if (lowerMessage.includes('kinder') || lowerMessage.includes('kind') || 
            lowerMessage.includes('familie')) {
            return dogResponses.children || "Ich liebe Kinder! Aber wie bei allen Hunden: Kleine Kinder sollten nie unbeaufsichtigt mit mir spielen.";
        }
        
        if (lowerMessage.includes('pflege') || lowerMessage.includes('bürsten') || 
            lowerMessage.includes('fell') || lowerMessage.includes('haare')) {
            return dogResponses.grooming || "Mein Fell braucht regelmäßige Pflege. Bürsten hält es gesund und glänzend!";
        }
        
        if (lowerMessage.includes('leben') || lowerMessage.includes('alter') || 
            lowerMessage.includes('jahre') || lowerMessage.includes('wie alt')) {
            return dogResponses.lifespan || "Mit guter Pflege lebe ich durchschnittlich 10-15 Jahre.";
        }
        
        if (lowerMessage.includes('erziehung') || lowerMessage.includes('trainieren') || 
            lowerMessage.includes('lernen') || lowerMessage.includes('tricks')) {
            return dogResponses.training || "Ich bin intelligent und lernwillig! Positive Verstärkung mit Leckerlis und Lob funktioniert am besten.";
        }
        
        if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || 
            lowerMessage.includes('hey')) {
            return `Hallo! Ich bin ${dogName}. 🐶 Wie kann ich dir helfen?`;
        }
        
        if (lowerMessage.includes('name') || lowerMessage.includes('heißt') || 
            lowerMessage.includes('bist du')) {
            return `Ich bin ${dogName}, ein ${appState.currentDog.breed}. Freut mich, dich kennenzulernen!`;
        }
        
        if (lowerMessage.includes('danke') || lowerMessage.includes('vielen dank')) {
            return "Gern geschehen! 😊 hast du noch andere Fragen?";
        }
        
        if (lowerMessage.includes('tschüss') || lowerMessage.includes('bye')) {
            return "Tschüss! Es war schön, mit dir zu plaudern. Komm bald wieder! 🐾";
        }
    }
    
    return `Das ist eine interessante Frage! Als ${dogName} kann ich dazu sagen: Ich bin ein toller Hund!`;
}

// Toggle dark mode
function toggleDarkMode() {
    appState.darkMode = !appState.darkMode;
    updateDarkMode();
    saveState();
}

// Update dark mode
function updateDarkMode() {
    if (appState.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.darkModeToggle.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        elements.darkModeToggle.textContent = '🌓';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Check URL for dog parameter on load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dogId = urlParams.get('dog');
    if (dogId) {
        const dog = dogDatabase.find(d => d.id == dogId);
        if (dog) {
            appState.matchingDogs = [dog];
            appState.currentDogIndex = 0;
            // Wait for DOM to be fully ready
            setTimeout(() => {
                showDogResult();
                showScreen('results');
            }, 100);
        }
    }
});
