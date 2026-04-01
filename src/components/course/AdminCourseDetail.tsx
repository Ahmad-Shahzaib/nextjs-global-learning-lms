// @ts-nocheck
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export function AdminCourseDetail() {


  return (
    <DashboardLayout>
      <div>
         All courses
      </div>
    </DashboardLayout>
  );
}