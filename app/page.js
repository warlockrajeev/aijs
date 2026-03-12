"use client";

import { useState, useEffect } from 'react';

const API_BASE = "/api/journal";
const USER_ID = "123";

// Icons as SVG components for a professional look
const Icons = {
  Forest: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="m5 13 7-6 7 6"/><path d="m5 18 7-6 7 6"/><path d="M12 2v5"/></svg>
  ),
  Ocean: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
  ),
  Mountain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
  ),
  Analyze: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>
  ),
  Save: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  )
};

export default function JournalPage() {
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");
  const [entries, setEntries] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [expandedEntryId, setExpandedEntryId] = useState(null);

  useEffect(() => {
    fetchEntries();
    fetchInsights();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_BASE}/${USER_ID}`);
      const data = await res.json();
      setEntries(data);
    } catch (err) { console.error(err); }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${API_BASE}/insights/${USER_ID}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) { console.error(err); }
  };

  const toggleEntry = (id) => {
    setExpandedEntryId(prev => prev === id ? null : id);
  };

  const handleAnalyze = async () => {
    if (!text) return;
    setAnalyzing(true);
    setAnalysis(null);
    let fullResponse = "";
    
    try {
      const response = await fetch(`${API_BASE}/analyze-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const { chunk: textChunk } = JSON.parse(data);
              fullResponse += textChunk;
              
              // We try to show the progress. Since it's JSON, it might look messy.
              // Let's try to extract the summary if possible, or just show the raw accumulation
              setAnalysis({ 
                summary: fullResponse.includes('"summary":') 
                  ? fullResponse.split('"summary":')[1].replace(/["}\s]+$/, "").replace(/^["\s]+/, "")
                  : "Analyzing feelings...",
                isStreaming: true 
              });
            } catch (e) { /* partial json */ }
          }
        }
      }

      // Final attempt to parse complete JSON
      try {
        const cleaned = fullResponse.replace(/```json|```/g, "").trim();
        const finalData = JSON.parse(cleaned);
        setAnalysis(finalData);
      } catch (err) {
        console.error("Final parse error:", err);
      }
    } catch (err) {
      alert("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, ambience, text })
      });
      if (res.ok) {
        setText("");
        setAnalysis(null);
        fetchEntries();
        fetchInsights();
      }
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" data-ambience={ambience}>
      <div className="main-wrapper">
        <header>
          <h1>Nature Whisper</h1>
          <p>An AI-Assisted Journey through your Inner Wilderness</p>
        </header>

        <main className="dashboard-layout">
          <div className="left-column">
            <section className="glass-card">
              <h2><Icons.Save /> Capture Your Session</h2>
              <form onSubmit={handleSubmit}>
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="The wind was howling through the pines, and for a moment, everything felt still..."
                />
                <div className="controls-group">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select value={ambience} onChange={(e) => setAmbience(e.target.value)}>
                      <option value="forest">🌲 Forest Session</option>
                      <option value="ocean">🌊 Ocean Session</option>
                      <option value="mountain">🏔️ Mountain Session</option>
                    </select>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleAnalyze} 
                      disabled={analyzing || !text}
                    >
                      {analyzing ? <div className="loading-spinner" /> : <Icons.Analyze />}
                      {analyzing ? "Exploring..." : "Analyze Mood"}
                    </button>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading || !text}>
                    {loading ? <div className="loading-spinner" /> : <Icons.Save />}
                    {loading ? "Recording..." : "Save Entry"}
                  </button>
                </div>
              </form>

              {analysis && (
                <div className={`analysis-results ${analysis.isStreaming ? 'streaming' : ''}`}>
                  <h3>AI Interpretation {analysis.isStreaming && "..."}</h3>
                  {!analysis.isStreaming && analysis.emotion && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="ambience-tag" style={{ background: 'var(--primary)', color: '#fff' }}>
                        {analysis.emotion}
                      </span>
                    </div>
                  )}
                  <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    {analysis.summary}
                  </p>
                  {!analysis.isStreaming && analysis.keywords && (
                    <div className="tag-cloud">
                      {analysis.keywords?.map(kw => (
                        <span key={kw} className="tag">#{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{ paddingLeft: '1rem' }}>Recent Reflections</h2>
              {entries.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>Your journal is empty. Take a moment to reflect.</p>
                </div>
              )}
              {entries.map(entry => {
                const isExpanded = expandedEntryId === entry._id;
                return (
                  <div 
                    key={entry._id} 
                    className="entry-card" 
                    data-card-ambience={entry.ambience}
                    onClick={() => toggleEntry(entry._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="entry-header">
                      <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                      <span className="ambience-tag">{entry.ambience}</span>
                    </div>
                    <p style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>{entry.text}</p>
                    
                    {isExpanded && entry.summary && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '1.25rem', 
                        background: 'rgba(255, 255, 255, 0.6)', 
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--primary)',
                        animation: 'fadeIn 0.3s ease-out'
                      }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Interpretation</h4>
                        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: '1.6' }}>{entry.summary}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.8, marginTop: '1rem' }}>
                      <span className="tag">{entry.emotion}</span>
                      {entry.keywords?.map(kw => <span key={kw} className="tag">#{kw}</span>)}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          <aside className="right-column">
            <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
              <h2>Insights Overview</h2>
              {insights ? (
                <div className="insights-container">
                  <div className="stat-box">
                    <span className="stat-label">Total Sessions</span>
                    <span className="stat-value">{insights.totalEntries}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Peak Vibe</span>
                    <span className="stat-value" style={{ textTransform: 'capitalize' }}>
                      {insights.topEmotion !== "None" ? insights.topEmotion : "—"}
                    </span>
                  </div>
                  <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                    <span className="stat-label">Favorite Sanctuary</span>
                    <span className="stat-value" style={{ textTransform: 'capitalize' }}>
                      {insights.mostUsedAmbience !== "None" ? insights.mostUsedAmbience : "—"}
                    </span>
                  </div>
                  <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                    <span className="stat-label">Mental Landscape</span>
                    <div className="tag-cloud" style={{ justifyContent: 'center' }}>
                      {insights.recentKeywords.length > 0 ? (
                        insights.recentKeywords.map(kw => (
                          <span key={kw} className="tag">#{kw}</span>
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not enough data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading-spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '30px', height: '30px', margin: '0 auto' }} />
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
      <style jsx global>{`
        [data-ambience="forest"] .entry-card[data-card-ambience="forest"] { border-left-color: #2d5a27; }
        [data-ambience="ocean"] .entry-card[data-card-ambience="ocean"] { border-left-color: #0e7490; }
        [data-ambience="mountain"] .entry-card[data-card-ambience="mountain"] { border-left-color: #6366f1; }
        
        .entry-card[data-card-ambience="forest"] { border-left-color: #2d5a27; }
        .entry-card[data-card-ambience="ocean"] { border-left-color: #0e7490; }
        .entry-card[data-card-ambience="mountain"] { border-left-color: #6366f1; }
      `}</style>
    </div>
  );
}
