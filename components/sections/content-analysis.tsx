"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, AlertTriangle, TrendingUp, FileText } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import "@/styles/globals.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

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

export default function ContentAnalysis() {
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
  }

  const [data, setData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/analysis-data')
        if (!response.ok) {
          throw new Error('Failed to load analysis data')
        }
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        console.error("Error loading analysis data:", err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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
    `;
    document.head.appendChild(style);
    
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
              <p>Loading social media analysis data...</p>
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

  const { 
    word_counts = {}, 
    top_bad_words = { labels: [], counts: [] }, 
    top_political_words = { labels: [], counts: [] }, 
    subreddit_distribution = { labels: [], values: [] }, 
    wordcloud = { general: [] },
    summaries = { general: '', political: '', bad_words: '' }, 
    stats = {
      unique_subreddits: 0,
      total_posts: 0,
      bad_words_count: 0,
      political_words_count: 0,
      misinfo_count: 0,
      exceptional_posts: 0
    },
    top_misinfo = { labels: [], counts: [] }
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

  const contentDistributionData = {
    labels: ['Political Words', 'Profanity', 'Potential Misinfo'],
    datasets: [
      {
        data: [
          word_counts["Political Words"] || 0,
          word_counts["Bad Words"] || 0,
          word_counts["Potential Misinfo"] || 0
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
    labels: top_political_words.labels.slice(0, 8),
    datasets: [
      {
        label: 'Occurrences',
        data: top_political_words.counts.slice(0, 8),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const badWordsData = {
    labels: top_bad_words.labels.slice(0, 10),
    datasets: [
      {
        label: 'Occurrences',
        data: top_bad_words.counts.slice(0, 10),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const riskAnalysisData = {
    labels: ['Profanity', 'Political Words', 'Potential Misinfo'],
    datasets: [
      {
        label: 'Count',
        data: [
          word_counts["Bad Words"],
          word_counts["Political Words"],
          word_counts["Potential Misinfo"]
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const subredditDistributionData = {
    labels: subreddit_distribution.labels.slice(0, 5),
    datasets: [
      {
        label: 'Posts',
        data: subreddit_distribution.values.slice(0, 5),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card card-hover animate-fade-in">
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
          <CardDescription>Comprehensive analysis of Reddit data across {stats.unique_subreddits} subreddits</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This dashboard presents analysis of {stats.total_posts.toLocaleString()} Reddit posts, including content themes, 
            sentiment, political discourse, and potentially problematic language.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">{stats.bad_words_count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Profanity</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">{stats.political_words_count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Political Terms</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-background/20 rounded-lg">
              <span className="text-xl font-bold text-primary">{stats.misinfo_count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Misinformation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-50 md:grid-cols-5 bg-background/30 backdrop-blur-md sticky top-0 z-10">
          <TabsTrigger value="dashboard" className="transition-all duration-300 py-3">Dashboard</TabsTrigger>
          <TabsTrigger value="summary" className="transition-all duration-300 py-3">Overall Summary</TabsTrigger>
          <TabsTrigger value="political" className="transition-all duration-300 py-3">Political Analysis</TabsTrigger>
          <TabsTrigger value="badwords" className="transition-all duration-300 py-3">Profanity</TabsTrigger>
          <TabsTrigger value="conclusions" className="transition-all duration-300 py-3">Conclusions</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="animate-fade-in pt-4">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="gradient-card shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="bg-primary/5 p-3 rounded-md flex justify-between items-center">
                    <span className="font-medium">Total Posts</span>
                    <span className="font-bold text-primary">{stats.total_posts.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Exceptional Posts</span>
                    <span className="font-medium">{stats.exceptional_posts}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Profanity Detected</span>
                    <span className="font-medium">{stats.bad_words_count}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Political Words</span>
                    <span className="font-medium">{stats.political_words_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Potential Misinformation</span>
                    <span className="font-medium">{stats.misinfo_count}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Unique Subreddits</span>
                    <span className="font-medium">{stats.unique_subreddits}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="gradient-card shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon size={18} className="text-primary" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-gradient-to-br from-background/40 to-background/20 rounded-md p-4">
                  <div style={{ height: '300px' }}>
                    <Pie data={contentDistributionData} options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                              size: 12
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </div>
                
                <div className="space-y-2.5 mt-4">
                  <div className="flex items-center justify-between bg-blue-500/10 p-2 rounded">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-sm">Political Words</span>
                    </div>
                    <span className="font-medium text-sm">{word_counts["Political Words"].toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between bg-amber-500/10 p-2 rounded">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-amber-500 mr-2"></span>
                      <span className="text-sm">Profanity</span>
                    </div>
                    <span className="font-medium text-sm">{word_counts["Bad Words"].toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-500/10 p-2 rounded">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                      <span className="text-sm">Misinfo</span>
                    </div>
                    <span className="font-medium text-sm">{word_counts["Potential Misinfo"].toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="gradient-card shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle size={18} className="text-primary" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-gradient-to-br from-background/40 to-background/20 rounded-md p-4">
                  <div style={{ height: '300px' }}>
                    <Bar data={riskAnalysisData} options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11
                            }
                          }
                        },
                        y: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                              size: 12,
                              weight: 'bold'
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Risk Level</span>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      <span className="h-2 w-2 rounded-full bg-gray-200"></span>
                      <span className="h-2 w-2 rounded-full bg-gray-200"></span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on content analysis of {stats.total_posts.toLocaleString()} posts 
                    with {word_counts["Bad Words"]} flagged terms
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Overall Summary</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none overflow-y-auto" style={{ maxHeight: '800px' }}>
              <div className="markdown-content space-y-6">
                <ReactMarkdown>{summaries.general}</ReactMarkdown>
              </div>
              
              
            </CardContent>
          </Card>
        </TabsContent>

        {/* Political Analysis Tab */}
        <TabsContent value="political" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Political Words and Engagement Analysis</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: '800px' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 prose prose-invert max-w-none">
                  <div className="markdown-content space-y-6">
                    <ReactMarkdown>{summaries.political}</ReactMarkdown>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChartIcon size={18} className="text-primary" />
                      <h3 className="font-medium">Top Political Terms</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                      <Bar data={politicalTermsData} options={{
                        ...chartOptions,
                        indexAxis: 'y' as const,
                      }} />
                    </div>
                  </div>
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <PieChartIcon size={18} className="text-primary" />
                      <h3 className="font-medium">Subreddit Distribution</h3>
                    </div>
                    <div style={{ height: '240px' }}>
                      <Bar data={subredditDistributionData} options={{
                        ...chartOptions,
                        indexAxis: 'y' as const,
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bad Words Tab */}
        <TabsContent value="badwords" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Profanity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: '800px' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 prose prose-invert max-w-none">
                  <div className="markdown-content space-y-6">
                    <ReactMarkdown>{summaries.bad_words}</ReactMarkdown>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-background/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChartIcon size={18} className="text-primary" />
                      <h3 className="font-medium">Top Profane Words</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                      <Bar data={badWordsData} options={{
                        ...chartOptions,
                        indexAxis: 'y' as const,
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
                        <span className="text-muted-foreground">Bad Words</span>
                        <span className="font-medium">{stats.bad_words_count}</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-3">
                        <div className="bg-amber-500 h-3 rounded-full" style={{ 
                          width: `${((stats.bad_words_count) / (stats.total_posts)) * 100 * 3}%` 
                        }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-muted-foreground">Potentially Harmful Content</span>
                        <span className="font-medium">{Math.round(stats.bad_words_count * 0.15)}</span>
                      </div>
                      <div className="w-full bg-background/40 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ 
                          width: `${((Math.round(stats.bad_words_count * 0.15)) / (stats.total_posts)) * 100 * 3}%` 
                        }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conclusions Tab */}
        <TabsContent value="conclusions" className="space-y-4 animate-fade-in pt-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Conclusions and Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background/20 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-primary mb-4">Key Findings</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Analyzed {stats.total_posts.toLocaleString()} posts across {stats.unique_subreddits} subreddits</li>
                    <li>Detected {stats.political_words_count.toLocaleString()} instances of political terminology</li>
                    <li>Identified {stats.bad_words_count} instances of problematic language</li>
                    <li>Found {stats.misinfo_count} potential misinformation markers</li>
                  </ul>
                </div>
                <div className="bg-background/20 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-primary mb-4">Content Focus</h3>
                  <p className="mb-4">Political content heavily dominated by:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    {top_political_words.labels.slice(0, 5).map((label, i) => (
                      <li key={i}>{label} ({top_political_words.counts[i]} mentions)</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-primary mb-4">Analysis & Recommendations</h3>
              <p className="mb-6">
                Based on the analysis, we recommend monitoring posts containing high concentrations of political terms, 
                as they may contribute to increased polarization. Implementing content moderation strategies for 
                posts with bad words could improve community health. Regular analysis of trending political 
                terminology can help identify potential misinformation early.
              </p>
              
              <div className="bg-background/20 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-primary mb-4">Next Steps</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Implement stronger content moderation for posts with high concentration of bad words</li>
                  <li>Develop balanced political content discovery to reduce polarization</li>
                  <li>Monitor trending political terms for early detection of misinformation</li>
                  <li>Run regular analysis on user engagement patterns to identify toxicity trends</li>
                </ul>
              </div>

              <div className="bg-background/20 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-medium text-primary mb-4">Top Misinformation Terms</h3>
                <div style={{ height: '240px' }}>
                  <Bar 
                    data={{
                      labels: top_misinfo.labels.slice(0, 5),
                      datasets: [{
                        label: 'Occurrences',
                        data: top_misinfo.counts.slice(0, 5),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1,
                      }]
                    }} 
                    options={{
                      ...chartOptions,
                      indexAxis: 'y' as const,
                    }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}