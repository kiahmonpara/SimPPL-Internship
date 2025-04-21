"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, AlertTriangle, TrendingUp, FileText, MessageCircle, User, Hash } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'
import "@/styles/globals.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function EngagementAnalysis() {
  interface AnalysisData {
    word_counts: Record<string, number>;
    top_bad_words: { labels: string[]; counts: number[] };
    top_political_words: { labels: string[]; counts: number[] };
    subreddit_distribution: { labels: string[]; values: number[] };
    wordcloud: { general: { text: string; size: number }[] };
    summaries: { general: string; political: string; bad_words: string };
    stats: {
      unique_subreddits: number;
      total_posts: number;
      bad_words_count: number;
      political_words_count: number;
      misinfo_count: number;
      exceptional_posts: number;
    };
    top_misinfo: { labels: string[]; counts: number[] };
    report: string; 
  }

  const [data, setData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportSections, setReportSections] = useState<Record<string, string>>({})


useEffect(() => {
  async function loadData() {
    setIsLoading(true);
    try {
      const jsonResponse = await fetch('/api/analysis-data?source=local&path=python/input/all_visualization_data.json');
      if (!jsonResponse.ok) {
        throw new Error('Failed to load visualization data');
      }
      
      const jsonData = await jsonResponse.json();
      
      const hardcodedContent = {
      };
      
      setData({
        ...jsonData,
        report: ''
      });
      
      setReportSections(hardcodedContent);
      
      console.log("Successfully loaded content (hardcoded)");
    } catch (err) {
      console.error("Error loading analysis data:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }
  loadData();
  
  const style = document.createElement('style');
  style.textContent = `
    .markdown-content p {
      margin-bottom: 1.5rem;
      line-height: 1.7;
    }
    .markdown-content ul {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .markdown-content li {
      margin-bottom: 0.5rem;
    }
    .card-content-scroll {
      max-height: 800px;
      overflow-y: auto;
      padding-right: 10px;
      position: relative;
      z-index: 1;
    }
    .prose h3 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .prose h4 {
      margin-top: 1.25rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }
    .prose strong {
      font-weight: 600;
    }
    .chart-container {
      position: relative;
      margin: 1rem 0;
    }
    .tab-content-container {
      position: relative; 
      z-index: 1;
      padding-top: 1rem;
    }
    .sticky-tabs {
      position: sticky;
      top: 0;
      z-index: 50 !important;
      background-color: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  }
}, []);

  const parseMdIntoSections = (mdText: string) => {
    const sections: Record<string, string> = {};
    const lines = mdText.split('\n');
    let currentSection = 'overview';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = line.replace('## ', '').toLowerCase().trim();
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }
    
    if (currentSection) {
      sections[currentSection] = currentContent.trim();
    }
    
    return sections;
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .markdown-content p {
        margin-bottom: 1.5rem;
        line-height: 1.7;
      }
      .markdown-content ul {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
      .markdown-content li {
        margin-bottom: 0.5rem;
      }
      .card-content-scroll {
        max-height: 800px;
        overflow-y: auto;
        padding-right: 10px;
      }
      .prose h3 {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      .prose h4 {
        margin-top: 1.25rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }
      .prose strong {
        font-weight: 600;
      }
      .chart-container {
        position: relative;
        margin: 1rem 0;
      }
    `;
    document.head.appendChild(style);
    async function loadData() {
      try {
        const jsonResponse = await fetch('/api/analysis-data?source=local&path=python/input/all_visualization_data.json')
        if (!jsonResponse.ok) {
          throw new Error('Failed to load visualization data')
        }
        
        const [
          overviewRes,
          contentInsightsRes,
          sentimentRes,
          engagementRes,
          recommendationsRes
        ] = await Promise.all([
          fetch('https://simppl-python.onrender.com/api/markdown/overview'),
          fetch('https://simppl-python.onrender.com/api/markdown/content-analysis'),
          fetch('https://simppl-python.onrender.com/api/markdown/sentiment-analysis'),
          fetch('https://simppl-python.onrender.com/api/markdown/engagement-analysis'),
          fetch('https://simppl-python.onrender.com/api/markdown/recommendations')
        ]);
        
        const jsonData = await jsonResponse.json();
        
        const [
          overviewMd,
          contentInsightsMd,
         
        ] = await Promise.all([
          overviewRes.json(),
          contentInsightsRes.json(),
          sentimentRes.json(),
          engagementRes.json(),
          recommendationsRes.json()
        ]);
        
        const mdSections = {
          'overview': overviewMd.content || '',
          'ai-enhanced content insights': contentInsightsMd.content || '',
        
        };
        
       
        setData({
          ...jsonData,
          report: '' 
        });
        
        setReportSections(mdSections);
        console.log("Successfully loaded markdown content from API");
      } catch (err) {
        console.error("Error loading analysis data:", err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
  
    loadData()
    return () => {
      document.head.removeChild(style);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="gradient-card">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading Reddit analysis from analysis1.py...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="gradient-card">
          <CardContent className="flex items-center justify-center p-12 text-center">
            <div>
              <AlertTriangle size={36} className="text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to load analysis data</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

const extractSection = (content: string, sectionName: string, endSection?: string) => {
  try {
    if (!content) return "";
    
    const sectionStart = content.indexOf(`### ${sectionName}`);
    if (sectionStart === -1) return "";
    
    const sectionText = content.substring(sectionStart + `### ${sectionName}`.length);
    
    if (endSection) {
      const sectionEnd = sectionText.indexOf(`### ${endSection}`);
      if (sectionEnd === -1) return sectionText.trim();
      return sectionText.substring(0, sectionEnd).trim();
    }
    
    return sectionText.trim();
  } catch (error) {
    console.error(`Error extracting section ${sectionName}:`, error);
    return "";
  }
};
  const { 
    word_counts, 
    top_bad_words, 
    top_political_words, 
    subreddit_distribution, 
    wordcloud,
    summaries, 
    stats,
    top_misinfo
  } = data || {};

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: 'rgba(120, 120, 120, 0.9)',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'rgba(255, 255, 255, 1)',
          bodyColor: 'rgba(255, 255, 255, 1)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 4,
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(120, 120, 120, 0.1)',
          },
          ticks: {
            color: 'rgba(120, 120, 120, 0.8)',
          }
        },
        y: {
          grid: {
            color: 'rgba(120, 120, 120, 0.1)',
          },
          ticks: {
            color: 'rgba(120, 120, 120, 0.8)',
          }
        }
      }
    };

  const overviewStats = {
    totalPosts: 8799,
    dateRange: "2024-07-23 to 2025-02-18",
    totalSubreddits: 8,
    totalAuthors: 3599
  };

  const contentDistributionData = {
    labels: ['Political Words', 'Profanity', 'Potential Misinfo'],
    datasets: [
      {
        data: [
          word_counts?.["Political Words"] || 0,
          word_counts?.["Profanity"] || 0,
          word_counts?.["Potential Misinfo"] || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)', 
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const politicalTermsData = {
    labels: top_political_words?.labels.slice(0, 8) || [],
    datasets: [
      {
        label: 'Occurrences',
        data: top_political_words?.counts.slice(0, 8) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topSubredditsData = {
    labels: ['neoliberal', 'politics', 'worldpolitics', 'socialism', 'Liberal'],
    datasets: [
      {
        label: 'Posts',
        data: [993, 993, 989, 985, 984],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', 
          'rgba(245, 158, 11, 0.8)', 
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)', 
          'rgba(34, 197, 94, 0.8)', 
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const engagementData = {
    labels: ['Score', 'Comments', 'Upvote Ratio x100'],
    datasets: [
      {
        label: 'Average Value',
        data: [388.87, 68.25, 86],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', 
          'rgba(245, 158, 11, 0.8)', 
          'rgba(34, 197, 94, 0.8)', 
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [40, 40, 20], 
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', 
          'rgba(239, 68, 68, 0.8)', 
          'rgba(156, 163, 175, 0.8)', 
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card card-hover animate-fade-in">
        <CardHeader>
          <CardTitle> Engagement Analysis </CardTitle>
          <CardDescription>Engagement Analysis from {overviewStats.totalPosts.toLocaleString()} posts across {overviewStats.totalSubreddits} subreddits</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This dashboard presents analysis of Reddit data from {overviewStats.dateRange}, including content themes, 
            sentiment, political discourse, and engagement metrics.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">{overviewStats.totalPosts.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Total Posts</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">{overviewStats.totalAuthors.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Authors</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">0.04</span>
              <span className="text-xs text-muted-foreground">Avg. Sentiment</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">0.25</span>
              <span className="text-xs text-muted-foreground">Avg. Subjectivity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-50 md:grid-cols-5 bg-background/30 backdrop-blur-md sticky top-0 z-10">
          <TabsTrigger value="overview" className="transition-all duration-300 py-3">Overview</TabsTrigger>
          <TabsTrigger value="content" className="transition-all duration-300 py-3">Content Insights</TabsTrigger>
          <TabsTrigger value="engagement" className="transition-all duration-300 py-3">Engagement</TabsTrigger>
          <TabsTrigger value="sentiment" className="transition-all duration-300 py-3">Sentiment</TabsTrigger>
          <TabsTrigger value="recommendations" className="transition-all duration-300 py-3">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-fade-in pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key Statistics Card */}
            <Card className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-medium">{overviewStats.totalPosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Subreddits</span>
                    <span className="font-medium">{overviewStats.totalSubreddits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Authors</span>
                    <span className="font-medium">{overviewStats.totalAuthors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Range</span>
                    <span className="font-medium">{overviewStats.dateRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">388.87</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Comments</span>
                    <span className="font-medium">68.25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Subreddits Card */}
            <Card className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash size={18} className="text-primary" />
                  Top Subreddits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-background/40 to-background/20 rounded-md p-4">
                  <div style={{ height: '240px' }}>
                    <Doughnut data={topSubredditsData} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'bottom'
                        }
                      }
                    }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sentiment Overview Card */}
            <Card className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  Sentiment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '240px' }}>
                  <Pie data={sentimentData} options={{
                    ...chartOptions,
                  }} />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Average Sentiment: 0.04 (scale: -1 to 1)<br/>
                  Average Subjectivity: 0.25 (scale: 0 to 1)
                </div>
              </CardContent>
            </Card>
            
            {/* Top Authors Card */}
            <Card className="gradient-card md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Top Authors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-background/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2 text-sm">Author</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>M_i_c_K</span>
                          <span className="font-medium">246</span>
                        </li>
                        <li className="flex justify-between">
                          <span>John3262005</span>
                          <span className="font-medium">194</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Walk1000Miles</span>
                          <span className="font-medium">145</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Prudent_Bug_1350</span>
                          <span className="font-medium">141</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Ask4MD</span>
                          <span className="font-medium">137</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 text-sm">Top Posts</h3>
                      <ul className="space-y-2 text-sm">
                        <li>Trump Fires Hundreds of Staff Overseeing Nuclear Weapons: Report (49,905)</li>
                        <li>Trump to Fire Hundreds From FAA Despite Four Deadly Crashes on His Watch (44,467)</li>
                        <li>"We've been betrayed:" Local veterans angry after being laid off by Trump administration (41,400)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Engagement Metrics Card */}
            <Card className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChartIcon size={18} className="text-primary" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div style={{ height: '240px' }}>
                  <Bar data={engagementData} options={{
                    ...chartOptions,
                  }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Insights Tab */}

<TabsContent value="content" className="space-y-4 animate-fade-in pt-4">
  <Card className="gradient-card">
    <CardHeader>
      <CardTitle>Content Insights</CardTitle>
    </CardHeader>
    <CardContent className="prose max-w-none card-content-scroll">
      <div className="markdown-content space-y-6">
        <h3>Key Themes</h3>
        <div className="text-gray-800 dark:text-gray-300">
          <p>Here are 5 key themes/topics that emerge from the Reddit post titles:</p>

          <ol className="space-y-4 mt-4">
            <li>
              <strong className="text-primary">Anarchism and Related Political Ideologies:</strong> This is a dominant theme, evident in posts about anarcho-nihilism, German and US anarchism, anarchist collectives, and punk's relation to anarchist education. The discussion of social ecology, anti-Stalinism, and even the focus on mutual aid further reinforces this theme.
            </li>
            
            <li>
              <strong className="text-primary">Social Justice and Protest:</strong> Several posts focus on activism, resistance, and specific social justice issues. Examples include protesting TERFs, Palestinian solidarity, commentary on George Washington's history, and the encouragement of mask wearing during COVID in support of liberation. This theme also includes the discussion of counter-protest tactics and finding local protests.
            </li>
            
            <li>
              <strong className="text-primary">Critique of Power Structures/Authority:</strong> This is a more general theme but is definitely present. Posts about not paying taxes or student loans, questioning war, and sabotage directly challenge the authority of the state and financial institutions. The naturalization of nationalism is also under consideration.
            </li>
            
            <li>
              <strong className="text-primary">War and Conflict:</strong> Several posts deal directly with the topic of war, either in the present ("WE DONT WANT YOUR FUCKING WAR," "Will there be partisan groups in future wars?") or in the past (discussion of George Washington's actions against Native Americans, alternative history that may involve conflict).
            </li>
            
            <li>
              <strong className="text-primary">Education and Intellectual Discourse:</strong> This theme covers the more academic or informational aspects, including book discussions ("What Are You Reading"), recommendations for intellectual debate content, and general discussions ("So hear me out").
            </li>
          </ol>
        </div>
        
        <div className="mt-10 bg-background/20 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-6">Top Political Terms</h3>
          <div style={{ height: '240px' }}>
            <Bar data={politicalTermsData} options={{
              ...chartOptions,
              indexAxis: 'y' as const,
            }} />
          </div>
        </div>
        
        <h3>Content Depth Analysis</h3>
        <div className="text-gray-800 dark:text-gray-300">
          <p>The Reddit post titles analyzed demonstrate varying levels of intellectual engagement and depth, reflecting different user needs and community purposes:</p>

          <div className="mt-4">
            <p className="font-semibold text-primary mb-3">Depth Spectrum Analysis:</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">1. Surface-Level Engagement (approximately 30% of content)</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Simple announcements or meeting notices: "DENVER Friday 8pm meeting at Mutiny Comics and Coffee..."</li>
                  <li>Basic questions without context: "What are some good shows/podcasts..."</li>
                  <li>Emotional expressions without substantiation: "WE DONT WANT YOUR FUCKING WAR"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">2. Intermediate Engagement (approximately 50% of content)</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Questions that require topic familiarity: "Who do you think is the most powerful/popular anarch-nihilist ever?"</li>
                  <li>Resource sharing with minimal context: "Free PDF of The Master's Tools"</li>
                  <li>Opinion statements with implied reasoning: "George Washington was the original American terrorist"</li>
                  <li>Practical action-oriented questions: "How do I protest TERFs?"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">3. Deep Engagement (approximately 20% of content)</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Conceptual explorations: "The naturalization of nationalism doesn't get talked about enough"</li>
                  <li>Content referencing specific theories or historical contexts: ""WTF is Social Ecology?" by Usufruct Collective"</li>
                  <li>Discussions involving intersectional analysis: References to anarchism in relation to other concepts</li>
                  <li>Complex ethical questions: Discussions about tactics, resistance methods, and theoretical frameworks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="card-content-scroll">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 prose max-w-none">
                  <div className="markdown-content space-y-6">
                    <h3>Engagement Overview</h3>
                    <p>Analysis of user engagement across {overviewStats.totalPosts.toLocaleString()} Reddit posts reveals several key patterns:</p>
                    <ul>
                      <li>The average post score is <strong>388.87</strong>, indicating moderate engagement</li>
                      <li>Posts receive an average of <strong>68.25</strong> comments, suggesting active discussions</li>
                      <li>The average upvote ratio is <strong>0.86</strong>, showing generally positive reception</li>
                    </ul>
                    
                    <h3>Top Posts by Engagement</h3>
                    <ol>
                      <li>Trump Fires Hundreds of Staff Overseeing Nuclear Weapons: Report (49,905 score)</li>
                      <li>Trump to Fire Hundreds From FAA Despite Four Deadly Crashes on His Watch (44,467 score)</li>
                      <li>"We've been betrayed:" Local veterans angry after being laid off by Trump administration (41,400 score)</li>
                      <li>This is the correct response to Trump's reaction to recent tragedy (40,990 score)</li>
                      <li>Trump officials fired nuclear staff not realizing they oversee the country's weapons stockpile, sources say (38,220 score)</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChartIcon size={18} className="text-primary" />
                      <h3 className="font-medium">Engagement Metrics</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                      <Bar data={engagementData} options={{
                        ...chartOptions,
                      }} />
                    </div>
                  </div>
                  
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent className="card-content-scroll">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 prose max-w-none">
                  <div className="markdown-content space-y-6">
                    <h3>Sentiment Context</h3>
                    <ReactMarkdown>{reportSections['ai-enhanced content insights']?.split('### Sentiment Context')[1]?.split('### User Intent Analysis')[0] || "Okay, let's dive into the emotional tone and possible context of these Reddit post titles, going beyond basic positive/negative sentiment and looking for more nuanced emotional cues.  I'll break it down piece by piece:\n\n**1. \"What Are You Reading/Book Club Tuesday\"**\n\n*   **Emotional Tone:**  Neutral, inquisitive, potentially inviting.  A hint of routine or habit (\"Tuesday\").\n*   **Possible Context:** A regular book club or discussion group seeking engagement.  It's likely a relaxed and welcoming atmosphere, focused on sharing and discovering new ideas.\n\n**2. \"\"WTF is Social Ecology?\" by Usufruct Collective\"**\n\n*   **Emotional Tone:** Confused, frustrated, potentially a little aggressive (the \"WTF\").  Also, a strong desire for understanding.\n*   **Possible Context:** Someone encountering the concept of social ecology for the first time and struggling to grasp it. The \"Usufruct Collective\" may be a group associated with the theory, suggesting the poster is directly responding to their work.\n\n**3. \"Who do you think is the most powerful/popular anarch-nihilist ever?\"**\n\n*   **Emotional Tone:**  Inquisitive, potentially provocative.  A mix of admiration and intellectual curiosity. There is a hint of challenging established norms.\n*   **Possible Context:**  A discussion prompt aimed at exploring the figures and ideas within anarcho-nihilism.  Likely looking for a debate about influence and impact.\n\n**4. \"Not paying student loans or taxes\"**\n\n*   **Emotional Tone:** Defiant, rebellious, potentially stressed or anxious (masked by the defiance)."}</ReactMarkdown>
                    
                                      </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <PieChartIcon size={18} className="text-primary" />
                      <h3 className="font-medium">Sentiment Distribution</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                      <Pie data={sentimentData} options={{
                        ...chartOptions,
                      }} />
                    </div>
                  </div>
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={18} className="text-primary" />
                      <h3 className="font-medium">Content Warnings</h3>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Negative Content</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-muted-foreground">Positive Content</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-muted-foreground">Neutral Content</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-3">
                        <div className="bg-gray-500 h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Key Findings and Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none card-content-scroll">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background/20 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-primary mb-4">Key Findings</h3>
                  <ReactMarkdown>{reportSections['key findings']?.split('1.', 1)[0] || ""}</ReactMarkdown>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Content sentiment averages 0.04, indicating an overall neutral tone.</li>
                    <li>There is no strong correlation between sentiment and post score.</li>
                    <li>The most active day for posting is Monday.</li>
                    <li>Crossposts account for 2.7% of all posts.</li>
                  </ol>
                </div>
                <div className="bg-background/20 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-primary mb-4">Most Common Categories</h3>
                  <p className="mb-4">The most common content categories are:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Other</li>
                    <li>Politics</li>
                    <li>Educational</li>
                  </ul>
                  
                  <div style={{ height: '200px' }}>
                    
                   
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-primary mb-4">Recommendations</h3>
              <div className="bg-background/20 rounded-lg p-6 mt-6">
                <ol className="list-decimal pl-6 space-y-4">
                  <li>Content with neutral sentiment tends to perform better.</li>
                  <li>The most engaging content categories are Other and Politics.</li>
                  <li>Posts related to political figures (especially Trump) generate significantly higher engagement.</li>
                  <li>Content related to job loss, government employees, and policy changes receives strong engagement.</li>
                </ol>
              </div>
              
              <div className="bg-background/20 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-primary mb-4">Content Depth Analysis</h3>
                <ReactMarkdown>{reportSections['ai-enhanced content insights']?.split('### Content Depth')[1] || "The Reddit post titles analyzed demonstrate varying levels of intellectual engagement and depth, reflecting different user needs and community purposes:\n\n**Depth Spectrum Analysis:**\n\n1. **Surface-Level Engagement** (approximately 30% of content)\n   * Simple announcements or meeting notices: \"DENVER Friday 8pm meeting at Mutiny Comics and Coffee...\"\n   * Basic questions without context: \"What are some good shows/podcasts...\"\n   * Emotional expressions without substantiation: \"WE DONT WANT YOUR FUCKING WAR\"\n\n2. **Intermediate Engagement** (approximately 50% of content)\n   * Questions that require topic familiarity: \"Who do you think is the most powerful/popular anarch-nihilist ever?\"\n   * Resource sharing with minimal context: \"Free PDF of The Master's Tools\"\n   * Opinion statements with implied reasoning: \"George Washington was the original American terrorist\"\n   * Practical action-oriented questions: \"How do I protest TERFs?\"\n\n3. **Deep Engagement** (approximately 20% of content)\n   * Conceptual explorations: \"The naturalization of nationalism doesn't get talked about enough\"\n   * Content referencing specific theories or historical contexts: \"\"WTF is Social Ecology?\" by Usufruct Collective\"\n   * Discussions involving intersectional analysis: References to anarchism in relation to other concepts\n   * Complex ethical questions: Discussions about tactics, resistance methods, and theoretical frameworks\n\n**Observation:** The community appears to balance accessibility with deeper ideological exploration. While some posts invite newcomers with basic questions, others engage in more sophisticated discourse requiring subject matter knowledge. This suggests a community that both welcomes new participants while maintaining spaces for more advanced theoretical discussion."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}