import { Card, CardContent } from "@/components/ui/card";

const paymentLinks = [
  {
    title: "Dirhams (AED)",
    url: "https://buy.stripe.com/00waEZ3UVbss4ax5Ife3e0m",
  },
  {
    title: "Pounds (£)",
    url: "https://buy.stripe.com/00wfZj0IJdAAayV1rZe3e0n",
  },
  {
    title: "Dollars ($)",
    url: "https://buy.stripe.com/3cIfZj9ffeEE36t0nVe3e0q",
  },
];

const paymentLogos = [
  {
    name: "Klarna",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/40/Klarna_Payment_Badge.svg",
  },
  {
    name: "Afterpay",
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Afterpay-logo.svg",
  },
  {
    name: "iDEAL",
    src: "https://upload.wikimedia.org/wikipedia/commons/a/ad/IDEAL_%28Bezahlsystem%29_logo.svg",
  },
  {
    name: "SEPA",
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Single_Euro_Payments_Area_logo.svg",
  },
  {
    name: "Cash App",
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg",
  },
  {
    name: "MasterCard",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1280px-Mastercard_2019_logo.svg.png",
  },
  {
    name: "Apple Pay",
    src: "https://cdn-icons-png.flaticon.com/512/5968/5968601.png",
  },
  {
    name: "Bank Transfer",
    src: "https://cdn-icons-png.flaticon.com/512/8043/8043680.png",
  },
  {
    name: "Google Pay",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  },
];

export default function ChargeAccounts() {
  return (
    <div className="min-h-screen space-y-8 rounded-lg animate-fade-in px-4 py-6 bg-orange-50 dark:bg-[#0f0d0b] text-slate-900 dark:text-[#f5efe8] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-orange-200 bg-orange-50 px-8 py-8 shadow-lg shadow-orange-200/50 dark:border-[#2e2218] dark:bg-[#1a1410] dark:shadow-orange-900/30">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-orange-800 dark:text-[#f5efe8] sm:text-4xl">
          Welcome to Your Fee Center
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-orange-600 dark:text-[#a89880] sm:text-base">
          Your one-stop hub for all payment-related information. Simple, secure, and transparent.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-7xl border border-orange-200 bg-orange-50 shadow-lg shadow-orange-200/40 dark:border-[#2e2218] dark:bg-[#1a1410] dark:shadow-black/20">
        <CardContent className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
          {/* Bank Details */}
          <div className="space-y-3 text-center">
            <p className="text-xl font-semibold uppercase tracking-[0.3em] text-orange-700 dark:text-orange-500">
              Bank Details
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-500">
              (Student Paying by Bank inside or Outside UAE)
            </p>
          </div>

          <div className="grid gap-4 text-sm text-slate-800 dark:text-[#f5efe8] sm:grid-cols-2">
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">Company Name</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">GLOBAL LEARNERS EDUCATION FZE</span>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">Bank Name</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">The National Bank of Ras Al Khaimah (P.S.C)</span>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">Account Number</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">0023383638001 (AED)</span>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">IBAN</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">AE33 0400 0000 2338 3638 001</span>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">SWIFT Code</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">NRAKAEAK</span>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-[#2e2218] dark:bg-[#0f0d0b]">
              <span className="font-semibold">Currency</span>
              <span className="text-right font-medium text-slate-900 dark:text-[#f5efe8]">AED</span>
            </div>
          </div>

          {/* Payment Links */}
          <div className="border-t border-orange-200 pt-8 dark:border-[#2e2218]">
            <div className="space-y-3 text-center">
              <p className="text-xl font-semibold uppercase tracking-[0.3em] text-orange-700 dark:text-orange-500">
                Payment Links
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-500">
                (Student Paying by link Outside UAE)
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {paymentLinks.map((link) => (
                <div
                  key={link.title}
                  className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-6 text-center shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]"
                >
                  <h2 className="text-lg font-semibold text-orange-800 dark:text-[#f5efe8]">{link.title}</h2>
                  <button
                    type="button"
                    onClick={() => window.open(link.url, "_blank")}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    Open payment link
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Logos Section */}
          <div className="space-y-4 text-center">
            <p className="text-sm text-orange-600 dark:text-[#a89880]">
              Note - Credit Cards are accepted for the link payments.
            </p>
            
            <div className="mx-auto flex flex-wrap items-center justify-center gap-4">
              {paymentLogos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex h-16 w-28 items-center justify-center rounded-3xl border border-orange-200 bg-orange-50 p-3 shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    loading="lazy"
                    className="max-h-10 max-w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}