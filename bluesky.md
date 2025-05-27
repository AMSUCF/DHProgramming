# Programming Pedagogy Through Social Media Analysis

## Purpose

This tutorial demonstrates programming instruction for humanities contexts while you simultaneously learn computational analysis methods. You'll experience different AI-assisted learning approaches and observe pedagogical strategies adaptable to your own teaching contexts.

---

## AI-Assisted Learning Framework

Throughout this workshop, you'll encounter prompts designed for different comfort levels with programming. Notice how each approach serves different student needs in your classes.

### **Comprehension-Focused Prompts**
For students building foundational understanding:
- "Walk me through what this code accomplishes step by step"
- "What happens if I modify this parameter? Why?"
- "Explain the logic behind this approach in plain language"

### **Application-Focused Prompts**
For students connecting programming to disciplinary knowledge:
- "How does computational pattern recognition compare to traditional close reading?"
- "What research questions in my field could benefit from temporal analysis?"
- "How do we interpret statistical results within humanistic frameworks?"

### **Critical Analysis Prompts**
For students ready to evaluate computational approaches:
- "What assumptions about culture underlie this data collection method?"
- "How might platform design influence the patterns we observe?"
- "What are the limitations of applying quantitative methods to cultural phenomena?"

---

## Step 1: Environment Setup

**Pedagogical Focus:** Removing technical barriers to emphasize conceptual learning.

### Setting Up Google Colab
1. Navigate to [colab.research.google.com](https://colab.research.google.com)
2. Create a new notebook: **File → New notebook**
3. Familiarize yourself with the interface

### Why Colab for Humanities Programming?
- No software installation required
- Consistent environment across different computers
- Built-in access to data science libraries
- Easy sharing and collaboration features

**Teaching Observation:** Notice how cloud-based tools eliminate the "it works on my machine" problem that often frustrates humanities students learning programming.

**AI Practice Prompts:**
- "What are the advantages and disadvantages of cloud-based programming environments for student learning?"
- "How do I structure a first programming lesson to minimize technical anxiety?"

---

## Step 2: Library Installation and Introduction

**Pedagogical Focus:** Demonstrating the building-block nature of programming.

### Installing Required Libraries
```python
!pip install atproto pandas matplotlib seaborn requests python-dotenv
```

### Understanding the Toolkit
Each library serves a specific purpose in digital humanities work:

- **atproto:** Connects to Bluesky's decentralized protocol
- **pandas:** Manipulates and analyzes structured data
- **matplotlib/seaborn:** Creates visualizations
- **requests:** Handles web-based data retrieval

**Teaching Moment:** Programming resembles traditional scholarship - we build on existing tools and methods rather than creating everything from scratch.

**AI Practice Prompts:**
- "Explain why programming uses libraries instead of writing everything from scratch"
- "How do I help students understand when to use different data analysis tools?"
- "What's an effective analogy for explaining programming libraries to humanities students?"

---

## Step 3: Data Collection - Understanding Digital Texts

**Pedagogical Focus:** Treating social media posts as cultural texts requiring interpretive frameworks.

### Authentication Setup
```python
from atproto import Client
from google.colab import userdata

# Using Colab's secure credential storage
username = userdata.get('BLUESKY_USERNAME')
app_password = userdata.get('BLUESKY_APP_PASSWORD')

client = Client()
client.login(username, app_password)
```

### Cultural and Ethical Considerations
Before collecting data, we must consider:
- **Consent and Privacy:** Public posts vs. intended audience
- **Representation:** Whose voices are included or excluded?
- **Context:** How platform design shapes expression
- **Purpose:** Academic research vs. commercial exploitation

**Teaching Observation:** Notice how technical instruction includes ethical reflection from the beginning, not as an afterthought.

**AI Practice Prompts:**
- "What ethical frameworks should guide digital humanities data collection?"
- "How do I teach students to recognize bias in digital datasets?"
- "What's the difference between studying public discourse and surveillance?"

---

## Step 4: Humanities Research Applications

**Pedagogical Focus:** Connecting computational methods to disciplinary research questions.

### Historical Studies Applications

**Research Questions:**
- How do contemporary discussions of historical events reveal shifting collective memory?
- What patterns in anniversary commemorations show evolving historical consciousness?
- How do digital communities construct and contest historical narratives?

```python
def analyze_historical_discourse(posts_df):
    """Examine how historical events are discussed and remembered"""
    
    # Identify temporal references
    historical_periods = ['civil war', 'world war', 'great depression', 'cold war']
    temporal_patterns = posts_df[posts_df['text'].str.contains('|'.join(historical_periods), case=False)]
    
    # Analyze commemorative language
    commemorative_words = ['remember', 'honor', 'anniversary', 'legacy']
    
    return temporal_patterns
```

**AI Practice Prompts:**
- "How can computational methods complement traditional historical research?"
- "What digital sources might historians overlook and why?"
- "How do we teach students to contextualize digital discourse within broader historical patterns?"

### Literary and Cultural Studies Applications

**Research Questions:**
- How do narrative conventions from traditional literature appear in social media storytelling?
- What forms of community-building emerge around shared literary texts?
- How do digital platforms influence genre development and evolution?

```python
def analyze_narrative_structures(posts_df):
    """Identify storytelling patterns in social media posts"""
    
    # Look for narrative markers
    story_beginnings = ['once', 'yesterday', 'story time', 'thread']
    narrative_devices = ['meanwhile', 'suddenly', 'then', 'finally']
    
    # Identify serialized content
    thread_markers = posts_df['text'].str.contains('1/', case=False)
    
    return narrative_analysis
```

**AI Practice Prompts:**
- "How do we apply close reading techniques to computational analysis results?"
- "What's lost and gained when we scale literary analysis computationally?"
- "How can students maintain critical perspective when using algorithmic tools?"

### Philosophy and Cultural Theory Applications

**Research Questions:**
- How do philosophical concepts circulate and transform in popular digital discourse?
- What ethical frameworks emerge in online community governance?
- How do digital technologies reshape fundamental concepts of identity and authority?

```python
def analyze_concept_circulation(posts_df):
    """Track how philosophical ideas spread and evolve"""
    
    # Identify philosophical terminology
    philosophical_terms = ['justice', 'freedom', 'truth', 'identity', 'community']
    
    # Analyze conceptual networks
    concept_patterns = posts_df[posts_df['text'].str.contains('|'.join(philosophical_terms), case=False)]
    
    return concept_analysis
```

### Religious Studies Applications

**Research Questions:**
- How do religious communities adapt traditional practices to digital environments?
- What new forms of spiritual expression emerge through social media?
- How do interfaith dialogues develop in online spaces?

**AI Practice Prompts:**
- "How do we teach students to respectfully analyze religious discourse computationally?"
- "What are the ethical considerations when studying online religious communities?"
- "How can computational methods reveal patterns while preserving spiritual meaning?"

---

## Step 5: Data Processing - From Raw to Interpretable

**Pedagogical Focus:** Understanding data as constructed, not naturally occurring.

### Processing Pipeline
```python
import pandas as pd
from datetime import datetime

def process_cultural_data(raw_posts):
    """Transform API data into analyzable cultural dataset"""
    
    processed_data = []
    for post in raw_posts.feed:
        # Extract cultural and temporal features
        post_data = {
            'created_at': post.post.record.created_at,
            'text': post.post.record.text,
            'engagement_total': post.post.reply_count + post.post.repost_count + post.post.like_count,
            'has_media': bool(post.post.embed),
            'character_count': len(post.post.record.text),
            'reply_context': post.reply is not None,
            'language_markers': extract_language_features(post.post.record.text)
        }
        processed_data.append(post_data)
    
    return pd.DataFrame(processed_data)
```

### Critical Questions for Students
- What assumptions about "meaningful" data underlie our processing choices?
- How does platform design influence what we can measure?
- What cultural nuances might computational processing obscure?

**Teaching Observation:** Notice how technical instruction includes interpretive questions that prepare students for humanistic analysis.

**AI Practice Prompts:**
- "How do I help students understand that data processing involves interpretive choices?"
- "What questions should humanities students ask about any dataset?"
- "How can we make the constructed nature of data visible to students?"

---

## Step 6: Temporal Analysis - Understanding Cultural Time

**Pedagogical Focus:** Connecting computational patterns to cultural and historical rhythms.

### Analyzing Posting Patterns
```python
# Daily activity patterns
df['date'] = pd.to_datetime(df['created_at']).dt.date
daily_activity = df.groupby('date').size()

# Hourly patterns revealing cultural rhythms
df['hour'] = pd.to_datetime(df['created_at']).dt.hour
df['weekday'] = pd.to_datetime(df['created_at']).dt.day_name()

# Weekend vs weekday cultural differences
weekend_patterns = df[df['weekday'].isin(['Saturday', 'Sunday'])]
weekday_patterns = df[~df['weekday'].isin(['Saturday', 'Sunday'])]
```

### Interpretive Framework
Computational time patterns require cultural interpretation:
- **Liturgical time:** How do religious observances appear in posting patterns?
- **Academic time:** How do semester cycles influence scholarly discourse?
- **Historical time:** How do anniversaries and commemorations shape temporal activity?
- **Personal time:** How do life rhythms vary across communities?

**AI Practice Prompts:**
- "How do we distinguish between technical artifacts and culturally meaningful patterns?"
- "What temporal frameworks from my discipline could inform computational time analysis?"
- "How can students learn to contextualize digital time within broader cultural patterns?"

---

## Step 7: Visualization as Argument

**Pedagogical Focus:** Understanding visualizations as rhetorical constructions, not neutral representations.

### Creating Interpretive Visualizations
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style appropriate for academic presentation
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Cultural activity heatmap
fig, ax = plt.subplots(figsize=(12, 8))
activity_pivot = df.pivot_table(
    values='text', 
    index='hour', 
    columns='weekday', 
    aggfunc='count',
    fill_value=0
)

sns.heatmap(activity_pivot, annot=True, fmt='d', cmap='YlOrRd', ax=ax)
ax.set_title('Community Activity Patterns: Cultural Rhythms in Digital Time')
ax.set_xlabel('Day of Week')
ax.set_ylabel('Hour of Day')
```

### Visual Rhetoric Considerations
Every visualization makes arguments:
- **Color choices:** What emotions or associations do colors evoke?
- **Scale decisions:** What patterns become visible or invisible?
- **Framing:** How do titles and labels shape interpretation?
- **Omissions:** What data remains outside the visualization frame?

**Teaching Observation:** Notice how visualization instruction includes critical media literacy alongside technical skills.

**AI Practice Prompts:**
- "How can students learn to read visualizations critically while creating them?"
- "What are common ways visualizations can mislead viewers about cultural patterns?"
- "How do we teach the relationship between aesthetic choices and argumentative force?"

---

## Step 8: Interpretation and Scholarly Context

**Pedagogical Focus:** Connecting computational results to disciplinary knowledge and theoretical frameworks.

### Contextualizing Computational Findings

#### Historical Contextualization
```python
def contextualize_temporal_patterns(activity_data, historical_events):
    """Connect computational patterns to historical context"""
    
    # Identify anomalous activity periods
    activity_threshold = activity_data.mean() + (2 * activity_data.std())
    high_activity_periods = activity_data[activity_data > activity_threshold]
    
    # Cross-reference with historical events
    contextual_analysis = []
    for date, activity_level in high_activity_periods.items():
        potential_contexts = check_historical_events(date, historical_events)
        contextual_analysis.append({
            'date': date,
            'activity_level': activity_level,
            'potential_contexts': potential_contexts
        })
    
    return contextual_analysis
```

#### Literary and Cultural Analysis
- **Genre theory:** How do social media posts negotiate between personal narrative and public discourse?
- **Community formation:** What linguistic markers indicate belonging or exclusion?
- **Cultural transmission:** How do ideas, values, and practices spread through digital networks?

### Scholarly Integration Strategies
- **Primary/Secondary Source Framework:** Treating social media as primary cultural documents requiring scholarly interpretation
- **Theoretical Application:** Applying disciplinary theories (postcolonial, feminist, historical) to computational findings
- **Methodological Triangulation:** Combining computational analysis with traditional humanities methods

**AI Practice Prompts:**
- "How can computational findings inform traditional humanities arguments?"
- "What disciplinary theories could help interpret these digital cultural patterns?"
- "How do we teach students to maintain scholarly rigor when working with large-scale data?"

---

## Step 9: Pedagogical Reflection and Course Design

**Pedagogical Focus:** Translating this workshop experience into effective course design.

### Adapting These Methods for Your Courses

#### For Introductory Programming Courses
**Scaffolding Strategies Observed:**
- Begin with conceptual understanding before syntax
- Use discipline-specific examples throughout
- Integrate ethical reflection from the beginning
- Provide multiple AI assistance entry points

**Implementation Ideas:**
- Replace generic programming exercises with humanities research questions
- Design assignments that build toward student research interests
- Create peer review structures that emphasize interpretation alongside technical accuracy

#### For Advanced Digital Humanities Methods
**Critical Integration Strategies Observed:**
- Evaluate computational methods within disciplinary frameworks
- Question assumptions embedded in technological tools
- Connect digital methods to broader scholarly conversations
- Maintain focus on humanistic research questions

#### For Cross-Disciplinary Courses
**Collaborative Learning Structures:**
- Pair students from different disciplines for mutual learning
- Design projects that require multiple methodological approaches
- Create presentation formats that communicate across disciplinary boundaries

### Assessment Strategies

#### **Process-Focused Assessment:**
- **Learning portfolios:** Document growth in computational thinking
- **Reflection essays:** Connect technical skills to disciplinary knowledge
- **Peer instruction:** Students teach concepts to reinforce learning

#### **Project-Based Assessment:**
- **Research proposals:** Adapt computational methods to student research interests
- **Methodological critiques:** Evaluate existing digital humanities projects
- **Collaborative projects:** Work across disciplines to address complex questions

**AI Practice Prompts:**
- "How can I design assessments that evaluate both technical skills and critical thinking?"
- "What rubrics effectively measure growth in computational thinking for humanities students?"
- "How do I create inclusive assessment practices for students with varying technical backgrounds?"

---

## Extension Opportunities

### Advanced Methods Integration

#### **Natural Language Processing**
- Sentiment analysis for historical documents
- Topic modeling for literary corpus analysis
- Named entity recognition in cultural texts

#### **Network Analysis**
- Social networks in historical correspondence
- Citation patterns in scholarly discourse
- Cultural influence mapping through digital traces

#### **Machine Learning Applications**
- Pattern recognition in visual culture
- Predictive modeling for cultural trends
- Classification of cultural artifacts

### Cross-Institutional Collaboration

#### **Shared Curriculum Development**
- Collaborative course design across institutions
- Resource sharing for humanities programming education
- Assessment standardization while maintaining disciplinary specificity

#### **Student Research Networks**
- Cross-institutional digital humanities projects
- Collaborative data collection and analysis
- Peer mentoring across technical skill levels

### Professional Development

#### **Conference Presentations**
- Digital humanities conference circuit
- Disciplinary conferences with computational methods panels
- Pedagogy-focused academic conferences

#### **Publication Opportunities**
- Digital humanities journals
- Disciplinary journals accepting computational methods
- Open-access platforms for sharing educational resources

**AI Practice Prompts:**
- "How can I build a professional network around digital humanities pedagogy?"
- "What venues exist for sharing innovative programming education approaches?"
- "How do I balance disciplinary identity with interdisciplinary collaboration?"

---

## Workshop Conclusion

### Key Takeaways for Course Design

**Technical Skill Development:**
- Prioritize conceptual understanding over syntax mastery
- Use AI assistance strategically to reduce barriers
- Connect programming concepts to disciplinary knowledge
- Scaffold complexity gradually while maintaining engagement

**Critical Digital Literacy:**
- Integrate ethical reflection throughout technical instruction
- Question assumptions embedded in computational tools
- Maintain humanistic research questions as primary focus
- Develop skills in evaluating digital methods and results

**Pedagogical Innovation:**
- Design inclusive learning environments for diverse technical backgrounds
- Create assessment strategies that value process and interpretation
- Foster collaborative learning across disciplinary boundaries
- Adapt instruction to serve both individual and institutional goals

### Next Steps

**Immediate Implementation:**
- Identify one existing course for computational methods integration
- Design AI-assisted learning activities appropriate to your student population
- Create assessment rubrics that balance technical and interpretive skills

**Longer-Term Development:**
- Build partnerships with colleagues in complementary disciplines
- Develop institutional resources for humanities programming education
- Contribute to scholarly conversations about digital humanities pedagogy

**Professional Growth:**
- Join digital humanities professional organizations and communities
- Attend conferences focused on computational methods in the humanities
- Establish research collaborations that combine technical and traditional methods

This workshop has modeled how programming education can serve humanistic inquiry while developing critical digital literacy. The approaches you've experienced can be adapted to serve diverse student populations, research interests, and institutional contexts while maintaining scholarly rigor and disciplinary integrity.