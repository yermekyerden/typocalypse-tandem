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
            <p className="whitespace-pre-wrap wrap-break-word">{children}</p>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="wrap-break-word">{children}</li>,
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl bg-black/40 px-3 py-2 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-slate-100 [&>code]:font-mono [&>code]:text-[0.9em]">
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => (
            <code
              {...props}
              className={
                className
                  ? className
                  : 'rounded bg-black/30 px-1.5 py-0.5 font-mono text-[0.9em] text-yellow-100'
              }
            >
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
