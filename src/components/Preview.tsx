import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';
import GitHubAlertsPlugin from 'markdown-it-github-alerts';
import markdownItFootnote from 'markdown-it-footnote';
import { full as emoji } from 'markdown-it-emoji';
import anchor from 'markdown-it-anchor';
import hljs from 'highlight.js';

import 'github-markdown-css/github-markdown.css';
// import 'markdown-it-github-alerts/styles/github-colors-light.css';
// import 'markdown-it-github-alerts/styles/github-colors-dark-class.css';
import 'markdown-it-github-alerts/styles/github-base.css';
import 'highlight.js/styles/github-dark.css';

interface PreviewProps {
  content: string;
}

const Preview: React.FC<PreviewProps> = ({ content }) => {
  const md = useMemo(() => {
    const mdInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
    
        return ''; // use external default escaping
      }
    });

    mdInstance.use(markdownItTaskLists);
    mdInstance.use(GitHubAlertsPlugin);
    mdInstance.use(markdownItFootnote);
    mdInstance.use(emoji);
    mdInstance.use(anchor, {
        permalink: anchor.permalink.headerLink()
    });

    return mdInstance;
  }, []);

  const html = useMemo(() => {
    return md.render(content);
  }, [content, md]);

  return (
    <div 
      className="markdown-body github-markdown-body" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default Preview;
