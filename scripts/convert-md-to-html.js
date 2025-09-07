const fs = require('fs');
const path = require('path');

// HTML template for all converted files
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 10px;
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .header {
            text-align: center;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .content {
            padding: 20px 0;
        }

        h1, h2, h3, h4, h5, h6 {
            color: #667eea;
            margin: 20px 0 10px 0;
        }

        h1 {
            font-size: 2.2em;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        h2 {
            font-size: 1.8em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }

        h3 {
            font-size: 1.4em;
            color: #555;
        }

        h4 {
            font-size: 1.2em;
            color: #666;
        }

        p {
            margin: 10px 0;
            text-align: justify;
        }

        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }

        li {
            margin: 5px 0;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e74c3c;
        }

        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
        }

        pre code {
            background: none;
            color: #e2e8f0;
            padding: 0;
        }

        blockquote {
            border-left: 4px solid #667eea;
            margin: 20px 0;
            padding: 10px 20px;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        th {
            background: #667eea;
            color: white;
            font-weight: bold;
        }

        tr:hover {
            background: #f5f5f5;
        }

        .highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .highlight h3 {
            color: white;
            margin-top: 0;
        }

        .back-link {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }

        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }

        .toc h3 {
            color: #667eea;
            margin-bottom: 15px;
        }

        .toc ul {
            list-style: none;
            padding-left: 0;
        }

        .toc li {
            margin: 8px 0;
        }

        .toc a {
            color: #667eea;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 4px;
            transition: all 0.3s ease;
            display: block;
        }

        .toc a:hover {
            background: #667eea;
            color: white;
        }

        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .tool-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #4CAF50;
        }

        .tool-card h4 {
            color: #4CAF50;
            margin-bottom: 10px;
        }

        .performance {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 8px;
        }

        .description {
            color: #555;
        }

        @media (max-width: 768px) {
            .container {
                margin: 10px;
                padding: 15px;
            }

            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>TappMCP Technical Documentation</p>
        </div>

        <div class="content">
            ${content}
        </div>

        <a href="./MASTER_USER_GUIDE.html" class="back-link">← Back to Master User Guide</a>
    </div>

    <script>
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add table of contents generation
        function generateTOC() {
            const headings = document.querySelectorAll('h2, h3');
            const toc = document.createElement('div');
            toc.className = 'toc';
            toc.innerHTML = '<h3>📚 Table of Contents</h3><ul></ul>';

            const ul = toc.querySelector('ul');

            headings.forEach((heading, index) => {
                const id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                heading.id = id;

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#' + id;
                a.textContent = heading.textContent;
                li.appendChild(a);
                ul.appendChild(li);
            });

            document.querySelector('.content').insertBefore(toc, document.querySelector('.content').firstChild);
        }

        // Generate TOC on page load
        document.addEventListener('DOMContentLoaded', generateTOC);
    </script>
</body>
</html>`;

// Function to convert markdown to HTML
function markdownToHtml(markdown) {
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/```\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Convert numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Convert horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Convert paragraphs
    html = html.replace(/^(?!<[h1-6]|<ul|<ol|<li|<pre|<code|<hr)(.*)$/gim, '<p>$1</p>');

    // Convert blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    // Clean up multiple newlines
    html = html.replace(/\n\s*\n/g, '\n');

    return html;
}

// Files to convert
const filesToConvert = [
    {
        input: 'docs/TAPPMCP_COMPLETE_ANALYSIS.md',
        output: 'docs/TAPPMCP_COMPLETE_ANALYSIS.html',
        title: 'TappMCP: Complete Technical Analysis'
    },
    {
        input: 'docs/TAPPMCP_DEEP_DIVE_ANALYSIS.md',
        output: 'docs/TAPPMCP_DEEP_DIVE_ANALYSIS.html',
        title: 'TappMCP: Deep Dive Technical Analysis'
    },
    {
        input: 'docs/TAPPMCP_DEMO_MECHANICS.md',
        output: 'docs/TAPPMCP_DEMO_MECHANICS.html',
        title: 'TappMCP: Demo Mechanics & Testing'
    },
    {
        input: 'docs/API_DOCUMENTATION.md',
        output: 'docs/API_DOCUMENTATION.html',
        title: 'TappMCP: API Documentation'
    },
    {
        input: 'docs/DEVELOPMENT_STATUS.md',
        output: 'docs/DEVELOPMENT_STATUS.html',
        title: 'TappMCP: Development Status'
    },
    {
        input: 'docs/QUICK_START.md',
        output: 'docs/QUICK_START.html',
        title: 'TappMCP: Quick Start Guide'
    },
    {
        input: 'docs/DEPLOYMENT.md',
        output: 'docs/DEPLOYMENT.html',
        title: 'TappMCP: Deployment Guide'
    },
    {
        input: 'docs/ENHANCEMENT_ROADMAP.md',
        output: 'docs/ENHANCEMENT_ROADMAP.html',
        title: 'TappMCP: Enhancement Roadmap'
    }
];

// Convert each file
filesToConvert.forEach(file => {
    try {
        if (fs.existsSync(file.input)) {
            const markdown = fs.readFileSync(file.input, 'utf8');
            const htmlContent = markdownToHtml(markdown);
            const fullHtml = htmlTemplate(file.title, htmlContent);

            fs.writeFileSync(file.output, fullHtml);
            console.log(`✅ Converted ${file.input} to ${file.output}`);
        } else {
            console.log(`❌ File not found: ${file.input}`);
        }
    } catch (error) {
        console.error(`❌ Error converting ${file.input}:`, error.message);
    }
});

// Convert role files
const roleFiles = [
    'docs/roles/ai-augmented-developer.md',
    'docs/roles/product-strategist.md',
    'docs/roles/ai-operations-engineer.md',
    'docs/roles/ai-quality-assurance-engineer.md',
    'docs/roles/ux-product-designer.md'
];

roleFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            const markdown = fs.readFileSync(file, 'utf8');
            const title = path.basename(file, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const htmlContent = markdownToHtml(markdown);
            const fullHtml = htmlTemplate(title, htmlContent);

            const outputFile = file.replace('.md', '.html');
            fs.writeFileSync(outputFile, fullHtml);
            console.log(`✅ Converted ${file} to ${outputFile}`);
        } else {
            console.log(`❌ File not found: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error converting ${file}:`, error.message);
    }
});

console.log('\n🎉 All markdown files converted to HTML successfully!');
