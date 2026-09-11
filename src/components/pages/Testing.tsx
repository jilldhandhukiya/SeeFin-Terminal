'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import { ArrowUpRight, BarChart3, Brain, FileText, History, Play, ShieldCheck, TriangleAlert } from 'lucide-react';

type TestingAction = {
  title: string;
  route: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  featured?: boolean;
};

const TESTING_ACTIONS: TestingAction[] = [
  {
    title: 'Test trade',
    route: '/testing/trade',
    description: 'Paper order entry and equity blotter execution flow',
    icon: Play,
    featured: true,
  },
  {
    title: 'F&O Derivatives Desk',
    route: '/testing/trade/fno',
    description: 'Real-time option chain, Greek analytics, and strikes',
    icon: ArrowUpRight,
    featured: true,
  },
  {
    title: 'Backtesting',
    route: '/testing/backtesting',
    description: 'Strategy validation and scenario replay',
    icon: BarChart3,
  },
  {
    title: 'Risk desk',
    route: '/testing/risk',
    description: 'Exposure, sizing, and guard rails',
    icon: ShieldCheck,
  },
  {
    title: 'Strategy lab',
    route: '/testing/strategy',
    description: 'Signal design and model review',
    icon: Brain,
  },
  {
    title: 'Orders',
    route: '/testing/orders',
    description: 'Working orders, fills, and status',
    icon: ArrowUpRight,
  },
  {
    title: 'Reports',
    route: '/testing/reports',
    description: 'Daily summaries and export views',
    icon: FileText,
  },
  {
    title: 'Scenario drill',
    route: '/testing/scenario-drill',
    description: 'Stress tests and what-if checks',
    icon: TriangleAlert,
  },
  {
    title: 'History',
    route: '/testing/history',
    description: 'Executed orders and performance trail',
    icon: History,
  },
];

const Testing = () => {
  return (
    <TerminalWorkspace>
      <div className="flex flex-col min-h-full w-full flex-1">
        <TerminalPanel
          title="TESTING_LAUNCHPAD"
          className="min-h-full flex-1"
          bodyClassName="overflow-visible"
        >
          <div className="min-h-full p-5 md:p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
              <Play size={12} />
              Action testing deck
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Trade Testing Console</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-1 content-start">
            {TESTING_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                action.title === 'Test trade' ? (
                  <Link
                    key={action.title}
                    href={action.route}
                    className={`group relative overflow-hidden border text-left transition-all duration-200 ${action.featured
                      ? 'sm:col-span-2 xl:col-span-2 min-h-[170px] border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/15 hover:border-amber-400'
                      : 'min-h-[132px] border-gray-700 bg-black hover:border-amber-500/70 hover:bg-amber-950/20'
                      }`}
                    aria-label={`${action.title} - ${action.route}`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[linear-gradient(135deg,transparent,rgba(251,191,36,0.08),transparent)] transition-opacity" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] ${action.featured ? 'text-amber-300' : 'text-gray-500 group-hover:text-amber-500'}`}>
                            <Icon size={12} />
                            Ready
                          </div>
                          <div className="mt-3 text-lg md:text-xl font-semibold text-white tracking-tight group-hover:text-amber-50">
                            {action.title}
                          </div>
                        </div>
                        <ArrowUpRight size={14} className={`shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${action.featured ? 'text-amber-300' : 'text-gray-600 group-hover:text-amber-500'}`} />
                      </div>

                      <div className="mt-6 space-y-2">
                        <p className={`text-xs md:text-[11px] font-mono uppercase tracking-[0.28em] ${action.featured ? 'text-gray-300' : 'text-gray-500'}`}>
                          {action.description}
                        </p>
                        <div className={`inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] ${action.featured ? 'text-amber-300' : 'text-gray-600 group-hover:text-amber-500'}`}>
                          <span className="h-px w-6 bg-current" />
                          {action.route}
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    key={action.title}
                    type="button"
                    aria-label={`${action.title} - ${action.route}`}
                    className={`group relative overflow-hidden border text-left transition-all duration-200 ${action.featured
                      ? 'sm:col-span-2 xl:col-span-2 min-h-[170px] border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/15 hover:border-amber-400'
                      : 'min-h-[132px] border-gray-700 bg-black hover:border-amber-500/70 hover:bg-amber-950/20'
                      }`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[linear-gradient(135deg,transparent,rgba(251,191,36,0.08),transparent)] transition-opacity" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] ${action.featured ? 'text-amber-300' : 'text-gray-500 group-hover:text-amber-500'}`}>
                            <Icon size={12} />
                            Ready
                          </div>
                          <div className="mt-3 text-lg md:text-xl font-semibold text-white tracking-tight group-hover:text-amber-50">
                            {action.title}
                          </div>
                        </div>
                        <ArrowUpRight size={14} className={`shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${action.featured ? 'text-amber-300' : 'text-gray-600 group-hover:text-amber-500'}`} />
                      </div>

                      <div className="mt-6 space-y-2">
                        <p className={`text-xs md:text-[11px] font-mono uppercase tracking-[0.28em] ${action.featured ? 'text-gray-300' : 'text-gray-500'}`}>
                          {action.description}
                        </p>
                        <div className={`inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] ${action.featured ? 'text-amber-300' : 'text-gray-600 group-hover:text-amber-500'}`}>
                          <span className="h-px w-6 bg-current" />
                          {action.route}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              );
            })}
          </div>
        </div>
      </TerminalPanel>
    </div>
    </TerminalWorkspace>
  );
};

export default Testing;
