## Exercise: Pandoc and Markdown

- [Install Pandoc](https://pandoc.org/). This is a command line document converter. It can convert from one format to another (e.g., markdown to HTML), and it is more reliable than GenAI for that type of task.
- Select a structured file with content you'd like to share online, for instance, a Word document syllabus or outline.
- To convert from docx to Markdown, navigate in Command Prompt or Terminal to the folder in question and run the command: **pandoc syllabus.docx -o syllabus.md**
- Move the Markdown file into a new or existing repository configured to use GitHub Pages
- If the Markdown file is going to be the foundation of the project, rename it **index.md**
- Select a base theme from [GitHub Pages Themes](https://pages.github.com/themes/)
- Create a new file, **_config.yml**, with the information for the remote theme you've selected and the project info. For example, here's the [_config.yml](https://github.com/AMSUCF/DHProgramming/blob/main/_config.yml) file for this project.
- Copy the directions from the theme's repository for adding a stylesheet when prompting Copilot to create a theme for the project.
