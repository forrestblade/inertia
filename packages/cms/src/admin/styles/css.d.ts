// TypeScript declaration for CSS file imports (esbuild --loader:.css=text)
declare module '*.css' {
  const content: string
  export default content
}
