"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchComments } from "@/store/redux/thunks/commentsThunk";
import { MessageSquare, BookOpen, Video } from "lucide-react";

export default function Comment() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.comments);

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      <Card className="shadow-lg border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Comments Overview
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {loading && (
            <p className="text-muted-foreground animate-pulse">
              Loading comments...
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 bg-red-100/20 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* DATA */}
          {!loading && !error && data && (
            <div className="grid md:grid-cols-2 gap-6">

              {/* ===== MY COMMENTS ===== */}
              <div className="p-4 rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  My Comments
                </h3>

                <div className="space-y-3">

                  {/* Blogs */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Blogs</span>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-semibold">
                      {data.my_comment.blogs.length}
                    </span>
                  </div>

                  {/* Webinar */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Webinar</span>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-semibold">
                      {data.my_comment.webinar.length}
                    </span>
                  </div>

                </div>
              </div>

              {/* ===== CLASS COMMENTS ===== */}
              <div className="p-4 rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Class Comments
                </h3>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition">
                  <span className="text-sm font-medium">
                    Total Comments
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-semibold">
                    {data.class_comment.length}
                  </span>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}