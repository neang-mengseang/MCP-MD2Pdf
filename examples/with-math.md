# Example: Math Rendering

mcp-md2pdf supports KaTeX for math expressions.

## Inline Math

Use single dollar signs: $E = mc^2$

## Block Math

Use double dollar signs:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## In a PDF tool call

```json
{
  "markdown": "# Physics Notes\n\nEnergy equation: $E = mc^2$\n\n$$\\int_{0}^{\\infty} e^{-x} dx = 1$$",
  "theme": "github"
}
```
