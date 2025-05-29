# AI-Assisted Programming Pedagogy: Workshop Guide
*Social Media Analysis Workshop*

- [Workshop Slides](bluesky/bluesky_slides.html)
- [Starter Notebook](https://colab.research.google.com/github/AMSUCF/DHProgramming/blob/main/bluesky/bluesky.ipynb)
- [Finished Notebook](https://github.com/AMSUCF/DHProgramming/blob/main/bluesky/Bluesky_Solution.ipynb)

## Workshop Overview
**Building on Your Experience:** Combinatorial text generation → Social media data analysis  
**Focus:** AI pedagogy strategies for programming instruction  
**Time:** 10:40 AM - 12:30 PM

---

## Three-Tier AI Pedagogical Framework

### **Level 1: Code Comprehension & Debugging**
*For students building foundational understanding*

**Prompt Examples:**
- "Explain this error message and how to fix it"
- "Walk me through what this code block accomplishes step by step"
- "I used str.split() before. How is str.split().str.len() different?"

**Teaching Goal:** Build confidence through understanding existing code

### **Level 2: Conceptual Application & Adaptation**
*For students connecting programming to disciplinary knowledge*

**Prompt Examples:**
- "How would I modify this approach for historical data?"
- "In my text project, I used find/replace. How could I use similar pattern matching here?"
- "What's the computational thinking behind this solution?"

**Teaching Goal:** Connect technical skills to research questions

### **Level 3: Critical Evaluation & Extension**
*For students ready to evaluate computational approaches*

**Prompt Examples:**
- "What are the limitations of this algorithmic approach?"
- "Compare the ethical considerations between generating creative text and analyzing real social media posts"
- "How does this method compare to traditional research practices?"

**Teaching Goal:** Develop critical digital literacy

---

## Session 1: Building Real Corpus with Bluesky API

### Jupyter Notebook Workflow Management
**Cell Organization Strategy:**
1. **Setup Cell:** Libraries and authentication (run once)
2. **Data Collection Cell:** API calls (modify and re-run)
3. **Processing Cell:** Clean and structure data
4. **Analysis Cells:** Individual analyses (iterate with AI)
5. **Visualization Cell:** Final outputs

**AI-Assisted Iteration Pattern:**
- Keep working code in separate cells
- Use AI to modify copies before replacing originals
- Save successful versions before experimenting

### Getting Started with Real Data Collection

**AI Prompts for Setup:**
- "Help me install the required libraries for Bluesky API analysis: atproto, pandas, matplotlib, seaborn"
- "Show me how to securely authenticate with the Bluesky API using Google Colab secrets"
- "I'm getting an authentication error with the AT Protocol. What might be wrong?"

**AI Prompts for Data Collection:**
- "Write a function to collect posts from a specific Bluesky user handle"
- "How do I search for posts containing specific hashtags on Bluesky?"
- "Create a function that collects posts from multiple users and combines them into one dataset"
- "My data collection is only getting 10 posts per user. How can I get more historical data?"

**AI Prompts for Data Processing:**
- "Convert this Bluesky API response into a pandas DataFrame with relevant features"
- "Help me extract engagement metrics, timestamps, and text features from Bluesky posts"
- "I have inconsistent API response structures. How do I handle missing fields robustly?"

**AI Iteration Strategy:** Use prompts like:
- "This code works but is slow. How can I optimize the data collection?"
- "I'm getting rate limited by the API. What's the best way to handle this?"
- "How do I save my collected data as a CSV file for backup?"

---

## Session 2: AI-Assisted Analysis with Real Data

### Jupyter Cell Management for Iterative Analysis
**Best Practices:**  
- **Test in new cells** before modifying working code
- **Comment out** previous versions instead of deleting
- **Use cell markdown** to document AI conversations
- **Save successful iterations** before experimenting further

### Content Analysis on Your Corpus

**AI Prompts for Pattern Recognition:**
- "Create a function to categorize social media posts as academic, literary, or general based on keywords"
- "How do I analyze word frequency patterns in my social media corpus?"
- "Build a function that identifies posts mentioning specific academic or cultural terms"

**AI Prompts for Feature Extraction:**
- "Calculate engagement rates and text statistics for each post in my dataset"
- "How do I identify posts with hashtags, mentions, or media attachments?"
- "Create features that measure post complexity, sentiment, or topic relevance"

**AI Debugging Prompts:**
- "My categorization function is putting everything in 'general'. How do I debug this?"
- "The regex patterns aren't catching word variations like 'researching'. Help me improve them"
- "I want to add sentiment analysis to this content analysis. How would I modify the approach?"

### Temporal Analysis with Your Data

**AI Prompts for Time-Based Analysis:**
- "Analyze posting patterns by hour and day of week in my dataset"
- "How do I identify unusual spikes or patterns in daily posting activity?"
- "Calculate engagement differences between weekend and weekday posts"
- "Create a function that finds the most active time periods in my corpus"

**AI Iteration Examples:**
- "I want to analyze posting patterns around specific events. How do I identify date ranges with unusual activity?"
- "My temporal analysis shows all posts from one day. Is my data collection working correctly?"
- "How can I compare posting patterns between different authors in my corpus?"

---

## Session 3: Visualization and Analysis Iteration

### Jupyter Workflow for AI-Assisted Visualization
**Cell Strategy for Visual Analysis:**
1. **Basic plot cell** - get something working first
2. **AI improvement cell** - iterate with prompts  
3. **Final visualization cell** - polished version
4. **Interpretation cell** - analysis of patterns

### Creating Visualizations from Your Data

**AI Prompts for Basic Visualization:**
- "Create a bar chart showing the distribution of content categories in my dataset"
- "Make a scatter plot of word count vs engagement for my social media posts"
- "Generate a timeline showing daily posting activity over the data collection period"
- "Create a simple heatmap of posting activity by hour and day of week"

**AI Prompts for Enhanced Visualization:**
- "Improve this basic bar chart with better colors, labels, and professional formatting"
- "Create a multi-panel dashboard showing key patterns in my social media data"
- "This scatter plot is too crowded. How can I make it clearer and more informative?"
- "Add trend lines and statistical annotations to show correlations in my data"

**AI Prompts for Specialized Analysis:**
- "Create a network visualization showing user mentions and interactions"
- "Build a word cloud or frequency analysis of the most common terms"
- "Make a comparison chart showing engagement differences across content types"
- "Generate a correlation heatmap of all numerical features in my dataset"

### AI Interpretation Prompts by Level

**Beginner:**
- "What patterns do you notice in this engagement chart? What story does it tell?"
- "Looking at this timeline, when are users most and least active?"

**Intermediate:**  
- "What cultural or social factors might explain these posting and engagement patterns?"
- "How would you design a follow-up study based on these visualization insights?"

**Advanced:**
- "What assumptions about social media behavior are embedded in these visualizations?"
- "What are the limitations of this visual analysis approach for cultural research?"

**AI Visualization Iteration Prompts:**
- "What additional visualizations would reveal patterns I might be missing?"
- "I notice some outliers in the engagement data. How do I identify and analyze them?"
- "How can I create visualizations that tell a cohesive analytical story?"

---

## Session 4: Advanced Analysis and Course Design

### Managing Complex Analysis with Jupyter and AI

**AI Prompts for Advanced Setup:**
- "Help me import and set up advanced analysis libraries like numpy, scipy, and scikit-learn"
- "What additional libraries would be useful for network analysis or topic modeling?"

### Network Analysis of Your Corpus

**AI Prompts for Network Analysis:**
- "Create a function to extract user mentions and build an interaction network"
- "How do I analyze the most connected or influential users in my corpus?"
- "Build a network graph showing how users interact through mentions and replies"
- "Calculate network centrality measures to identify key community members"

### Topic Modeling and Advanced Text Analysis

**AI Prompts for Topic Analysis:**
- "Implement basic topic modeling using TF-IDF and clustering on my social media corpus"
- "How do I determine the optimal number of topics for my dataset?"
- "Create a function that identifies and labels the main themes in my posts"
- "How can I validate these computational topic categories against manual analysis?"

### Data Quality and Corpus Assessment

**AI Prompts for Validation:**
- "Create a function to assess the quality and representativeness of my social media corpus"
- "How do I identify potential biases or gaps in my data collection?"
- "What statistical measures help evaluate whether my dataset is sufficient for analysis?"
- "Generate a summary report of key characteristics and limitations of my corpus"

**AI Iteration Prompts for Advanced Analysis:**
- "My topic modeling results don't make sense. How do I debug and improve the parameters?"
- "The network analysis shows no connections. Am I extracting mentions correctly?"
- "How can I integrate multiple analysis approaches into a coherent research framework?"
- "What are the best practices for validating computational results with traditional methods?"

### Course Design Framework

### Managing Student Jupyter Workflows
**Teaching Jupyter Best Practices:**

1. **Cell Hygiene:** Teach students to organize cells logically
   - Setup cells at top
   - One function per cell when possible  
   - Clear outputs before sharing notebooks

2. **AI Iteration Strategy:** 
   - Always test AI suggestions in new cells first
   - Keep working versions before experimenting
   - Use markdown cells to document AI conversation highlights

3. **Data Management:**
   - Save processed datasets as CSV files
   - Version control for significant changes
   - Clear variable names that reflect data content

### 3-Week Programming Unit Template

**Week 1: Text Processing & Pattern Recognition**
- **AI Strategy:** Code comprehension and debugging assistance
- **AI Prompts Focus:** "Explain what this code does" and "Fix this error"
- **Computational Concept:** Loops and conditional logic  
- **Humanities Connection:** Close reading → algorithmic pattern detection

**Week 2: Data Analysis & Visualization**
- **AI Strategy:** Conceptual application and method comparison
- **AI Prompts Focus:** "How would I adapt this for my research?" and "What does this pattern mean?"
- **Computational Concept:** Data structures and statistical thinking
- **Humanities Connection:** Quantitative analysis of cultural texts

**Week 3: Interpretation & Critique**  
- **AI Strategy:** Critical evaluation of computational approaches
- **AI Prompts Focus:** "What are the limitations?" and "How does this compare to traditional methods?"
- **Computational Concept:** Algorithm design and limitations
- **Humanities Connection:** Hermeneutics and computational interpretation

---

## AI Integration Best Practices

### What Works ✓
- Layered AI prompting for different skill levels
- Building on prior computational experience
- Connecting code generation to analytical thinking
- Using AI to focus on concepts over syntax

### What to Avoid ✗
- AI as a black box students can't interrogate
- Over-reliance without understanding fundamentals  
- One-size-fits-all AI assistance approaches
- Code generation without research context

---

## Disciplinary Applications

### Historical Studies
**Research Questions:**
- How do anniversary commemorations reveal evolving historical consciousness?
- What patterns in historical discourse show shifting collective memory?

**AI Prompts:**
- "How can computational temporal analysis complement traditional historical methods?"
- "What biases might be present in digital historical discourse data?"
- "Create code to identify historical references and commemorative language in social media posts"

### Literary Studies  
**Research Questions:**
- How do narrative conventions appear in social media storytelling?
- What forms of community emerge around shared literary texts?

**AI Prompts:**
- "How do we apply close reading techniques to computational analysis results?"
- "Generate code to identify narrative structures and literary devices in short-form social media text"
- "What's the relationship between algorithmic pattern detection and literary interpretation?"

### Cultural Studies
**Research Questions:**
- How do digital communities negotiate cultural identity?
- What role do platform affordances play in cultural practices?

**AI Prompts:**
- "How can computational methods reveal cultural patterns while preserving meaning?"
- "Create functions to identify and analyze cultural identity markers in social media text"
- "What ethical frameworks should guide digital cultural analysis?"

---

## Quick Implementation Guide

### This Week:
- Try one AI-assisted coding exercise in your current course
- Experiment with different prompt structures for your students
- Use AI to help create one programming activity for your discipline

### This Month:
- Design an AI-integrated assignment using these prompting strategies
- Connect with colleagues doing similar experiments
- Document successful AI interactions and prompt patterns

### This Semester:
- Pilot a full unit using these AI assistance strategies
- Collect student feedback on AI learning experiences
- Share results with DH pedagogy community

---

## AI Prompt Bank for Students

### Debugging & Comprehension
- "This code isn't working. Here's the error message: [paste error]"
- "Explain what each line of this code accomplishes"
- "How is this different from the approach I used in [previous project]?"
- "I don't understand why this function returns [unexpected result]. Can you walk through it?"

### Conceptual Application
- "How would I adapt this method for [specific research question]?"
- "What other analysis techniques could I apply to this type of data?"
- "Connect this computational approach to [disciplinary method or theory]"
- "I want to modify this analysis to focus on [specific aspect]. How would I start?"

### Critical Analysis
- "What are the limitations of this analytical approach for [research context]?"
- "What assumptions are embedded in this algorithm or method?"
- "How might this computational method bias results toward certain conclusions?"
- "What would be a more rigorous approach to validate these findings?"

### Code Generation and Development
- "Create a function that [specific task] using [specific libraries or approaches]"
- "How do I extend this basic analysis to include [additional features]?"
- "I need to process [type of data] to extract [specific information]. Help me design the workflow"
- "Build a visualization that shows [specific pattern or relationship] in my dataset"

---

## Resources & Follow-Up

### Workshop Materials
- Starter Jupyter notebook template with AI prompts
- Complete AI prompt library organized by skill level
- Sample assignment frameworks for different disciplines

### Professional Development
- Digital Humanities pedagogy networks
- AI in education research communities  
- Programming education best practices

### Assessment Strategies
- Focus on process documentation and AI interaction reflection
- Emphasize interpretation alongside technical execution
- Include peer review of AI-assisted work
- Measure growth in computational thinking through iterative portfolios