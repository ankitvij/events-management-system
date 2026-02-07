import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function RichEditor({ value, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);
    const lastValueRef = useRef<string>('');

    useEffect(() => {
        if (!containerRef.current || quillRef.current) {
            return;
        }

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'blockquote', 'code-block'],
                    ['clean'],
                ],
            },
        });

        quillRef.current = quill;
        const initial = value || '';
        quill.clipboard.dangerouslyPasteHTML(initial);
        lastValueRef.current = initial;

        quill.on('text-change', () => {
            const html = quill.root.innerHTML;
            if (html !== lastValueRef.current) {
                lastValueRef.current = html;
                onChange(html);
            }
        });
    }, [onChange, value]);

    useEffect(() => {
        if (!quillRef.current) {
            return;
        }

        if (value !== lastValueRef.current) {
            const next = value || '';
            quillRef.current.clipboard.dangerouslyPasteHTML(next);
            lastValueRef.current = next;
        }
    }, [value]);

    return (
        <div className="rounded border border-slate-200 bg-white">
            <div ref={containerRef} className="min-h-[220px]" />
        </div>
    );
}
