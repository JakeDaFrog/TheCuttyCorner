# How to Add Featured Articles

When you write a new article and want it to appear in the "Read This!" section:

### Option 1: Using the Snippet (Easiest)

1. Open `featured-articles.js` in VS Code
2. Scroll to the end of the last article entry (before the closing `];`)
3. Position your cursor at the end of the last `},` 
4. Press **Enter** to create a new line
5. Type `addarticle` and press **Tab**
6. VS Code will auto-fill a template. Fill in:
   - **Article Title**: The name of your article
   - **number**: Your article number (e.g., 13 for Article-13.html)
   - **Quote from article**: The opening paragraph or a key quote
   - **1**: The image file number (e.g., if your preview is Article-13-5.jpg, put 5)

**Example:**
```javascript
  {
    title: "My New Adventure",
    link: "Articles/Article-13.html",
    quote: "The opening paragraph of my article goes here...",
    image: "images/Article-13-5.jpg"
  },
```

### Option 2: Manual Entry

Copy and paste this template and fill in your info:

```javascript
  {
    title: "ARTICLE TITLE HERE",
    link: "Articles/Article-XX.html",
    quote: "OPENING QUOTE OR PARAGRAPH HERE",
    image: "images/Article-XX-Y.jpg"
  },
```

Replace:
- `ARTICLE TITLE`: Your article's title
- `XX`: Your article number
- `OPENING QUOTE`: The text you want to show
- `Y`: Your preview image number

## Important Notes

- **Comma**: Always end with a comma `,` (except the very last entry)
- **Image File**: Use the first image from your article's image-gallery section
- **Quote**: Grab the first paragraph of your article for consistency
- **Quotes**: The quote text will automatically appear in quotation marks and italics

## File Structure

The featured-articles.js file contains an array that looks like this:

```javascript
const featuredArticles = [
  {
    title: "Article 1",
    link: "Articles/Article-1.html",
    quote: "Opening quote",
    image: "images/Article-1-1.jpg"
  },
  {
    title: "Article 2",
    link: "Articles/Article-2.html",
    quote: "Opening quote",
    image: "images/Article-2-1.jpg"
  }
  // Add new articles here ↑
];
```

## How It Works

- The homepage randomly selects one article from this list on each page reload
- The selected article appears in the "Read This!" featured section
- Text appears on the left, image on the right
- Clicking either the text or image takes visitors to the full article

## Troubleshooting

**Snippet not working?**
- Make sure you saved the javascript.json snippets file (Cmd+S)
- Try restarting VS Code

**Article not showing up?**
- Check for syntax errors (missing commas, quotes, etc.)
- Save featured-articles.js
- Hard refresh your browser (Cmd+Shift+R)

**Image not loading?**
- Verify the image file exists in your images folder
- Check the filename is spelled correctly (case-sensitive)
- Use the format: `images/Article-XX-Y.jpg`

---

**Last Updated:** February 11, 2026
