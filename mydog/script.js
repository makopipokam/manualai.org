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
    darkMode: false,
    lastResult: null
};

let imageLoadToken = 0;

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
    savedResultPanel: document.getElementById('saved-result-panel'),
    savedResultText: document.getElementById('saved-result-text'),
    resumeResultBtn: document.getElementById('resume-result-btn'),
    retakeTestBtn: document.getElementById('retake-test-btn'),
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
    dogImageMain: document.getElementById('dog-image-main'),
    dogImage1: document.getElementById('dog-image-1'),
    dogImage2: document.getElementById('dog-image-2'),
    dogImage3: document.getElementById('dog-image-3'),
    dogImage4: document.getElementById('dog-image-4'),
    dogImage5: document.getElementById('dog-image-5'),
    dogImage6: document.getElementById('dog-image-6'),
    matchReason: document.getElementById('match-reason'),
    nextDogBtn: document.getElementById('next-dog-btn'),
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
    favoritesCount: document.getElementById('favorites-count'),
    favoritesSummary: document.getElementById('favorites-summary'),
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
    renderSavedResult();
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
            appState.lastResult = state.lastResult || null;
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
        currentQuestion: appState.currentQuestion,
        lastResult: appState.lastResult
    };
    localStorage.setItem('mydog_appState', JSON.stringify(state));
}

// Setup all event listeners
function setupEventListeners() {
    // Start test button
    elements.startTestBtn.addEventListener('click', startTest);
    elements.resumeResultBtn.addEventListener('click', restoreLastResult);
    elements.retakeTestBtn.addEventListener('click', startNewTest);
    elements.viewFavoritesBtn.addEventListener('click', showFavorites);
    
    // Navigation buttons
    elements.prevQuestionBtn.addEventListener('click', prevQuestion);
    elements.nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // Action buttons
    elements.nextDogBtn.addEventListener('click', showNextDog);
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

// Render the saved-result affordance on the start screen.
function renderSavedResult() {
    if (!elements.savedResultPanel) return;
    const result = appState.lastResult;
    const firstDog = result && result.dogIds ? dogDatabase.find(dog => dog.id === result.dogIds[0]) : null;
    const hasResult = Boolean(firstDog);
    elements.savedResultPanel.hidden = !hasResult;
    if (hasResult) {
        elements.savedResultText.textContent = `Zuletzt: ${firstDog.name}. Das Ergebnis bleibt auf diesem Gerät gespeichert.`;
    }
}

function persistCompletedResult() {
    appState.lastResult = {
        dogIds: appState.matchingDogs.map(dog => dog.id),
        matchScores: Object.fromEntries(appState.matchingDogs.map(dog => [dog.id, dog.matchScore || 0])),
        userPersonality: { ...appState.userPersonality },
        completedAt: new Date().toISOString(),
        currentDogIndex: 0
    };
    saveState();
    renderSavedResult();
}

function restoreLastResult() {
    const result = appState.lastResult;
    if (!result || !Array.isArray(result.dogIds)) {
        startNewTest();
        return;
    }
    const restoredScores = result.matchScores || Object.fromEntries(
        getMatchingDogs(result.userPersonality || {}, result.dogIds.length).map(dog => [dog.id, dog.matchScore || 0])
    );
    const restoredDogs = result.dogIds.map(id => {
        const dog = dogDatabase.find(candidate => candidate.id === id);
        return dog ? { ...dog, matchScore: restoredScores[id] ?? 0 } : null;
    }).filter(Boolean);
    if (!restoredDogs.length) {
        startNewTest();
        return;
    }
    appState.matchingDogs = restoredDogs;
    appState.userPersonality = result.userPersonality || appState.userPersonality;
    appState.currentDogIndex = Math.min(result.currentDogIndex || 0, restoredDogs.length - 1);
    showDogResult();
}

function startNewTest() {
    appState.lastResult = null;
    saveState();
    renderSavedResult();
    startTest();
}

// Start the personality test
function startTest() {
    appState.currentQuestion = 0;
    appState.userAnswers = [];
    appState.userPersonality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    appState.matchingDogs = [];
    appState.currentDogIndex = 0;
    appState.chatHistory = [];
    saveState();
    
    loadQuestion();
    showScreen('test');
}

// Load the current question
function loadQuestion() {
    const question = bigFiveQuestions[appState.currentQuestion];
    elements.questionText.textContent = question.text;
    
    // Render the two question anchors with a five-point Likert scale between them.
    elements.optionsContainer.innerHTML = '';
    const scale = document.createElement('div');
    scale.className = 'likert-scale';
    scale.setAttribute('role', 'radiogroup');
    scale.setAttribute('aria-label', 'Antwortskala');

    const anchors = document.createElement('div');
    anchors.className = 'likert-anchors';
    anchors.innerHTML = `<span>${question.options[0]}</span><span>${question.options[1]}</span>`;
    scale.appendChild(anchors);

    const buttons = document.createElement('div');
    buttons.className = 'likert-options';
    const savedAnswer = appState.userAnswers[appState.currentQuestion];
    likertScale.forEach((scalePoint, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn likert-option';
        btn.textContent = String(index + 1);
        btn.setAttribute('aria-label', `Antwort ${index + 1} von 5`);
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(savedAnswer?.optionIndex === index));
        btn.dataset.index = index;
        if (savedAnswer?.optionIndex === index) btn.classList.add('selected');
        btn.addEventListener('click', () => selectOption(index));
        buttons.appendChild(btn);
    });
    scale.appendChild(buttons);
    elements.optionsContainer.appendChild(scale);
    // Update progress
    updateProgress();
    
    // Enable/disable navigation buttons
    elements.prevQuestionBtn.disabled = appState.currentQuestion === 0;
    elements.nextQuestionBtn.disabled = true;
}

// Select an option for the current question
function selectOption(optionIndex) {
    const question = bigFiveQuestions[appState.currentQuestion];
    
    // Update the selected radio-style button.
    const options = elements.optionsContainer.querySelectorAll('.likert-option');
    options.forEach((opt, index) => {
        const selected = index === optionIndex;
        opt.classList.toggle('selected', selected);
        opt.setAttribute('aria-checked', String(selected));
    });
    const scalePoint = likertScale[optionIndex];
    // Store the normalized Likert value so scoring remains explicit and replayable.
    appState.userAnswers[appState.currentQuestion] = {
        question: question.text,
        option: String(optionIndex + 1),
        dimension: question.dimension,
        reverse: question.reverse,
        optionIndex: optionIndex,
        likertValue: scalePoint
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
            const score = Number.isFinite(answer.likertValue)
                ? answer.likertValue
                : (answer.optionIndex === 1 ? 100 : 0);
            const normalizedScore = isReverse ? 100 - score : score;
            dimensionScores[dimension] += normalizedScore;
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
        persistCompletedResult();
        
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
    
    // Load images with fallback and labels
    loadDogImages(dog.images, dog.imagesLabels);
    
    // Show breed attributes separately and use overall stars for personal suitability.
    updateRatings(dog.ratings, dog.matchScore);
    
    // Generate match explanation
    const explanation = generateMatchExplanation(appState.userPersonality, dog);
    elements.matchReason.textContent = explanation + ` (Übereinstimmung: ${dog.matchScore.toFixed(1)}%)`;
    
    // Update favorite button state
    updateFavoriteButton();
    
    // Show results screen
    showScreen('results');
}

// Load breed-specific images without showing stale images during transitions.
function loadDogImages(imageUrls, labels) {
    const dog = appState.currentDog;
    const loadToken = ++imageLoadToken;
    const thumbnailIds = ['dog-image-1', 'dog-image-2', 'dog-image-3', 'dog-image-4', 'dog-image-5', 'dog-image-6'];
    const thumbnails = thumbnailIds.map(id => document.getElementById(id));

    // Clear every previous image before the next dog is rendered.
    [elements.dogImageMain, ...thumbnails].forEach(img => {
        if (!img) return;
        img.removeAttribute('src');
        img.style.visibility = 'hidden';
        img.classList.remove('selected');
        img.onclick = null;
    });

    elements.dogImageMain.alt = dog.name;
    elements.dogImageMain.loading = 'eager';
    elements.dogImageMain.onerror = function() {
        if (loadToken === imageLoadToken) this.style.visibility = 'hidden';
    };

    thumbnails.forEach((imgElement, index) => {
        if (!imgElement) return;
        imgElement.alt = `${dog.name} — Bild ${index + 1}`;
        imgElement.loading = 'lazy';
        imgElement.onerror = function() {
            if (loadToken === imageLoadToken) this.style.visibility = 'hidden';
        };
        imgElement.onclick = () => {
            if (loadToken === imageLoadToken) selectThumbnail(index, imageUrls, labels);
        };
    });

    if (thumbnails[0]) thumbnails[0].classList.add('selected');

    imageUrls.forEach((url, index) => {
        if (!url) return;
        const preloader = new Image();
        preloader.onload = () => {
            if (loadToken !== imageLoadToken) return;
            const target = index === 0 ? elements.dogImageMain : thumbnails[index];
            if (!target) return;
            target.src = url;
            target.style.visibility = 'visible';
            if (index === 0) {
                elements.dogImageMain.classList.add('selected');
                if (thumbnails[0]) {
                    thumbnails[0].src = url;
                    thumbnails[0].style.visibility = 'visible';
                }
            }
        };
        preloader.onerror = () => {
            if (loadToken === imageLoadToken && index === 0) elements.dogImageMain.style.visibility = 'hidden';
        };
        preloader.src = url;
    });
}

// Select a thumbnail image
function selectThumbnail(index, imageUrls, labels) {
    const dog = appState.currentDog;
    
    // Update main image
    elements.dogImageMain.src = imageUrls[index] || imageUrls[0] || '';
    elements.dogImageMain.alt = `${dog.name} — Bild ${index + 1}`;
    elements.dogImageMain.style.visibility = 'visible';
    
    // Update thumbnail selection
    const thumbnailIds = ['dog-image-1', 'dog-image-2', 'dog-image-3', 'dog-image-4', 'dog-image-5', 'dog-image-6'];
    thumbnailIds.forEach((id, i) => {
        const imgElement = document.getElementById(id);
        if (imgElement) {
            if (i === index) {
                imgElement.classList.add('selected');
            } else {
                imgElement.classList.remove('selected');
            }
        }
    });
}

// Update breed attribute ratings and personal suitability rating
function updateRatings(ratings, matchScore) {
    if (!ratings) {
        ratings = { family: 3, energy: 3, trainability: 3, grooming: 3, health: 3 };
    }
    
    elements.energyRating.innerHTML = generateStarRating(ratings.energy || 3);
    elements.groomingRating.innerHTML = generateStarRating(ratings.grooming || 3);
    elements.familyRating.innerHTML = generateStarRating(ratings.family || 3);
    elements.trainabilityRating.innerHTML = generateStarRating(ratings.trainability || 3);
    
    const overall = calculateSuitabilityRating(matchScore) ?? calculateOverallRating(ratings);
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

function calculateSuitabilityRating(matchScore) {
    if (!Number.isFinite(matchScore)) return null;
    return Math.max(0, Math.min(5, matchScore / 20));
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
    if (appState.lastResult) {
        appState.lastResult.currentDogIndex = appState.currentDogIndex;
        saveState();
    }
    
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
    const favoriteCount = appState.favorites.length;
    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = favoriteCount;
    }
    if (elements.favoritesSummary) {
        elements.favoritesSummary.textContent = favoriteCount === 0
            ? 'Noch keine gespeicherten Hunde.'
            : `${favoriteCount} ${favoriteCount === 1 ? 'Hund' : 'Hunde'} gespeichert — wähle einen Hund aus, um sein Profil zu öffnen.`;
    }
    if (appState.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-favorites">
                <span class="empty-favorites-icon" aria-hidden="true">🐾</span>
                <h3>Noch keine Favoriten</h3>
                <p>Speichere Hunde aus deinen Testergebnissen, damit du sie hier jederzeit wiederfindest.</p>
                <button class="btn-primary empty-favorites-action" type="button">Test starten</button>
            </div>`;
        elements.favoritesList.querySelector('.empty-favorites-action').addEventListener('click', startTest);
        return;
    }
    
    elements.favoritesList.innerHTML = '';
    
    appState.favorites.forEach((dog, index) => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.setAttribute('role', 'group');
        card.dataset.dogId = dog.id;
        const suitability = calculateSuitabilityRating(dog.matchScore);
        card.innerHTML = `
            <img src="${dog.images[0] || ''}" alt="${dog.name}" onerror="this.style.visibility='hidden'">
            <h3>${dog.name}</h3>
            <p class="breed">${dog.breed}</p>
            <p>${dog.description.substring(0, 100)}...</p>
            <div class="rating">
                <span>⭐ ${suitability === null ? '—' : `${suitability.toFixed(1)}/5`} Eignung</span>
            </div>
            <div class="favorite-card-actions">
                <button class="view-btn" type="button">Profil ansehen</button>
                <button class="remove-btn" type="button" data-index="${index}">Entfernen</button>
            </div>
        `;

        const viewFavorite = () => {
            const fullDog = dogDatabase.find(d => d.id === dog.id);
            if (fullDog) {
                appState.matchingDogs = [{ ...fullDog, matchScore: dog.matchScore || 0 }];
                appState.currentDogIndex = 0;
                showDogResult();
                showScreen('results');
            }
        };
        card.querySelector('.view-btn').addEventListener('click', viewFavorite);
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) viewFavorite();
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
            ratings: dog.ratings,
            matchScore: dog.matchScore
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
    elements.favoriteBtn.textContent = isFavorite ? '❤️ Aus Favoriten entfernen' : '❤️ Zu Favoriten speichern';
}

// Open share modal
function openShareModal() {
    const dog = appState.currentDog;
    if (!dog) return;
    
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
            setTimeout(() => {
                showDogResult();
                showScreen('results');
            }, 100);
        }
    }
});

// Enable the PWA cache only when served from a secure origin (or localhost).
if ('serviceWorker' in navigator && (window.isSecureContext || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js', { scope: './' })
            .catch((error) => console.warn('MyDog offline mode unavailable:', error));
    });
}
