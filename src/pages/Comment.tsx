"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchComments } from "@/store/redux/thunks/commentsThunk";
import { MessageSquare, BookOpen, Video, Users } from "lucide-react";

export default function Comment() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.comments);

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <Card className="shadow-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            Comments Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-5 py-4 rounded-2xl flex items-start gap-3">
              <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Failed to load comments</p>
                <p className="text-sm mt-1 text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && data && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* My Comments Card */}
              <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle className="text-lg">My Comments</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Blogs */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-200 group-hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Blog Comments</p>
                        <p className="text-xs text-muted-foreground">Your contributions on blogs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-primary">
                        {data.my_comment.blogs.length}
                      </span>
                    </div>
                  </div>

                  {/* Webinars */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-200 group-hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                        <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Webinar Comments</p>
                        <p className="text-xs text-muted-foreground">Your contributions on webinars</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-primary">
                        {data.my_comment.webinar.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Class Comments Card */}
              <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Users className="h-5 w-5 text-emerald-500" />
                    </div>
                    <CardTitle className="text-lg">Class Comments</CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-center hover:scale-[1.02] transition-all duration-300">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/70 rounded-2xl flex items-center justify-center mb-6">
                      <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">Total Class Comments</p>
                    <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tighter">
                      {data.class_comment.length}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">across all classes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}