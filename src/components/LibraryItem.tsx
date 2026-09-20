import { Folder, FileAudio, ChevronRight, ChevronDown } from 'lucide-react';
import { MediaItem } from '../types';

interface LibraryItemProps {
  item: MediaItem;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

export function LibraryItem({ item, expandedIds, toggleExpand }: LibraryItemProps) {
  const isExpanded = expandedIds.has(item.id);
  const isFolder = !!item.isFolder;
  const hasChildren = item.children && item.children.length > 0;
  
  const handleDragStart = (e: React.DragEvent) => {
    if (!isFolder) {
      e.dataTransfer.setData('application/json', JSON.stringify(item));
    }
  };

  return (
    <div className="text-sm">
      <div 
        className="flex items-center gap-2 p-2 hover:bg-slate-800 cursor-pointer rounded"
        onClick={() => isFolder ? toggleExpand(item.id) : undefined}
        draggable={!isFolder}
        onDragStart={handleDragStart}
      >
        {isFolder ? (
          <>
            {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <div className="w-4" />}
            <Folder size={16} className="text-blue-400" />
          </>
        ) : (
          <FileAudio size={16} className="text-slate-500 ml-6" />
        )}
        {item.name}
      </div>
      {isFolder && isExpanded && (
        <div className="pl-4 border-l border-slate-800 ml-2">
          {item.children?.map(child => (
            <LibraryItem 
              key={child.id} 
              item={child} 
              expandedIds={expandedIds} 
              toggleExpand={toggleExpand} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
