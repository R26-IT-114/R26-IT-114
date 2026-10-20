import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Brain,
  Calculator,
  PenLine,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ModuleSelection.css";

import mathsChild from "../assets/images/dashboard-maths-child.png";
import memoryChild from "../assets/images/dashboard-memory-child.png";
import readingChild from "../assets/images/dashboard-reading-child.png";
import writingChild from "../assets/images/dashboard-writing-child.png";

// Dashboard cards: edit labels, destination routes, images and colors here.
const dashboards = [
  {
    title: "කියවීමේ ප්‍රගතිය",
    shortTitle: "කියවීම",
    description: "කියවීමේ ක්‍රීඩා, නිවැරදි පිළිතුරු සහ දරුවාගේ දියුණුව බලන්න.",
    path: "/dyslexia-dashboard",
    icon: BookOpenText,
    image: readingChild,
    badgeClass: "bg-emerald-500",
    buttonClass: "from-emerald-500 to-green-400",
    shadowClass: "shadow-emerald-200/70",
  },
  {
    title: "ලිවීමේ ප්‍රගතිය",
    shortTitle: "ලිවීම",
    description: "අකුරු ලිවීමේ ක්‍රීඩා සහ එක් එක් මට්ටමේ ප්‍රගතිය බලන්න.",
    path: "/dysgraphia/progress",
    icon: PenLine,
    image: writingChild,
    badgeClass: "bg-amber-500",
    buttonClass: "from-amber-500 to-yellow-400",
    shadowClass: "shadow-amber-200/70",
  },
  {
    title: "ගණිත ප්‍රගතිය",
    shortTitle: "ගණිතය",
    description: "ගණන් ක්‍රීඩා, ලකුණු සහ දරුවාගේ මට්ටම්වල ප්‍රගතිය බලන්න.",
    path: "/dyscalculia/dashboard",
    icon: Calculator,
    image: mathsChild,
    badgeClass: "bg-rose-500",
    buttonClass: "from-rose-500 to-orange-500",
    shadowClass: "shadow-rose-200/70",
  },
  {
    title: "මතක ප්‍රගතිය",
    shortTitle: "මතකය",
    description: "මතක ක්‍රීඩා, නිවැරදි පිළිතුරු සහ මට්ටම් අනුව ප්‍රගතිය බලන්න.",
    path: "/working-memory/dashboard",
    icon: Brain,
    image: memoryChild,
    badgeClass: "bg-violet-500",
    buttonClass: "from-indigo-500 to-violet-600",
    shadowClass: "shadow-violet-200/70",
  },
];

const DashboardSelection = () => {

  return (
    <main className="learning-page dashboard-selection">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute left-[3%] top-16 h-16 w-16 rounded-full bg-pink-200/55" />
      <div className="pointer-events-none absolute right-[5%] top-48 h-14 w-14 rounded-full bg-sky-200/50" />
      <div className="pointer-events-none absolute bottom-10 left-[8%] h-12 w-12 rounded-full bg-violet-200/45" />
      <div className="pointer-events-none absolute bottom-20 right-[4%] h-16 w-16 rounded-full bg-yellow-200/55" />

      <div className="selection-container">
        {/* Page title and introduction */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="selection-header"
        >
          <div className="mb-1 text-3xl lg:text-4xl" aria-hidden="true">
            🌟
          </div>
          <h1 className="text-3xl font-black text-slate-800 sm:text-4xl lg:text-[2.65rem]">
            දරුවාගේ ප්‍රගතිය බලමු!
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            එක් එක් ඉගෙනුම් අංශයේ ක්‍රීඩා ප්‍රතිඵල සහ දියුණුව පහසුවෙන් බලන්න.
          </p>
        </motion.header>

        {/* Divider and dashboard section label */}
        <div className="selection-divider" aria-hidden="true">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-transparent to-violet-200" />
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-black text-violet-600 shadow-sm">
            <BarChart3 className="h-5 w-5" />
            ප්‍රගති පුවරු
          </div>
          <div className="h-1 flex-1 rounded-full bg-gradient-to-l from-transparent to-violet-200" />
        </div>

        {/* Responsive grid: one progress card per learning module */}
        <section className="learning-grid dashboard-grid">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;

            return (
              <motion.article
                key={dashboard.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -7 }}
                whileTap={{ scale: 0.98 }}
                className={`group dashboard-card shadow-xl ${dashboard.shadowClass}`}
                aria-label={`${dashboard.title} විවෘත කරන්න`}
              >
                <span className="flex w-full flex-col">
                  {/* Card artwork, module badge and title */}
                  <span className="learning-card__art block shrink-0 bg-slate-100">
                    <span
                      className="absolute inset-0 block bg-cover bg-no-repeat transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${dashboard.image})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                    <span className={`absolute right-4 top-4 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black text-white shadow-lg ${dashboard.badgeClass}`}>
                      <Icon className="h-4 w-4" />
                      {dashboard.shortTitle}
                    </span>

                    <h2 className="learning-card__title">
                      {dashboard.title}
                    </h2>
                  </span>

                  {/* Card description and progress dashboard link */}
                  <span className="learning-card__body">
                    <span className="text-sm font-semibold leading-6 text-slate-600">
                      {dashboard.description}
                    </span>

                    <Link to={dashboard.path} className={`selection-cta bg-gradient-to-r ${dashboard.buttonClass}`} aria-label={`${dashboard.title} බලන්න`}>
                      ප්‍රගතිය බලන්න
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </span>
                </span>
              </motion.article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default DashboardSelection;
