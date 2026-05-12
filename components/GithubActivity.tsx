'use client'

import { motion } from 'framer-motion'
import { Github, GitCommit, GitPullRequest, Star } from 'lucide-react'

import { useState, useEffect } from 'react'

export default function GithubActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Try fetching events first
        const eventsResponse = await fetch('https://api.github.com/users/Dylan21-svg/events/public?per_page=5')
        const eventsData = await eventsResponse.json()
        
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          const processed = eventsData.map(event => {
            let message = ''
            let icon = GitCommit

            switch (event.type) {
              case 'PushEvent':
                message = event.payload.commits[0]?.message || 'Pushed changes'
                icon = GitCommit
                break
              case 'PullRequestEvent':
                message = `${event.payload.action} pull request`
                icon = GitPullRequest
                break
              case 'WatchEvent':
                message = 'Starred a repository'
                icon = Star
                break
              case 'CreateEvent':
                message = `Created ${event.payload.ref_type} ${event.payload.ref || ''}`
                icon = Plus
                break
              default:
                message = event.type.replace('Event', '')
            }

            return {
              repo: event.repo.name.split('/')[1],
              date: new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              message: message,
              icon: icon
            }
          })
          setActivities(processed)
        } else {
          // Fallback: Fetch recent repositories if no events found
          const repoResponse = await fetch('https://api.github.com/users/Dylan21-svg/repos?sort=updated&per_page=5')
          const repoData = await repoResponse.json()
          
          if (Array.isArray(repoData)) {
            const processedRepos = repoData.map(repo => ({
              repo: repo.name,
              date: new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              message: repo.description || 'Recently updated repository',
              icon: Github
            }))
            setActivities(processedRepos)
          }
        }
      } catch (error) {
        console.error('Error fetching GitHub data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  return (
    <div className="glassmorphism rounded-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold font-display">Recent Activity</h3>
        </div>
        <a 
          href="https://github.com/Dylan21-svg" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary text-sm font-semibold hover:underline"
        >
          Follow on GitHub
        </a>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-text-gray animate-pulse">
            Fetching latest updates...
          </div>
        ) : activities.length > 0 ? (
          activities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group"
            >
              <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-primary">{item.repo}</span>
                  <span className="text-xs text-text-gray">{item.date}</span>
                </div>
                <p className="text-sm text-white/80 line-clamp-1">{item.message}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-text-gray italic">
            No recent public activity to show
          </div>
        )}
      </div>

      {/* Simplified Contribution Graph Mockup */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <p className="text-xs font-bold text-text-gray tracking-widest uppercase mb-4">Contribution Heatmap</p>
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => {
                const opacity = Math.random() > 0.5 ? Math.random() : 0.1
                return (
                  <div
                    key={j}
                    className="w-3 h-3 rounded-sm bg-primary"
                    style={{ opacity }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
