'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Table,
  Key,
  ShieldAlert,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react'
import { SchemaTable, ConcurrencyTradeoff, PostMortemLesson } from '@/lib/types'
import { soundFX } from '@/lib/soundfx'

interface CaseStudyDeepDiveProps {
  schemaTables?: SchemaTable[]
  concurrencyTradeoffs?: ConcurrencyTradeoff[]
  postMortem?: PostMortemLesson[]
  technologies?: string[]
}

export default function CaseStudyDeepDive({
  schemaTables = [],
  concurrencyTradeoffs = [],
  postMortem = [],
  technologies = []
}: CaseStudyDeepDiveProps) {
  const [activeSection, setActiveSection] = useState<'schema' | 'concurrency' | 'postmortem'>('schema')
  const [copiedTable, setCopiedTable] = useState<string | null>(null)

  const copyDDL = (table: SchemaTable) => {
    soundFX.playSuccess()
    const ddl = `CREATE TABLE ${table.tableName} (\n${table.columns
      .map((c) => `  ${c.name} ${c.type}${c.constraints ? ` ${c.constraints}` : ''}`)
      .join(',\n')}\n);\n\n${(table.indexes || []).join(';\n') + (table.indexes?.length ? ';' : '')}`

    navigator.clipboard.writeText(ddl)
    setCopiedTable(table.tableName)
    setTimeout(() => setCopiedTable(null), 2500)
  }

  return (
    <div className="rounded-2xl bg-background-dark/95 border border-white/10 p-5 sm:p-7 text-white space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono uppercase text-primary tracking-wider font-semibold">
            Engineering Case Study & Deep Dive
          </div>
          <h4 className="text-xl font-bold font-display text-white">
            Architecture Blueprint & Production Lessons
          </h4>
        </div>

        {/* Section Pill Selectors */}
        <div className="flex items-center gap-1.5 bg-background-medium p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              setActiveSection('schema')
              soundFX.playClick(500)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSection === 'schema'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database ERDs ({schemaTables.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('concurrency')
              soundFX.playClick(600)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSection === 'concurrency'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Concurrency Trade-offs</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('postmortem')
              soundFX.playClick(700)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSection === 'postmortem'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Post-Mortems ({postMortem.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <AnimatePresence mode="wait">
        {/* 1. DATABASE SCHEMA & ERD SPECIFICATION */}
        {activeSection === 'schema' && (
          <motion.div
            key="schema"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <p className="text-text-gray text-xs sm:text-sm">
              High-performance normalized schemas designed for high-write workloads, write-ahead delta logging, and sub-10ms indexed lookups.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schemaTables.map((table, tIdx) => (
                <div
                  key={tIdx}
                  className="rounded-xl bg-background-medium/90 border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  {/* Table Header */}
                  <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-sm text-white">
                        {table.tableName}
                      </span>
                    </div>

                    <button
                      onClick={() => copyDDL(table)}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-primary/20 text-text-gray hover:text-primary border border-white/10 text-[11px] font-mono transition-colors flex items-center gap-1"
                      title="Copy SQL CREATE TABLE statement"
                    >
                      {copiedTable === table.tableName ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">DDL Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy DDL</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Table Description */}
                  <div className="px-4 py-2.5 bg-black/20 text-xs text-text-gray border-b border-white/5 font-mono">
                    {table.description}
                  </div>

                  {/* Column List */}
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-text-gray border-b border-white/10 pb-2">
                          <th className="pb-2 font-semibold">Column</th>
                          <th className="pb-2 font-semibold">Type</th>
                          <th className="pb-2 font-semibold">Constraints / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {table.columns.map((col, cIdx) => (
                          <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 font-bold text-emerald-300 flex items-center gap-1.5">
                              {col.name.includes('id') || col.name.includes('pk') ? (
                                <Key className="w-3 h-3 text-amber-400 shrink-0" />
                              ) : null}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2.5 text-primary">{col.type}</td>
                            <td className="py-2.5 text-text-gray text-[11px]">
                              {col.constraints || col.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Indexes footer */}
                  {table.indexes && table.indexes.length > 0 && (
                    <div className="p-3 bg-black/50 border-t border-white/5 text-[11px] font-mono">
                      <div className="text-text-gray uppercase text-[10px] mb-1">
                        Performance Indexing
                      </div>
                      {table.indexes.map((idxStr, iIdx) => (
                        <div key={iIdx} className="text-sky-300 truncate">
                          {idxStr}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. CONCURRENCY & ARCHITECTURAL TRADE-OFFS */}
        {activeSection === 'concurrency' && (
          <motion.div
            key="concurrency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <p className="text-text-gray text-xs sm:text-sm">
              Engineering decisions are fundamentally about trade-offs. Here is the architectural reasoning behind chosen synchronicity and state strategies versus alternatives.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {concurrencyTradeoffs.map((item, idx) => {
                const isChosen = item.status === 'chosen'
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-5 border flex flex-col justify-between ${
                      isChosen
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                            isChosen
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isChosen ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>CHOSEN APPROACH</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>REJECTED ALTERNATIVE</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h5 className="text-base font-bold text-white mb-2 font-display">
                        {item.approach}
                      </h5>

                      <p className="text-xs text-text-gray leading-relaxed mb-4">
                        {item.reason}
                      </p>

                      {/* Benefits list */}
                      <div className="space-y-2 mb-4">
                        <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">
                          Strategic Benefits:
                        </div>
                        {item.benefits.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 text-xs text-text-gray">
                            <span className="text-emerald-400 mt-0.5">✔</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tradeoffs list */}
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                          Known Trade-offs & Costs:
                        </div>
                        {item.tradeoffs.map((t, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-2 text-xs text-text-gray">
                            <span className="text-amber-400 mt-0.5">⚠</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* 3. POST-MORTEMS & LESSONS LEARNED */}
        {activeSection === 'postmortem' && (
          <motion.div
            key="postmortem"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <p className="text-text-gray text-xs sm:text-sm">
              Real-world production incidents provide the deepest engineering insights. Here is a transparent breakdown of root-cause analysis and operational hardening.
            </p>

            <div className="space-y-4">
              {postMortem.map((pm, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-xl bg-background-medium/90 border border-white/10 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                          Production Incident Case Study
                        </span>
                        <h5 className="text-base font-bold text-white font-display">
                          {pm.incident}
                        </h5>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      Sev-2 Ingestion Delay
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Impact */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[10px] uppercase font-mono text-rose-400 font-bold mb-1">
                        Blast Radius / Impact
                      </div>
                      <p className="text-text-gray">{pm.impact}</p>
                    </div>

                    {/* Root Cause */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[10px] uppercase font-mono text-amber-400 font-bold mb-1">
                        Root Cause Analysis
                      </div>
                      <p className="text-text-gray">{pm.rootCause}</p>
                    </div>

                    {/* Technical Resolution */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold mb-1">
                        Applied Fix & Architectural Hardening
                      </div>
                      <p className="text-text-gray">{pm.resolution}</p>
                    </div>

                    {/* Key Takeaway */}
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-[10px] uppercase font-mono text-primary font-bold mb-1">
                        Key Engineering Takeaway
                      </div>
                      <p className="text-white font-medium">{pm.takeaway}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
