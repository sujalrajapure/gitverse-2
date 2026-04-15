"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/profile"
  const error = searchParams.get("error")

  const handleGitHubLogin = () => {
    window.location.href = `/api/auth/github?redirect=${encodeURIComponent(redirect)}`
  }

  useEffect(() => {
    if (error) {
      console.error("Login error:", error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-900/95 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Github className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold">Sign in to GitVerse</h1>
          <p className="mt-2 text-sm text-gray-400">Connect your GitHub account to view repository analytics.</p>
        </div>

        <div className="space-y-5">
          <Button onClick={handleGitHubLogin} className="w-full py-4 bg-gray-800 hover:bg-gray-700">
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          {error && (
            <p className="text-sm text-red-400 text-center">
              {error === "no_code" && "Authorization failed. Please try again."}
              {error === "github_oauth_error" && "GitHub OAuth error. Please try again."}
              {error === "server_error" && "Server error. Please try again later."}
            </p>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            After sign in, you will be redirected to the requested dashboard or the home page.
          </div>
        </div>
      </div>
    </div>
  )
}

import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
