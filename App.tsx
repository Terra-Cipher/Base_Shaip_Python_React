import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">SHAIP Dashboard</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:text-slate-300 transition-colors">Number Adder</Link>
            <Link to="/display" className="hover:text-slate-300 transition-colors">Display Console</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-6xl w-full mx-auto p-6">
        {children}
      </main>
      <footer className="bg-slate-100 text-center text-xs text-slate-500 py-4 border-t border-slate-200">
        Unified SPA & API Services - Cloud Run Deployment
      </footer>
    </div>
  )
}

function NumberAdder() {
  const [num1, setNum1] = useState<string>('')
  const [num2, setNum2] = useState<string>('')
  const [result, setResult] = useState<number | string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleAddRequest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/shaip${window.location.search}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          num1: parseFloat(num1) || 0, 
          num2: parseFloat(num2) || 0 
        })
      })
      const data = await res.json()
      if (data.status === 'success') {
        setResult(data.result)
      } else {
        setResult('Calculation failed')
      }
    } catch (err) {
      if (err instanceof Error) {
        setResult(`Error: ${err.message}`)
      } else {
        setResult('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Simple Number Adder</h2>
      <p className="text-sm text-slate-600 mb-6">
        Enter two numbers below and click add. This communicates with the FastAPI backend endpoint <code className="bg-slate-100 px-1 py-0.5 rounded">/shaip</code>.
      </p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Number</label>
            <input 
              type="number" 
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Second Number</label>
            <input 
              type="number" 
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>
        </div>
        
        <button 
          onClick={handleAddRequest}
          disabled={loading || num1 === '' || num2 === ''}
          className="w-full bg-slate-900 text-white rounded py-2 font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding...' : 'Add Numbers'}
        </button>

        {result !== null && (
          <div className="mt-6 p-4 bg-slate-100 rounded border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Result:</h3>
            <p className="text-2xl font-bold text-slate-900">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DisplayConsole() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Interactive Display Console</h2>
        <p className="text-sm text-slate-500">Accessible securely under the <code className="bg-slate-100 px-1 py-0.5 rounded">/shaip/display</code> pathing router.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-1">Auth Status</h3>
          <p className="text-xs text-blue-700">Open Public Endpoint</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-1">Integration Mode</h3>
          <p className="text-xs text-green-700">Unified Docker Container</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Scale Group</h3>
          <p className="text-xs text-purple-700">Serverless Cloud Run target</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/display">
      <Layout>
        <Routes>
          <Route path="/" element={<NumberAdder />} />
          <Route path="/display" element={<DisplayConsole />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}