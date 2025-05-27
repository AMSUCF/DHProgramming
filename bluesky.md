# AI-Assisted Programming Pedagogy: Quick Reference Guide
*Social Media Analysis Workshop*



## Workshop Overview
**Building on Your Experience:** Combinatorial text generation → Social media data analysis  
**Focus:** AI pedagogy strategies for programming instruction  
**Time:** 10:40 AM - 12:00 PM, May 27th

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

## Session 1: Building on Text Processing Experience

### From Creative Text → Analytical Text
Your previous skills extend naturally:
- Text cleaning → Data preprocessing
- Pattern replacement → Pattern recognition  
- Creative constraints → Analytical filters
- Output verification → Result interpretation

### Sample Code - Basic Data Analysis
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import re
from collections import Counter

# Sample dataset
sample_posts = [
    {"text": "Excited about the new digital humanities semester!", "timestamp": "2025-01-15", "engagement": 12, "type": "academic"},
    {"text": "Reading Toni Morrison again - her work never gets old #literature", "timestamp": "2025-01-16", "engagement": 18, "type": "literary"},
    {"text": "Conference presentations due next week 😅 #phdlife", "timestamp": "2025-01-17", "engagement": 15, "type": "academic"}
]

df = pd.DataFrame(sample_posts)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['word_count'] = df['text'].str.split().str.len()
```

**AI Practice:** Try prompts from each level with this code

---

## Session 2: Pattern Recognition and Analysis

### Text Categorization (Building on Find/Replace Experience)
```python
def categorize_posts(text_series):
    """Categorize posts by content - similar to your text constraints"""
    categories = []
    for text in text_series:
        text_lower = text.lower()
        if any(word in text_lower for word in ['reading', 'book', 'author', 'literature']):
            categories.append('literary')
        elif any(word in text_lower for word in ['research', 'conference', 'semester', 'phd']):
            categories.append('academic')
        else:
            categories.append('general')
    return categories

df['auto_category'] = categorize_posts(df['text'])
```

### Text Analysis (Extending Your Text Manipulation)
```python
def analyze_text_features(df):
    """Extract features like you did with text elements"""
    all_text = ' '.join(df['text'].str.lower())
    words = re.findall(r'\b\w+\b', all_text)
    word_freq = Counter(words)
    
    academic_terms = ['research', 'analysis', 'conference', 'digital', 'reading']
    academic_word_freq = {word: count for word, count in word_freq.items() if word in academic_terms}
    
    return academic_word_freq

academic_words = analyze_text_features(df)
```

**Key Teaching Moment:** Students connect familiar text processing to analytical thinking

---

## Session 3: AI-Assisted Visualization

### From Text Outputs → Visual Analysis
```python
# Create comprehensive visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 1. Engagement by category
category_engagement = df.groupby('auto_category')['engagement'].mean()
category_engagement.plot(kind='barh', ax=axes[0,0])

# 2. Word count vs engagement  
axes[0,1].scatter(df['word_count'], df['engagement'])

# 3. Timeline
daily_engagement = df.groupby(df['timestamp'].dt.date)['engagement'].sum()
axes[1,0].plot(daily_engagement.index, daily_engagement.values, marker='o')

# 4. Category distribution
df['auto_category'].value_counts().plot(kind='pie', ax=axes[1,1])

plt.tight_layout()
plt.show()
```

### AI Interpretation Prompts by Level

**Beginner:**
- "What story does this engagement chart tell about academic vs literary posts?"

**Intermediate:**  
- "What cultural factors might explain this engagement pattern?"

**Advanced:**
- "What assumptions about social media behavior are embedded in these visualizations?"

---

## Session 4: Course Design Framework

### 3-Week Programming Unit Template

**Week 1: Text Processing & Pattern Recognition**
- **AI Strategy:** Code comprehension and debugging assistance
- **Computational Concept:** Loops and conditional logic  
- **Humanities Connection:** Close reading → algorithmic pattern detection

**Week 2: Data Analysis & Visualization**
- **AI Strategy:** Conceptual application and method comparison
- **Computational Concept:** Data structures and statistical thinking
- **Humanities Connection:** Quantitative analysis of cultural texts

**Week 3: Interpretation & Critique**  
- **AI Strategy:** Critical evaluation of computational approaches
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

### Literary Studies  
**Research Questions:**
- How do narrative conventions appear in social media storytelling?
- What forms of community emerge around shared literary texts?

**AI Prompts:**
- "How do we apply close reading techniques to computational analysis results?"
- "What's the relationship between algorithmic pattern detection and literary interpretation?"

### Cultural Studies
**Research Questions:**
- How do digital communities negotiate cultural identity?
- What role do platform affordances play in cultural practices?

**AI Prompts:**
- "How can computational methods reveal cultural patterns while preserving meaning?"
- "What ethical frameworks should guide digital cultural analysis?"

---

## Quick Implementation Guide

### This Week:
- Try one AI-assisted coding exercise in your current course
- Experiment with different prompt structures for your students
- Identify one place to integrate computational thinking

### This Month:
- Design an AI-integrated assignment for your discipline
- Connect with colleagues doing similar experiments
- Document what works and what doesn't

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

### Conceptual Application
- "How would I adapt this method for [specific research question]?"
- "What other analysis techniques could I apply to this data?"
- "Connect this computational approach to [disciplinary method]"

### Critical Analysis
- "What are the limitations of this analytical approach?"
- "What assumptions are embedded in this algorithm?"
- "How might this method bias results toward certain conclusions?"

---

## Resources & Follow-Up

### Workshop Materials
- All code examples in shared Colab notebook
- AI prompt templates for different skill levels
- Sample assignment frameworks

### Professional Development
- Digital Humanities pedagogy networks
- AI in education research communities  
- Programming education best practices

### Assessment Strategies
- Focus on process documentation and reflection
- Emphasize interpretation alongside technical execution
- Include peer review of AI-assisted work
- Measure growth in computational thinking, not just coding skills