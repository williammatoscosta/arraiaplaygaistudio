/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import {Folder, Calendar, Radio, LayoutGrid, Palette, Settings, Power, Play, Pause, SkipForward, Square} from 'lucide-react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { MediaItem } from './types';
import { LibraryItem } from './components/LibraryItem';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [library, setLibrary] = useState<MediaItem[]>([
      { id: '1', name: 'Áudios de Teste', duration: '00:10', isFolder: true, children: [
          { id: '1-1', name: 'Música de Teste 1', duration: '00:10', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
          { id: '1-2', name: 'Música de Teste 2', duration: '00:10', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
      ]},
      { id: '2', name: 'Áudios de Terceiros', duration: '00:00', isFolder: true },
      { id: '3', name: 'Hora Certa', duration: '00:00', isFolder: true },
      { id: '4', name: 'Músicas', duration: '00:00', isFolder: true },
      { id: '5', name: 'Podcasts', duration: '00:00', isFolder: true },
      { id: '6', name: 'Programetes', duration: '00:00', isFolder: true },
      { id: '7', name: 'Spots Comerciais', duration: '00:00', isFolder: true },
      { id: '8', name: 'Temperatura', duration: '00:00', isFolder: true },
      { id: '9', name: 'Vinhetas Gerais', duration: '00:00', isFolder: true },
  ]);
  const [playlist, setPlaylist] = useState<MediaItem[]>([
    { id: '101', name: 'Música de Teste 1', duration: '00:10', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '102', name: 'Música de Teste 2', duration: '00:10', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  ]);
  const [showModal, setShowModal] = useState<'folder' | 'audio' | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const { play, pause, stop, isPlaying } = useAudioPlayer();

  const handleNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      // Reproduz a nova faixa automaticamente
      const nextTrack = playlist[nextIndex];
      if (nextTrack && nextTrack.src) {
        play(nextTrack.src);
      }
    }
  };
  const [cartwall, setCartwall] = useState<({id: number, name: string} | null)[]>(() => {
      const saved = localStorage.getItem('roadic-cartwall');
      return saved ? JSON.parse(saved) : Array(16).fill(null);
  });

  const addCart = (index: number) => {
    const name = prompt('Nome do arquivo para o cart:');
    if (name) {
      const newCartwall = [...cartwall];
      newCartwall[index] = { id: Date.now(), name };
      setCartwall(newCartwall);
    }
  };

  const saveCartwall = () => {
    localStorage.setItem('roadic-cartwall', JSON.stringify(cartwall));
    alert('Cartwall salvo!');
  };

  const loadCartwall = () => {
    const saved = localStorage.getItem('roadic-cartwall');
    if (saved) setCartwall(JSON.parse(saved));
    else alert('Nenhum cartwall salvo encontrado.');
  };

  // Update useEffect for cartwall
  useEffect(() => {
    localStorage.setItem('roadic-library', JSON.stringify(library));
    localStorage.setItem('roadic-playlist', JSON.stringify(playlist));
    localStorage.setItem('roadic-cartwall', JSON.stringify(cartwall));
  }, [library, playlist, cartwall]);

  // ... (rest of component code)

  const addFolder = () => {
    const folderName = prompt('Nome da pasta:');
    if (folderName) {
      const newItems: MediaItem[] = [
        { id: Date.now().toString(), name: folderName, duration: '00:00' },
      ];
      setLibrary([...library, ...newItems]);
    }
  };

  const filteredLibrary = library.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { icon: Folder, label: 'Arquivo' },
    { icon: Calendar, label: 'Agendador' },
    { icon: Radio, label: 'Transmissão' },
    { icon: LayoutGrid, label: 'Utilitários' },
    { icon: Palette, label: 'Temas' },
    { icon: Settings, label: 'Opções' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <header className="h-14 border-b border-slate-800 flex items-center px-4 shrink-0 gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold">R</div>
          <h1 className="text-xl font-bold tracking-tight">ROADIC</h1>
        </div>
        
        <nav className="flex items-center gap-4 text-sm text-slate-300 flex-1 justify-around">
          {menuItems.map(item => (
            <button key={item.label} className="flex items-center gap-2 hover:text-white transition">
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="w-full h-full">
          <Panel defaultSize={20} minSize={15}>
            <aside className="w-full h-full border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-2">
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg mb-4">
                <button onClick={() => setShowModal('folder')} className="flex-1 bg-blue-600 py-2 rounded text-xs font-medium flex items-center justify-center gap-2">
                    <Folder size={14} /> Pasta
                </button>
                <button onClick={() => setShowModal('audio')} className="flex-1 hover:bg-slate-800 py-2 rounded text-xs font-medium flex items-center justify-center gap-2">
                    <Radio size={14} /> Áudio
                </button>
                <button className="flex-1 hover:bg-slate-800 py-2 rounded text-xs font-medium flex items-center justify-center">
                    <LayoutGrid size={14} />
                </button>
              </div>
              {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg border border-slate-700">
                          <h3 className="text-xl font-bold mb-4">Selecionar {showModal === 'folder' ? 'Categoria da Pasta' : 'Áudio'}</h3>
                          <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Músicas</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Áudios de Terceiros</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Hora Certa</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Jingles</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Notícias</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Outros</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Podcasts</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Previsão do Tempo</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Programas</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Programetes</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Spots Comerciais</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Temperatura</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Vinhetas Curtas</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Vinhetas de Passagem</button>
                            <button onClick={() => setShowModal(null)} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 transition text-sm">Vinhetas Gerais</button>
                          </div>
                          <button onClick={() => setShowModal(null)} className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Fechar</button>
                      </div>
                  </div>
              )}
              <div className="relative mb-4">
                <input 
                    type="text" 
                    placeholder="Buscar na biblioteca..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded py-2 px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <h2 className="text-sm font-semibold mb-2 text-slate-400 uppercase tracking-wider">BIBLIOTECA</h2>
              <div className="flex-1 overflow-y-auto">
                {filteredLibrary.map(item => (
                  <LibraryItem 
                    key={item.id} 
                    item={item} 
                    expandedIds={expandedIds} 
                    toggleExpand={toggleExpand} 
                  />
                ))}
              </div>
            </aside>
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-500 transition" />
          <Panel defaultSize={50} minSize={30}>
            <section 
              className="w-full h-full flex flex-col bg-slate-900"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const data = e.dataTransfer.getData('application/json');
                if (data) {
                  const newItem: MediaItem = JSON.parse(data);
                  setPlaylist([...playlist, newItem]);
                }
              }}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  {playlist[currentTrackIndex]?.name || 'Playlist'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 border-b border-slate-700">
                        <tr>
                            <th className="p-2 font-normal">#</th>
                            <th className="p-2 font-normal">Título</th>
                            <th className="p-2 font-normal">Artista</th>
                            <th className="p-2 font-normal text-right">Duração</th>
                            <th className="p-2 font-normal text-right">Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playlist.map((item, index) => (
                            <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800 transition">
                                <td className="p-2 text-slate-500">{String(index + 1).padStart(2, '0')}</td>
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2 text-slate-300">Artista Desconhecido</td>
                                <td className="p-2 text-right font-mono text-slate-300">{item.duration}</td>
                                <td className="p-2 text-right font-mono text-blue-400">11:00:00</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </section>
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-500 transition" />
          <Panel defaultSize={30} minSize={20}>
            <aside className="h-full border-l border-slate-800 p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cartwall</h2>
                <div className="flex gap-2">
                    <button onClick={loadCartwall} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">Carregar</button>
                    <button onClick={saveCartwall} className="text-xs bg-blue-900 hover:bg-blue-800 px-2 py-1 rounded text-blue-100">Salvar</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-grow auto-rows-fr h-full">
                {cartwall.map((cart, index) => (
                  <button 
                    key={index}
                    onClick={() => addCart(index)}
                    className={`rounded-lg border flex flex-col items-center justify-center text-xs p-2 text-center transition ${cart ? 'bg-slate-700 border-slate-600' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
                  >
                    {cart ? (
                        <>
                            <span className="font-bold truncate w-full">{cart.name}</span>
                            <span className="text-slate-400">00:00</span>
                        </>
                    ) : (
                        <span className="text-slate-500 text-lg">{index + 1}</span>
                    )}
                  </button>
                ))}
              </div>
            </aside>
          </Panel>
        </PanelGroup>
      </main>
      <footer className="h-24 border-t border-slate-800 bg-slate-950 flex items-center px-4 gap-4">
        <div className="flex gap-1 border-r border-slate-800 pr-4">
          <button onClick={() => playlist[currentTrackIndex] && playlist[currentTrackIndex].src && play(playlist[currentTrackIndex].src!)} className="p-3 hover:bg-slate-700 rounded transition text-blue-400"><Play size={24} /></button>
          <button onClick={pause} className="p-3 hover:bg-slate-700 rounded transition text-amber-400"><Pause size={24} /></button>
          <button onClick={stop} className="p-3 hover:bg-slate-700 rounded transition text-red-400"><Square size={24} /></button>
          <button onClick={handleNext} className="p-3 hover:bg-slate-700 rounded transition"><SkipForward size={24} /></button>
        </div>
        <div className="flex-1 flex justify-between items-center gap-2">
            {[
                { label: 'DECORRIDO', value: '00:08', color: 'text-emerald-500' },
                { label: 'RESTANTE', value: '02:21', color: 'text-red-500' },
                { label: 'TÉRMINO FAIXA', value: '16:38:42', color: 'text-white' },
                { label: 'HORA ATUAL', value: currentTime.toLocaleTimeString('pt-BR', { hour12: false }), color: 'text-blue-500' },
            ].map(item => (
                <div key={item.label} className="border border-slate-800 rounded-lg p-3 flex-1 flex flex-col items-center justify-center mx-1 bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                    <span className={`text-xl font-mono font-bold ${item.color}`}>{item.value}</span>
                </div>
            ))}
        </div>
      </footer>
    </div>
  );
}
