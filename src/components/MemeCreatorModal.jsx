import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function MemeCreatorModal({ onClose, onSave, currentUser }) {
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Canvas and Image elements
  const canvasRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);

  // Meme contents (Unified text elements)
  const [caption, setCaption] = useState(""); // Title of the meme post
  const [elements, setElements] = useState([
    { id: '1', type: 'text', text: 'טקסט עליון', x: 50, y: 15, fontSize: 36, color: '#ffffff', font: 'Secular One', stylePreset: 'classic' },
    { id: '2', type: 'text', text: 'טקסט תחתון', x: 50, y: 85, fontSize: 36, color: '#ffffff', font: 'Secular One', stylePreset: 'classic' }
  ]);
  
  // Sidebar Tab and Selection state (Pro Canva-style)
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'text'
  const [selectedId, setSelectedId] = useState('1');
  const [dragId, setDragId] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Fetch templates from Imgflip API
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await fetch('https://api.imgflip.com/get_memes');
        const json = await res.json();
        if (json.success) {
          setTemplates(json.data.memes);
          // Set default template
          if (json.data.memes.length > 0) {
            handleSelectTemplate(json.data.memes[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching meme templates:", err);
        toast.error("שגיאה בטעינת תבניות מהאינטרנט.");
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Redraw canvas when bgImage, elements or selection changes
  useEffect(() => {
    if (bgImage) {
      drawMeme();
    }
  }, [bgImage, elements, selectedId]);

  // Redraw canvas when Google Fonts finish loading
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (bgImage) {
          drawMeme();
        }
      });
    }
  }, [bgImage]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    const img = new Image();
    img.crossOrigin = 'anonymous'; // critical for canvas export
    img.onload = () => {
      setBgImage(img);
      // Auto switch to text editing tab so users can start typing immediately
      setActiveTab('text');
    };
    img.onerror = () => {
      toast.error("שגיאה בטעינת תמונת התבנית.");
    };
    img.src = template.url;
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setSelectedTemplate({ name: "תמונה שהועלתה", url: event.target.result });
          setBgImage(img);
          // Auto switch to text tab
          setActiveTab('text');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset styler
  const applyPreset = (presetName) => {
    if (!selectedId) {
      toast.error("אנא בחר תיבת טקסט תחילה!");
      return;
    }

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        if (presetName === 'classic') {
          return { ...el, font: 'Secular One', color: '#ffffff', stylePreset: 'classic', fontSize: 36 };
        } else if (presetName === 'banner') {
          return { ...el, font: 'Rubik', color: '#000000', stylePreset: 'banner', fontSize: 28 };
        } else if (presetName === 'modern') {
          return { ...el, font: 'Fredoka', color: '#e65100', stylePreset: 'modern', fontSize: 36 };
        }
      }
      return el;
    }));
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;
    const ctx = canvas.getContext('2d');

    // Scale canvas dynamically to fit 600px width and maintain aspect ratio
    const targetWidth = 600;
    const targetHeight = (bgImage.height / bgImage.width) * targetWidth;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw background image
    ctx.drawImage(bgImage, 0, 0, targetWidth, targetHeight);

    // Draw text elements
    elements.forEach(el => {
      const xPx = (el.x / 100) * targetWidth;
      const yPx = (el.y / 100) * targetHeight;

      ctx.save();

      // Configure font
      ctx.font = `bold ${el.fontSize}px "${el.font || 'Secular One'}", Fredoka, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(el.text).width;
      const textHeight = el.fontSize;

      // Draw banner background if applicable
      if (el.stylePreset === 'banner') {
        const paddingX = 14;
        const paddingY = 8;
        ctx.fillStyle = '#ffffff'; // White strip background
        ctx.fillRect(
          xPx - textWidth / 2 - paddingX,
          yPx - textHeight / 2 - paddingY,
          textWidth + paddingX * 2,
          textHeight + paddingY * 2
        );
      }

      // Draw text
      if (el.stylePreset === 'classic') {
        ctx.fillStyle = el.color || '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, el.fontSize / 6);
        ctx.strokeText(el.text, xPx, yPx);
        ctx.fillText(el.text, xPx, yPx);
      } else {
        ctx.fillStyle = el.color || '#000000';
        ctx.fillText(el.text, xPx, yPx);
      }

      ctx.restore();
    });

    // Draw Bounding Box and Resize Handles for the selected element
    if (selectedId) {
      const activeEl = elements.find(el => el.id === selectedId);
      if (activeEl) {
        const xPx = (activeEl.x / 100) * targetWidth;
        const yPx = (activeEl.y / 100) * targetHeight;

        ctx.save();
        ctx.font = `bold ${activeEl.fontSize}px "${activeEl.font || 'Secular One'}", Fredoka, Arial`;
        const textWidth = ctx.measureText(activeEl.text).width;
        const textHeight = activeEl.fontSize;

        const padding = 8;
        const rectX = xPx - textWidth / 2 - padding;
        const rectY = yPx - textHeight / 2 - padding;
        const rectW = textWidth + padding * 2;
        const rectH = textHeight + padding * 2;

        // Draw Bounding Box (dashed outline)
        ctx.strokeStyle = '#818cf8'; // Indigo color
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(rectX, rectY, rectW, rectH);
        ctx.setLineDash([]); // Reset line dash

        // Draw resize handles (4 corners)
        ctx.fillStyle = '#818cf8';
        const handleSize = 8;
        ctx.fillRect(rectX - handleSize / 2, rectY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(rectX + rectW - handleSize / 2, rectY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(rectX - handleSize / 2, rectY + rectH - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(rectX + rectW - handleSize / 2, rectY + rectH - handleSize / 2, handleSize, handleSize);

        ctx.restore();
      }
    }
  };

  // Drag & Resize math helpers
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handleStart = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePos(e);

    // 1. Check if we clicked on any corner resize handle of the selected element
    if (selectedId) {
      const activeEl = elements.find(el => el.id === selectedId);
      if (activeEl) {
        const xPx = (activeEl.x / 100) * canvas.width;
        const yPx = (activeEl.y / 100) * canvas.height;

        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.font = `bold ${activeEl.fontSize}px "${activeEl.font || 'Secular One'}", Fredoka, Arial`;
        const textWidth = ctx.measureText(activeEl.text).width;
        const textHeight = activeEl.fontSize;
        ctx.restore();

        const padding = 8;
        const rectX = xPx - textWidth / 2 - padding;
        const rectY = yPx - textHeight / 2 - padding;
        const rectW = textWidth + padding * 2;
        const rectH = textHeight + padding * 2;

        const handles = [
          { x: rectX, y: rectY }, // Top-Left
          { x: rectX + rectW, y: rectY }, // Top-Right
          { x: rectX, y: rectY + rectH }, // Bottom-Left
          { x: rectX + rectW, y: rectY + rectH } // Bottom-Right
        ];

        const handleRadius = 15; // touch target size
        const clickedHandle = handles.some(h => 
          Math.sqrt((pos.x - h.x) ** 2 + (pos.y - h.y) ** 2) < handleRadius
        );

        if (clickedHandle) {
          if (e.cancelable) e.preventDefault();
          setIsResizing(true);
          return;
        }
      }
    }

    // 2. Check if we clicked inside any text body to select/drag it
    let foundId = null;
    let minDistance = 45;

    elements.forEach(el => {
      const elX = (el.x / 100) * canvas.width;
      const elY = (el.y / 100) * canvas.height;
      const dist = Math.sqrt((pos.x - elX) ** 2 + (pos.y - elY) ** 2);
      if (dist < minDistance) {
        minDistance = dist;
        foundId = el.id;
      }
    });

    if (foundId) {
      if (e.cancelable) e.preventDefault();
      setSelectedId(foundId);
      setDragId(foundId);
      // Auto switch to text editing tab
      setActiveTab('text');
    } else {
      // Clicked on blank space -> deselect
      setSelectedId(null);
    }
  };

  const handleMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePos(e);

    // 1. Handle Resize
    if (isResizing && selectedId) {
      if (e.cancelable) e.preventDefault();
      const activeEl = elements.find(el => el.id === selectedId);
      if (activeEl) {
        const elX = (activeEl.x / 100) * canvas.width;
        const elY = (activeEl.y / 100) * canvas.height;
        // Distance from center of text determines size
        const dist = Math.sqrt((pos.x - elX) ** 2 + (pos.y - elY) ** 2);
        
        // Map distance to reasonable font sizes (14px - 80px)
        const newSize = Math.max(14, Math.min(80, Math.round(dist * 0.7)));
        
        setElements(prev => prev.map(el => 
          el.id === selectedId ? { ...el, fontSize: newSize } : el
        ));
      }
      return;
    }

    // 2. Handle Drag
    if (dragId) {
      if (e.cancelable) e.preventDefault();
      const pctX = Math.max(0, Math.min(100, (pos.x / canvas.width) * 100));
      const pctY = Math.max(0, Math.min(100, (pos.y / canvas.height) * 100));

      setElements(prev => prev.map(el => {
        if (el.id === dragId) {
          return { ...el, x: Math.round(pctX), y: Math.round(pctY) };
        }
        return el;
      }));
    }
  };

  const handleEnd = () => {
    setDragId(null);
    setIsResizing(false);
  };

  // Add textbox element
  const handleAddTextbox = () => {
    const newId = (Date.now() + Math.random()).toString();
    setElements(prev => [
      ...prev,
      {
        id: newId,
        type: 'text',
        text: 'טקסט חדש',
        x: 50,
        y: 50,
        fontSize: 32,
        color: '#ffffff',
        font: 'Secular One',
        stylePreset: 'classic'
      }
    ]);
    setSelectedId(newId);
  };

  // Delete element
  const handleDeleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // Update element fields
  const handleUpdateElement = (id, fields) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...fields } : el));
  };

  // Export and Save Meme
  const handleSaveSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;

    // Deselect active textbox before exporting to avoid rendering bounding box in output image
    setSelectedId(null);
    
    // Tiny delay to allow state update to draw canvas without bounding box
    setPublishing(true);
    setTimeout(async () => {
      try {
        const base64Url = canvas.toDataURL('image/png');
        await onSave(base64Url, caption);
        onClose();
      } catch (err) {
        console.error("Error saving meme:", err);
        toast.error("שגיאה בשמירת המים. נא לוודא חיבור תקין.");
      } finally {
        setPublishing(false);
      }
    }, 50);
  };

  // Filter templates based on search
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeElement = elements.find(el => el.id === selectedId);

  return (
    <div className="meme-modal-overlay" onClick={onClose}>
      <div className="meme-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="meme-modal-header">
          <h3>🎭 מחולל המימים המקצועי</h3>
          <button className="close-modal-btn" onClick={onClose} title="סגור">✕</button>
        </div>

        {/* Workspace */}
        <div className="meme-creator-workspace">
          
          {/* Left Side: Preview & Canvas */}
          <div className="meme-creator-canvas-area">
            {bgImage ? (
              <div className="meme-preview-container">
                <div className="meme-canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    className="meme-canvas"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                  />
                </div>
                <div className="canvas-drag-hint">
                  <span>👆</span> גררו את הטקסטים למקום, וגררו את <b>ידיות הפינה</b> לשינוי גודל ישיר!
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                <h4>בחר תבנית כדי להתחיל ליצור 🎨</h4>
              </div>
            )}
          </div>

          {/* Right Side: Canva-style Sidebar */}
          <div className="meme-creator-controls-area">
            
            {/* Sidebar Tab Selector */}
            <div className="sidebar-tabs">
              <button
                type="button"
                className={`sidebar-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                🖼️ בחירת תבנית
              </button>
              <button
                type="button"
                className={`sidebar-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                ✍️ כיתוב וטקסט
              </button>
            </div>

            {activeTab === 'templates' ? (
              /* TAB 1: TEMPLATES GRID */
              <div className="active-tab-content">
                <div className="control-group">
                  <label>בחירת תבנית מים</label>
                  <input
                    type="text"
                    placeholder="חפש תבניות..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="memes-search"
                    style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}
                  />

                  <div className="templates-grid">
                    {loadingTemplates ? (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>טוען תבניות...</div>
                    ) : (
                      filteredTemplates.slice(0, 30).map(t => (
                        <div
                          key={t.id}
                          className={`template-grid-item ${selectedTemplate?.id === t.id ? 'active' : ''}`}
                          onClick={() => handleSelectTemplate(t)}
                          title={t.name}
                        >
                          <img src={t.url} alt={t.name} className="template-grid-img" loading="lazy" />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Custom template upload */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="custom-template"
                      onChange={handleCustomImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="custom-template"
                      className="add-text-btn"
                      style={{ width: '100%', cursor: 'pointer', padding: '0.5rem', borderStyle: 'solid' }}
                    >
                      📁 העלו תמונה מותאמת מהמכשיר
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: TEXT EDITING CONTROLS */
              <div className="active-tab-content">
                {/* Quick Styling Presets */}
                <div className="control-group">
                  <label>ערכות עיצוב מהירות (Presets)</label>
                  <div className="presets-container">
                    <button
                      type="button"
                      onClick={() => applyPreset('classic')}
                      className={`preset-btn ${activeElement?.stylePreset === 'classic' ? 'active' : ''}`}
                    >
                      מם קלאסי 🗣️
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('banner')}
                      className={`preset-btn ${activeElement?.stylePreset === 'banner' ? 'active' : ''}`}
                    >
                      כותרת מלבן 📰
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('modern')}
                      className={`preset-btn ${activeElement?.stylePreset === 'modern' ? 'active' : ''}`}
                    >
                      טקסט נקי ✍️
                    </button>
                  </div>
                </div>

                {/* Title / Description */}
                <div className="control-group">
                  <label htmlFor="meme-caption-input">כותרת / כיתוב לפוסט (אופציונלי)</label>
                  <input
                    id="meme-caption-input"
                    type="text"
                    placeholder="למשל: כשמגיע יום שלישי במחנה..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="textbox-input"
                    maxLength={100}
                  />
                </div>

                {/* Elements Manager */}
                <div className="control-group" style={{ flexGrow: 1 }}>
                  <label>עריכת תיבות טקסט</label>
                  
                  <div className="textboxes-list">
                    {elements.map((el, idx) => {
                      const isSelected = el.id === selectedId;

                      return (
                        <div 
                          key={el.id} 
                          className={`textbox-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedId(el.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="textbox-header">
                            <span className="textbox-title" style={{ color: isSelected ? '#4f46e5' : '#475569' }}>
                              תיבה #{idx + 1} {isSelected ? '(בבחירה)' : ''}
                            </span>
                            <button 
                              className="textbox-delete-btn" 
                              onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}
                            >
                              מחק 🗑️
                            </button>
                          </div>

                          <input
                            type="text"
                            value={el.text}
                            onChange={(e) => handleUpdateElement(el.id, { text: e.target.value })}
                            onClick={(e) => e.stopPropagation()} // avoid parent selector triggers
                            className="textbox-input"
                            placeholder="הזן טקסט..."
                          />

                          <div className="textbox-styles" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={el.font || 'Secular One'}
                              onChange={(e) => handleUpdateElement(el.id, { font: e.target.value })}
                              className="textbox-style-select"
                              title="גופן"
                              style={{ flexGrow: 1 }}
                            >
                              <option value="Secular One">Secular One (ממים בלוק)</option>
                              <option value="Fredoka">Fredoka (עגלגל ומתוק)</option>
                              <option value="Rubik">Rubik (מודרני ונקי)</option>
                              <option value="Varela Round">Varela Round (פשוט ועגול)</option>
                              <option value="Arial">Arial (בסיסי)</option>
                            </select>

                            <select
                              value={el.fontSize}
                              onChange={(e) => handleUpdateElement(el.id, { fontSize: parseInt(e.target.value) })}
                              className="textbox-style-select"
                              title="גודל גופן"
                            >
                              <option value="20">20px</option>
                              <option value="28">28px</option>
                              <option value="36">36px</option>
                              <option value="48">48px</option>
                              <option value="60">60px</option>
                              <option value="72">72px</option>
                            </select>

                            <input
                              type="color"
                              value={el.color || '#ffffff'}
                              onChange={(e) => handleUpdateElement(el.id, { color: e.target.value })}
                              className="textbox-color-picker"
                              title="צבע גופן"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="add-text-btn" onClick={handleAddTextbox} style={{ marginTop: '0.5rem' }}>
                    ➕ הוסף תיבת טקסט חדשה
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="meme-modal-footer">
          <button 
            onClick={onClose} 
            className="logout-btn" 
            style={{ margin: 0, padding: '0.6rem 1.2rem', backgroundColor: '#e2e8f0', color: '#475569' }}
            disabled={publishing}
          >
            ביטול
          </button>
          
          <button
            onClick={handleSaveSubmit}
            disabled={publishing || !bgImage}
            className="create-meme-btn"
            style={{ margin: 0 }}
          >
            {publishing ? "מפרסם..." : "פרסם מימ לעולם! 🚀"}
          </button>
        </div>

      </div>
    </div>
  );
}
