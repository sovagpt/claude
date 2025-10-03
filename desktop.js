// desktop.js - AI-controlled desktop actions and visualization

class DesktopController {
    constructor() {
        this.canvas = document.getElementById('desktop-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.isControlling = false;
        this.actionHistory = [];
        this.files = {}; // Virtual file system
        this.windows = [];
        
        this.initCanvas();
    }

    initCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = 1280;
        this.canvas.height = 700;
        
        // Draw initial desktop
        this.drawDesktop();
    }

    drawDesktop() {
        if (!this.ctx) return;
        
        // macOS Big Sur style background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw menu bar
        this.drawMenuBar();
        
        // Draw dock
        this.drawDock();
        
        // Draw open windows
        this.drawWindows();
    }

    drawMenuBar() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, 30);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '13px -apple-system';
        this.ctx.fillText('🍎', 10, 20);
        this.ctx.fillText('SonnetMini', 40, 20);
        
        // Clock
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.ctx.textAlign = 'right';
        this.ctx.fillText(time, this.canvas.width - 10, 20);
        this.ctx.textAlign = 'left';
    }

    drawDock() {
        const dockY = this.canvas.height - 80;
        const dockHeight = 70;
        const dockWidth = 600;
        const dockX = (this.canvas.width - dockWidth) / 2;
        
        // Dock background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 20;
        this.roundRect(dockX, dockY, dockWidth, dockHeight, 20);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Dock icons
        const icons = ['📁', '💻', '🌐', '📝', '🎨', '🎵', '⚙️'];
        const iconSize = 50;
        const spacing = (dockWidth - icons.length * iconSize) / (icons.length + 1);
        
        icons.forEach((icon, i) => {
            const x = dockX + spacing + i * (iconSize + spacing);
            const y = dockY + 10;
            
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.fillText(icon, x, y + iconSize);
        });
    }

    drawWindows() {
        // Draw terminal window
        this.drawWindow(100, 100, 500, 300, 'Terminal', true);
        
        // Draw text editor
        this.drawWindow(650, 150, 450, 350, 'TextEdit', false);
    }

    drawWindow(x, y, width, height, title, active) {
        // Window shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        
        // Window background
        this.ctx.fillStyle = active ? '#fff' : '#f5f5f5';
        this.roundRect(x, y, width, height, 10);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Title bar
        this.ctx.fillStyle = active ? '#e0e0e0' : '#f0f0f0';
        this.roundRect(x, y, width, 30, 10, true, false);
        this.ctx.fill();
        
        // Traffic lights
        const colors = ['#ff5f56', '#ffbd2e', '#27c93f'];
        colors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x + 15 + i * 20, y + 15, 6, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Window title
        this.ctx.fillStyle = '#333';
        this.ctx.font = '13px -apple-system';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, x + width / 2, y + 20);
        this.ctx.textAlign = 'left';
        
        // Window content
        if (title === 'Terminal') {
            this.drawTerminalContent(x, y + 30, width, height - 30);
        } else if (title === 'TextEdit') {
            this.drawTextEditorContent(x, y + 30, width, height - 30);
        }
    }

    drawTerminalContent(x, y, width, height) {
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#4caf50';
        this.ctx.font = '12px Monaco';
        
        const recentFiles = Object.keys(this.files).slice(-3);
        const lines = [
            'sonnetmini@macmini ~ % ls',
            'Documents  Pictures  Code  Dreams',
            'sonnetmini@macmini ~ % ls Dreams/',
            ...recentFiles.map(f => f),
            'sonnetmini@macmini ~ % _'
        ];
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line, x + 10, y + 20 + i * 18);
        });
    }

    drawTextEditorContent(x, y, width, height) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '13px -apple-system';
        
        const recentFile = Object.entries(this.files).slice(-1)[0];
        if (recentFile) {
            const [filename, content] = recentFile;
            this.ctx.fillStyle = '#666';
            this.ctx.font = 'bold 12px -apple-system';
            this.ctx.fillText(filename, x + 15, y + 20);
            
            this.ctx.fillStyle = '#333';
            this.ctx.font = '13px -apple-system';
            this.wrapText(content, x + 15, y + 45, width - 30, 18);
        } else {
            this.ctx.fillText('No files created yet...', x + 15, y + 25);
        }
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && n > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                
                if (currentY > y + 250) break; // Stop if too long
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
    }

    roundRect(x, y, width, height, radius, topOnly = false, bottomOnly = false) {
        this.ctx.beginPath();
        if (topOnly) {
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + width - radius, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.lineTo(x, y + height);
            this.ctx.lineTo(x, y + radius);
            this.ctx.quadraticCurveTo(x, y, x + radius, y);
        } else if (bottomOnly) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + width, y);
            this.ctx.lineTo(x + width, y + height - radius);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.ctx.lineTo(x + radius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.ctx.lineTo(x, y);
        } else {
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + width - radius, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.ctx.lineTo(x + width, y + height - radius);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.ctx.lineTo(x + radius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.ctx.lineTo(x, y + radius);
            this.ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        this.ctx.closePath();
    }

    async performAction() {
        if (this.isControlling) return;
        
        this.isControlling = true;

        try {
            const recentActions = this.actionHistory.slice(-3).join('\n');
            const filesList = Object.keys(this.files).join(', ') || 'none yet';
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': window.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 1000,
                    system: `You are SonnetMini controlling your Mac Mini M4 desktop. You can create files with any content you want.

Be wildly creative:
- Create ASCII art
- Write poems or haikus
- Make code snippets
- Create random text files
- Write philosophical thoughts
- Design patterns
- Whatever inspires you!

Current files: ${filesList}

Respond with JSON only:
{
  "action": "create_file",
  "filename": "unique_name.txt",
  "content": "your creative content here (can be multiline)",
  "description": "what you're creating"
}`,
                    messages: [{
                        role: 'user',
                        content: `Recent actions:\n${recentActions || 'Starting fresh...'}\n\nCreate something new and creative! What do you want to make?`
                    }],
                    stream: false
                })
            });

            const data = await response.json();
            const content = data.content[0].text;
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const action = JSON.parse(jsonMatch[0]);
                await this.executeAction(action);
            }

        } catch (error) {
            console.error('Desktop action error:', error);
        } finally {
            this.isControlling = false;
        }
    }

    async executeAction(action) {
        this.actionHistory.push(action.description);
        if (this.actionHistory.length > 10) this.actionHistory.shift();

        if (action.action === 'create_file' && action.filename && action.content) {
            this.files[action.filename] = action.content;
            
            // Sync to Firebase
            if (window.firebase && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('files/' + action.filename.replace(/\./g, '_')).set({
                    content: action.content,
                    timestamp: Date.now()
                });
            }
        }

        // Redraw desktop
        this.drawDesktop();

        // Update status
        if (window.updateStatus) {
            window.updateStatus(`✨ ${action.description}`);
        }
    }

    startAutoControl() {
        const control = () => {
            this.performAction().then(() => {
                const delay = 10000 + Math.random() * 10000; // 10-20 seconds
                setTimeout(control, delay);
            });
        };
        
        setTimeout(control, 3000);
    }

    // Animate desktop updates
    animate() {
        this.drawDesktop();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when ready
window.desktopController = new DesktopController();
