import { useRef, useEffect } from 'react';

export default function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== value) {
            ref.current.innerHTML = value || '';
        }
    }, [value]);

    function exec(command: string) {
        document.execCommand(command, false);
        onChange(ref.current?.innerHTML || '');
    }

    return (
        <div>
            <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => exec('bold')} className="btn">B</button>
                <button type="button" onClick={() => exec('italic')} className="btn">I</button>
                <button type="button" onClick={() => exec('insertUnorderedList')} className="btn">•</button>
            </div>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={() => onChange(ref.current?.innerHTML || '')}
                className="border rounded p-2 min-h-[120px]"
            />
        </div>
    );
}
