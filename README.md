# Markdown Editor

A minimalist, high-performance Markdown editor built with user productivity in mind. Designed for macOS, it combines the speed of a native application with the flexibility of modern web technologies.

## Features

- **Live Preview**: Real-time rendering of Markdown as you type, with accurate GitHub Flavored Markdown support.
- **Distraction-Free Interface**: Clean, minimalist UI that lets you focus on your writing.
- **Rich Formatting Toolbar**: Quickly access common formatting options like Bold, Italic, Strikethrough, Code blocks, and more directly from the title bar.
- **Integrated Emoji Picker**: A centered, keyboard-accessible emoji picker to add personality to your documents.
- **Keyboard Shortcuts**:
  - `Cmd+B`: Bold
  - `Cmd+I`: Italic
  - `Cmd+S`: Save
  - `Cmd+F`: Toggle Fullscreen
  - `Cmd+O`: Open File
  - `Cmd+E`: Open Emoji Picker
- **Code Highlighting**: Syntax highlighting for code blocks in the preview.
- **Native Experience**: Built with Tauri for a lightweight, performant, and secure desktop application experience.

## Tech Stack

This project is built using:
- **[Tauri](https://tauri.app/)**: For the native application shell and backend.
- **[React](https://react.dev/)**: For the user interface.
- **[TypeScript](https://www.typescriptlang.org/)**: For type-safe code.
- **[CodeMirror](https://codemirror.net/)**: For the editor component.
- **[Markdown-it](https://github.com/markdown-it/markdown-it)**: For Markdown parsing and rendering.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) & [Bun](https://bun.sh/) (or npm/pnpm/yarn)
- [Rust](https://www.rust-lang.org/) (for Tauri)

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/aneuhaus/md-editor.git
    cd md-editor
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

3.  Run the development server:
    ```bash
    bun run tauri dev
    ```

### Building for Production

To build the application for macOS:

```bash
bun run tauri build
```

## Acknowledgements

- [Markdown-it](https://github.com/markdown-it/markdown-it)
- [CodeMirror](https://codemirror.net/)
- [Tauri](https://tauri.app/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide](https://lucide.dev/) 
- [Emoji Map](https://gist.github.com/jonobr1/ebea6185cb4fb9ae5f4174a302910121) Thanks to [jonobr1](https://github.com/jonobr1)

The output application (`.dmg` or `.app`) will be located in `src-tauri/target/release/bundle/macos/`.

## License

[MIT](LICENSE)
