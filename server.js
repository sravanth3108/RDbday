const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// File to store wishes
const WISHES_FILE = path.join(__dirname, 'wishes.json');

// Initialize wishes file if it doesn't exist
if (!fs.existsSync(WISHES_FILE)) {
  fs.writeFileSync(WISHES_FILE, JSON.stringify([], null, 2));
}

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to save wishes
app.post('/api/save-wish', (req, res) => {
  try {
    const { wish, timestamp } = req.body;
    
    // Read existing wishes
    let wishes = [];
    if (fs.existsSync(WISHES_FILE)) {
      const data = fs.readFileSync(WISHES_FILE, 'utf8');
      wishes = JSON.parse(data);
    }
    
    // Add new wish
    wishes.push({
      wish,
      timestamp,
      id: Date.now()
    });
    
    // Save to file
    fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));
    
    res.json({ success: true, message: 'Wish saved!', totalWishes: wishes.length });
  } catch (error) {
    console.error('Error saving wish:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to download wishes.json file
app.get('/api/download-wishes', (req, res) => {
  try {
    if (fs.existsSync(WISHES_FILE)) {
      res.download(WISHES_FILE, 'wishes.json');
    } else {
      res.json({ message: 'No wishes file yet. Make some wishes first!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check wishes status
app.get('/api/check-wishes', (req, res) => {
  try {
    let wishes = [];
    if (fs.existsSync(WISHES_FILE)) {
      const data = fs.readFileSync(WISHES_FILE, 'utf8');
      wishes = JSON.parse(data);
    }
    
    res.json({
      fileExists: fs.existsSync(WISHES_FILE),
      totalWishes: wishes.length,
      wishes: wishes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin page to view all wishes
app.get('/wishes', (req, res) => {
  try {
    let wishes = [];
    if (fs.existsSync(WISHES_FILE)) {
      const data = fs.readFileSync(WISHES_FILE, 'utf8');
      wishes = JSON.parse(data);
    }
    
    const wishesHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>All Birthday Wishes 💕</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cormorant+Garamond:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Cormorant Garamond', serif;
                background: linear-gradient(135deg, #fef9f3 0%, #f5e6d3 100%);
                color: #3d2817;
                padding: 40px 20px;
                min-height: 100vh;
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
            }
            
            h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-align: center;
                color: #3d2817;
            }
            
            .back-link {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .back-link a {
                color: #d4a574;
                text-decoration: none;
                font-size: 1.1rem;
                transition: color 0.3s;
            }
            
            .back-link a:hover {
                color: #d8888c;
            }
            
            .wish-count {
                text-align: center;
                font-size: 1.2rem;
                margin-bottom: 30px;
                color: #d8888c;
            }
            
            .wishes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .wish-card {
                background: rgba(255, 255, 255, 0.9);
                padding: 25px;
                border-radius: 15px;
                border-left: 4px solid #d8888c;
                box-shadow: 0 4px 15px rgba(212, 165, 116, 0.1);
                transition: all 0.3s ease;
            }
            
            .wish-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(212, 165, 116, 0.2);
            }
            
            .wish-text {
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 15px;
                color: #3d2817;
            }
            
            .wish-info {
                font-size: 0.9rem;
                color: #d4a574;
                font-style: italic;
            }
            
            .visitor-name {
                font-weight: 500;
                color: #d8888c;
                margin-bottom: 5px;
            }
            
            .wish-time {
                color: #b8956a;
                font-size: 0.85rem;
            }
            
            .no-wishes {
                text-align: center;
                padding: 60px 20px;
                font-size: 1.2rem;
                color: #d4a574;
            }
            
            .export-btn {
                display: block;
                margin: 30px auto;
                padding: 12px 30px;
                background: linear-gradient(135deg, #d8888c 0%, #d4a574 100%);
                color: white;
                border: none;
                border-radius: 50px;
                font-family: 'Cormorant Garamond', serif;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(216, 136, 140, 0.3);
            }
            
            .export-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(216, 136, 140, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>💕 All Birthday Wishes 💕</h1>
            <div class="back-link">
                <a href="/">← Back to Birthday Page</a>
            </div>
            
            <div class="wish-count">
                Total wishes received: <strong>${wishes.length}</strong> 🎉
            </div>
            
            ${wishes.length === 0 ? `
                <div class="no-wishes">
                    No wishes yet! 🎂 Share the birthday link with friends and family to get wishes!
                </div>
            ` : `
                <button class="export-btn" onclick="downloadWishes()">📥 Download All Wishes</button>
                <div class="wishes-grid">
                    ${wishes.reverse().map((w, index) => `
                        <div class="wish-card">
                            <div class="wish-text">"${w.wish}"</div>
                            <div class="wish-info">
                                <div class="wish-time">💝 ${new Date(w.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
        
        <script>
            function downloadWishes() {
                const wishes = ${JSON.stringify(wishes)};
                let text = 'Birthday Wishes\\n\\n';
                
                wishes.forEach((w, i) => {
                    text += (i + 1) + '. "' + w.wish + '"\\n';
                    text += '   - ' + w.visitorName + ' (' + new Date(w.timestamp).toLocaleString() + ')\\n\\n';
                });
                
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', 'birthday-wishes.txt');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(wishesHTML);
  } catch (error) {
    res.status(500).send('Error loading wishes: ' + error.message);
  }
});

// 404 handler
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎉 Birthday website is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the website`);
  console.log(`Visit http://localhost:${PORT}/wishes to see all wishes`);
});
