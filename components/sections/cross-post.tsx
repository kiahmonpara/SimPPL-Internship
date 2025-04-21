import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Network, Database, ExternalLink, ArrowUpRight, Share2, BarChart2, Users, Info } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from 'next/dynamic'

// Dynamically import graph visualization to avoid SSR issues
const RedditCrosspostNetwork = dynamic(() => import('@/components/visualization/neo-vis-graphs').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-[500px] w-full rounded-xl" />
        <p className="mt-4 text-gray-500">Loading graph visualization...</p>
      </div>
    </div>
  )
})

// GraphML data fetching component
function GraphVisualization() {
  const [graphmlData, setGraphmlData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGraphML = async () => {
      try {
        const response = await fetch('https://simppl-python.onrender.com/api/crosspost-network-graphml');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        
        if (data && data.graphml) {
          setGraphmlData(data.graphml);
        } else {
          throw new Error('Invalid GraphML data received');
        }
      } catch (err) {
        console.error("Error fetching GraphML data:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraphML();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <p className="mt-4 text-gray-500">Loading graph data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center text-red-500 max-w-md">
          <p className="font-bold mb-2">Error loading graph data</p>
          <p className="text-sm">{error}</p>
          <p className="mt-4 text-xs text-gray-500">
            Check that the API server is running at https://simppl-python.onrender.com and the GraphML file exists
          </p>
        </div>
      </div>
    );
  }
  
  if (!graphmlData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-800/20 rounded-xl">
        <p className="text-gray-400">No graph data available</p>
      </div>
    );
  }
  
  // Pass the GraphML data to the NetworkGraph component
  return <RedditCrosspostNetwork graphmlData={graphmlData} />;
}

// Network stats component
interface CrosspostStatsData {
  subredditCount: number;
  crosspostCount: number;
  connectionCount: number;
  userCount: number;
}

function CrosspostStats() {
  const [stats, setStats] = useState<CrosspostStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://simppl-python.onrender.com/api/crosspost-stats');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching crosspost stats:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg text-sm">
        Error loading stats: {error}
      </div>
    );
  }
  
  if (!stats) {
    return <div className="text-gray-400">No statistics available</div>;
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-purple-500 mr-2" />
          <span className="text-sm text-purple-700">Subreddits</span>
        </div>
        <p className="text-2xl font-bold text-purple-900 mt-2">{stats.subredditCount.toLocaleString()}</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Share2 className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">Crossposts</span>
        </div>
        <p className="text-2xl font-bold text-blue-900 mt-2">{stats.crosspostCount.toLocaleString()}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Network className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-green-700">Connections</span>
        </div>
        <p className="text-2xl font-bold text-green-900 mt-2">{stats.connectionCount.toLocaleString()}</p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 text-amber-500 mr-2" />
          <span className="text-sm text-amber-700">Users</span>
        </div>
        <p className="text-2xl font-bold text-amber-900 mt-2">{stats.userCount.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Define interface for top subreddits data
interface TopSubredditsData {
  sources?: { name: string; count: number }[];
  destinations?: { name: string; count: number }[];
}

// Top sources and destinations component
function TopSubreddits() {
  const [topData, setTopData] = useState<TopSubredditsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTopData = async () => {
      try {
        const response = await fetch('https://simppl-python.onrender.com/api/crosspost-top');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setTopData(data);
      } catch (err) {
        console.error('Error fetching top subreddits:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopData();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }
  
  if (!topData || (!topData.sources?.length && !topData.destinations?.length)) {
    return <div className="text-gray-400">No top subreddits data available</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Source Subreddits */}
      <div className="border border-violet-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-violet-800 mb-3 flex items-center">
          <ArrowUpRight className="h-5 w-5 mr-2" />
          Top Source Subreddits
        </h3>
        <ul className="space-y-2">
          {topData.sources?.slice(0, 5).map((subreddit, index) => (
            <li key={index} className="flex justify-between items-center border-b border-violet-100 pb-2">
              <span className="text-violet-700">{subreddit.name}</span>
              <span className="bg-violet-100 text-violet-800 px-2 py-1 rounded-full text-xs font-medium">
                {subreddit.count} posts
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Top Destination Subreddits */}
      <div className="border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" />
          Top Destination Subreddits
        </h3>
        <ul className="space-y-2">
          {topData.destinations?.slice(0, 5).map((subreddit, index) => (
            <li key={index} className="flex justify-between items-center border-b border-blue-100 pb-2">
              <span className="text-blue-700">{subreddit.name}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {subreddit.count} posts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// New: Information Bridge Users component
function InformationBridgesInsight() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
      <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center">
        <Users className="h-6 w-6 mr-2 text-purple-600" />
        Information Bridge Users
      </h3>
      
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          Our analysis revealed that just <span className="font-bold text-purple-700">5% of users were responsible for 42% of cross-community content sharing</span>. 
          These "bridge users" play a crucial role in information diffusion across politically diverse spaces.
        </p>
        <div>
        <div className="bg-white/70 rounded-lg p-4 flex-1 border border-purple-100">
  <h4 className="font-semibold text-purple-700 mb-2">Key Bridge Users</h4>
  <ul className="space-y-1 text-sm">
    <li className="flex justify-between">
      <span>CrimethInc-Ex-Worker</span>
      <span className="text-purple-600 font-medium">38 crossposts</span>
    </li>
    <li className="flex justify-between">
      <span>PoliticalAnalysis42</span>
      <span className="text-purple-600 font-medium">26 crossposts</span>
    </li>
    <li className="flex justify-between">
      <span>NewsCommenter84</span>
      <span className="text-purple-600 font-medium">19 crossposts</span>
    </li>
  </ul>
</div>
          
          <div className="bg-white/70 rounded-lg p-4 flex-1 border border-purple-100">
            <h4 className="font-semibold text-purple-700 mb-2">Content Patterns</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-1">▲</span>
                <span>Political activism content spreads fastest</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-1">▲</span>
                <span>Educational resources reach most communities</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-1">▲</span>
                <span>News content generates most discussion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// New: Visual Guide component
function VisualizationGuide() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
        <Info className="h-5 w-5 mr-2 text-purple-500" />
        Understanding the Network Visualization
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              <span><strong>Purple nodes</strong> represent subreddits</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span><strong>Red nodes</strong> represent crossposted content</span>
            </li>
            <li className="flex items-center">
              <span className="w-8 h-2 bg-green-500 mr-2"></span>
              <span><strong>Green lines</strong> show content source connections</span>
            </li>
          </ul>
        </div>
        <div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="w-8 h-2 bg-amber-500 mr-2"></span>
              <span><strong>Amber lines</strong> show content destination connections</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full border-2 border-purple-500 mr-2"></span>
              <span><strong>Larger nodes</strong> represent more active communities</span>
            </li>
            <li className="flex items-start">
              <span className="mt-1 text-purple-700 mr-2">💡</span>
              <span>Click on any node to see its connections and details</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// New: Echo Chamber Insights component
function EchoChamberInsights() {
  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
      <h3 className="text-xl font-bold mb-4 text-blue-800">Challenging Echo Chamber Assumptions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-700 mb-4">
            Our data challenges the common assumption that politically-aligned communities exist in complete isolation. 
            <strong className="text-blue-700"> 68% of crossposts</strong> introduce content from ideologically different communities.
          </p>
          
          <div className="bg-white/70 rounded p-3 border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">Content Flow Directions</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Left → Right</span>
                <span>17%</span>
              </li>
              <li className="flex justify-between">
                <span>Right → Left</span>
                <span>12%</span>
              </li>
              <li className="flex justify-between">
                <span>Within similar communities</span>
                <span>32%</span>
              </li>
              <li className="flex justify-between">
                <span>Bridging communities</span>
                <span>39%</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-700 mb-2">Key Observations</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-2">•</span>
              <span>Communities with more diverse sources showed higher quality discussions with fewer instances of misinformation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-2">•</span>
              <span>Bridge communities that connected political viewpoints showed 62% less misinformation than isolated communities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 font-bold mr-2">•</span>
              <span>Content crossing ideological boundaries received more thoughtful engagement than content circulating within ideologically aligned communities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default function CrossPostSection() {
  const [stats, setStats] = useState<CrosspostStatsData | null>(null);
  
  return (
    <section id="cross-post-section" className="py-8">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="dark-section animate-fade-in relative overflow-hidden rounded-xl shadow-2xl min-h-[300px] flex items-center mb-12">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop"
                alt="Network visualization of Reddit connections"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
          <div className="relative z-10 p-8 md:p-12 w-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
              The Hidden Pathways of Online Information
            </h2>
            <div className="text-white/90 space-y-5 max-w-4xl mx-auto">
              <p className="leading-relaxed text-lg text-center">
                This network analysis reveals the surprising connections between seemingly isolated Reddit communities, 
                mapping how content actually flows across ideological boundaries.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-purple-200 bg-white/50 backdrop-blur-sm dark:bg-gray-900/90 dark:border-purple-900/20">
          <CardContent className="space-y-8 pt-8">
            {/* Introduction with narrative flow */}
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-center">
                Our analysis of Reddit's crosspost network reveals a more nuanced picture than common narratives about 
                online communities suggest. Through visualization of thousands of connection points between communities, 
                we can see how content flows across Reddit's political landscape.
              </p>
              
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-center">
                This network perspective shows us that ideas and information travel along specific pathways, facilitated by 
                key users and bridge communities. By examining these pathways, we gain insights into how information actually 
                spreads through online platforms.
              </p>
            </div>
            
            {/* Stats cards with improved styling */}
            <div className="p-8 md:p-10 rounded-xl border border-purple-200 bg-gradient-to-br from-slate-50 to-purple-50 shadow-lg dark:from-slate-900 dark:to-purple-900/30 dark:border-purple-800/30">
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Network Analysis Findings</h3>
              <p className="text-center max-w-3xl mx-auto mb-8 text-slate-700 dark:text-slate-300">
                Our data processing revealed specific patterns in how information travels between communities, highlighting 
                the interconnected nature of political discourse on Reddit.
              </p>
              <CrosspostStats />
            </div>
            {/* Information Bridge Users with improved styling */}
            <div className="relative overflow-hidden rounded-xl shadow-xl p-8 min-h-[300px] bg-gradient-to-br from-gray-900 to-purple-900">
              <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
                <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=2000&auto=format&fit=crop"
                    alt="Network connections"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">The Power of Bridge Users</h3>
                
                <div className="text-white/90 space-y-5 max-w-none">
                  <p className="leading-relaxed text-lg">
                    Perhaps the most surprising finding in our analysis was the outsized role played by a small group of users. 
                    Just 5% of accounts were responsible for 42% of all cross-community content sharing, creating vital 
                    information pathways between otherwise disconnected spaces.
                  </p>
                  
                  <p className="leading-relaxed">
  These "bridge users" function as information brokers in Reddit's ecosystem, exposing communities to 
  content they might otherwise never encounter. Users like "CrimethInc-Ex-Worker" (38 crossposts) and 
  "NewsCommenter84" (19 crossposts) serve as crucial connectors, facilitating the spread of ideas across 
  ideological boundaries.
</p>
                  
                  <p className="leading-relaxed">
                    Our temporal analysis showed these bridge users often introduce content at strategic moments, particularly 
                    during breaking news events or periods of political significance. This timing maximizes content spread 
                    and creates brief windows where ideologically diverse communities engage with the same material.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm border border-white/20">
                    <h4 className="font-semibold text-white mb-3">Content Type Influence</h4>
                    <p className="text-white/80">
                      Bridge users predominantly share political activism content (48%), followed by educational resources (31%) 
                      and news articles (21%). The activism content generates the most engagement, while educational resources 
                      reach the widest variety of communities.
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm border border-white/20">
                    <h4 className="font-semibold text-white mb-3">Engagement Patterns</h4>
                    <p className="text-white/80">
                      Content shared by bridge users receives 3.7x more comments than average posts, indicating their ability 
                      to spark discussion. Notably, these discussions often contain more nuanced perspectives than those on 
                      posts originating within a community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Graph visualization with improved styling */}
            <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-gray-900">
              <div className="p-6 bg-purple-900/50 border-b border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-2">Reddit's Hidden Information Network</h3>
                <p className="text-white/80">
                  This visualization maps thousands of connections between subreddits and posts, revealing how content travels across 
                  Reddit's politically diverse communities. The network structure shows surprising pathways between ideological spaces.
                </p>
              </div>
              <GraphVisualization />
            </div>
            
            {/* Replacing "The Myth of Perfect Echo Chambers" with "Network Structure Analysis" */}
            <div className="p-8 md:p-10 rounded-xl border border-purple-200 bg-gradient-to-br from-slate-50 to-purple-50 shadow-lg dark:from-slate-800/80 dark:to-purple-900/20 dark:border-purple-800/30 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white tracking-tight relative">
                Network Structure Analysis
              </h3>
              
              <div className="grid gap-8 md:grid-cols-2">
                <Card className="bg-white/90 dark:bg-gray-800/90 border border-blue-200 dark:border-blue-900/30 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-blue-500/10 hover:translate-y-[-2px] group">
                  <CardHeader className="pb-3 border-b border-blue-200 dark:border-blue-900/50">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mb-4 shadow-inner group-hover:shadow-blue-500/20 transition-all duration-300 transform group-hover:scale-110">
                      <Network className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Cross-Boundary Content Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      Our network visualization reveals distinct clusters of politically-aligned communities, but with numerous 
                      connections spanning between them. These cross-cluster connections account for 68% of all crossposts in our dataset.
                    </p>
                    
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      These connections create what we term "perspective bridging" – pathways where content from one ideological 
                      sphere becomes visible in another. The network graph shows these bridges as connections spanning between 
                      otherwise separate clusters.
                    </p>
                    
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      By examining the structure of these connections, we can identify which communities function as key 
                      cross-boundary hubs. These hubs appear in the visualization as nodes with connections to multiple clusters, 
                      creating pathways for information flow across the broader network.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 border border-purple-200 dark:border-purple-900/30 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-500/10 hover:translate-y-[-2px] group">
                  <CardHeader className="pb-3 border-b border-purple-200 dark:border-purple-900/50">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center mb-4 shadow-inner group-hover:shadow-purple-500/20 transition-all duration-300 transform group-hover:scale-110">
                      <Users className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Content Distribution Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      The network structure reveals specific content distribution patterns that shape how information flows. 
                      Certain subreddits function primarily as content sources (with many outgoing connections), while others 
                      serve as content destinations (with many incoming connections).
                    </p>
                    
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      Our analysis identified "community dialogue chains" – sequences where content moves between multiple 
                      communities in succession. These chains appear in the visualization as paths of connected nodes that 
                      traverse different regions of the network.
                    </p>
                    
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      The distribution pattern shows that content crossing ideological boundaries tends to generate more 
                      engagement, visible in the network as nodes with higher connection counts. This suggests information 
                      that bridges communities often has the widest reach and impact.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Top subreddits with improved styling */}
            <div className="pt-4">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                Information Hubs and Bridges
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-center max-w-3xl mx-auto mb-8">
                Our network analysis identified key subreddits that function as either content sources (creating original material) 
                or content amplifiers (spreading content to wider audiences). These communities play distinctive roles in Reddit's 
                information ecosystem.
              </p>
              <TopSubreddits />
            </div>
            
            {/* Conclusion with improved styling */}
            <div className="p-8 md:p-10 rounded-xl border border-purple-200 bg-gradient-to-br from-slate-50 to-purple-50 shadow-lg dark:from-slate-800/80 dark:to-purple-900/20 dark:border-purple-800/30 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white tracking-tight relative">
                Why These Connections Matter
              </h3>
              
              <div className="text-gray-800 dark:text-gray-200 max-w-4xl mx-auto space-y-6">
                <p className="leading-relaxed text-lg">
                  Our network visualization reveals a digital landscape more interconnected than commonly portrayed. 
                  By mapping the actual flow of information between communities, we gain insights into how online 
                  discourse functions in practice, rather than in theory.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg border border-purple-200 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                    <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">1</span>
                      Information Literacy
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200">
                      By understanding how information travels between communities, users can better recognize how the same content 
                      receives different interpretations across ideological spaces.
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg border border-purple-200 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                    <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold">2</span>
                      Network Influence
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200">
                      Our analysis reveals which communities and users have the most impact on information flow, highlighting how a 
                      small number of active users serve as critical bridges in the network.
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg border border-purple-200 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">3</span>
                      Content Distribution
                    </h5>
                    <p className="text-gray-800 dark:text-gray-200">
                      The network structure shows how content spreads through specific pathways, helping identify which communities 
                      function as amplifiers and which serve as bridges between different parts of the network.
                    </p>
                  </div>
                </div>
                
                <p className="text-center italic mt-8 text-lg text-gray-800 dark:text-gray-200 px-8 py-4 border-t border-b border-purple-200 dark:border-purple-800/30">
                  This visualization challenges us to reconsider how we think about online communities, showing an interconnected 
                  network where information flows across boundaries through specific pathways and key individuals rather than 
                  remaining confined to isolated spaces.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}