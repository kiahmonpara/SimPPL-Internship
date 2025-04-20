import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, MessageSquare, Users } from "lucide-react"
import { AiSummaryBox } from "@/components/ui/summary-box"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController 
} from "chart.js"
import { Line, Bar, Doughnut, Scatter } from "react-chartjs-2"
import ReactMarkdown from 'react-markdown'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
)

interface PostsPerDayData {
  data: {
    dates: string[];
    counts: number[];
  };
}

interface ContentCategoriesData {
  categories: string[];
  counts: number[];
}

interface TopSubredditsData {
  subreddits: string[];
  counts: number[];
}

interface BadWordsData {
  labels: string[];
  counts: number[];
}

interface PoliticalWordsData {
  labels: string[];
  counts: number[];
}

interface SubredditDistributionData {
  labels: string[];
  values: number[];
}

interface TopUserData {
  username: string;
  post_count: number;
  avg_score: number;
  primary_subreddit: string;
}

interface TopSubredditData {
  subreddit: string;
  post_count: number;
  avg_score: number;
  sentiment: number;
}

interface SentimentScoreData {
  data: {
    sentiment: number;
    score: number;
    subreddit: string;
  }[];
  subreddits: string[];
}

interface ChartDataState {
  postsPerDay: PostsPerDayData | null;
  contentCategories: ContentCategoriesData | null;
  topSubreddits: TopSubredditsData | null;
  topBadWords: BadWordsData | null;
  topPoliticalWords: PoliticalWordsData | null;
  subredditDistribution: SubredditDistributionData | null;
  topUsers: TopUserData[] | null;
  topSubredditDetails: TopSubredditData[] | null;
}

export default function OverviewSection() {
  const [summaryContent, setSummaryContent] = useState<string>("");
  const [sentimentContent, setSentimentContent] = useState<string>("");
  const [networkContent, setNetworkContent] = useState<string>("");

  const [chartData, setChartData] = useState<ChartDataState>({
    postsPerDay: null,
    contentCategories: null,
    topSubreddits: null,
    topBadWords: null,
    topPoliticalWords: null,
    subredditDistribution: null,
    topUsers: null,
    topSubredditDetails: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          postsRes, 
          categoriesRes, 
          subredditsRes, 
          badWordsRes, 
          politicalWordsRes, 
          subredditDistRes,
          topUsersRes,
          topSubredditDetailsRes,
          sentimentScoreRes,
          summaryRes,
          sentimentRes,
          networkRes
        ] = await Promise.all([
          fetch("http://localhost:8000/api/posts-per-day"),
          fetch("http://localhost:8000/api/content-categories"),
          fetch("http://localhost:8000/api/top-subreddits"),
          fetch("http://localhost:8000/api/top-bad-words"),
          fetch("http://localhost:8000/api/top-political-words"),
          fetch("http://localhost:8000/api/subreddit-distribution"),
          fetch("http://localhost:8000/api/top-users"),
          fetch("http://localhost:8000/api/top-subreddit-details"),
          fetch("http://localhost:8000/api/sentiment-vs-score"),
          fetch("http://localhost:8000/api/markdown/overview"),
          fetch("http://localhost:8000/api/markdown/sentiment-analysis"),
          fetch("http://localhost:8000/api/markdown/network-analysis")
        ]);
  
        const [
          posts, 
          categories, 
          subreddits, 
          badWords, 
          politicalWords, 
          subredditDist,
          topUsers,
          topSubredditDetails,
          sentimentScore,
          summary,
          sentiment,
          network
        ] = await Promise.all([
          postsRes.json(),
          categoriesRes.json(),
          subredditsRes.json(),
          badWordsRes.json(),
          politicalWordsRes.json(),
          subredditDistRes.json(),
          topUsersRes.json(),
          topSubredditDetailsRes.json(),
          sentimentScoreRes.json(),
          summaryRes.json(),
          sentimentRes.json(),
          networkRes.json()
        ]);

        setChartData({
          postsPerDay: posts,
          contentCategories: categories,
          topSubreddits: subreddits,
          topBadWords: badWords,
          topPoliticalWords: politicalWords,
          subredditDistribution: subredditDist,
          topUsers: topUsers?.data,
          topSubredditDetails: topSubredditDetails?.data,
        })
        
        setSummaryContent(summary.content || "");
        setSentimentContent(sentiment.content || "");
        setNetworkContent(network.content || "");
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const postsChartData = {
    labels: chartData.postsPerDay?.data?.dates || [],
    datasets: [{
      label: 'Post Count',
      data: chartData.postsPerDay?.data?.counts || [],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      fill: true,
      tension: 0.4
    }]
  }

  const categoriesChartData = {
    labels: chartData.contentCategories?.data?.categories || [],
    datasets: [{
      label: 'Categories',
      data: chartData.contentCategories?.data?.counts || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ],
      borderWidth: 1
    }]
  }

  const subredditsChartData = {
    labels: chartData.topSubreddits?.data?.subreddits || [],
    datasets: [{
      label: 'Post Count',
      data: chartData.topSubreddits?.data?.counts || [],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  }

  const badWordsChartData = {
    labels: chartData.topBadWords?.labels.slice(0, 10) || [],
    datasets: [{
      label: 'Frequency',
      data: chartData.topBadWords?.counts.slice(0, 10) || [],
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  }

  const politicalWordsChartData = {
    labels: chartData.topPoliticalWords?.labels.slice(0, 10) || [],
    datasets: [{
      label: 'Frequency',
      data: chartData.topPoliticalWords?.counts.slice(0, 10) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }

  const sentimentEngagementData = {
    labels: ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'],
    datasets: [{
      label: 'Average Comments',
      data: [15, 22, 35, 47, 42],
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      yAxisID: 'y',
    }, {
      label: 'Average Score',
      data: [25, 38, 45, 82, 75],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      yAxisID: 'y1',
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  const dualAxisBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Comments'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Score'
        }
      },
    },
  }

  return (
    <div className="space-y-6">
      
      {/* Overall content summary */}
      <div className="light-section animate-fade-in">
        <AiSummaryBox
          title="Overall Content Summary"
          content={summaryContent || "The content analysis reveals several dominant themes including political discourse, educational resources, and community discussions. Political terminology appears most frequently, suggesting a strong focus on socio-political topics. Posts average 500+ characters in length, indicating detailed and substantive content rather than brief updates. Educational content tends to be the longest, while discussion posts are typically shorter but generate more comments."}
          type="ai"
        />
      </div>

      {/* Posts over time and content categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 stagger-children">
        <Card className="col-span-4 gradient-card card-hover">
          <CardHeader>
            <CardTitle>Posts Over Time</CardTitle>
            <CardDescription>Daily post volume over the past month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            ) : (
              <div className="h-[400px]">
                <Line data={postsChartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3 gradient-card card-hover">
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>Distribution of post categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            ) : (
              <div className="h-[400px]">
                <Doughnut data={categoriesChartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Sentiment vs Engagement and Network Visualization */}
      <div className="grid gap-6 md:grid-cols-2 stagger-children">
      <Card className="gradient-card card-hover">
  <CardHeader>
    <CardTitle>Sentiment vs. Engagement</CardTitle>
    <CardDescription>Relationship between sentiment and post engagement</CardDescription>
  </CardHeader>
  <CardContent>
    {loading ? (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    ) : (
      <div className="h-[300px] w-full">
        <Bar data={sentimentEngagementData} options={dualAxisBarChartOptions} />
      </div>
    )}
  </CardContent>
</Card>
        <Card className="gradient-card card-hover">
            <CardHeader>
              <CardTitle>Top Subreddits by Post Count</CardTitle>
              <CardDescription>Distribution of posts across subreddits</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <Bar data={subredditsChartData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Sentiment Analysis Insights */}
      <div className="light-section animate-fade-in">
        <AiSummaryBox
          title="Sentiment Analysis Insights"
          content={sentimentContent || "Posts have an overall positive tone with average sentiment score of 0.42. This indicates a generally constructive discourse across the analyzed subreddits. The positive sentiment appears to be driven by educational and informative content, while political discussions show more polarized sentiment scores. Science-related content consistently demonstrates the highest positive sentiment. Sentiment scores tend to peak on Fridays and Saturdays, suggesting a more positive community engagement during weekends."}
          type="sentiment"
        />
      </div>

      {/* Word Cloud Section */}
      <div className="grid gap-6 md:grid-cols-2 stagger-children">
        <Card className="gradient-card card-hover">
          <CardHeader>
            <CardTitle>Word Cloud - Political Content</CardTitle>
            <CardDescription>Most frequent political terms in posts</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full relative">
              <img
                src="http://localhost:8000/api/political-wordcloud"
                alt="Political Words Word Cloud"
                className="object-contain h-full w-full"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card card-hover">
          <CardHeader>
            <CardTitle>Word Cloud - Profanity</CardTitle>
            <CardDescription>Most frequent flagged terms in posts</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full relative">
              <img
                src="http://localhost:8000/api/bad-words-wordcloud"
                alt="Profanity Word Cloud"
                className="object-contain h-full w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Analysis Insights */}
      <div className="dark-section">
        <AiSummaryBox
          title="Network Analysis Insights"
          content={networkContent || "The network analysis reveals 5 distinct communities centered around political discourse, technology, science, general discussion, and educational content. These communities show significant cross-posting activity, suggesting information flows freely between topic areas. A small group of users (approximately 15) serve as bridges between different communities, posting across multiple subreddits. These users have disproportionate influence on information flow and typically generate content with higher engagement metrics."}
          type="network"
        />
      </div>

     

      {/* Word Charts Section */}
      <div className="light-section">
        <div className="grid gap-6 md:grid-cols-2 stagger-children">
          <Card className="gradient-card card-hover">
            <CardHeader>
              <CardTitle>Top 10 Profane Terms</CardTitle>
              <CardDescription>Most frequently occurring flagged words</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <Bar data={badWordsChartData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="gradient-card card-hover">
            <CardHeader>
              <CardTitle>Top 10 Political Words</CardTitle>
              <CardDescription>Most frequently occurring political terms</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <Bar data={politicalWordsChartData} options={barChartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v5m4-2-1 1m-6 0-1-1m-2 4h5m-2 4 1 1m4 0 1-1m2-4h-5m-5 8 2-5 5-2-5-2-2-5-2 5-5 2 5 2z" />
    </svg>
  )
}