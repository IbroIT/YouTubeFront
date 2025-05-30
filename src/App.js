import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSummary('');
    
    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/summarize' 
        : '/summarize';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.type === 'NO_SUBTITLES') {
          throw new Error(errorData.error[language] || 'Subtitles disabled');
        }
        else if (errorData.type === 'LANGUAGE_NOT_AVAILABLE') {
          throw new Error(
            `${errorData.error[language]}. ${language === 'ru' ? 'Доступные языки:' : 'Available languages:'} 
            ${errorData.available_languages?.join(', ') || 'none'}`
          );
        }
        else {
          throw new Error(errorData.error?.[language] || 'Unknown error');
        }
      }
      
      const data = await response.json();
      setSummary(data.summary);
      
    } catch (err) {
      setError(err.message);
      
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: "YouTube Video Summarizer",
      description: "Get concise summaries of YouTube videos",
      placeholder: "Enter YouTube URL...",
      button: "Get Summary",
      loading: "Processing...",
      errorDefault: "Failed to connect to server",
      summaryTitle: "Video Summary"
    },
    ru: {
      title: "Суммаризатор YouTube видео",
      description: "Получайте краткие конспекты YouTube видео",
      placeholder: "Введите URL YouTube...",
      button: "Получить конспект",
      loading: "Обработка...",
      errorDefault: "Ошибка соединения с сервером",
      summaryTitle: "Конспект видео"
    }
  };

  const t = translations[language];

  return (
    <div className="app">
      <header className="header">
        <h1>{t.title}</h1>
        <p>{t.description}</p>
      </header>
      
      <main className="main-content">
        <div className="language-switcher">
          <button 
            onClick={() => setLanguage('en')} 
            className={language === 'en' ? 'active' : ''}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('ru')} 
            className={language === 'ru' ? 'active' : ''}
          >
            Русский
          </button>
        </div>

        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.placeholder}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? t.loading : t.button}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            {error}
            {(error.includes('Доступные языки') || error.includes('Available languages')) && (
              <button 
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="try-another-language"
              >
                {language === 'ru' ? 'Попробовать английский' : 'Try Russian'}
              </button>
            )}
          </div>
        )}
        
        {summary && (
          <div className="summary-container">
            <h2>{t.summaryTitle}</h2>
            <div className="summary-content">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index}>
                  {paragraph.startsWith('#') ? (
                    <strong>{paragraph.replace(/^#+\s*/, '')}</strong>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} YouTube Summary App</p>
      </footer>
    </div>
  );
}

export default App;