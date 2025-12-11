import React, { useState } from 'react';
import Header from './components/Header.tsx';
import InputSection from './components/InputSection.tsx';
import ScriptOutput from './components/ScriptOutput.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { ScriptRequest, GeneratedContent, FilmStyle, PromptItem } from './types.ts';
import { generateScript } from './services/geminiService.ts';

const App: React.FC = () => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [currentStyle, setCurrentStyle] = useState<FilmStyle>(FilmStyle.CINEMATIC);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // REMOVED: useEffect checking for keys on mount. 
  // App now starts silently without nagging the user.

  const handleGenerateScript = async (request: ScriptRequest) => {
    // 1. Check for API Keys BEFORE starting
    const geminiKey = localStorage.getItem('GEMINI_API_KEY');
    const openaiKey = localStorage.getItem('OPENAI_API_KEY');

    if (!geminiKey && !openaiKey) {
        setIsSettingsOpen(true);
        setError("Vui lòng nhập API Key (Gemini hoặc OpenAI) để bắt đầu tạo kịch bản.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setContent(null);
    setCurrentStyle(request.style); // Save the style for later regeneration

    try {
      const result = await generateScript(request);
      setContent(result);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("MISSING_KEYS")) {
          // This catch block is a double-check, though the pre-check above should catch it first.
          setError("Vui lòng cài đặt API Key (Gemini hoặc OpenAI) để sử dụng.");
          setIsSettingsOpen(true);
      } else {
          setError("Đã xảy ra lỗi khi kết nối với AI (Gemini/OpenAI). Vui lòng kiểm tra lại API Key hoặc thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Callback to allow ScriptOutput to modify the script (Add/Edit scenes)
  const handleUpdateScript = (newScript: PromptItem[]) => {
      if (content) {
          setContent({
              ...content,
              script: newScript
          });
      }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 selection:bg-amber-500 selection:text-black overflow-hidden font-sans">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Input & Settings */}
        <aside className="w-[350px] md:w-[400px] flex-shrink-0 bg-[#0a0a0a] border-r border-gray-800 overflow-hidden z-10 shadow-xl flex flex-col">
          <div className="p-5 flex-1 flex flex-col h-full overflow-hidden">
             <div className="flex-1 min-h-0">
               <InputSection isLoading={isLoading} onSubmit={handleGenerateScript} />
             </div>
          </div>
        </aside>

        {/* Right Panel - Results */}
        <main className="flex-1 bg-[#0f0f0f] overflow-y-auto custom-scrollbar relative">
          <div className="p-8 w-full min-h-full flex flex-col">
            
            {/* Error Message */}
            {error && (
              <div className="w-full p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-center mb-6 animate-pulse">
                {error}
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="ml-2 underline hover:text-white font-bold"
                >
                    Nhập API Key ngay
                </button>
              </div>
            )}

            {/* Empty State / Welcome Message */}
            {!content && !isLoading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 space-y-4 select-none">
                 <div className="w-24 h-24 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                 </div>
                 <h3 className="text-2xl font-light text-gray-300">Kịch bản của bạn sẽ xuất hiện tại đây</h3>
                 <p className="text-sm text-gray-500 max-w-xs">Hãy nhập ý tưởng và bấm "Tạo Kịch Bản" ở cột bên trái.</p>
              </div>
            )}

            {/* Loading State Overlay */}
            {isLoading && (
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-amber-500 font-bold tracking-widest animate-pulse">AI ĐANG SUY NGHĨ & VIẾT KỊCH BẢN...</p>
                  <p className="text-xs text-gray-500 mt-2">Đang sử dụng Gemini hoặc OpenAI</p>
               </div>
            )}

            {/* Result Content */}
            {content && (
                <ScriptOutput 
                    content={content} 
                    style={currentStyle}
                    onUpdateScript={handleUpdateScript} 
                />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;