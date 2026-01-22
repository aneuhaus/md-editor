declare module 'markdown-it-task-lists' {
    import MarkdownIt from 'markdown-it';
    
    interface Options {
        enabled?: boolean;
        label?: boolean;
        labelAfter?: boolean;
    }

    function taskLists(md: MarkdownIt, options?: Options): void;
    export = taskLists;
}
