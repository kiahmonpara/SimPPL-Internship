"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import OverviewSection from "@/components/sections/overview-section"
import StorySection from "@/components/sections/story-section"
import ContentAnalysis from "@/components/sections/content-analysis"
import EngagementAnalysis from "@/components/sections/engagement-analysis"
import CrossPostSection from "@/components/sections/cross-post"  
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col h-screen w-full">
      <DashboardHeader />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-4 h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-5 w-full bg-background/30 backdrop-blur-md sticky top-0 z-10">
        <TabsTrigger value="overview" className="text-sm md:text-base transition-all duration-300">
          Overview
        </TabsTrigger>
        <TabsTrigger value="story" className="text-sm md:text-base transition-all duration-300">
          Story
        </TabsTrigger>
        <TabsTrigger value="python" className="text-sm md:text-base transition-all duration-300">
          Content Analysis
        </TabsTrigger>
        <TabsTrigger value="new-reports" className="text-sm md:text-base transition-all duration-300">
          Engagement Analysis
        </TabsTrigger>
        <TabsTrigger value="cross-post" className="text-sm md:text-base transition-all duration-300">
          Cross-Post Analysis
        </TabsTrigger>
      </TabsList>
      
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="space-y-4 animate-fade-in h-full">
              <OverviewSection />
            </TabsContent>
            <TabsContent value="story" className="space-y-4 animate-fade-in h-full">
              <StorySection />
            </TabsContent>
            <TabsContent value="python" className="space-y-4 animate-fade-in h-full">
              <ContentAnalysis />
            </TabsContent>
            <TabsContent value="new-reports" className="space-y-4 animate-fade-in h-full">
              <EngagementAnalysis />
            </TabsContent>
            <TabsContent value="cross-post" className="space-y-4 animate-fade-in h-full">
              <CrossPostSection />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}