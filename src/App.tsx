/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect, useMemo} from 'react';
import {Folder, Calendar, Radio, RotateCw, Palette, Settings, Power, Play, Pause, SkipForward, Square, X} from 'lucide-react';
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
  const [playlist, setPlaylist] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('playlist');
    return saved ? JSON.parse(saved) : [
      { id: '101', name: 'Música de Teste 1', duration: '06:11', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: '102', name: 'Música de Teste 2', duration: '06:11', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    const updateDurations = async () => {
      const updatedPlaylist = await Promise.all(
        playlist.map(async (item) => {
          if (item.src && item.duration === '06:11') {
            const duration = await getAudioDuration(item.src);
            return { ...item, duration };
          }
          return item;
        })
      );
      setPlaylist(updatedPlaylist);
    };
    updateDurations();
  }, []);

  const [showModal, setShowModal] = useState<'folder' | 'audio' | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const { play, pause, stop, isPlaying, currentTime: audioCurrentTime, duration } = useAudioPlayer();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Função auxiliar para converter 'MM:SS' ou 'HH:MM:SS' para segundos
  const durationToSeconds = (durationStr: string) => {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) { // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // MM:SS
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  // Função para obter duração real do áudio
  const getAudioDuration = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.onloadedmetadata = () => {
        const totalSeconds = Math.floor(audio.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        resolve(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };
      audio.onerror = () => resolve('00:00');
    });
  };

  // Calcula os tempos de início de cada item
  const playlistWithTimes = useMemo(() => {
    let runningTime = new Date().getTime();
    return playlist.map((item) => {
      const startTime = new Date(runningTime).toLocaleTimeString('pt-BR', { hour12: false });
      runningTime += durationToSeconds(item.duration) * 1000;
      return { ...item, startTime };
    });
  }, [playlist]);

  const remaining = Math.max(0, duration - audioCurrentTime);
  const finishTime = new Date(Date.now() + remaining * 1000).toLocaleTimeString('pt-BR', { hour12: false });

  const handleNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      // Reproduz a nova faixa automaticamente
      const nextTrack = playlist[nextIndex];
      if (nextTrack && nextTrack.src) {
        play(nextTrack.src, crossfadeSettings);
      }
    }
  };
  const [cartwall, setCartwall] = useState<({id: number, name: string} | null)[]>(() => {
      const saved = localStorage.getItem('roadic-cartwall');
      return saved ? JSON.parse(saved) : Array(16).fill(null);
  });

  const refreshLibrary = () => {
    alert('Biblioteca atualizada!');
  };

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

  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isCrossfadeModalOpen, setIsCrossfadeModalOpen] = useState(false);
  const [crossfadeSettings, setCrossfadeSettings] = useState({
    autoSkip: false,
    pauseAfterSkip: false,
    enableCrossfade: true,
    manual: {
      mixNext: true,
      mixNextMseg: 2000,
      fadeOut: true,
      fadeOutMseg: 2,
      fadeIn: false,
      fadeInMseg: 1000,
    },
    automatic: {
      enabled: false,
      mode: 'mix', // 'none' | 'pause' | 'mix'
      pauseMseg: 1000,
      mixMseg: 1000,
      fadeIn: true,
      fadeInMseg: 1000,
      fadeOut: true,
      fadeOutMseg: 1000,
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOptionsMenuOpen && 
          !(event.target as HTMLElement).closest('.options-menu-container') &&
          !(event.target as HTMLElement).closest('.options-button')) {
        setIsOptionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOptionsMenuOpen]);

  const menuItems = [
    { icon: Folder, label: 'Arquivo' },
    { icon: Calendar, label: 'Agendador' },
    { icon: Radio, label: 'Transmissão' },
    { icon: RotateCw, label: 'Utilitários' },
    { icon: Palette, label: 'Temas' },
    { icon: Settings, label: 'Opções', onClick: () => setIsOptionsMenuOpen(!isOptionsMenuOpen), className: 'options-button' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <header className="h-14 border-b border-slate-800 flex items-center px-4 shrink-0 gap-6 relative">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">Arraia Play</h1>
        </div>
        
        <nav className="flex items-center gap-4 text-sm text-slate-300 flex-1 justify-around">
          {menuItems.map(item => (
            <button key={item.label} onClick={item.onClick} className={`flex items-center gap-2 hover:text-white transition ${item.className || ''}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
        </div>
        {isOptionsMenuOpen && (
          <div className="absolute top-14 right-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-48 options-menu-container">
            <button onClick={() => { setIsOptionsMenuOpen(false); setIsCrossfadeModalOpen(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded text-sm text-slate-200">Crossfade</button>
            <button className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded text-sm text-slate-200">Outra Opção</button>
          </div>
        )}
        {isCrossfadeModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Configurações de Crossfade</h3>
                        <button onClick={() => setIsCrossfadeModalOpen(false)}><X size={20}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.autoSkip} onChange={e => setCrossfadeSettings({...crossfadeSettings, autoSkip: e.target.checked})} /> Pular automaticamente para a próxima faixa</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.pauseAfterSkip} onChange={e => setCrossfadeSettings({...crossfadeSettings, pauseAfterSkip: e.target.checked})} /> e suspender a reprodução</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.enableCrossfade} onChange={e => setCrossfadeSettings({...crossfadeSettings, enableCrossfade: e.target.checked})} /> Permitir mixagem cruzada</label>

                        <fieldset className="border border-slate-700 p-4 rounded">
                            <legend className="px-2 font-semibold text-orange-400">Troca de faixa manual</legend>
                            <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={crossfadeSettings.manual.mixNext} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, mixNext: e.target.checked}})} /> Mixar próxima faixa com a atual <input type="number" value={crossfadeSettings.manual.mixNextMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, mixNextMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                            <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={crossfadeSettings.manual.fadeOut} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, fadeOut: e.target.checked}})} /> Diminuir gradualmente o volume no final da faixa <input type="number" value={crossfadeSettings.manual.fadeOutMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, fadeOutMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.manual.fadeIn} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, fadeIn: e.target.checked}})} /> Aumentar gradualmente o volume no início da faixa <input type="number" value={crossfadeSettings.manual.fadeInMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, manual: {...crossfadeSettings.manual, fadeInMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                        </fieldset>

                        <fieldset className="border border-slate-700 p-4 rounded">
                            <legend className="px-2 font-semibold text-orange-400">Troca de faixa automática</legend>
                            <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={crossfadeSettings.automatic.enabled} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, enabled: e.target.checked}})} /> Ativar troca automática</label>
                            <div className="ml-6 space-y-2">
                                <label className="flex items-center gap-2"><input type="radio" name="autoMode" checked={crossfadeSettings.automatic.mode === 'none'} onChange={() => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, mode: 'none'}})} /> Não fazer nada</label>
                                <label className="flex items-center gap-2"><input type="radio" name="autoMode" checked={crossfadeSettings.automatic.mode === 'pause'} onChange={() => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, mode: 'pause'}})} /> Adicionar pausa entre faixas <input type="number" value={crossfadeSettings.automatic.pauseMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, pauseMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                                <label className="flex items-center gap-2"><input type="radio" name="autoMode" checked={crossfadeSettings.automatic.mode === 'mix'} onChange={() => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, mode: 'mix'}})} /> Mixar próxima faixa com a atual <input type="number" value={crossfadeSettings.automatic.mixMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, mixMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                            </div>
                            <div className="ml-6 mt-3 space-y-2 border-t border-slate-700 pt-3">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.automatic.fadeIn} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, fadeIn: e.target.checked}})} /> Aumentar gradualmente o volume no início da faixa <input type="number" value={crossfadeSettings.automatic.fadeInMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, fadeInMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={crossfadeSettings.automatic.fadeOut} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, fadeOut: e.target.checked}})} /> Diminuir gradualmente o volume no final da faixa <input type="number" value={crossfadeSettings.automatic.fadeOutMseg} onChange={e => setCrossfadeSettings({...crossfadeSettings, automatic: {...crossfadeSettings.automatic, fadeOutMseg: Number(e.target.value)}})} className="bg-slate-900 w-20 p-1 rounded" /> mseg</label>
                            </div>
                        </fieldset>
                    </div>
                    <button onClick={() => setIsCrossfadeModalOpen(false)} className="w-full mt-6 bg-blue-600 py-2 rounded font-bold">Salvar</button>
                </div>
            </div>
        )}
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
                <button onClick={refreshLibrary} className="flex-1 hover:bg-slate-800 py-2 rounded text-xs font-medium flex items-center justify-center">
                    <RotateCw size={14} />
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
                            <th className="p-2 font-normal text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                            e.preventDefault();
                            const data = e.dataTransfer.getData('application/json');
                            if (data) {
                                const newItem: MediaItem = JSON.parse(data);
                                const uniqueItem = { ...newItem, id: `${newItem.id}-${Date.now()}` };
                                const duration = newItem.src ? await getAudioDuration(newItem.src) : '00:00';
                                setPlaylist([ ...playlist, { ...uniqueItem, duration }]);
                            }
                        }}
                    >
                        {playlistWithTimes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-32 text-center text-slate-500 italic">Arraste arquivos aqui para começar</td>
                            </tr>
                        ) : (
                            playlistWithTimes.map((item, index) => (
                                <tr 
                                    key={item.id} 
                                    className={`border-b border-slate-800 transition ${index === currentTrackIndex ? 'bg-blue-900/30' : 'hover:bg-slate-800'}`}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-b-2', 'border-blue-500'); }}
                                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-b-2', 'border-blue-500'); }}
                                    onDrop={async (e) => {
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove('border-b-2', 'border-blue-500');
                                        const data = e.dataTransfer.getData('application/json');
                                        if (data) {
                                            const newItem: MediaItem = JSON.parse(data);
                                            const uniqueItem = { ...newItem, id: `${newItem.id}-${Date.now()}` };
                                            const duration = newItem.src ? await getAudioDuration(newItem.src) : '00:00';
                                            const newPlaylist = [...playlist];
                                            newPlaylist.splice(index + 1, 0, { ...uniqueItem, duration });
                                            setPlaylist(newPlaylist);
                                        }
                                    }}
                                >
                                    <td className={`p-2 ${index === currentTrackIndex ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {index === currentTrackIndex ? <Play size={16} fill="currentColor" /> : String(index + 1).padStart(2, '0')}
                                    </td>
                                    <td className={`p-2 font-medium ${index === currentTrackIndex ? 'text-white' : 'text-slate-200'}`}>{item.name}</td>
                                    <td className="p-2 text-slate-300">Artista Desconhecido</td>
                                    <td className="p-2 text-right">
                                        <input 
                                            type="text"
                                            value={item.duration}
                                            onChange={(e) => {
                                                const newPlaylist = [...playlist];
                                                newPlaylist[index] = { ...newPlaylist[index], duration: e.target.value };
                                                setPlaylist(newPlaylist);
                                            }}
                                            className={`bg-transparent text-right font-mono w-16 border-none focus:outline-none ${index === currentTrackIndex ? 'text-blue-300' : 'text-slate-300'}`}
                                        />
                                    </td>
                                    <td className="p-2 text-right font-mono text-blue-400">{item.startTime}</td>
                                    <td className="p-2 text-right">
                                        <button 
                                            onClick={() => setPlaylist(playlist.filter((_, i) => i !== index))}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
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
                    className={`rounded-lg border flex flex-col items-center justify-center text-xs p-2 text-center transition ${cart ? 'border-slate-600' : 'border-slate-800 hover:border-slate-600'}`}
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
                { label: 'DECORRIDO', value: formatTime(audioCurrentTime), color: 'text-emerald-500' },
                { label: 'RESTANTE', value: formatTime(remaining), color: 'text-red-500' },
                { label: 'TÉRMINO FAIXA', value: isPlaying ? finishTime : '--:--:--', color: 'text-white' },
                { label: 'HORA ATUAL', value: currentTime.toLocaleTimeString('pt-BR', { hour12: false }), color: 'text-blue-500' },
            ].map(item => (
                <div key={item.label} className="flex-1 flex flex-col items-center justify-center mx-1">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">{item.label}</span>
                    <span className={`text-xl font-mono font-bold ${item.color}`}>{item.value}</span>
                </div>
            ))}
        </div>
      </footer>
    </div>
  );
}
