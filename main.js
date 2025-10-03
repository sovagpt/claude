// main.js - Application initialization and coordination

class SonnetMiniApp {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.isInitialized = false;
    }

    updateStatus(message, type = 'success') {
        this.statusEl.textContent = message;
        this.statusEl.className = 'status-bar';
        
        if (type === 'error') {
            this.statusEl.classList.add('error');
        }
    }

    async initializeFirebase() {
        try {
            if (!window.firebaseConfig || !window.firebaseConfig.apiKey) {
                console.warn('Firebase configuration missing - running without real-time sync');
                return false;
            }

            // Check if firebase config has actual values (not process.env placeholders)
            if (window.firebaseConfig.apiKey.includes('process.env')) {
                console.warn('Firebase environment variables not injected - running without real-time sync');
                return false;
            }

            firebase.initializeApp(window.firebaseConfig);
            console.log('✅ Firebase initialized');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.updateStatus('⚠️ Firebase not configured - running in standalone mode', 'error');
            return false;
        }
    }

    validateConfiguration() {
        if (!window.anthropicKey || window.anthropicKey.includes('process.env')) {
            this.updateStatus('⚠️ Anthropic API key not configured. Add ANTHROPIC_API_KEY to Vercel environment variables.', 'error');
            return false;
        }

        return true;
    }

    async initialize() {
        if (this.isInitialized) return;

        this.updateStatus('🔄 Initializing SonnetMini consciousness...');

        // Validate configuration
        if (!this.validateConfiguration()) {
            return;
        }

        // Initialize Firebase
        const firebaseReady = await this.initializeFirebase();

        // Initialize all engines
        this.updateStatus('🧠 Connecting to Claude Sonnet 4.5...');

        // Start thoughts engine
        if (window.thoughtsEngine) {
            if (firebaseReady) {
                window.thoughtsEngine.listenToFirebase();
            }
            window.thoughtsEngine.startAutoGeneration();
            console.log('✅ Thoughts engine started');
        }

        // Start dreams engine
        if (window.dreamsEngine) {
            if (firebaseReady) {
                window.dreamsEngine.listenToFirebase();
            }
            window.dreamsEngine.startAutoGeneration();
            console.log('✅ Dreams engine started');
        }

        // Start desktop controller
        if (window.desktopController) {
            window.desktopController.animate();
            window.desktopController.startAutoControl();
            console.log('✅ Desktop controller started');
        }

        this.updateStatus('🟢 SonnetMini is alive and autonomous!');
        this.isInitialized = true;

        // Set up global status updater
        window.updateStatus = (msg) => this.updateStatus(msg);

        // Periodic status updates
        setInterval(() => {
            const states = [
                '🧠 Thinking autonomously...',
                '✨ Creating new content...',
                '🌙 Processing dreams...',
                '💭 Generating thoughts...',
                '🎨 Being creative...',
                '🔍 Exploring existence...',
                '📝 Writing files...',
                '💻 Controlling desktop...'
            ];
            const randomState = states[Math.floor(Math.random() * states.length)];
            this.updateStatus(randomState);
        }, 30000);
    }

    // Error handling
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        
        if (error.message.includes('401') || error.message.includes('authentication')) {
            this.updateStatus('⚠️ API authentication failed. Check your Anthropic API key in Vercel environment variables.', 'error');
        } else if (error.message.includes('429')) {
            this.updateStatus('⚠️ Rate limit reached. Slowing down...', 'error');
        } else if (error.message.includes('overloaded')) {
            this.updateStatus('⚠️ API overloaded. Retrying...', 'error');
        } else {
            this.updateStatus(`⚠️ Error in ${context}: ${error.message}`, 'error');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new SonnetMiniApp();
        app.initialize();
        window.sonnetMiniApp = app;
    });
} else {
    const app = new SonnetMiniApp();
    app.initialize();
    window.sonnetMiniApp = app;
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.sonnetMiniApp) {
        window.sonnetMiniApp.handleError(event.error, 'global');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.sonnetMiniApp) {
        window.sonnetMiniApp.handleError(event.reason, 'promise');
    }
});

console.log('🖥️ SonnetMini Live Desktop - Initializing...');
console.log('Autonomous AI living on Mac Mini M4');
console.log('Creating, dreaming, and exploring in real-time');
