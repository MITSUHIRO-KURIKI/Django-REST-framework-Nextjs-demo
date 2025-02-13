// react
import { type ReactElement } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import { Badge } from '@/app/components/ui/shadcn/badge';
// icon
import { Copy } from 'lucide-react';
// lib
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkRuby from 'remark-denden-ruby';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as PrismStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
// features
import { defaultUrlTransform } from '@/features/utils';
// hooks
import { useStringCopy } from '@/app/hooks';
// include
import { MermaidDraw } from './MermaidDraw';

// type
type MarkdownRenderProps = {
  markdownString: string;
  className?:     string;
};

// MarkdownRender ▽
export function MarkdownRender({markdownString, className,}:MarkdownRenderProps): ReactElement{

  const handleStringCopy = useStringCopy();

  return (
    <>
      <span className={cn(
        'text-foreground',
        '[&_p]:py-1',
        // 見出しスタイル
        '[&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold',
        '[&_h1]:pt-4 [&_h2]:pt-4 [&_h3]:pt-4 [&_h4]:pt-4 [&_h5]:pt-4 [&_h6]:pt-4',
        '[&_h1]:pb-2 [&_h2]:pb-2 [&_h3]:pb-2 [&_h4]:pb-2 [&_h5]:pb-2 [&_h6]:pb-2',
        // 箇条書きスタイル
        '[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-[1rem] [&_li]:px-1',
        // テーブルに対するスタイル
        '[&_table]:my-2',
        '[&_table]:border-collapse',
        '[&_table]:text-sm',
        '[&_table]:rounded-md',
        '[&_table]:overflow-hidden',
        // - 枠線や背景色
        '[&_table]:border [&_th]:border-b [&_td]:border-b',
        '[&_thead_tr]:bg-muted',
        '[&_thead_th]:text-left',
        '[&_thead_th]:px-4 [&_thead_th]:py-2',
        '[&_thead_th]:font-medium [&_thead_th]:text-muted-foreground',
        // - tbody の各セル
        '[&_tbody_td]:px-4 [&_tbody_td]:py-2',
        // - ホバー時に行ハイライトする例
        '[&_tbody_tr:hover]:bg-muted/50',
        // 引用文に対するスタイル
        '[&_blockquote]:italic',
        '[&_blockquote]:p-1 [&_blockquote]:my-2',
        '[&_blockquote]:border-s-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-500',
        '[&_blockquote]:bg-gray-50  [&_blockquote]:dark:bg-gray-800',
        // 区切り線に対するスタイル
        '[&_hr]:my-2',
        className,)}>
        <ReactMarkdown
            remarkPlugins = {[
              remarkGfm,
              remarkMath,
              remarkBreaks,
              remarkRuby,
              remarkRehype,
            ]}
            rehypePlugins = {[
              [rehypeSanitize,        // XSS対策
                {...defaultSchema,}
              ],
              rehypeKatex,            // 数式
              [rehypeExternalLinks,   // 外部リンク
                { target: '_blank',
                  rel:    ['noopener', 'noreferrer'],}
              ],
            ]}
            urlTransform = {(url: string) => {
              if (url.startsWith('data:image/')) return url; // 画像(dataURL)はそのまま
              return defaultUrlTransform(url);
            }}
            components = {{
              img({ alt, ...props }) {
                return (
                  <img className={cn(
                          'max-w-30 max-h-30',
                          'object-scale-down rounded-lg',
                          'shadow-xl dark:shadow-gray-800',
                        )}
                        alt={alt ?? 'image'}
                        {...props} />
                )
              },
              code({ className, children }) {
                const language = (/language-(\w+)/.exec(className || '') || ['', ''])[1]
                // Mermaid
                if (language === 'mermaid') {
                  return <MermaidDraw code={String(children)} />;
                };
                if (language || String(children).length >= 50) {
                  return (
                    <div className='relative'>
                      {language && (
                        <Badge  variant   = 'secondary'
                                className = 'absolute right-0 top-0 px-2 text-xs font-thin'>
                          {language}
                        </Badge>
                      )}
                      <SyntaxHighlighter language = {language}
                                          style    = {PrismStyle}
                                          wrapLongLines
                                          customStyle  = {{ textShadow: 'none', }}
                                          codeTagProps = {{
                                          style: {
                                            textShadow: 'none',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: '1.1',}
                                          }} >
                        {String(children)}
                      </SyntaxHighlighter>
                    </div>
                  )
                } else {
                  return (
                    <div className='relative'>
                      <Badge  variant   = 'secondary'
                              className = 'absolute right-0 top-0 px-2 text-xs font-thin'>
                        Text
                      </Badge>
                      <pre style={{
                            color:        'rgb(248, 248, 242)',
                            background:   'rgb(43, 43, 43)',
                            fontFamily:   'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                            textAlign:    'left',
                            whiteSpace:   'pre',
                            wordSpacing:  'normal',
                            wordBreak:    'normal',
                            overflowWrap: 'normal',
                            lineHeight:   '1.5',
                            tabSize:      4,
                            hyphens:      'none',
                            padding:      '1em',
                            margin:       '0.5em 0',
                            overflow:     'auto',
                            borderRadius: '0.3em',
                            textShadow:   'none',}}>
                          {children}
                        </pre>
                      </div>
                    );
                };
              },
            }}>
          {markdownString}
        </ReactMarkdown>
      </span>
      {/* Copy Button */}
      <button className = {cn(
                'flex items-center rounded-md z-tooltip',
                'mt-2 px-1 py-1 text-xs',
                'opacity-50 hover:opacity-100',
                'hover:bg-secondary',
              )}
              onClick = {() => handleStringCopy(markdownString)}>
        <Copy className='size-4' />
      </button>
    </>
  );
};
// MarkdownRender △