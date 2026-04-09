import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Clock } from "lucide-react";

const departments = [
  {
    title: "Academic Support",
    description:
      "For questions related to courses, assignments, exams, lectures, study materials, and academic guidance.",
    email: "support@globallearnerseducation.com",
    phone: "+971 50 279 0862",
    hours: "Monday – Sunday, 9:00 AM – 11:00 PM (GST)",
  },
  {
    title: "Finance & Fee Department",
    description:
      "For payment-related queries, installments, invoices, refunds, and fee structure.",
    email: "accounts@globallearnerseducation.com",
    phone: "+971 50 134 8776",
    hours: "Monday – Saturday, 9:00 AM – 11:00 PM (GST)",
  },
  {
    title: "Admissions Department",
    description:
      "For new enrolments, program information, eligibility, application status, and document submissions.",
    email: "admissions@globallearnerseducation.com",
    phone: "+971 50 285 9767",
    hours: "Monday – Sunday, 9:00 AM – 11:00 PM (GST)",
  },
  {
    title: "Alumni & Student Affairs Department",
    description:
      "For all matters related to student welfare, alumni relations, networking opportunities, events, student grievances, and post-graduation support.",
    email: "admissions@globallearnerseducation.com",
    phone: "+971 50 285 9767",
    hours: "Monday – Sunday, 9:00 AM – 11:00 PM (GST)",
  },
];

export default function Support() {
  return (
    <div className="py-12 px-4 rounded-lg bg-orange-50 dark:bg-[#0f0d0b] text-slate-900 dark:text-[#f5efe8]">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Hero Section */}
        <div className="text-center border border-orange-200 bg-orange-50 shadow-md rounded-3xl p-8 dark:border-[#2e2218] dark:bg-[#1a1410]">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-orange-950 dark:text-[#f5efe8]">
            Welcome to the GLE Help Desk
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-600 dark:text-[#a89880]">
            We&apos;re here to support you every step of your learning journey. 
            Choose the department below that best matches your query.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((department, index) => (
            <Card
              key={index}
              className="group overflow-hidden border border-orange-200 bg-orange-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 dark:border-[#2e2218] dark:bg-[#1a1410] dark:hover:shadow-orange-500/20"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-900 group-hover:bg-orange-600 group-hover:text-white transition-colors dark:bg-[#0f0d0b] dark:text-orange-400">
                    {index === 0 && "📚"}
                    {index === 1 && "💰"}
                    {index === 2 && "🎓"}
                    {index === 3 && "🤝"}
                  </div>
                  <CardTitle className="text-2xl font-semibold text-slate-950 dark:text-[#f5efe8]">
                    {department.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 text-slate-800 dark:text-[#f5efe8]">
                <p className="leading-relaxed text-slate-600 dark:text-[#a89880]">{department.description}</p>

                <div className="space-y-4 border-t border-orange-100 pt-6 dark:border-[#2e2218]">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-orange-100 p-2 dark:bg-[#0f0d0b]">
                      <Mail className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-orange-500">Email</p>
                      <a
                        href={`mailto:${department.email}`}
                        className="font-medium text-slate-900 hover:text-orange-700 hover:underline transition-colors dark:text-[#f5efe8] dark:hover:text-orange-400"
                      >
                        {department.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-orange-100 p-2 dark:bg-[#0f0d0b]">
                      <Phone className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-orange-500">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-[#f5efe8]">{department.phone}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-orange-100 p-2 dark:bg-[#0f0d0b]">
                      <Clock className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-orange-500">Working Hours</p>
                      <p className="font-medium text-slate-900 dark:text-[#f5efe8]">{department.hours}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-orange-600 dark:text-[#a89880]">
          Our team typically responds within a few hours during working hours.
        </div>
      </div>
    </div>
  );
}