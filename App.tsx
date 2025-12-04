
import React, { useState } from 'react';
import { EXAM_DATA } from './constants';
import { Category } from './types';
import MetricCard from './components/MetricCard';
import AIChat from './components/AIChat';
import { Activity, LayoutGrid, List } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Object.values(Category)];

  const filteredData = selectedCategory === 'Todos'
    ? EXAM_DATA
    : EXAM_DATA.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Meus Exames</h1>
                <p className="text-xs text-slate-500">Comparativo Set/25 vs Dez/25</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alerts Section - Highlighting Critical Changes */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
               <h3 className="text-emerald-800 font-semibold mb-1">Boas Notícias</h3>
               <p className="text-sm text-emerald-700">
                 Melhora significativa nos <strong>Triglicerídeos</strong> e <strong>Glicemia</strong>. 
                 Função renal (Creatinina/Ureia) e eletrólitos permanecem estáveis e normais.
               </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col justify-center">
               <h3 className="text-rose-800 font-semibold mb-1">Pontos de Atenção</h3>
               <p className="text-sm text-rose-700 space-y-1">
                 <span className="block">• <strong>CPK muito alto</strong> (1219 U/L) - possível lesão muscular.</span>
                 <span className="block">• <strong>Infecção Urinária</strong> detectada (E. Coli) em Dezembro.</span>
                 <span className="block">• <strong>Ferro Sérico baixo</strong> (44 mcg/dL) - atenção para anemia.</span>
               </p>
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visualização em Tabela"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Set/2025</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dez/2025</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Observação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 sm:hidden">Ref: {item.reference}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                        {item.reference} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.value1 !== null ? (
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status1.toLowerCase().includes('normal') || item.status1.toLowerCase().includes('negativo') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                             }`}>
                             {item.value1} {item.unit}
                             </span>
                        ) : (
                            <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.value2 !== null ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             item.status2.toLowerCase().includes('normal') || item.status2.toLowerCase().includes('negativo') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.value2} {item.unit}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
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
        )}

      </main>

      {/* Floating Chat */}
      <AIChat />
    </div>
  );
};

export default App;
