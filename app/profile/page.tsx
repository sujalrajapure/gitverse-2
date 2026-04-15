"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Github, Star, GitFork, Eye, AlertCircle, LogOut, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string | null
  updated_at: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

interface User {
  login: string
  name: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/github/user/repos")
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch user data")
        }
        const data = await response.json()
        setUser(data.user)
        setRepos(data.repos)
        setFilteredRepos(data.repos)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRepos(repos)
    } else {
      const filtered = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRepos(filtered)
    }
  }, [searchQuery, repos])

  const handleLogout = () => {
    window.location.href = "/api/auth/logout"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Unable to load profile</h1>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h1 className="text-lg font-semibold">{user.name || user.login}</h1>
                <p className="text-sm text-gray-400">@{user.login}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Public Repositories"
            value={user.public_repos.toString()}
            icon={<Github className="h-5 w-5 text-blue-500" />}
          />
          <StatCard
            title="Followers"
            value={user.followers.toString()}
            icon={<Eye className="h-5 w-5 text-green-500" />}
          />
          <StatCard
            title="Following"
            value={user.following.toString()}
            icon={<Plus className="h-5 w-5 text-purple-500" />}
          />
          <StatCard
            title="Total Stars"
            value={repos.reduce((acc, repo) => acc + repo.stargazers_count, 0).toString()}
            icon={<Star className="h-5 w-5 text-yellow-500" />}
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-gray-100"
            />
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>

        {filteredRepos.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-400">No repositories found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-400">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RepositoryCard({ repo }: { repo: Repository }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {repo.name}
              {repo.private && <Badge variant="secondary" className="text-xs">Private</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">
              {repo.description || "No description available"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4 text-blue-500" />
                <span>{repo.forks_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{repo.open_issues_count}</span>
              </div>
            </div>
          </div>

          {repo.language && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-400">{repo.language}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Updated {formatDate(repo.updated_at)}
          </div>

          <div className="flex gap-2 pt-2">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Github className="mr-2 h-3 w-3" />
                View
              </Button>
            </a>
            <Link href={`/dashboard/${repo.owner.login}/${repo.name}`}>
              <Button size="sm">
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}