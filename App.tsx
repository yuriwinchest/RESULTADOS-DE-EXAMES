import React, { useState } from 'react';
import { EXAM_DATA } from './constants';
import { Category, ExamDataPoint } from './types';
import MetricCard from './components/MetricCard';
import AIChat from './components/AIChat';
import { Activity, LayoutGrid, List, Upload, FileText, Loader2 } from 'lucide-react';
import { analyzePdf } from './services/geminiService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // State for dynamic data
  const [examData, setExamData] = useState<ExamDataPoint[]>(EXAM_DATA);
  const [goodNews, setGoodNews] = useState<string[]>([
    "Melhora significativa nos **Triglicerídeos** e **Glicemia**.",
    "Função renal (Creatinina/Ureia) e eletrólitos permanecem estáveis e normais."
  ]);
  const [attentionPoints, setAttentionPoints] = useState<string[]>([
    "**CPK muito alto** (1219 U/L) - possível lesão muscular.",
    "**Infecção Urinária** detectada (E. Coli) em Dezembro.",
    "**Ferro Sérico baixo** (44 mcg/dL) - atenção para anemia."
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categories = ['Todos', ...Object.values(Category)];

  const filteredData = selectedCategory === 'Todos'
    ? examData
    : examData.filter(item => item.category === selectedCategory);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, envie apenas arquivos PDF.');
      return;
    }

    setIsAnalyzing(true);

    // Convert to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(',')[1];
      if (base64Data) {
        const result = await analyzePdf(base64Data);
        if (result) {
          setExamData(result.examData);
          setGoodNews(result.goodNews);
          setAttentionPoints(result.attentionPoints);
        } else {
          alert('Falha ao analisar o PDF. Verifique a chave de API ou o formato do arquivo.');
        }
      }
      setIsAnalyzing(false);
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo.');
      setIsAnalyzing(false);
    };
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Meus Exames</h1>
                <p className="text-xs text-slate-500">Comparativo e Análise IA v1.2</p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isAnalyzing}
              />
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isAnalyzing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Carregar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Alerts Section - Highlighting Critical Changes */}
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-emerald-900 font-bold text-lg">Boas Notícias</h3>
              </div>
              <div className="text-sm text-emerald-800 space-y-2 pl-1">
                {goodNews.map((item, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
            <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-rose-900 font-bold text-lg">Pontos de Atenção</h3>
              </div>
              <div className="text-sm text-rose-800 space-y-2 pl-1">
                {attentionPoints.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <p dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md transform scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Tabela"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {examData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum exame encontrado</h3>
            <p className="text-slate-500">Faça o upload de um PDF para começar.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.map((item) => (
                <MetricCard key={item.id} data={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Exame</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Referência</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Anterior</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Atual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500 sm:hidden">Ref: {item.reference}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                          {item.reference} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.value1 !== null ? (
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status1.toLowerCase().includes('normal') || item.status1.toLowerCase().includes('negativo') ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-800'
                              }`}>
                              {item.value1} {item.unit}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                          {item.date1 && <div className="text-[10px] text-slate-400 mt-1">{item.date1}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.value2 !== null ? (
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status2.toLowerCase().includes('normal') || item.status2.toLowerCase().includes('negativo') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                              {item.value2} {item.unit}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                          {item.date2 && <div className="text-[10px] text-slate-400 mt-1">{item.date2}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                          {item.observation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

      </main>

      {/* Floating Chat */}
      <AIChat />
    </div>
  );
};

export default App;
