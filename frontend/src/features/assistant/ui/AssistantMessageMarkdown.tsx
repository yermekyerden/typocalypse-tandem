import ReactMarkdown from 'react-markdown';

type AssistantMessageMarkdownProps = {
  content: string;
};

export function AssistantMessageMarkdown({ content }: AssistantMessageMarkdownProps) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-inherit">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="whitespace-pre-wrap wrap-break-word text-inherit">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5 text-inherit">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5 text-inherit">{children}</ol>
          ),
          li: ({ children }) => <li className="wrap-break-word">{children}</li>,
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl border border-yellow-400/10 bg-mist-950/85 px-3 py-2 text-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.16)] dark:border-mist-400 dark:bg-mist-100 dark:text-mist-900 dark:shadow-[0_8px_20px_rgba(15,23,42,0.06)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit [&>code]:font-mono [&>code]:text-[0.9em]">
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => (
            <code
              {...props}
              className={
                className
                  ? className
                  : 'rounded-md border border-yellow-400/10 bg-mist-950/75 px-1.5 py-0.5 font-mono text-[0.9em] text-yellow-100 dark:border-mist-400 dark:bg-mist-100 dark:text-mist-900'
              }
            >
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-yellow-50 dark:text-mist-900">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
