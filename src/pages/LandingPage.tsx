import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LogIn,
  MapPinned,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import logo from "../assets/logo-img.png";
import heroLogo from "../assets/bg-img.jpg";

type Language = "en" | "ar";

const brandName = "Awn عَــــون";

const roleIcons: LucideIcon[] = [ShieldCheck, ClipboardList, BarChart3];
const capabilityIcons: LucideIcon[] = [
  Database,
  ShieldCheck,
  ClipboardList,
  FileText,
];
const workflowIcons: LucideIcon[] = [UsersRound, MapPinned, LayoutDashboard];

const content: Record<
  Language,
  {
    navName: string;
    eyebrow: string;
    headline: string;
    subhead: string;
    signIn: string;
    seeHow: string;
    trustItems: string[];
    overviewTitle: string;
    overviewSubtitle: string;
    roles: { title: string; description: string }[];
    capabilities: { title: string; description: string }[];
    workflowTitle: string;
    workflow: { title: string; description: string }[];
    ctaTitle: string;
    ctaNote: string;
  }
> = {
  en: {
    navName: "Displaced Families Assistance & Data Management System",
    eyebrow: "Humanitarian response data for Gaza",
    headline: "Awn عَــــون",
    subhead:
      "A focused system for registering displaced families, tracking vulnerability, and recording assistance across camps and organizations.",
    signIn: "Sign in",
    seeHow: "View workflow",
    trustItems: ["Family records", "Camp-level access", "Response reports"],
    overviewTitle: "Built for controlled field operations",
    overviewSubtitle:
      "Each screen supports a clear operational job: register, assess, assist, search, and report.",
    roles: [
      {
        title: "System Administrator",
        description:
          "Creates accounts, assigns roles, and keeps access to sensitive family data controlled.",
      },
      {
        title: "Data Entry Staff",
        description:
          "Registers families, records vulnerability details, and logs assistance for an assigned camp.",
      },
      {
        title: "Organization Manager",
        description:
          "Reviews dashboards, searches across locations, and exports reports for planning.",
      },
    ],
    capabilities: [
      {
        title: "Single family record",
        description:
          "Keep identity, household, location, and assistance data together.",
      },
      {
        title: "Vulnerability baseline",
        description: "Assess need consistently as family conditions change.",
      },
      {
        title: "Assistance history",
        description: "Track what was delivered, when, where, and by whom.",
      },
      {
        title: "Operational reporting",
        description:
          "Filter data by camp, date, role scope, and vulnerability level.",
      },
    ],
    workflowTitle: "Workflow",
    workflow: [
      {
        title: "Register",
        description: "Create one complete family profile at the camp level.",
      },
      {
        title: "Coordinate",
        description:
          "Record vulnerability and assistance through the same data path.",
      },
      {
        title: "Decide",
        description:
          "Use dashboards and reports to prioritize the next response.",
      },
    ],
    ctaTitle: "Continue to secure access",
    ctaNote: "Accounts are created and assigned by the System Administrator.",
  },
  ar: {
    navName: "نظام مساعدة وإدارة بيانات الأسر النازحة",
    eyebrow: "بيانات الاستجابة الإنسانية في غزة",
    headline: "Awn عَــــون",
    subhead:
      "نظام عملي لتسجيل الأسر النازحة، وتتبع مستوى الضعف، وتوثيق المساعدات عبر المخيمات والمؤسسات.",
    signIn: "تسجيل الدخول",
    seeHow: "عرض سير العمل",
    trustItems: ["سجلات الأسر", "صلاحيات حسب المخيم", "تقارير الاستجابة"],
    overviewTitle: "مصمم لعمليات ميدانية مضبوطة",
    overviewSubtitle:
      "كل شاشة تدعم مهمة واضحة: التسجيل، التقييم، المساعدة، البحث، وإعداد التقارير.",
    roles: [
      {
        title: "مسؤول النظام",
        description:
          "ينشئ الحسابات، ويحدد الأدوار، ويحافظ على التحكم في الوصول إلى بيانات الأسر الحساسة.",
      },
      {
        title: "موظف إدخال البيانات",
        description:
          "يسجل الأسر، ويوثق بيانات الضعف، ويسجل المساعدات ضمن المخيم المخصص له.",
      },
      {
        title: "مدير المنظمة",
        description:
          "يراجع لوحات البيانات، ويبحث عبر المواقع، ويصدر التقارير للتخطيط.",
      },
    ],
    capabilities: [
      {
        title: "سجل واحد للأسرة",
        description:
          "جمع بيانات الهوية والأسرة والموقع والمساعدات في مكان واحد.",
      },
      {
        title: "خط أساس للضعف",
        description: "تقييم الاحتياج بوضوح مع تغير ظروف الأسرة.",
      },
      {
        title: "سجل المساعدات",
        description: "توثيق ما تم تسليمه، ومتى، وأين، ومن الجهة المنفذة.",
      },
      {
        title: "تقارير تشغيلية",
        description:
          "تصفية البيانات حسب المخيم والتاريخ والصلاحية ومستوى الضعف.",
      },
    ],
    workflowTitle: "سير العمل",
    workflow: [
      {
        title: "تسجيل",
        description: "إنشاء ملف كامل للأسرة على مستوى المخيم.",
      },
      {
        title: "تنسيق",
        description: "توثيق الضعف والمساعدات من خلال مسار بيانات واحد.",
      },
      {
        title: "قرار",
        description:
          "استخدام اللوحات والتقارير لتحديد أولوية الاستجابة التالية.",
      },
    ],
    ctaTitle: "المتابعة إلى الوصول الآمن",
    ctaNote: "يتم إنشاء الحسابات وتعيينها من قبل مسؤول النظام.",
  },
};

const LandingPage = () => {
  const [language, setLanguage] = useState<Language>("en");
  const t = content[language];
  const isRtl = language === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth bg-[#f5f8fc] text-gray-900"
    >
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[88px] max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logo}
              alt="Awn logo"
              className="h-12 w-12 shrink-0 rounded-xl object-contain ring-1 ring-blue-100"
            />
            <span className="min-w-0">
              <span className="block text-base font-bold text-gray-950">
                {brandName}
              </span>
              <span className="hidden max-w-[28rem] truncate text-xs font-medium text-gray-500 sm:block">
                {t.navName}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div
              aria-label="Language"
              className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 p-1 text-xs font-semibold"
            >
              <Globe className="mx-1 hidden h-4 w-4 text-gray-500 sm:block" />
              <button
                type="button"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
                className={`rounded px-2.5 py-1.5 transition ${
                  language === "en"
                    ? "bg-white text-[#0066FF] shadow-sm"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                English
              </button>
              <button
                type="button"
                aria-pressed={language === "ar"}
                onClick={() => setLanguage("ar")}
                className={`rounded px-2.5 py-1.5 transition ${
                  language === "ar"
                    ? "bg-white text-[#0066FF] shadow-sm"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                العربية
              </button>
            </div>

            <ThemeToggle />

            <Link
              to="/login"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[calc(100svh-88px)] snap-start overflow-hidden border-b border-gray-200 bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#e5eefc_1px,transparent_1px),linear-gradient(90deg,#e5eefc_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 dark:opacity-[0.03]" />
          <img
            src={heroLogo}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08] dark:opacity-[0.03]"
          />

          <div className="relative mx-auto flex min-h-[calc(100svh-88px)] max-w-7xl flex-col items-center justify-center px-4 py-10 text-center md:px-8">
            <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-blue-100 ring-1 ring-blue-100">
              <img
                src={logo}
                alt="Awn visual identity"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>

            <p className="text-sm font-semibold text-[#0066FF]">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-extrabold text-gray-950 sm:text-6xl md:text-7xl">
              {t.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 md:text-xl">
              {t.subhead}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
              >
                <LogIn className="h-4 w-4" />
                {t.signIn}
              </Link>
              <a
                href="#overview"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
              >
                <ArrowDown className="h-4 w-4" />
                {t.seeHow}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {t.trustItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>

            <a
              href="#overview"
              aria-label="Scroll to workflow"
              className="absolute bottom-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-200 hover:text-[#0066FF]"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section
          id="overview"
          className="flex min-h-screen snap-start items-center border-b border-gray-200 py-14"
        >
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#0066FF]">
                {t.workflowTitle}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
                {t.overviewTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                {t.overviewSubtitle}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {t.roles.map((role, index) => {
                const RoleIcon = roleIcons[index] ?? ShieldCheck;

                return (
                  <article
                    key={role.title}
                    className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-[#0066FF]">
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-950">
                      {role.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {role.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {t.capabilities.map((item, index) => {
                const CapabilityIcon = capabilityIcons[index] ?? Database;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <CapabilityIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen snap-start items-center bg-white py-14">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {t.workflow.map((step, index) => {
                const WorkflowIcon = workflowIcons[index] ?? UsersRound;

                return (
                  <div
                    key={step.title}
                    className="rounded-lg border border-gray-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                        <WorkflowIcon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-blue-100 bg-[#eef5ff] p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {t.ctaTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-600">{t.ctaNote}</p>
              </div>
              <Link
                to="/login"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
              >
                <ArrowRight className="h-4 w-4" />
                {t.signIn}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
