// next
import { useTheme } from 'next-themes';
// react
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export function MermaidDraw({ code }: {code: string}) {

    const ref       = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
  
    useEffect(() => {
      mermaid.initialize({ startOnLoad: false, theme: theme });
      const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      if (ref.current) {
        try{
          mermaid.render(uniqueId, code, (svgCode) => {
            ref.current!.innerHTML = svgCode;
          });
        } catch {
          ref.current!.innerHTML = `<p style="color:#999999;font-size:0.75rem;font-weight:100;user-select:none;">Sorry Mermaid parse error...</p><p>${code}</p>`;
        };
      };
    }, [code, theme]);
  
    return <div ref={ref} />;
  };