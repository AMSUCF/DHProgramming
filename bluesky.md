# AI-Assisted Programming Pedagogy: Quick Reference Guide
*Social Media Analysis Workshop*

## Workshop Overview
**Building on Your Experience:** Combinatorial text generation → Social media data analysis  
**Focus:** AI pedagogy strategies for programming instruction  
**Time:** 10:40 AM - 12:00 PM

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

### Bluesky API Authentication & Data Collection
```python
# Cell 1: Setup and Authentication
!pip install atproto pandas matplotlib seaborn requests

from atproto import Client
from google.colab import userdata
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import re
from collections import Counter

# Secure authentication (add credentials to Colab Secrets)
username = userdata.get('BLUESKY_USERNAME')  # your.handle.bsky.social
app_password = userdata.get('BLUESKY_APP_PASSWORD')  # generated in Bluesky settings

client = Client()
client.login(username, app_password)
print("✓ Authentication successful")
```

### Building Your Research Corpus
```python
# Cell 2: Data Collection (modify this cell with AI assistance)
def collect_user_posts(handle, limit=50):
    """Collect posts from a specific user"""
    try:
        profile = client.get_profile(handle)
        posts = client.get_author_feed(profile.did, limit=limit)
        return posts.feed
    except Exception as e:
        print(f"Error collecting posts from {handle}: {e}")
        return []

def collect_hashtag_posts(hashtag, limit=30):
    """Collect posts containing specific hashtag"""
    try:
        # Search for posts with hashtag
        search_results = client.app.bsky.feed.search_posts(
            params={'q': f'#{hashtag}', 'limit': limit}
        )
        return search_results.posts
    except Exception as e:
        print(f"Error searching hashtag {hashtag}: {e}")
        return []

# Example data collection - modify based on your research interests
target_users = ['example.bsky.social', 'another.user.bsky.social']  # Replace with real handles
target_hashtags = ['digitalhumanities', 'academictwitter', 'phdlife']

# Collect user posts
all_posts = []
for user in target_users:
    user_posts = collect_user_posts(user)
    all_posts.extend(user_posts)
    print(f"Collected {len(user_posts)} posts from {user}")

# Collect hashtag posts  
for hashtag in target_hashtags:
    hashtag_posts = collect_hashtag_posts(hashtag)
    all_posts.extend(hashtag_posts)
    print(f"Collected {len(hashtag_posts)} posts for #{hashtag}")

print(f"Total posts collected: {len(all_posts)}")
```

### Processing Real Data into Analysis Format
```python
# Cell 3: Data Processing (iterate this with AI help)
def process_bluesky_data(raw_posts):
    """Convert Bluesky API data to analysis-ready DataFrame"""
    processed_posts = []
    
    for post_wrapper in raw_posts:
        # Handle different API response structures
        if hasattr(post_wrapper, 'post'):
            post = post_wrapper.post
        else:
            post = post_wrapper
            
        try:
            post_data = {
                'text': post.record.text,
                'created_at': post.record.created_at,
                'author': post.author.display_name or post.author.handle,
                'handle': post.author.handle,
                'like_count': getattr(post, 'like_count', 0),
                'reply_count': getattr(post, 'reply_count', 0),
                'repost_count': getattr(post, 'repost_count', 0),
                'has_media': bool(getattr(post, 'embed', None)),
                'uri': post.uri
            }
            processed_posts.append(post_data)
        except Exception as e:
            print(f"Error processing post: {e}")
            continue
    
    return pd.DataFrame(processed_posts)

# Process collected data
df = process_bluesky_data(all_posts)

# Basic data cleaning and feature extraction
df['created_at'] = pd.to_datetime(df['created_at'])
df['total_engagement'] = df['like_count'] + df['reply_count'] + df['repost_count']
df['word_count'] = df['text'].str.split().str.len()
df['char_count'] = df['text'].str.len()
df['has_hashtag'] = df['text'].str.contains('#')
df['has_mention'] = df['text'].str.contains('@')

print(f"Processed {len(df)} posts successfully")
print(f"Date range: {df['created_at'].min()} to {df['created_at'].max()}")
print(f"Unique authors: {df['handle'].nunique()}")
```

**AI Iteration Strategy:** Use prompts like:
- "This data collection is only getting 10 posts per user. How can I get more?"
- "I'm getting an authentication error. What might be wrong?"
- "How do I modify this to collect posts from the last 30 days only?"

---

## Session 2: AI-Assisted Analysis with Real Data

### Jupyter Cell Management for Iterative Analysis
**Best Practices:**  
- **Test in new cells** before modifying working code
- **Comment out** previous versions instead of deleting
- **Use cell markdown** to document AI conversations
- **Save successful iterations** before experimenting further

### Content Analysis on Your Corpus
```python
# Cell 4: Content Analysis (iterate with AI)
def analyze_content_patterns(df):
    """Analyze patterns in your collected corpus"""
    
    # Extract topics based on your research interest
    academic_terms = ['research', 'conference', 'paper', 'publication', 'methodology', 'analysis']
    literary_terms = ['reading', 'book', 'author', 'narrative', 'poetry', 'literature', 'novel']
    digital_terms = ['digital', 'computational', 'data', 'algorithm', 'code', 'programming']
    
    # Categorize posts
    df['mentions_academic'] = df['text'].str.contains('|'.join(academic_terms), case=False)
    df['mentions_literary'] = df['text'].str.contains('|'.join(literary_terms), case=False)  
    df['mentions_digital'] = df['text'].str.contains('|'.join(digital_terms), case=False)
    
    # Create primary category
    def categorize_post(row):
        if row['mentions_academic']:
            return 'academic'
        elif row['mentions_literary']:
            return 'literary'
        elif row['mentions_digital']:
            return 'digital_methods'
        else:
            return 'general'
    
    df['primary_category'] = df.apply(categorize_post, axis=1)
    
    return df

# Apply analysis to your real data
df = analyze_content_patterns(df)

# View results
print("Content Analysis Results:")
print(f"Total posts analyzed: {len(df)}")
print("\nCategory breakdown:")
print(df['primary_category'].value_counts())

print(f"\nSample posts by category:")
for category in df['primary_category'].unique():
    sample_post = df[df['primary_category'] == category]['text'].iloc[0]
    print(f"\n{category.upper()}: {sample_post[:100]}...")
```

**AI Debugging Prompts:**
- "My categorization function is putting everything in 'general'. How do I debug this?"
- "I want to add sentiment analysis to this content analysis. How would I modify the function?"
- "The regex isn't catching variations like 'researching' or 'researcher'. Help me improve it."

### Temporal Analysis with Your Data
```python
# Cell 5: Temporal Analysis (AI-assisted iteration)
# Extract temporal features from your real data
df['date'] = df['created_at'].dt.date
df['hour'] = df['created_at'].dt.hour
df['weekday'] = df['created_at'].dt.day_name()
df['is_weekend'] = df['weekday'].isin(['Saturday', 'Sunday'])

# Analyze posting patterns
temporal_analysis = {
    'posts_per_day': df.groupby('date').size(),
    'posts_per_hour': df.groupby('hour').size(),
    'posts_per_weekday': df.groupby('weekday').size(),
    'engagement_by_hour': df.groupby('hour')['total_engagement'].mean(),
    'engagement_by_category': df.groupby('primary_category')['total_engagement'].mean()
}

print("Temporal Patterns in Your Corpus:")
print(f"Most active day: {temporal_analysis['posts_per_day'].idxmax()} ({temporal_analysis['posts_per_day'].max()} posts)")
print(f"Peak posting hour: {temporal_analysis['posts_per_hour'].idxmax()}:00")
print(f"Most active weekday: {temporal_analysis['posts_per_weekday'].idxmax()}")

print(f"\nEngagement patterns:")
for category, avg_engagement in temporal_analysis['engagement_by_category'].items():
    print(f"{category}: {avg_engagement:.1f} average engagement")
```

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

### Visualizing Your Real Corpus
```python
# Cell 6: Basic Visualization (start simple)
# Create initial plots of your data
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle(f'Analysis of {len(df)} Bluesky Posts', fontsize=16)

# 1. Posts by category
df['primary_category'].value_counts().plot(kind='bar', ax=axes[0,0])
axes[0,0].set_title('Posts by Content Category')
axes[0,0].set_ylabel('Number of Posts')

# 2. Engagement by author (top 10)
top_authors = df.groupby('handle')['total_engagement'].sum().nlargest(10)
top_authors.plot(kind='barh', ax=axes[0,1])
axes[0,1].set_title('Top 10 Authors by Total Engagement')

# 3. Daily posting activity
daily_posts = df.groupby('date').size()
axes[1,0].plot(daily_posts.index, daily_posts.values, marker='o')
axes[1,0].set_title('Daily Posting Activity')
axes[1,0].tick_params(axis='x', rotation=45)

# 4. Word count vs engagement
axes[1,1].scatter(df['word_count'], df['total_engagement'], alpha=0.6)
axes[1,1].set_xlabel('Word Count')
axes[1,1].set_ylabel('Total Engagement')
axes[1,1].set_title('Post Length vs Engagement')

plt.tight_layout()
plt.show()
```

### AI-Assisted Visualization Improvement
```python
# Cell 7: Improved Visualization (iterate with AI prompts)
# Use AI to enhance your visualizations based on patterns you notice

# Example of AI-suggested improvements:
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

fig, axes = plt.subplots(2, 3, figsize=(18, 12))
fig.suptitle(f'Deep Analysis: {len(df)} Posts from {df["handle"].nunique()} Authors', fontsize=16)

# 1. Enhanced category analysis with engagement
category_stats = df.groupby('primary_category').agg({
    'total_engagement': ['mean', 'count'],
    'word_count': 'mean'
}).round(2)

# Plot average engagement by category
category_engagement = df.groupby('primary_category')['total_engagement'].mean()
bars = axes[0,0].bar(category_engagement.index, category_engagement.values)
axes[0,0].set_title('Average Engagement by Category')
axes[0,0].set_ylabel('Average Engagement')
axes[0,0].tick_params(axis='x', rotation=45)

# Add value labels on bars
for bar in bars:
    height = bar.get_height()
    axes[0,0].text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.1f}', ha='center', va='bottom')

# 2. Hourly posting patterns heatmap
hourly_weekday = df.groupby(['hour', 'weekday']).size().unstack(fill_value=0)
day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
hourly_weekday = hourly_weekday.reindex(columns=day_order)

sns.heatmap(hourly_weekday, annot=True, fmt='d', cmap='YlOrRd', ax=axes[0,1])
axes[0,1].set_title('Posting Activity: Hour by Day')

# 3. Author engagement distribution
author_engagement = df.groupby('handle')['total_engagement'].sum().sort_values(ascending=False)
axes[0,2].hist(author_engagement.values, bins=20, alpha=0.7, edgecolor='black')
axes[0,2].set_title('Distribution of Author Total Engagement')
axes[0,2].set_xlabel('Total Engagement')
axes[0,2].set_ylabel('Number of Authors')

# 4. Word count vs engagement with trend line
x = df['word_count']
y = df['total_engagement']
axes[1,0].scatter(x, y, alpha=0.6, c=df['like_count'], cmap='viridis')
z = np.polyfit(x, y, 1)
p = np.poly1d(z)
axes[1,0].plot(x, p(x), "r--", alpha=0.8)
axes[1,0].set_xlabel('Word Count')
axes[1,0].set_ylabel('Total Engagement')
axes[1,0].set_title('Post Length vs Engagement (colored by likes)')

# 5. Hashtag usage analysis
hashtag_posts = df[df['has_hashtag']]
hashtag_rate = len(hashtag_posts) / len(df) * 100
no_hashtag_engagement = df[~df['has_hashtag']]['total_engagement'].mean()
hashtag_engagement = df[df['has_hashtag']]['total_engagement'].mean()

hashtag_comparison = pd.DataFrame({
    'Type': ['With Hashtags', 'Without Hashtags'],
    'Avg_Engagement': [hashtag_engagement, no_hashtag_engagement],
    'Count': [len(hashtag_posts), len(df) - len(hashtag_posts)]
})

bars = axes[1,1].bar(hashtag_comparison['Type'], hashtag_comparison['Avg_Engagement'])
axes[1,1].set_title('Hashtag Impact on Engagement')
axes[1,1].set_ylabel('Average Engagement')

# 6. Timeline with events marked
daily_activity = df.groupby('date').agg({
    'text': 'count',
    'total_engagement': 'sum'
}).rename(columns={'text': 'post_count'})

axes[1,2].plot(daily_activity.index, daily_activity['post_count'], 
               marker='o', label='Posts', linewidth=2)
ax2 = axes[1,2].twinx()
ax2.plot(daily_activity.index, daily_activity['total_engagement'], 
         marker='s', color='red', label='Engagement', alpha=0.7)
axes[1,2].set_title('Daily Activity and Engagement Over Time')
axes[1,2].set_xlabel('Date')
axes[1,2].set_ylabel('Number of Posts', color='blue')
ax2.set_ylabel('Total Engagement', color='red')
axes[1,2].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# Print key insights
print("Key Insights from Your Corpus:")
print(f"• Most engaging content type: {category_engagement.idxmax()} (avg: {category_engagement.max():.1f})")
print(f"• Hashtag usage rate: {hashtag_rate:.1f}% of posts")
print(f"• Hashtag engagement boost: {hashtag_engagement - no_hashtag_engagement:.1f} points")
print(f"• Most active day: {daily_activity['post_count'].idxmax()}")
print(f"• Correlation between length and engagement: {df['word_count'].corr(df['total_engagement']):.3f}")
```

### AI Visualization Iteration Prompts
**For improving plots:**
- "This scatter plot is too crowded. How can I make it clearer?"
- "I want to add a trend line to show the correlation. How do I do that?"
- "My heatmap is hard to read. Suggest better color schemes and formatting."

**For deeper analysis:**
- "What additional visualizations would reveal patterns in this social media data?"
- "I notice some outliers in the engagement data. How do I identify and analyze them?"
- "How can I create a dashboard-style layout that tells a cohesive story?"

---

## Session 4: Advanced Analysis and Course Design

### Managing Complex Analysis with Jupyter and AI

**Cell Organization for Advanced Work:**
```python
# Cell 8: Advanced Analysis Setup
# Keep this cell for importing specialized libraries as needed
import numpy as np
from scipy import stats
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import networkx as nx  # for network analysis if needed

print("Advanced analysis libraries loaded")
```

### Network Analysis of Your Corpus
```python
# Cell 9: User Interaction Network Analysis
def build_interaction_network(df):
    """Create network of user interactions based on mentions and replies"""
    
    # Extract mentions from posts
    df['mentions'] = df['text'].str.findall(r'@([a-zA-Z0-9._-]+)')
    
    # Build network edges
    edges = []
    for idx, row in df.iterrows():
        author = row['handle']
        mentions = row['mentions']
        for mention in mentions:
            # Add edge from author to mentioned user
            edges.append((author, mention, {'weight': 1, 'post_engagement': row['total_engagement']}))
    
    # Create network graph
    G = nx.DiGraph()
    G.add_edges_from(edges)
    
    return G, edges

# Analyze your corpus network
if len(df) > 10:  # Only run if we have sufficient data
    network, edges = build_interaction_network(df)
    
    print(f"Network Analysis of Your Corpus:")
    print(f"• Nodes (users): {network.number_of_nodes()}")
    print(f"• Edges (interactions): {network.number_of_edges()}")
    
    if network.number_of_nodes() > 0:
        # Calculate network metrics
        centrality = nx.degree_centrality(network)
        top_users = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:5]
        
        print(f"• Most connected users:")
        for user, centrality_score in top_users:
            print(f"  - {user}: {centrality_score:.3f}")
```

### Topic Modeling with AI Assistance
```python
# Cell 10: Topic Analysis (AI-guided implementation)
def extract_topics_from_corpus(df, n_topics=5):
    """Use TF-IDF and clustering to identify topics in your corpus"""
    
    # Prepare text data
    texts = df['text'].fillna('').tolist()
    
    # Remove very short posts
    texts = [text for text in texts if len(text.strip()) > 10]
    
    if len(texts) < 10:
        print("Not enough substantial posts for topic analysis")
        return None, None
    
    # TF-IDF vectorization
    vectorizer = TfidfVectorizer(
        max_features=100,  # Limit vocabulary
        stop_words='english',
        ngram_range=(1, 2),  # Include bigrams
        min_df=2  # Word must appear in at least 2 documents
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # K-means clustering
        kmeans = KMeans(n_clusters=n_topics, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(tfidf_matrix)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Extract top terms for each topic
        topics = {}
        for i in range(n_topics):
            # Get top terms for this cluster
            center = kmeans.cluster_centers_[i]
            top_indices = center.argsort()[-10:][::-1]  # Top 10 terms
            top_terms = [feature_names[idx] for idx in top_indices]
            topics[f'Topic_{i+1}'] = top_terms
            
        return topics, clusters
        
    except Exception as e:
        print(f"Topic analysis failed: {e}")
        return None, None

# Run topic analysis on your corpus
topics, topic_assignments = extract_topics_from_corpus(df, n_topics=3)

if topics:
    print("Topics Discovered in Your Corpus:")
    for topic_name, terms in topics.items():
        print(f"\n{topic_name}:")
        print(f"  Key terms: {', '.join(terms[:5])}")
        
    # Add topic assignments back to dataframe
    if topic_assignments is not None:
        df['topic_cluster'] = topic_assignments
        
        # Analyze topic engagement
        topic_engagement = df.groupby('topic_cluster')['total_engagement'].mean()
        print(f"\nTopic Engagement Analysis:")
        for topic_id, avg_engagement in topic_engagement.items():
            print(f"  Topic {topic_id + 1}: {avg_engagement:.1f} average engagement")
```

### AI-Assisted Corpus Validation and Improvement
```python
# Cell 11: Data Quality Assessment
def assess_corpus_quality(df):
    """Evaluate the quality and representativeness of your corpus"""
    
    assessment = {
        'total_posts': len(df),
        'unique_authors': df['handle'].nunique(),
        'date_range_days': (df['created_at'].max() - df['created_at'].min()).days,
        'avg_posts_per_author': len(df) / df['handle'].nunique(),
        'engagement_distribution': {
            'mean': df['total_engagement'].mean(),
            'median': df['total_engagement'].median(),
            'std': df['total_engagement'].std()
        },
        'content_diversity': {
            'avg_word_count': df['word_count'].mean(),
            'word_count_range': (df['word_count'].min(), df['word_count'].max()),
            'hashtag_usage': (df['has_hashtag'].sum() / len(df)) * 100,
            'media_usage': (df['has_media'].sum() / len(df)) * 100
        }
    }
    
    return assessment

# Assess your collected corpus
quality_report = assess_corpus_quality(df)

print("Corpus Quality Assessment:")
print(f"• Dataset size: {quality_report['total_posts']} posts from {quality_report['unique_authors']} authors")
print(f"• Time span: {quality_report['date_range_days']} days")
print(f"• Posts per author: {quality_report['avg_posts_per_author']:.1f} average")
print(f"• Engagement stats: μ={quality_report['engagement_distribution']['mean']:.1f}, σ={quality_report['engagement_distribution']['std']:.1f}")
print(f"• Content diversity:")
print(f"  - Average word count: {quality_report['content_diversity']['avg_word_count']:.1f}")
print(f"  - Hashtag usage: {quality_report['content_diversity']['hashtag_usage']:.1f}%")
print(f"  - Media usage: {quality_report['content_diversity']['media_usage']:.1f}%")

# AI prompts for corpus improvement
print(f"\nAI Prompts for Corpus Enhancement:")
if quality_report['total_posts'] < 100:
    print("• 'My corpus only has {quality_report['total_posts']} posts. How can I collect more data efficiently?'")
if quality_report['unique_authors'] < 10:
    print("• 'I need more diverse voices in my corpus. What strategies can help me find relevant accounts?'")
if quality_report['date_range_days'] < 7:
    print("• 'My data spans only {quality_report['date_range_days']} days. How do I collect historical posts?'")
```

**AI Iteration Prompts for Advanced Analysis:**
- "My topic modeling results don't make sense. How do I debug and improve the parameters?"
- "The network analysis shows no connections. Am I extracting mentions correctly?"
- "I want to add sentiment analysis to each topic. How would I integrate that?"
- "How can I validate these computational results against manual analysis?"

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