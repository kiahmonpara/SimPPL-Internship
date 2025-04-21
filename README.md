# Reddit Content Analysis API Server

This FastAPI-based server provides endpoints for accessing Reddit content analysis data, including sentiment analysis, content categories, political language detection, and more.

## Table of Contents

- [Overview](#overview)
- [Setup and Installation](#setup-and-installation)
- [Methodology](#methodology)
  - [Data Preparation](#data-preparation)
  - [Data Processing Pipeline](#data-processing-pipeline)
  - [Analysis Approach](#analysis-approach)
  - [AI-Enhanced Analysis](#ai-enhanced-analysis)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Data Endpoints](#data-endpoints)
  - [Image Endpoints](#image-endpoints)
  - [Markdown Content Endpoints](#markdown-content-endpoints)
  - [Utility Endpoints](#utility-endpoints)
- [Frontend Sections](#frontend-sections)
  - [Overview Section](#overview-section)
  - [Story Section](#story-section)
  - [Content Analysis Section](#content-analysis-section)
  - [Cross-Post Section](#cross-post-section)
  - [Engagement Analysis Section](#engagement-analysis-section)
- [Links](#links)


## Overview 

This server acts as a backend for a Reddit content analysis dashboard. It loads visualization data from JSON files, serves wordcloud images, and provides markdown content for analysis reports. The server implements fallback mechanisms to ensure data is available even when primary sources are missing.

## Setup and Installation

### Prerequisites

- Python 3.7+
- Required packages:
  - FastAPI
  - Uvicorn
  - pandas
  - nltk
  - matplotlib
  - textblob
  - networkx

### Installation

`pip install -r requirements.txt`


## Methodology

### Data Preparation

The analysis begins with raw Reddit data collected in JSONL format. Each line in the JSONL file represents a single Reddit post with associated metadata including:

- Post title and content
- Subreddit
- Author
- Creation timestamp
- Score, comment count, and upvote ratio
- User flairs and post flags

### Data Processing Pipeline

The data flows through a multi-stage processing pipeline:

1. **Initial Collection**: Raw Reddit data is collected in `data.jsonl` format with one post per line
2. **Conversion**: Converted `data.jsonl` to a structured `input.json` file
3. **Primary Processing**: 
    - Input data from input.json is processed to generate output1.json by `script.py`
    - Processing leverages generative AI for structured analysis
    - Posts are processed in batches of 10 for efficient handling of large datasets
    - AI extracts specific findings from each post
    - Identifies political terminology and potentially problematic language
    - Organizes results into structured format for visualization
    - Output includes detailed categorization, sentiment scores, and term frequency analysis
4. **Feature Extraction**: The processing extracts:
   - Sentiment scores 
   - Political terminology identification
   - Content categorization
   - Flagged terms detection
   - Subreddit distribution analysis
5. **Visualization Data Generation**: The final processed data is structured for visualization and API consumption

### Analysis Approach

The analysis implements several techniques:

- **Sentiment Analysis**: Determining positive, negative and neutral sentiment
- **Text Classification**: Categorizing content based on keywords and patterns
- **Entity Recognition**: Identifying political entities, organizations, and locations
- **Word Frequency Analysis**: For both general terms and specialized vocabularies
- **Network Analysis**: Examining relationships between subreddits and content themes
- **Temporal Analysis**: Looking at posting patterns over time

### AI-Enhanced Analysis

The final stage of analysis leverages generative AI to:

1. Provide structured summaries of the quantitative findings
2. Generate natural language insights about the data patterns
3. Create markdown reports with key observations for different aspects of the analysis
4. Offer contextual interpretation of the sentiment and content patterns
5. Suggest potential implications of the observed content trends

The AI-enhanced analysis is accessible through the markdown content endpoints in the API.

## Running the Server

Run the server using:

`cd simppl/ui/python`
`python image_server.py` 


This will start the server at `https://simppl-python.onrender.com`.

Alternatively, use Uvicorn directly:

`uvicorn image_server:app --reload --host 0.0.0.0 --port 8000`


## API Endpoints

### Data Endpoints

| Endpoint | Description |
| --- | --- |
| `/api/posts-per-day` | Time series data showing post frequency |
| `/api/content-categories` | Distribution of content by category |
| `/api/top-subreddits` | Most active subreddits |
| `/api/sentiment-vs-score` | Correlation between sentiment and score |
| `/api/sentiment-distribution` | Distribution of sentiment values |
| `/api/subreddit-distribution` | Posts across subreddits |
| `/api/top-bad-words` | Most frequent flagged words |
| `/api/top-political-words` | Most frequent political terms |
| `/api/crosspost-top` | Top sources/destinations for crossposts |
| `/api/crosspost-stats` | Statistics about crossposting behavior |

### Image Endpoints

| Endpoint | Description |
| --- | --- |
| `/api/political-wordcloud` | Wordcloud image of political terms |
| `/api/bad-words-wordcloud` | Wordcloud image of flagged terms |

### Markdown Content Endpoints

| Endpoint | Description |
| --- | --- |
| `/api/markdown/sentiment-analysis` | Sentiment analysis markdown |
| `/api/markdown/network-analysis` | Network analysis markdown |
| `/api/markdown/{section}` | Dynamically serve markdown sections |

### Utility Endpoints

| Endpoint | Description |
| --- | --- |
| `/api/debug` | Server status and file information |
| `/api/reload-data` | Force reload from JSON files |
| `/` | API information and endpoints list |

## Frontend Sections

### Overview Section

**Purpose**: Provides high-level summary of Reddit dataset with interactive visualizations showing posting patterns, content distribution, and sentiment analysis.

**Key Features**:
- Posts-per-day time series visualization
- Content category distribution charts
- Top subreddits analysis
- Sentiment vs. engagement correlation
- Political and problematic language wordclouds

### Story Section

**Purpose**: Examines narrative patterns in content spread, focusing on misinformation mechanics.

**Key Features**:
- Misinformation Vectors analysis
- Velocity Advantage explanation for false information spread
- Example posts with sentiment and engagement analysis
- Analysis of emotional triggers and tribal signaling

### Content Analysis Section

**Purpose**: Directly visualizes the outputs from Python analysis scripts.

**Key Features**:
- Statistical dashboard of posts, subreddits, and authors
- Content distribution visualizations
- Political term frequency analysis
- Problematic language detection
- Risk assessment metrics

### Cross-Post Section

**Purpose**: Analyzes how content spreads between communities through cross-posting.

**Key Features**:
- Network statistics dashboard
- Top source and destination community analysis
- Bridge user identification
- Echo chamber analysis and insights
- Network visualization guide

### Engagement Analysis Section

**Purpose**: Comprehensive analysis of user interaction patterns across five specialized tabs.

**Key Features**:
- Overview Tab: General statistics and top content metrics
- Content Insights Tab: Themes, political terminology, content depth
- Engagement Tab: Score and comment metrics analysis
- Sentiment Tab: Emotional tone analysis with context
- Recommendations Tab: Data-driven content strategy suggestions

### Links
- Video Reference: `https://youtu.be/0i2CjiSyurU`
- Hosted Site: ``