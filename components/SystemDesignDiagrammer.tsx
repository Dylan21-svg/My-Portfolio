'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Server,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle,
  Network,
  Info,
  Radio
} from 'lucide-react'
import { ArchitectureNode } from '@/lib/types'
import { soundFX } from '@/lib/soundfx'

interface SystemDesignDiagrammerProps {
  nodes: ArchitectureNode[]
  title?: string
}

export default function SystemDesignDiagrammer({ nodes, title }: SystemDesignDiagrammerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '')
  const [simulatingFlow, setSimulatingFlow] = useState<boolean>(false)
  const [activePacketIndex, setActivePacketIndex] = useState<number>(-1)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0]

  const getNodeIcon = (type: ArchitectureNode['type']) => {
    switch (type) {
      case 'client':
        return <Activity className="w-5 h-5 text-sky-400" />
      case 'gateway':
        return <Network className="w-5 h-5 text-amber-400" />
      case 'cache':
        return <Zap className="w-5 h-5 text-rose-400" />
      case 'queue':
        return <Layers className="w-5 h-5 text-indigo-400" />
      case 'service':
        return <Cpu className="w-5 h-5 text-emerald-400" />
      case 'database':
        return <Database className="w-5 h-5 text-cyan-400" />
      case 'worker':
        return <Server className="w-5 h-5 text-purple-400" />
      default:
        return <Server className="w-5 h-5 text-primary" />
    }
  }

  const getNodeBorderColor = (type: ArchitectureNode['type'], isSelected: boolean) => {
    if (isSelected) return 'border-primary ring-2 ring-primary/40 shadow-teal-glow'
    switch (type) {
      case 'client':
        return 'border-sky-500/30 hover:border-sky-500/80'
      case 'gateway':
        return 'border-amber-500/30 hover:border-amber-500/80'
      case 'cache':
        return 'border-rose-500/30 hover:border-rose-500/80'
      case 'queue':
        return 'border-indigo-500/30 hover:border-indigo-500/80'
      case 'service':
        return 'border-emerald-500/30 hover:border-emerald-500/80'
      case 'database':
        return 'border-cyan-500/30 hover:border-cyan-500/80'
      case 'worker':
        return 'border-purple-500/30 hover:border-purple-500/80'
      default:
        return 'border-white/10 hover:border-primary/50'
    }
  }

  // Live packet traversal simulation across the nodes
  const triggerTrafficSimulation = () => {
    if (simulatingFlow) return
    setSimulatingFlow(true)
    soundFX.playSuccess()

    nodes.forEach((node, idx) => {
      setTimeout(() => {
        setActivePacketIndex(idx)
        setSelectedNodeId(node.id)
        soundFX.playNodePulse(300 + idx * 80)
      }, idx * 600)
    })

    setTimeout(() => {
      setActivePacketIndex(-1)
      setSimulatingFlow(false)
    }, nodes.length * 600 + 400)
  }

  return (
    <div className="rounded-2xl bg-background-dark/95 border border-white/10 p-5 sm:p-6 text-white">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Interactive Distributed Architecture Topology</span>
          </div>
          <h4 className="text-lg font-bold text-white font-display">
            {title || 'Component Data Flow & Network Graph'}
          </h4>
        </div>

        <button
          onClick={triggerTrafficSimulation}
          disabled={simulatingFlow}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary disabled:opacity-50 text-white font-mono text-xs font-semibold transition-all flex items-center gap-2 shadow-teal-glow shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{simulatingFlow ? 'Simulating Traffic Trace...' : 'Simulate Request Flow'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Layout (7 Cols) */}
        <div className="lg:col-span-7 bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

          {/* Node Grid Sequence */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {nodes.map((node, index) => {
              const isSelected = node.id === selectedNodeId
              const isPacketActive = activePacketIndex === index

              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedNodeId(node.id)
                    soundFX.playClick(500)
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 bg-background-medium/90 border transition-all duration-200 relative ${getNodeBorderColor(
                    node.type,
                    isSelected
                  )} ${isPacketActive ? 'ring-4 ring-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : ''}`}
                >
                  {/* Packet tracer badge */}
                  {isPacketActive && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-mono font-black animate-bounce">
                      TRACE INGEST
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-black/50 border border-white/10">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-text-gray tracking-wider">
                          {node.type}
                        </span>
                        <div className="text-xs font-bold text-white leading-tight">
                          {node.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded inline-block truncate max-w-full">
                    {node.tech}
                  </div>

                  {/* Telemetry chips */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-text-gray">
                    <span>Latency: <strong className="text-emerald-400">{node.latency || '<5ms'}</strong></span>
                    {node.throughput && (
                      <span>QPS: <strong className="text-sky-400">{node.throughput}</strong></span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Interactive instruction note */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-text-gray font-mono">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Click on any node to inspect telemetry metrics, tech stack specifications, and downstream dependencies.</span>
          </div>
        </div>

        {/* Node Deep Dive Inspector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-xl bg-background-medium/80 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-primary font-semibold">
                        Component Deep-Dive
                      </span>
                      <h5 className="text-base font-bold text-white font-display">
                        {selectedNode.label}
                      </h5>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-text-gray uppercase">
                    {selectedNode.type}
                  </span>
                </div>

                {/* Tech Specification */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-text-gray mb-1">
                    Implementation Stack
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-primary font-mono text-xs font-semibold">
                    {selectedNode.tech}
                  </div>
                </div>

                {/* Architectural Role Description */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-text-gray mb-1">
                    Role in High-Load Architecture
                  </div>
                  <p className="text-xs text-text-gray leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Downstream Connections */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-text-gray mb-2">
                    Downstream Targets & Data Pipes
                  </div>
                  {selectedNode.connections.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedNode.connections.map((targetId) => {
                        const targetNode = nodes.find((n) => n.id === targetId)
                        return (
                          <div
                            key={targetId}
                            onClick={() => {
                              setSelectedNodeId(targetId)
                              soundFX.playClick(600)
                            }}
                            className="p-2 rounded-lg bg-black/40 hover:bg-primary/15 border border-white/5 hover:border-primary/30 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-primary" />
                              <span className="font-semibold text-white">
                                {targetNode?.label || targetId}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">
                              {targetNode?.latency || 'Active Stream'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-black/20 border border-dashed border-white/10 text-center text-xs text-text-gray font-mono">
                      Terminal Storage / Leaf Node
                    </div>
                  )}
                </div>

                {/* Telemetry Box */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/5">
                    <div className="text-[10px] text-text-gray font-mono uppercase">Target Latency</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {selectedNode.latency || '<5ms'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/5">
                    <div className="text-[10px] text-text-gray font-mono uppercase">Throughput</div>
                    <div className="text-sm font-mono font-bold text-sky-400">
                      {selectedNode.throughput || '10,000+ ops/s'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
