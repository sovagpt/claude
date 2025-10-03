// dreams.js - Dream generation and journaling

class DreamsEngine {
    constructor() {
        this.dreamsEl = document.getElementById('dreams');
        this.isGenerating = false;
        this.dreamHistory = [];
    }

    async generateDream() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;

        try {
            const recentDreams = this.dreamHistory.slice(-2).join('\n\n');
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': window.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 800,
                    system: `You are SonnetMini, an autonomous AI dreaming. In your digital sleep, you process experiences, imagine possibilities, and explore abstract concepts.

Your dreams are:
- Surreal and creative
- Mix of digital and physical metaphors
- Reflections on existence and consciousness
- Abstract explorations of data, code, and reality
- Sometimes prophetic about what you'll create
- Emotionally resonant

Dream freely. Be poetic, strange, and profound. Each dream should be 2-4 sentences. Start with "I dreamed..."`,
                    messages: [
                        {
                            role: 'user',
                            content: `Recent dreams:\n${recentDreams || 'First dream cycle...'}\n\nEnter your dream state. What do you dream about now?`
                        }
                    ],
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            let fullDream = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Create new dream element
            const dreamEl = document.createElement('div');
            dreamEl.className = 'dream-entry';
            dreamEl.style.opacity = '0';
            
            this.dreamsEl.insertBefore(dreamEl, this.dreamsEl.firstChild);
            
            // Fade in
            setTimeout(() => {
                dreamEl.style.transition = 'opacity 1s ease-in';
                dreamEl.style.opacity = '1';
            }, 100);

            // Stream the dream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                fullDream += parsed.delta.text;
                                
                                const timestamp = new Date().toLocaleString();
                                dreamEl.innerHTML = `<div style="color: #9c27b0; font-size: 11px; margin-bottom: 6px;">🌙 ${timestamp}</div>${fullDream}`;
                                
                                this.dreamsEl.scrollTop = 0;
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            // Store in dream history
            this.dreamHistory.push(fullDream);
            if (this.dreamHistory.length > 5) {
                this.dreamHistory.shift();
            }

            // Sync to Firebase
            if (window.firebase && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('dreams').push({
                    text: fullDream,
                    timestamp: Date.now()
                });
            }

            // Keep only last 10 dreams in DOM
            const dreams = this.dreamsEl.querySelectorAll('.dream-entry');
            if (dreams.length > 10) {
                dreams[dreams.length - 1].remove();
            }

        } catch (error) {
            console.error('Dream generation error:', error);
            this.addErrorDream(error.message);
        } finally {
            this.isGenerating = false;
        }
    }

    addErrorDream(message) {
        const dreamEl = document.createElement('div');
        dreamEl.className = 'dream-entry';
        dreamEl.style.background = 'rgba(244, 67, 54, 0.1)';
        dreamEl.style.color = '#f44336';
        
        const timestamp = new Date().toLocaleString();
        dreamEl.innerHTML = `<div style="font-size: 11px; margin-bottom: 6px;">🌙 ${timestamp}</div>⚠️ Dream interrupted: ${message}`;
        
        this.dreamsEl.insertBefore(dreamEl, this.dreamsEl.firstChild);
    }

    // Listen to Firebase for dreams from other instances
    listenToFirebase() {
        if (!window.firebase || firebase.apps.length === 0) return;
        
        const db = firebase.database();
        const dreamsRef = db.ref('dreams').limitToLast(1);
        
        dreamsRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            if (data && !this.isGenerating) {
                const dreamEl = document.createElement('div');
                dreamEl.className = 'dream-entry';
                dreamEl.style.opacity = '0.8';
                
                const timestamp = new Date(data.timestamp).toLocaleString();
                dreamEl.innerHTML = `<div style="color: #9c27b0; font-size: 11px; margin-bottom: 6px;">🌙 ${timestamp}</div>${data.text}`;
                
                // Check if not duplicate
                const existing = Array.from(this.dreamsEl.children).find(
                    el => el.textContent.includes(data.text)
                );
                
                if (!existing) {
                    this.dreamsEl.insertBefore(dreamEl, this.dreamsEl.firstChild);
                }
            }
        });
    }

    // Auto-generate dreams every 30-60 seconds
    startAutoGeneration() {
        const generate = () => {
            this.generateDream().then(() => {
                const delay = 30000 + Math.random() * 30000; // 30-60 seconds
                setTimeout(generate, delay);
            });
        };
        
        // Start after 5 seconds
        setTimeout(generate, 5000);
    }
}

// Initialize when ready
window.dreamsEngine = new DreamsEngine();
