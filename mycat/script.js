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
    matchingCats: [],
    currentCatIndex: 0,
    chatHistory: [],
    currentCat: null,
    sharedProfile: false,
    shareImageSource: null,
    shareImageCaption: 'Ein Katzenprofil für dich',
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
const SCORING_VERSION = 1;

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
    catName: document.getElementById('cat-name'),
    catBreed: document.getElementById('cat-breed'),
    catSize: document.getElementById('cat-size'),
    catEnergy: document.getElementById('cat-energy'),
    catGrooming: document.getElementById('cat-grooming'),
    catFamily: document.getElementById('cat-family'),
    catTrainability: document.getElementById('cat-trainability'),
    catDescription: document.getElementById('cat-description'),
    catHealthNote: document.getElementById('cat-health-note-text'),
    catSourceLink: document.getElementById('cat-source-link'),
    catImageMain: document.getElementById('cat-image-main'),
    catImageStatus: document.getElementById('cat-image-status'),
    catImageStatusText: document.getElementById('cat-image-status-text'),
    catImage1: document.getElementById('cat-image-1'),
    catImage2: document.getElementById('cat-image-2'),
    catImage3: document.getElementById('cat-image-3'),
    catImage4: document.getElementById('cat-image-4'),
    catImage5: document.getElementById('cat-image-5'),
    catImage6: document.getElementById('cat-image-6'),
    matchReason: document.getElementById('match-reason'),
    nextCatBtn: document.getElementById('next-cat-btn'),
    chatBtn: document.getElementById('chat-btn'),
    favoriteBtn: document.getElementById('favorite-btn'),
    shareBtn: document.getElementById('share-btn'),
    backToResultsBtn: document.getElementById('back-to-results-btn'),
    chatCatName: document.getElementById('chat-cat-name'),
    chatCatNameMsg: document.getElementById('chat-cat-name-msg'),
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
    shareCatName: document.getElementById('share-cat-name'),
    shareCatBreed: document.getElementById('share-cat-breed'),
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
    const savedState = localStorage.getItem('mycat_appState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            appState.favorites = Array.isArray(state.favorites) ? state.favorites.map(saved => {
                const current = catDatabase.find(cat => cat.id === saved?.id);
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
    localStorage.setItem('mycat_appState', JSON.stringify(state));
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
    elements.nextCatBtn.addEventListener('click', showNextCat);
    elements.chatBtn.addEventListener('click', showChat);
    elements.backToResultsBtn.addEventListener('click', backToResults);
    elements.restartTestBtn.addEventListener('click', restartTest);
    elements.backFromFavoritesBtn.addEventListener('click', () => showScreen('start'));

    // Favorite button
    elements.favoriteBtn.addEventListener('click', toggleFavorite);

    // Share button: use the native mobile share sheet when available, otherwise open the fallback dialog.
    elements.shareBtn.addEventListener('click', shareCurrentCat);
    elements.copyLinkBtn.addEventListener('click', copyLink);
    elements.nativeShareBtn.addEventListener('click', shareCurrentCat);
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
    const firstCat = result && result.catIds ? catDatabase.find(cat => cat.id === result.catIds[0]) : null;
    const hasResult = Boolean(firstCat);
    elements.savedResultPanel.hidden = !hasResult;
    if (hasResult) {
        elements.savedResultText.textContent = `Zuletzt: ${firstCat.name}. Das Ergebnis bleibt auf diesem Gerät gespeichert.`;
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
        catIds: appState.matchingCats.map(cat => cat.id),
        matchScores: Object.fromEntries(appState.matchingCats.map(cat => [cat.id, cat.matchScore || 0])),
        userPersonality: { ...appState.userPersonality },
        completedAt: new Date().toISOString(),
        currentCatIndex: 0
    };
    saveState();
    renderSavedResult();
}

function restoreLastResult() {
    const result = appState.lastResult;
    if (!result || !Array.isArray(result.catIds)) {
        startNewTest();
        return;
    }
    const hasCompleteSavedAnswers = appState.userAnswers.filter(Boolean).length === bigFiveQuestions.length;
    const needsFullCatalogueRefresh = result.scoringVersion !== SCORING_VERSION
        || result.catIds.length < catDatabase.length;
    if (needsFullCatalogueRefresh && hasCompleteSavedAnswers) {
        calculatePersonality();
        appState.matchingCats = getMatchingCats(appState.userPersonality, catDatabase.length);
        appState.currentCatIndex = 0;
        persistCompletedResult();
        showCatResult();
        return;
    }
    const restoredScores = result.matchScores || Object.fromEntries(
        getMatchingCats(result.userPersonality || {}, result.catIds.length).map(cat => [cat.id, cat.matchScore || 0])
    );
    const restoredCats = result.catIds.map(id => {
        const cat = catDatabase.find(candidate => candidate.id === id);
        return cat ? { ...cat, matchScore: restoredScores[id] ?? 0 } : null;
    }).filter(Boolean);
    if (!restoredCats.length) {
        startNewTest();
        return;
    }
    appState.matchingCats = restoredCats;
    appState.userPersonality = result.userPersonality || appState.userPersonality;
    appState.sharedProfile = false;
    appState.currentCatIndex = Math.min(result.currentCatIndex || 0, restoredCats.length - 1);
    showCatResult();
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
    appState.matchingCats = [];
    appState.currentCatIndex = 0;
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
        // Test is complete, calculate personality and find matching cats
        calculatePersonality();
        findMatchingCats();
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

// Find matching cats based on user personality
function findMatchingCats() {
    showScreen('loading');

    setTimeout(() => {
        appState.matchingCats = getMatchingCats(appState.userPersonality, catDatabase.length);
        appState.currentCatIndex = 0;
        persistCompletedResult();

        if (appState.matchingCats.length > 0) {
            showCatResult();
        } else {
            showScreen('no-more');
        }
    }, 1500);
}

// Show the cat result
function showCatResult() {
    const cat = appState.matchingCats[appState.currentCatIndex];
    if (!cat) return;
    const hasPersonalMatch = Number.isFinite(cat.matchScore);
    appState.sharedProfile = !hasPersonalMatch;
    appState.currentCat = cat;

    // Update cat info
    elements.catName.textContent = cat.name;
    elements.catBreed.textContent = cat.breed;
    elements.catSize.textContent = cat.size;
    elements.catEnergy.textContent = cat.energy;
    elements.catGrooming.textContent = cat.grooming;
    elements.catFamily.textContent = cat.familyFriendly;
    elements.catTrainability.textContent = cat.trainability;
    elements.catDescription.textContent = cat.description;
    elements.catHealthNote.textContent = cat.healthCaution;
    elements.catSourceLink.href = cat.sourceUrl;
    elements.catSourceLink.textContent = `Rasseprofil: ${cat.sourceName} ↗`;

    // Load images with fallback and labels
    loadCatImages(cat.images, cat.imagesLabels);

    // Show breed attributes separately; personal suitability is only shown for test results.
    updateRatings(cat.ratings, cat.matchScore);

    // Generate match explanation
    if (hasPersonalMatch) {
        const explanation = generateMatchExplanation(appState.userPersonality, cat);
        elements.matchReason.textContent = explanation + ` (Übereinstimmung: ${cat.matchScore.toFixed(1)}%)`;
    } else {
        elements.matchReason.textContent = 'Allgemeines Rasseprofil. Mache den Persönlichkeitstest, um deine persönliche Eignung zu sehen.';
    }
    elements.nextCatBtn.hidden = !hasPersonalMatch;

    // Update favorite button state
    updateFavoriteButton();

    // Show results screen
    showScreen('results');
}

function showCatImageStatus(cat, failed = false) {
    elements.catImageStatusText.textContent = failed
        ? `Für ${cat.name} ist gerade kein Foto verfügbar.`
        : `Foto von ${cat.name} wird geladen …`;
    elements.catImageStatus.classList.toggle('is-error', failed);
    elements.catImageStatus.hidden = false;
}

// Load breed-specific images without showing stale images during transitions.
function loadCatImages(imageUrls, labels) {
    const cat = appState.currentCat;
    const loadToken = ++imageLoadToken;
    if (imageObserver) imageObserver.disconnect();
    const thumbnailIds = ['cat-image-1', 'cat-image-2', 'cat-image-3', 'cat-image-4', 'cat-image-5', 'cat-image-6'];
    const thumbnails = thumbnailIds.map(id => document.getElementById(id));

    showCatImageStatus(cat);

    // Clear every previous image before the next cat is rendered.
    [elements.catImageMain, ...thumbnails].forEach(img => {
        if (!img) return;
        img.removeAttribute('src');
        delete img.dataset.loaded;
        delete img.dataset.loading;
        img.style.display = 'none';
        img.style.visibility = 'hidden';
        img.classList.remove('selected');
        img.onclick = null;
    });

    elements.catImageMain.alt = cat.name;
    elements.catImageMain.loading = 'eager';
    elements.catImageMain.onload = function() {
        if (loadToken !== imageLoadToken) return;
        if (this.naturalWidth > 0) {
            this.style.display = 'block';
            this.style.visibility = 'visible';
            elements.catImageStatus.hidden = true;
        }
    };
    elements.catImageMain.onerror = function() {
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
            if (target !== elements.catImageMain) {
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
            showCatImageStatus(cat, true);
            return;
        }
        elements.catImageMain.dataset.activeIndex = String(index);
        loadImage(index, elements.catImageMain, () => {
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
        imgElement.alt = `${cat.name} — Bild ${index + 1}`;
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

    // These six local WebP files are small; loading the gallery with the profile avoids
    // zero-size IntersectionObserver targets and ensures the profile is useful offline.
    const loadRemainingThumbnails = () => {
        thumbnails.slice(1).forEach((img, offset) => loadImage(offset + 1, img));
    };
    loadRemainingThumbnails();
}

// Select a thumbnail image
function selectThumbnail(index, imageUrls, labels) {
    const cat = appState.currentCat;

    // Update main image
    showCatImageStatus(cat);
    elements.catImageMain.style.display = 'none';
    elements.catImageMain.style.visibility = 'hidden';
    elements.catImageMain.dataset.activeIndex = String(index);
    elements.catImageMain.src = imageUrls[index] || imageUrls[0] || '';
    elements.catImageMain.alt = `${cat.name} — Bild ${index + 1}`;

    // Update thumbnail selection
    const thumbnailIds = ['cat-image-1', 'cat-image-2', 'cat-image-3', 'cat-image-4', 'cat-image-5', 'cat-image-6'];
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
        ratings = { family: 3, energy: 3, trainability: 3, grooming: 3 };
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

function generateMatchExplanation(userPersonality, cat) {
    const labels = {
        O: 'Neugier und Offenheit',
        C: 'Alltagsstruktur',
        E: 'Aktivität und Kontaktfreude',
        A: 'Zugewandtheit',
        N: 'Gelassenheit'
    };
    const closest = Object.keys(labels)
        .filter(dimension => Number.isFinite(Number(userPersonality?.[dimension])) && Number.isFinite(Number(cat?.personality?.[dimension])))
        .sort((a, b) => Math.abs(userPersonality[a] - cat.personality[a]) - Math.abs(userPersonality[b] - cat.personality[b]))
        .slice(0, 2)
        .map(dimension => labels[dimension]);
    if (!closest.length) return 'Dieses Katzenprofil steht in einer spielerischen Ähnlichkeitssortierung weit oben.';
    return `In der spielerischen Auswertung ähneln deine Antworten dem allgemeinen Profil besonders bei ${closest.join(' und ')}. Das sagt nichts Sicheres über ein einzelnes Tier aus.`;
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
function getBreedSubtitle(cat) {
    const breed = (cat?.breed || '').trim();
    const name = (cat?.name || '').trim();
    return breed && breed.toLowerCase() !== name.toLowerCase() ? breed : '';
}

// A playful voice derived from the catalogue's breed-profile scores, not an
// assertion about an individual cat's behaviour or a generative AI persona.
function getCatChatPersona(cat) {
    const { O = 50, C = 50, E = 50, A = 50, N = 50 } = cat.personality || {};
    if (E >= 85 && A >= 80) {
        return { traits: 'offen und gesellig', greeting: 'Frag mich ruhig!', lead: 'Miau, gern:' };
    }
    if (O >= 80 && E >= 75) {
        return { traits: 'neugierig und verspielt', greeting: 'Was möchtest du genauer wissen?', lead: 'Oh, spannende Frage:' };
    }
    if (N >= 65) {
        return { traits: 'aufmerksam und feinfühlig', greeting: 'Wir gehen das in Ruhe durch.', lead: 'Schritt für Schritt:' };
    }
    if (E <= 50 || A <= 55) {
        return { traits: 'eigenständig und gelassen', greeting: 'Frag mich in deinem Tempo.', lead: 'Ganz in Ruhe:' };
    }
    return { traits: 'aufmerksam und freundlich', greeting: 'Was interessiert dich?', lead: 'Aus meinem Steckbrief:' };
}

// Show chat screen
function showChat() {
    const cat = appState.matchingCats[appState.currentCatIndex];
    appState.currentCat = cat;

    elements.chatCatName.textContent = cat.name;
    elements.chatCatNameMsg.textContent = cat.name;

    appState.chatHistory = [];
    elements.chatMessages.innerHTML = '';

    const persona = getCatChatPersona(cat);
    addChatMessage('assistant', `${cat.name} hier – im spielerischen Profil eher ${persona.traits}. ${persona.greeting} Frag mich nach Bewegung, Pflege oder Alltag.`);

    elements.userMessageInput.value = '';

    showScreen('chat');

    setTimeout(() => {
        elements.userMessageInput.focus();
    }, 100);
}

// Show next cat
function showNextCat() {
    appState.currentCatIndex++;
    if (appState.lastResult) {
        appState.lastResult.currentCatIndex = appState.currentCatIndex;
        saveState();
    }

    if (appState.currentCatIndex < appState.matchingCats.length) {
        showCatResult();
    } else {
        if (elements.shownBreedCount) {
            elements.shownBreedCount.textContent = String(appState.matchingCats.length);
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
        appState.lastResult.currentCatIndex = 0;
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
            ? 'Noch keine gespeicherten Katzen.'
            : `${favoriteCount} ${favoriteCount === 1 ? 'Katze' : 'Katzen'} gespeichert — wähle eine Katze aus, um sein Profil zu öffnen.`;
    }
    if (appState.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-favorites">
                <span class="empty-favorites-icon" aria-hidden="true">🐾</span>
                <h3>Noch keine Favoriten</h3>
                <p>Speichere Katzen aus deinen Testergebnissen, damit du sie hier jederzeit wiederfindest.</p>
                <button class="btn-primary empty-favorites-action" type="button">Test starten</button>
            </div>`;
        elements.favoritesList.querySelector('.empty-favorites-action').addEventListener('click', startTest);
        return;
    }

    elements.favoritesList.innerHTML = '';

    appState.favorites.forEach((cat, index) => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.setAttribute('role', 'group');
        card.dataset.catId = cat.id;
        const suitability = calculateSuitabilityRating(cat.matchScore);
        const breedSubtitle = getBreedSubtitle(cat);
        card.innerHTML = `
            <img src="${cat.images[0] || ''}" alt="${cat.name}" onerror="this.style.visibility='hidden'">
            <h3>${cat.name}</h3>
            ${breedSubtitle ? `<p class="breed">${breedSubtitle}</p>` : ''}
            <p>${cat.description.substring(0, 100)}...</p>
            <div class="rating">
                <span>⭐ ${suitability === null ? '—' : `${suitability.toFixed(1)}/5`} Eignung</span>
            </div>
            <div class="favorite-card-actions">
                <button class="view-btn" type="button">Profil ansehen</button>
                <button class="remove-btn" type="button" data-index="${index}">Entfernen</button>
            </div>
        `;

        const viewFavorite = () => {
            const fullCat = catDatabase.find(d => d.id === cat.id);
            if (fullCat) {
                appState.matchingCats = [{
                    ...fullCat,
                    matchScore: Number.isFinite(cat.matchScore) ? cat.matchScore : null
                }];
                appState.currentCatIndex = 0;
                showCatResult();
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
    const cat = appState.matchingCats[appState.currentCatIndex];
    if (!cat) return;

    const isFavorite = appState.favorites.some(f => f.id === cat.id);

    if (isFavorite) {
        removeFavorite(appState.favorites.findIndex(f => f.id === cat.id));
        showToast('❤️ aus Favoriten entfernt', 'error');
    } else {
        addFavorite(cat);
        showToast('❤️ zu Favoriten hinzugefügt', 'success');
    }

    updateFavoriteButton();
    saveState();
}

// Add to favorites
function addFavorite(cat) {
    if (!appState.favorites.some(f => f.id === cat.id)) {
        appState.favorites.push({
            id: cat.id,
            name: cat.name,
            breed: cat.breed,
            images: cat.images,
            description: cat.description,
            ratings: cat.ratings,
            matchScore: cat.matchScore
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
    if (!appState.currentCat) return;

    const isFavorite = appState.favorites.some(f => f.id === appState.currentCat.id);
    elements.favoriteBtn.classList.toggle('favorited', isFavorite);
    elements.favoriteBtn.textContent = isFavorite ? '❤️ Aus Favoriten entfernen' : '❤️ Zu Favoriten speichern';
}

const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const DEFAULT_SHARE_CAPTION = 'Ein Katzenprofil für dich';

function getShareData(cat = appState.currentCat) {
    if (!cat) return null;
    const url = getShareUrl(cat);
    return {
        title: `${cat.name} bei MyCat`,
        text: `Schau dir dieses Katzenprofil an: ${cat.name}.`,
        url
    };
}

function getCurrentCatImageUrl(cat) {
    const visibleImage = elements.catImageMain?.currentSrc || elements.catImageMain?.src;
    return cat.images?.find(source => new URL(source, window.location.href).href === visibleImage)
        || cat.images?.[0] || '';
}

function getShareImageCaption() {
    return (elements.shareImageCaption?.value || appState.shareImageCaption || DEFAULT_SHARE_CAPTION).trim()
        || DEFAULT_SHARE_CAPTION;
}

function getShareImageKey(cat = appState.currentCat) {
    if (!cat) return null;
    const source = appState.shareImageSource || cat.images?.[0] || '';
    const caption = getShareImageCaption();
    const rating = Number.isFinite(cat.matchScore) ? cat.matchScore.toFixed(2) : 'profile';
    return `${cat.id}|${source}|${caption}|${rating}`;
}

function getShareRatingText(cat) {
    const suitability = calculateSuitabilityRating(cat.matchScore);
    return suitability === null ? 'Rasseprofil' : `${suitability.toFixed(1)}/5 Eignung`;
}

function renderShareImageEditor(cat) {
    appState.shareImageSource = getCurrentCatImageUrl(cat);
    appState.shareImageCaption = DEFAULT_SHARE_CAPTION;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    appState.shareImagePreparing = null;
    appState.shareImagePreparingKey = null;

    elements.shareImageSource.innerHTML = '';
    (cat.images || []).forEach((source, index) => {
        const option = document.createElement('option');
        option.value = source;
        // Catalogue labels are generic ("… Welpe") and do not always describe the actual photo.
        option.textContent = `Foto ${index + 1}`;
        elements.shareImageSource.appendChild(option);
    });
    elements.shareImageSource.value = appState.shareImageSource;
    elements.shareImageCaption.value = DEFAULT_SHARE_CAPTION;
    updateShareImagePreview(cat);
}

function updateShareImagePreview(cat = appState.currentCat) {
    if (!cat) return;
    const source = appState.shareImageSource || cat.images?.[0] || '';
    const caption = getShareImageCaption();
    elements.shareImagePreview.src = source;
    elements.shareImagePreview.alt = `${cat.name} – Share-Bild`;
    elements.shareCardName.textContent = cat.name;
    const breedSubtitle = getBreedSubtitle(cat);
    elements.shareCardBreed.textContent = breedSubtitle;
    elements.shareCardBreed.hidden = !breedSubtitle;
    elements.shareCardRating.textContent = getShareRatingText(cat);
    elements.shareCardCaption.textContent = caption;
}

function handleShareImageSourceChange() {
    if (!appState.currentCat) return;
    appState.shareImageSource = elements.shareImageSource.value;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    updateShareImagePreview();
    queueShareImagePreparation(appState.currentCat);
}

function handleShareImageCaptionChange() {
    if (!appState.currentCat) return;
    appState.shareImageCaption = elements.shareImageCaption.value;
    appState.shareImageFile = null;
    appState.shareImageKey = null;
    updateShareImagePreview();
    // Avoid rendering a 1200×630 PNG for every keystroke.
    queueShareImagePreparation(appState.currentCat, 350);
}

function queueShareImagePreparation(cat, delay = 0) {
    clearTimeout(shareImageDebounceTimer);
    shareImageDebounceTimer = null;
    const key = getShareImageKey(cat);
    elements.nativeShareBtn.disabled = true;
    setShareStatus('Share-Bild wird vorbereitet …');
    const prepare = () => {
        shareImageDebounceTimer = null;
        void prepareShareImageFile(cat).then(file => {
            // A previous photo/caption may finish after the editor has moved on.
            if (!elements.shareModal.classList.contains('active') || appState.currentCat?.id !== cat.id || getShareImageKey(cat) !== key) return;
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
    const cat = appState.currentCat;
    if (!cat) return;

    const shareData = getShareData(cat);
    elements.shareCatName.textContent = cat.name;
    const breedSubtitle = getBreedSubtitle(cat);
    elements.shareCatBreed.textContent = breedSubtitle;
    elements.shareCatBreed.hidden = !breedSubtitle;
    elements.shareLinkInput.value = shareData.url;
    elements.nativeShareBtn.hidden = typeof navigator.share !== 'function';
    renderShareImageEditor(cat);
    if (!elements.shareModal.classList.contains('active')) {
        shareModalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    elements.shareModal.classList.add('active');
    // Move keyboard and screen-reader focus into the dialog.
    const closeButton = elements.shareModal.querySelector('.close-btn');
    if (closeButton) closeButton.focus({ preventScroll: true });
    queueShareImagePreparation(cat);
}

function getShareUrl(cat = appState.currentCat) {
    if (!cat) return window.location.href;
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('cat', String(cat.id));
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

function drawShareCard(context, image, cat, caption) {
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
    context.fillText('MYCAT · KATZENPROFIL', 58, 66);

    context.fillStyle = '#fffdf8';
    const breedSubtitle = getBreedSubtitle(cat);
    // Without a separate breed line the name moves down so the text block stays balanced.
    drawFittedCanvasText(context, cat.name, 58, breedSubtitle ? 470 : 505, 1080, '700', 68, 38);
    if (breedSubtitle) drawFittedCanvasText(context, breedSubtitle, 60, 515, 1060, '400', 30, 22);

    context.fillStyle = '#f4c95d';
    context.font = '700 27px Arial, sans-serif';
    context.fillText(getShareRatingText(cat), 60, 565);

    context.fillStyle = '#fffdf8';
    const safeCaption = caption.length > 70 ? `${caption.slice(0, 67)}…` : caption;
    drawFittedCanvasText(context, safeCaption, 60, 606, 1060, '400', 26, 18, 'italic ');
}

async function createShareImageFile(cat) {
    const source = appState.shareImageSource || cat.images?.[0];
    if (!source) return null;
    const image = await loadShareImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = SHARE_IMAGE_WIDTH;
    canvas.height = SHARE_IMAGE_HEIGHT;
    drawShareCard(canvas.getContext('2d'), image, cat, getShareImageCaption());
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    const safeName = cat.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'katze';
    return new File([blob], `mycat-${safeName}-share.png`, { type: 'image/png' });
}

async function prepareShareImageFile(cat = appState.currentCat) {
    if (!cat) return null;
    const key = getShareImageKey(cat);
    if (appState.shareImageFile && appState.shareImageKey === key) return appState.shareImageFile;
    if (appState.shareImagePreparing && appState.shareImagePreparingKey === key) {
        return appState.shareImagePreparing;
    }

    appState.shareImagePreparingKey = key;
    appState.shareImagePreparing = createShareImageFile(cat)
        .then(file => {
            if (getShareImageKey(cat) === key) {
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
    const cat = appState.currentCat;
    if (!cat) return;
    setShareStatus('Share-Bild wird erstellt …');
    const file = await prepareShareImageFile(cat);
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

async function shareWithNativeSheet(cat) {
    const shareData = getShareData(cat);
    const file = appState.shareImageFile;
    let includesImage = false;
    if (file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
        includesImage = true;
    }

    closeShareModal();
    try {
        await navigator.share(shareData);
        showToast(includesImage ? 'Share-Bild geteilt!' : 'Katzenprofil geteilt!', 'success');
    } catch (error) {
        // Cancelling the native sheet is a normal user action, not an error.
        if (error?.name !== 'AbortError') {
            openShareModal();
            setShareStatus('Direktes Teilen ist gerade nicht verfügbar. Du kannst das Bild speichern oder den Link kopieren.');
        }
    }
}

// Share the current cat through the device sheet, attaching the generated image when possible.
async function shareCurrentCat() {
    const cat = appState.currentCat;
    if (!cat) return;

    if (typeof navigator.share !== 'function') {
        openShareModal();
        return;
    }

    const key = getShareImageKey(cat);
    if (!appState.shareImageFile || appState.shareImageKey !== key) {
        if (!elements.shareModal.classList.contains('active')) openShareModal();
        else queueShareImagePreparation(cat);
        return;
    }

    await shareWithNativeSheet(cat);
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
    const cat = appState.currentCat;
    if (!cat) return;

    const shareData = getShareData(cat);
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
    const cat = appState.currentCat;
    if (!cat) return;

    const shareData = getShareData(cat);
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

    // These are local profile answers, not an AI request. Respond immediately and
    // never let an old delayed answer appear under a different cat's profile.
    addChatMessage('assistant', generateChatResponse(message));
}

// Answer known profile topics; never pretend to know things absent from the data.
function generateChatResponse(message) {
    const cat = appState.currentCat;
    if (!cat) return 'Öffne zuerst ein Katzenprofil, dann kann ich dir den Steckbrief erklären.';
    const responses = catChatResponses[cat.name] || {};
    const persona = getCatChatPersona(cat);
    const inVoice = answer => `${persona.lead} ${answer}`;
    const text = message.toLocaleLowerCase('de-DE')
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

    if (/(?:blut|durchfall|verstopf|erbrech|schmerz|krank|notfall|tierarzt)/.test(text)) {
        return 'Bei Blut im Kot, Schmerzen, starkem Durchfall, Erbrechen, Pressen oder anhaltenden Veränderungen bitte eine Tierarztpraxis kontaktieren. Ein Rasseprofil kann keine Diagnose stellen.';
    }
    if (/(?:kack|scheiss|kot|stuhlgang|haeuf|poop|verdau|gross(?:es?|en)?\s+geschaeft)/.test(text)) {
        return inVoice('Die meisten Katzen setzen ein- bis dreimal am Tag Kot ab; Kitten oft häufiger. Das ist individuell verschieden. Wenn sich die Gewohnheiten ändern, die Katze presst, Schmerzen zeigt oder Blut im Kot ist, kontaktiere bitte eine Tierarztpraxis. Quelle: PDSA, „Constipation in cats“: https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/constipation-in-cats.');
    }
    if (/(?:pinkel|urin|blase|kleines\s+geschaeft)/.test(text)) {
        return inVoice('Wie oft eine Katze uriniert, ist individuell und hängt unter anderem von Alter, Trinken und Gesundheit ab. Achte auf ihre üblichen Gewohnheiten; bei Schmerzen, erfolglosen Toilettengängen oder plötzlichen Änderungen sofort eine Tierarztpraxis kontaktieren.');
    }
    if (/(?:futter|fuetter|essen|fress|friss|ernaehr|leckerli|portion)/.test(text)) {
        return inVoice(`Zur Fütterung von ${cat.name}: Die passende Menge hängt von Alter, Gewicht, Bewegung und Futter ab. Feste Grammzahlen aus einem Rasseprofil wären für deine Katze nicht verlässlich; orientiere dich an der Futterdeklaration und frage bei Unsicherheit eine Tierarztpraxis.`);
    }
    if (/(?:beweg|spiel|lauf|sport|auslast|aktiv)/.test(text)) {
        return inVoice(responses.movement || `Im Steckbrief von ${cat.name} steht zur Aktivität: ${cat.energy}`);
    }
    if (/(?:kinder|kind|familie|baby)/.test(text)) {
        return inVoice(`${cat.name}: ${cat.familyFriendly}. Kleine Kinder und Katzen sollten beim Umgang miteinander beaufsichtigt werden; Temperament und Sozialisation des einzelnen Tiers sind entscheidend.`);
    }
    if (/(?:pflege|buerst|fell|haar|wasch|schneid)/.test(text)) {
        return inVoice(responses.grooming || `Im Steckbrief von ${cat.name} steht zur Pflege: ${cat.grooming}`);
    }
    if (/(?:lebenserwart|lebensdauer|wie alt|alter|jahre|lange leb)/.test(text)) {
        return inVoice(responses.lifespan || `Für ${cat.name} liegt mir keine verlässliche Angabe zur Lebenserwartung vor. Das Alter einer individuellen Katze kann ich nicht vorhersagen.`);
    }
    if (/(?:erzieh|trainier|lern|trick|gehorch)/.test(text)) {
        return inVoice(responses.training || `Im Steckbrief von ${cat.name} steht zur Erziehung: ${cat.trainability}`);
    }
    if (/(?:allein|wohnung|bell|schlaf|beschaeftig)/.test(text)) {
        return inVoice(`Ob ${cat.name} gut allein bleibt, lässt sich aus der Rasse allein nicht sicher ableiten. Erfahrung, Gesundheit und Umfeld der einzelnen Katze spielen eine Rolle.`);
    }
    if (/(?:charakter|persoenlich|temperament|wesen|wie tickst|was macht dich aus|wie bist du drauf)/.test(text)) {
        return inVoice(`Im spielerischen Profil werden Merkmale wie ${persona.traits} angedeutet. ${cat.description} Individuelle Katzen können anders sein.`);
    }
    if (/(?:hallo|\bhi\b|\bhey\b|guten tag)/.test(text)) {
        return `${persona.greeting} Zu ${cat.name} kenne ich Infos über Bewegung, Pflege, Erziehung und Familie. Was interessiert dich?`;
    }
    if (/(?:name|heisst|bist du|welche rasse)/.test(text)) {
        return inVoice(`Hier geht es um ${cat.name} (${cat.breed}). Das sind allgemeine Profilinformationen, keine Beschreibung eines bestimmten Tiers.`);
    }
    if (/(?:danke|vielen dank)/.test(text)) return 'Gerne! Du kannst noch nach Bewegung, Pflege oder Alltag fragen.';
    if (/(?:tschuess|bye|auf wiedersehen)/.test(text)) return 'Bis bald und viel Spaß beim Entdecken der Katzen!';

    return inVoice(`Dazu habe ich im Steckbrief von ${cat.name} keine verlässliche Antwort. Frag mich zum Beispiel nach Bewegung, Pflege, Erziehung, Familie oder Verdauung – für individuelle Gesundheitsfragen hilft eine Tierarztpraxis.`);
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

// Check URL for cat parameter on load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get('cat');
    if (catId) {
        const cat = catDatabase.find(d => d.id == catId);
        if (cat) {
            appState.matchingCats = [{ ...cat, matchScore: null }];
            appState.currentCatIndex = 0;
            appState.sharedProfile = true;
            setTimeout(() => {
                showCatResult();
                showScreen('results');
            }, 100);
        }
    }
});

// Enable the PWA cache only when served from a secure origin (or localhost).
if ('serviceWorker' in navigator && (window.isSecureContext || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js', { scope: './' })
            .catch((error) => console.warn('MyCat offline mode unavailable:', error));
    });
}
