'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, Loader2, DollarSign, Clock, Code } from 'lucide-react';

type EstimateResult =
  | { error: true; message: string }
  | { error?: false; cost: string; timeline: string; techStack: string[]; details?: string };

export default function AIProjectEstimator() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);

  const handleEstimate = async () => {
    if (!projectDescription.trim() || isLoading) return;

    setIsLoading(true);
    setEstimate(null);

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: projectDescription })
      });

      const data: EstimateResult = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      setEstimate(data);
    } catch {
      setEstimate({
        error: true,
        message: "Sorry, I couldn't generate an estimate. Please contact Faisal directly for a detailed quote."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    "E-commerce website with 500 products and payment integration",
    "Real-time chat application with user authentication",
    "Dashboard for data visualization with charts and reports",
    "Mobile-responsive landing page with contact form"
  ];

  return (
    <>
      {/* Estimator Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Calculator size={28} className="group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Estimator Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 top-4 z-50 w-[500px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/20"
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Calculator size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI Project Estimator</h3>
                  <p className="text-xs opacity-90">Get instant cost & timeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close estimator"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!estimate ? (
                <>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Describe Your Project
                  </h4>
                  <p className="text-sm opacity-70 mb-4" style={{ color: 'var(--foreground)' }}>
                    Tell me about your project requirements, and I&apos;ll provide an instant estimate!
                  </p>

                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Example: I need an e-commerce website with payment integration, user authentication, and admin dashboard..."
                    rows={6}
                    className="w-full p-4 rounded-lg border border-primary/20 focus:outline-none focus:border-primary transition-colors resize-none"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                    disabled={isLoading}
                  />

                  <button
                    onClick={handleEstimate}
                    disabled={!projectDescription.trim() || isLoading}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Calculator size={20} />
                        Get Estimate
                      </>
                    )}
                  </button>

                  {/* Examples */}
                  <div className="mt-6">
                    <p className="text-xs opacity-70 mb-3" style={{ color: 'var(--foreground)' }}>
                      Try these examples:
                    </p>
                    <div className="space-y-2">
                      {examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setProjectDescription(example)}
                          className="w-full text-left text-sm p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {estimate.error === true ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-4">{estimate.message}</p>
                      <button
                        onClick={() => setEstimate(null)}
                        className="px-6 py-2 bg-primary text-white rounded-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
                        Your Project Estimate
                      </h4>

                      {/* Cost */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-xl mb-4 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <DollarSign size={24} className="text-purple-500" />
                          <h5 className="font-bold" style={{ color: 'var(--foreground)' }}>Estimated Cost</h5>
                        </div>
                        <p className="text-3xl font-bold text-purple-500">{estimate.cost}</p>
                      </div>

                      {/* Timeline */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-xl mb-4 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock size={24} className="text-blue-500" />
                          <h5 className="font-bold" style={{ color: 'var(--foreground)' }}>Timeline</h5>
                        </div>
                        <p className="text-2xl font-bold text-blue-500">{estimate.timeline}</p>
                      </div>

                      {/* Tech Stack */}
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-xl mb-4 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Code size={24} className="text-green-500" />
                          <h5 className="font-bold" style={{ color: 'var(--foreground)' }}>Recommended Tech Stack</h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {estimate.techStack?.map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Details */}
                      {estimate.details && (
                        <div className="p-4 rounded-lg bg-primary/5 mb-4">
                          <p className="text-sm opacity-80" style={{ color: 'var(--foreground)' }}>
                            {estimate.details}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEstimate(null)}
                          className="flex-1 px-4 py-3 border border-primary rounded-lg hover:bg-primary/10 transition-colors"
                          style={{ color: 'var(--foreground)' }}
                        >
                          New Estimate
                        </button>
                        <a
                          href="#contact"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-center font-medium hover:shadow-lg transition-all"
                        >
                          Contact Me
                        </a>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
