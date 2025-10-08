import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ExternalLink, Copy, Check } from 'lucide-react';

export function SupabaseSetupWizard() {
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok || response.status === 404) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Supabase Setup Wizard
            </h1>
            <p className="text-gray-600">
              Configure your Supabase credentials to enable database functionality
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Welcome to Setup</h2>
              <p className="text-gray-700">
                This wizard will guide you through setting up Supabase for your application.
                You'll need to create a free Supabase account and project.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What you'll need:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>A Supabase account (free)</li>
                  <li>5 minutes of your time</li>
                  <li>Access to your deployment platform (Vercel/Netlify)</li>
                </ul>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Get Started
              </Button>
            </div>
          )}

          {/* Step 2: Create Supabase Project */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Create Supabase Project</h2>
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Go to Supabase</h3>
                      <p className="text-gray-600 mb-3">Visit supabase.com and sign up for a free account</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://supabase.com', '_blank')}
                      >
                        Open Supabase <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Create New Project</h3>
                      <p className="text-gray-600">Click "New Project" and fill in the details</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Wait for Setup</h3>
                      <p className="text-gray-600">Your project will be ready in about 2 minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Get Credentials */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Get Your Credentials</h2>
              
              <Alert>
                <AlertDescription>
                  In your Supabase project dashboard, go to <strong>Settings → API</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="https://xxxxxxxxxxxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Found under "Project URL" in API settings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Anon/Public Key <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    type="password"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Found under "anon public" key in API settings
                  </p>
                </div>

                <Button 
                  onClick={testConnection}
                  disabled={!supabaseUrl || !supabaseKey || testing}
                  className="w-full"
                >
                  {testing ? 'Testing Connection...' : 'Test Connection'}
                </Button>

                {testResult === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Connection successful! Your credentials are valid.
                    </AlertDescription>
                  </Alert>
                )}

                {testResult === 'error' && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Connection failed. Please check your credentials.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1"
                  disabled={testResult !== 'success'}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Deploy */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Deploy to Vercel</h2>
              
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Credentials validated! Now add them to your deployment.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Add to Vercel:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Go to your Vercel project dashboard</li>
                    <li>Navigate to Settings → Environment Variables</li>
                    <li>Add the following variables:</li>
                  </ol>
                  
                  <div className="mt-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm font-mono">VITE_SUPABASE_URL</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(supabaseUrl, 'url')}
                        >
                          {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <code className="text-xs text-gray-600 break-all">{supabaseUrl}</code>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm font-mono">VITE_SUPABASE_ANON_KEY</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(supabaseKey, 'key')}
                        >
                          {copied === 'key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <code className="text-xs text-gray-600 break-all">{supabaseKey}</code>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Important:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Add variables for all environments (Production, Preview, Development)</li>
                    <li>Redeploy your application after adding variables</li>
                    <li>Variables take effect on the next deployment</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                  className="w-full"
                >
                  Open Vercel Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
