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
    sharedProfile: false,
    shareImageSource: null,
    shareImageCaption: 'Ein Hundevorschlag für dich',
    shareImageFile: null,
    shareImageKey: null,
    shareImagePreparing: null,
    shareImagePreparingKey: null,
    favorites: [],
    filters: {
        size: [],
        energy: [],
        family: [],
        trainability: [],
        grooming: []
    },
    lastResult: null
};

let imageLoadToken = 0;
let imageObserver = null;
let shareModalReturnFocus = null;
let shareImageDebounceTimer = null;
const SCORING_VERSION = 3;

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
    savedProgressPanel: document.getElementById('saved-progress-panel'),
    savedProgressText: document.getElementById('saved-progress-text'),
    resumeResultBtn: document.getElementById('resume-result-btn'),
    resumeTestBtn: document.getElementById('resume-test-btn'),
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
    dogImageStatus: document.getElementById('dog-image-status'),
    dogImage1: document.getElementById('dog-image-1'),
    dogImage2: document.getElementById('dog-image-2'),
    dogImage3: document.getElementById('dog-image-3'),
    dogImage4: document.getElementById('dog-image-4'),
    dogImage5: document.getElementById('dog-image-5'),
    dogImage6: document.getElementById('dog-image-6'),
    matchReason: document.getElementById('match-reason'),
    nextDogBtn: document.getElementById('next-dog-btn'),
    chatBtn: document.getElementById('chat-btn'),
    favoriteBtn: document.getElementById('favorite-btn'),
    shareBtn: document.getElementById('share-btn'),
    backToResultsBtn: document.getElementById('back-to-results-btn'),
    chatDogName: document.getElementById('chat-dog-name'),
    chatDogNameMsg: document.getElementById('chat-dog-name-msg'),
    chatMessages: document.getElementById('chat-messages'),
    userMessageInput: document.getElementById('user-message-input'),
    sendMessageBtn: document.getElementById('send-message-btn'),
    restartTestBtn: document.getElementById('restart-test-btn'),
    shownBreedCount: document.getElementById('shown-breed-count'),
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
    nativeShareBtn: document.getElementById('native-share-btn'),
    shareDogName: document.getElementById('share-dog-name'),
    shareDogBreed: document.getElementById('share-dog-breed'),
    shareStatus: document.getElementById('share-status'),
    shareImagePreview: document.getElementById('share-image-preview'),
    shareImageSource: document.getElementById('share-image-source'),
    shareImageCaption: document.getElementById('share-image-caption'),
    shareCardName: document.getElementById('share-card-name'),
    shareCardBreed: document.getElementById('share-card-breed'),
    shareCardRating: document.getElementById('share-card-rating'),
    shareCardCaption: document.getElementById('share-card-caption'),
    downloadShareImageBtn: document.getElementById('download-share-image-btn'),
    shareTwitterBtn: document.getElementById('share-twitter-btn'),
    shareFacebookBtn: document.getElementById('share-facebook-btn'),
    shareWhatsAppBtn: document.getElementById('share-whatsapp-btn'),
    closeModalBtn: document.querySelector('.close-btn')
};

// Initialize the application
function init() {
    loadState();
    setupEventListeners();
    renderSavedResult();
    showScreen('start');
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('mydog_appState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            appState.favorites = Array.isArray(state.favorites) ? state.favorites.map(saved => {
                const current = dogDatabase.find(dog => dog.id === saved?.id);
                return current ? {
                    ...saved,
                    name: current.name,
                    breed: current.breed,
                    images: current.images,
                    description: current.description,
                    ratings: current.ratings
                } : saved;
            }) : [];
            appState.userAnswers = Array.isArray(state.userAnswers) ? state.userAnswers : [];
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
    elements.resumeTestBtn.addEventListener('click', resumeTest);
    elements.retakeTestBtn.addEventListener('click', startNewTest);
    elements.viewFavoritesBtn.addEventListener('click', showFavorites);
    
    // Navigation buttons
    elements.prevQuestionBtn.addEventListener('click', prevQuestion);
    elements.nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // Action buttons
    elements.nextDogBtn.addEventListener('click', showNextDog);
    elements.chatBtn.addEventListener('click', showChat);
    elements.backToResultsBtn.addEventListener('click', backToResults);
    elements.restartTestBtn.addEventListener('click', restartTest);
    elements.backFromFavoritesBtn.addEventListener('click', () => showScreen('start'));
    
    // Favorite button
    elements.favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Share button: use the native mobile share sheet when available, otherwise open the fallback dialog.
    elements.shareBtn.addEventListener('click', shareCurrentDog);
    elements.copyLinkBtn.addEventListener('click', copyLink);
    elements.nativeShareBtn.addEventListener('click', shareCurrentDog);
    elements.shareImageSource.addEventListener('change', handleShareImageSourceChange);
    elements.shareImageCaption.addEventListener('input', handleShareImageCaptionChange);
    elements.downloadShareImageBtn.addEventListener('click', downloadShareImage);
    elements.shareTwitterBtn.addEventListener('click', shareOnTwitter);
    elements.shareFacebookBtn.addEventListener('click', shareOnFacebook);
    elements.shareWhatsAppBtn.addEventListener('click', shareOnWhatsApp);
    elements.closeModalBtn.addEventListener('click', closeShareModal);
    document.addEventListener('keydown', handleShareModalKeydown);
    
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

    const answeredCount = appState.userAnswers.filter(Boolean).length;
    const hasPartialTest = !hasResult && answeredCount > 0 && answeredCount < bigFiveQuestions.length;
    elements.savedProgressPanel.hidden = !hasPartialTest;
    if (hasPartialTest) {
        const questionNumber = Math.min(appState.currentQuestion + 1, bigFiveQuestions.length);
        elements.savedProgressText.textContent = ` ${answeredCount} von ${bigFiveQuestions.length} Fragen beantwortet. Du kannst bei Frage ${questionNumber} weitermachen.`;
    }
}

function persistCompletedResult() {
    appState.lastResult = {
        scoringVersion: SCORING_VERSION,
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
    const hasCompleteSavedAnswers = appState.userAnswers.filter(Boolean).length === bigFiveQuestions.length;
    const needsFullCatalogueRefresh = result.scoringVersion !== SCORING_VERSION
        || result.dogIds.length < dogDatabase.length;
    if (needsFullCatalogueRefresh && hasCompleteSavedAnswers) {
        calculatePersonality();
        appState.matchingDogs = getMatchingDogs(appState.userPersonality, dogDatabase.length);
        appState.currentDogIndex = 0;
        persistCompletedResult();
        showDogResult();
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
    appState.sharedProfile = false;
    appState.currentDogIndex = Math.min(result.currentDogIndex || 0, restoredDogs.length - 1);
    showDogResult();
}

function startNewTest() {
    appState.lastResult = null;
    saveState();
    renderSavedResult();
    startTest();
}

function resumeTest() {
    const answeredCount = appState.userAnswers.filter(Boolean).length;
    if (!answeredCount || appState.lastResult) {
        startTest();
        return;
    }
    appState.currentQuestion = Math.max(0, Math.min(appState.currentQuestion, bigFiveQuestions.length - 1));
    loadQuestion();
    showScreen('test');
}

// Start the personality test
function startTest() {
    appState.lastResult = null;
    appState.currentQuestion = 0;
    appState.userAnswers = [];
    appState.userPersonality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    appState.matchingDogs = [];
    appState.currentDogIndex = 0;
    appState.chatHistory = [];
    appState.sharedProfile = false;
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
    elements.nextQuestionBtn.disabled = !savedAnswer || !Number.isInteger(savedAnswer.optionIndex);
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
        questionIndex: appState.currentQuestion,
        option: String(optionIndex + 1),
        dimension: question.dimension,
        reverse: question.reverse,
        optionIndex: optionIndex,
        likertValue: scalePoint
    };
    // Save progress
    saveState();
    renderSavedResult();
    
    // Enable next button
    elements.nextQuestionBtn.disabled = false;
}

// Go to previous question
function prevQuestion() {
    if (appState.currentQuestion > 0) {
        appState.currentQuestion--;
        saveState();
        loadQuestion();
    }
}

// Go to next question
function nextQuestion() {
    if (appState.currentQuestion < bigFiveQuestions.length - 1) {
        appState.currentQuestion++;
        saveState();
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
            const currentQuestion = bigFiveQuestions.find(question =>
                question.dimension === answer.dimension && question.text === answer.question
            );
            const isReverse = currentQuestion ? currentQuestion.reverse : answer.reverse;
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
        appState.matchingDogs = getMatchingDogs(appState.userPersonality, dogDatabase.length);
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
    if (!dog) return;
    const hasPersonalMatch = Number.isFinite(dog.matchScore);
    appState.sharedProfile = !hasPersonalMatch;
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
    
    // Show breed attributes separately; personal suitability is only shown for test results.
    updateRatings(dog.ratings, dog.matchScore);
    
    // Generate match explanation
    if (hasPersonalMatch) {
        const explanation = generateMatchExplanation(appState.userPersonality, dog);
        elements.matchReason.textContent = explanation + ` (Übereinstimmung: ${dog.matchScore.toFixed(1)}%)`;
    } else {
        elements.matchReason.textContent = 'Allgemeines Rasseprofil. Mache den Persönlichkeitstest, um deine persönliche Eignung zu sehen.';
    }
    elements.nextDogBtn.hidden = !hasPersonalMatch;
    
    // Update favorite button state
    updateFavoriteButton();
    
    // Show results screen
    showScreen('results');
}

// Load breed-specific images without showing stale images during transitions.
function loadDogImages(imageUrls, labels) {
    const dog = appState.currentDog;
    const loadToken = ++imageLoadToken;
    if (imageObserver) imageObserver.disconnect();
    const thumbnailIds = ['dog-image-1', 'dog-image-2', 'dog-image-3', 'dog-image-4', 'dog-image-5', 'dog-image-6'];
    const thumbnails = thumbnailIds.map(id => document.getElementById(id));

    elements.dogImageStatus.textContent = `Foto von ${dog.name} wird geladen …`;
    elements.dogImageStatus.hidden = false;

    // Clear every previous image before the next dog is rendered.
    [elements.dogImageMain, ...thumbnails].forEach(img => {
        if (!img) return;
        img.removeAttribute('src');
        delete img.dataset.loaded;
        delete img.dataset.loading;
        img.style.display = 'none';
        img.style.visibility = 'hidden';
        img.classList.remove('selected');
        img.onclick = null;
    });

    elements.dogImageMain.alt = dog.name;
    elements.dogImageMain.loading = 'eager';
    elements.dogImageMain.onload = function() {
        if (loadToken !== imageLoadToken) return;
        if (this.naturalWidth > 0) {
            this.style.display = 'block';
            this.style.visibility = 'visible';
            elements.dogImageStatus.hidden = true;
        }
    };
    elements.dogImageMain.onerror = function() {
        if (loadToken !== imageLoadToken) return;
        delete this.dataset.loaded;
        this.style.display = 'none';
        this.style.visibility = 'hidden';
        tryMainImage(Number(this.dataset.activeIndex || 0) + 1);
    };

    const loadImage = (index, target, onReady, onError) => {
        if (loadToken !== imageLoadToken || !target || !imageUrls[index] || target.dataset.loading === 'true') return;
        if (target.dataset.loaded === imageUrls[index]) {
            if (onReady) onReady();
            return;
        }
        target.dataset.loading = 'true';
        const preloader = new Image();
        preloader.fetchPriority = index === 0 ? 'high' : 'low';
        preloader.onload = () => {
            if (loadToken !== imageLoadToken) return;
            target.dataset.loading = 'false';
            target.dataset.loaded = imageUrls[index];
            target.src = imageUrls[index];
            if (target !== elements.dogImageMain) {
                target.style.display = 'block';
                target.style.visibility = 'visible';
            }
            if (onReady) onReady();
        };
        preloader.onerror = () => {
            if (loadToken !== imageLoadToken) return;
            target.dataset.loading = 'false';
            target.style.display = 'none';
            target.style.visibility = 'hidden';
            if (onError) onError();
        };
        preloader.src = imageUrls[index];
    };

    const tryMainImage = (index) => {
        if (loadToken !== imageLoadToken) return;
        if (index >= imageUrls.length) {
            elements.dogImageStatus.textContent = `Für ${dog.name} ist gerade kein Foto verfügbar.`;
            return;
        }
        elements.dogImageMain.dataset.activeIndex = String(index);
        loadImage(index, elements.dogImageMain, () => {
            thumbnails.forEach((thumb, thumbIndex) => thumb?.classList.toggle('selected', thumbIndex === index));
            if (thumbnails[index]) {
                thumbnails[index].src = imageUrls[index];
                thumbnails[index].dataset.loaded = imageUrls[index];
                thumbnails[index].style.display = 'block';
                thumbnails[index].style.visibility = 'visible';
            }
        }, () => tryMainImage(index + 1));
    };

    thumbnails.forEach((imgElement, index) => {
        if (!imgElement) return;
        imgElement.alt = `${dog.name} — Bild ${index + 1}`;
        imgElement.loading = 'lazy';
        imgElement.onerror = function() {
            if (loadToken !== imageLoadToken) return;
            delete this.dataset.loaded;
            this.style.display = 'none';
            this.style.visibility = 'hidden';
        };
        imgElement.onclick = () => {
            if (loadToken !== imageLoadToken) return;
            loadImage(index, imgElement, () => selectThumbnail(index, imageUrls, labels));
        };
    });

    tryMainImage(0);

    // Unloaded thumbnails are display:none (no blank gap), so they can never intersect themselves.
    // Observe the always-visible gallery row instead and load the remaining photos once it is near.
    const loadRemainingThumbnails = () => {
        thumbnails.slice(1).forEach((img, offset) => loadImage(offset + 1, img));
    };
    const gallery = elements.dogImageMain?.parentElement?.querySelector('.thumbnail-gallery');
    if ('IntersectionObserver' in window && gallery) {
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            observer.disconnect();
            if (imageObserver === observer) imageObserver = null;
            loadRemainingThumbnails();
        }, { rootMargin: '200px' });
        imageObserver = observer;
        observer.observe(gallery);
    } else {
        loadRemainingThumbnails();
    }
}

// Select a thumbnail image
function selectThumbnail(index, imageUrls, labels) {
    const dog = appState.currentDog;
    
    // Update main image
    elements.dogImageStatus.textContent = `Foto von ${dog.name} wird geladen …`;
    elements.dogImageStatus.hidden = false;
    elements.dogImageMain.style.display = 'none';
    elements.dogImageMain.style.visibility = 'hidden';
    elements.dogImageMain.dataset.activeIndex = String(index);
    elements.dogImageMain.src = imageUrls[index] || imageUrls[0] || '';
    elements.dogImageMain.alt = `${dog.name} — Bild ${index + 1}`;
    
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
    
    const overall = calculateSuitabilityRating(matchScore);
    if (overall === null) {
        elements.overallRating.innerHTML = '<span class="rating-unavailable">—</span>';
        elements.overallRatingText.textContent = 'Kein persönlicher Test';
        return;
    }
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

function calculateSuitabilityRating(matchScore) {
    if (!Number.isFinite(matchScore)) return null;
    return Math.max(0, Math.min(5, matchScore / 20));
}

// Most catalogue entries use the breed as their display name; avoid printing it twice.
function getBreedSubtitle(dog) {
    const breed = (dog?.breed || '').trim();
    const name = (dog?.name || '').trim();
    return breed && breed.toLowerCase() !== name.toLowerCase() ? breed : '';
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
        if (elements.shownBreedCount) {
            elements.shownBreedCount.textContent = String(appState.matchingDogs.length);
        }
        showScreen('noMore');
    }
}

// Back to results from chat
function backToResults() {
    showScreen('results');
}

// Return to the start screen without discarding the completed test.
function restartTest() {
    if (appState.lastResult) {
        appState.lastResult.currentDogIndex = 0;
        saveState();
    }
    renderSavedResult();
    showScreen('start');
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
        const breedSubtitle = getBreedSubtitle(dog);
        card.innerHTML = `
            <img src="${dog.images[0] || ''}" alt="${dog.name}" onerror="this.style.visibility='hidden'">
            <h3>${dog.name}</h3>
            ${breedSubtitle ? `<p class="breed">${breedSubtitle}</p>` : ''}
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
                appState.matchingDogs = [{
                    ...fullDog,
                    matchScore: Number.isFinite(dog.matchScore) ? dog.matchScore : null
                }];
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

const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const DEFAULT_SHARE_CAPTION = 'Ein Hundevorschlag für dich';

function getShareData(dog = appState.currentDog) {
    if (!dog) return null;
    const url = getShareUrl(dog);
    return {
        title: `${dog.name} bei MyDog`,
        text: `Schau dir dieses Hundeprofil an: ${dog.name}.`,
        url
    };
}

function getCurrentDogImageUrl(dog) {
    const visibleImage = elements.dogImageMain?.currentSrc || elements.dogImageMain?.src;
    return dog.images?.find(source => new URL(source, window.location.href).href === visibleImage)
        || dog.images?.[0] || '';
}

function getShareImageCaption() {
    return (elements.shareImageCaption?.value || appState.shareImageCaption || DEFAULT_SHARE_CAPTION).trim()
        || DEFAULT_SHARE_CAPTION;
}

function getShareImageKey(dog = appState.currentDog) {
    if (!dog) return null;
    const source = appState.shareImageSource || dog.images?.[0] || '';
    const caption = getShareImageCaption();
    const rating = Number.isFinite(dog.matchScore) ? dog.matchScore.toFixed(2) : 'profile';
    return `${dog.id}|${source}|${caption}|${rating}`;
}

function getShareRatingText(dog) {
    const suitability = calculateSuitabilityRating(dog.matchScore);
    return suitability === null ? 'Rasseprofil' : `${suitability.toFixed(1)}/5 Eignung`;
}

function renderShareImageEditor(dog) {
    appState.shareImageSource = getCurrentDogImageUrl(dog);
    appState.shareImageCaption = DEFAULT_SHARE_CAPTION;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    appState.shareImagePreparing = null;
    appState.shareImagePreparingKey = null;

    elements.shareImageSource.innerHTML = '';
    (dog.images || []).forEach((source, index) => {
        const option = document.createElement('option');
        option.value = source;
        // Catalogue labels are generic ("… Welpe") and do not always describe the actual photo.
        option.textContent = `Foto ${index + 1}`;
        elements.shareImageSource.appendChild(option);
    });
    elements.shareImageSource.value = appState.shareImageSource;
    elements.shareImageCaption.value = DEFAULT_SHARE_CAPTION;
    updateShareImagePreview(dog);
}

function updateShareImagePreview(dog = appState.currentDog) {
    if (!dog) return;
    const source = appState.shareImageSource || dog.images?.[0] || '';
    const caption = getShareImageCaption();
    elements.shareImagePreview.src = source;
    elements.shareImagePreview.alt = `${dog.name} – Share-Bild`;
    elements.shareCardName.textContent = dog.name;
    const breedSubtitle = getBreedSubtitle(dog);
    elements.shareCardBreed.textContent = breedSubtitle;
    elements.shareCardBreed.hidden = !breedSubtitle;
    elements.shareCardRating.textContent = getShareRatingText(dog);
    elements.shareCardCaption.textContent = caption;
}

function handleShareImageSourceChange() {
    if (!appState.currentDog) return;
    appState.shareImageSource = elements.shareImageSource.value;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    updateShareImagePreview();
    queueShareImagePreparation(appState.currentDog);
}

function handleShareImageCaptionChange() {
    if (!appState.currentDog) return;
    appState.shareImageCaption = elements.shareImageCaption.value;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    updateShareImagePreview();
    // Avoid rendering a 1200×630 PNG for every keystroke.
    queueShareImagePreparation(appState.currentDog, 350);
}

function queueShareImagePreparation(dog, delay = 0) {
    clearTimeout(shareImageDebounceTimer);
    shareImageDebounceTimer = null;
    const key = getShareImageKey(dog);
    elements.nativeShareBtn.disabled = true;
    setShareStatus('Share-Bild wird vorbereitet …');
    const prepare = () => {
        shareImageDebounceTimer = null;
        void prepareShareImageFile(dog).then(file => {
            // A previous photo/caption may finish after the editor has moved on.
            if (!elements.shareModal.classList.contains('active') || appState.currentDog?.id !== dog.id || getShareImageKey(dog) !== key) return;
            elements.nativeShareBtn.disabled = !file;
            setShareStatus(file
                ? 'Share-Bild bereit – du kannst es speichern oder direkt teilen.'
                : 'Das Foto kann nicht als Bild exportiert werden. Der Link bleibt verfügbar.');
        });
    };
    if (delay) shareImageDebounceTimer = setTimeout(prepare, delay);
    else prepare();
}

// Open the share editor for browsers without native file sharing, or before preparing a share image.
function openShareModal() {
    const dog = appState.currentDog;
    if (!dog) return;

    const shareData = getShareData(dog);
    elements.shareDogName.textContent = dog.name;
    const breedSubtitle = getBreedSubtitle(dog);
    elements.shareDogBreed.textContent = breedSubtitle;
    elements.shareDogBreed.hidden = !breedSubtitle;
    elements.shareLinkInput.value = shareData.url;
    elements.nativeShareBtn.hidden = typeof navigator.share !== 'function';
    renderShareImageEditor(dog);
    if (!elements.shareModal.classList.contains('active')) {
        shareModalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    elements.shareModal.classList.add('active');
    // Move keyboard and screen-reader focus into the dialog.
    const closeButton = elements.shareModal.querySelector('.close-btn');
    if (closeButton) closeButton.focus({ preventScroll: true });
    queueShareImagePreparation(dog);
}

function getShareUrl(dog = appState.currentDog) {
    if (!dog) return window.location.href;
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('dog', String(dog.id));
    return url.toString();
}

function loadShareImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        // Catalogue photos now live on our own origin. A blob: URL here is blocked by
        // production's img-src CSP, even though the fetch itself succeeds.
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Share image could not be loaded'));
        image.src = source;
    });
}

function drawCoverImage(context, image, x, y, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawFittedCanvasText(context, text, x, y, maxWidth, weight, maxSize, minSize, style = '') {
    let fontSize = maxSize;
    while (fontSize > minSize) {
        context.font = `${style}${weight} ${fontSize}px Arial, sans-serif`;
        if (context.measureText(text).width <= maxWidth) break;
        fontSize -= 2;
    }
    context.font = `${style}${weight} ${Math.max(fontSize, minSize)}px Arial, sans-serif`;
    context.fillText(text, x, y);
}

function drawShareCard(context, image, dog, caption) {
    context.clearRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);
    drawCoverImage(context, image, 0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

    const gradient = context.createLinearGradient(0, 0, 0, SHARE_IMAGE_HEIGHT);
    gradient.addColorStop(0, 'rgba(10, 28, 21, 0.08)');
    gradient.addColorStop(0.46, 'rgba(10, 28, 21, 0.18)');
    gradient.addColorStop(1, 'rgba(10, 28, 21, 0.88)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

    context.fillStyle = '#f4c95d';
    context.font = '700 24px Arial, sans-serif';
    context.letterSpacing = '2px';
    context.fillText('MYDOG · HUNDEVORSCHLAG', 58, 66);

    context.fillStyle = '#fffdf8';
    const breedSubtitle = getBreedSubtitle(dog);
    // Without a separate breed line the name moves down so the text block stays balanced.
    drawFittedCanvasText(context, dog.name, 58, breedSubtitle ? 470 : 505, 1080, '700', 68, 38);
    if (breedSubtitle) drawFittedCanvasText(context, breedSubtitle, 60, 515, 1060, '400', 30, 22);

    context.fillStyle = '#f4c95d';
    context.font = '700 27px Arial, sans-serif';
    context.fillText(getShareRatingText(dog), 60, 565);

    context.fillStyle = '#fffdf8';
    const safeCaption = caption.length > 70 ? `${caption.slice(0, 67)}…` : caption;
    drawFittedCanvasText(context, safeCaption, 60, 606, 1060, '400', 26, 18, 'italic ');
}

async function createShareImageFile(dog) {
    const source = appState.shareImageSource || dog.images?.[0];
    if (!source) return null;
    const image = await loadShareImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = SHARE_IMAGE_WIDTH;
    canvas.height = SHARE_IMAGE_HEIGHT;
    drawShareCard(canvas.getContext('2d'), image, dog, getShareImageCaption());
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    const safeName = dog.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'hund';
    return new File([blob], `mydog-${safeName}-share.png`, { type: 'image/png' });
}

async function prepareShareImageFile(dog = appState.currentDog) {
    if (!dog) return null;
    const key = getShareImageKey(dog);
    if (appState.shareImageFile && appState.shareImageKey === key) return appState.shareImageFile;
    if (appState.shareImagePreparing && appState.shareImagePreparingKey === key) {
        return appState.shareImagePreparing;
    }

    appState.shareImagePreparingKey = key;
    appState.shareImagePreparing = createShareImageFile(dog)
        .then(file => {
            if (getShareImageKey(dog) === key) {
                appState.shareImageFile = file;
                appState.shareImageKey = file ? key : null;
            }
            return file;
        })
        .catch(error => {
            console.warn('Share image export unavailable:', error);
            return null;
        })
        .finally(() => {
            if (appState.shareImagePreparingKey === key) {
                appState.shareImagePreparing = null;
                appState.shareImagePreparingKey = null;
            }
        });
    return appState.shareImagePreparing;
}

function getShareImageState() {
    return {
        ready: Boolean(appState.shareImageFile),
        fileName: appState.shareImageFile?.name || null,
        source: appState.shareImageSource,
        caption: getShareImageCaption()
    };
}

async function downloadShareImage() {
    const dog = appState.currentDog;
    if (!dog) return;
    setShareStatus('Share-Bild wird erstellt …');
    const file = await prepareShareImageFile(dog);
    if (!file) {
        setShareStatus('Das Share-Bild konnte nicht erstellt werden. Bitte kopiere stattdessen den Link.');
        return;
    }
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setShareStatus('Share-Bild gespeichert.');
    showToast('Share-Bild gespeichert!', 'success');
}

async function shareWithNativeSheet(dog) {
    const shareData = getShareData(dog);
    const file = appState.shareImageFile;
    let includesImage = false;
    if (file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
        includesImage = true;
    }

    closeShareModal();
    try {
        await navigator.share(shareData);
        showToast(includesImage ? 'Share-Bild geteilt!' : 'Hundeprofil geteilt!', 'success');
    } catch (error) {
        // Cancelling the native sheet is a normal user action, not an error.
        if (error?.name !== 'AbortError') {
            openShareModal();
            setShareStatus('Direktes Teilen ist gerade nicht verfügbar. Du kannst das Bild speichern oder den Link kopieren.');
        }
    }
}

// Share the current dog through the device sheet, attaching the generated image when possible.
async function shareCurrentDog() {
    const dog = appState.currentDog;
    if (!dog) return;

    if (typeof navigator.share !== 'function') {
        openShareModal();
        return;
    }

    const key = getShareImageKey(dog);
    if (!appState.shareImageFile || appState.shareImageKey !== key) {
        if (!elements.shareModal.classList.contains('active')) openShareModal();
        else queueShareImagePreparation(dog);
        return;
    }

    await shareWithNativeSheet(dog);
}

// Close share modal
function closeShareModal() {
    const wasOpen = elements.shareModal.classList.contains('active');
    elements.shareModal.classList.remove('active');
    clearTimeout(shareImageDebounceTimer);
    shareImageDebounceTimer = null;
    if (wasOpen && shareModalReturnFocus && document.contains(shareModalReturnFocus)) {
        shareModalReturnFocus.focus({ preventScroll: true });
    }
    shareModalReturnFocus = null;
}

// Keyboard support for the share dialog: Escape closes, Tab stays inside the dialog.
function handleShareModalKeydown(event) {
    if (!elements.shareModal.classList.contains('active')) return;
    if (event.key === 'Escape') {
        event.preventDefault();
        closeShareModal();
        return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...elements.shareModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(element => !element.hidden && element.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !elements.shareModal.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
    }
}

function setShareStatus(message) {
    elements.shareStatus.textContent = message;
}

// Copy link to clipboard
function copyLink() {
    const text = elements.shareLinkInput.value;
    const fallback = () => {
        elements.shareLinkInput.focus();
        elements.shareLinkInput.select();
        elements.shareLinkInput.setSelectionRange(0, text.length);
        const copied = document.execCommand('copy');
        const message = copied ? 'Link kopiert!' : 'Link markiert – bitte kopieren.';
        setShareStatus(message);
        showToast(message, copied ? 'success' : 'error');
    };
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
            () => {
                setShareStatus('Link kopiert!');
                showToast('Link kopiert!', 'success');
            },
            fallback
        );
    } else {
        fallback();
    }
}

// Share on social media functions
function shareOnTwitter() {
    const dog = appState.currentDog;
    if (!dog) return;

    const shareData = getShareData(dog);
    const text = `${shareData.text} ${shareData.url}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function shareOnFacebook() {
    const shareData = getShareData();
    if (!shareData) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function shareOnWhatsApp() {
    const dog = appState.currentDog;
    if (!dog) return;
    
    const shareData = getShareData(dog);
    const text = `${shareData.text} ${shareData.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Add a message to the chat
function addChatMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);
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
            appState.matchingDogs = [{ ...dog, matchScore: null }];
            appState.currentDogIndex = 0;
            appState.sharedProfile = true;
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
